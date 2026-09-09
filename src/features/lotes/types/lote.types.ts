import type { Polygon } from 'geojson';

export type Lote = {
  id: string;
  parcelaId: string;
  nombre: string;
  especie: string | null;
  superficieHectareas: number | null;
  fechaPlantacion: string | null;
  geometria: Polygon | null;
};

export type LoteFormData = {
  parcelaId: string;
  nombre: string;
  especie: string;
  superficieHectareas: number | null;
  fechaPlantacion: string;
  geometria: Polygon | null;
};
