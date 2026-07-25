import React from 'react';
import { Product, Shop, PageType } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCurrency } from '../context/CurrencyContext';
import { ProductCard } from '../components/ProductCard';
import { InteractiveMap } from '../components/InteractiveMap';
import { Heart, MapPin, ShoppingBag, Trash2, Compass, ExternalLink } from 'lucide-react';

interface SavedPageProps {
  savedProductIds: string[];
  allProducts: Product[];
  allShops: Shop[];
  onNavigate: (page: PageType) => void;
  onSelectProduct: (product: Product) => void;
  onToggleSave: (productId: string, e: React.MouseEvent) => void;
  onSelectShopOnMap: (shop: Shop) => void;
  onClearSaved: () => void;
}

export const SavedPage: React.FC<SavedPageProps> = ({
  savedProductIds,
  allProducts,
  allShops,
  onNavigate,
  onSelectProduct,
  onToggleSave,
  onSelectShopOnMap,
  onClearSaved
}) => {
  const { t, language } = useLanguage();
  const { rate } = useCurrency();

  const savedProducts = allProducts.filter(p => savedProductIds.includes(p.id));

  // Collect all unique physical shops that carry these saved products
  const savedShopIds = Array.from(new Set(savedProducts.flatMap(p => p.storeIds)));
  const itineraryShops = allShops.filter(s => savedShopIds.includes(s.id));

  // Estimated budget calculation
  const totalBudgetUsd = savedProducts.reduce((sum, p) => sum + p.priceUsd, 0);
  const totalBudgetKhr = Math.round(totalBudgetUsd * rate);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Header Banner */}
      <div className="bg-[#134E4A] text-white p-6 sm:p-8 rounded-3xl border border-[#F5C542]/30 shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-xs font-bold text-[#F5C542] uppercase tracking-[0.25em]">
            <Heart className="w-4 h-4 fill-[#F5C542] text-[#F5C542]" />
            <span>{t('savedWishlistBadge')}</span>
          </div>
          <h1 className="font-sans font-bold text-2xl sm:text-4xl text-white mt-1">
            {t('savedWishlistTitle')}
          </h1>
          <p className="text-xs sm:text-sm text-[#F2EDE4]/80 mt-1 max-w-xl">
            {t('savedWishlistDesc')}
          </p>
        </div>

        {savedProducts.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-right space-y-1">
            <div className="text-xs uppercase tracking-wider text-[#FF914D] font-bold">{t('estimatedTotalBudget')}:</div>
            <div className="font-sans font-bold text-xl text-white">${totalBudgetUsd} USD</div>
            <div className="text-xs font-mono text-[#F2EDE4]/80">≈ {totalBudgetKhr.toLocaleString()} KHR</div>
          </div>
        )}
      </div>

      {savedProducts.length > 0 ? (
        <div className="space-y-10">
          
          {/* Wishlist Items Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#FF914D]/15 pb-3">
              <h2 className="font-sans font-bold text-xl text-[#134E4A]">
                {t('savedItems')}
              </h2>
              <button
                onClick={onClearSaved}
                className="text-xs font-bold text-[#FF914D] uppercase tracking-wider hover:underline flex items-center gap-1 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                {t('clearWishlist')}
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {savedProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onSelectProduct={onSelectProduct}
                  isSaved={true}
                  onToggleSave={onToggleSave}
                />
              ))}
            </div>
          </div>

          {/* Planned Market Visit Map Itinerary */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-[#E8DEC8] shadow-xs space-y-6">
            <div className="space-y-1">
              <span className="text-xs font-bold text-[#FF914D] uppercase tracking-[0.25em] flex items-center gap-1">
                <Compass className="w-4 h-4 text-[#FF914D]" />
                {t('marketItinerary')}
              </span>
              <h2 className="font-sans font-bold text-2xl text-[#134E4A]">
                {t('whereToBuySavedItems').replace('{count}', itineraryShops.length.toString())}
              </h2>
              <p className="text-xs text-[#5C4D44]">
                {t('wishlistDesc')}
              </p>
            </div>

            <InteractiveMap 
              shops={itineraryShops} 
              onSelectShop={onSelectShopOnMap}
              className="h-[400px] w-full"
            />

            {/* List of Shops */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-[#134E4A]/10">
              {itineraryShops.map(shop => (
                <div key={shop.id} className="bg-[#F2EDE4] p-4 rounded-2xl border border-[#134E4A]/10 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-sans font-bold text-sm text-[#2D2926]">{language === 'kh' ? shop.khmerName : shop.name}</span>
                    <span className="text-xs bg-[#134E4A] text-white px-2.5 py-0.5 rounded-full font-bold uppercase tracking-wider">{shop.city}</span>
                  </div>
                  <div className="text-xs text-[#5C4D44] line-clamp-1">{shop.address}</div>
                  <div className="text-xs text-[#8C7A70]">{shop.openingHours}</div>
                  <a
                    href={shop.googleMapsUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-bold text-[#FF914D] hover:underline pt-1 uppercase tracking-wider"
                  >
                    <span>{t('openGoogleMapsDirections')}</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              ))}
            </div>
          </div>

        </div>
      ) : (
        <div className="bg-white p-12 rounded-3xl border border-[#E8DEC8] text-center space-y-4 my-8">
          <div className="w-16 h-16 bg-[#F2EDE4] text-[#FF914D] rounded-full flex items-center justify-center mx-auto text-2xl font-sans">
            <Heart className="w-8 h-8 text-[#FF914D]" />
          </div>
          <h2 className="font-sans font-bold text-2xl text-[#134E4A]">
            {t('wishlistEmptyTitle')}
          </h2>
          <p className="text-xs sm:text-sm text-[#5C4D44] max-w-md mx-auto">
            {t('wishlistEmptyDesc')}
          </p>
          <button
            onClick={() => onNavigate('products')}
            className="bg-[#FF914D] hover:bg-[#F07A33] text-white px-6 py-3 rounded-full font-bold text-xs uppercase tracking-widest transition-all cursor-pointer inline-flex items-center gap-2 shadow-md"
          >
            <ShoppingBag className="w-4 h-4" />
            <span>{t('browseCatalog')}</span>
          </button>
        </div>
      )}

    </div>
  );
};

