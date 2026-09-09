export type Centro = {
  id: number;
  nombre: string;
  direccion: string | null;
  localidad?: string | null;
  tipo: string;
  latitud: number | null;
  longitud: number | null;
  activo: boolean;
};

export type CentroFormData = {
  nombre: string;
  direccion: string;
  tipo: string;
  latitud: number | null;
  longitud: number | null;
};
