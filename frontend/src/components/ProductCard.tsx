import React from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../lib/localize';
import { MapPin, Heart, ShieldCheck, Sparkles, ChevronRight } from 'lucide-react';

interface ProductCardProps {
  product: Product;
  onSelectProduct: (product: Product) => void;
  isSaved: boolean;
  onToggleSave: (productId: string, e: React.MouseEvent) => void;
  shopCount?: number;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onSelectProduct,
  isSaved,
  onToggleSave,
  shopCount = 3
}) => {
  const { language, t, translateCategory, translateRegion } = useLanguage();

  return (
    <div 
      onClick={() => onSelectProduct(product)}
      className="group bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer hover:-translate-y-1"
    >
      {/* Thumbnail Header */}
      <div className="relative aspect-4/3 bg-[#F2ECE1] overflow-hidden">
        {product.image ? (
          <img 
            src={product.image} 
            alt={product.title || 'Unnamed Product'} 
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#134E4A]/30">
            <span className="text-sm font-bold uppercase tracking-wider">No Image</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
          {product.isGiCertified && (
            <span className="bg-[#134E4A] text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-[#F5C542]/30">
              <ShieldCheck className="w-3 h-3 text-[#F5C542]" />
              {t('giCertified')}
            </span>
          )}
          {product.isHandmade && (
            <span className="bg-[#FF914D] text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 text-white" />
              {t('handmade100')}
            </span>
          )}
        </div>

        {/* Region Tag */}
        <div className="absolute bottom-3 left-3 bg-[#134E4A]/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
          <MapPin className="w-3 h-3 text-[#F5C542]" />
          {product.region ? translateRegion(product.region) : 'Unknown Location'}
        </div>

        {/* Bookmark Heart Button */}
        <button
          onClick={(e) => onToggleSave(product.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
            isSaved 
              ? 'bg-[#FF914D] text-white shadow-md' 
              : 'bg-white/80 text-[#134E4A] hover:bg-white hover:scale-110'
          }`}
          title={isSaved ? 'Remove from Saved' : 'Save to Wishlist'}
        >
          <Heart className={`w-4 h-4 ${isSaved ? 'fill-white' : ''}`} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-center justify-between gap-2 mb-1.5">
            <span className="text-xs font-bold text-[#FF914D] uppercase tracking-[0.12em] bg-[#FF914D]/10 px-2.5 py-0.5 rounded-full truncate">
              {product.category ? translateCategory(product.category) : 'Uncategorized'}
            </span>
            <span className="text-xs font-bold text-[#134E4A] bg-[#134E4A]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {product.priceLevel || product.priceRange ? `${product.priceLevel || ''} ${product.priceRange ? `(${product.priceRange})` : ''}` : 'Price N/A'}
            </span>
          </div>

          <h3 className="font-sans font-bold text-base text-[#2D2926] group-hover:text-[#FF914D] transition-colors line-clamp-1">
            {language === 'kh' ? (product.khmerTitle || 'ទំនិញមិនមានឈ្មោះ') : (product.title || 'Unnamed Product')}
          </h3>

          <div className="text-xs text-[#134E4A]/70 font-sans mb-2 font-medium">
            {language === 'kh' ? (product.title || 'Unnamed Product') : (product.khmerTitle || 'ទំនិញមិនមានឈ្មោះ')}
          </div>

          <p className="text-xs text-[#5C4D44] line-clamp-2 leading-relaxed">
            {localized(product.description, product.descriptionKh, language) || <span className="italic opacity-60">No description provided.</span>}
          </p>
        </div>

        {/* Footer info: where to buy (ratings live on the store, not the item) */}
        <div className="pt-3 border-t border-[#134E4A]/10 flex items-center justify-end text-xs">
          <div className="flex items-center gap-1 text-[#FF914D] font-bold uppercase tracking-wider text-xs group-hover:translate-x-0.5 transition-transform">
            <span>{(product.storeIds && product.storeIds.length) || 0} {t('stores')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

