import { useState, useEffect, useCallback } from 'react';
import { ExpedienteApiService } from '../api/ExpedienteApiService';
import type { ExpedienteResponse } from '../types/expediente.types';

export const useExpediente = (id: number | undefined | null) => {
  const [expediente, setExpediente] = useState<ExpedienteResponse | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (id == null) {
      setExpediente(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await ExpedienteApiService.getById(id);
      if (!signal?.aborted) {
        setExpediente(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar el expediente');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  return { expediente, isLoading, error };
};
