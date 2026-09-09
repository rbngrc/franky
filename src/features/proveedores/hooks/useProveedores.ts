import { useState, useEffect, useCallback } from 'react';
import { fetchProveedores as apiFetchProveedores, createProveedor as apiCreateProveedor, updateProveedor as apiUpdateProveedor, deleteProveedor as apiDeleteProveedor } from '../api/proveedorApiService';
import type { Proveedor, ProveedorFormData } from '../types/proveedor.types';

export const useProveedores = () => {
  const [proveedores, setProveedores] = useState<Proveedor[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (signal?: AbortSignal) => {
    try {
      setIsLoading(true);
      const data = await apiFetchProveedores(signal);
      if (!signal?.aborted) {
        setProveedores(data);
        setError(null);
      }
    } catch {
      if (signal?.aborted) return;
      setError('Error al cargar proveedores');
    } finally {
      if (!signal?.aborted) setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    loadData(ac.signal);
    return () => ac.abort();
  }, [loadData]);

  const createProveedor = useCallback(async (data: ProveedorFormData) => {
    const nuevo = await apiCreateProveedor(data);
    await loadData();
    return nuevo;
  }, [loadData]);

  const updateProveedor = useCallback(async (id: number, data: ProveedorFormData) => {
    const updated = await apiUpdateProveedor(id, data);
    await loadData();
    return updated;
  }, [loadData]);

  const deleteProveedor = useCallback(async (id: number) => {
    await apiDeleteProveedor(id);
    await loadData();
  }, [loadData]);

  return { proveedores, isLoading, error, reload: () => loadData(), createProveedor, updateProveedor, deleteProveedor };
};
