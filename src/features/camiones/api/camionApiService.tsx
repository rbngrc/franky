import { ApiClient } from '../../../lib/apiClient';
import type { Camion, CamionFormData } from '../types/camion.types';

export const fetchCamiones = async (signal?: AbortSignal): Promise<Camion[]> => {
  return ApiClient.get<Camion[]>('/camiones', { signal });
};

export const fetchCamion = async (matricula: string, signal?: AbortSignal): Promise<Camion> => {
  return ApiClient.get<Camion>(`/camiones/${encodeURIComponent(matricula)}`, { signal });
};

export const createCamion = async (data: CamionFormData, signal?: AbortSignal): Promise<Camion> => {
  return ApiClient.post<Camion>('/camiones', data, { signal });
};

export const updateCamion = async (matricula: string, data: CamionFormData, signal?: AbortSignal): Promise<Camion> => {
  return ApiClient.post<Camion>(`/camiones/${encodeURIComponent(matricula)}`, data, { signal });
};
