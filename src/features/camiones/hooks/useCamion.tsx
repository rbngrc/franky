import { useState, useEffect } from 'react';
import { fetchCamion } from '../api/camionApiService';
import type { Camion } from '../types/camion.types';

export const useCamion = (matricula: string | undefined) => {
  const [camion, setCamion] = useState<Camion | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!matricula) {
      setError('Matrícula no proporcionada');
      setIsLoading(false);
      return;
    }

    const ac = new AbortController();
    const load = async () => {
      try {
        setIsLoading(true);
        const data = await fetchCamion(matricula, ac.signal);
        if (!ac.signal.aborted) setCamion(data);
      } catch (err) {
        if (ac.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Error al cargar camión');
      } finally {
        if (!ac.signal.aborted) setIsLoading(false);
      }
    };
    load();
    return () => ac.abort();
  }, [matricula]);

  return { camion, isLoading, error };
};
