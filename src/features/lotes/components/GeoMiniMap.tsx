import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import type { Polygon as GeoJSONPolygon } from 'geojson';
import { LatLngBounds } from 'leaflet';

interface GeoMiniMapProps {
  geometria: GeoJSONPolygon | null | undefined;
  height?: number;
  width?: number;
}

export const GeoMiniMap: React.FC<GeoMiniMapProps> = ({
  geometria,
  height = 80,
  width = 120,
}) => {
  if (!geometria || geometria.type !== 'Polygon' || !geometria.coordinates?.[0]?.length) {
    return (
      <div
        style={{
          height,
          width,
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#999',
          borderRadius: 4,
        }}
      >
        Sin geo
      </div>
    );
  }

  try {
    const coordinates = geometria.coordinates[0].map(
      (p: number[]) => [p[1], p[0]] as [number, number]
    );
    const bounds = new LatLngBounds(coordinates);

    return (
      <MapContainer
        bounds={bounds}
        style={{ height, width, borderRadius: 4 }}
        zoomControl={false}
        scrollWheelZoom={false}
        doubleClickZoom={false}
        dragging={false}
        attributionControl={false}
        key={JSON.stringify(coordinates)}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
        <Polygon
          positions={coordinates}
          pathOptions={{
            color: '#FFD700',
            fillColor: '#FFD700',
            fillOpacity: 0.3,
            weight: 2,
          }}
        />
      </MapContainer>
    );
  } catch {
    return (
      <div
        style={{
          height,
          width,
          background: '#f0f0f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: 11,
          color: '#999',
          borderRadius: 4,
        }}
      >
        Error
      </div>
    );
  }
};
