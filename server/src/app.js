import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import scoreRoutes from './routes/scores.js';
import drawRoutes from './routes/draws.js';
import charityRoutes from './routes/charities.js';
import winnerRoutes from './routes/winners.js';
import subscriptionRoutes from './routes/subscriptions.js';
import contributionRoutes from './routes/contributions.js';
import adminRoutes from './routes/admin.js';
import { handleWebhook } from './controllers/subscriptionController.js';
import errorHandler from './middleware/errorHandler.js';

const app = express();

// ── Security & Logging ──────────────────────────────────
app.use(helmet());
app.use(morgan('dev'));

// ── CORS ─────────────────────────────────────────────────
const allowedOrigins = ['http://localhost:5173', process.env.FRONTEND_URL, process.env.CLIENT_URL].filter(Boolean);

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (mobile apps, curl, etc.)
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error(`CORS: origin ${origin} not allowed`));
      }
    },
    credentials: true,
  })
);

// ── Stripe Webhook (must use raw body — mounted BEFORE express.json) ──
app.post(
  '/api/webhooks/stripe',
  express.raw({ type: 'application/json' }),
  handleWebhook
);

// ── Body Parsing ─────────────────────────────────────────
app.use(express.json({ 
  limit: '10mb',
  verify: (req, res, buf) => {
    // Preserve raw buffer for Stripe Webhooks
    if (req.originalUrl.startsWith('/api/webhooks/stripe')) {
      req.rawBody = buf.toString('utf8');
    }
  }
}));
app.use(express.urlencoded({ extended: true }));

// ── Health check ─────────────────────────────────────────
app.get('/api/health', (_req, res) => {
  res.json({ success: true, message: 'Digital Heroes API is running 🏌️' });
});

// ── API Routes ───────────────────────────────────────────
app.use('/api/auth', authRoutes);
app.use('/api/scores', scoreRoutes);
app.use('/api/draws', drawRoutes);
app.use('/api/charities', charityRoutes);
app.use('/api/winners', winnerRoutes);
app.use('/api/subscriptions', subscriptionRoutes);
app.use('/api/contributions', contributionRoutes);
app.use('/api/admin', adminRoutes);

// ── 404 catch-all ────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({ success: false, message: `Route ${req.method} ${req.path} not found` });
});

// ── Centralised error handler (must be last) ─────────────
app.use(errorHandler);

export default app;
