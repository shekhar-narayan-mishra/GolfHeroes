import 'dotenv/config';
import app from './app.js';
const PORT = process.env.PORT || 5000;

const start = async () => {
  // Supabase REST API doesn't require a constant connection boot like Prisma.
  // The client invokes HTTPS requests ephemerally via `@supabase/supabase-js`.


  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
    console.log(`   Environment: ${process.env.NODE_ENV || 'development'}`);
  });
};

start();
