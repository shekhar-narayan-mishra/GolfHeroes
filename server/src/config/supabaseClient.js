import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const anonKey = process.env.SUPABASE_ANON_KEY || process.env.SUPABASE_PUBLISHABLE_KEY;

if (!url || !serviceKey) {
  throw new Error('Set SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY for the GolfHeroes API server.');
}

/**
 * Server-side Supabase client with the service role key (bypasses RLS).
 * All trusted Express routes should use this for Postgres access.
 */
export const supabase = createClient(url, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * Anon/publishable client — only for GoTrue (signUp / signInWithPassword).
 * Never use this for privileged data access.
 */
export const supabaseAnon = anonKey
  ? createClient(url, anonKey, {
      auth: { persistSession: false, autoRefreshToken: false },
    })
  : null;
