import { Router } from 'express';
import { cloudinary, destroyAsset } from '../cloudinary.js';
import { env } from '../env.js';
import { authenticate, requireRole, type AuthedRequest } from '../auth.js';

export const cloudinaryRouter = Router();

/**
 * POST /api/cloudinary/sign
 * Returns a signature so the browser can upload directly to Cloudinary without
 * ever seeing the API secret. Any signed-in user (merchants/admins for shop &
 * product media; customers for their profile avatar). Rate-limited upstream.
 */
cloudinaryRouter.post(
  '/sign',
  authenticate,
  (req: AuthedRequest, res) => {
    const folder = typeof req.body?.folder === 'string' ? req.body.folder : 'angkorcraft';
    const timestamp = Math.round(Date.now() / 1000);
    // When automated moderation is configured, sign it into the upload so
    // Cloudinary screens each image. The signature must cover every param the
    // browser sends, so we echo `moderation` back for the client to include.
    const moderation = env.cloudinary.moderation;
    const params: Record<string, string | number> = { timestamp, folder };
    if (moderation) params.moderation = moderation;
    const signature = cloudinary.utils.api_sign_request(params, env.cloudinary.apiSecret);
    res.json({ signature, timestamp, apiKey: env.cloudinary.apiKey, folder, moderation });
  },
);

/**
 * POST /api/cloudinary/delete  { publicId }
 * Deletes a single asset (used when replacing an image). Merchants and admins.
 */
cloudinaryRouter.post(
  '/delete',
  authenticate,
  requireRole('merchant', 'admin'),
  async (req: AuthedRequest, res) => {
    const publicId = req.body?.publicId;
    if (!publicId || typeof publicId !== 'string') {
      res.status(400).json({ error: 'publicId is required.' });
      return;
    }
    await destroyAsset(publicId);
    res.json({ ok: true });
  },
);
