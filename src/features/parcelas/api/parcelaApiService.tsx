import type { PaginatedParcelasResponse, Parcela } from '../types/parcela.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const fetchParcelas = async (page = 0, size = 20): Promise<PaginatedParcelasResponse> => {

  const url = `${API_BASE_URL}/parcelas?page=${page}&size=${size}&sort=nombre,asc`;

  const response = await fetch(url);

  if (!response.ok) {
    throw new Error('Error al conectar con la API de Vegapunk');
  }

  return response.json();
};

export const createParcela = async (newParcelaData: { nombre: string; wktGeolocalizacion?: string }): Promise<Parcela> => {
  const url = `${API_BASE_URL}/parcelas`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(newParcelaData),
  });

  if (!response.ok) {
    throw new Error('Error al crear la parcela');
  }

  return response.json();
};

export const fetchParcelaById = async (id: string): Promise<Parcela> => {
    const url = `${API_BASE_URL}/parcelas/${id}`;
    const response = await fetch(url);
    if (!response.ok) {
        if (response.status === 404) {
            throw new Error('La parcela no fue encontrada.');
        }
        throw new Error('Error al obtener la parcela');
    }
    return response.json();
};