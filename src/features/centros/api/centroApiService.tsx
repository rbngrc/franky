import { ApiClient } from '../../../lib/apiClient';
import type { Centro, CentroFormData } from '../types/centro.types';

export const fetchCentros = async (signal?: AbortSignal): Promise<Centro[]> => {
  return ApiClient.get<Centro[]>('/centros', { signal });
};

export const fetchCentroById = async (id: number, signal?: AbortSignal): Promise<Centro> => {
  return ApiClient.get<Centro>(`/centros/${id}`, { signal });
};

export const createCentro = async (data: CentroFormData): Promise<Centro> => {
  return ApiClient.post<Centro>('/centros', data);
};

export const updateCentro = async (id: number, data: CentroFormData): Promise<Centro> => {
  return ApiClient.post<Centro>(`/centros/${id}`, data);
};

export const deleteCentro = async (id: number): Promise<void> => {
  return ApiClient.delete(`/centros/${id}`);
};
