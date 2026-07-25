import React, { useEffect, useRef } from 'react';
import L from 'leaflet';
import { Shop } from '../types';

interface InteractiveMapProps {
  shops: Shop[];
  selectedShopId?: string | null;
  onSelectShop?: (shop: Shop) => void;
  className?: string;
  zoomLevel?: number;
  center?: [number, number];
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  shops,
  selectedShopId,
  onSelectShop,
  className = 'h-[450px] w-full',
  zoomLevel = 8,
  center = [12.5657, 104.9910] // Center of Cambodia
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const markersRef = useRef<{ [key: string]: L.Marker }>({});

  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Initialize Leaflet Map if not already initialized
    if (!mapInstanceRef.current) {
      const map = L.map(mapContainerRef.current, {
        scrollWheelZoom: false,
      }).setView(center, zoomLevel);

      // Add OpenStreetMap Tile Layer
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 18,
      }).addTo(map);

      mapInstanceRef.current = map;
    }

    const map = mapInstanceRef.current;

    // Clear existing markers
    Object.values(markersRef.current).forEach(marker => marker.remove());
    markersRef.current = {};

    if (shops.length === 0) return;

    // Create custom pins for shops
    const bounds = L.latLngBounds([]);

    shops.forEach(shop => {
      bounds.extend([shop.lat, shop.lng]);

      // Color coding by type
      let markerColor = '#C25932'; // Terracotta default
      if (shop.type === 'Social Enterprise' || shop.type === 'Artisan Workshop') {
        markerColor = '#1F5353'; // Deep Teal
      } else if (shop.type === 'Organic Farm' || shop.type === 'Craft Co-op') {
        markerColor = '#B87B1F'; // Silk Gold
      }

      // Create Custom DivIcon
      const customIcon = L.divIcon({
        className: 'custom-leaflet-marker',
        html: `
          <div style="
            background-color: ${markerColor};
            width: 32px;
            height: 32px;
            border-radius: 50% 50% 50% 0;
            transform: rotate(-45deg);
            display: flex;
            align-items: center;
            justify-content: center;
            border: 2px solid white;
            box-shadow: 0 4px 10px rgba(0,0,0,0.3);
            cursor: pointer;
          ">
            <div style="
              width: 10px;
              height: 10px;
              background-color: white;
              border-radius: 50%;
              transform: rotate(45deg);
            "></div>
          </div>
        `,
        iconSize: [32, 32],
        iconAnchor: [16, 32],
        popupAnchor: [0, -32],
      });

      const marker = L.marker([shop.lat, shop.lng], { icon: customIcon }).addTo(map);

      // Popup html
      const popupContent = `
        <div class="p-1 max-w-[220px]">
          <img src="${shop.image}" alt="${shop.name}" class="w-full h-24 object-cover rounded-md mb-2" />
          <div class="font-bold text-sm text-[#2C221E] font-sans leading-tight">${shop.name}</div>
          <div class="text-xs text-[#6B5E57] mb-1 font-sans">${shop.type} • ${shop.city}</div>
          <div class="text-xs text-[#C25932] font-semibold flex items-center gap-1 mb-2">
            ★ ${shop.rating} (${shop.reviewCount} reviews)
          </div>
          <div class="text-[11px] text-[#4A3E39] mb-2 line-clamp-2">${shop.address}</div>
          <a href="${shop.googleMapsUrl}" target="_blank" rel="noopener noreferrer" 
            class="inline-block w-full text-center py-1 px-2 bg-[#C25932] text-white !text-white font-medium text-xs rounded hover:bg-[#A84825] transition-colors">
            Open Directions ➔
          </a>
        </div>
      `;

      marker.bindPopup(popupContent);

      marker.on('click', () => {
        if (onSelectShop) {
          onSelectShop(shop);
        }
      });

      markersRef.current[shop.id] = marker;
    });

    // Auto-fit bounds if shops exist and not specifically zoomed in
    if (shops.length > 1 && !selectedShopId) {
      map.fitBounds(bounds, { padding: [40, 40] });
    } else if (selectedShopId && markersRef.current[selectedShopId]) {
      const selectedShop = shops.find(s => s.id === selectedShopId);
      if (selectedShop) {
        map.setView([selectedShop.lat, selectedShop.lng], 14, { animate: true });
        markersRef.current[selectedShopId].openPopup();
      }
    }

  }, [shops, selectedShopId]);

  return (
    <div className={`relative overflow-hidden shadow-md rounded-2xl border border-[#E8DEC8] ${className}`}>
      <div ref={mapContainerRef} className="w-full h-full min-h-[350px]" />
      
      {/* Legend overlay */}
      <div className="absolute bottom-3 right-3 bg-white/95 backdrop-blur-md p-2.5 rounded-xl border border-[#E8DEC8] shadow-lg text-xs z-[20] flex flex-col gap-1.5 pointer-events-auto">
        <div className="font-semibold text-[#2C221E] text-[11px] uppercase tracking-wider mb-0.5">Shop Types</div>
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-[#C25932] border border-white"></span>
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
      </div>
    </div>
  );
};
