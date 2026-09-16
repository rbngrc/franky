import { useMemo, useEffect, useState } from 'react';
import { MapContainer, TileLayer, Polyline, Marker, Tooltip } from 'react-leaflet';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';
import type { Centro } from '../../centros/types/centro.types';
import type { Transporte } from '../../transportes/types/transporte.types';
import type { Parcela } from '../../parcelas/types/parcela.types';
import { parseWktCenter } from '../../../lib/geojson';

const DefaultIcon = L.icon({ iconUrl: icon, shadowUrl: iconShadow, iconSize: [25, 41], iconAnchor: [12, 41] });

interface RouteDef {
  id: number;
  from: [number, number];
  to: [number, number];
  color: string;
  label: string;
  fecha: string;
}

interface Props {
  transportes: Transporte[];
  centros: Centro[];
  parcelas: Parcela[];
}

const dateLabel = (fechaCarga: string) => new Date(fechaCarga).toLocaleDateString('es-ES', { day: '2-digit', month: 'short' });

function getRouteColor(i: number): string {
  const palette = ['#0097A7', '#E91E63', '#FF9800', '#4CAF50', '#9C27B0', '#3F51B5', '#795548', '#607D8B'];
  return palette[i % palette.length];
}

const OSRM_CACHE = new Map<string, [number, number][]>();

async function fetchOsrmRoute(from: [number, number], to: [number, number], signal?: AbortSignal): Promise<[number, number][]> {
  const key = `${from[0]},${from[1]}-${to[0]},${to[1]}`;
  const cached = OSRM_CACHE.get(key);
  if (cached) return cached;

  const coordsStr = `${from[1]},${from[0]};${to[1]},${to[0]}`;
  const url = `https://router.project-osrm.org/route/v1/driving/${coordsStr}?geometries=geojson&overview=full`;
  const res = await fetch(url, { signal });
  if (!res.ok) return [from, to];
  const data = await res.json();
  if (!data.routes || data.routes.length === 0) return [from, to];

  const coords: [number, number][] = data.routes[0].geometry.coordinates.map(
    (c: [number, number]) => [c[1], c[0]],
  );
  OSRM_CACHE.set(key, coords);
  return coords;
}

L.Marker.prototype.options.icon = DefaultIcon;

export const DashboardRoutesMap = ({ transportes, centros, parcelas }: Props) => {
  const [paths, setPaths] = useState<Map<number, [number, number][]>>(new Map());

  const routes = useMemo(() => {
    const centroMap = new Map(centros.map((c) => [c.id, c]));
    const parcelaMap = new Map(parcelas.map((p) => [p.id, p]));
    const result: RouteDef[] = [];

    transportes.forEach((t, i) => {
      const wkt = t.parcelaWktGeolocalizacion || parcelaMap.get(t.parcelaId)?.wktGeolocalizacion;
      if (!wkt) return;
      const from = parseWktCenter(wkt);
      if (!from) return;

      const centro = t.centroId ? centroMap.get(t.centroId) : null;
      if (!centro || centro.latitud == null || centro.longitud == null) return;

      result.push({
        id: t.id,
        from,
        to: [centro.latitud, centro.longitud],
        color: getRouteColor(i),
        label: `${t.codigoTrazabilidad ? '#' + t.codigoTrazabilidad.slice(0, 8) : '#' + t.id}`,
        fecha: t.fechaCarga,
      });
    });

    return result;
  }, [transportes, centros, parcelas]);

  useEffect(() => {
    const abortController = new AbortController();
    const fetchAll = async () => {
      const m = new Map<number, [number, number][]>();
      await Promise.all(routes.map(async (r) => {
        try {
          const coords = await fetchOsrmRoute(r.from, r.to, abortController.signal);
          if (!abortController.signal.aborted) m.set(r.id, coords);
        } catch {
          if (abortController.signal.aborted) return;
          m.set(r.id, [r.from, r.to]);
        }
      }));
      if (!abortController.signal.aborted) setPaths(m);
    };
    fetchAll();
    return () => abortController.abort();
  }, [routes]);

  if (routes.length === 0) {
    return (
      <div style={{ height: 300, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#999' }}>
        No hay rutas para mostrar
      </div>
    );
  }

  const allPoints = routes.flatMap((r) => [r.from, r.to]);
  const bounds = L.latLngBounds(allPoints);

  return (
    <div style={{ height: 350, borderRadius: 8, overflow: 'hidden' }}>
      <MapContainer bounds={bounds} style={{ height: '100%', width: '100%' }} scrollWheelZoom={false}>
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {routes.map((r) => {
          const coords = paths.get(r.id);
          const positions = coords || [r.from, r.to];
          return (
            <Polyline
              key={r.id}
              positions={positions}
              pathOptions={{ color: r.color, weight: 3, opacity: 0.7 }}
            >
              <Tooltip permanent direction="center">{dateLabel(r.fecha)}</Tooltip>
            </Polyline>
          );
        })}
        {routes.map((r) => (
          <Marker key={`from-${r.id}`} position={r.from}>
            <Tooltip permanent direction="top">{r.label}<br />{dateLabel(r.fecha)}</Tooltip>
          </Marker>
        ))}
        {routes.map((r) => (
          <Marker key={`to-${r.id}`} position={r.to}>
            <Tooltip permanent direction="top">{r.label}<br />{dateLabel(r.fecha)}</Tooltip>
          </Marker>
        ))}
      </MapContainer>
    </div>
  );
};
