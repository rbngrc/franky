// src/features/parcelas/types/parcela.types.ts

import type { Geometry } from "geojson";

export type Parcela = {
  id: string;
  nombre: string;
  wktGeolocalizacion: string | null;
  eudrCompliant: boolean;
  referenciaCatastral?: string | null;
  areaMetrosCuadrados?: number | null;
  municipio?: string;
  provincia?: string;
  region?: string;
  datosFromSigpac?: boolean;
  deforestacionOk?: boolean | null;
  produccionLegalOk?: boolean | null;
  certificacionPefc?: boolean;
  codigoCertificacionPefc?: string | null;
  fechaAuditoriaPefc?: string | null;
  fechaVencimientoPefc?: string | null;
  certificacionSure?: boolean;
  codigoCertificacionSure?: string | null;
  fechaAuditoriaSure?: string | null;
  fechaVencimientoSure?: string | null;
};

export type ParcelaUpdateData = {
  nombre?: string;
  referenciaCatastral?: string | null;
  municipio?: string | null;
  provincia?: string | null;
  deforestacionOk?: boolean | null;
  produccionLegalOk?: boolean | null;
  certificacionPefc?: boolean;
  codigoCertificacionPefc?: string | null;
  fechaAuditoriaPefc?: string | null;
  fechaVencimientoPefc?: string | null;
  certificacionSure?: boolean;
  codigoCertificacionSure?: string | null;
  fechaAuditoriaSure?: string | null;
  fechaVencimientoSure?: string | null;
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

export interface ParcelaSigpac {
  id: string;
  nombre: string;
  provincia: string;
  municipio: string;
  recinto: string;
  poligono: string;
  parcela: string;
  area: number;
  uso?: string;
  geometry: Geometry;
}

export type SigpacParcelaDTO = {
  nombre?: string;
  parcela: string;
  recinto: string;
  area: number;
  usoSigpac: string | null;
  geometria: string; // GeoJSON en string
  referenciaCatastral?: string | null;
};

export interface MunicipioFeatureProperties {
  cod_municipio: string;
  nombre: string;
  categoria?: string;
  superficie?: number;
  perimetro?: number;
  poblacion?: number;
  provincia?: string;
}