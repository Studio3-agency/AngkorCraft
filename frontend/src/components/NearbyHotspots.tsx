import React from 'react';
import { Shop } from '../types';
import { HotspotCategory } from '../data/hotspots';
import { nearbyHotspots, formatDistance, NearbyHotspot } from '../lib/geo';
import { useLanguage } from '../context/LanguageContext';
import { Landmark, ShoppingBag, Trees, Waves, Building2, Wine, MapPin, Navigation } from 'lucide-react';

const CATEGORY_ICON: Record<HotspotCategory, React.ComponentType<{ className?: string }>> = {
  temple: Landmark,
  market: ShoppingBag,
  nature: Trees,
  beach: Waves,
  landmark: MapPin,
  museum: Building2,
  nightlife: Wine,
};

interface Props {
  shop: Shop;
  variant?: 'compact' | 'full';
  maxKm?: number;
  /** Pre-computed spots (so the list and the map stay in sync). */
  spots?: NearbyHotspot[];
  /** When set (full variant), rows become buttons that focus the map. */
  onSelect?: (id: string) => void;
  activeId?: string | null;
}

/**
 * Auto-derived list of tourist landmarks near the shop's pin. Merchants can't
 * edit these — they come purely from the shop's coordinates + a fixed dataset.
 */
export const NearbyHotspots: React.FC<Props> = ({ shop, variant = 'full', maxKm = 15, spots: spotsProp, onSelect, activeId }) => {
  const { language, t } = useLanguage();
  const spots = spotsProp ?? nearbyHotspots(shop.lat, shop.lng, { maxKm, limit: variant === 'compact' ? 1 : 4 });
  if (spots.length === 0) return null;

  const label = (name: string, nameKh: string) => (language === 'kh' ? nameKh || name : name);

  if (variant === 'compact') {
    const s = spots[0];
    return (
      <div className="flex items-center gap-1.5 text-xs text-[#5C4D44]">
        <Navigation className="w-3.5 h-3.5 text-[#FF914D] shrink-0" />
        <span className="truncate">
          <span className="text-[#8C7A70]">{t('nearLabel')}</span>{' '}
          <span className="font-semibold text-[#134E4A]">{label(s.name, s.nameKh)}</span>
          <span className="text-[#8C7A70]"> · {formatDistance(s.distanceKm)}</span>
        </span>
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-1">
        <Navigation className="w-4.5 h-4.5 text-[#FF914D]" />
        <h2 className="font-sans text-lg font-bold text-[#134E4A]">{t('nearbyLandmarks')}</h2>
      </div>
      <p className="text-sm text-[#5C4D44] mb-4">{t('nearbyLandmarksDesc')}</p>
      <div className="grid sm:grid-cols-2 gap-2.5">
        {spots.map((s) => {
          const Icon = CATEGORY_ICON[s.category];
          const active = activeId === s.id;
          const rowClass = `flex items-center gap-3 w-full text-left bg-white border rounded-xl px-3.5 py-2.5 transition-all ${
            active ? 'border-[#FF914D] ring-1 ring-[#FF914D]/40 shadow-sm' : 'border-[#E8DEC8]'
          } ${onSelect ? 'hover:border-[#FF914D]/60 hover:shadow-sm cursor-pointer' : ''}`;
          const inner = (
            <>
              <span className="w-9 h-9 rounded-lg bg-[#FF914D]/12 flex items-center justify-center shrink-0">
                <Icon className="w-4.5 h-4.5 text-[#FF914D]" />
              </span>
              <div className="min-w-0 flex-1">
                <div className="text-sm font-semibold text-[#134E4A] truncate">{label(s.name, s.nameKh)}</div>
                <div className="text-xs text-[#8C7A70] capitalize flex items-center gap-1">
                  {s.category}
                  {onSelect && <><span className="text-[#E8DEC8]">·</span><MapPin className="w-3 h-3 text-[#FF914D]" /></>}
                </div>
              </div>
              <div className="text-sm font-bold text-[#FF914D] shrink-0">{formatDistance(s.distanceKm)}</div>
            </>
          );
          return onSelect ? (
            <button key={s.id} type="button" onClick={() => onSelect(s.id)} className={rowClass}>{inner}</button>
          ) : (
            <div key={s.id} className={rowClass}>{inner}</div>
          );
        })}
      </div>
    </div>
  );
};
