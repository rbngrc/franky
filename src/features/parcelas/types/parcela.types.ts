// src/features/parcelas/types/parcela.types.ts

export type Parcela = {
  id: string;
  nombre: string;
  wktGeolocalizacion: string | null;
};

export type PaginatedParcelasResponse = {
  content: Parcela[];
  totalPages: number;
  totalElements: number;
  size: number;
  number: number; // número de la página actual
};

// Tipo para las provincias disponibles
export type Provincia = 'Ávila' | 'Burgos' | 'León' | 'Palencia';

// Municipios asociados a cada provincia
export type MunicipiosPorProvincia = {
  [key in Provincia]: string[];
};

// Opcional: un tipo Municipio más genérico si quieres usarlo directamente
export type Municipio = string;
