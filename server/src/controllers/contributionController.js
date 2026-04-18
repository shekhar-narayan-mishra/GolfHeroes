import { supabase } from '../config/supabaseClient.js';
import { stripe } from '../config/stripe.js';

/**
 * POST /api/contributions/independent
 * Body: { charityId, amount } — amount in minor units (pence); stored as EUR decimal.
 */
export const createIndependentDonation = async (req, res, next) => {
  try {
    const { charityId, amount } = req.body;
    const userId = req.user.id;

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
      .from('charities')
      .select('*')
      .eq('id', charityId)
      .maybeSingle();

    if (cErr) throw cErr;
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    const { data: profile, error: uErr } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .maybeSingle();

    if (uErr) throw uErr;

    const paymentIntent = await stripe.paymentIntents.create({
      amount,
      currency: 'gbp',
      metadata: {
        userId,
        charityId,
        charityName: charity.name,
        type: 'independent',
      },
      description: `Donation to ${charity.name} — GolfHeroes`,
      receipt_email: profile?.email,
    });

    const { data: contribution, error } = await supabase
      .from('charity_contributions')
      .insert([
        {
          user_id: userId,
          charity_id: charityId,
          amount: Number(amount),
          contribution_type: 'independent',
        },
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

export const getMyContributions = async (req, res, next) => {
  try {
    const { data: contributions, error } = await supabase
      .from('charity_contributions')
      .select('*')
      .eq('user_id', req.user.id)
      .order('created_at', { ascending: false });

    if (error) throw error;

    const charityIds = [...new Set((contributions || []).map((c) => c.charity_id).filter(Boolean))];
    let charityMap = {};
    if (charityIds.length) {
      const { data: ch, error: chErr } = await supabase.from('charities').select('id, name, slug').in('id', charityIds);
      if (chErr) throw chErr;
      (ch || []).forEach((c) => {
        charityMap[c.id] = c;
      });
    }

    const total = (contributions || []).reduce((sum, c) => sum + Number(c.amount || 0), 0);

    const formattedData = (contributions || []).map((c) => ({
      ...c,
      charity: charityMap[c.charity_id] || { name: 'Unknown', slug: '' },
    }));

    res.json({ success: true, contributions: formattedData, total });
  } catch (error) {
    next(error);
  }
};

export const getContributionTotals = async (req, res, next) => {
  try {
    const { data: contributions, error } = await supabase
      .from('charity_contributions')
      .select('amount, charity_id');

    if (error) throw error;

    const charityMap = {};
    (contributions || []).forEach((c) => {
      const cid = c.charity_id;
      if (!charityMap[cid]) {
        charityMap[cid] = { amount: 0, count: 0 };
      }
      charityMap[cid].amount += Number(c.amount || 0);
      charityMap[cid].count += 1;
    });

    const cIds = Object.keys(charityMap);
    let charities = [];
    if (cIds.length > 0) {
      const { data: cData, error: cErr } = await supabase
        .from('charities')
        .select('id, name, slug')
        .in('id', cIds);
      if (cErr) throw cErr;
      charities = cData || [];
    }

    const totals = cIds.map((cId) => {
      const agg = charityMap[cId];
      const c = charities.find((ch) => String(ch.id) === String(cId));
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
