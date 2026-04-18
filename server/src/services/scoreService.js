import { supabase } from '../config/supabaseClient.js';

const MAX_SCORES = 5;

export const normaliseDate = (dateInput) => {
  const d = new Date(dateInput);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate())).toISOString().slice(0, 10);
};

export const addScore = async (userId, value, date) => {
  const scoreDate = normaliseDate(date);

  const { data: existing, error: dupErr } = await supabase
    .from('scores')
    .select('id')
    .eq('user_id', userId)
    .eq('score_date', scoreDate)
    .maybeSingle();

  if (dupErr) throw dupErr;

  if (existing) {
    const err = new Error('You already have a score recorded for this date.');
    err.statusCode = 409;
    throw err;
  }

  const { count, error: countErr } = await supabase
    .from('scores')
    .select('*', { count: 'exact', head: true })
    .eq('user_id', userId);

  if (countErr) throw countErr;

  if (count >= MAX_SCORES) {
    const { data: oldestScores, error: oldErr } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .order('score_date', { ascending: true })
      .limit(1);

    if (oldErr) throw oldErr;

    if (oldestScores && oldestScores.length > 0) {
      await supabase.from('scores').delete().eq('id', oldestScores[0].id);
    }
  }

  const { data: score, error: insErr } = await supabase
    .from('scores')
    .insert([
      {
        user_id: userId,
        value,
        score_date: scoreDate,
      },
    ])
    .select()
    .single();

  if (insErr) throw insErr;
  return score;
};

export const editScore = async (scoreId, userId, value, date) => {
  const { data: score, error: findErr } = await supabase
    .from('scores')
    .select('*')
    .eq('id', scoreId)
    .maybeSingle();

  if (findErr) throw findErr;

  if (!score) {
    const err = new Error('Score not found.');
    err.statusCode = 404;
    throw err;
  }

  if (score.user_id !== userId) {
    const err = new Error('You can only edit your own scores.');
    err.statusCode = 403;
    throw err;
  }

  const updateData = {};

  if (date !== undefined) {
    const scoreDate = normaliseDate(date);
    const { data: conflict, error: confErr } = await supabase
      .from('scores')
      .select('id')
      .eq('user_id', userId)
      .eq('score_date', scoreDate)
      .neq('id', scoreId)
      .limit(1);

    if (confErr) throw confErr;

    if (conflict && conflict.length > 0) {
      const err = new Error('You already have a score recorded for this date.');
      err.statusCode = 409;
      throw err;
    }
    updateData.score_date = scoreDate;
  }

  if (value !== undefined) {
    updateData.value = value;
  }

  if (Object.keys(updateData).length > 0) {
    const { data: updatedScore, error: updErr } = await supabase
      .from('scores')
      .update(updateData)
      .eq('id', scoreId)
      .select()
      .single();

    if (updErr) throw updErr;
    return updatedScore;
  }

  return score;
};

export const deleteScore = async (scoreId, userId) => {
  const { data: score, error: findErr } = await supabase
    .from('scores')
    .select('*')
    .eq('id', scoreId)
    .maybeSingle();

  if (findErr) throw findErr;

  if (!score) {
    const err = new Error('Score not found.');
    err.statusCode = 404;
    throw err;
  }

  if (score.user_id !== userId) {
    const err = new Error('You can only delete your own scores.');
    err.statusCode = 403;
    throw err;
  }

  const { error: delErr } = await supabase.from('scores').delete().eq('id', scoreId);

  if (delErr) throw delErr;

  return score;
};

export const getUserScores = async (userId) => {
  const { data: scores, error } = await supabase
    .from('scores')
    .select('*')
    .eq('user_id', userId)
    .order('score_date', { ascending: false });

  if (error) throw error;
  return scores || [];
};
