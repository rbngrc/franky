import { ApiClient } from '../../../lib/apiClient';
import type { Lote, LoteFormData } from '../types/lote.types';

export const fetchLotesByParcelaId = async (parcelaId: string, signal?: AbortSignal): Promise<Lote[]> => {
  return ApiClient.get<Lote[]>(`/lotes?parcelaId=${parcelaId}`, { signal });
};

export const createLote = async (data: LoteFormData, signal?: AbortSignal): Promise<Lote> => {
  return ApiClient.post<Lote>('/lotes', data, { signal });
};

export const updateLote = async (id: string, data: LoteFormData, signal?: AbortSignal): Promise<Lote> => {
  return ApiClient.put<Lote>(`/lotes/${id}`, data, { signal });
};

export const deleteLote = async (id: string): Promise<void> => {
  return ApiClient.delete(`/lotes/${id}`);
};
