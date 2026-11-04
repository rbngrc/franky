import type { Transporte } from '../../transportes/types/transporte.types';

export interface LabelValue {
  label: string;
  value: number;
}

export interface MonthValue {
  monthKey: string;
  label: string;
  value: number;
}

export type CertKey = 'eudr' | 'pefc' | 'sure';

export interface CertStat {
  key: CertKey;
  label: string;
  cumplidos: number;
  total: number;
  porcentaje: number;
  color: string;
}

export interface Kpi {
  value: number;
  label: string;
  link: string;
  loading: boolean;
  decimals?: number;
  tooltip?: string[];
}

export interface RouteDistance {
  transporteId: number;
  codigo: string;
  kilometros: number;
  destino: string;
  fechaCarga: string;
}

export interface DashboardStats {
  isLoading: boolean;
  kpis: Kpi[];

  totalToneladas: number;
  mediaToneladasPorTransporte: number;
  superficieTotalHectareas: number;

  toneladasPorTipoMadera: LabelValue[];
  toneladasPorMes: MonthValue[];
  transportesPorMes: LabelValue[];

  certificaciones: CertStat[];

  hectareasPorProvincia: LabelValue[];
  hectareasPorMunicipio: LabelValue[];
  transportesPorDestino: LabelValue[];

  camionesPorMarca: LabelValue[];
  capacidadTotalCamiones: number;
  cargaMediaPorCamion: number;

  totalTransportes: number;
  ultimosTransportes: Transporte[];
  parcelasTruncadas: boolean;
}
