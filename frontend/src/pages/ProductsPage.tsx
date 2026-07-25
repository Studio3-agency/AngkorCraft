import React, { useState } from 'react';
import { Product, ProductCategory, Region } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { ProductCard } from '../components/ProductCard';
import { Search, Filter, RefreshCw, SlidersHorizontal, ShieldCheck, Sparkles, X } from 'lucide-react';

interface ProductsPageProps {
  products: Product[];
  onSelectProduct: (product: Product) => void;
  savedProductIds: string[];
  onToggleSave: (productId: string, e: React.MouseEvent) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  selectedCategory: ProductCategory;
  onSelectCategory: (category: ProductCategory) => void;
  filterShopId?: string | null;
  onClearShopFilter?: () => void;
}

export const ProductsPage: React.FC<ProductsPageProps> = ({
  products,
  onSelectProduct,
  savedProductIds,
  onToggleSave,
  searchQuery,
  onSearchChange,
  selectedCategory,
  onSelectCategory,
  filterShopId,
  onClearShopFilter
}) => {
  const { t, translateCategory, translateRegion } = useLanguage();

  const [selectedRegion, setSelectedRegion] = useState<Region>('All Regions');
  const [selectedPriceLevel, setSelectedPriceLevel] = useState<string>('All');
  const [isGiOnly, setIsGiOnly] = useState<boolean>(false);
  const [isHandmadeOnly, setIsHandmadeOnly] = useState<boolean>(false);
  const [mobileFilterOpen, setMobileFilterOpen] = useState<boolean>(false);

  const categories: ProductCategory[] = [
    'All',
    'Textiles & Silk',
    'Spices & Gourmet',
    'Silverware & Jewelry',
    'Woodwork & Carving',
    'Ceramics & Pottery',
    'Natural Skincare & Wellness'
  ];

  const regions: Region[] = [
    'All Regions',
    'Siem Reap',
    'Kampot',
    'Phnom Penh',
    'Battambang',
    'Mondulkiri',
    'Kampong Chhnang'
  ];

  // Filter products logic
  const filteredProducts = products.filter(product => {
    // Search query match
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const matchTitle = product.title.toLowerCase().includes(q);
      const matchDesc = product.description.toLowerCase().includes(q);
      const matchKhmer = product.khmerTitle.includes(q);
      const matchRegion = product.region.toLowerCase().includes(q);
      const matchCategory = product.category.toLowerCase().includes(q);
      const matchTag = product.tags.some(t => t.toLowerCase().includes(q));
      if (!matchTitle && !matchDesc && !matchKhmer && !matchRegion && !matchCategory && !matchTag) return false;
    }

    // Category match
    if (selectedCategory !== 'All' && product.category !== selectedCategory) return false;

    // Region match
    if (selectedRegion !== 'All Regions' && product.region !== selectedRegion) return false;

    // Price level match
    if (selectedPriceLevel !== 'All' && product.priceLevel !== selectedPriceLevel) return false;

    // GI certification filter
    if (isGiOnly && !product.isGiCertified) return false;

    // Handmade filter
    if (isHandmadeOnly && !product.isHandmade) return false;

    // Filter by specific shop if passed from shop card
    if (filterShopId && !product.storeIds.includes(filterShopId)) return false;

    return true;
  });

  const resetFilters = () => {
    onSearchChange('');
    onSelectCategory('All');
    setSelectedRegion('All Regions');
    setSelectedPriceLevel('All');
    setIsGiOnly(false);
    setIsHandmadeOnly(false);
    if (onClearShopFilter) onClearShopFilter();
  };

  const hasActiveFilters = 
    searchQuery || 
    selectedCategory !== 'All' || 
    selectedRegion !== 'All Regions' || 
    selectedPriceLevel !== 'All' || 
    isGiOnly || 
    isHandmadeOnly || 
    filterShopId;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#134E4A] text-white p-6 sm:p-8 rounded-3xl border border-[#D4AF37]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-[#D4AF37] uppercase tracking-[0.25em]">{t('productDirectory')}</span>
          <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white mt-1">
            {t('productDirectoryTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#F2EDE4]/80 mt-1 max-w-xl">
            {t('productDirectoryDesc')}
          </p>
        </div>

        <button
          onClick={() => setMobileFilterOpen(true)}
          className="lg:hidden bg-[#BF5A36] text-white px-5 py-3 rounded-full font-bold text-xs uppercase tracking-widest flex items-center gap-2 cursor-pointer shadow-md"
        >
          <SlidersHorizontal className="w-4 h-4" />
          <span>{t('filters')} ({filteredProducts.length})</span>
        </button>
      </div>

      {/* Main Content Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8 items-start">
        
        {/* DESKTOP SIDEBAR FILTERS */}
        <aside className="hidden lg:block bg-white p-6 rounded-3xl border border-[#E8DEC8] shadow-xs space-y-6 sticky top-24">
          <div className="flex items-center justify-between border-b border-[#134E4A]/10 pb-3">
            <h2 className="font-sans font-bold text-base text-[#134E4A] uppercase tracking-wider flex items-center gap-2">
              <Filter className="w-4 h-4 text-[#BF5A36]" />
              {t('filters')}
            </h2>
            {hasActiveFilters && (
              <button
                onClick={resetFilters}
                className="text-xs font-bold text-[#BF5A36] hover:underline flex items-center gap-1 cursor-pointer uppercase tracking-wider"
              >
                <RefreshCw className="w-3 h-3" />
                {t('reset')}
              </button>
            )}
          </div>

          {/* Search Field */}
          <div>
            <label className="block text-[10px] font-bold text-[#BF5A36] uppercase tracking-[0.2em] mb-1.5">
              {t('keywordSearch')}
            </label>
            <div className="relative">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#BF5A36]" />
              <input
                type="text"
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                className="w-full bg-[#F2EDE4] border border-[#134E4A]/10 rounded-full pl-9 pr-3 py-2 text-xs text-[#2D2926] placeholder:text-[#8C7A70] focus:outline-none focus:ring-2 focus:ring-[#BF5A36]"
              />
            </div>
          </div>

          {/* Category Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#BF5A36] uppercase tracking-[0.2em] mb-1.5">
              {t('category')}
            </label>
            <div className="space-y-1 text-xs">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => onSelectCategory(cat)}
                  className={`w-full text-left px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? 'bg-[#BF5A36] text-white font-bold shadow-xs'
                      : 'text-[#2D2926] hover:bg-[#F2EDE4]'
                  }`}
                >
                  {translateCategory(cat)}
                </button>
              ))}
            </div>
          </div>

          {/* Region Filter */}
          <div>
            <label className="block text-[10px] font-bold text-[#BF5A36] uppercase tracking-[0.2em] mb-1.5">
              {t('regionOfOrigin')}
            </label>
            <div className="space-y-1 text-xs">
              {regions.map((reg) => (
                <button
                  key={reg}
                  onClick={() => setSelectedRegion(reg)}
                  className={`w-full text-left px-3.5 py-2 rounded-full transition-all cursor-pointer ${
                    selectedRegion === reg
                      ? 'bg-[#134E4A] text-white font-bold shadow-xs'
                      : 'text-[#2D2926] hover:bg-[#F2EDE4]'
                  }`}
                >
                  {translateRegion(reg)}
                </button>
              ))}
            </div>
          </div>

          {/* Price Level */}
          <div>
            <label className="block text-[10px] font-bold text-[#BF5A36] uppercase tracking-[0.2em] mb-1.5">
              {t('priceLevel')}
            </label>
            <div className="grid grid-cols-4 gap-1.5 text-xs font-bold">
              {['All', '$', '$$', '$$$'].map((lvl) => (
                <button
                  key={lvl}
                  onClick={() => setSelectedPriceLevel(lvl)}
                  className={`py-1.5 rounded-full border transition-colors cursor-pointer ${
                    selectedPriceLevel === lvl
                      ? 'bg-[#134E4A] text-white border-[#134E4A]'
                      : 'bg-[#F2EDE4] text-[#2D2926] border-[#134E4A]/10 hover:bg-[#E8DEC8]'
                  }`}
                >
                  {lvl === 'All' ? translateRegion('All Regions').split(' ')[0] : lvl}
                </button>
              ))}
            </div>
          </div>

          {/* Authenticity Toggles */}
          <div className="space-y-2 pt-2 border-t border-[#134E4A]/10">
            <label className="flex items-center gap-2 text-xs font-medium text-[#2D2926] cursor-pointer">
              <input
                type="checkbox"
                checked={isGiOnly}
                onChange={(e) => setIsGiOnly(e.target.checked)}
                className="rounded border-[#BF5A36] text-[#BF5A36] focus:ring-[#BF5A36] w-4 h-4"
              />
              <span className="flex items-center gap-1 font-bold text-[#134E4A]">
                <ShieldCheck className="w-3.5 h-3.5 text-[#D4AF37]" />
                {t('giPgiOnly')}
              </span>
            </label>

            <label className="flex items-center gap-2 text-xs font-medium text-[#2D2926] cursor-pointer">
              <input
                type="checkbox"
                checked={isHandmadeOnly}
                onChange={(e) => setIsHandmadeOnly(e.target.checked)}
                className="rounded border-[#BF5A36] text-[#BF5A36] focus:ring-[#BF5A36] w-4 h-4"
              />
              <span className="flex items-center gap-1 font-bold text-[#BF5A36]">
                <Sparkles className="w-3.5 h-3.5" />
                {t('handmadeOnly')}
              </span>
            </label>
          </div>
        </aside>

        {/* PRODUCT GRID CONTAINER */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Active Filter Badges */}
          {hasActiveFilters && (
            <div className="bg-[#F2EDE4] p-3.5 rounded-2xl border border-[#134E4A]/10 flex flex-wrap items-center gap-2 text-xs">
              <span className="font-bold text-[#BF5A36] uppercase text-[10px] tracking-wider">{t('activeFilters')}:</span>

              {searchQuery && (
                <span className="bg-white px-3 py-1 rounded-full border border-[#134E4A]/10 text-[#2D2926] font-semibold flex items-center gap-1">
                  Search: "{searchQuery}"
                  <button onClick={() => onSearchChange('')} className="hover:text-[#BF5A36]"><X className="w-3 h-3" /></button>
                </span>
              )}

              {selectedCategory !== 'All' && (
                <span className="bg-white px-3 py-1 rounded-full border border-[#134E4A]/10 text-[#2D2926] font-semibold flex items-center gap-1">
                  {t('category')}: {translateCategory(selectedCategory)}
                  <button onClick={() => onSelectCategory('All')} className="hover:text-[#BF5A36]"><X className="w-3 h-3" /></button>
                </span>
              )}

              {selectedRegion !== 'All Regions' && (
                <span className="bg-white px-3 py-1 rounded-full border border-[#134E4A]/10 text-[#2D2926] font-semibold flex items-center gap-1">
                  {t('regionOfOrigin')}: {translateRegion(selectedRegion)}
                  <button onClick={() => setSelectedRegion('All Regions')} className="hover:text-[#BF5A36]"><X className="w-3 h-3" /></button>
                </span>
              )}

              {filterShopId && (
                <span className="bg-[#134E4A] text-white px-3 py-1 rounded-full font-semibold flex items-center gap-1">
                  Filtered by Specific Shop
                  {onClearShopFilter && (
                    <button onClick={onClearShopFilter} className="hover:text-[#D4AF37]"><X className="w-3 h-3" /></button>
                  )}
                </span>
              )}

              <button
                onClick={resetFilters}
                className="text-xs text-[#BF5A36] font-bold uppercase tracking-wider underline ml-auto hover:text-[#a34b2c] cursor-pointer"
              >
                {t('clearAll')}
              </button>
            </div>
          )}

          {/* Results Summary */}
          <div className="flex items-center justify-between text-xs text-[#5C4D44] font-semibold uppercase tracking-wider">
            <span>{t('showingCount').replace('{count}', filteredProducts.length.toString())}</span>
            <span>{t('sortedByPopularity')}</span>
          </div>

          {/* Grid */}
          {filteredProducts.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  isSaved={savedProductIds.includes(product.id)}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          ) : (
            <div className="bg-white p-12 rounded-3xl border border-[#E8DEC8] text-center space-y-4">
              <div className="w-16 h-16 bg-[#F2ECE1] text-[#BF5A36] rounded-full flex items-center justify-center mx-auto text-2xl font-sans">
                ?
              </div>
              <h3 className="font-sans font-bold text-xl text-[#2D2926]">
                {t('noProductsFound')}
              </h3>
              <p className="text-xs text-[#8C7A70] max-w-md mx-auto">
                {t('noProductsDesc')}
              </p>
              <button
                onClick={resetFilters}
                className="bg-[#BF5A36] text-white px-5 py-2.5 rounded-xl text-xs font-bold transition-colors hover:bg-[#a34b2c] cursor-pointer"
              >
                {t('reset')}
              </button>
            </div>
          )}

        </div>
      </div>

      {/* MOBILE FILTER MODAL DRAWER */}
      {mobileFilterOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex justify-end">
          <div className="bg-[#FAF7F2] w-full max-w-md h-full p-6 space-y-6 overflow-y-auto animate-in slide-in-from-right duration-200">
            <div className="flex items-center justify-between border-b border-[#E8DEC8] pb-4">
              <h2 className="font-sans font-bold text-lg text-[#2D2926]">{t('filters')}</h2>
              <button 
                onClick={() => setMobileFilterOpen(false)}
                className="p-1 text-[#2D2926] hover:bg-[#E8DEC8] rounded-xl"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Mobile Category */}
            <div>
              <label className="block text-xs font-bold text-[#8C7A70] uppercase mb-2">{t('category')}</label>
              <div className="grid grid-cols-1 gap-1 text-xs">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => onSelectCategory(cat)}
                    className={`text-left px-3 py-2 rounded-xl font-medium ${
                      selectedCategory === cat ? 'bg-[#BF5A36] text-white' : 'bg-[#F2EDE4] text-[#2D2926]'
                    }`}
                  >
                    {translateCategory(cat)}
                  </button>
                ))}
              </div>
            </div>

            {/* Mobile Region */}
            <div>
              <label className="block text-xs font-bold text-[#8C7A70] uppercase mb-2">{t('regionOfOrigin')}</label>
              <div className="grid grid-cols-2 gap-1.5 text-xs">
                {regions.map((reg) => (
                  <button
                    key={reg}
                    onClick={() => setSelectedRegion(reg)}
                    className={`text-left px-3 py-2 rounded-xl font-medium ${
                      selectedRegion === reg ? 'bg-[#134E4A] text-white' : 'bg-[#F2EDE4] text-[#2D2926]'
                    }`}
                  >
                    {translateRegion(reg)}
                  </button>
                ))}
              </div>
            </div>

            <button
              onClick={() => setMobileFilterOpen(false)}
              className="w-full bg-[#134E4A] text-white py-3 rounded-xl font-bold text-sm cursor-pointer"
            >
              Show {filteredProducts.length} Results
            </button>
          </div>
        </div>
      )}

    </div>
  );
};

