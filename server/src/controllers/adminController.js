import { supabase } from '../config/supabaseClient.js';
import { profileToClient } from '../utils/profileMapper.js';

export const getUsers = async (req, res, next) => {
  try {
    const { data: profiles, error } = await supabase
      .from('profiles')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;

    const { data: scores, error: sErr } = await supabase.from('scores').select('user_id');
    if (sErr) throw sErr;

    const countByUser = {};
    (scores || []).forEach((s) => {
      countByUser[s.user_id] = (countByUser[s.user_id] || 0) + 1;
    });

    const users = (profiles || []).map((p) => ({
      ...profileToClient(p),
      scoresCount: countByUser[p.id] || 0,
    }));

    res.json({ success: true, users });
  } catch (error) {
    next(error);
  }
};

export const getAnalytics = async (req, res, next) => {
  try {
    const { data: activeUsers, error: userErr } = await supabase
      .from('profiles')
      .select('id')
      .in('subscription_status', ['active', 'trialing']);

    if (userErr) throw userErr;
    const activeSubscribers = activeUsers?.length || 0;

    const basePool = activeSubscribers * 2;
    let jackpotRollover = 0;

    const { data: draws, error: drawErr } = await supabase
      .from('draws')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1);

    if (drawErr) throw drawErr;
    const lastDraw = draws?.[0];

    if (lastDraw && lastDraw.prize_pool_first) {
      const { count: jackpotWinners, error: resErr } = await supabase
        .from('draw_results')
        .select('*', { count: 'exact', head: true })
        .eq('draw_id', lastDraw.id)
        .eq('match_tier', 5);

      if (resErr) throw resErr;
      if (jackpotWinners === 0) jackpotRollover = Number(lastDraw.prize_pool_first) || 0;
    }

    const currentPrizePool = basePool + jackpotRollover;

    const { data: contributions, error: contribErr } = await supabase
      .from('charity_contributions')
      .select('amount, charity_id');

    if (contribErr) throw contribErr;

    let totalCharityContributions = 0;
    const charityMap = {};

    (contributions || []).forEach((c) => {
      const amt = Number(c.amount || 0);
      totalCharityContributions += amt;
      charityMap[c.charity_id] = (charityMap[c.charity_id] || 0) + amt;
    });

    const sortedCharityIds = Object.entries(charityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);

    const charityIdsToFetch = sortedCharityIds.map((tuple) => tuple[0]);

    let charities = [];
    if (charityIdsToFetch.length > 0) {
      const { data: charityData, error: cErr } = await supabase
        .from('charities')
        .select('id, name')
        .in('id', charityIdsToFetch);
      if (cErr) throw cErr;
      charities = charityData || [];
    }

    const charityChartData = sortedCharityIds.map(([cId, amount]) => {
      const cInfo = charities.find((c) => String(c.id) === String(cId));
      const name = cInfo ? cInfo.name : 'Unknown';
      return {
        name: name.length > 15 ? `${name.substring(0, 15)}...` : name,
        total: parseFloat((amount / 100).toFixed(2)),
      };
    });

    let participationRate = 0;
    if (activeSubscribers > 0) {
      const ids = activeUsers.map((u) => u.id);

      const { data: scoreRows, error: scoreErr } = await supabase.from('scores').select('user_id').in('user_id', ids);

      if (scoreErr) throw scoreErr;

      const distinctUsersWithScores = new Set((scoreRows || []).map((s) => s.user_id));
      participationRate = Math.round((distinctUsersWithScores.size / activeSubscribers) * 100);
    }

    res.json({
      success: true,
      analytics: {
        activeSubscribers,
        currentPrizePool,
        totalCharityContributions,
        charityChartData,
        participationRate,
      },
    });
  } catch (error) {
    next(error);
  }
};
