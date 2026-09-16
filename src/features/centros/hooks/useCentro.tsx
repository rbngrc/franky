import { useState, useEffect } from 'react';
import { fetchCentroById } from '../api/centroApiService';
import type { Centro } from '../types/centro.types';

export const useCentro = (id: number | null) => {
  const [centro, setCentro] = useState<Centro | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) {
      setCentro(null);
      setIsLoading(false);
      return;
    }
    const abortController = new AbortController();

    const loadData = async () => {
      try {
        setIsLoading(true);
        setCentro(null);
        const data = await fetchCentroById(id, abortController.signal);
        if (!abortController.signal.aborted) {
          setCentro(data);
          setError(null);
        }
      } catch {
        if (abortController.signal.aborted) return;
        setError('Error al cargar el centro.');
      } finally {
        if (!abortController.signal.aborted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => abortController.abort();
  }, [id]);

  return { centro, isLoading, error };
};
