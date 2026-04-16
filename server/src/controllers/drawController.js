import supabase from '../supabaseClient.js';
import * as drawEngine from '../services/drawEngine.js';

// ── Public Routes ─────────────────────────────────────────

/** GET /api/draws — list all draws (public: only published; admin: all) */
export const getDraws = async (req, res, next) => {
  try {
    const isAdmin = req.user?.role === 'admin';
    let query = supabase.from('Draw').select('*').order('year', { ascending: false }).order('month', { ascending: false });
    
    if (!isAdmin) {
      query = query.eq('status', 'published');
    }
    
    const { data: draws, error } = await query;
    if (error) throw error;

    res.json({ success: true, draws: draws || [] });
  } catch (error) {
    next(error);
  }
};

/** GET /api/draws/:id — single draw with results */
export const getDrawById = async (req, res, next) => {
  try {
    const { data: draw, error: drawErr } = await supabase
      .from('Draw')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (drawErr) throw drawErr;

    if (!draw) {
      return res.status(404).json({ success: false, message: 'Draw not found.' });
    }

    // Non-admin can only see published draws
    const isAdmin = req.user?.role === 'admin';
    if (!isAdmin && draw.status !== 'published') {
      return res.status(404).json({ success: false, message: 'Draw not found.' });
    }

    // Relational query targeting user profile
    const { data: results, error: resErr } = await supabase
      .from('DrawResult')
      .select(`
        *,
        user:User (
          name,
          email
        )
      `)
      .eq('drawId', draw.id)
      .order('matchTier', { ascending: false })
      .order('prizeAmount', { ascending: false });

    if (resErr) throw resErr;

    // Formatting fallback in case Postgres casing acts up
    const formattedResults = (results || []).map(r => ({
      ...r,
      user: r.user || r.User || { name: 'Unknown', email: '' }
    }));

    res.json({ success: true, draw, results: formattedResults });
  } catch (error) {
    next(error);
  }
};

// ── Admin Routes ──────────────────────────────────────────

/** POST /api/draws — create a new draw config for a month */
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

    // Check for existing draw this month
    const { data: existing, error: existErr } = await supabase
      .from('Draw')
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

    // Calculate jackpot rollover from previous draws
    const jackpotRollover = await drawEngine.getJackpotRollover();

    // Calculate initial prize pool
    const prizePool = await drawEngine.calculatePrizePool(jackpotRollover);

    const { data: draw, error: insertErr } = await supabase
      .from('Draw')
      .insert([
        {
          month,
          year,
          drawType: drawType || 'random',
          algorithmicBias: algorithmicBias || 'most',
          jackpotRollover,
          prizePoolTotal: prizePool.total,
          prizePoolFirst: prizePool.tiers.first,
          prizePoolSecond: prizePool.tiers.second,
          prizePoolThird: prizePool.tiers.third,
        }
      ])
      .select()
      .single();

    if (insertErr) throw insertErr;

    res.status(201).json({
      success: true,
      draw,
      prizePoolDetails: prizePool,
    });
  } catch (error) {
    next(error);
  }
};

/** POST /api/draws/:id/simulate — run simulation, return preview */
export const simulateDraw = async (req, res, next) => {
  try {
    const result = await drawEngine.simulateDraw(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};

/** POST /api/draws/:id/publish — publish results (irreversible) */
export const publishDraw = async (req, res, next) => {
  try {
    const result = await drawEngine.publishDraw(req.params.id);
    res.json({ success: true, ...result });
  } catch (error) {
    next(error);
  }
};
