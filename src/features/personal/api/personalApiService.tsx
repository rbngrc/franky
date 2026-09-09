import { ApiClient } from '../../../lib/apiClient';
import type { PersonalAsignado, PersonalAsignadoFormData } from '../types/personal.types';

export const fetchPersonalByParcelaId = async (parcelaId: string, signal?: AbortSignal): Promise<PersonalAsignado[]> => {
  return ApiClient.get<PersonalAsignado[]>(`/personal?parcelaId=${parcelaId}`, { signal });
};

export const createPersonal = async (data: PersonalAsignadoFormData, signal?: AbortSignal): Promise<PersonalAsignado> => {
  return ApiClient.post<PersonalAsignado>('/personal', data, { signal });
};

export const deletePersonal = async (id: string): Promise<void> => {
  return ApiClient.delete(`/personal/${id}`);
};
