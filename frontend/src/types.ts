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
  createdAt?: string;
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

export type ShopStatus = 'pending' | 'approved' | 'rejected';
export type SubscriptionStatus = 'trial' | 'active' | 'inactive';

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
  rating: number;
  reviewCount: number;
  image: string;
  imagePublicId?: string | null;
  description: string;
  descriptionKh?: string | null;
  isVerified: boolean;
  featuredProductIds: string[];
  // --- Marketplace / platform fields (absent on static mock, present from Supabase) ---
  ownerId?: string | null;
  status?: ShopStatus;
  isFeatured?: boolean;
  featuredUntil?: string | null;
  subscriptionStatus?: SubscriptionStatus;
  subscriptionExpiresAt?: string | null;
  vertical?: string;
  createdAt?: string;
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
  category: 'Bargaining Etiquette' | 'Authenticity Guide' | 'Currency & ABA Pay' | 'Customs & Export' | 'Khmer Language';
  readTime: string;
  iconName: string;
  summary: string;
  content: string[];
  keyTips: string[];
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
