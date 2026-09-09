import { ApiClient } from '../../../lib/apiClient';
import type { MaquinariaAsignada, MaquinariaAsignadaFormData } from '../types/maquinaria.types';

export const fetchMaquinariaByParcelaId = async (parcelaId: string, signal?: AbortSignal): Promise<MaquinariaAsignada[]> => {
  return ApiClient.get<MaquinariaAsignada[]>(`/maquinaria?parcelaId=${parcelaId}`, { signal });
};

export const createMaquinaria = async (data: MaquinariaAsignadaFormData, signal?: AbortSignal): Promise<MaquinariaAsignada> => {
  return ApiClient.post<MaquinariaAsignada>('/maquinaria', data, { signal });
};

export const deleteMaquinaria = async (id: string): Promise<void> => {
  return ApiClient.delete(`/maquinaria/${id}`);
};
