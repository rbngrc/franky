import { useState, useEffect, useCallback } from 'react';
import { fetchCentros } from '../api/centroApiService';
import type { Centro } from '../types/centro.types';

export const useCentros = () => {
  const [centros, setCentros] = useState<Centro[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await fetchCentros(signal);
      if (!signal?.aborted) {
        setCentros(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar centros.');
    } finally {
      if (!signal?.aborted) {
        setIsLoading(false);
      }
    }
  }, []);

  useEffect(() => {
    const abortController = new AbortController();
    loadData(abortController.signal);
    return () => abortController.abort();
  }, [loadData]);

  return { centros, isLoading, error, reload: () => loadData() };
};
