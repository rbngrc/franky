import { useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

interface Props {
  waypoints: [number, number][];
}

export const RoutingMachine = ({ waypoints }: Props) => {
  const map = useMap();
  const polyRef = useRef<L.Polyline | null>(null);

  useEffect(() => {
    const validWps = waypoints.filter((wp) => wp != null && !isNaN(wp[0]) && !isNaN(wp[1]));
    if (validWps.length < 2) return;
    if (!map) return;

    const controller = new AbortController();

    const fetchRoute = async () => {
      const coordsStr = validWps.map((wp) => `${wp[1]},${wp[0]}`).join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`;

      try {
        const res = await fetch(url, { signal: controller.signal });
        if (!res.ok) return;
        const data = await res.json();
        if (!data.routes || data.routes.length === 0) return;

        const coords = data.routes[0].geometry.coordinates.map(
          (c: [number, number]) => [c[1], c[0]] as [number, number],
        );

        if (polyRef.current) {
          polyRef.current.setLatLngs(coords);
        } else {
          polyRef.current = L.polyline(coords, {
            color: '#0097A7',
            weight: 4,
            opacity: 0.8,
          }).addTo(map);
        }

        map.fitBounds(polyRef.current.getBounds().pad(0.2));
      } catch {
        // routing error — ignore
      }
    };

    fetchRoute();

    return () => {
      controller.abort();
      if (polyRef.current) {
        try { map.removeLayer(polyRef.current); } catch { /* layer ya eliminado */ }
        polyRef.current = null;
      }
    };
  }, [map, waypoints]);

  return null;
};
