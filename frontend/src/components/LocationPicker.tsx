import React, { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import { LocateFixed, MapPin } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';

interface LocationPickerProps {
  lat?: number | null;
  lng?: number | null;
  onChange: (lat: number, lng: number) => void;
}

const CAMBODIA_CENTER: [number, number] = [12.5657, 104.991];

/**
 * Non-technical location picker: the merchant taps the map (or uses their
 * current GPS) to drop a pin. We capture lat/lng invisibly — they never see a
 * coordinate. This is how a local vendor makes their place findable without
 * knowing Google Maps or addresses.
 */
export const LocationPicker: React.FC<LocationPickerProps> = ({ lat, lng, onChange }) => {
  const { t } = useLanguage();
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markerRef = useRef<L.Marker | null>(null);
  const [hasPin, setHasPin] = useState<boolean>(Boolean(lat && lng));
  const [locating, setLocating] = useState(false);

  useEffect(() => {
    if (!containerRef.current || mapRef.current) return;

    const start: [number, number] = lat && lng ? [lat, lng] : CAMBODIA_CENTER;
    const map = L.map(containerRef.current, { attributionControl: false }).setView(start, lat && lng ? 16 : 7);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 19 }).addTo(map);

    const icon = L.divIcon({
      className: 'ac-pin',
      html: '<div style="width:26px;height:26px;background:#FF914D;border:3px solid #fff;border-radius:50% 50% 50% 0;transform:rotate(-45deg);box-shadow:0 2px 6px rgba(0,0,0,.4)"></div>',
      iconSize: [26, 26],
      iconAnchor: [13, 26],
    });

    const placePin = (la: number, ln: number) => {
      if (markerRef.current) {
        markerRef.current.setLatLng([la, ln]);
      } else {
        markerRef.current = L.marker([la, ln], { icon, draggable: true }).addTo(map);
        markerRef.current.on('dragend', () => {
          const p = markerRef.current!.getLatLng();
          onChange(p.lat, p.lng);
        });
      }
      setHasPin(true);
      onChange(la, ln);
    };

    if (lat && lng) placePin(lat, lng);
    map.on('click', (e: L.LeafletMouseEvent) => placePin(e.latlng.lat, e.latlng.lng));
    mapRef.current = map;

    // Leaflet needs a size recalculation once it is visible in the modal.
    setTimeout(() => map.invalidateSize(), 200);

    return () => {
      map.remove();
      mapRef.current = null;
      markerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const useMyLocation = () => {
    if (!('geolocation' in navigator) || !mapRef.current) return;
    setLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const { latitude, longitude } = pos.coords;
        mapRef.current!.setView([latitude, longitude], 17);
        mapRef.current!.fire('click', { latlng: { lat: latitude, lng: longitude } });
        setLocating(false);
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 8000 },
    );
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs text-[#8C7A70]">
          {hasPin ? t('locationPinned') : t('locationTapHint')}
        </p>
        <button
          type="button"
          onClick={useMyLocation}
          disabled={locating}
          className="flex items-center gap-1.5 text-xs font-semibold text-[#134E4A] bg-[#F2EDE4] hover:bg-[#E8DEC8] px-3 py-1.5 rounded-full cursor-pointer whitespace-nowrap"
        >
          <LocateFixed className={`w-3.5 h-3.5 ${locating ? 'animate-pulse' : ''}`} />
          {t('useMyLocation')}
        </button>
      </div>
      <div className="relative rounded-2xl overflow-hidden border border-[#E8DEC8]">
        <div ref={containerRef} className="w-full h-56" />
        {!hasPin && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="bg-white/90 text-[#134E4A] text-xs font-semibold px-3 py-1.5 rounded-full flex items-center gap-1.5 shadow">
              <MapPin className="w-3.5 h-3.5 text-[#FF914D]" />
              {t('locationTapHint')}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
