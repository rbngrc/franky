import { ApiClient } from '../../../lib/apiClient';
import type { Proveedor, ProveedorFormData } from '../types/proveedor.types';

export const fetchProveedores = async (signal?: AbortSignal): Promise<Proveedor[]> => {
  return ApiClient.get<Proveedor[]>('/proveedores', { signal });
};

export const fetchProveedor = async (id: number, signal?: AbortSignal): Promise<Proveedor> => {
  return ApiClient.get<Proveedor>(`/proveedores/${id}`, { signal });
};

export const createProveedor = async (data: ProveedorFormData, signal?: AbortSignal): Promise<Proveedor> => {
  return ApiClient.post<Proveedor>('/proveedores', data, { signal });
};

export const updateProveedor = async (id: number, data: ProveedorFormData, signal?: AbortSignal): Promise<Proveedor> => {
  return ApiClient.put<Proveedor>(`/proveedores/${id}`, data, { signal });
};

export const deleteProveedor = async (id: number): Promise<void> => {
  return ApiClient.delete(`/proveedores/${id}`);
};
