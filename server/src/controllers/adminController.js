import supabase from '../supabaseClient.js';

export const getAnalytics = async (req, res, next) => {
  try {
    // 1. Total Active Subscribers
    const { data: activeUsers, error: userErr } = await supabase
      .from('User')
      .select('id')
      .eq('subscriptionStatus', 'active');
      
    if (userErr) throw userErr;
    const activeSubscribers = activeUsers.length || 0;

    // 2. Current Month Prize Pool Estimate
    const basePool = activeSubscribers * 200; // 200p per subscriber
    let jackpotRollover = 0;
    
    const { data: draws, error: drawErr } = await supabase
      .from('Draw')
      .select('*')
      .eq('status', 'published')
      .order('year', { ascending: false })
      .order('month', { ascending: false })
      .limit(1);

    if (drawErr) throw drawErr;
    const lastDraw = draws?.[0];
    
    if (lastDraw && lastDraw.prizePoolFirst) {
      // Check if there was no 5-match winner
      const { count: jackpotWinners, error: resErr } = await supabase
        .from('DrawResult')
        .select('*', { count: 'exact', head: true })
        .eq('drawId', lastDraw.id)
        .eq('matchTier', 5);

      if (resErr) throw resErr;
      if (jackpotWinners === 0) jackpotRollover = lastDraw.prizePoolFirst;
    }
    const currentPrizePool = basePool + jackpotRollover;

    // 3. Total Charity Contributions All-Time & Per-Charity Grouping
    // We fetch amounts to compute aggregations manually since Supabase JS natively doesn't perform SQL SUM() without RPC views.
    const { data: contributions, error: contribErr } = await supabase
      .from('CharityContribution')
      .select('amount, charityId');
      
    if (contribErr) throw contribErr;
    
    let totalCharityContributions = 0;
    const charityMap = {};
    
    (contributions || []).forEach(c => {
      totalCharityContributions += c.amount;
      charityMap[c.charityId] = (charityMap[c.charityId] || 0) + c.amount;
    });

    // 4. Per-Charity Contributions (for Recharts bar chart)
    const sortedCharityIds = Object.entries(charityMap)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10);
      
    const charityIdsToFetch = sortedCharityIds.map(tuple => tuple[0]);
    
    let charities = [];
    if (charityIdsToFetch.length > 0) {
      const { data: charityData, error: cErr } = await supabase
        .from('Charity')
        .select('id, name')
        .in('id', charityIdsToFetch);
      if (cErr) throw cErr;
      charities = charityData || [];
    }

    // Format for recharts
    const charityChartData = sortedCharityIds.map(([cId, amount]) => {
      const cInfo = charities.find((c) => String(c.id) === String(cId));
      const name = cInfo ? cInfo.name : 'Unknown';
      return {
        name: name.length > 15 ? name.substring(0, 15) + '...' : name,
        total: parseFloat((amount / 100).toFixed(2)),
      };
    });

    // 5. Draw Participation Rate (Active subs with at least 1 score / Total active subs)
    let participationRate = 0;
    if (activeSubscribers > 0) {
      const ids = activeUsers.map((u) => u.id);
      
      const { data: scores, error: scoreErr } = await supabase
        .from('Score')
        .select('userId')
        .in('userId', ids);

      if (scoreErr) throw scoreErr;
      
      const distinctUsersWithScores = new Set((scores || []).map(s => s.userId));
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
