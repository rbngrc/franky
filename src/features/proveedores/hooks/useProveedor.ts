import { useState, useEffect, useCallback } from 'react';
import { fetchProveedor as apiFetchProveedor } from '../api/proveedorApiService';
import type { Proveedor } from '../types/proveedor.types';

export const useProveedor = (id: number | undefined | null) => {
  const [proveedor, setProveedor] = useState<Proveedor | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async (signal?: AbortSignal) => {
    if (id == null) {
      setProveedor(null);
      setIsLoading(false);
      return;
    }
    try {
      setIsLoading(true);
      const data = await apiFetchProveedor(id, signal);
      if (!signal?.aborted) {
        setProveedor(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar el proveedor');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  return { proveedor, isLoading, error };
};
