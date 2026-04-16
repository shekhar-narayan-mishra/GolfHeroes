import supabase, { supabaseAnon } from '../supabaseClient.js';
import { sendWelcomeEmail } from '../services/emailService.js';

/** Marks rows where credentials live in Supabase Auth, not in passwordHash. */
const SUPABASE_AUTH_PLACEHOLDER = '__supabase_auth__';

const stripPassword = (row) => {
  if (!row) return row;
  const { passwordHash: _, ...rest } = row;
  return rest;
};

async function upsertAppUserFromAuth(authUser, { name } = {}) {
  const displayName =
    name?.trim() ||
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    (authUser.email ? authUser.email.split('@')[0] : 'Member');

  const { data: existing, error: findErr } = await supabase
    .from('User')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing;

  const { data: inserted, error: insertErr } = await supabase
    .from('User')
    .insert([
      {
        id: authUser.id,
        name: displayName,
        email: authUser.email,
        passwordHash: SUPABASE_AUTH_PLACEHOLDER,
        role: 'user',
        subscriptionStatus: 'inactive',
      },
    ])
    .select()
    .single();

  if (insertErr) throw insertErr;
  return inserted;
}

/**
 * POST /api/auth/register — Supabase Auth signUp + public.User profile row.
 */
export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: name, name },
      },
    });

    if (signUpError) {
      const msg = (signUpError.message || '').toLowerCase();
      if (
        signUpError.code === 'user_already_exists' ||
        msg.includes('already registered') ||
        msg.includes('already been registered')
      ) {
        return res.status(409).json({
          success: false,
          message: 'An account with this email already exists.',
        });
      }
      return res.status(400).json({
        success: false,
        message: signUpError.message || 'Registration failed.',
      });
    }

    const authUser = signUpData.user;
    if (!authUser) {
      return res.status(400).json({
        success: false,
        message: 'Registration failed.',
      });
    }

    let profile;
    try {
      profile = await upsertAppUserFromAuth(authUser, { name });
    } catch (e) {
      return res.status(500).json({
        success: false,
        message:
          e.message ||
          'Account was created in Supabase Auth but the profile row could not be created. Check RLS and your User table schema.',
      });
    }

    const session = signUpData.session;

    if (!session?.access_token) {
      sendWelcomeEmail(profile).catch(console.error);
      return res.status(201).json({
        success: true,
        needsConfirmation: true,
        message: 'Check your email to confirm your account, then sign in.',
      });
    }

    sendWelcomeEmail(profile).catch(console.error);

    res.status(201).json({
      success: true,
      token: session.access_token,
      user: stripPassword(profile),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/login — Supabase Auth password grant + app profile.
 */
export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.session?.access_token) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const authUser = signInData.user;
    let profile;

    try {
      profile = await upsertAppUserFromAuth(authUser);
    } catch (e) {
      return next(e);
    }

    res.json({
      success: true,
      token: signInData.session.access_token,
      user: stripPassword(profile),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * GET /api/auth/me — profile from public.User for the Supabase user id.
 */
export const getMe = async (req, res, next) => {
  try {
    const { data: user, error } = await supabase
      .from('User')
      .select('*')
      .eq('id', req.user.userId)
      .maybeSingle();

    if (error) throw error;

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found.',
      });
    }

    res.json({
      success: true,
      user: stripPassword(user),
    });
  } catch (error) {
    next(error);
  }
};

/**
 * POST /api/auth/logout — session is cleared on the client; reserved for future server-side revoke.
 */
export const logout = async (_req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};
