import supabase from '../supabaseClient.js';

const MAX_SCORES = 5;

/**
 * Normalise a date to midnight UTC (strips time component).
 */
export const normaliseDate = (dateInput) => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString();
};

/**
 * Add a new score for a user.
 * Business rules:
 *  - Normalise date to midnight UTC
 *  - Reject if a score already exists for that date (409)
 *  - If user already has 5 scores, delete the oldest before inserting
 *  - Value must be 1–45
 */
export const addScore = async (userId, value, date) => {
  const normDate = normaliseDate(date);

  // Check for duplicate date
  const { data: existing, error: dupErr } = await supabase
    .from('Score')
    .select('id')
    .eq('userId', userId)
    .eq('date', normDate)
    .maybeSingle();

  if (dupErr) throw dupErr;

  if (existing) {
    const err = new Error('You already have a score recorded for this date.');
    err.statusCode = 409;
    throw err;
  }

  // Enforce max 5 scores — delete oldest if at limit
  const { count, error: countErr } = await supabase
    .from('Score')
    .select('*', { count: 'exact', head: true })
    .eq('userId', userId);

  if (countErr) throw countErr;

  if (count >= MAX_SCORES) {
    const { data: oldestScores, error: oldErr } = await supabase
      .from('Score')
      .select('id')
      .eq('userId', userId)
      .order('date', { ascending: true })
      .limit(1);

    if (oldErr) throw oldErr;
    
    if (oldestScores && oldestScores.length > 0) {
      await supabase.from('Score').delete().eq('id', oldestScores[0].id);
    }
  }

  // Insert new score
  const { data: score, error: insErr } = await supabase
    .from('Score')
    .insert([
      {
        userId,
        value,
        date: normDate,
      }
    ])
    .select()
    .single();

  if (insErr) throw insErr;
  return score;
};

/**
 * Edit an existing score.
 * Checks ownership and date conflicts.
 */
export const editScore = async (scoreId, userId, value, date) => {
  const { data: score, error: findErr } = await supabase
    .from('Score')
    .select('*')
    .eq('id', scoreId)
    .maybeSingle();

  if (findErr) throw findErr;

  if (!score) {
    const err = new Error('Score not found.');
    err.statusCode = 404;
    throw err;
  }

  if (score.userId !== userId) {
    const err = new Error('You can only edit your own scores.');
    err.statusCode = 403;
    throw err;
  }

  const updateData = {};

  // If date is changing, check for conflict
  if (date !== undefined) {
    const normDate = normaliseDate(date);
    const { data: conflict, error: confErr } = await supabase
      .from('Score')
      .select('id')
      .eq('userId', userId)
      .eq('date', normDate)
      .neq('id', scoreId)
      .limit(1);

    if (confErr) throw confErr;

    if (conflict && conflict.length > 0) {
      const err = new Error('You already have a score recorded for this date.');
      err.statusCode = 409;
      throw err;
    }
    updateData.date = normDate;
  }

  if (value !== undefined) {
    updateData.value = value;
  }

  if (Object.keys(updateData).length > 0) {
    const { data: updatedScore, error: updErr } = await supabase
      .from('Score')
      .update(updateData)
      .eq('id', scoreId)
      .select()
      .single();

    if (updErr) throw updErr;
    return updatedScore;
  }

  return score;
};

/**
 * Delete a score. Checks ownership.
 */
export const deleteScore = async (scoreId, userId) => {
  const { data: score, error: findErr } = await supabase
    .from('Score')
    .select('*')
    .eq('id', scoreId)
    .maybeSingle();

  if (findErr) throw findErr;

  if (!score) {
    const err = new Error('Score not found.');
    err.statusCode = 404;
    throw err;
  }

  if (score.userId !== userId) {
    const err = new Error('You can only delete your own scores.');
    err.statusCode = 403;
    throw err;
  }

  const { error: delErr } = await supabase
    .from('Score')
    .delete()
    .eq('id', scoreId);

  if (delErr) throw delErr;

  return score;
};

/**
 * Get all scores for a user, sorted newest first.
 */
export const getUserScores = async (userId) => {
  const { data: scores, error } = await supabase
    .from('Score')
    .select('*')
    .eq('userId', userId)
    .order('date', { ascending: false });

  if (error) throw error;
  return scores || [];
};
