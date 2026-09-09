import { ApiClient } from '../../../lib/apiClient';
import type { Transporte, TransporteFormData } from '../types/transporte.types';

export const fetchTransportes = async (signal?: AbortSignal): Promise<Transporte[]> => {
  return ApiClient.get<Transporte[]>('/transportes', { signal });
};

export const fetchTransporte = async (id: number, signal?: AbortSignal): Promise<Transporte> => {
  return ApiClient.get<Transporte>(`/transportes/${id}`, { signal });
};

export const recalcularEudrPorParcela = async (parcelaId: string): Promise<void> => {
  return ApiClient.post<void>(`/transportes/recalcular-eudr/${parcelaId}`, null);
};

export const createTransporte = async (data: TransporteFormData, signal?: AbortSignal): Promise<Transporte> => {
  return ApiClient.post<Transporte>('/transportes', data, { signal });
};

export const updateTransporte = async (id: number, data: TransporteFormData, signal?: AbortSignal): Promise<Transporte> => {
  return ApiClient.put<Transporte>(`/transportes/${id}`, data, { signal });
};

export const deleteTransporte = async (id: number): Promise<void> => {
  return ApiClient.delete(`/transportes/${id}`);
};
