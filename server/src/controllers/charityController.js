import { supabase } from '../config/supabaseClient.js';

const MIN_CONTRIBUTION_PCT = 10;

/**
 * GET /api/charities
 * Public. Supports ?search=term and ?featured=true query params.
 */
export const getCharities = async (req, res, next) => {
  try {
    const { search, featured } = req.query;
    
    let query = supabase.from('charities').select('*').order('featured', { ascending: false }).order('name', { ascending: true });

    if (search) {
      query = query.or(`name.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (featured === 'true') {
      query = query.eq('featured', true);
    }

    const { data: charities, error } = await query;
    if (error) throw error;
    
    res.json({ success: true, charities: charities || [] });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/charities/:slug
 * Public. Returns single charity by slug.
 */
export const getCharityBySlug = async (req, res, next) => {
  try {
    const { data: charity, error } = await supabase
      .from('charities')
      .select('*')
      .eq('slug', req.params.slug)
      .maybeSingle();
      
    if (error) throw error;

    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }
    
    res.json({ success: true, charity });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/charities — admin: create charity
 */
export const createCharity = async (req, res, next) => {
  try {
    const { name, slug, description, images, events, featured } = req.body;

    if (!name || !slug) {
      return res.status(400).json({ success: false, message: 'Name and slug are required.' });
    }

    const parsedSlug = slug.toLowerCase().replace(/\s+/g, '-');
    
    const { data: existing } = await supabase
      .from('charities')
      .select('*')
      .eq('slug', parsedSlug)
      .maybeSingle();

    if (existing) {
      return res.status(409).json({ success: false, message: 'A charity with this slug already exists.' });
    }

    const { data: charity, error } = await supabase
      .from('charities')
      .insert([
        {
          name,
          slug: parsedSlug,
          description: description || '',
          images: images || [],
          events: events || [],
          featured: featured || false,
        }
      ])
      .select()
      .single();

    if (error) throw error;

    res.status(201).json({ success: true, charity });
  } catch (error) {
    next(error);
  }
};

/**
 * PUT /api/charities/:id — admin: update charity
 */
export const updateCharity = async (req, res, next) => {
  try {
    const { _id, id, createdAt, updatedAt, ...updateData } = req.body;
    
    // Check if charity exists
    const { data: existing, error: findErr } = await supabase
      .from('charities')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    const { data: charity, error } = await supabase
      .from('charities')
      .update(updateData)
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, charity });
  } catch (error) {
    next(error);
  }
};

/**
 * DELETE /api/charities/:id — admin: delete charity
 */
export const deleteCharity = async (req, res, next) => {
  try {
    const { data: existing, error: findErr } = await supabase
      .from('charities')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    const { error } = await supabase
      .from('charities')
      .delete()
      .eq('id', req.params.id);

    if (error) throw error;

    res.json({ success: true, message: 'Charity deleted.' });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/charities/:id/image — admin: add image URL to charity
 * Body: { url: string }
 */
export const addImage = async (req, res, next) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ success: false, message: 'Image URL is required.' });
    }

    const { data: existing, error: findErr } = await supabase
      .from('charities')
      .select('*')
      .eq('id', req.params.id)
      .maybeSingle();

    if (findErr) throw findErr;
    if (!existing) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    const newImages = [...(existing.images || []), url];

    const { data: charity, error } = await supabase
      .from('charities')
      .update({ images: newImages })
      .eq('id', req.params.id)
      .select()
      .single();

    if (error) throw error;

    res.json({ success: true, charity });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/charities/select — authenticated user selects charity + contribution %
 * Body: { charityId, contributionPercent }
 */
export const selectCharity = async (req, res, next) => {
  try {
    const { charityId, contributionPercent } = req.body;

    if (!charityId) {
      return res.status(400).json({ success: false, message: 'Charity selection is required.' });
    }

    const pct = Number(contributionPercent);
    if (isNaN(pct) || pct < MIN_CONTRIBUTION_PCT || pct > 100) {
      return res.status(400).json({
        success: false,
        message: `Contribution must be between ${MIN_CONTRIBUTION_PCT}% and 100%.`,
      });
    }

    // Verify charity exists
    const { data: charity, error: cErr } = await supabase
      .from('charities')
      .select('id, name, slug')
      .eq('id', charityId)
      .maybeSingle();

    if (cErr) throw cErr;
    if (!charity) {
      return res.status(404).json({ success: false, message: 'Charity not found.' });
    }

    const { data: user, error: uErr } = await supabase
      .from('profiles')
      .update({
        charity_id: charityId,
        contribution_percent: pct,
      })
      .eq('id', req.user.id)
      .select()
      .single();

    if (uErr) throw uErr;

    res.json({
      success: true,
      charity: { id: charity.id, name: charity.name, slug: charity.slug },
      contributionPercent: user.contribution_percent,
    });
  } catch (error) {
    next(error);
  }
};
