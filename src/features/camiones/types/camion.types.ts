export type TipoVehiculo = 'CAMION' | 'REMOLQUE';

export type Camion = {
  matricula: string;
  marca: string;
  modelo: string;
  capacidadToneladas: number;
  capacidadM3?: number;
  tara: number;
  activo: boolean;
  remolqueMatricula?: string;
  tipo?: TipoVehiculo;
};

export type CamionFormData = {
  matricula: string;
  marca: string;
  modelo: string;
  capacidadToneladas: number;
  capacidadM3?: number;
  tara: number;
  remolqueMatricula?: string;
  tipo?: TipoVehiculo;
};
