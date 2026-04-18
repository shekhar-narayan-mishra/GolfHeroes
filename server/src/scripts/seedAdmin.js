import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

dotenv.config();

const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

const seedAdmin = async () => {
  const email = process.env.ADMIN_EMAIL;
  if (!email) {
    console.error('Set ADMIN_EMAIL in .env');
    process.exit(1);
  }

  const { error } = await supabase.from('profiles').update({ role: 'admin' }).eq('email', email);

  if (error) {
    console.error('Failed:', error.message);
    process.exit(1);
  }

  console.log(`✓ ${email} promoted to admin`);
  process.exit(0);
};

seedAdmin();
