import { Router } from 'express';
import { cloudinary, destroyAsset } from '../cloudinary.js';
import { env } from '../env.js';
import { authenticate, requireRole, type AuthedRequest } from '../auth.js';

export const cloudinaryRouter = Router();

/**
 * POST /api/cloudinary/sign
 * Returns a signature so the browser can upload directly to Cloudinary without
 * ever seeing the API secret. Merchants and admins only.
 */
cloudinaryRouter.post(
  '/sign',
  authenticate,
  requireRole('merchant', 'admin'),
  (req: AuthedRequest, res) => {
    const folder = typeof req.body?.folder === 'string' ? req.body.folder : 'angkorcraft';
    const timestamp = Math.round(Date.now() / 1000);
    const signature = cloudinary.utils.api_sign_request(
      { timestamp, folder },
      env.cloudinary.apiSecret,
    );
    res.json({ signature, timestamp, apiKey: env.cloudinary.apiKey, folder });
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
