export type Camion = {
  matricula: string;
  marca: string;
  modelo: string;
  capacidadToneladas: number;
  capacidadM3?: number;
  tara: number;
  activo: boolean;
  remolqueMatricula?: string;
};

export type CamionFormData = {
  matricula: string;
  marca: string;
  modelo: string;
  capacidadToneladas: number;
  capacidadM3?: number;
  tara: number;
  remolqueMatricula?: string;
};
