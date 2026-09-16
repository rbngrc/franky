import { useState, useEffect } from 'react';
import { fetchCamioneros } from '../api/camioneroApiService';
import type { Camionero } from '../types/camionero.types';

export const useCamioneros = () => {
  const [camioneros, setCamioneros] = useState<Camionero[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCamioneros(ac.signal);
        if (!ac.signal.aborted) {
          setCamioneros(data);
          setError(null);
        }
      } catch {
        if (ac.signal.aborted) return;
        setError('Error al cargar camioneros');
      } finally {
        if (!ac.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => ac.abort();
  }, []);

  return { camioneros, isLoading, error };
};
