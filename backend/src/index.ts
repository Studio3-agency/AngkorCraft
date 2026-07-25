import express from 'express';
import cors from 'cors';
import { env, isConfigured, isOriginAllowed } from './env.js';
import { cloudinaryRouter } from './routes/cloudinary.js';
import { shopsRouter } from './routes/shops.js';
import { productsRouter } from './routes/products.js';
import { translateRouter } from './routes/translate.js';

const app = express();

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

// Health check — UptimeRobot pings this to keep the free Render service warm.
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', configured: isConfigured, service: 'angkorcraft-api' });
});

app.use('/api/cloudinary', cloudinaryRouter);
app.use('/api/admin/shops', shopsRouter);
app.use('/api/products', productsRouter);
app.use('/api/translate', translateRouter);

app.get('/', (_req, res) => {
  res.json({ name: 'AngkorCraft API', health: '/health' });
});

app.listen(env.port, () => {
  console.log(`[AngkorCraft API] listening on http://localhost:${env.port}`);
  if (!isConfigured) {
    console.warn('[AngkorCraft API] Running WITHOUT full config — set values in backend/.env');
  }
});
