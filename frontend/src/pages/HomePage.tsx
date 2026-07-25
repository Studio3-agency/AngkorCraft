import React from 'react';
import { Product, Shop, PageType, ProductCategory } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import { ShopCard } from '../components/ShopCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { featuredShops } from '../lib/shops';
import { useUserLocation } from '../hooks/useUserLocation';
import { motion } from 'motion/react';
import { Search, MapPin, ArrowRight, Compass, BookOpen, Banknote, Award, Shirt, Utensils, Gem, TreePine, Amphora, Leaf } from 'lucide-react';

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

const CATEGORY_ICONS: { name: ProductCategory; Icon: React.ComponentType<{ className?: string }> }[] = [
  { name: 'Textiles & Silk', Icon: Shirt },
  { name: 'Spices & Gourmet', Icon: Utensils },
  { name: 'Silverware & Jewelry', Icon: Gem },
  { name: 'Woodwork & Carving', Icon: TreePine },
  { name: 'Ceramics & Pottery', Icon: Amphora },
  { name: 'Natural Skincare & Wellness', Icon: Leaf },
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
  const { location: userLocation, request: locateUser } = useUserLocation();

  const featuredProducts = products.filter((p) => p.isFeatured || p.isPopular).slice(0, 4);
  // Only actively-boosted shops are featured, ranked by popularity. Up to 12
  // fills a 3-column × 4-row grid.
  const featured = featuredShops(shops, 12);

  // Real category counts; only show categories that actually have products.
  const categories = CATEGORY_ICONS.map((c) => ({
    ...c,
    count: products.filter((p) => p.category === c.name).length,
  })).filter((c) => c.count > 0);

  return (
    <div className="space-y-10 sm:space-y-12 pb-8">
      {/* HERO — single clean panel */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 sm:pt-6">
        <div className="relative bg-[#FDF8F3] rounded-3xl border border-[#FF914D]/15 shadow-lg overflow-hidden px-6 py-10 sm:px-12 sm:py-14">
          <div className="absolute -top-10 -left-10 w-64 h-64 bg-[#FF914D]/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 right-0 w-80 h-80 bg-[#FF914D]/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 max-w-4xl space-y-5">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF914D]/10 border border-[#FF914D]/20 rounded-full">
              <Compass className="w-3.5 h-3.5 text-[#FF914D]" />
              <span className="text-xs font-bold uppercase tracking-[0.2em] text-[#FF914D]">
                {t('treasuresOfTheKingdom')}
              </span>
            </div>

            <h1 className="font-extrabold text-4xl sm:text-5xl lg:text-[3.25rem] xl:text-[3.5rem] leading-tight text-[#134E4A] tracking-tight whitespace-normal lg:whitespace-nowrap">
              {t('discover')} <span className="italic text-[#FF914D]">{t('authentic')}</span> {t('cambodia')}
            </h1>

            <p className="text-sm sm:text-base text-[#5C4D44] leading-relaxed max-w-2xl">{t('heroDesc')}</p>

            {/* Search */}
            <div className="relative w-full max-w-md shadow-md rounded-2xl overflow-hidden border border-[#FF914D]/20 bg-white">
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
                className="absolute right-2 top-2 bottom-2 px-4 bg-[#FF914D] hover:bg-[#F07A33] rounded-xl flex items-center justify-center text-white transition-all cursor-pointer"
              >
                <Search className="w-4 h-4" />
              </button>
            </div>

            {/* Popular category chips */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-xs font-bold uppercase tracking-widest text-[#134E4A]/60">{t('popularFilter')}</span>
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
                className="group bg-white p-4 rounded-2xl border border-[#E8DEC8] hover:border-[#FF914D] shadow-xs hover:shadow-md transition-all text-center space-y-1.5 cursor-pointer active:scale-95"
              >
                <div className="w-12 h-12 mx-auto rounded-xl bg-[#FF914D]/10 flex items-center justify-center group-hover:scale-110 group-hover:bg-[#FF914D]/15 transition-all">
                  <cat.Icon className="w-6 h-6 text-[#FF914D]" />
                </div>
                <div className="font-sans font-bold text-xs text-[#2D2926] group-hover:text-[#FF914D] transition-colors leading-tight">
                  {translateCategory(cat.name)}
                </div>
                <div className="text-xs text-[#8C7A70] font-semibold">
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
      {featured.length > 0 && (
        <section className="bg-[#F2EDE4] py-10 sm:py-12 border-y border-[#134E4A]/10">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-5">
            <SectionHeader
              eyebrow={t('verifiedPhysicalLocations')}
              title={t('featuredLocalArtisans')}
              subtitle={t('featuredArtisansDesc')}
              actionLabel={t('interactiveShopDirectory')}
              onAction={() => onNavigate('locations')}
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
              {featured.map((shop, i) => (
                <motion.div
                  key={shop.id}
                  className="h-full"
                  initial={{ opacity: 0, y: 24 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, margin: '-40px' }}
                  transition={{ duration: 0.4, delay: Math.min(i * 0.08, 0.4), ease: 'easeOut' }}
                >
                  <ShopCard
                    shop={shop}
                    layout="grid"
                    onSelectShopOnMap={(s) => {
                      onSelectShopOnMap(s);
                      onNavigate('locations');
                    }}
                    onViewShopProducts={(sId) => {
                      onViewShopProducts(sId);
                      onNavigate('products');
                    }}
                  />
                </motion.div>
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
            userLocation={userLocation}
            onLocate={locateUser}
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
        <div className="bg-[#134E4A] text-white p-6 sm:p-10 rounded-3xl border border-[#F5C542]/30 shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div className="space-y-2 text-center md:text-left">
            <span className="bg-[#FFC107] text-[#2D2926] text-xs font-bold px-3 py-1 rounded-full uppercase tracking-widest shadow-sm">
              {t('essentialTouristAdvice')}
            </span>
            <h2 className="font-sans font-bold text-xl sm:text-2xl text-white">{t('learnPhrasesTitle')}</h2>
            <p className="text-xs sm:text-sm text-[#F2EDE4]/80 max-w-xl">{t('learnPhrasesDesc')}</p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto shrink-0">
            <button
              onClick={() => onNavigate('guide')}
              className="bg-[#FF914D] hover:bg-[#F07A33] text-white text-sm font-bold px-6 py-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>{t('readBuyingGuide')}</span>
            </button>
            <button
              onClick={onOpenCurrencyConverter}
              className="bg-white/10 hover:bg-white/20 text-[#F5C542] text-sm font-bold px-5 py-3 rounded-full transition-all cursor-pointer flex items-center justify-center gap-2 border border-[#F5C542]/40"
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
  <div className="flex items-end justify-between gap-3 border-b border-[#FF914D]/15 pb-3">
    <div className="min-w-0">
      <span className="text-xs font-bold text-[#FF914D] uppercase tracking-[0.2em] flex items-center gap-1.5">
        {eyebrowIcon}
        {eyebrow}
      </span>
      <h2 className="font-heading font-extrabold text-xl sm:text-2xl lg:text-3xl text-[#134E4A] leading-tight">{title}</h2>
      {subtitle && <p className="text-xs text-[#5C4D44] mt-1 hidden sm:block">{subtitle}</p>}
    </div>
    {actionLabel && onAction && (
      <button
        onClick={onAction}
        className="shrink-0 text-xs font-bold text-[#134E4A] hover:text-[#FF914D] flex items-center gap-1 transition-colors cursor-pointer whitespace-nowrap"
      >
        <span className="hidden sm:inline">{actionLabel}</span>
        {actionIcon || <ArrowRight className="w-4 h-4" />}
      </button>
    )}
  </div>
);
