/**
 * Seed the Supabase database with the sample artisan catalog so the live site
 * looks full on day one. Run with:  npm run seed
 *
 * Reads the mock catalog straight from the frontend so there is a single source
 * of truth. Uses the service-role key (bypasses RLS) and upserts by id, so it is
 * safe to run more than once.
 */
import 'dotenv/config';
import { createClient } from '@supabase/supabase-js';
import { MOCK_PRODUCTS, MOCK_SHOPS } from '../../frontend/src/data/mockData';
import type { Product, Shop } from '../../frontend/src/types';

const url = process.env.SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!url || !key) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in backend/.env');
  process.exit(1);
}

const supabase = createClient(url, key, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const shopIds = new Set(MOCK_SHOPS.map((s) => s.id));

function shopRow(shop: Shop, index: number) {
  return {
    id: shop.id,
    owner_id: null,
    name: shop.name,
    khmer_name: shop.khmerName ?? '',
    type: shop.type,
    region: shop.region,
    city: shop.city ?? '',
    address: shop.address ?? '',
    lat: shop.lat ?? 0,
    lng: shop.lng ?? 0,
    opening_hours: shop.openingHours ?? '',
    payment_methods: shop.paymentMethods ?? [],
    phone: shop.phone ?? '',
    google_maps_url: shop.googleMapsUrl ?? '',
    rating: shop.rating ?? 0,
    review_count: shop.reviewCount ?? 0,
    image_url: shop.image ?? '',
    image_public_id: null,
    description: shop.description ?? '',
    is_verified: shop.isVerified ?? false,
    featured_product_ids: shop.featuredProductIds ?? [],
    // Seed shops are live; first few are spotlighted so the homepage looks full.
    // Featured shops carry an active boost window (30 days out) so the
    // "only featured while boost is active" rule keeps them visible.
    status: 'approved',
    is_featured: index < 4,
    featured_until: index < 4 ? new Date(Date.now() + 30 * 864e5).toISOString() : null,
    subscription_status: 'active',
    vertical: 'artisan',
  };
}

function productRow(product: Product) {
  const ownerShopId = product.storeIds?.find((id) => shopIds.has(id)) ?? null;
  return {
    id: product.id,
    owner_id: null,
    owner_shop_id: ownerShopId,
    title: product.title,
    khmer_title: product.khmerTitle ?? '',
    category: product.category,
    region: product.region,
    price_usd: product.priceUsd ?? 0,
    price_range: product.priceRange ?? '',
    price_level: product.priceLevel ?? '$',
    rating: product.rating ?? 0,
    review_count: product.reviewCount ?? 0,
    image_url: product.image ?? '',
    image_public_id: null,
    description: product.description ?? '',
    cultural_story: product.culturalStory ?? '',
    store_ids: product.storeIds ?? [],
    authentic_tips: product.authenticTips ?? [],
    tags: product.tags ?? [],
    is_gi_certified: product.isGiCertified ?? false,
    is_handmade: product.isHandmade ?? false,
    artisan_group: product.artisanGroup ?? '',
    material: product.material ?? '',
    is_popular: product.isPopular ?? false,
    is_featured: product.isFeatured ?? false,
    vertical: 'artisan',
  };
}

async function main() {
  console.log(`Seeding ${MOCK_SHOPS.length} shops and ${MOCK_PRODUCTS.length} products…`);

  // Shops first (products reference shop ids).
  const shops = MOCK_SHOPS.map(shopRow);
  const { error: shopErr } = await supabase.from('shops').upsert(shops, { onConflict: 'id' });
  if (shopErr) {
    console.error('Shop seed failed:', shopErr.message);
    process.exit(1);
  }
  console.log(`  ✓ ${shops.length} shops`);

  const products = MOCK_PRODUCTS.map(productRow);
  const { error: prodErr } = await supabase.from('products').upsert(products, { onConflict: 'id' });
  if (prodErr) {
    console.error('Product seed failed:', prodErr.message);
    process.exit(1);
  }
  console.log(`  ✓ ${products.length} products`);

  console.log('Seed complete. ✅');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
