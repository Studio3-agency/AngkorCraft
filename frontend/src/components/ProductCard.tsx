import React from 'react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../lib/localize';
import { MapPin, Heart, ShieldCheck, Sparkles, Star, ChevronRight } from 'lucide-react';

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
        <img 
          src={product.image} 
          alt={product.title} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10 max-w-[80%]">
          {product.isGiCertified && (
            <span className="bg-[#134E4A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-[#D4AF37]/30">
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
              {t('giCertified')}
            </span>
          )}
          {product.isHandmade && (
            <span className="bg-[#D4AF37] text-black text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Sparkles className="w-3 h-3 text-black" />
              {t('handmade100')}
            </span>
          )}
        </div>

        {/* Region Tag */}
        <div className="absolute bottom-3 left-3 bg-[#134E4A]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
          <MapPin className="w-3 h-3 text-[#D4AF37]" />
          {translateRegion(product.region)}
        </div>

        {/* Bookmark Heart Button */}
        <button
          onClick={(e) => onToggleSave(product.id, e)}
          className={`absolute top-3 right-3 p-2 rounded-full backdrop-blur-md transition-all z-10 cursor-pointer ${
            isSaved 
              ? 'bg-[#BF5A36] text-white shadow-md' 
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
          <div className="flex items-baseline justify-between gap-2 mb-1">
            <span className="text-[10px] font-bold text-[#BF5A36] uppercase tracking-[0.2em]">
              {translateCategory(product.category)}
            </span>
            <span className="text-[10px] font-bold text-[#134E4A] bg-[#134E4A]/10 px-2 py-0.5 rounded-full uppercase tracking-wider">
              {product.priceLevel} ({product.priceRange})
            </span>
          </div>

          <h3 className="font-sans font-bold text-base text-[#2D2926] group-hover:text-[#BF5A36] transition-colors line-clamp-1">
            {language === 'kh' ? product.khmerTitle : product.title}
          </h3>

          <div className="text-xs text-[#134E4A]/70 font-sans mb-2 font-medium">
            {language === 'kh' ? product.title : product.khmerTitle}
          </div>

          <p className="text-xs text-[#5C4D44] line-clamp-2 leading-relaxed">
            {localized(product.description, product.descriptionKh, language)}
          </p>
        </div>

        {/* Footer info: Rating & Store Locations count */}
        <div className="pt-3 border-t border-[#134E4A]/10 flex items-center justify-between text-xs">
          <div className="flex items-center gap-1 text-[#2D2926] font-semibold">
            <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
            <span>{product.rating}</span>
            <span className="text-[#8C7A70] font-normal">({product.reviewCount})</span>
          </div>

          <div className="flex items-center gap-1 text-[#BF5A36] font-bold uppercase tracking-wider text-[11px] group-hover:translate-x-0.5 transition-transform">
            <span>{product.storeIds.length} {t('stores')}</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </div>
  );
};

