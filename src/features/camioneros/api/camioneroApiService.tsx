import { ApiClient } from '../../../lib/apiClient';
import type { Camionero, CamioneroFormData } from '../types/camionero.types';

export const fetchCamioneros = async (signal?: AbortSignal): Promise<Camionero[]> => {
  return ApiClient.get<Camionero[]>('/camioneros', { signal });
};

export const fetchCamionero = async (dni: string, signal?: AbortSignal): Promise<Camionero> => {
  return ApiClient.get<Camionero>(`/camioneros/${encodeURIComponent(dni)}`, { signal });
};

export const createCamionero = async (data: CamioneroFormData, signal?: AbortSignal): Promise<Camionero> => {
  return ApiClient.post<Camionero>('/camioneros', data, { signal });
};

export const updateCamionero = async (dni: string, data: CamioneroFormData, signal?: AbortSignal): Promise<Camionero> => {
  return ApiClient.post<Camionero>(`/camioneros/${encodeURIComponent(dni)}`, data, { signal });
};
