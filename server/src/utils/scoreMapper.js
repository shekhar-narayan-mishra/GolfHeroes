export function scoreToClient(s) {
  if (!s) return s;
  return {
    id: s.id,
    _id: s.id,
    value: s.value,
    date: s.score_date,
    userId: s.user_id,
    score_date: s.score_date,
  };
}
