import { useState, useEffect, useCallback } from 'react';
import { fetchMaquinariaByParcelaId, createMaquinaria as apiCreateMaquinaria, deleteMaquinaria as apiDeleteMaquinaria } from '../api/maquinariaApiService';
import type { MaquinariaAsignada, MaquinariaAsignadaFormData } from '../types/maquinaria.types';

export const useMaquinaria = (parcelaId: string | undefined) => {
  const [maquinaria, setMaquinaria] = useState<MaquinariaAsignada[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    if (!parcelaId) return;
    try {
      setIsLoading(true);
      const data = await fetchMaquinariaByParcelaId(parcelaId, signal);
      if (!signal?.aborted) {
        setMaquinaria(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar maquinaria');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [parcelaId]);

  useEffect(() => {
    const ac = new AbortController();
    loadData(ac.signal);
    return () => ac.abort();
  }, [loadData]);

  const createMaquinaria = useCallback(async (data: MaquinariaAsignadaFormData) => {
    const item = await apiCreateMaquinaria(data);
    await loadData();
    return item;
  }, [loadData]);

  const deleteMaquinaria = useCallback(async (id: string) => {
    await apiDeleteMaquinaria(id);
    await loadData();
  }, [loadData]);

  return { maquinaria, isLoading, error, reload: () => loadData(), createMaquinaria, deleteMaquinaria };
};
