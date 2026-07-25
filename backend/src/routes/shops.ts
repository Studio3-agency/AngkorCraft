import { Router } from 'express';
import { supabaseAdmin } from '../supabaseAdmin.js';
import { destroyAsset } from '../cloudinary.js';
import { authenticate, requireRole, type AuthedRequest } from '../auth.js';

export const shopsRouter = Router();

/**
 * DELETE /api/admin/shops/:id
 * Cascade delete a shop (admin only):
 *   1. Delete the shop's owned products + their Cloudinary images.
 *   2. Remove the shop id from any other product's `store_ids` (where-to-buy).
 *   3. Destroy the shop's own Cloudinary image.
 *   4. Delete the shop row.
 */
shopsRouter.delete(
  '/:id',
  authenticate,
  requireRole('admin'),
  async (req: AuthedRequest, res) => {
    const shopId = req.params.id;

    // 1. Owned products
    const { data: ownedProducts } = await supabaseAdmin
      .from('products')
      .select('id, image_public_id')
      .eq('owner_shop_id', shopId);

    for (const p of ownedProducts ?? []) {
      await destroyAsset(p.image_public_id);
    }
    if (ownedProducts && ownedProducts.length > 0) {
      await supabaseAdmin
        .from('products')
        .delete()
        .in('id', ownedProducts.map((p) => p.id));
    }

    // 2. Remove this shop from other products' store_ids
    const { data: linkedProducts } = await supabaseAdmin
      .from('products')
      .select('id, store_ids')
      .contains('store_ids', [shopId]);

    for (const p of linkedProducts ?? []) {
      const nextStoreIds = (p.store_ids as string[]).filter((id) => id !== shopId);
      await supabaseAdmin.from('products').update({ store_ids: nextStoreIds }).eq('id', p.id);
    }

    // 3. Shop image
    const { data: shop } = await supabaseAdmin
      .from('shops')
      .select('image_public_id')
      .eq('id', shopId)
      .single();
    await destroyAsset(shop?.image_public_id);

    // 4. Shop row
    const { error } = await supabaseAdmin.from('shops').delete().eq('id', shopId);
    if (error) {
      res.status(500).json({ error: error.message });
      return;
    }

    res.json({ ok: true });
  },
);
