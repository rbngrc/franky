import { useEffect, useRef, useState } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import Wkt from 'wicket';
import type { Polygon as GeoJSONPolygon, MultiPolygon } from 'geojson';
import { isLoteInsideParcela } from '../utils/geometryUtils';

interface LoteMapDrawerProps {
  parcelaWkt: string | null;
  geometria: GeoJSONPolygon | null;
  onGeometriaChange: (geo: GeoJSONPolygon | null) => void;
}

const CONTAINER_ID = 'lote-map-drawer';

export const LoteMapDrawer: React.FC<LoteMapDrawerProps> = ({
  parcelaWkt,
  geometria,
  onGeometriaChange,
}) => {
  const mapRef = useRef<L.Map | null>(null);
  const parcelaLayerRef = useRef<L.GeoJSON | null>(null);
  const drawnPolygonRef = useRef<L.Polygon | null>(null);
  const drawingModeRef = useRef(false);
  const drawMarkersRef = useRef<L.LayerGroup | null>(null);
  const drawLineRef = useRef<L.Polyline | null>(null);
  const parcelaGeoJsonRef = useRef<GeoJSONPolygon | MultiPolygon | null>(null);

  const [drawingMode, setDrawingMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mapReady, setMapReady] = useState(false);
  const [invalidDraw, setInvalidDraw] = useState(false);

  const handleMapClick = (e: L.LeafletMouseEvent) => {
    if (!drawingModeRef.current) return;
    setDrawPoints(prev => [...prev, [e.latlng.lat, e.latlng.lng]]);
  };

  useEffect(() => {
    if (mapRef.current) return;
    const map = L.map(CONTAINER_ID, { zoomControl: true }).setView([41.6528, -4.7244], 12);

    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);

    map.on('click', handleMapClick);
    mapRef.current = map;
    setMapReady(true);

    return () => {
      map.off('click', handleMapClick);
      map.remove();
      mapRef.current = null;
    };
  }, []);

  useEffect(() => {
    if (!mapRef.current || !parcelaWkt || !mapReady) return;

    if (parcelaLayerRef.current) {
      parcelaLayerRef.current.remove();
      parcelaLayerRef.current = null;
    }
    parcelaGeoJsonRef.current = null;

    try {
      const wkt = new Wkt.Wkt();
      wkt.read(parcelaWkt);
      const geoJson = wkt.toJson();

      if (geoJson.type === 'Polygon' || geoJson.type === 'MultiPolygon') {
        parcelaGeoJsonRef.current = geoJson;
        parcelaLayerRef.current = L.geoJSON(geoJson, {
          style: {
            color: '#1565C0',
            weight: 2,
            fillOpacity: 0.08,
            fillColor: '#1565C0',
          },
        }).addTo(mapRef.current);
        mapRef.current.fitBounds(parcelaLayerRef.current.getBounds());
      }
    } catch {
      setError('Error al cargar la geometría de la parcela');
    }
  }, [parcelaWkt, mapReady]);

  useEffect(() => {
    if (!mapRef.current || !mapReady) return;

    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.remove();
      drawnPolygonRef.current = null;
    }

    if (!geometria) return;

    try {
      const coords = geometria.coordinates[0].map(
        (p: number[]) => [p[1], p[0]] as [number, number]
      );
      drawnPolygonRef.current = L.polygon(coords, {
        color: '#FFD700',
        weight: 2,
        fillOpacity: 0.3,
        fillColor: '#FFD700',
      }).addTo(mapRef.current);
    } catch {
      // invalid geometry
    }
  }, [geometria, mapReady]);

  useEffect(() => {
    if (!mapRef.current) return;
    const container = mapRef.current.getContainer();
    container.style.cursor = drawingMode ? 'crosshair' : '';
  }, [drawingMode]);

  useEffect(() => {
    if (!mapRef.current) return;

    if (!drawMarkersRef.current) {
      drawMarkersRef.current = L.layerGroup().addTo(mapRef.current);
    }
    drawMarkersRef.current.clearLayers();

    if (drawLineRef.current) {
      if (drawPoints.length > 0) {
        drawLineRef.current.setLatLngs(drawPoints);
      } else {
        drawLineRef.current.remove();
        drawLineRef.current = null;
      }
    } else if (drawPoints.length > 0) {
      drawLineRef.current = L.polyline(drawPoints, {
        color: '#FFD700',
        weight: 2,
        dashArray: '5, 5',
      }).addTo(mapRef.current);
    }

    drawPoints.forEach((point) => {
      L.circleMarker(point, {
        radius: 6,
        color: '#FFD700',
        fillColor: '#FFD700',
        fillOpacity: 1,
        weight: 2,
      }).addTo(drawMarkersRef.current!);
    });
  }, [drawPoints]);

  const startDrawing = () => {
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.remove();
      drawnPolygonRef.current = null;
    }
    drawingModeRef.current = true;
    setDrawingMode(true);
    setDrawPoints([]);
    setError(null);
    setInvalidDraw(false);
  };

  const handleDrawingComplete = () => {
    if (drawPoints.length < 3) {
      setError('Necesitas al menos 3 puntos para dibujar un polígono.');
      return;
    }

    if (!mapRef.current) return;

    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.remove();
    }

    const latLngs = drawPoints.map(p => L.latLng(p[0], p[1]));
    drawnPolygonRef.current = L.polygon(latLngs, {
      color: '#FFD700',
      weight: 2,
      fillOpacity: 0.3,
      fillColor: '#FFD700',
    }).addTo(mapRef.current);

    const geometry: GeoJSONPolygon = {
      type: 'Polygon',
      coordinates: [drawPoints.map((p): number[] => [p[1], p[0]])],
    };

    if (!isLoteInsideParcela(geometry, parcelaGeoJsonRef.current)) {
      setError('El polígono del lote debe estar completamente dentro de la parcela.');
      setInvalidDraw(true);
      drawingModeRef.current = false;
      setDrawingMode(false);
      setDrawPoints([]);
      return;
    }

    onGeometriaChange(geometry);
    drawingModeRef.current = false;
    setDrawingMode(false);
    setDrawPoints([]);
    setError(null);
    setInvalidDraw(false);
  };

  const handleCancelDrawing = () => {
    drawingModeRef.current = false;
    setDrawingMode(false);
    setDrawPoints([]);

    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.remove();
      drawnPolygonRef.current = null;
    }
    if (drawLineRef.current) {
      drawLineRef.current.remove();
      drawLineRef.current = null;
    }
    if (drawMarkersRef.current) {
      drawMarkersRef.current.clearLayers();
    }

    setError(null);
    setInvalidDraw(false);

    if (geometria) {
      onGeometriaChange(geometria);
    } else {
      onGeometriaChange(null);
    }
  };

  const handleClearGeometry = () => {
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.remove();
      drawnPolygonRef.current = null;
    }
    if (drawMarkersRef.current) {
      drawMarkersRef.current.clearLayers();
    }
    if (drawLineRef.current) {
      drawLineRef.current.remove();
      drawLineRef.current = null;
    }
    setDrawPoints([]);
    drawingModeRef.current = false;
    setDrawingMode(false);
    setError(null);
    setInvalidDraw(false);
    onGeometriaChange(null);
  };

  const hasGeometry = !!geometria || invalidDraw;

  return (
    <div style={{ marginBottom: '1rem' }}>
      <div
        id={CONTAINER_ID}
        style={{ height: 400, width: '100%', borderRadius: 4, border: '1px solid #ddd' }}
      />

      {!parcelaWkt && (
        <p style={{ color: '#888', fontSize: 13, marginTop: 4 }}>
          No hay geometría de parcela disponible. Guarda la parcela con geometría para poder dibujar lotes.
        </p>
      )}

      {error && (
        <p style={{ color: '#D32F2F', fontSize: 13, margin: '6px 0', padding: '4px 8px', background: '#ffeef0', borderRadius: 4 }}>
          {error}
        </p>
      )}

      <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
        {!drawingMode ? (
          <button
            type="button"
            onClick={startDrawing}
            disabled={!parcelaWkt}
            className="btn btn-sm btn-primary"
          >
            {hasGeometry ? 'Redibujar lote' : 'Dibujar lote'}
          </button>
        ) : (
          <>
            <button
              type="button"
              onClick={handleDrawingComplete}
              disabled={drawPoints.length < 3}
              className="btn btn-sm btn-primary"
              style={{ opacity: drawPoints.length >= 3 ? 1 : 0.5 }}
            >
              Finalizar polígono ({drawPoints.length} pts)
            </button>
            <button type="button" onClick={handleCancelDrawing} className="btn btn-sm btn-secondary">
              Cancelar dibujo
            </button>
          </>
        )}
        {hasGeometry && !drawingMode && (
          <button type="button" onClick={handleClearGeometry} className="btn btn-sm btn-danger">
            Eliminar geometría
          </button>
        )}
      </div>

      {drawingMode && (
        <p style={{ fontSize: 12, color: '#888', marginTop: 4 }}>
          Haz clic en el mapa para añadir puntos al polígono del lote
        </p>
      )}
    </div>
  );
};
