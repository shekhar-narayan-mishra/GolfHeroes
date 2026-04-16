import supabase from '../supabaseClient.js';
import { sendDrawPublishedEmail } from './emailService.js';

// ── Configuration ──────────────────────────────────────────
const PRIZE_TIERS = {
  5: { label: '5-Number Match', share: 0.40 },  // jackpot
  4: { label: '4-Number Match', share: 0.35 },
  3: { label: '3-Number Match', share: 0.25 },
};

// Per-subscriber contribution to the draw pool (in pence)
const PER_SUBSCRIBER_CONTRIBUTION = 200; // £2.00 per month

// ── 1. Prize Pool Calculation ─────────────────────────────

/**
 * Calculate the total prize pool for the current draw.
 * Base pool = active subscribers × per-subscriber contribution.
 * Adds rolled-over jackpot from previous unclaimed 5-match tier.
 */
export const calculatePrizePool = async (jackpotRollover = 0) => {
  const { count: activeCount, error } = await supabase
    .from('User')
    .select('*', { count: 'exact', head: true })
    .in('subscriptionStatus', ['active', 'trialing']);

  if (error) throw error;

  const basePool = (activeCount || 0) * PER_SUBSCRIBER_CONTRIBUTION;
  const total = basePool + jackpotRollover;

  return {
    activeSubscribers: activeCount || 0,
    basePool,
    jackpotRollover,
    total,
    tiers: {
      first:  Math.round(total * PRIZE_TIERS[5].share), // 5-match (40%)
      second: Math.round(total * PRIZE_TIERS[4].share), // 4-match (35%)
      third:  Math.round(total * PRIZE_TIERS[3].share), // 3-match (25%)
    },
  };
};

// ── 2. Number Generation ──────────────────────────────────

/**
 * Generate 5 unique integers from 1–45.
 * "random" → pure random
 * "algorithmic" → weighted by score frequency distribution
 *
 * @param {string} drawType  "random" | "algorithmic"
 * @param {string} bias      "most" | "least" — only used for algorithmic
 */
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

/**
 * Fetch all scores and build a frequency distribution,
 * then use weighted random selection biased toward most or least frequent values.
 */
async function generateAlgorithmicNumbers(bias = 'most') {
  const { data: scores, error } = await supabase
    .from('Score')
    .select('value');

  if (error) throw error;

  const freqMap = {};
  (scores || []).forEach(s => {
    freqMap[s.value] = (freqMap[s.value] || 0) + 1;
  });

  const frequencies = Object.entries(freqMap).map(([value, count]) => ({
    value: parseInt(value, 10),
    _count: { value: count }
  }));

  frequencies.sort((a, b) => bias === 'most' ? b._count.value - a._count.value : a._count.value - b._count.value);

  // If not enough data, fall back to random
  if (frequencies.length < 5) {
    return generateRandomNumbers();
  }

  const totalCount = frequencies.reduce((sum, f) => sum + f._count.value, 0);
  const weighted = frequencies.map((f) => ({
    value: f.value,
    weight: f._count.value / totalCount,
  }));

  // Weighted random selection without replacement
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

  // Fill remaining with random if needed
  while (selected.size < 5) {
    selected.add(Math.floor(Math.random() * 45) + 1);
  }

  return Array.from(selected).sort((a, b) => a - b);
}

// ── 3. Match Users Against Draw Numbers ───────────────────

/**
 * For each active subscriber, compare their stored scores against the draw numbers.
 * Count matches and assign tier (3/4/5 match).
 * Returns array of matched users with tier and prize amount.
 */
export const matchUsers = async (drawNumbers, prizePool) => {
  const { data: activeUsers, error: uErr } = await supabase
    .from('User')
    .select('id, name, email')
    .in('subscriptionStatus', ['active', 'trialing']);

  if (uErr) throw uErr;

  const matches = [];
  const tierWinners = { 5: [], 4: [], 3: [] };

  if (activeUsers && activeUsers.length > 0) {
    const userIds = activeUsers.map(u => u.id);
    const { data: userScores, error: sErr } = await supabase
      .from('Score')
      .select('userId, value')
      .in('userId', userIds);

    if (sErr) throw sErr;

    const scoresByUserId = {};
    (userScores || []).forEach(s => {
      if (!scoresByUserId[s.userId]) scoresByUserId[s.userId] = new Set();
      scoresByUserId[s.userId].add(s.value);
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

  // Calculate per-user prize amount (split equally within each tier)
  for (const tier of [5, 4, 3]) {
    const winners = tierWinners[tier];
    if (winners && winners.length > 0) {
      const tierTotal = prizePool.tiers[
        tier === 5 ? 'first' : tier === 4 ? 'second' : 'third'
      ];
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

  // Did anyone win the jackpot (5-match)?
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

// ── 4. Simulate Draw ──────────────────────────────────────

/**
 * Run the full draw pipeline but do NOT persist results.
 * Returns preview data for admin review.
 */
export const simulateDraw = async (drawId) => {
  const { data: draw, error: dErr } = await supabase
    .from('Draw')
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

  // Step 1: Calculate prize pool
  const prizePool = await calculatePrizePool(draw.jackpotRollover);

  // Step 2: Generate numbers
  const numbers = await generateNumbers(draw.drawType, draw.algorithmicBias || 'most');

  // Step 3: Match users
  const result = await matchUsers(numbers, prizePool);

  // Update draw with simulation data (but don't publish)
  const { data: updatedDraw, error: updErr } = await supabase
    .from('Draw')
    .update({
      numbers,
      prizePoolTotal: prizePool.total,
      prizePoolFirst: prizePool.tiers.first,
      prizePoolSecond: prizePool.tiers.second,
      prizePoolThird: prizePool.tiers.third,
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

// ── 5. Publish Draw ───────────────────────────────────────

/**
 * Persist DrawResult and Winner documents for all matched users.
 * Handle jackpot rollover if no 5-match winner.
 * This is IRREVERSIBLE.
 */
export const publishDraw = async (drawId) => {
  const { data: draw, error: dErr } = await supabase
    .from('Draw')
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

  // Re-run matching with the stored numbers
  const prizePool = {
    tiers: {
      first: draw.prizePoolFirst,
      second: draw.prizePoolSecond,
      third: draw.prizePoolThird,
    },
  };
  const { matches, hasJackpotWinner, tierSummary } = await matchUsers(draw.numbers, prizePool);

  // Persist DrawResult documents and Winner documents
  const drawResults = [];
  
  // Use sequential updates to ensure stable relations
  for (const match of matches) {
    const { data: result, error: resErr } = await supabase
      .from('DrawResult')
      .insert([
        {
          drawId: draw.id,
          userId: match.userId,
          matchTier: match.matchTier,
          prizeAmount: match.prizeAmount,
        }
      ])
      .select()
      .single();

    if (resErr) throw resErr;
    drawResults.push(result);

    // Create Winner document attached to this drawResult
    const { error: winErr } = await supabase
      .from('Winner')
      .insert([
        {
          userId: match.userId,
          drawResultId: result.id,
        }
      ]);

    if (winErr) throw winErr;
  }

  // Handle jackpot rollover
  let nextJackpotRollover = 0;
  if (!hasJackpotWinner) {
    nextJackpotRollover = draw.prizePoolFirst;
    console.log(`🔄 Jackpot rolling over: £${(nextJackpotRollover / 100).toFixed(2)}`);
  }

  // Mark draw as published
  const { data: finalDraw, error: updErr } = await supabase
    .from('Draw')
    .update({
      status: 'published',
      publishedAt: new Date().toISOString(),
    })
    .eq('id', draw.id)
    .select()
    .single();

  if (updErr) throw updErr;

  // Send emails to all active participants
  const { data: activeUsers } = await supabase
    .from('User')
    .select('*')
    .in('subscriptionStatus', ['active', 'trialing']);
    
  if (activeUsers && activeUsers.length > 0) {
    for (const user of activeUsers) {
      // Find if this user won anything in this draw
      const userMatch = matches.find(m => m.userId === user.id);
      sendDrawPublishedEmail(user, userMatch).catch(console.error);
    }
  }

  // Store rollover for next month's draw (handled externally when next draw is created)
  return {
    draw: finalDraw,
    drawResults,
    tierSummary,
    hasJackpotWinner,
    jackpotRollover: nextJackpotRollover,
    totalWinners: matches.length,
  };
};

/**
 * Get the jackpot rollover amount from the most recent published draw
 * that had no 5-match winner.
 */
export const getJackpotRollover = async () => {
  const { data: lastDraw, error } = await supabase
    .from('Draw')
    .select('id, prizePoolFirst')
    .eq('status', 'published')
    .order('year', { ascending: false })
    .order('month', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (error || !lastDraw) return 0;

  // Check if last draw had any 5-match winners
  const { count: jackpotWinners, error: countErr } = await supabase
    .from('DrawResult')
    .select('*', { count: 'exact', head: true })
    .eq('drawId', lastDraw.id)
    .eq('matchTier', 5);

  if (countErr) throw countErr;

  if (jackpotWinners === 0) {
    return lastDraw.prizePoolFirst;
  }

  return 0;
};
