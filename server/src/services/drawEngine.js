/**
 * SCALABILITY NOTE:
 * This draw engine is stateless and can be extracted into a standalone
 * microservice or Supabase Edge Function for multi-country support.
 * Each country runs independent draws with separate prize pools by passing
 * a country filter to all Supabase queries. Corporate accounts are supported
 * by grouping user IDs under a corporate_id on the profiles table.
 * All API routes use the /api/ prefix making them directly consumable
 * by a future React Native mobile app without modification.
 */

import { supabase } from '../config/supabaseClient.js';
import { sendDrawPublishedEmail } from './emailService.js';
import { profileToClient } from '../utils/profileMapper.js';

const PRIZE_TIERS = {
  5: { label: '5-Number Match', share: 0.4 },
  4: { label: '4-Number Match', share: 0.35 },
  3: { label: '3-Number Match', share: 0.25 },
};

/** Pence contributed per active subscriber toward the monthly pool (£2.00) */
const PER_SUBSCRIBER_CONTRIBUTION = 200;

export const calculatePrizePool = async (jackpotRolloverEur = 0) => {
  const { count: activeCount, error } = await supabase
    .from('profiles')
    .select('*', { count: 'exact', head: true })
    .in('subscription_status', ['active', 'trialing']);

  if (error) throw error;

  const basePool = (activeCount || 0) * PER_SUBSCRIBER_CONTRIBUTION;
  const total = basePool + jackpotRolloverEur;

  return {
    activeSubscribers: activeCount || 0,
    basePool,
    jackpotRollover: jackpotRolloverEur,
    total,
    tiers: {
      first: Math.round(total * PRIZE_TIERS[5].share),
      second: Math.round(total * PRIZE_TIERS[4].share),
      third: Math.round(total * PRIZE_TIERS[3].share),
    },
  };
};

export const generateNumbers = async (drawType = 'random', bias = 'most') => {
  if (drawType === 'random') {
    return generateRandomNumbers();
  }
  return generateAlgorithmicNumbers(bias);
};

function generateRandomNumbers() {
  const nums = new Set();
  while (nums.size < 5) {
    nums.add(Math.floor(Math.random() * 45) + 1);
  }
  return Array.from(nums).sort((a, b) => a - b);
}

async function generateAlgorithmicNumbers(bias = 'most') {
  const { data: scores, error } = await supabase.from('scores').select('value');

  if (error) throw error;

  const freqMap = {};
  (scores || []).forEach((s) => {
    freqMap[s.value] = (freqMap[s.value] || 0) + 1;
  });

  const frequencies = Object.entries(freqMap).map(([value, count]) => ({
    value: parseInt(value, 10),
    _count: { value: count },
  }));

  frequencies.sort((a, b) =>
    bias === 'most' ? b._count.value - a._count.value : a._count.value - b._count.value
  );

  if (frequencies.length < 5) {
    return generateRandomNumbers();
  }

  const totalCount = frequencies.reduce((sum, f) => sum + f._count.value, 0);
  const weighted = frequencies.map((f) => ({
    value: f.value,
    weight: f._count.value / totalCount,
  }));

  const selected = new Set();
  const pool = [...weighted];

  while (selected.size < 5 && pool.length > 0) {
    const totalWeight = pool.reduce((sum, w) => sum + w.weight, 0);
    let rand = Math.random() * totalWeight;

    for (let i = 0; i < pool.length; i++) {
      rand -= pool[i].weight;
      if (rand <= 0) {
        selected.add(pool[i].value);
        pool.splice(i, 1);
        break;
      }
    }
  }

  while (selected.size < 5) {
    selected.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

export const matchUsers = async (drawNumbers, prizePool) => {
  const { data: activeUsers, error: uErr } = await supabase
    .from('profiles')
    .select('id, name, email')
    .in('subscription_status', ['active', 'trialing']);

  if (uErr) throw uErr;

  const matches = [];
  const tierWinners = { 5: [], 4: [], 3: [] };

  if (activeUsers && activeUsers.length > 0) {
    const userIds = activeUsers.map((u) => u.id);
    const { data: userScores, error: sErr } = await supabase
      .from('scores')
      .select('user_id, value')
      .in('user_id', userIds);

    if (sErr) throw sErr;

    const scoresByUserId = {};
    (userScores || []).forEach((s) => {
      if (!scoresByUserId[s.user_id]) scoresByUserId[s.user_id] = new Set();
      scoresByUserId[s.user_id].add(s.value);
    });

    for (const user of activeUsers) {
      const userValues = scoresByUserId[user.id] || new Set();
      const matchCount = drawNumbers.filter((n) => userValues.has(n)).length;

      if (matchCount >= 3) {
        tierWinners[matchCount] = tierWinners[matchCount] || [];
        tierWinners[matchCount].push({
          userId: user.id,
          userName: user.name,
          userEmail: user.email,
          matchCount,
        });
      }
    }
  }

  for (const tier of [5, 4, 3]) {
    const winners = tierWinners[tier];
    if (winners && winners.length > 0) {
      const tierTotal = prizePool.tiers[tier === 5 ? 'first' : tier === 4 ? 'second' : 'third'];
      const perUser = Math.round(tierTotal / winners.length);

      for (const winner of winners) {
        matches.push({
          userId: winner.userId,
          userName: winner.userName,
          userEmail: winner.userEmail,
          matchTier: tier,
          prizeAmount: perUser,
        });
      }
    }
  }

  const hasJackpotWinner = tierWinners[5] && tierWinners[5].length > 0;

  return {
    matches,
    tierSummary: {
      5: tierWinners[5]?.length || 0,
      4: tierWinners[4]?.length || 0,
      3: tierWinners[3]?.length || 0,
    },
    hasJackpotWinner,
    totalWinners: matches.length,
  };
};

export const simulateDraw = async (drawId) => {
  const { data: draw, error: dErr } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .maybeSingle();

  if (dErr) throw dErr;
  if (!draw) {
    const err = new Error('Draw not found.');
    err.statusCode = 404;
    throw err;
  }

  if (draw.status === 'published') {
    const err = new Error('This draw has already been published.');
    err.statusCode = 400;
    throw err;
  }

  const prizePool = await calculatePrizePool(Number(draw.jackpot_rollover) || 0);
  const numbers = await generateNumbers(draw.draw_type || 'random', draw.algorithmic_bias || 'most');
  const result = await matchUsers(numbers, prizePool);

  const { data: updatedDraw, error: updErr } = await supabase
    .from('draws')
    .update({
      numbers,
      prize_pool_total: prizePool.total,
      prize_pool_first: prizePool.tiers.first,
      prize_pool_second: prizePool.tiers.second,
      prize_pool_third: prizePool.tiers.third,
      status: 'simulated',
    })
    .eq('id', draw.id)
    .select()
    .single();

  if (updErr) throw updErr;

  return {
    draw: updatedDraw,
    prizePool,
    numbers,
    ...result,
  };
};

export const publishDraw = async (drawId) => {
  const { data: draw, error: dErr } = await supabase
    .from('draws')
    .select('*')
    .eq('id', drawId)
    .maybeSingle();

  if (dErr) throw dErr;
  if (!draw) {
    const err = new Error('Draw not found.');
    err.statusCode = 404;
    throw err;
  }

  if (draw.status === 'published') {
    const err = new Error('This draw has already been published.');
    err.statusCode = 400;
    throw err;
  }

  if (draw.status !== 'simulated') {
    const err = new Error('Draw must be simulated before publishing.');
    err.statusCode = 400;
    throw err;
  }

  const prizePool = {
    tiers: {
      first: Number(draw.prize_pool_first),
      second: Number(draw.prize_pool_second),
      third: Number(draw.prize_pool_third),
    },
  };

  const { matches, hasJackpotWinner, tierSummary } = await matchUsers(draw.numbers, prizePool);

  const drawResults = [];

  for (const match of matches) {
    const { data: result, error: resErr } = await supabase
      .from('draw_results')
      .insert([
        {
          draw_id: draw.id,
          user_id: match.userId,
          match_tier: match.matchTier,
          prize_amount: match.prizeAmount,
        },
      ])
      .select()
      .single();

    if (resErr) throw resErr;
    drawResults.push(result);

    const { error: winErr } = await supabase.from('winners').insert([
      {
        user_id: match.userId,
        draw_result_id: result.id,
      },
    ]);

    if (winErr) throw winErr;
  }

  let nextJackpotRollover = 0;
  if (!hasJackpotWinner) {
    nextJackpotRollover = Number(draw.prize_pool_first) || 0;
  }

  const { data: finalDraw, error: updErr } = await supabase
    .from('draws')
    .update({
      status: 'published',
      published_at: new Date().toISOString(),
    })
    .eq('id', draw.id)
    .select()
    .single();

  if (updErr) throw updErr;

  const { data: activeUsers } = await supabase
    .from('profiles')
    .select('*')
    .in('subscription_status', ['active', 'trialing']);

  if (activeUsers && activeUsers.length > 0) {
    for (const row of activeUsers) {
      const userMatch = matches.find((m) => m.userId === row.id);
      sendDrawPublishedEmail(profileToClient(row), userMatch ? { matchTier: userMatch.matchTier } : null).catch(
        console.error
      );
    }
  }

  return {
    draw: finalDraw,
    drawResults,
    tierSummary,
    hasJackpotWinner,
    jackpotRollover: nextJackpotRollover,
    totalWinners: matches.length,
  };
};

export const getJackpotRollover = async () => {
  const { data: lastDraw, error } = await supabase
    .from('draws')
    .select('id, prize_pool_first')
    .eq('status', 'published')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !lastDraw) return 0;

  const { count: jackpotWinners, error: countErr } = await supabase
    .from('draw_results')
    .select('*', { count: 'exact', head: true })
    .eq('draw_id', lastDraw.id)
    .eq('match_tier', 5);

  if (countErr) throw countErr;

  if (jackpotWinners === 0) {
    return Number(lastDraw.prize_pool_first) || 0;
  }

  return 0;
};
