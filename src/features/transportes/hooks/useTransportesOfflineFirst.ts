import { useCallback, useEffect, useState } from 'react';
import { fetchTransportes } from '../api/transporteApiService';
import { getCachedTransportes, saveTransportesToCache } from '../../offline/transportesCache';
import type { Transporte } from '../types/transporte.types';

export const useTransportesOfflineFirst = (camioneroDni?: string | null): {
  transportes: Transporte[];
  loading: boolean;
  fromCache: boolean;
  error: string | null;
  reload: () => Promise<void>;
} => {
  const [transportes, setTransportes] = useState<Transporte[]>([]);
  const [loading, setLoading] = useState(true);
  const [fromCache, setFromCache] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    const filtrar = (items: Transporte[]) =>
      camioneroDni ? items.filter((t) => t.camioneroDni === camioneroDni) : items;
    setLoading(true);
    setError(null);
    try {
      const data = await fetchTransportes();
      setTransportes(filtrar(data));
      setFromCache(false);
      if (Array.isArray(data)) {
        void saveTransportesToCache(data).catch(() => undefined);
      }
    } catch {
      const cached = await getCachedTransportes();
      setTransportes(filtrar(cached));
      setFromCache(cached.length > 0);
      setError(cached.length > 0 ? null : 'Sin conexión y sin datos locales');
    } finally {
      setLoading(false);
    }
  }, [camioneroDni]);

  useEffect(() => {
    void loadData();
  }, [loadData]);

  return { transportes, loading, fromCache, error, reload: loadData };
};