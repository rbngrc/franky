import { ApiClient } from '../../../lib/apiClient';
import type { ExpedienteRequest, ExpedienteResponse } from '../types/expediente.types';

export class ExpedienteApiService {
  private static base = '/expedientes';

  static async getAll(): Promise<ExpedienteResponse[]> {
    const res = await ApiClient.get(this.base);
    return res as ExpedienteResponse[];
  }

  static async getById(id: number): Promise<ExpedienteResponse> {
    const res = await ApiClient.get(`${this.base}/${id}`);
    return res as ExpedienteResponse;
  }

  static async create(data: ExpedienteRequest): Promise<ExpedienteResponse> {
    const res = await ApiClient.post(this.base, data);
    return res as ExpedienteResponse;
  }

  static async update(id: number, data: ExpedienteRequest): Promise<ExpedienteResponse> {
    const res = await ApiClient.put(`${this.base}/${id}`, data);
    return res as ExpedienteResponse;
  }

  static async remove(id: number): Promise<void> {
    await ApiClient.delete(`${this.base}/${id}`);
  }
}
