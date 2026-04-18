import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';
dotenv.config({ path: 'server/.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

async function check() {
  const { data: users, error: authError } = await supabase.auth.admin.listUsers();
  console.log("Auth users:", users?.length, authError?.message);
  
  const { data: profiles, error: profileError } = await supabase.from('profiles').select('*');
  console.log("Profiles count:", profiles?.length, profileError?.message);
  if (profiles) console.log(profiles);
}

check();
