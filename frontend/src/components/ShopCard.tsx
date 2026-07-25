import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { localized } from '../lib/localize';
import { MapPin, Clock, ShieldCheck, ExternalLink, Star, Store, Zap } from 'lucide-react';
import { ReportButton } from './ReportButton';
import { isBoostActive } from '../lib/shops';

interface ShopCardProps {
  shop: Shop;
  onSelectShopOnMap: (shop: Shop) => void;
  onViewShopProducts: (shopId: string) => void;
  /** 'list' = image beside content (default); 'grid' = image on top for 3-col grids. */
  layout?: 'list' | 'grid';
}

// Text/icons that sit on the dark-teal chips use the golden accent.
const GOLD = '#F5C542';

export const ShopCard: React.FC<ShopCardProps> = ({
  shop,
  onSelectShopOnMap,
  layout = 'list',
}) => {
  const { language, t, translateShopType } = useLanguage();
  const navigate = useNavigate();
  const boosted = isBoostActive(shop);
  const storeUrl = `/shop/${shop.slug || shop.id}`;

  return (
    <div
      onClick={() => navigate(storeUrl)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(storeUrl); }}
      className={`group h-full bg-white rounded-2xl border border-[#E8DEC8] overflow-hidden shadow-xs hover:shadow-lg hover:border-[#FF914D]/40 hover:-translate-y-0.5 transition-all duration-300 flex flex-col cursor-pointer ${layout === 'list' ? 'md:flex-row' : ''}`}
    >
      {/* Shop Image */}
      <div className={`relative bg-[#F2EDE4] shrink-0 ${layout === 'list' ? 'md:w-5/12 h-48 md:h-auto' : 'w-full h-44'}`}>
        {shop.image ? (
          <img
            src={shop.image}
            alt={shop.name || 'Unnamed Shop'}
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover"
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center text-[#134E4A]/30">
            <span className="text-sm font-bold uppercase tracking-wider">No Image</span>
          </div>
        )}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5">
          {shop.isVerified && (
            <span className="bg-[#134E4A] text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <ShieldCheck className="w-3 h-3" style={{ color: GOLD }} />
              {t('verifiedAuthentic')}
            </span>
          )}
          {boosted && (
            <span className="bg-[#FF914D] text-white text-xs font-bold px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-md">
              <Zap className="w-3 h-3" />
              {t('boostedBadge')}
            </span>
          )}
        </div>
        {shop.city && (
          <div className="absolute bottom-3 left-3 bg-[#134E4A]/90 backdrop-blur-md text-white text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1 border border-white/10">
            <MapPin className="w-3 h-3" style={{ color: GOLD }} />
            {shop.city}
          </div>
        )}
      </div>

      {/* Shop Info — buttons pinned to the bottom so cards line up in a grid */}
      <div className="p-5 flex-1 flex flex-col">
        <div className="flex items-start justify-between gap-2 mb-1.5">
          <span className="text-xs font-bold text-[#FF914D] uppercase tracking-[0.15em] bg-[#FF914D]/10 px-2.5 py-0.5 rounded-full">
            {translateShopType(shop.type)}
          </span>
          <div className="flex items-center gap-1 text-xs font-bold text-[#2D2926] shrink-0 pt-0.5">
            <Star className="w-3.5 h-3.5 fill-[#FF914D] text-[#FF914D]" />
            <span>{shop.rating}</span>
            <span className="text-[#8C7A70] font-normal">({shop.reviewCount})</span>
          </div>
        </div>

        <h3 className="font-sans font-bold text-lg text-[#2D2926] leading-tight group-hover:text-[#FF914D] transition-colors inline-flex items-start gap-1">
          {language === 'kh' ? shop.khmerName || shop.name : shop.name}
          <Store className="w-3.5 h-3.5 mt-1 opacity-0 group-hover:opacity-100 text-[#FF914D] transition-opacity shrink-0" />
        </h3>

        <p className="text-xs text-[#5C4D44] line-clamp-2 leading-relaxed mt-1.5">
          {localized(shop.description, shop.descriptionKh, language) || <span className="italic opacity-60">No description provided.</span>}
        </p>

        {shop.openingHours && (
          <div className="flex items-center gap-1.5 text-xs text-[#5C4D44] mt-2">
            <Clock className="w-3.5 h-3.5 text-[#134E4A] shrink-0" />
            <span className="truncate">{shop.openingHours}</span>
          </div>
        )}

        {/* Actions (pinned to bottom) */}
        <div className="mt-auto pt-4 flex items-center gap-2">
          <button
            onClick={(e) => { e.stopPropagation(); onSelectShopOnMap(shop); }}
            className="flex-1 bg-[#134E4A] hover:bg-[#0f3d3a] text-white text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
          >
            <MapPin className="w-3.5 h-3.5" style={{ color: GOLD }} />
            <span>{t('mapBtn')}</span>
          </button>

          {!!(shop.googleMapsUrl || (shop.lat && shop.lng)) && (
            <a
              href={shop.googleMapsUrl || `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}`}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex-1 bg-[#FF914D] hover:bg-[#F07A33] text-white text-xs font-bold uppercase tracking-wider py-2 px-3 rounded-full transition-all flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
              title={t('openGoogleMapsDirections')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>{t('googleMapBtn')}</span>
            </a>
          )}

          <ReportButton targetType="shop" targetId={shop.id} targetName={shop.name} variant="icon" />
        </div>
      </div>
    </div>
  );
};
