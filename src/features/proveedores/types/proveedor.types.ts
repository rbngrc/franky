export type Proveedor = {
  id: number;
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  direccion: string | null;
  telefono: string | null;
  email: string | null;
  paisOrigen: string;
  regionOrigen: string | null;
  activo: boolean;
};

export type ProveedorFormData = {
  nombre: string;
  tipoDocumento: string;
  numeroDocumento: string;
  direccion: string;
  telefono: string;
  email: string;
  paisOrigen: string;
  regionOrigen: string;
  activo: boolean;
};
