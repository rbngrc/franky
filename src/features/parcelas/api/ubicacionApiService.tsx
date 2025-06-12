import type { Provincia, Municipio } from '../types/ubicacion.types';

const API_BASE_URL = 'http://localhost:8080/api/v1';

export const fetchProvincias = async (): Promise<Provincia[]> => {
    const response = await fetch(`${API_BASE_URL}/ubicaciones/provincias`);
    if (!response.ok) {
        throw new Error('Error al obtener las provincias');
    }
    return response.json();
};

export const fetchMunicipios = async (codigoProvincia: string): Promise<Municipio[]> => {
    const response = await fetch(`${API_BASE_URL}/ubicaciones/municipios?provincia=${codigoProvincia}`);
    if (!response.ok) {
        throw new Error('Error al obtener los municipios');
    }
    return response.json();
};