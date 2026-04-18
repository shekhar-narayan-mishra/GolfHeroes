import jwt from 'jsonwebtoken';
import { supabase } from '../config/supabaseClient.js';
import { profileToClient } from '../utils/profileMapper.js';
import { drawToClient, drawResultRowToClient } from '../utils/drawMapper.js';
import * as drawEngine from '../services/drawEngine.js';

export async function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith('Bearer ')) {
    req.user = null;
    return next();
  }
  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', decoded.userId)
      .maybeSingle();
    req.user = profile ? profileToClient(profile) : null;
  } catch {
    req.user = null;
  }
  next();
}

export const getDraws = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    let query = supabase.from('draws').select('*').order('year', { ascending: false }).order('month', { ascending: false });

    if (!isAdmin) {
      query = query.eq('status', 'published');
    }

    const { data: draws, error } = await query;
    if (error) throw error;

    res.json({ success: true, draws: (draws || []).map(drawToClient) });
  } catch (error) {
    next(error);
  }
};

export const getDrawById = async (req, res, next) => {
  try {
    const { data: draw, error: drawErr } = await supabase
      .from('draws')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (drawErr) throw drawErr;

    if (!draw) {
      return res.status(404).json({ success: false, message: 'Draw not found.' });
    }

    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && draw.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Draw not found.' });
    }

    const { data: results, error: resErr } = await supabase
      .from('draw_results')
      .select('*')
      .eq('draw_id', draw.id)
      .order('match_tier', { ascending: false })
      .order('prize_amount', { ascending: false });

    if (resErr) throw resErr;

    const userIds = [...new Set((results || []).map((r) => r.user_id))];
    let profileMap = {};
    if (userIds.length) {
      const { data: profiles, error: pErr } = await supabase.from('profiles').select('id, name, email').in('id', userIds);
      if (pErr) throw pErr;
      (profiles || []).forEach((p) => {
        profileMap[p.id] = { name: p.name, email: p.email };
      });
    }

    const formattedResults = (results || []).map((r) =>
      drawResultRowToClient(r, profileMap[r.user_id] || { name: 'Unknown', email: '' })
    );

    res.json({ success: true, draw: drawToClient(draw), results: formattedResults });
  } catch (error) {
    next(error);
  }
};

export const createDraw = async (req, res, next) => {
  try {
    const { month, year, drawType, algorithmicBias } = req.body;

    if (!month || !year) {
      return res.status(400).json({
        success: false,
        message: 'Month and year are required.',
      });
    }

    if (month < 1 || month > 12) {
      return res.status(400).json({
        success: false,
        message: 'Month must be between 1 and 12.',
      });
    }

    const { data: existing, error: existErr } = await supabase
      .from('draws')
      .select('id')
      .eq('month', month)
      .eq('year', year)
      .maybeSingle();

    if (existErr) throw existErr;

    if (existing) {
      return res.status(409).json({
        success: false,
        message: `A draw already exists for ${month}/${year}.`,
        drawId: existing.id,
      });
    }

    const jackpotRollover = await drawEngine.getJackpotRollover();
    const prizePool = await drawEngine.calculatePrizePool(jackpotRollover);

    const { data: draw, error: insertErr } = await supabase
      .from('draws')
      .insert([
        {
          month,
          year,
          draw_type: drawType || 'random',
          algorithmic_bias: algorithmicBias || 'most',
          jackpot_rollover: jackpotRollover,
          prize_pool_total: prizePool.total,
          prize_pool_first: prizePool.tiers.first,
          prize_pool_second: prizePool.tiers.second,
          prize_pool_third: prizePool.tiers.third,
        },
      ])
      .select()
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({
      success: true,
      draw: drawToClient(draw),
      prizePoolDetails: prizePool,
    });
  } catch (error) {
    next(error);
  }
};

export const simulateDraw = async (req, res, next) => {
  try {
    const result = await drawEngine.simulateDraw(req.params.id);
    res.json({ success: true, ...result, draw: drawToClient(result.draw) });
  } catch (error) {
    next(error);
  }
};

export const publishDraw = async (req, res, next) => {
  try {
    const result = await drawEngine.publishDraw(req.params.id);
    res.json({ success: true, ...result, draw: drawToClient(result.draw) });
  } catch (error) {
    next(error);
  }
};
