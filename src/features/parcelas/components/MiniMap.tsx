// src/features/parcelas/components/MiniMap.tsx

import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import Wkt from 'wicket';
import type { Polygon as GeoJSONPolygon, MultiPolygon } from 'geojson';

interface MiniMapProps {
  wktGeometry: string | null;
  height?: string | number;
  width?: string | number;
  interactive?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const toLatLngs = (geom: GeoJSONPolygon | MultiPolygon): [number, number][][] => {
  if (geom.type === 'Polygon') {
    return [geom.coordinates[0].map((point: number[]) => [point[1], point[0]] as [number, number])];
  }
  if (geom.type === 'MultiPolygon') {
    return geom.coordinates.map((poly) =>
      poly[0].map((point: number[]) => [point[1], point[0]] as [number, number])
    );
  }
  return [];
};

export const MiniMap: React.FC<MiniMapProps> = ({
  wktGeometry,
  height = '100%',
  width = '100%',
  interactive = false,
  className,
  style,
}) => {
  if (!wktGeometry) {
    return (
      <div
        style={{
          height,
          width,
          backgroundColor: '#f5f7fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#546E7A',
          borderRadius: '8px',
          border: '1px solid #E8EDF2',
          ...style,
        }}
        className={className}
      >
        Sin geometría
      </div>
    );
  }

  const wkt = new Wkt.Wkt();
  try {
    wkt.read(wktGeometry);
    const geoJson = wkt.toJson() as GeoJSONPolygon | MultiPolygon;

    const rings = toLatLngs(geoJson);
    if (rings.length === 0 || rings[0].length === 0) {
      return (
        <div
          style={{
            height,
            width,
            backgroundColor: '#f5f7fa',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#546E7A',
            borderRadius: '8px',
            border: '1px solid #E8EDF2',
            ...style,
          }}
          className={className}
        >
          Sin geometría válida
        </div>
      );
    }

    const allCoords = rings.flat();
    const bounds = new LatLngBounds(allCoords);

    return (
      <MapContainer
        bounds={bounds}
        boundsOptions={{ padding: [10, 10] }}
        style={{ height, width, borderRadius: '8px', ...style }}
        className={className}
        zoomControl={interactive}
        scrollWheelZoom={interactive}
        doubleClickZoom={interactive}
        dragging={interactive}
        touchZoom={interactive}
        attributionControl={interactive}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution={interactive ? '&copy; OpenStreetMap contributors' : undefined}
        />
        {rings.map((coords, idx) => (
          <Polygon key={idx} positions={coords} pathOptions={{ color: '#2E7D32', fillColor: '#43A047', fillOpacity: 0.25, weight: 2 }} />
        ))}
      </MapContainer>
    );
  } catch {
    return (
      <div
        style={{
          height,
          width,
          backgroundColor: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: '#DC2626',
          borderRadius: '8px',
          border: '1px solid #fecaca',
          ...style,
        }}
        className={className}
      >
        Error al leer geometría
      </div>
    );
  }
};
