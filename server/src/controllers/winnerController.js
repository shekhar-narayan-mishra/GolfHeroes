import supabase from '../supabaseClient.js';
import cloudinary from '../config/cloudinary.js';
import { sendVerificationApproved, sendPayoutConfirmed, sendEmail } from '../services/emailService.js';

/**
 * GET /api/winners — admin: all winners with populated user + draw info
 */
export const getWinners = async (req, res, next) => {
  try {
    const { data: winners, error } = await supabase
      .from('Winner')
      .select(`
        *,
        user:User (name, email),
        drawResult:DrawResult (
          matchTier,
          prizeAmount,
          draw:Draw (month, year, numbers)
        )
      `)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json({ success: true, winners: winners || [] });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/winners/my — current user's winnings
 */
export const getMyWinnings = async (req, res, next) => {
  try {
    const { data: winners, error } = await supabase
      .from('Winner')
      .select(`
        *,
        drawResult:DrawResult (
          matchTier,
          prizeAmount,
          draw:Draw (month, year, numbers)
        )
      `)
      .eq('userId', req.user.userId)
      .order('createdAt', { ascending: false });

    if (error) throw error;

    res.json({ success: true, winners: winners || [] });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/winners/:id/proof — winner uploads proof image
 * Uses multer + Cloudinary middleware (handled in route).
 * Sets verificationStatus to "proof_uploaded".
 */
export const uploadProof = async (req, res, next) => {
  try {
    const { data: winner, error: wErr } = await supabase
      .from('Winner')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (wErr) throw wErr;
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found.' });
    }

    // Ownership check
    if (winner.userId !== req.user.userId) {
      return res.status(403).json({ success: false, message: 'You can only upload proof for your own wins.' });
    }

    // Only allow upload when proof_pending or rejected (re-upload)
    if (!['proof_pending', 'rejected'].includes(winner.verificationStatus)) {
      return res.status(400).json({
        success: false,
        message: 'Proof upload not allowed in current state.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    // Delete old proof from Cloudinary if re-uploading
    if (winner.proofPublicId) {
      try {
        await cloudinary.uploader.destroy(winner.proofPublicId, { type: 'private' });
      } catch {
        // Non-critical — continue
      }
    }

    // Store Cloudinary info
    const { data: updatedWinner, error: uErr } = await supabase
      .from('Winner')
      .update({
        proofUrl: req.file.path,
        proofPublicId: req.file.filename,
        verificationStatus: 'proof_uploaded',
        adminNotes: '', // Clear rejection notes on re-upload
      })
      .eq('id', winner.id)
      .select()
      .single();

    if (uErr) throw uErr;

    res.json({
      success: true,
      message: 'Proof uploaded successfully.',
      verificationStatus: updatedWinner.verificationStatus,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/winners/:id/proof-url — generate a signed URL to view the proof
 * Only accessible by the winner themselves or an admin.
 */
export const getProofUrl = async (req, res, next) => {
  try {
    const { data: winner, error: wErr } = await supabase
      .from('Winner')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (wErr) throw wErr;
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found.' });
    }

    // Check: must be owner or admin
    const { data: user, error: uErr } = await supabase
      .from('User')
      .select('*')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (uErr) throw uErr;

    const isOwner = winner.userId === req.user.userId;
    const isAdmin = user?.role === 'admin';

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!winner.proofPublicId) {
      return res.status(404).json({ success: false, message: 'No proof has been uploaded.' });
    }

    // Generate signed URL (expires in 1 hour)
    const signedUrl = cloudinary.url(winner.proofPublicId, {
      type: 'private',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    res.json({ success: true, url: signedUrl });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/winners/:id/verify — admin: approve or reject
 * Body: { action: "approve" | "reject", adminNotes?: string }
 */
export const verifyWinner = async (req, res, next) => {
  try {
    const { action, adminNotes } = req.body;
    
    const { data: winner, error: wErr } = await supabase
      .from('Winner')
      .select(`*, user:User(name, email)`)
      .eq('id', req.params.id)
      .maybeSingle();

    if (wErr) throw wErr;
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found.' });
    }

    // Helper formatting to access relation uniformly
    winner.user = winner.user || winner.User;

    if (winner.verificationStatus !== 'proof_uploaded') {
      return res.status(400).json({
        success: false,
        message: 'Can only verify winners with uploaded proof.',
      });
    }

    let updatedWinner;

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('Winner')
        .update({
          verificationStatus: 'approved',
          payoutStatus: 'pending',
          adminNotes: adminNotes || '',
        })
        .eq('id', winner.id)
        .select()
        .single();
        
      if (error) throw error;
      updatedWinner = data;

      // Email winner
      if (winner.user?.email) {
        sendVerificationApproved({ ...updatedWinner, userId: winner.user }).catch(console.error);
      }
    } else if (action === 'reject') {
      const { data, error } = await supabase
        .from('Winner')
        .update({
          verificationStatus: 'rejected',
          adminNotes: adminNotes || 'Proof did not meet requirements.',
        })
        .eq('id', winner.id)
        .select()
        .single();
        
      if (error) throw error;
      updatedWinner = data;

      // Email winner
      if (winner.user?.email) {
        sendEmail({
          to: winner.user.email,
          subject: 'Proof update required — Digital Heroes',
          html: `<p>Hi ${winner.user.name},</p>
                 <p>Your scorecard proof needs attention: <strong>${updatedWinner.adminNotes}</strong></p>
                 <p>Please upload a new proof from your dashboard.</p>`,
        });
      }
    } else {
      return res.status(400).json({
        success: false,
        message: 'Action must be "approve" or "reject".',
      });
    }

    res.json({ success: true, winner: updatedWinner });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/winners/:id/payout — admin: mark as paid
 */
export const markPaid = async (req, res, next) => {
  try {
    const { data: winner, error: wErr } = await supabase
      .from('Winner')
      .select(`*, user:User(name, email)`)
      .eq('id', req.params.id)
      .maybeSingle();

    if (wErr) throw wErr;
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found.' });
    }

    winner.user = winner.user || winner.User;

    if (winner.verificationStatus !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Winner must be approved before marking as paid.',
      });
    }

    const { data: updatedWinner, error } = await supabase
      .from('Winner')
      .update({ payoutStatus: 'paid' })
      .eq('id', winner.id)
      .select()
      .single();
      
    if (error) throw error;

    // Send confirmation email
    if (winner.user?.email) {
      sendPayoutConfirmed({ ...updatedWinner, userId: winner.user }).catch(console.error);
    }

    res.json({ success: true, winner: updatedWinner });
  } catch (error) {
    next(error);
  }
};
