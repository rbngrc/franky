import { useState, useEffect } from 'react';
import { fetchCamiones } from '../api/camionApiService';
import type { Camion } from '../types/camion.types';

export const useCamiones = () => {
  const [camiones, setCamiones] = useState<Camion[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCamiones(ac.signal);
        if (!ac.signal.aborted) setCamiones(data);
      } catch {
        if (ac.signal.aborted) return;
        setError('Error al cargar camiones');
      } finally {
        if (!ac.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => ac.abort();
  }, []);

  return { camiones, isLoading, error };
};
