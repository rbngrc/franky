import { useEffect, useMemo, useState } from 'react';
import { fetchBasculasCercanas } from '../api/basculasApi';
import {
  enriquecerBasculas,
  RADIO_BUSQUEDA_KM,
  RADIO_VALIDO_KM,
  type LatLng,
} from '../utils/routeGeometry';
import type { Bascula } from '../types/bascula.types';

const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug('[basculas]', ...args);
};

export const useBasculasRuta = (ruta: LatLng[] | null, activo: boolean) => {
  const [basculas, setBasculas] = useState<Bascula[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!activo || !ruta || ruta.length < 2) {
      setBasculas([]);
      setIsLoading(false);
      setError(null);
      return;
    }

    const controller = new AbortController();
    const rutaActual = ruta;

    (async () => {
      try {
        setIsLoading(true);
        setError(null);
        debug('buscando', { puntos: rutaActual.length, radioKm: RADIO_BUSQUEDA_KM });
        const candidatas = await fetchBasculasCercanas(
          rutaActual,
          controller.signal,
          RADIO_BUSQUEDA_KM,
        );
        if (controller.signal.aborted) return;
        const enriquecidas = enriquecerBasculas(candidatas, rutaActual, RADIO_VALIDO_KM);
        const cercanas = enriquecidas.filter((b) => b.dentroRadio);
        debug('resultado', {
          candidatas: candidatas.length,
          enRuta: cercanas.length,
          fuera: enriquecidas.length - cercanas.length,
        });
        setBasculas(enriquecidas);
      } catch (err) {
        if (controller.signal.aborted) return;
        const mensaje = err instanceof Error ? err.message : '';
        const esTimeout = /timed out|timeout/i.test(mensaje);
        const esErrorDeRed = /fetch|network|load failed/i.test(mensaje);
        debug('error', { mensaje, err });
        setError(
          mensaje.includes('Photon') || mensaje.includes('Overpass')
            ? `${mensaje}. La fuente pública de OpenStreetMap puede estar saturada; inténtalo de nuevo en unos minutos.`
            : esTimeout
              ? 'La consulta a OpenStreetMap ha tardado demasiado. Inténtalo de nuevo en unos minutos.'
              : esErrorDeRed
                ? 'No se pudo conectar con OpenStreetMap. Comprueba la conexión o inténtalo más tarde.'
                : mensaje || 'No se pudieron consultar las básculas',
        );
      } finally {
        if (!controller.signal.aborted) setIsLoading(false);
      }
    })();

    return () => controller.abort();
  }, [activo, ruta]);

  const basculasCercanas = useMemo(
    () => basculas.filter((b) => b.dentroRadio),
    [basculas],
  );

  return { basculas, basculasCercanas, isLoading, error };
};
