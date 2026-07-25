import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shop } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { MapPin, Clock, Star, Store, ShieldCheck, Zap, ExternalLink } from 'lucide-react';
import { ReportButton } from './ReportButton';
import { isBoostActive } from '../lib/shops';

interface Props {
  shop: Shop;
  onSelectShopOnMap: (shop: Shop) => void;
}

/**
 * Compact, scannable store row for the Locations list — short enough that
 * several fit in the frame beside the map. The whole row opens the store page.
 */
export const ShopListItem: React.FC<Props> = ({ shop, onSelectShopOnMap }) => {
  const { language, t, translateShopType } = useLanguage();
  const navigate = useNavigate();
  const boosted = isBoostActive(shop);
  const storeUrl = `/shop/${shop.slug || shop.id}`;
  const mapHref = shop.googleMapsUrl || (shop.lat && shop.lng ? `https://www.google.com/maps/search/?api=1&query=${shop.lat},${shop.lng}` : null);

  return (
    <div
      onClick={() => navigate(storeUrl)}
      role="link"
      tabIndex={0}
      onKeyDown={(e) => { if (e.key === 'Enter') navigate(storeUrl); }}
      className="group flex gap-3 bg-white rounded-2xl border border-[#E8DEC8] p-3 cursor-pointer hover:border-[#FF914D]/50 hover:shadow-md transition-all"
    >
      {/* Thumbnail */}
      <div className="relative w-24 h-24 sm:w-28 sm:h-28 rounded-xl overflow-hidden bg-[#F2EDE4] shrink-0">
        {shop.image ? (
          <img src={shop.image} alt={shop.name} referrerPolicy="no-referrer" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-[#134E4A]/30 text-[10px] font-bold uppercase">No image</div>
        )}
        {boosted && (
          <span className="absolute top-1.5 left-1.5 bg-[#FF914D] text-white text-[9px] font-bold px-1.5 py-0.5 rounded-full flex items-center gap-0.5 shadow">
            <Zap className="w-2.5 h-2.5" /> {t('boostedBadge')}
          </span>
        )}
      </div>

      {/* Body */}
      <div className="min-w-0 flex-1 flex flex-col justify-between">
        <div>
          <div className="flex items-start justify-between gap-2">
            <span className="text-[10px] font-bold text-[#FF914D] uppercase tracking-[0.15em] bg-[#FF914D]/10 px-2 py-0.5 rounded-full">
              {translateShopType(shop.type)}
            </span>
            <span className="flex items-center gap-1 text-xs font-bold text-[#2D2926] shrink-0">
              <Star className="w-3.5 h-3.5 fill-[#FF914D] text-[#FF914D]" />
              {shop.rating}
              <span className="text-[#8C7A70] font-normal">({shop.reviewCount})</span>
            </span>
          </div>

          <h3 className="mt-1 font-sans font-bold text-[15px] text-[#2D2926] leading-tight truncate group-hover:text-[#FF914D] transition-colors inline-flex items-center gap-1">
            {shop.isVerified && <ShieldCheck className="w-3.5 h-3.5 text-[#134E4A] shrink-0" />}
            {language === 'kh' ? shop.khmerName || shop.name : shop.name}
          </h3>

          <div className="mt-0.5 flex items-center gap-3 text-[11px] text-[#5C4D44]">
            {(shop.city || shop.region) && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <MapPin className="w-3 h-3 text-[#FF914D] shrink-0" />
                <span className="truncate">{shop.city || shop.region}</span>
              </span>
            )}
            {shop.openingHours && (
              <span className="inline-flex items-center gap-1 min-w-0">
                <Clock className="w-3 h-3 text-[#134E4A] shrink-0" />
                <span className="truncate">{shop.openingHours}</span>
              </span>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="mt-2 flex items-center gap-1.5">
          <button
            onClick={(e) => { e.stopPropagation(); onSelectShopOnMap(shop); }}
            className="flex items-center gap-1 bg-[#134E4A] hover:bg-[#0f3d3a] text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-2.5 rounded-full cursor-pointer"
          >
            <MapPin className="w-3 h-3 text-[#F5C542]" /> {t('mapBtn')}
          </button>
          <button
            onClick={(e) => { e.stopPropagation(); navigate(storeUrl); }}
            className="flex items-center gap-1 bg-[#FF914D] hover:bg-[#F07A33] text-white text-[11px] font-bold uppercase tracking-wider py-1.5 px-2.5 rounded-full cursor-pointer"
          >
            <Store className="w-3 h-3" /> {t('viewStoreBtn')}
          </button>
          {mapHref && (
            <a
              href={mapHref}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="p-1.5 bg-[#F2EDE4] hover:bg-[#E8DEC8] text-[#134E4A] rounded-full border border-[#134E4A]/10"
              title={t('openGoogleMapsDirections')}
            >
              <ExternalLink className="w-3.5 h-3.5" />
            </a>
          )}
          <ReportButton targetType="shop" targetId={shop.id} targetName={shop.name} variant="icon" className="!p-1.5" />
        </div>
      </div>
    </div>
  );
};
