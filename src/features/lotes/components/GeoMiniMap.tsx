import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import type { Polygon as GeoJSONPolygon, MultiPolygon } from 'geojson';
import { LatLngBounds } from 'leaflet';

interface GeoMiniMapProps {
  geometria: GeoJSONPolygon | MultiPolygon | null | undefined;
  height?: number | string;
  width?: number | string;
  interactive?: boolean;
  onClick?: () => void;
  className?: string;
  style?: React.CSSProperties;
}

const toLatLngs = (geom: GeoJSONPolygon | MultiPolygon): [number, number][][] => {
  if (geom.type === 'Polygon') {
    if (!geom.coordinates?.[0]?.length) return [];
    return [geom.coordinates[0].map((p: number[]) => [p[1], p[0]] as [number, number])];
  }
  if (geom.type === 'MultiPolygon') {
    const rings: [number, number][][] = [];
    geom.coordinates?.forEach((poly) => {
      if (poly?.[0]?.length) {
        rings.push(poly[0].map((p: number[]) => [p[1], p[0]] as [number, number]));
      }
    });
    return rings;
  }
  return [];
};

export const GeoMiniMap: React.FC<GeoMiniMapProps> = ({
  geometria,
  height = 80,
  width = 120,
  interactive = false,
  onClick,
  className,
  style,
}) => {
  const rings = geometria ? toLatLngs(geometria) : [];
  if (rings.length === 0 || rings[0].length === 0) {
    return (
      <div
        style={{
          height,
          width,
          background: '#f5f7fa',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#546E7A',
          borderRadius: 4,
          border: '1px solid #E8EDF2',
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
        className={className}
        onClick={onClick}
        title={onClick ? 'Ampliar mapa' : undefined}
      >
        Sin geo
      </div>
    );
  }

  try {
    const allCoords = rings.flat();
    const bounds = new LatLngBounds(allCoords);

    return (
      <div style={{ height, width, position: 'relative' }} className={className} onClick={onClick}>
        <MapContainer
          bounds={bounds}
          boundsOptions={{ padding: [6, 6] }}
          style={{ height: '100%', width: '100%', borderRadius: 4, cursor: onClick ? 'pointer' : 'default', ...style }}
          zoomControl={interactive}
          scrollWheelZoom={interactive}
          doubleClickZoom={interactive}
          dragging={interactive}
          touchZoom={interactive}
          attributionControl={interactive}
          key={JSON.stringify(rings)}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution={interactive ? '&copy; OpenStreetMap contributors' : undefined} />
          {rings.map((coords, idx) => (
            <Polygon
              key={idx}
              positions={coords}
              pathOptions={{
                color: '#F59E0B',
                fillColor: '#F59E0B',
                fillOpacity: 0.25,
                weight: 2,
              }}
            />
          ))}
        </MapContainer>
        {onClick && !interactive && (
          <div
            style={{
              position: 'absolute',
              inset: 0,
              cursor: 'pointer',
              zIndex: 500,
            }}
            title="Ampliar mapa"
          />
        )}
      </div>
    );
  } catch {
    return (
      <div
        style={{
          height,
          width,
          background: '#fef2f2',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#DC2626',
          borderRadius: 4,
          border: '1px solid #fecaca',
          cursor: onClick ? 'pointer' : 'default',
          ...style,
        }}
        className={className}
        onClick={onClick}
      >
        Error
      </div>
    );
  }
};
