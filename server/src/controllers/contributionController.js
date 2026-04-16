import supabase from '../supabaseClient.js';
import stripe from '../config/stripe.js';

const CLIENT_URL = process.env.CLIENT_URL || 'http://localhost:5173';

/**
 * POST /api/contributions/independent
 * Create a Stripe Payment Intent for a one-off donation.
 * Body: { charityId, amount } — amount in pence (min 100 = £1.00)
 */
export const createIndependentDonation = async (req, res, next) => {
  try {
    const { charityId, amount } = req.body;
    const userId = req.user.userId;

    if (!charityId || !amount) {
      return res.status(400).json({
        success: false,
        message: 'Charity and amount are required.',
      });
    }

    if (amount < 100) {
      return res.status(400).json({
        success: false,
        message: 'Minimum donation is £1.00.',
      });
    }

    const { data: charity, error: cErr } = await supabase
      .from('Charity')
      .select('*')
      .eq('id', charityId)
      .maybeSingle();

    if (cErr) throw cErr;
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    const { data: user, error: uErr } = await supabase
      .from('User')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (uErr) throw uErr;

    // Create Stripe Payment Intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      metadata: {
        userId: userId,
        charityId: charityId,
        charityName: charity.name,
        type: 'independent',
      },
      description: `Donation to ${charity.name} — Digital Heroes`,
      receipt_email: user?.email,
    });

    // Record in DB
    const { data: contribution, error } = await supabase
      .from('CharityContribution')
      .insert([
        {
          userId,
          charityId,
          amount,
          type: 'independent',
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.json({
      success: true,
      clientSecret: paymentIntent.client_secret,
      contribution,
      charity: { name: charity.name },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/contributions/my
 * Current user's contribution history.
 */
export const getMyContributions = async (req, res, next) => {
  try {
    // Relational query targeting foreign key relation
    const { data: contributions, error } = await supabase
      .from('CharityContribution')
      .select(`
        *,
        charity:Charity (
          name,
          slug
        )
      `)
      .eq('userId', req.user.userId)
      .order('date', { ascending: false });

    if (error) throw error;

    const total = (contributions || []).reduce((sum, c) => sum + c.amount, 0);

    // Format output mapping uppercase Charity mapping to match previous JSON response
    const formattedData = (contributions || []).map(c => ({
      ...c,
      // Workaround for potential naming differences if Postgres maps table name natively vs explicit aliases
      charity: c.charity || c.Charity || { name: 'Unknown', slug: '' }
    }));

    res.json({ success: true, contributions: formattedData, total });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/contributions/totals
 * Admin: total contributions per charity.
 */
export const getContributionTotals = async (req, res, next) => {
  try {
    const { data: contributions, error } = await supabase
      .from('CharityContribution')
      .select('amount, charityId');

    if (error) throw error;

    const charityMap = {};
    (contributions || []).forEach(c => {
      if (!charityMap[c.charityId]) {
        charityMap[c.charityId] = { amount: 0, count: 0 };
      }
      charityMap[c.charityId].amount += c.amount;
      charityMap[c.charityId].count += 1;
    });

    const cIds = Object.keys(charityMap);
    let charities = [];
    if (cIds.length > 0) {
      const { data: cData, error: cErr } = await supabase
        .from('Charity')
        .select('id, name, slug')
        .in('id', cIds);
      if (cErr) throw cErr;
      charities = cData || [];
    }

    const totals = cIds.map(cId => {
      const agg = charityMap[cId];
      const c = charities.find(ch => String(ch.id) === String(cId));
      return {
        charityId: cId,
        charityName: c ? c.name : 'Unknown',
        charitySlug: c ? c.slug : '',
        totalAmount: agg.amount,
        count: agg.count,
      };
    });

    totals.sort((a, b) => b.totalAmount - a.totalAmount);

    res.json({ success: true, totals });
  } catch (error) {
    next(error);
  }
};
