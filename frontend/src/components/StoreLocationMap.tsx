import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Shop } from '../types';
import { NearbyHotspot } from '../lib/geo';
import { useLanguage } from '../context/LanguageContext';

interface Props {
  shop: Shop;
  hotspots: NearbyHotspot[];
  /** Landmark id to pan to + open (set when a landmark row is clicked). */
  focusId?: string | null;
  className?: string;
}

// Store = orange teardrop pin (the destination). Distinct from landmarks.
const storeIcon = L.divIcon({
  className: '',
  html: `
    <div style="width:36px;height:36px;border-radius:50% 50% 50% 0;transform:rotate(-45deg);
      background:#FF914D;border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,.35);
      display:flex;align-items:center;justify-content:center;">
      <div style="transform:rotate(45deg);color:white;font-size:16px;line-height:1;">🏬</div>
    </div>`,
  iconSize: [36, 36],
  iconAnchor: [18, 36],
  popupAnchor: [0, -34],
});

// Landmark = teal circular badge with a gold star. Clearly different shape/color.
function landmarkIcon(active: boolean): L.DivIcon {
  const size = active ? 32 : 26;
  return L.divIcon({
    className: '',
    html: `
      <div style="width:${size}px;height:${size}px;border-radius:50%;
        background:#134E4A;border:2px solid ${active ? '#F4C430' : 'white'};
        box-shadow:0 3px 8px rgba(0,0,0,.3);display:flex;align-items:center;justify-content:center;
        color:#F4C430;font-size:${active ? 15 : 12}px;line-height:1;">★</div>`,
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    popupAnchor: [0, -(size / 2) - 2],
  });
}

export const StoreLocationMap: React.FC<Props> = ({ shop, hotspots, focusId, className = 'h-[340px] w-full' }) => {
  const { language, t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const storeMarkerRef = useRef<L.Marker | null>(null);
  const landmarkMarkers = useRef<Record<string, L.Marker>>({});

  // Build the map once (and whenever the shop/hotspots change).
  useEffect(() => {
    if (!containerRef.current || !shop.lat || !shop.lng) return;

    if (!mapRef.current) {
      mapRef.current = L.map(containerRef.current, { scrollWheelZoom: true, keyboard: true }).setView([shop.lat, shop.lng], 14);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(mapRef.current);
    }
    const map = mapRef.current;

    // Reset markers (store + landmarks) so re-renders don't stack duplicates.
    Object.values(landmarkMarkers.current).forEach((m) => m.remove());
    landmarkMarkers.current = {};
    if (storeMarkerRef.current) { storeMarkerRef.current.remove(); storeMarkerRef.current = null; }

    const bounds = L.latLngBounds([[shop.lat, shop.lng]]);

    // Store marker
    const storeMarker = L.marker([shop.lat, shop.lng], { icon: storeIcon, zIndexOffset: 1000 }).addTo(map);
    storeMarker.bindPopup(`<div style="font-weight:700;color:#134E4A;font-family:sans-serif;">${shop.name}</div>`);
    storeMarkerRef.current = storeMarker;

    // Landmark markers
    hotspots.forEach((h) => {
      const name = language === 'kh' ? h.nameKh || h.name : h.name;
      const marker = L.marker([h.lat, h.lng], { icon: landmarkIcon(false) }).addTo(map);
      marker.bindPopup(`
        <div style="font-family:sans-serif;max-width:200px;">
          <div style="font-weight:700;color:#134E4A;">★ ${name}</div>
          <div style="font-size:11px;color:#6B5E57;text-transform:capitalize;margin-bottom:6px;">${h.category} · ${h.distanceKm.toFixed(1)} km</div>
          <a href="https://www.google.com/maps/search/?api=1&query=${h.lat},${h.lng}" target="_blank" rel="noopener noreferrer"
            style="display:inline-block;background:#134E4A;color:#fff;font-size:11px;font-weight:600;padding:4px 8px;border-radius:6px;text-decoration:none;">Directions ➔</a>
        </div>`);
      landmarkMarkers.current[h.id] = marker;
      bounds.extend([h.lat, h.lng]);
    });

    map.fitBounds(bounds, { padding: [45, 45], maxZoom: 15 });
    // Ensure correct sizing when revealed inside a card/flex layout.
    setTimeout(() => map.invalidateSize(), 0);
  }, [shop.id, shop.lat, shop.lng, hotspots, language]);

  // Pan to + highlight a landmark when its row is clicked.
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !focusId) return;
    const marker = landmarkMarkers.current[focusId];
    const h = hotspots.find((x) => x.id === focusId);
    if (!marker || !h) return;
    // Re-emphasize the active marker
    Object.entries(landmarkMarkers.current).forEach(([id, m]) => m.setIcon(landmarkIcon(id === focusId)));
    map.invalidateSize();
    map.setView([h.lat, h.lng], 15, { animate: true });
    marker.openPopup();
  }, [focusId, hotspots]);

  if (!shop.lat || !shop.lng) return null;

  return (
    <div className={`relative overflow-hidden rounded-2xl border border-[#E8DEC8] shadow-sm ${className}`}>
      <div ref={containerRef} className="w-full h-full min-h-[280px]" />
      {/* Legend: store vs landmark markers */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-[#E8DEC8] shadow-lg text-xs z-[20] flex flex-col gap-1.5">
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#FF914D] border border-white shrink-0"></span>
          <span className="text-[#4A3E39] font-medium">{t('mapLegendStore')}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3.5 h-3.5 rounded-full bg-[#134E4A] border border-white flex items-center justify-center text-[#F4C430] text-[8px] shrink-0">★</span>
          <span className="text-[#4A3E39] font-medium">{t('mapLegendLandmark')}</span>
        </div>
      </div>
    </div>
  );
};
