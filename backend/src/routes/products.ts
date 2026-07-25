import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { destroyAsset } from '../cloudinary.js';
import { authenticate, type AuthedRequest } from '../auth.js';

export const productsRouter = Router();

/**
 * DELETE /api/products/:id
 * Cascade delete a product + its Cloudinary image.
 * Allowed for the product owner (merchant) or any admin.
 */
productsRouter.delete('/:id', authenticate, async (req: AuthedRequest, res) => {
  const productId = req.params.id;

  const { data: product, error: fetchErr } = await supabaseAdmin
    .from('products')
    .select('id, owner_id, image_public_id')
    .eq('id', productId)
    .single();

  if (fetchErr || !product) {
    res.status(404).json({ error: 'Product not found.' });
    return;
  }

  const isOwner = product.owner_id && product.owner_id === req.userId;
  const isAdmin = req.userRole === 'admin';
  if (!isOwner && !isAdmin) {
    res.status(403).json({ error: 'You can only delete your own products.' });
    return;
  }

  await destroyAsset(product.image_public_id);

  const { error } = await supabaseAdmin.from('products').delete().eq('id', productId);
  if (error) {
    res.status(500).json({ error: error.message });
    return;
  }

  res.json({ ok: true });
});
