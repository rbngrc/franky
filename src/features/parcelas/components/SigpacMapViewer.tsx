import React, { useEffect, useRef, useState, useCallback } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import type { FeatureCollection, Geometry, Feature, Polygon, MultiPolygon } from 'geojson';
import type { ParcelaSigpac } from '../types/parcela.types';

const WMS_CATASTRO_URL = 'https://ovc.catastro.meh.es/Cartografia/WMS/ServidorWMS.aspx';

interface ParcelaFeatureProps {
  id?: string;
  nombre?: string;
  referenciaCatastral?: string;
  rc?: string;
  area?: number;
  calculatedArea?: number;
  SUPERFICIE?: number;
  REFERENCIA?: string;
  PROVINCIA?: string;
  provincia?: string;
  MUNICIPIO?: string;
  municipio?: string;
  recinto?: string;
  poligono?: string;
  parcela?: string;
  RECINTO?: string;
  POLIGONO?: string;
  PARCELA?: string;
  NOMBRE?: string;
  [key: string]: unknown;
}

type CachedFeature = Feature<Polygon | MultiPolygon>;

interface SigpacMapViewerProps {
  geojsonData?: FeatureCollection<Geometry>;
  selectedParcelaId?: string | null;
  onParcelaSelect: (p: ParcelaSigpac | null) => void;
  onUbicacionResolved?: (provincia: string, municipio: string) => void;
  center?: [number, number];
  loading?: boolean;
  error?: string | null;
  provincia?: string;
  municipio?: string;
}

export const SigpacMapViewer: React.FC<SigpacMapViewerProps> = ({
  geojsonData,
  selectedParcelaId = null,
  onParcelaSelect,
  onUbicacionResolved,
  center = [41.6528, -4.7244],
  loading = false,
  provincia,
  municipio,
}) => {
  const [resolvedProvincia, setResolvedProvincia] = useState('');
  const [resolvedMunicipio, setResolvedMunicipio] = useState('');
  const activeProvincia = provincia || resolvedProvincia;
  const activeMunicipio = municipio || resolvedMunicipio;
  const mapRef = useRef<L.Map | null>(null);
  const geoJsonLayerRef = useRef<L.GeoJSON | null>(null);
  const wmsLayerRef = useRef<L.TileLayer.WMS | null>(null);
  const drawnPolygonRef = useRef<L.Polygon | null>(null);
  const drawingModeRef = useRef(false);
  const drawMarkersRef = useRef<L.LayerGroup | null>(null);
  const drawLineRef = useRef<L.Polyline | null>(null);
  const highlightRef = useRef<L.Layer | null>(null);
  const actionAbortRef = useRef<AbortController | null>(null);

  const abortActionFetch = () => {
    if (actionAbortRef.current) {
      actionAbortRef.current.abort();
    }
  };

  const [mapError, setMapError] = useState<string | null>(null);
  const [internalLoading, setInternalLoading] = useState(false);
  const [selectedParcela, setSelectedParcela] = useState<ParcelaSigpac | null>(null);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [rcInput, setRcInput] = useState('');
  const [rcFromClick, setRcFromClick] = useState<string | null>(null);
  const [geometryLoading, setGeometryLoading] = useState(false);
  const [drawingMode, setDrawingMode] = useState(false);
  const [drawPoints, setDrawPoints] = useState<[number, number][]>([]);
  const clickCoordsRef = useRef<[number, number] | null>(null);
  const provinciaRef = useRef<string | undefined>(provincia);
  const municipioRef = useRef<string | undefined>(municipio);
  const [parcelaFoundMsg, setParcelaFoundMsg] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const cachedFeaturesRef = useRef<CachedFeature[] | null>(null);
  const geoJsonStatusRef = useRef<'idle' | 'loading' | 'loaded' | 'error'>('idle');
  const prevSelectedIdRef = useRef<string | null | undefined>(null);

  const styleForFeature = (feature?: Feature): L.PathOptions => {
    const props = feature?.properties ?? {};
    const id = props?.id || '';
    const isSelected = selectedParcelaId ? id === selectedParcelaId : false;
    return {
      color: isSelected ? '#3D4EE2' : '#2E8B57',
      weight: isSelected ? 3 : 1,
      opacity: 1,
      fillOpacity: isSelected ? 0.5 : 0.32,
      fillColor: isSelected ? '#3D4EE2' : '#2E8B57'
    };
  };

  const addGeoJsonToMap = (data: FeatureCollection<Geometry>, fit = true) => {
    if (!mapRef.current) return;
    if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
      geoJsonLayerRef.current = null;
    }
    geoJsonLayerRef.current = L.geoJSON(data, {
      style: styleForFeature,
      pointToLayer: () => L.layerGroup([]),
    }).addTo(mapRef.current!);
    try {
      const bounds = geoJsonLayerRef.current.getBounds();
      if (fit && bounds.isValid()) mapRef.current!.fitBounds(bounds);
      setMapError(null);
    } catch {
      // bounds no válidos, se omite el fitBounds
    }
  };

  const addHighlight = (latlng: L.LatLngExpression) => {
    if (highlightRef.current) highlightRef.current.remove();
    const ll = L.latLng(latlng);
    const size = 0.0008;
    highlightRef.current = L.rectangle(
      [[ll.lat - size, ll.lng - size], [ll.lat + size, ll.lng + size]],
      { color: '#1565C0', weight: 2, fillOpacity: 0.1, fillColor: '#1565C0' }
    ).addTo(mapRef.current!);
  };
  const removeHighlight = () => {
    if (highlightRef.current) { highlightRef.current.remove(); highlightRef.current = null; }
  };

  const fetchGeometriaPorRC = useCallback(async (rc: string) => {
    if (!rc || rc.length < 10) return;
    setGeometryLoading(true);
    setMapError(null);
    setStatusMessage('Obteniendo geometría de la parcela...');
    abortActionFetch();
    const controller = new AbortController();
    actionAbortRef.current = controller;
    try {
      const clickCoords = clickCoordsRef.current;
      let url = `/api/v1/sigpac/parcela-geometry?rc=${encodeURIComponent(rc)}`;
      if (clickCoords) {
        url += `&lat=${clickCoords[0]}&lng=${clickCoords[1]}`;
      }
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) throw new Error('No se pudo obtener la geometría');
      const data = (await res.json()) as FeatureCollection<Geometry>;
      if (data.features?.length > 0) {
        const feature = data.features[0];
        const props = feature.properties ?? {};
        resolverUbicacion(props);
        const geojson: FeatureCollection<Geometry> = {
          type: 'FeatureCollection',
          features: [feature]
        };
        addGeoJsonToMap(geojson, true);

        if (feature.geometry?.type === 'Point') {
          addHighlight([feature.geometry.coordinates[1], feature.geometry.coordinates[0]] as [number, number]);
        } else if (geoJsonLayerRef.current) {
          try { addHighlight(geoJsonLayerRef.current.getBounds().getCenter()); } catch { /* bounds no disponibles */ }
        }

        const area = feature.properties?.area ?? feature.properties?.calculatedArea ?? 0;
        const parcela: ParcelaSigpac = {
          id: rc,
          nombre: `Parcela ${rc}`,
          provincia: '',
          municipio: '',
          recinto: '',
          poligono: '',
          parcela: '',
          area: area,
          geometry: feature.geometry
        };
        setSelectedParcela(parcela);
        setDrawerOpen(true);
        onParcelaSelect(parcela);
        setParcelaFoundMsg(`Geometría cargada para RC ${rc}`);
        setMapError(null);
      } else {
        removeHighlight();
        setParcelaFoundMsg(null);
        setMapError('No hay geometría disponible para esta referencia catastral en el servicio INSPIRE.');
      }
    } catch (err: unknown) {
      removeHighlight();
      setParcelaFoundMsg(null);
      const msg = err instanceof Error ? err.message : String(err);
      setMapError(`Error obteniendo geometría: ${msg}. Puedes dibujar el polígono manualmente.`);
    } finally {
      setGeometryLoading(false);
      setStatusMessage(null);
    }
  }, [onParcelaSelect]);

  const handleFetchGeometry = () => {
    const rc = rcInput.trim() || rcFromClick || '';
    if (rc) fetchGeometriaPorRC(rc);
  };

  const handleParcelaResult = (feature: Feature, data: FeatureCollection<Geometry>) => {
    const props: ParcelaFeatureProps = feature.properties ?? {};
    const rc = props.referenciaCatastral || props.rc || '';
    const area = props.area || props.calculatedArea || 0;

    resolverUbicacion(props);
    addGeoJsonToMap(data, true);

    const parcela: ParcelaSigpac = {
      id: rc || `click-${Date.now()}`,
      nombre: props.nombre || `Parcela ${rc}`,
      provincia: props.PROVINCIA || props.provincia || '',
      municipio: props.MUNICIPIO || props.municipio || '',
      recinto: props.recinto || '',
      poligono: props.poligono || '',
      parcela: props.parcela || '',
      area: area,
      geometry: feature.geometry,
    };
    setSelectedParcela(parcela);
    setDrawerOpen(true);
    onParcelaSelect(parcela);

    if (rc) {
      setRcFromClick(rc);
      setRcInput(rc);
    }
  };

  const handleMapClick = async (e: L.LeafletMouseEvent) => {
    if (drawingModeRef.current) {
      removeHighlight();
      setParcelaFoundMsg(null);
      setMapError(null);
      const latlng: [number, number] = [e.latlng.lat, e.latlng.lng];
      setDrawPoints(prev => [...prev, latlng]);
      return;
    }

    const { lat, lng } = e.latlng;
    clickCoordsRef.current = [lat, lng];
    setMapError(null);

    const features = cachedFeaturesRef.current;
    if (features && features.length > 0) {
      removeHighlight();
      setParcelaFoundMsg(null);
      const clickCoord: [number, number] = [lng, lat];

      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        try {
          if (booleanPointInPolygon(clickCoord, feature)) {
            const props: ParcelaFeatureProps = feature.properties ?? {};
            const rc = props.REFERENCIA || props.referenciaCatastral || props.rc || '';
            const area = props.SUPERFICIE || props.area || props.calculatedArea || 0;

            resolverUbicacion(props);
            const data: FeatureCollection<Geometry> = {
              type: 'FeatureCollection' as const,
              features: [feature]
            };
            addGeoJsonToMap(data, true);

            const parcela: ParcelaSigpac = {
              id: rc || `click-${Date.now()}`,
              nombre: props.nombre || props.NOMBRE || rc ? `Parcela ${rc}` : 'Parcela',
              provincia: props.PROVINCIA || props.provincia || provincia || '',
              municipio: props.MUNICIPIO || props.municipio || municipio || '',
              recinto: props.RECINTO || props.recinto || '',
              poligono: props.POLIGONO || props.poligono || '',
              parcela: props.PARCELA || props.parcela || '',
              area: area,
              geometry: feature.geometry,
            };
            setSelectedParcela(parcela);
            setDrawerOpen(true);
            onParcelaSelect(parcela);

            if (rc) {
              setRcFromClick(rc);
              setRcInput(rc);
            }
            setParcelaFoundMsg(`Parcela encontrada: ${rc ? `RC ${rc}` : ''}`.trim());
            return;
          }
        } catch {
          continue;
        }
      }

      setParcelaFoundMsg(null);
      setMapError('No se encontró ninguna parcela catastral en esa ubicación. Prueba con zoom más cercano, introduce la RC manualmente o usa el modo dibujo.');
      return;
    }

    if (geoJsonStatusRef.current === 'loading') {
      // cache aún cargando, fallback al backend
    }
    setInternalLoading(true);
    setStatusMessage('Buscando parcela en Catastro...');
    abortActionFetch();
    const controller = new AbortController();
    actionAbortRef.current = controller;

    try {
      let url = `/api/v1/sigpac/parcela-por-click?lat=${lat}&lng=${lng}`;
      const p = provinciaRef.current;
      const m = municipioRef.current;
      if (p && m) {
        url += `&provincia=${encodeURIComponent(p)}&municipio=${encodeURIComponent(m)}`;
      }
      const res = await fetch(url, { signal: controller.signal });
      if (res.ok) {
        const data = (await res.json()) as FeatureCollection<Geometry>;
        if (data.features && data.features.length > 0) {
          setInternalLoading(false);
          setStatusMessage(null);
          handleParcelaResult(data.features[0], data);
          const geomType = data.features[0].geometry?.type;
          if (geomType === 'Point' || !geomType) {
            addHighlight([lat, lng]);
          }
          const rc = data.features[0].properties?.referenciaCatastral || data.features[0].properties?.rc || '';
          setParcelaFoundMsg(`Parcela encontrada: ${rc ? `RC ${rc}` : ''}`.trim());
          return;
        }
      }
    } catch (err: unknown) {
      removeHighlight();
      setParcelaFoundMsg(null);
      setMapError(err instanceof Error ? `Error: ${err.message}` : 'Error en la petición');
      setInternalLoading(false);
      setStatusMessage(null);
      return;
    }

    removeHighlight();
    setParcelaFoundMsg(null);
    setMapError('No se encontró ninguna parcela catastral en esa ubicación. Prueba con zoom más cercano, introduce la RC manualmente o usa el modo dibujo.');
    setInternalLoading(false);
    setStatusMessage(null);
  };

  const handleDrawingComplete = () => {
    if (drawPoints.length < 3) {
      setMapError('Necesitas al menos 3 puntos para dibujar un polígono.');
      return;
    }
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.remove();
    }
    if (mapRef.current) {
      drawnPolygonRef.current = L.polygon(drawPoints, {
        color: '#3D4EE2',
        weight: 2,
        fillOpacity: 0.3
      }).addTo(mapRef.current);
      mapRef.current.fitBounds(drawnPolygonRef.current.getBounds());
    }
    const geometry: Polygon = {
      type: 'Polygon',
      coordinates: [drawPoints.map((p): number[] => [p[1], p[0]])]
    };
    const parcela: ParcelaSigpac = {
      id: `manual-${Date.now()}`,
      nombre: `Parcela dibujada`,
      provincia: '', municipio: '', recinto: '', poligono: '', parcela: '',
      area: 0,
      geometry
    };
    setSelectedParcela(parcela);
    setDrawerOpen(true);
    onParcelaSelect(parcela);
    removeHighlight();
    setParcelaFoundMsg(null);
    setMapError(null);
    drawingModeRef.current = false;
    setDrawingMode(false);
    setDrawPoints([]);
  };

  const handleCancelDrawing = () => {
    drawingModeRef.current = false;
    setDrawingMode(false);
    setDrawPoints([]);
    removeHighlight();
    setParcelaFoundMsg(null);
    setMapError(null);
    if (drawnPolygonRef.current) {
      drawnPolygonRef.current.remove();
      drawnPolygonRef.current = null;
    }
    if (drawLineRef.current) { drawLineRef.current.remove(); drawLineRef.current = null; }
  };

  // init map
  useEffect(() => {
    try {
      if (!mapRef.current) {
        const map = L.map('map-container').setView(center, 12);
        L.tileLayer(
          'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
          { attribution: '&copy; Esri, USGS', maxZoom: 20 }
        ).addTo(map);

        const wms = L.tileLayer.wms(WMS_CATASTRO_URL, {
          layers: 'PARCELA',
          format: 'image/png',
          transparent: true,
          version: '1.1.1',
          crs: L.CRS.EPSG4326,
          attribution: '&copy; Catastro'
        }).addTo(map);

        let tileTotal = 0, tileLoaded = 0;

        wms.on('tileloadstart', () => { tileTotal++; });
        wms.on('tileload', () => { tileLoaded++; });
        wms.on('tileerror', () => { });

        const retryTimer = setTimeout(() => {
          if (tileLoaded === 0 && tileTotal > 0) {
            map.removeLayer(wms);
            const wms3857 = L.tileLayer.wms(WMS_CATASTRO_URL, {
              layers: 'PARCELA',
              format: 'image/png',
              transparent: true,
              version: '1.1.1',
              crs: L.CRS.EPSG3857,
              attribution: '&copy; Catastro'
            }).addTo(map);
            wms3857.on('tileload', () => { tileLoaded++; });
            wms3857.on('tileerror', () => { });
            wmsLayerRef.current = wms3857;
          }
        }, 12000);

        wmsLayerRef.current = wms;

        map.on('click', handleMapClick);
        mapRef.current = map;

        // cleanup timers on unmount
        const clearTimers = () => { clearTimeout(retryTimer); };
        map.on('unload', clearTimers);
      }
    } catch {
      setMapError('Error al inicializar el mapa');
    }

    return () => {
      abortActionFetch();
      if (mapRef.current) {
        mapRef.current.off('click', handleMapClick);
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    provinciaRef.current = provincia;
    municipioRef.current = municipio;
  }, [provincia, municipio]);

  useEffect(() => {
    if (!activeProvincia || !activeMunicipio) {
      return;
    }

    geoJsonStatusRef.current = 'loading';
    setStatusMessage('Descargando parcelas del municipio...');

    const abortController = new AbortController();
    const fetchGeoJson = async () => {
      try {
        const url = `/api/v1/sigpac/geojson?provincia=${encodeURIComponent(activeProvincia)}&municipio=${encodeURIComponent(activeMunicipio)}`;
        const res = await fetch(url, { signal: abortController.signal });
        if (res.ok) {
          const data = await res.json();
          cachedFeaturesRef.current = data.features || [];
          geoJsonStatusRef.current = 'loaded';
        } else {
          cachedFeaturesRef.current = null;
          geoJsonStatusRef.current = 'error';
        }
      } catch {
        if (!abortController.signal.aborted) {
          cachedFeaturesRef.current = null;
          geoJsonStatusRef.current = 'error';
        }
      } finally {
        if (!abortController.signal.aborted) {
          setStatusMessage(null);
        }
      }
    };

    fetchGeoJson();
    return () => abortController.abort();
  }, [activeProvincia, activeMunicipio]);

  useEffect(() => {
    if (prevSelectedIdRef.current && !selectedParcelaId) {
      cachedFeaturesRef.current = null;
    }
    prevSelectedIdRef.current = selectedParcelaId;
  }, [selectedParcelaId]);

  useEffect(() => {
    if (mapRef.current && center) {
      try { mapRef.current.setView(center); } catch { /* view no válida */ }
    }
  }, [center]);

  useEffect(() => {
    if (!mapRef.current) return;
    if (geojsonData && geojsonData.features?.length > 0) {
      addGeoJsonToMap(geojsonData, true);
    } else if (geoJsonLayerRef.current) {
      geoJsonLayerRef.current.remove();
      geoJsonLayerRef.current = null;
    }
  }, [geojsonData]);

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
        color: '#3D4EE2',
        weight: 2,
        dashArray: '5, 5',
      }).addTo(mapRef.current);
    }

    drawPoints.forEach((point) => {
      L.circleMarker(point, {
        radius: 6,
        color: '#3D4EE2',
        fillColor: '#3D4EE2',
        fillOpacity: 1,
        weight: 2,
      }).addTo(drawMarkersRef.current!);
    });
  }, [drawPoints]);

  const resolverUbicacion = useCallback((props: ParcelaFeatureProps) => {
    const rp = (props.PROVINCIA || props.provincia || '').toUpperCase();
    const rm = (props.MUNICIPIO || props.municipio || '').toUpperCase();
    if (rp && rm) {
      if (rp !== (provincia || resolvedProvincia).toUpperCase() || rm !== (municipio || resolvedMunicipio).toUpperCase()) {
        setResolvedProvincia(rp);
        setResolvedMunicipio(rm);
        if (onUbicacionResolved) onUbicacionResolved(rp, rm);
      }
    }
  }, [provincia, resolvedProvincia, municipio, resolvedMunicipio, onUbicacionResolved]);

  const handleClear = () => {
    if (geoJsonLayerRef.current) { geoJsonLayerRef.current.remove(); geoJsonLayerRef.current = null; }
    if (drawnPolygonRef.current) { drawnPolygonRef.current.remove(); drawnPolygonRef.current = null; }
    if (drawMarkersRef.current) { drawMarkersRef.current.clearLayers(); }
    if (drawLineRef.current) { drawLineRef.current.remove(); drawLineRef.current = null; }
    setSelectedParcela(null);
    setDrawerOpen(false);
    setParcelaFoundMsg(null);
    setMapError(null);
    setStatusMessage(null);
    removeHighlight();
    setRcFromClick(null);
    setRcInput('');
    setDrawPoints([]);
    drawingModeRef.current = false;
    setDrawingMode(false);
    clickCoordsRef.current = null;
    setResolvedProvincia('');
    setResolvedMunicipio('');
    onParcelaSelect(null);
  };

  return (
    <div style={{ display: 'flex', width: '100%', position: 'relative' }}>
      <div style={{ flex: 1, position: 'relative' }}>
        {drawingMode && (
          <div style={{ position: 'absolute', top: 50, left: 10, zIndex: 1100, background: '#fff3cd', padding: '8px 12px', borderRadius: 6, border: '1px solid #ffc107' }}>
            <p style={{ margin: '0 0 6px', fontSize: 13 }}>Haz clic en el mapa para añadir puntos al polígono ({drawPoints.length} puntos)</p>
            <div style={{ display: 'flex', gap: 6 }}>
              <button onClick={handleDrawingComplete} disabled={drawPoints.length < 3}
                style={{ padding: '4px 10px', background: '#2E8B57', color: '#fff', border: 'none', borderRadius: 4, cursor: drawPoints.length >= 3 ? 'pointer' : 'not-allowed' }}>
                Finalizar polígono
              </button>
              <button onClick={handleCancelDrawing}
                style={{ padding: '4px 10px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>
                Cancelar
              </button>
            </div>
          </div>
        )}

        <div style={{ marginBottom: 8, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
          <input
            type="text"
            placeholder="Referencia catastral (14 dígitos)"
            value={rcInput}
            onChange={(e) => setRcInput(e.target.value)}
            style={{ padding: '6px 10px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, width: 220 }}
          />
          <button onClick={handleFetchGeometry} disabled={!rcInput.trim() || geometryLoading}
            style={{ padding: '6px 10px', background: rcInput.trim() ? '#2E8B57' : '#ccc', color: '#fff', border: 'none', borderRadius: 4, cursor: rcInput.trim() ? 'pointer' : 'not-allowed' }}>
            {geometryLoading ? 'Buscando...' : 'Obtener geometría'}
          </button>
          <button onClick={() => { drawingModeRef.current = true; setDrawingMode(true); }} disabled={drawingMode}
            style={{ padding: '6px 10px', background: drawingMode ? '#ccc' : '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: drawingMode ? 'not-allowed' : 'pointer' }}>
            Dibujar parcela
          </button>
          <button onClick={handleClear}
            style={{ padding: '6px 10px', background: '#f5f5f5', color: '#333', border: '1px solid #ddd', borderRadius: 4, cursor: 'pointer' }}>
            Limpiar
          </button>
          <span style={{ fontSize: 12, color: '#888' }}>Clic en parcela del mapa para obtener RC</span>
        </div>

        {(parcelaFoundMsg || mapError) && (
          <div style={{ marginBottom: 4, fontSize: 13, lineHeight: 1.4 }}>
            {parcelaFoundMsg && <span style={{ color: '#2E7D32' }}>{parcelaFoundMsg}</span>}
            {mapError && <span style={{ color: '#E65100' }}>{mapError}</span>}
          </div>
        )}

        <div id="map-container" style={{ height: '600px', width: '100%' }} />
      </div>

      {(loading || internalLoading || geometryLoading) && (
        <div style={{ position: 'absolute', inset: 0, zIndex: 1150, background: 'rgba(255,255,255,0.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'center', paddingTop: 60 }}>
          <div style={{ background: '#fff', padding: '8px 16px', borderRadius: 6, boxShadow: '0 2px 8px rgba(0,0,0,0.15)', fontSize: 14 }}>
            {statusMessage || (geometryLoading ? 'Obteniendo geometría de la parcela...' : internalLoading ? 'Buscando parcela en Catastro...' : 'Cargando...')}
          </div>
        </div>
      )}

      {selectedParcela && (
        <div style={{
          position: 'absolute', right: 0, bottom: 0, width: 320, maxHeight: '50%',
          transform: drawerOpen ? 'translateX(0)' : 'translateX(calc(100% + 8px))',
          transition: 'transform 220ms ease-in-out',
          boxShadow: drawerOpen ? '-4px 0 12px rgba(0,0,0,0.12)' : 'none',
          background: '#fafafa', zIndex: 1200, padding: 16, overflowY: 'auto', borderTopLeftRadius: 8
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ margin: 0, fontSize: 16 }}>{selectedParcela.nombre || selectedParcela.id}</h3>
            <button onClick={() => { setDrawerOpen(false); setSelectedParcela(null); onParcelaSelect(null); }}
              style={{ background: 'transparent', border: 'none', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}>✕</button>
          </div>
          <div style={{ marginTop: 12, fontSize: 14, lineHeight: 1.5 }}>
            <p style={{ marginBottom: 8 }}>
              <b>Nombre:</b><br />
              <input
                type="text"
                value={selectedParcela.nombre}
                onChange={(e) => {
                  const updated = { ...selectedParcela, nombre: e.target.value };
                  setSelectedParcela(updated);
                  onParcelaSelect(updated);
                }}
                style={{ width: '100%', padding: '4px 8px', border: '1px solid #ccc', borderRadius: 4, fontSize: 14, marginTop: 2 }}
              />
            </p>
            <p><b>Referencia catastral:</b> {selectedParcela.id}</p>
            <p><b>Área:</b> {selectedParcela.area ? `${selectedParcela.area} m²` : 'No disponible'}</p>
          </div>
        </div>
      )}
    </div>
  );
};
