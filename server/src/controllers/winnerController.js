import { supabase } from '../config/supabaseClient.js';
import cloudinary from '../config/cloudinary.js';
import { sendVerificationApproved, sendPayoutConfirmed, sendEmail } from '../services/emailService.js';

async function loadProfilesByIds(ids) {
  if (!ids.length) return {};
  const { data, error } = await supabase.from('profiles').select('id, name, email').in('id', ids);
  if (error) throw error;
  const map = {};
  (data || []).forEach((p) => {
    map[p.id] = p;
  });
  return map;
}

export const getWinners = async (req, res, next) => {
  try {
    const { data: winners, error } = await supabase.from('winners').select('*').order('created_at', { ascending: false });

    if (error) throw error;

    const userIds = [...new Set((winners || []).map((w) => w.user_id))];
    const profilesMap = await loadProfilesByIds(userIds);

    const drIds = [...new Set((winners || []).map((w) => w.draw_result_id).filter(Boolean))];
    let drMap = {};
    if (drIds.length) {
      const { data: drs, error: drErr } = await supabase.from('draw_results').select('*').in('id', drIds);
      if (drErr) throw drErr;
      (drs || []).forEach((r) => {
        drMap[r.id] = r;
      });
    }

    const drawIds = [...new Set(Object.values(drMap).map((r) => r.draw_id).filter(Boolean))];
    let drawMap = {};
    if (drawIds.length) {
      const { data: draws, error: dErr } = await supabase.from('draws').select('*').in('id', drawIds);
      if (dErr) throw dErr;
      (draws || []).forEach((d) => {
        drawMap[d.id] = d;
      });
    }

    const enriched = (winners || []).map((w) => {
      const dr = drMap[w.draw_result_id];
      const draw = dr ? drawMap[dr.draw_id] : null;
      const drawResultId = dr
        ? {
            matchTier: dr.match_tier,
            prizeAmount: dr.prize_amount,
            drawId: draw ? { month: draw.month, year: draw.year, numbers: draw.numbers } : null,
          }
        : null;

      return {
        ...w,
        userId: profilesMap[w.user_id] || null,
        user: profilesMap[w.user_id] || null,
        drawResultId,
        createdAt: w.created_at,
        updatedAt: w.created_at,
      };
    });

    res.json({ success: true, winners: enriched });
  } catch (error) {
    next(error);
  }
};

export const getMyWinnings = async (req, res, next) => {
  try {
    const { data: winners, error } = await supabase
      .from('winners')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const drIds = [...new Set((winners || []).map((w) => w.draw_result_id).filter(Boolean))];
    let drMap = {};
    if (drIds.length) {
      const { data: drs, error: drErr } = await supabase.from('draw_results').select('*').in('id', drIds);
      if (drErr) throw drErr;
      (drs || []).forEach((r) => {
        drMap[r.id] = r;
      });
    }

    const drawIds = [...new Set(Object.values(drMap).map((r) => r.draw_id).filter(Boolean))];
    let drawMap = {};
    if (drawIds.length) {
      const { data: draws, error: dErr } = await supabase.from('draws').select('*').in('id', drawIds);
      if (dErr) throw dErr;
      (draws || []).forEach((d) => {
        drawMap[d.id] = d;
      });
    }

    const merged = (winners || []).map((w) => {
      const dr = drMap[w.draw_result_id];
      const draw = dr ? drawMap[dr.draw_id] : null;
      return {
        ...w,
        drawResult: dr
          ? {
              matchTier: dr.match_tier,
              prizeAmount: dr.prize_amount,
              draw: draw
                ? { month: draw.month, year: draw.year, numbers: draw.numbers }
                : null,
            }
          : null,
      };
    });

    res.json({ success: true, winners: merged });
  } catch (error) {
    next(error);
  }
};

export const uploadProof = async (req, res, next) => {
  try {
    const { data: winner, error: wErr } = await supabase
      .from('winners')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (wErr) throw wErr;
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found.' });
    }

    if (winner.user_id !== req.user.id) {
      return res.status(403).json({ success: false, message: 'You can only upload proof for your own wins.' });
    }

    if (!['pending', 'rejected'].includes(winner.verification_status)) {
      return res.status(400).json({
        success: false,
        message: 'Proof upload not allowed in current state.',
      });
    }

    if (!req.file) {
      return res.status(400).json({ success: false, message: 'No file uploaded.' });
    }

    if (winner.proof_public_id) {
      try {
        await cloudinary.uploader.destroy(winner.proof_public_id, { type: 'private' });
      } catch {
        /* non-fatal */
      }
    }

    const { data: updatedWinner, error: uErr } = await supabase
      .from('winners')
      .update({
        proof_url: req.file.path,
        proof_public_id: req.file.filename,
        verification_status: 'uploaded',
        admin_notes: '',
      })
      .eq('id', winner.id)
      .select()
      .single();

    if (uErr) throw uErr;

    res.json({
      success: true,
      message: 'Proof uploaded successfully.',
      verificationStatus: updatedWinner.verification_status,
    });
  } catch (error) {
    next(error);
  }
};

export const getProofUrl = async (req, res, next) => {
  try {
    const { data: winner, error: wErr } = await supabase
      .from('winners')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (wErr) throw wErr;
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found.' });
    }

    const { data: profile } = await supabase.from('profiles').select('role').eq('id', req.user.id).maybeSingle();

    const isOwner = winner.user_id === req.user.id;
    const isAdminUser = profile?.role === 'admin';

    if (!isOwner && !isAdminUser) {
      return res.status(403).json({ success: false, message: 'Access denied.' });
    }

    if (!winner.proof_public_id) {
      return res.status(404).json({ success: false, message: 'No proof has been uploaded.' });
    }

    const signedUrl = cloudinary.url(winner.proof_public_id, {
      type: 'private',
      sign_url: true,
      expires_at: Math.floor(Date.now() / 1000) + 3600,
    });

    res.json({ success: true, url: signedUrl });
  } catch (error) {
    next(error);
  }
};

export const verifyWinner = async (req, res, next) => {
  try {
    const { action, adminNotes } = req.body;

    const { data: winner, error: wErr } = await supabase.from('winners').select('*').eq('id', req.params.id).maybeSingle();

    if (wErr) throw wErr;
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found.' });
    }

    const profiles = await loadProfilesByIds([winner.user_id]);
    const userRow = profiles[winner.user_id];

    if (winner.verification_status !== 'uploaded') {
      return res.status(400).json({
        success: false,
        message: 'Can only verify winners with uploaded proof.',
      });
    }

    let updatedWinner;

    if (action === 'approve') {
      const { data, error } = await supabase
        .from('winners')
        .update({
          verification_status: 'approved',
          payout_status: 'pending',
          admin_notes: adminNotes || '',
        })
        .eq('id', winner.id)
        .select()
        .single();

      if (error) throw error;
      updatedWinner = data;

      if (userRow?.email) {
        sendVerificationApproved({ userId: userRow }).catch(console.error);
      }
    } else if (action === 'reject') {
      const { data, error } = await supabase
        .from('winners')
        .update({
          verification_status: 'rejected',
          admin_notes: adminNotes || 'Proof did not meet requirements.',
        })
        .eq('id', winner.id)
        .select()
        .single();

      if (error) throw error;
      updatedWinner = data;

      if (userRow?.email) {
        sendEmail({
          to: userRow.email,
          subject: 'Proof update required — GolfHeroes',
          html: `<p>Hi ${userRow.name.split(' ')[0]},</p>
                 <p>Your scorecard proof needs attention: <strong>${updatedWinner.admin_notes}</strong></p>
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

export const markPaid = async (req, res, next) => {
  try {
    const { data: winner, error: wErr } = await supabase.from('winners').select('*').eq('id', req.params.id).maybeSingle();

    if (wErr) throw wErr;
    if (!winner) {
      return res.status(404).json({ success: false, message: 'Winner record not found.' });
    }

    const profiles = await loadProfilesByIds([winner.user_id]);
    const userRow = profiles[winner.user_id];

    if (winner.verification_status !== 'approved') {
      return res.status(400).json({
        success: false,
        message: 'Winner must be approved before marking as paid.',
      });
    }

    const { data: updatedWinner, error } = await supabase
      .from('winners')
      .update({ payout_status: 'paid' })
      .eq('id', winner.id)
      .select()
      .single();

    if (error) throw error;

    if (userRow?.email) {
      sendPayoutConfirmed({ userId: userRow }).catch(console.error);
    }

    res.json({ success: true, winner: updatedWinner });
  } catch (error) {
    next(error);
  }
};
