export function drawToClient(d) {
  if (!d) return d;
  return {
    id: d.id,
    _id: d.id,
    month: d.month,
    year: d.year,
    status: d.status,
    drawType: d.draw_type,
    algorithmicBias: d.algorithmic_bias,
    numbers: d.numbers,
    prizePool: {
      total: d.prize_pool_total,
      first: d.prize_pool_first,
      second: d.prize_pool_second,
      third: d.prize_pool_third,
    },
    jackpotRollover: d.jackpot_rollover,
    publishedAt: d.published_at,
    createdAt: d.created_at,
  };
}

export function drawResultRowToClient(r, user) {
  return {
    id: r.id,
    _id: r.id,
    drawId: r.draw_id,
    userId: r.user_id,
    matchTier: r.match_tier,
    prizeAmount: r.prize_amount,
    user: user || { name: 'Unknown', email: '' },
  };
}
