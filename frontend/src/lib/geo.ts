import { Hotspot, HOTSPOTS } from '../data/hotspots';

/** Great-circle distance between two lat/lng points, in kilometers. */
export function haversineKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const R = 6371; // Earth radius km
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}

export interface NearbyHotspot extends Hotspot {
  distanceKm: number;
  /** Nearest distance band (5 / 10 / 15 …) the hotspot falls into. */
  band: number;
}

/** Distance bands, in km, used to bucket how close a hotspot is. */
const BANDS = [5, 10, 15, 25];

function bandFor(km: number): number {
  return BANDS.find((b) => km <= b) ?? BANDS[BANDS.length - 1];
}

/**
 * Hotspots near a pinned location, nearest first. Auto-derived from the shop's
 * coordinates — nothing to configure. Returns [] when the shop has no pin.
 */
export function nearbyHotspots(
  lat: number | undefined,
  lng: number | undefined,
  opts: { maxKm?: number; limit?: number } = {},
): NearbyHotspot[] {
  const { maxKm = 15, limit = 4 } = opts;
  if (!lat || !lng) return []; // unset pin (0,0) → no guidance
  return HOTSPOTS.map((h) => {
    const distanceKm = haversineKm(lat, lng, h.lat, h.lng);
    return { ...h, distanceKm, band: bandFor(distanceKm) };
  })
    .filter((h) => h.distanceKm <= maxKm)
    .sort((a, b) => a.distanceKm - b.distanceKm)
    .slice(0, limit);
}

/** Human-friendly distance: "800 m" under 1 km, else "3.2 km". */
export function formatDistance(km: number): string {
  if (km < 1) return `${Math.round(km * 1000)} m`;
  return `${km.toFixed(1)} km`;
}
