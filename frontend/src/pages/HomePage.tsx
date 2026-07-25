import React from 'react';
import { Product, Shop, PageType, ProductCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import { ShopCard } from '../components/ShopCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { Search, MapPin, ArrowRight, Compass, BookOpen, Banknote, Award } from 'lucide-react';

interface HomePageProps {
  products: Product[];
  shops: Shop[];
  onNavigate: (page: PageType) => void;
  onSelectProduct: (product: Product) => void;
  onSelectShopOnMap: (shop: Shop) => void;
  onViewShopProducts: (shopId: string) => void;
  savedProductIds: string[];
  onToggleSave: (productId: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  onOpenCurrencyConverter: () => void;
}

const CATEGORY_ICONS: { name: ProductCategory; icon: string }[] = [
  { name: 'Textiles & Silk', icon: '🧵' },
  { name: 'Spices & Gourmet', icon: '🌶️' },
  { name: 'Silverware & Jewelry', icon: '💎' },
  { name: 'Woodwork & Carving', icon: '🪵' },
  { name: 'Ceramics & Pottery', icon: '🏺' },
  { name: 'Natural Skincare & Wellness', icon: '🌿' },
];

export const HomePage: React.FC<HomePageProps> = ({
  products,
  shops,
  onNavigate,
  onSelectProduct,
  onSelectShopOnMap,
  onViewShopProducts,
  savedProductIds,
  onToggleSave,
  searchQuery,
  onSearchChange,
  onSelectCategory,
  onOpenCurrencyConverter,
}) => {
  const { t, translateCategory } = useLanguage();

  const featuredProducts = products.filter((p) => p.isFeatured || p.isPopular).slice(0, 4);
  const featuredShops = [...shops]
    .sort(
      (a, b) =>
        Number(b.isFeatured ?? false) - Number(a.isFeatured ?? false) ||
        Number(b.isVerified) - Number(a.isVerified) ||
        b.rating - a.rating,
    )
    .slice(0, 3);

  // Real category counts; only show categories that actually have products.
  const categories = CATEGORY_ICONS.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.name).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="space-y-10 sm:space-y-12 pb-8">
      {/* HERO — single clean panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative bg-[#FDF8F3] rounded-3xl border border-[#BF5A36]/15 shadow-lg overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#D4AF37]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#BF5A36]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#BF5A36]/10 border border-[#BF5A36]/20 rounded-full">
              <Compass className="w-3.5 h-3.5 text-[#BF5A36]" />
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#BF5A36]">
                {t('treasuresOfTheKingdom')}
              </span>
            </div>

            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] leading-tight text-[#134E4A] tracking-tight whitespace-normal lg:whitespace-nowrap">
              {t('discover')} <span className="italic text-[#BF5A36]">{t('authentic')}</span> {t('cambodia')}
            </h1>

            <p className="text-sm sm:text-base text-[#5C4D44] leading-relaxed max-w-2xl">{t('heroDesc')}</p>

            {/* Search */}
            <div className="relative w-full max-w-md shadow-md rounded-2xl overflow-hidden border border-[#BF5A36]/20 bg-white">
              <input
                type="text"
                placeholder={t('findSouvenirsPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && onNavigate('products')}
                className="w-full py-3.5 pl-5 pr-14 text-sm text-[#2D2926] focus:outline-none placeholder:text-[#8C7A70]"
              />
              <button
                onClick={() => onNavigate('products')}
                aria-label={t('search')}
                className="absolute right-2 top-2 bottom-2 px-4 bg-[#BF5A36] hover:bg-[#a34b2c] rounded-xl flex items-center justify-center text-white transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Popular category chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#134E4A]/60">{t('popularFilter')}</span>
              {(['Textiles & Silk', 'Spices & Gourmet', 'Silverware & Jewelry'] as ProductCategory[]).map((cat) => (
                <button
                  key={cat}
                  onClick={() => {
                    onSelectCategory(cat);
                    onNavigate('products');
                  }}
                  className="px-3 py-1.5 bg-[#F2EDE4] hover:bg-[#E8DEC8] rounded-full text-xs font-semibold text-[#134E4A] border border-[#134E4A]/10 transition-colors cursor-pointer"
                >
                  {translateCategory(cat)}
                </button>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
      {categories.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <SectionHeader
            eyebrow={t('exploreCrafts')}
            title={t('browseByHeritageCategory')}
            actionLabel={t('viewAll')}
            onAction={() => onNavigate('products')}
          />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {categories.map((cat) => (
              <button
                key={cat.name}
                onClick={() => {
                  onSelectCategory(cat.name);
                  onNavigate('products');
                }}
                className="group bg-white p-4 rounded-2xl border border-[#E8DEC8] hover:border-[#BF5A36] shadow-xs hover:shadow-md transition-all text-center space-y-1.5 cursor-pointer active:scale-95"
              >
                <div className="text-3xl group-hover:scale-110 transition-transform">{cat.icon}</div>
                <div className="font-sans font-bold text-xs text-[#2D2926] group-hover:text-[#BF5A36] transition-colors leading-tight">
                  {translateCategory(cat.name)}
                </div>
                <div className="text-[10px] text-[#8C7A70] font-semibold">
                  {cat.count} {t('authenticItems')}
                </div>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* POPULAR PRODUCTS */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
          <SectionHeader
            eyebrow={t('topTravelerFavorites')}
            eyebrowIcon={<Award className="w-4 h-4" />}
            title={t('popularAuthenticSouvenirs')}
            actionLabel={t('exploreAllDirectory')}
            onAction={() => onNavigate('products')}
          />
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-6">
            {featuredProducts.map((product) => (
              <ProductCard
                key={product.id}
                product={product}
                onSelectProduct={onSelectProduct}
                isSaved={savedProductIds.includes(product.id)}
                onToggleSave={onToggleSave}
              />
            ))}
          </div>
        </section>
      )}

      {/* FEATURED ARTISANS (data-driven — replaces the old hardcoded panel) */}
      {featuredShops.length > 0 && (
        <section className="bg-[#F2EDE4] py-10 sm:py-12 border-y border-[#134E4A]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <SectionHeader
              eyebrow={t('verifiedPhysicalLocations')}
              title={t('featuredLocalArtisans')}
              subtitle={t('featuredArtisansDesc')}
              actionLabel={t('interactiveShopDirectory')}
              onAction={() => onNavigate('locations')}
            />
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 sm:gap-6">
              {featuredShops.map((shop) => (
                <ShopCard
                  key={shop.id}
                  shop={shop}
                  onSelectShopOnMap={(s) => {
                    onSelectShopOnMap(s);
                    onNavigate('locations');
                  }}
                  onViewShopProducts={(sId) => {
                    onViewShopProducts(sId);
                    onNavigate('products');
                  }}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* MAP PREVIEW */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white p-4 sm:p-8 rounded-3xl border border-[#E8DEC8] shadow-sm space-y-5">
          <SectionHeader
            eyebrow={t('locationFinder')}
            eyebrowIcon={<Compass className="w-4 h-4" />}
            title={t('findAuthenticShopsNearYou')}
            subtitle={t('mapDirectionsDesc')}
            actionLabel={t('fullScreenInteractiveMap')}
            actionIcon={<MapPin className="w-4 h-4" />}
            onAction={() => onNavigate('locations')}
          />
          <InteractiveMap
            shops={shops}
            onSelectShop={(s) => {
              onSelectShopOnMap(s);
              onNavigate('locations');
            }}
            className="h-[300px] sm:h-[380px] w-full"
          />
        </div>
      </section>

      {/* TIPS + CURRENCY strip */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-[#134E4A] text-white p-6 sm:p-10 rounded-3xl border border-[#D4AF37]/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-[#D4AF37] text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-widest">
              {t('essentialTouristAdvice')}
            </span>
            <h2 className="font-sans font-bold text-xl sm:text-2xl text-white">{t('learnPhrasesTitle')}</h2>
            <p className="text-xs sm:text-sm text-[#F2EDE4]/80 max-w-xl">{t('learnPhrasesDesc')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('guide')}
              className="bg-[#BF5A36] hover:bg-[#a34b2c] text-white text-sm font-bold px-6 py-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('readBuyingGuide')}</span>
            </button>
            <button
              onClick={onOpenCurrencyConverter}
              className="bg-white/10 hover:bg-white/20 text-[#D4AF37] text-sm font-bold px-5 py-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#D4AF37]/40"
            >
              <Banknote className="w-4 h-4" />
              <span>{t('currencyCalcShort')}</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
};

/** Consistent section header used across the home page. */
const SectionHeader: React.FC<{
  eyebrow: string;
  eyebrowIcon?: React.ReactNode;
  title: string;
  subtitle?: string;
  actionLabel?: string;
  actionIcon?: React.ReactNode;
  onAction?: () => void;
}> = ({ eyebrow, eyebrowIcon, title, subtitle, actionLabel, actionIcon, onAction }) => (
  <div className="flex items-end justify-between gap-3 border-b border-[#BF5A36]/15 pb-3">
    <div className="min-w-0">
      <span className="text-[11px] font-bold text-[#BF5A36] uppercase tracking-[0.2em] flex items-center gap-1.5">
        {eyebrowIcon}
        {eyebrow}
      </span>
      <h2 className="font-sans font-bold text-xl sm:text-2xl lg:text-3xl text-[#134E4A] leading-tight">{title}</h2>
      {subtitle && <p className="text-xs text-[#5C4D44] mt-1 hidden sm:block">{subtitle}</p>}
    </div>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="shrink-0 text-xs font-bold text-[#134E4A] hover:text-[#BF5A36] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
      >
        <span className="hidden sm:inline">{actionLabel}</span>
        {actionIcon || <ArrowRight className="w-4 h-4" />}
      </button>
    )}
  </div>
);
