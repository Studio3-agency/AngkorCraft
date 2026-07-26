export type PageType = 'home' | 'products' | 'locations' | 'product-detail' | 'guide' | 'saved';

export type ProductCategory = 
  | 'All'
  | 'Textiles & Silk'
  | 'Spices & Gourmet'
  | 'Silverware & Jewelry'
  | 'Woodwork & Carving'
  | 'Ceramics & Pottery'
  | 'Natural Skincare & Wellness';

export type Region = 
  | 'All Regions'
  | 'Siem Reap'
  | 'Kampot'
  | 'Phnom Penh'
  | 'Battambang'
  | 'Mondulkiri'
  | 'Kampong Chhnang'
  | 'Takeo';

export interface Product {
  id: string;
  title: string;
  khmerTitle: string;
  category: ProductCategory;
  region: Region;
  priceUsd: number;
  priceRange: string;
  priceLevel: '$' | '$$' | '$$$';
  rating: number;
  reviewCount: number;
  image: string;
  description: string;
  descriptionKh?: string | null;
  culturalStory: string;
  culturalStoryKh?: string | null;
  storeIds: string[];
  authenticTips: string[];
  tags: string[];
  isGiCertified?: boolean;
  isHandmade?: boolean;
  artisanGroup: string;
  material: string;
  isPopular?: boolean;
  isFeatured?: boolean;
  // --- Marketplace / platform fields ---
  ownerId?: string | null;
  ownerShopId?: string | null;
  imagePublicId?: string | null;
  moderationStatus?: ModerationStatus;
  vertical?: string;
  createdAt?: string;
}

// --- Accounts / auth ---
export type UserRole = 'customer' | 'merchant' | 'admin';

export interface Profile {
  id: string;
  role: UserRole;
  fullName: string | null;
  phone: string | null;
  avatarUrl: string | null;
  bio?: string | null;
  createdAt?: string;
}

/** A public-safe subset of a profile (name + avatar + bio only). */
export interface PublicProfile {
  id: string;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
}

/** A shopper's rating + comment on a store. */
export interface Review {
  id: string;
  shopId: string;
  userId: string;
  authorName: string;
  authorAvatar: string;
  rating: number;
  comment: string;
  createdAt: string;
}

// --- Simulated commerce (merchant portal) ---
export type TransactionType = 'subscription' | 'boost';

export interface Transaction {
  id: string;
  shopId: string;
  type: TransactionType;
  amountUsd: number;
  status: string;
  createdAt: string;
}

export interface PosSale {
  id: string;
  shopId: string;
  items: { name: string; qty: number; priceUsd: number }[];
  totalUsd: number;
  paymentMethod: string;
  createdAt: string;
}

/** What a visitor did on a store page — the unit behind view analytics. */
export type StoreViewSource = 'store_page' | 'directions' | 'contact';

/** A single recorded visit to a store page (one row per open / action). */
export interface StoreView {
  id: string;
  shopId: string;
  source: StoreViewSource;
  createdAt: string;
}

export type ShopStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionStatus = 'trial' | 'active' | 'inactive';
export type ModerationStatus = 'approved' | 'pending' | 'flagged' | 'removed';

/** A shopper-submitted report against a product or shop. */
export interface ContentReport {
  id: string;
  targetType: 'product' | 'shop';
  targetId: string;
  reason: string;
  note: string;
  reporterId?: string | null;
  reporterEmail?: string;
  status: 'open' | 'reviewed' | 'dismissed';
  createdAt: string;
}

export interface Shop {
  id: string;
  name: string;
  khmerName: string;
  type: 'Night Market' | 'Artisan Workshop' | 'Social Enterprise' | 'Organic Farm' | 'Craft Co-op' | 'Traditional Market';
  region: Region;
  city: string;
  address: string;
  lat: number;
  lng: number;
  openingHours: string;
  paymentMethods: ('ABA Pay' | 'Cash (USD/KHR)' | 'Credit Card' | 'Bakong QR')[];
  phone: string;
  googleMapsUrl: string;
  // --- Contact / social channels (all optional, merchant-entered) ---
  instagram?: string;
  telegram?: string;
  wechat?: string;
  messenger?: string;
  facebook?: string;
  tiktok?: string;
  whatsapp?: string;
  website?: string;
  email?: string;
  contactNote?: string;
  rating: number;
  reviewCount: number;
  image: string;
  imagePublicId?: string | null;
  description: string;
  descriptionKh?: string | null;
  isVerified: boolean;
  featuredProductIds: string[];
  /** URL slug for the shareable store page (/shop/:slug). */
  slug?: string;
  moderationStatus?: ModerationStatus;
  // --- Marketplace / platform fields (absent on static mock, present from Supabase) ---
  ownerId?: string | null;
  status?: ShopStatus;
  isFeatured?: boolean;
  featuredUntil?: string | null;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionExpiresAt?: string | null;
  vertical?: string;
  createdAt?: string;
  /** Public total of store-page views (denormalized, incremented by the DB). */
  viewCount?: number;
  /** If set, this store is a BRANCH of the referenced store (shared brand). */
  parentShopId?: string | null;
}

export interface KhmerPhrase {
  english: string;
  khmer: string;
  phonetic: string;
  context: string;
}

export interface GuideArticle {
  id: string;
  title: string;
  titleKh?: string;
  category: 'Bargaining Etiquette' | 'Authenticity Guide' | 'Currency & ABA Pay' | 'Customs & Export' | 'Khmer Language';
  readTime: string;
  iconName: string;
  summary: string;
  summaryKh?: string;
  content: string[];
  contentKh?: string[];
  keyTips: string[];
  keyTipsKh?: string[];
  phrases?: KhmerPhrase[];
}

export interface FilterState {
  searchQuery: string;
  category: ProductCategory;
  region: Region;
  priceLevel: string;
  isGiOnly: boolean;
  isHandmadeOnly: boolean;
}
