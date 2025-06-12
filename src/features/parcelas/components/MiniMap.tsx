// src/features/parcelas/components/MiniMap.tsx

import React from 'react';
import { MapContainer, TileLayer, Polygon } from 'react-leaflet';
import { LatLngBounds } from 'leaflet';
import Wkt from 'wicket';

interface MiniMapProps {
  wktGeometry: string | null;
}

export const MiniMap: React.FC<MiniMapProps> = ({ wktGeometry }) => {
  if (!wktGeometry) {
    return <div style={{ height: '100px', width: '150px', backgroundColor: '#f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>Sin Geometría</div>;
  }

  const wkt = new Wkt.Wkt();
  try {
    wkt.read(wktGeometry);
    const geoJson = wkt.toJson();

    if (geoJson.type === 'Polygon') {
      const coordinates = geoJson.coordinates[0].map((point: number[]) => [point[1], point[0]] as [number, number]);
      const bounds = new LatLngBounds(coordinates);

      return (
        <MapContainer
          bounds={bounds}
          style={{ height: '100px', width: '150px' }}
          zoomControl={false}
          scrollWheelZoom={false}
          doubleClickZoom={false}
          dragging={false}
          attributionControl={false}
        >
          <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
          <Polygon positions={coordinates} pathOptions={{ color: 'green' }} />
        </MapContainer>
      );
    }
  } catch (e) {
    return <div style={{ height: '100px', width: '150px', color: 'red' }}>Error WKT</div>;
  }

  return null;
};