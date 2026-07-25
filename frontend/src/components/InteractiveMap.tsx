import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { LocateFixed } from 'lucide-react';
import { Shop } from '../types';
import { HOTSPOTS } from '../data/hotspots';
import { useLanguage } from '../context/LanguageContext';

interface InteractiveMapProps {
  shops: Shop[];
  selectedShopId?: string | null;
  onSelectShop?: (shop: Shop) => void;
  className?: string;
  /** Show tourist landmarks as subtle secondary markers. Default true. */
  showLandmarks?: boolean;
  /** The visitor's own location [lat, lng] — shows a "you are here" dot. */
  userLocation?: [number, number] | null;
  /** Called when the visitor taps "Near me" and we don't have a location yet. */
  onLocate?: () => void;
}

// "You are here" marker — Google-Maps-style blue dot with a soft halo.
const userIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:#1A73E8;
    border:3px solid white;box-shadow:0 0 0 5px rgba(26,115,232,.22),0 2px 6px rgba(0,0,0,.35);"></div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
});

// Bounding box that frames the whole of Cambodia — the default first view.
const CAMBODIA_BOUNDS = L.latLngBounds([10.35, 102.3], [14.72, 107.65]);

// Subtle landmark marker — small, muted, clearly secondary to shop pins.
const landmarkIcon = L.divIcon({
  className: '',
  html: `<div style="width:16px;height:16px;border-radius:50%;background:rgba(19,78,74,.55);
    border:1.5px solid rgba(255,255,255,.85);display:flex;align-items:center;justify-content:center;
    color:#F4C430;font-size:9px;line-height:1;">★</div>`,
  iconSize: [16, 16],
  iconAnchor: [8, 8],
  popupAnchor: [0, -8],
});

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  shops,
  selectedShopId,
  onSelectShop,
  className = 'h-[450px] w-full',
  showLandmarks = true,
  userLocation = null,
  onLocate,
}) => {
  const { language, t } = useLanguage();
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});
  const landmarkLayerRef = useRef<L.LayerGroup | null>(null);
  const userMarkerRef = useRef<L.Marker | null>(null);
  const centeredOnUserRef = useRef(false);

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize once. Mouse-wheel zoom + keyboard navigation enabled.
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: true,
        keyboard: true,
        attributionControl: false,
      }).fitBounds(CAMBODIA_BOUNDS, { padding: [20, 20] }); // Cambodia framed first

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // --- Subtle landmark layer (secondary) ---
    if (showLandmarks) {
      if (landmarkLayerRef.current) landmarkLayerRef.current.remove();
      const group = L.layerGroup();
      HOTSPOTS.forEach((h) => {
        const name = language === 'kh' ? h.nameKh || h.name : h.name;
        const m = L.marker([h.lat, h.lng], { icon: landmarkIcon, zIndexOffset: -500, opacity: 0.9 });
        m.bindPopup(`
          <div style="font-family:sans-serif;max-width:180px;">
            <div style="font-weight:700;color:#134E4A;">★ ${name}</div>
            <div style="font-size:11px;color:#6B5E57;text-transform:capitalize;">${h.category} · ${h.region}</div>
          </div>`);
        m.addTo(group);
      });
      group.addTo(map);
      landmarkLayerRef.current = group;
    }

    // --- Shop markers (primary) ---
    Object.values(markersRef.current).forEach((marker) => marker.remove());
    markersRef.current = {};

    shops.forEach((shop) => {
      // Color coding by type
      let markerColor = '#FF914D'; // Terracotta default
      if (shop.type === 'Social Enterprise' || shop.type === 'Artisan Workshop') {
        markerColor = '#1F5353'; // Deep Teal
      } else if (shop.type === 'Organic Farm' || shop.type === 'Craft Co-op') {
        markerColor = '#B87B1F'; // Silk Gold
      }

      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 32px; height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex; align-items: center; justify-content: center;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            <div style="width: 10px; height: 10px; background-color: white; border-radius: 50%; transform: rotate(45deg);"></div>
          </div>`,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([shop.lat, shop.lng], { icon: customIcon, zIndexOffset: 500 }).addTo(map);

      const popupContent = `
        <div class="p-1 max-w-[220px]">
          <img src="${shop.image}" alt="${shop.name}" class="w-full h-24 object-cover rounded-md mb-2" />
          <div class="font-bold text-sm text-[#2C221E] font-sans leading-tight">${shop.name}</div>
          <div class="text-xs text-[#6B5E57] mb-1 font-sans">${shop.type} • ${shop.city}</div>
          <div class="text-xs text-[#FF914D] font-semibold flex items-center gap-1 mb-2">
            ★ ${shop.rating} (${shop.reviewCount} reviews)
          </div>
          <div class="text-[11px] text-[#4A3E39] mb-2 line-clamp-2">${shop.address}</div>
          <a href="${shop.googleMapsUrl}" target="_blank" rel="noopener noreferrer"
            class="inline-block w-full text-center py-1 px-2 bg-[#FF914D] text-white !text-white font-medium text-xs rounded hover:bg-[#F07A33] transition-colors">
            Open Directions ➔
          </a>
        </div>`;

      marker.bindPopup(popupContent);
      marker.on('click', () => onSelectShop && onSelectShop(shop));
      markersRef.current[shop.id] = marker;
    });

    // --- Visitor's "you are here" marker (Google-Maps style) ---
    if (userLocation) {
      if (userMarkerRef.current) {
        userMarkerRef.current.setLatLng(userLocation);
      } else {
        userMarkerRef.current = L.marker(userLocation, { icon: userIcon, zIndexOffset: 2000 }).addTo(map);
      }
      // Center on the visitor the first time we learn their location.
      if (!centeredOnUserRef.current && !selectedShopId) {
        map.setView(userLocation, 13, { animate: true });
        centeredOnUserRef.current = true;
      }
    } else if (userMarkerRef.current) {
      userMarkerRef.current.remove();
      userMarkerRef.current = null;
    }

    // Only zoom to a shop when one is explicitly selected; otherwise keep the
    // Cambodia-framed view so users always start with the whole country.
    if (selectedShopId && markersRef.current[selectedShopId]) {
      const selectedShop = shops.find((s) => s.id === selectedShopId);
      if (selectedShop) {
        map.setView([selectedShop.lat, selectedShop.lng], 14, { animate: true });
        markersRef.current[selectedShopId].openPopup();
      }
    }
  }, [shops, selectedShopId, showLandmarks, language, userLocation]);

  return (
    <div className={`relative overflow-hidden shadow-md rounded-2xl border border-[#E8DEC8] ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />

      {/* "Near me" — center on the visitor (asks for location if not granted yet) */}
      <button
        type="button"
        onClick={() => {
          const map = mapInstanceRef.current;
          if (userLocation && map) map.setView(userLocation, 14, { animate: true });
          else onLocate?.();
        }}
        className="absolute top-3 right-3 z-[20] flex items-center gap-1.5 bg-white/95 hover:bg-white text-[#134E4A] text-xs font-bold px-3 py-2 rounded-full shadow-lg border border-[#E8DEC8] cursor-pointer"
      >
        <LocateFixed className="w-4 h-4 text-[#1A73E8]" />
        {t('nearMe')}
      </button>

      {/* Legend overlay */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-[#E8DEC8] shadow-lg text-xs z-[20] flex flex-col gap-1.5 pointer-events-none">
        <div className="font-semibold text-[#2C221E] text-[11px] uppercase tracking-wider mb-0.5">Legend</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#FF914D] border border-white"></span>
          <span className="text-[#4A3E39]">Markets</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#1F5353] border border-white"></span>
          <span className="text-[#4A3E39]">Workshops / Enterprise</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#B87B1F] border border-white"></span>
          <span className="text-[#4A3E39]">Farms & Co-ops</span>
        </div>
        {showLandmarks && (
          <div className="flex items-center gap-2 pt-1 mt-0.5 border-t border-[#E8DEC8]">
            <span className="w-3 h-3 rounded-full bg-[#134E4A]/60 border border-white flex items-center justify-center text-[#F4C430] text-[7px]">★</span>
            <span className="text-[#4A3E39]">Tourist landmarks</span>
          </div>
        )}
        {userLocation && (
          <div className="flex items-center gap-2 pt-1 mt-0.5 border-t border-[#E8DEC8]">
            <span className="w-3 h-3 rounded-full bg-[#1A73E8] border-2 border-white shadow"></span>
            <span className="text-[#4A3E39]">{t('youAreHere')}</span>
          </div>
        )}
      </div>
    </div>
  );
};
