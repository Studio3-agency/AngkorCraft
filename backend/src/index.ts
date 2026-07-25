import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import { env, isConfigured, isOriginAllowed } from './env.js';
import { cloudinaryRouter } from './routes/cloudinary.js';
import { shopsRouter } from './routes/shops.js';
import { productsRouter } from './routes/products.js';
import { translateRouter } from './routes/translate.js';

const app = express();

// Behind Render's proxy — trust it so rate limiting sees the real client IP.
app.set('trust proxy', 1);

// Security headers. This is a JSON API (no HTML), so the CSP isn't needed and
// cross-origin resource policy would fight our own CORS handling.
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginResourcePolicy: false,
  }),
);

app.use(express.json({ limit: '2mb' }));
app.use(
  cors({
    origin: (origin, cb) => {
      // Allow same-origin / curl (no origin) and any configured frontend origin.
      if (!origin || isOriginAllowed(origin)) return cb(null, true);
      cb(new Error(`Origin ${origin} not allowed by CORS`));
    },
  }),
);

// --- Rate limiting -------------------------------------------------------
// A generous global cap protects the service from abuse/runaway clients...
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 1000,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests, please slow down.' },
});
// ...and a still-generous cap on the write/upload/translate endpoints. Kept high
// enough that active use (auto-translate fires per save) never trips it.
const writeLimiter = rateLimit({
  windowMs: 5 * 60 * 1000,
  max: 250,
  standardHeaders: true,
  legacyHeaders: false,
  message: { error: 'Too many requests to this endpoint, please try again shortly.' },
});
app.use(globalLimiter);

// Health check — UptimeRobot pings this to keep the free Render service warm.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', configured: isConfigured, service: 'angkorcraft-api' });
});

app.use('/api/cloudinary', writeLimiter, cloudinaryRouter);
app.use('/api/admin/shops', writeLimiter, shopsRouter);
app.use('/api/products', writeLimiter, productsRouter);
app.use('/api/translate', writeLimiter, translateRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'AngkorCraft API', health: '/health' });
});

app.listen(env.port, () => {
  console.log(`[AngkorCraft API] listening on http://localhost:${env.port}`);
  if (!isConfigured) {
    console.warn('[AngkorCraft API] Running WITHOUT full config — set values in backend/.env');
  }
});
