import { useState, useEffect, useCallback } from 'react';
import { fetchTransporte } from '../api/transporteApiService';
import type { Transporte } from '../types/transporte.types';

export const useTransporte = (id: number | undefined) => {
  const [transporte, setTransporte] = useState<Transporte | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (id === undefined) {
      setError('ID no proporcionado');
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await fetchTransporte(id, signal);
      if (!signal?.aborted) setTransporte(data);
    } catch (err) {
      if (signal?.aborted) return;
      setError(err instanceof Error ? err.message : 'Error al cargar transporte');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const reload = useCallback(async () => {
    const ac = new AbortController();
    await load(ac.signal);
  }, [load]);

  return { transporte, isLoading, error, reload };
};
