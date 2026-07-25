import {
  Product,
  Shop,
  Profile,
  Transaction,
  PosSale,
  UserRole,
  ShopStatus,
  SubscriptionStatus,
  ContentReport,
  Review,
  PublicProfile,
} from '../types';

/**
 * Raw row shapes as stored in Supabase (snake_case). These mirror the columns
 * created in backend/supabase/schema.sql. Keep them in sync with that file.
 */
export interface ShopRow {
  id: string;
  owner_id: string | null;
  name: string;
  khmer_name: string;
  type: Shop['type'];
  region: Shop['region'];
  city: string;
  address: string;
  lat: number;
  lng: number;
  opening_hours: string;
  payment_methods: Shop['paymentMethods'];
  phone: string;
  google_maps_url: string;
  instagram: string;
  telegram: string;
  wechat: string;
  messenger: string;
  facebook: string;
  tiktok: string;
  whatsapp: string;
  website: string;
  email: string;
  contact_note: string;
  slug: string | null;
  rating: number;
  review_count: number;
  image_url: string;
  image_public_id: string | null;
  description: string;
  description_kh: string | null;
  is_verified: boolean;
  featured_product_ids: string[];
  status: ShopStatus;
  moderation_status: Shop['moderationStatus'];
  is_featured: boolean;
  featured_until: string | null;
  subscription_status: SubscriptionStatus;
  subscription_expires_at: string | null;
  vertical: string;
  created_at: string;
}

export interface ProductRow {
  id: string;
  owner_id: string | null;
  owner_shop_id: string | null;
  title: string;
  khmer_title: string;
  category: Product['category'];
  region: Product['region'];
  price_usd: number;
  price_range: string;
  price_level: Product['priceLevel'];
  rating: number;
  review_count: number;
  image_url: string;
  image_public_id: string | null;
  description: string;
  description_kh: string | null;
  cultural_story: string;
  cultural_story_kh: string | null;
  store_ids: string[];
  authentic_tips: string[];
  tags: string[];
  is_gi_certified: boolean;
  is_handmade: boolean;
  artisan_group: string;
  material: string;
  is_popular: boolean;
  is_featured: boolean;
  moderation_status: Product['moderationStatus'];
  vertical: string;
  created_at: string;
}

export interface ProfileRow {
  id: string;
  role: UserRole;
  full_name: string | null;
  phone: string | null;
  avatar_url: string | null;
  created_at: string;
}

// ---------- Row -> App type ----------

export function mapShop(row: ShopRow): Shop {
  return {
    id: row.id,
    name: row.name,
    khmerName: row.khmer_name,
    type: row.type,
    region: row.region,
    city: row.city,
    address: row.address,
    lat: row.lat,
    lng: row.lng,
    openingHours: row.opening_hours,
    paymentMethods: row.payment_methods ?? [],
    phone: row.phone,
    googleMapsUrl: row.google_maps_url,
    instagram: row.instagram ?? '',
    telegram: row.telegram ?? '',
    wechat: row.wechat ?? '',
    messenger: row.messenger ?? '',
    facebook: row.facebook ?? '',
    tiktok: row.tiktok ?? '',
    whatsapp: row.whatsapp ?? '',
    website: row.website ?? '',
    email: row.email ?? '',
    contactNote: row.contact_note ?? '',
    slug: row.slug ?? undefined,
    rating: row.rating,
    reviewCount: row.review_count,
    image: row.image_url,
    imagePublicId: row.image_public_id,
    description: row.description,
    descriptionKh: row.description_kh,
    isVerified: row.is_verified,
    featuredProductIds: row.featured_product_ids ?? [],
    moderationStatus: row.moderation_status ?? 'approved',
    ownerId: row.owner_id,
    status: row.status,
    isFeatured: row.is_featured,
    featuredUntil: row.featured_until,
    subscriptionStatus: row.subscription_status,
    subscriptionExpiresAt: row.subscription_expires_at,
    vertical: row.vertical,
    createdAt: row.created_at,
  };
}

export function mapProduct(row: ProductRow): Product {
  return {
    id: row.id,
    title: row.title,
    khmerTitle: row.khmer_title,
    category: row.category,
    region: row.region,
    priceUsd: row.price_usd,
    priceRange: row.price_range,
    priceLevel: row.price_level,
    rating: row.rating,
    reviewCount: row.review_count,
    image: row.image_url,
    imagePublicId: row.image_public_id,
    description: row.description,
    descriptionKh: row.description_kh,
    culturalStory: row.cultural_story,
    culturalStoryKh: row.cultural_story_kh,
    storeIds: row.store_ids ?? [],
    authenticTips: row.authentic_tips ?? [],
    tags: row.tags ?? [],
    isGiCertified: row.is_gi_certified,
    isHandmade: row.is_handmade,
    artisanGroup: row.artisan_group,
    material: row.material,
    isPopular: row.is_popular,
    isFeatured: row.is_featured,
    moderationStatus: row.moderation_status ?? 'approved',
    ownerId: row.owner_id,
    ownerShopId: row.owner_shop_id,
    vertical: row.vertical,
    createdAt: row.created_at,
  };
}

export function mapProfile(row: ProfileRow & { bio?: string | null }): Profile {
  return {
    id: row.id,
    role: row.role,
    fullName: row.full_name,
    phone: row.phone,
    avatarUrl: row.avatar_url,
    bio: row.bio ?? '',
    createdAt: row.created_at,
  };
}

export interface ReviewRow {
  id: string;
  shop_id: string;
  user_id: string;
  author_name: string | null;
  author_avatar: string | null;
  rating: number;
  comment: string | null;
  created_at: string;
}

export function mapReview(row: ReviewRow): Review {
  return {
    id: row.id,
    shopId: row.shop_id,
    userId: row.user_id,
    authorName: row.author_name ?? '',
    authorAvatar: row.author_avatar ?? '',
    rating: row.rating,
    comment: row.comment ?? '',
    createdAt: row.created_at,
  };
}

export function mapPublicProfile(row: {
  id: string;
  full_name: string | null;
  avatar_url: string | null;
  bio: string | null;
}): PublicProfile {
  return { id: row.id, fullName: row.full_name, avatarUrl: row.avatar_url, bio: row.bio };
}

// ---------- App type -> Row (for inserts/updates) ----------

export function shopToRow(shop: Partial<Shop>): Partial<ShopRow> {
  const row: Partial<ShopRow> = {};
  if (shop.id !== undefined) row.id = shop.id;
  if (shop.ownerId !== undefined) row.owner_id = shop.ownerId;
  if (shop.name !== undefined) row.name = shop.name;
  if (shop.khmerName !== undefined) row.khmer_name = shop.khmerName;
  if (shop.type !== undefined) row.type = shop.type;
  if (shop.region !== undefined) row.region = shop.region;
  if (shop.city !== undefined) row.city = shop.city;
  if (shop.address !== undefined) row.address = shop.address;
  if (shop.lat !== undefined) row.lat = shop.lat;
  if (shop.lng !== undefined) row.lng = shop.lng;
  if (shop.openingHours !== undefined) row.opening_hours = shop.openingHours;
  if (shop.paymentMethods !== undefined) row.payment_methods = shop.paymentMethods;
  if (shop.phone !== undefined) row.phone = shop.phone;
  if (shop.googleMapsUrl !== undefined) row.google_maps_url = shop.googleMapsUrl;
  if (shop.instagram !== undefined) row.instagram = shop.instagram;
  if (shop.telegram !== undefined) row.telegram = shop.telegram;
  if (shop.wechat !== undefined) row.wechat = shop.wechat;
  if (shop.messenger !== undefined) row.messenger = shop.messenger;
  if (shop.facebook !== undefined) row.facebook = shop.facebook;
  if (shop.tiktok !== undefined) row.tiktok = shop.tiktok;
  if (shop.whatsapp !== undefined) row.whatsapp = shop.whatsapp;
  if (shop.website !== undefined) row.website = shop.website;
  if (shop.email !== undefined) row.email = shop.email;
  if (shop.contactNote !== undefined) row.contact_note = shop.contactNote;
  if (shop.slug !== undefined) row.slug = shop.slug;
  if (shop.rating !== undefined) row.rating = shop.rating;
  if (shop.reviewCount !== undefined) row.review_count = shop.reviewCount;
  if (shop.image !== undefined) row.image_url = shop.image;
  if (shop.imagePublicId !== undefined) row.image_public_id = shop.imagePublicId;
  if (shop.description !== undefined) row.description = shop.description;
  if (shop.descriptionKh !== undefined) row.description_kh = shop.descriptionKh;
  if (shop.isVerified !== undefined) row.is_verified = shop.isVerified;
  if (shop.featuredProductIds !== undefined) row.featured_product_ids = shop.featuredProductIds;
  if (shop.status !== undefined) row.status = shop.status;
  if (shop.isFeatured !== undefined) row.is_featured = shop.isFeatured;
  if (shop.featuredUntil !== undefined) row.featured_until = shop.featuredUntil;
  if (shop.subscriptionStatus !== undefined) row.subscription_status = shop.subscriptionStatus;
  if (shop.subscriptionExpiresAt !== undefined) row.subscription_expires_at = shop.subscriptionExpiresAt;
  if (shop.vertical !== undefined) row.vertical = shop.vertical;
  return row;
}

export function productToRow(product: Partial<Product>): Partial<ProductRow> {
  const row: Partial<ProductRow> = {};
  if (product.id !== undefined) row.id = product.id;
  if (product.ownerId !== undefined) row.owner_id = product.ownerId;
  if (product.ownerShopId !== undefined) row.owner_shop_id = product.ownerShopId;
  if (product.title !== undefined) row.title = product.title;
  if (product.khmerTitle !== undefined) row.khmer_title = product.khmerTitle;
  if (product.category !== undefined) row.category = product.category;
  if (product.region !== undefined) row.region = product.region;
  if (product.priceUsd !== undefined) row.price_usd = product.priceUsd;
  if (product.priceRange !== undefined) row.price_range = product.priceRange;
  if (product.priceLevel !== undefined) row.price_level = product.priceLevel;
  if (product.rating !== undefined) row.rating = product.rating;
  if (product.reviewCount !== undefined) row.review_count = product.reviewCount;
  if (product.image !== undefined) row.image_url = product.image;
  if (product.imagePublicId !== undefined) row.image_public_id = product.imagePublicId;
  if (product.description !== undefined) row.description = product.description;
  if (product.descriptionKh !== undefined) row.description_kh = product.descriptionKh;
  if (product.culturalStory !== undefined) row.cultural_story = product.culturalStory;
  if (product.culturalStoryKh !== undefined) row.cultural_story_kh = product.culturalStoryKh;
  if (product.storeIds !== undefined) row.store_ids = product.storeIds;
  if (product.authenticTips !== undefined) row.authentic_tips = product.authenticTips;
  if (product.tags !== undefined) row.tags = product.tags;
  if (product.isGiCertified !== undefined) row.is_gi_certified = product.isGiCertified;
  if (product.isHandmade !== undefined) row.is_handmade = product.isHandmade;
  if (product.artisanGroup !== undefined) row.artisan_group = product.artisanGroup;
  if (product.material !== undefined) row.material = product.material;
  if (product.isPopular !== undefined) row.is_popular = product.isPopular;
  if (product.isFeatured !== undefined) row.is_featured = product.isFeatured;
  if (product.vertical !== undefined) row.vertical = product.vertical;
  return row;
}

export interface ContentReportRow {
  id: string;
  target_type: 'product' | 'shop';
  target_id: string;
  reason: string;
  note: string | null;
  reporter_id: string | null;
  reporter_email: string | null;
  status: ContentReport['status'];
  created_at: string;
}

export function mapContentReport(row: ContentReportRow): ContentReport {
  return {
    id: row.id,
    targetType: row.target_type,
    targetId: row.target_id,
    reason: row.reason,
    note: row.note ?? '',
    reporterId: row.reporter_id,
    reporterEmail: row.reporter_email ?? '',
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapTransaction(row: {
  id: string;
  shop_id: string;
  type: Transaction['type'];
  amount_usd: number;
  status: string;
  created_at: string;
}): Transaction {
  return {
    id: row.id,
    shopId: row.shop_id,
    type: row.type,
    amountUsd: row.amount_usd,
    status: row.status,
    createdAt: row.created_at,
  };
}

export function mapPosSale(row: {
  id: string;
  shop_id: string;
  items: PosSale['items'];
  total_usd: number;
  payment_method: string;
  created_at: string;
}): PosSale {
  return {
    id: row.id,
    shopId: row.shop_id,
    items: row.items ?? [],
    totalUsd: row.total_usd,
    paymentMethod: row.payment_method,
    createdAt: row.created_at,
  };
}
