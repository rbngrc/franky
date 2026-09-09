import { ApiClient } from '../../../lib/apiClient';
import type { PaginatedParcelasResponse, Parcela, ParcelaUpdateData, SigpacParcelaDTO } from '../types/parcela.types';

export const fetchParcelas = async (page = 0, size = 20, signal?: AbortSignal): Promise<PaginatedParcelasResponse> => {
  const query = `?page=${page}&size=${size}&sort=nombre,asc`;
  return ApiClient.get<PaginatedParcelasResponse>(`/parcelas${query}`, { signal });
};

export const createParcela = async (newParcelaData: { nombre: string; wktGeolocalizacion?: string }): Promise<Parcela> => {
  return ApiClient.post<Parcela>('/parcelas', newParcelaData);
};

export const fetchParcelaById = async (id: string, signal?: AbortSignal): Promise<Parcela> => {
  return ApiClient.get<Parcela>(`/parcelas/${id}`, { signal });
};

export const saveParcela = async (parcelaData: SigpacParcelaDTO, signal?: AbortSignal): Promise<Parcela> => {
  return ApiClient.post<Parcela>('/parcelas/import', parcelaData, { signal });
};

export const updateParcela = async (id: string, data: ParcelaUpdateData): Promise<Parcela> => {
  return ApiClient.put<Parcela>(`/parcelas/${id}`, data);
};

export const deleteParcela = async (id: string): Promise<void> => {
  return ApiClient.delete(`/parcelas/${id}`);
};