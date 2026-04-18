import jwt from 'jsonwebtoken';
import { supabase, supabaseAnon } from '../config/supabaseClient.js';
import { sendWelcomeEmail } from '../services/emailService.js';
import { profileToClient } from '../utils/profileMapper.js';

const JWT_EXPIRY = '7d';

const signAppJwt = (profile) =>
  jwt.sign(
    { userId: profile.id, email: profile.email, role: profile.role },
    process.env.JWT_SECRET,
    { expiresIn: JWT_EXPIRY }
  );

async function ensureProfileRow(authUser, name) {
  const displayName =
    name?.trim() ||
    authUser.user_metadata?.full_name ||
    authUser.user_metadata?.name ||
    (authUser.email ? authUser.email.split('@')[0] : 'Member');

  const { data: existing, error: findErr } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', authUser.id)
    .maybeSingle();

  if (findErr) throw findErr;
  if (existing) return existing;

  const { data: inserted, error: insertErr } = await supabase
    .from('profiles')
    .insert([
      {
        id: authUser.id,
        email: authUser.email,
        name: displayName,
        role: 'user',
        subscription_status: 'inactive',
      },
    ])
    .select()
    .single();

  if (insertErr) throw insertErr;
  return inserted;
}

export const register = async (req, res, next) => {
  try {
    if (!supabaseAnon) {
      return res.status(500).json({
        success: false,
        message: 'Server is missing SUPABASE_ANON_KEY for registration.',
      });
    }

    const { name, email, password } = req.body;

    const { data: signUpData, error: signUpError } = await supabaseAnon.auth.signUp({
      email,
      password,
      options: { data: { full_name: name, name } },
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
      return res.status(400).json({ success: false, message: 'Registration failed.' });
    }

    let profileRow;
    try {
      profileRow = await ensureProfileRow(authUser, name);
    } catch (e) {
      return res.status(500).json({
        success: false,
        message:
          e.message ||
          'Auth user was created but the profile row could not be inserted. Check Supabase schema and policies.',
      });
    }

    const session = signUpData.session;
    if (!session?.access_token) {
      sendWelcomeEmail(profileToClient(profileRow)).catch(console.error);
      return res.status(201).json({
        success: true,
        needsConfirmation: true,
        message: 'Check your email to confirm your account, then sign in.',
      });
    }

    sendWelcomeEmail(profileToClient(profileRow)).catch(console.error);
    const token = signAppJwt(profileRow);

    res.status(201).json({
      success: true,
      token,
      user: profileToClient(profileRow),
    });
  } catch (error) {
    next(error);
  }
};

export const login = async (req, res, next) => {
  try {
    if (!supabaseAnon) {
      return res.status(500).json({
        success: false,
        message: 'Server is missing SUPABASE_ANON_KEY for login.',
      });
    }

    const { email, password } = req.body;

    const { data: signInData, error: signInError } = await supabaseAnon.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError || !signInData.user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password.',
      });
    }

    const profileRow = await ensureProfileRow(signInData.user);
    const token = signAppJwt(profileRow);

    res.json({
      success: true,
      token,
      user: profileToClient(profileRow),
    });
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    res.json({
      success: true,
      user: req.user,
    });
  } catch (error) {
    next(error);
  }
};

export const logout = async (_req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully.',
  });
};
