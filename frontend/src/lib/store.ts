import { supabase } from './supabase';
import {
  mapShop,
  mapProduct,
  mapTransaction,
  mapPosSale,
  mapContentReport,
  mapReview,
  mapPublicProfile,
  mapStoreView,
  shopToRow,
  productToRow,
  ShopRow,
  ProductRow,
  ContentReportRow,
  ReviewRow,
  StoreViewRow,
} from './db';
import {
  Shop,
  Product,
  Transaction,
  PosSale,
  TransactionType,
  ContentReport,
  ModerationStatus,
  Review,
  PublicProfile,
  StoreView,
  StoreViewSource,
} from '../types';
import { CATALOG_FETCH_LIMIT } from './limits';

// ---------- Slugs (shareable store URLs) ----------

/** Turn a shop name into a URL-safe slug. */
export function slugify(name: string): string {
  return (
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '') || 'shop'
  );
}

/**
 * Produce a slug not already used by another shop. RLS may hide some rows from
 * the caller, so the DB unique index is the real guard — saveShop retries with a
 * random suffix if an insert ever collides.
 */
export async function generateUniqueSlug(name: string, excludeId?: string): Promise<string> {
  const base = slugify(name);
  let candidate = base;
  let n = 1;
  // Try a handful of readable variants before giving up to the random fallback.
  for (let i = 0; i < 10; i++) {
    const { data, error } = await supabase.from('shops').select('id').eq('slug', candidate).limit(1);
    if (error) return candidate; // slug column may not exist yet — best effort
    const taken = (data ?? []).some((r) => (r as { id: string }).id !== excludeId);
    if (!taken) return candidate;
    n += 1;
    candidate = `${base}-${n}`;
  }
  return `${base}-${Math.random().toString(36).slice(2, 6)}`;
}

// ---------- Reads ----------

export async function fetchAllShops(): Promise<Shop[]> {
  const { data, error } = await supabase
    .from('shops')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(CATALOG_FETCH_LIMIT);
  if (error) throw error;
  return (data as ShopRow[]).map(mapShop);
}

export async function fetchAllProducts(): Promise<Product[]> {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(CATALOG_FETCH_LIMIT);
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
}

export async function fetchMyShops(ownerId: string): Promise<Shop[]> {
  const { data, error } = await supabase.from('shops').select('*').eq('owner_id', ownerId);
  if (error) throw error;
  return (data as ShopRow[]).map(mapShop);
}

export async function fetchProductsForShop(shopId: string): Promise<Product[]> {
  const { data, error } = await supabase.from('products').select('*').eq('owner_shop_id', shopId);
  if (error) throw error;
  return (data as ProductRow[]).map(mapProduct);
}

// ---------- Writes (RLS enforces who may do what) ----------

export async function fetchShopBySlug(slug: string): Promise<Shop | null> {
  const { data, error } = await supabase.from('shops').select('*').eq('slug', slug).maybeSingle();
  if (error) throw error;
  return data ? mapShop(data as ShopRow) : null;
}

/**
 * Fetch a single shop by slug, falling back to id. Used by the store page to
 * render a shop that isn't in the public catalog (e.g. an owner previewing a
 * store whose subscription is inactive). RLS still applies.
 */
export async function fetchShopBySlugOrId(slugOrId: string): Promise<Shop | null> {
  const bySlug = await supabase.from('shops').select('*').eq('slug', slugOrId).maybeSingle();
  if (!bySlug.error && bySlug.data) return mapShop(bySlug.data as ShopRow);
  const byId = await supabase.from('shops').select('*').eq('id', slugOrId).maybeSingle();
  if (byId.error) {
    if (isMissingColumnError(byId.error)) return null;
    throw byId.error;
  }
  return byId.data ? mapShop(byId.data as ShopRow) : null;
}

// Columns added by later migrations. If a migration hasn't been applied yet,
// writing these fails with a "column does not exist" error — so we detect that
// and retry without them, keeping saves working either way.
const OPTIONAL_SHOP_COLUMNS = [
  'instagram', 'telegram', 'wechat', 'messenger', 'facebook', 'tiktok',
  'whatsapp', 'website', 'email', 'contact_note', 'slug', 'moderation_status',
  'parent_shop_id',
];

function isMissingColumnError(err: { code?: string; message?: string; details?: string } | null): boolean {
  if (!err) return false;
  const text = `${err.message ?? ''} ${err.details ?? ''}`;
  return err.code === 'PGRST204' || err.code === '42703' || /column|schema cache|could not find/i.test(text);
}

export async function saveShop(shop: Partial<Shop>): Promise<Shop> {
  const row = shopToRow(shop);

  // Assign a shareable slug the first time a shop is saved without one — but
  // only if the slug column exists (skip silently on a pre-migration DB).
  if (!row.slug && row.name && row.id) {
    try {
      const { data: existing, error: selErr } = await supabase
        .from('shops')
        .select('slug')
        .eq('id', row.id)
        .maybeSingle();
      if (!selErr && (!existing || !(existing as { slug: string | null }).slug)) {
        row.slug = await generateUniqueSlug(row.name, row.id);
      }
    } catch {
      /* slug column not present yet — skip */
    }
  }

  const doUpsert = (r: Partial<ShopRow>) =>
    supabase.from('shops').upsert(r, { onConflict: 'id' }).select('*').single();

  let { data, error } = await doUpsert(row);

  // Missing new columns (migration not run) → retry without them so the core
  // shop still saves. The extra fields are ignored until the migration is applied.
  if (error && isMissingColumnError(error)) {
    const stripped: Partial<ShopRow> = { ...row };
    OPTIONAL_SHOP_COLUMNS.forEach((c) => delete (stripped as Record<string, unknown>)[c]);
    ({ data, error } = await doUpsert(stripped));
  }
  // Extremely rare slug uniqueness race.
  else if (error && /slug/i.test(error.message ?? '') && row.name) {
    row.slug = `${slugify(row.name)}-${Math.random().toString(36).slice(2, 6)}`;
    ({ data, error } = await doUpsert(row));
  }

  if (error) throw error;
  return mapShop(data as ShopRow);
}

export async function updateShopFields(id: string, fields: Partial<Shop>): Promise<Shop> {
  const { data, error } = await supabase
    .from('shops')
    .update(shopToRow(fields))
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapShop(data as ShopRow);
}

export async function saveProduct(product: Partial<Product>): Promise<Product> {
  const row = productToRow(product);
  const { data, error } = await supabase.from('products').upsert(row, { onConflict: 'id' }).select('*').single();
  if (error) throw error;
  return mapProduct(data as ProductRow);
}

// ---------- Simulated commerce ----------

export async function logTransaction(
  shopId: string,
  type: TransactionType,
  amountUsd: number,
): Promise<Transaction> {
  const { data, error } = await supabase
    .from('transactions')
    .insert({ shop_id: shopId, type, amount_usd: amountUsd, status: 'paid' })
    .select('*')
    .single();
  if (error) throw error;
  return mapTransaction(data);
}

export async function fetchTransactions(shopId: string): Promise<Transaction[]> {
  const { data, error } = await supabase
    .from('transactions')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapTransaction);
}

export async function fetchAllTransactions(): Promise<Transaction[]> {
  const { data, error } = await supabase.from('transactions').select('*');
  if (error) throw error;
  return (data ?? []).map(mapTransaction);
}

export async function addPosSale(
  shopId: string,
  items: PosSale['items'],
  totalUsd: number,
  paymentMethod: string,
): Promise<PosSale> {
  const { data, error } = await supabase
    .from('pos_sales')
    .insert({ shop_id: shopId, items, total_usd: totalUsd, payment_method: paymentMethod })
    .select('*')
    .single();
  if (error) throw error;
  return mapPosSale(data);
}

export async function fetchPosSales(shopId: string): Promise<PosSale[]> {
  const { data, error } = await supabase
    .from('pos_sales')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data ?? []).map(mapPosSale);
}

// ---------- Store view analytics ----------

// Cap how many raw view rows we pull for aggregation. A busy store over a year
// stays well under this; aggregation happens client-side from these rows.
const STORE_VIEWS_LIMIT = 10000;

// Guards against double-counting a single visit: React StrictMode double-invokes
// effects in dev, and a re-render can re-run the tracking effect. We drop repeat
// fires for the same shop+source within a short window; genuine later revisits
// (seconds/minutes apart) still count.
const recentViewFires = new Map<string, number>();
const VIEW_DEDUPE_MS = 3000;

/**
 * Record a store-page view / action. Fire-and-forget: it never blocks the UI and
 * never surfaces an error to the visitor (analytics must not break browsing). If
 * the store_views table hasn't been migrated yet, the insert simply no-ops.
 */
export function trackStoreView(shopId: string, source: StoreViewSource = 'store_page'): void {
  if (!shopId) return;
  const key = `${shopId}:${source}`;
  const now = Date.now();
  if (now - (recentViewFires.get(key) ?? 0) < VIEW_DEDUPE_MS) return;
  recentViewFires.set(key, now);
  void supabase
    .from('store_views')
    .insert({ shop_id: shopId, source })
    .then(
      () => {},
      () => {},
    );
}

/**
 * All recorded views for a shop (owner/admin only, enforced by RLS). Degrades to
 * an empty list on a pre-migration database so the dashboard still renders.
 */
export async function fetchStoreViews(shopId: string): Promise<StoreView[]> {
  const { data, error } = await supabase
    .from('store_views')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false })
    .limit(STORE_VIEWS_LIMIT);
  if (error) {
    // Table not created yet (migration pending) → treat as "no views yet".
    if (isMissingColumnError(error)) return [];
    throw error;
  }
  return (data as StoreViewRow[]).map(mapStoreView);
}

// ---------- Content moderation ----------

/** File a report against a product or shop. Open to anyone (incl. tourists). */
export async function reportContent(input: {
  targetType: 'product' | 'shop';
  targetId: string;
  reason: string;
  note?: string;
  reporterId?: string | null;
  reporterEmail?: string;
}): Promise<void> {
  const id =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `rep_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
  const { error } = await supabase.from('content_reports').insert({
    id,
    target_type: input.targetType,
    target_id: input.targetId,
    reason: input.reason,
    note: input.note ?? '',
    reporter_id: input.reporterId ?? null,
    reporter_email: input.reporterEmail ?? '',
  });
  if (error) throw error;
}

/** Admin: all reports (RLS restricts this to admins). */
export async function fetchReports(): Promise<ContentReport[]> {
  const { data, error } = await supabase
    .from('content_reports')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ContentReportRow[]).map(mapContentReport);
}

/** Admin: mark a report reviewed or dismissed. */
export async function resolveReport(
  id: string,
  status: 'reviewed' | 'dismissed',
): Promise<void> {
  const { error } = await supabase.from('content_reports').update({ status }).eq('id', id);
  if (error) throw error;
}

/** Admin: set a product's moderation state (guarded to admins in the DB). */
export async function setProductModeration(id: string, status: ModerationStatus): Promise<Product> {
  const { data, error } = await supabase
    .from('products')
    .update({ moderation_status: status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapProduct(data as ProductRow);
}

/** Admin: set a shop's moderation state (guarded to admins in the DB). */
export async function setShopModeration(id: string, status: ModerationStatus): Promise<Shop> {
  const { data, error } = await supabase
    .from('shops')
    .update({ moderation_status: status })
    .eq('id', id)
    .select('*')
    .single();
  if (error) throw error;
  return mapShop(data as ShopRow);
}

// ---------- Store reviews & profiles ----------

export async function fetchReviews(shopId: string): Promise<Review[]> {
  const { data, error } = await supabase
    .from('store_reviews')
    .select('*')
    .eq('shop_id', shopId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data as ReviewRow[]).map(mapReview);
}

/** Create or replace the signed-in user's review for a shop (one per user). */
export async function upsertReview(input: {
  shopId: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
}): Promise<void> {
  const { error } = await supabase.from('store_reviews').upsert(
    {
      id: `${input.shopId}_${input.userId}`,
      shop_id: input.shopId,
      user_id: input.userId,
      author_name: input.authorName,
      author_avatar: input.authorAvatar,
      rating: input.rating,
      comment: input.comment,
    },
    { onConflict: 'id' },
  );
  if (error) throw error;
}

export async function deleteReview(id: string): Promise<void> {
  const { error } = await supabase.from('store_reviews').delete().eq('id', id);
  if (error) throw error;
}

/** Public-safe profile (name/avatar/bio) — e.g. who runs a store. */
export async function fetchPublicProfile(id: string): Promise<PublicProfile | null> {
  const { data, error } = await supabase.from('public_profiles').select('*').eq('id', id).maybeSingle();
  if (error) throw error;
  return data ? mapPublicProfile(data) : null;
}

/** Update the signed-in user's own profile (name / bio / avatar). */
export async function updateMyProfile(
  id: string,
  fields: { fullName?: string; bio?: string; avatarUrl?: string },
): Promise<void> {
  const row: Record<string, string> = {};
  if (fields.fullName !== undefined) row.full_name = fields.fullName;
  if (fields.bio !== undefined) row.bio = fields.bio;
  if (fields.avatarUrl !== undefined) row.avatar_url = fields.avatarUrl;
  let { error } = await supabase.from('profiles').update(row).eq('id', id);
  // 'bio' is added by a later migration; retry without it on a pre-migration DB.
  if (error && isMissingColumnError(error)) {
    delete row.bio;
    ({ error } = await supabase.from('profiles').update(row).eq('id', id));
  }
  if (error) throw error;
}
