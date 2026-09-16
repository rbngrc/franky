import { useState, useEffect, useCallback } from 'react';
import { fetchTransportes, deleteTransporte as apiDeleteTransporte } from '../api/transporteApiService';
import type { Transporte } from '../types/transporte.types';

export const useTransportes = () => {
  const [transportes, setTransportes] = useState<Transporte[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await fetchTransportes(signal);
      if (!signal?.aborted) {
        setTransportes(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar transportes');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    loadData(ac.signal);
    return () => ac.abort();
  }, [loadData]);

  const deleteTransporte = useCallback(async (id: number) => {
    await apiDeleteTransporte(id);
    await loadData();
  }, [loadData]);

  return { transportes, isLoading, error, reload: () => loadData(), deleteTransporte };
};
