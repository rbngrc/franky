import { useState, useEffect, useCallback } from 'react';
import { fetchPersonalByParcelaId, createPersonal as apiCreatePersonal, deletePersonal as apiDeletePersonal } from '../api/personalApiService';
import type { PersonalAsignado, PersonalAsignadoFormData } from '../types/personal.types';

export const usePersonal = (parcelaId: string | undefined) => {
  const [personal, setPersonal] = useState<PersonalAsignado[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    if (!parcelaId) return;
    try {
      setIsLoading(true);
      const data = await fetchPersonalByParcelaId(parcelaId, signal);
      if (!signal?.aborted) {
        setPersonal(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar personal');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [parcelaId]);

  useEffect(() => {
    const ac = new AbortController();
    loadData(ac.signal);
    return () => ac.abort();
  }, [loadData]);

  const createPersonal = useCallback(async (data: PersonalAsignadoFormData) => {
    const item = await apiCreatePersonal(data);
    await loadData();
    return item;
  }, [loadData]);

  const deletePersonal = useCallback(async (id: string) => {
    await apiDeletePersonal(id);
    await loadData();
  }, [loadData]);

  return { personal, isLoading, error, reload: () => loadData(), createPersonal, deletePersonal };
};
