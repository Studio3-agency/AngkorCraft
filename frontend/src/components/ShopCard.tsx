import React from 'react';
import { Shop } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../lib/localize';
import { MapPin, Clock, CreditCard, ShieldCheck, ExternalLink, Star, ShoppingBag } from 'lucide-react';

interface ShopCardProps {
  shop: Shop;
  onSelectShopOnMap: (shop: Shop) => void;
  onViewShopProducts: (shopId: string) => void;
}

export const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  onSelectShopOnMap,
  onViewShopProducts
}) => {
  const { language, t, translateShopType } = useLanguage();

  return (
    <div className="bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col md:flex-row">
      {/* Shop Image */}
      <div className="relative md:w-5/12 h-48 md:h-auto bg-[#F2EDE4] shrink-0">
        <img 
          src={shop.image} 
          alt={shop.name} 
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover"
        />
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {shop.isVerified && (
            <span className="bg-[#134E4A] text-white text-[10px] font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md border border-[#D4AF37]/30">
              <ShieldCheck className="w-3 h-3 text-[#D4AF37]" />
              {t('verifiedAuthentic')}
            </span>
          )}
        </div>
        <div className="absolute bottom-3 left-3 bg-[#134E4A]/90 backdrop-blur-md text-white text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
          <MapPin className="w-3 h-3 text-[#D4AF37]" />
          {shop.city}
        </div>
      </div>

      {/* Shop Info */}
      <div className="p-5 flex-1 flex flex-col justify-between space-y-3">
        <div>
          <div className="flex items-start justify-between gap-1.5 mb-1 flex-wrap">
            <span className="text-[10px] font-bold text-[#BF5A36] uppercase tracking-[0.2em] bg-[#BF5A36]/10 px-2 py-0.5 rounded-full inline-block">
              {translateShopType(shop.type)}
            </span>
            <div className="flex items-center gap-1 text-xs font-bold text-[#2D2926] shrink-0 pt-0.5">
              <Star className="w-3.5 h-3.5 fill-[#D4AF37] text-[#D4AF37]" />
              <span>{shop.rating}</span>
              <span className="text-[#8C7A70] font-normal">({shop.reviewCount})</span>
            </div>
          </div>

          <h3 className="font-sans font-bold text-lg text-[#2D2926] leading-tight">
            {language === 'kh' ? shop.khmerName : shop.name}
          </h3>
          <div className="text-xs text-[#134E4A] font-medium mb-2 font-sans">
            {language === 'kh' ? shop.name : shop.khmerName}
          </div>

          <p className="text-xs text-[#5C4D44] line-clamp-2 leading-relaxed mb-3">
            {localized(shop.description, shop.descriptionKh, language)}
          </p>

          <div className="space-y-1.5 text-xs text-[#5C4D44]">
            <div className="flex items-start gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-[#BF5A36] shrink-0 mt-0.5" />
              <span className="line-clamp-1">{shop.address}</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-[#134E4A] shrink-0" />
              <span>{shop.openingHours}</span>
            </div>
          </div>
        </div>

        {/* Payment Methods */}
        <div className="pt-2 border-t border-[#134E4A]/10">
          <div className="text-[10px] text-[#BF5A36] font-bold uppercase tracking-wider mb-1 flex items-center gap-1">
            <CreditCard className="w-3 h-3 text-[#D4AF37]" />
            {t('acceptedPayments')}
          </div>
          <div className="flex flex-wrap gap-1">
            {shop.paymentMethods.map((method, idx) => (
              <span 
                key={idx} 
                className="bg-[#F2EDE4] text-[#2D2926] text-[10px] font-semibold uppercase tracking-wider px-2 py-0.5 rounded-full border border-[#134E4A]/10"
              >
                {method}
              </span>
            ))}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="pt-3 flex items-center gap-2">
          <button
            onClick={() => onSelectShopOnMap(shop)}
            className="flex-1 bg-[#134E4A] hover:bg-[#0f3d3a] text-white text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>{t('mapBtn')}</span>
          </button>

          <button
            onClick={() => onViewShopProducts(shop.id)}
            className="flex-1 bg-[#BF5A36] hover:bg-[#a34b2c] text-white text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <ShoppingBag className="w-3.5 h-3.5 text-white" />
            <span>{t('productsBtn')}</span>
          </button>

          {(shop.googleMapsUrl || (shop.lat && shop.lng)) && (
            <a
              href={shop.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              className="p-2 bg-[#F2EDE4] hover:bg-[#E8DEC8] text-[#134E4A] rounded-full transition-colors border border-[#134E4A]/10"
              title={t('openGoogleMapsDirections')}
            >
              <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

