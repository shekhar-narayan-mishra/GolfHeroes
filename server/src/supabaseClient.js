import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const anonKey =
  process.env.SUPABASE_ANON_KEY ||
  process.env.SUPABASE_PUBLISHABLE_KEY ||
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || anonKey;

if (!supabaseUrl || !anonKey) {
  throw new Error(
    'Set SUPABASE_URL and SUPABASE_ANON_KEY (Supabase publishable/anon key) in the server environment.'
  );
}

/**
 * Trusted server PostgREST client. Prefer SUPABASE_SERVICE_ROLE_KEY in production
 * so inserts/updates are not blocked by RLS; falls back to the anon key if unset.
 */
export const supabase = createClient(supabaseUrl, serviceKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

/**
 * GoTrue-facing client (anon / publishable key only). Used for signUp,
 * signInWithPassword, and verifying access tokens via auth.getUser(jwt).
 */
export const supabaseAnon = createClient(supabaseUrl, anonKey, {
  auth: { persistSession: false, autoRefreshToken: false },
});

export default supabase;
