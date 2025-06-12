import React, { useEffect } from 'react';
import { MapContainer, TileLayer, Polygon, Tooltip, Marker, Popup, useMap } from 'react-leaflet';
import type { LatLngExpression } from 'leaflet' 
import { LatLngBounds } from 'leaflet';
import Wkt from 'wicket';
import type { Parcela } from '../types/parcela.types';

const ChangeMapView = ({ selectedParcela, parcelas }: { selectedParcela: Parcela | undefined, parcelas: Parcela[] }) => {
  const map = useMap();

  useEffect(() => {
    if (selectedParcela?.wktGeolocalizacion) {
      const wkt = new Wkt.Wkt();
      wkt.read(selectedParcela.wktGeolocalizacion);
      const geoJson = wkt.toJson();

      if (geoJson.type === 'Polygon') {
        const coordinates = geoJson.coordinates[0].map((point: number[]) => [point[1], point[0]] as [number, number]);
        const bounds = new LatLngBounds(coordinates);
        map.fitBounds(bounds, { padding: [50, 50] });
      } else if (geoJson.type === 'Point') {
        const position: LatLngExpression = [geoJson.coordinates[1], geoJson.coordinates[0]];
        map.flyTo(position, 16);
      }
    } 

    else if (parcelas.length > 0) {
        const allPoints: LatLngExpression[] = [];

        parcelas.forEach(p => {
            if (p.wktGeolocalizacion) {
                const wkt = new Wkt.Wkt();
                try {
                    wkt.read(p.wktGeolocalizacion);
                    const geoJson = wkt.toJson();

                    if (geoJson.type === 'Polygon') {
                        const polygonPoints = geoJson.coordinates[0].map((point: number[]) => [point[1], point[0]] as LatLngExpression);
                        allPoints.push(...polygonPoints);
                    } else if (geoJson.type === 'Point') {
                        const pointPosition: LatLngExpression = [geoJson.coordinates[1], geoJson.coordinates[0]];
                        allPoints.push(pointPosition);
                    }
                } catch (e) {
                }
            }
        });

        if (allPoints.length > 0) {
            const bounds = new LatLngBounds(allPoints);
            map.fitBounds(bounds, { padding: [50, 50] });
        }
    }
  }, [selectedParcela, parcelas, map]);

  return null;
  };

interface ParcelasMapProps {
  parcelas: Parcela[];
  selectedParcelaId: string | null;
}

export const ParcelasMap: React.FC<ParcelasMapProps> = ({ parcelas, selectedParcelaId }) => {
  const mapCenter: LatLngExpression = [41.652, -4.728];
  const selectedParcela = parcelas.find(p => p.id === selectedParcelaId);

  return (
    <MapContainer center={mapCenter} zoom={13} style={{ height: '60vh', width: '100%', borderRadius: '8px' }}>
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      
      {parcelas.map((parcela) => {
        if (!parcela.wktGeolocalizacion) return null;
        const wkt = new Wkt.Wkt();
        try {
          wkt.read(parcela.wktGeolocalizacion);
          const geoJson = wkt.toJson();
          if (geoJson.type === 'Polygon') {
            const positions = geoJson.coordinates.map((ring: number[][]) => 
              ring.map((point: number[]) => [point[1], point[0]] as LatLngExpression)
            );
            return <Polygon key={parcela.id} positions={positions} pathOptions={{ color: parcela.id === selectedParcelaId ? 'red' : 'purple' }}><Tooltip>{parcela.nombre}</Tooltip></Polygon>;
          } else if (geoJson.type === 'Point') {
            const coordinates = geoJson.coordinates;
            const position: LatLngExpression = [coordinates[1], coordinates[0]];
            return <Marker key={parcela.id} position={position}><Popup>{parcela.nombre}</Popup></Marker>;
          }
          return null;
        } catch (e) {
          console.error(`Error parseando WKT para la parcela ${parcela.id}:`, e);
          return null;
        }
      })}

      <ChangeMapView selectedParcela={selectedParcela} parcelas={parcelas}/>
    </MapContainer>
  );
};