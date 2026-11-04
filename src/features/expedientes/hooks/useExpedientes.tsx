import { useState, useEffect, useCallback } from 'react';
import { ExpedienteApiService } from '../api/ExpedienteApiService';
import type { ExpedienteRequest, ExpedienteResponse } from '../types/expediente.types';

export const useExpedientes = () => {
  const [expedientes, setExpedientes] = useState<ExpedienteResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAll = useCallback(async (signal?: AbortSignal) => {
    try {
      setLoading(true);
      const data = await ExpedienteApiService.getAll();
      if (!signal?.aborted) {
        setExpedientes(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar expedientes');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchAll(ac.signal);
    return () => ac.abort();
  }, [fetchAll]);

  const createExpediente = useCallback(async (data: ExpedienteRequest) => {
    const nuevo = await ExpedienteApiService.create(data);
    await fetchAll();
    return nuevo;
  }, [fetchAll]);

  const updateExpediente = useCallback(async (id: number, data: ExpedienteRequest) => {
    const updated = await ExpedienteApiService.update(id, data);
    await fetchAll();
    return updated;
  }, [fetchAll]);

  const deleteExpediente = useCallback(async (id: number) => {
    await ExpedienteApiService.remove(id);
    await fetchAll();
  }, [fetchAll]);

  return {
    expedientes,
    loading,
    error,
    refetch: () => fetchAll(),
    createExpediente,
    updateExpediente,
    deleteExpediente,
  };
};
