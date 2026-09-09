import { useState, useCallback, useEffect } from 'react';
import { fetchMunicipioPorNombre, buscarSugerenciasMunicipios } from '../features/parcelas/api/sigpacService';
import { saveParcela } from '../features/parcelas/api/parcelaApiService';
import { SigpacMapViewer } from '../features/parcelas/components/SigpacMapViewer';
import type { FeatureCollection, Geometry } from 'geojson';
import type { ParcelaSigpac, SigpacParcelaDTO } from '../features/parcelas/types/parcela.types';
import '../styles/CrearParcela.css';

export const CrearParcelaPage = () => {
  const [nombreMunicipio, setNombreMunicipio] = useState('');
  const [geojsonData, setGeojsonData] = useState<FeatureCollection<Geometry> | null>(null);
  const [parcelaSeleccionada, setParcelaSeleccionada] = useState<ParcelaSigpac | null>(null);
  const [mapCenter, setMapCenter] = useState<[number, number]>([41.6528, -4.7244]);
  const [provinciaActual, setProvinciaActual] = useState<string>('');
  const [municipioActual, setMunicipioActual] = useState<string>('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sugerencias, setSugerencias] = useState<string[]>([]);
  const [mostrarSugerencias, setMostrarSugerencias] = useState(false);

  const [isSaving, setIsSaving] = useState(false);
  const [saveMessage, setSaveMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  const handleUbicacionResolved = useCallback((prov: string, muni: string) => {
    setProvinciaActual(prov);
    setMunicipioActual(muni);
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    const timer = setTimeout(async () => {
      if (nombreMunicipio.length > 2) {
        try {
          const sugerencias = await buscarSugerenciasMunicipios(nombreMunicipio, abortController.signal);
          if (abortController.signal.aborted) return;
          setSugerencias(sugerencias);
          setMostrarSugerencias(sugerencias.length > 0);
        } catch {
          if (abortController.signal.aborted) return;
          setSugerencias([]);
        }
      } else {
        setSugerencias([]);
        setMostrarSugerencias(false);
      }
    }, 300);

    return () => {
      clearTimeout(timer);
      abortController.abort();
    };
  }, [nombreMunicipio]);

  const buscarMunicipio = useCallback(async (municipio: string) => {
    if (!municipio.trim()) return;

    setIsLoading(true);
    setError(null);
    setGeojsonData(null);
    setParcelaSeleccionada(null);
    setSaveMessage(null);

    try {
      const data = await fetchMunicipioPorNombre(municipio);
      setGeojsonData(data);
      setProvinciaActual(data.features[0]?.properties?.provincia || '');
      setMunicipioActual(data.features[0]?.properties?.nombre || municipio);

      // Usar las coordenadas del geo_point_2d si están disponibles
      if (data.features[0]?.properties?.latitud && data.features[0]?.properties?.longitud) {
        setMapCenter([
          parseFloat(data.features[0].properties.latitud),
          parseFloat(data.features[0].properties.longitud)
        ]);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'No se pudo cargar el municipio');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    buscarMunicipio(nombreMunicipio);
  };

  const seleccionarSugerencia = (sugerencia: string) => {
    setNombreMunicipio(sugerencia);
    setMostrarSugerencias(false);
    buscarMunicipio(sugerencia.split(' (')[0]); // Extraer solo el nombre del municipio
  };

  const handleGuardarParcela = async () => {
    if (!parcelaSeleccionada) return;

    setIsSaving(true);
    setSaveMessage(null);

    try {
      const isManual = parcelaSeleccionada.id.startsWith('manual-');
      const dto: SigpacParcelaDTO = {
        nombre: parcelaSeleccionada.nombre || undefined,
        parcela: parcelaSeleccionada.parcela,
        recinto: parcelaSeleccionada.recinto,
        area: parcelaSeleccionada.area,
        usoSigpac: null,
        geometria: JSON.stringify(parcelaSeleccionada.geometry),
        referenciaCatastral: isManual ? null : parcelaSeleccionada.id,
      };

      await saveParcela(dto);
      setSaveMessage({ type: 'success', text: 'Parcela guardada correctamente' });
      setParcelaSeleccionada(null);
    } catch (err: unknown) {
      setSaveMessage({ type: 'error', text: err instanceof Error ? err.message : 'Error al guardar la parcela' });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="crear-parcela-container">
      {error && (
        <div className="error-message">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="search-container">
        <div className="search-input-container">
          <input
            type="text"
            value={nombreMunicipio}
            onChange={(e) => setNombreMunicipio(e.target.value)}
            placeholder="Ej: Simancas, Valladolid..."
            className="municipio-input"
            disabled={isLoading}
          />
          {mostrarSugerencias && sugerencias.length > 0 && (
            <div className="sugerencias-container">
              {sugerencias.map((sugerencia, index) => (
                <div
                  key={index}
                  className="sugerencia-item"
                  onClick={() => seleccionarSugerencia(sugerencia)}
                >
                  {sugerencia}
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          type="submit"
          disabled={!nombreMunicipio.trim() || isLoading}
          className="search-button"
        >
          {isLoading ? 'Buscando...' : 'Buscar Municipio'}
        </button>
      </form>

      {/* Save Button Section */}
      <div style={{ margin: '1rem 0', display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <button
          onClick={handleGuardarParcela}
          disabled={!parcelaSeleccionada || isSaving}
          style={{
            padding: '0.75rem 1.5rem',
            backgroundColor: parcelaSeleccionada ? '#2E8B57' : '#ccc',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: parcelaSeleccionada ? 'pointer' : 'not-allowed',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          {isSaving ? 'Guardando...' : 'Guardar Parcela Seleccionada'}
        </button>

        {saveMessage && (
          <span style={{
            color: saveMessage.type === 'success' ? 'green' : 'red',
            fontWeight: 'bold'
          }}>
            {saveMessage.text}
          </span>
        )}
      </div>

      <SigpacMapViewer
        geojsonData={geojsonData || undefined}
        selectedParcelaId={parcelaSeleccionada?.id}
        onParcelaSelect={setParcelaSeleccionada}
        onUbicacionResolved={handleUbicacionResolved}
        center={mapCenter}
        loading={isLoading}
        error={error}
        provincia={provinciaActual}
        municipio={municipioActual}
      />
    </div>
  );
};
