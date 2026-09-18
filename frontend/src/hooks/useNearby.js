// Location services for "events near you" and the nearest learning provider.
//
// Permission is only ever requested on an explicit tap — never on mount. A
// government app that silently prompts for location the moment it opens is
// both a POPIA problem and a good way to get the permission denied forever.
// Everything degrades to province-based filtering when location is refused.
import { useState, useCallback } from 'react';

const EARTH_KM = 6371;
const rad = (d) => (d * Math.PI) / 180;

export function haversineKm(a, b) {
  if (!a || !b || a.lat == null || b.lat == null) return null;
  const dLat = rad(b.lat - a.lat);
  const dLng = rad(b.lng - a.lng);
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLng / 2) ** 2;
  return Math.round(EARTH_KM * 2 * Math.asin(Math.sqrt(s)));
}

export const fmtKm = (km) => (km == null ? null : km < 1 ? "under 1 km" : `${km} km away`);

export function useNearby() {
  const [coords, setCoords] = useState(null);
  const [status, setStatus] = useState("idle"); // idle | asking | granted | denied | unsupported

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setStatus("unsupported");
      return;
    }
    setStatus("asking");
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setCoords({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setStatus("granted");
      },
      () => setStatus("denied"),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 600000 }
    );
  }, []);

  const clear = useCallback(() => { setCoords(null); setStatus("idle"); }, []);

  const distanceTo = useCallback((place) => haversineKm(coords, place), [coords]);

  return { coords, status, request, clear, distanceTo };
}
