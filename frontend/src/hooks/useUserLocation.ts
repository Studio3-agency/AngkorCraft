import { useCallback, useEffect, useState } from 'react';

export type GeoStatus = 'idle' | 'locating' | 'granted' | 'denied' | 'unsupported';

const LOC_KEY = 'ac_user_location';      // last known [lat, lng]
const PREF_KEY = 'ac_geo_pref';          // 'granted' | 'denied'

function readSaved(): [number, number] | null {
  try {
    const raw = localStorage.getItem(LOC_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return Array.isArray(parsed) && parsed.length === 2 ? (parsed as [number, number]) : null;
  } catch {
    return null;
  }
}

/**
 * Tracks the visitor's location (Google-Maps style). Asks for permission the
 * first time (browser prompt), remembers the choice + last position in
 * localStorage so it persists across visits, and never re-nags after a denial.
 */
export function useUserLocation(autoAsk = true) {
  const [location, setLocation] = useState<[number, number] | null>(readSaved);
  const [status, setStatus] = useState<GeoStatus>('idle');

  const request = useCallback(() => {
    if (typeof navigator === 'undefined' || !('geolocation' in navigator)) {
      setStatus('unsupported');
      return;
    }
    setStatus('locating');
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const loc: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setLocation(loc);
        setStatus('granted');
        try {
          localStorage.setItem(LOC_KEY, JSON.stringify(loc));
          localStorage.setItem(PREF_KEY, 'granted');
        } catch {
          /* storage may be blocked */
        }
      },
      () => {
        setStatus('denied');
        try { localStorage.setItem(PREF_KEY, 'denied'); } catch { /* ignore */ }
      },
      { enableHighAccuracy: false, timeout: 8000, maximumAge: 5 * 60 * 1000 },
    );
  }, []);

  // On first mount: ask automatically unless the user previously declined.
  useEffect(() => {
    if (!autoAsk) return;
    let pref: string | null = null;
    try { pref = localStorage.getItem(PREF_KEY); } catch { /* ignore */ }
    if (pref === 'denied') return; // respect an earlier "no"
    request();
  }, [autoAsk, request]);

  return { location, status, request };
}
