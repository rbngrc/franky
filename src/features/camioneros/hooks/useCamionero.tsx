import { useState, useEffect } from 'react';
import { fetchCamionero } from '../api/camioneroApiService';
import type { Camionero } from '../types/camionero.types';

export const useCamionero = (dni: string | undefined) => {
  const [camionero, setCamionero] = useState<Camionero | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!dni) {
      setError('DNI no proporcionado');
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCamionero(dni, ac.signal);
        if (!ac.signal.aborted) setCamionero(data);
      } catch (err) {
        if (ac.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar camionero');
      } finally {
        if (!ac.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => ac.abort();
  }, [dni]);

  return { camionero, isLoading, error };
};
