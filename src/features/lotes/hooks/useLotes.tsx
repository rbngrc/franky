import { useState, useEffect, useCallback } from 'react';
import { fetchLotesByParcelaId, createLote as apiCreateLote, updateLote as apiUpdateLote, deleteLote as apiDeleteLote } from '../api/loteApiService';
import type { Lote, LoteFormData } from '../types/lote.types';

export const useLotes = (parcelaId: string | undefined) => {
  const [lotes, setLotes] = useState<Lote[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    if (!parcelaId) return;
    try {
      setIsLoading(true);
      const data = await fetchLotesByParcelaId(parcelaId, signal);
      if (!signal?.aborted) {
        setLotes(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar lotes');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [parcelaId]);

  useEffect(() => {
    const ac = new AbortController();
    loadData(ac.signal);
    return () => ac.abort();
  }, [loadData]);

  const createLote = useCallback(async (data: LoteFormData) => {
    const newLote = await apiCreateLote(data);
    await loadData();
    return newLote;
  }, [loadData]);

  const updateLote = useCallback(async (id: string, data: LoteFormData) => {
    const updated = await apiUpdateLote(id, data);
    await loadData();
    return updated;
  }, [loadData]);

  const deleteLote = useCallback(async (id: string) => {
    await apiDeleteLote(id);
    await loadData();
  }, [loadData]);

  return { lotes, isLoading, error, reload: () => loadData(), createLote, updateLote, deleteLote };
};
