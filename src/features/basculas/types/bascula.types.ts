export type BasculaFuente = 'nakordoni' | 'osm';

export type EstadoBascula = 'operativa' | 'cerrada' | 'desconocido';

export type AccesoBascula = 'publico' | 'restringido' | 'desconocido';

export type BasculaCandidata = {
  id: string;
  nombre: string;
  lat: number;
  lng: number;
  direccion?: string;
  horario?: string;
  telefono?: string;
  acceso: AccesoBascula;
  estado: EstadoBascula;
  ultimaVerificacion?: string;
  fuente: BasculaFuente;
};

export type Bascula = BasculaCandidata & {
  distanciaRutaKm: number;
  desvioKm: number;
  sobreRuta: boolean;
  dentroRadio: boolean;
};

export type Bbox = {
  south: number;
  west: number;
  north: number;
  east: number;
};
