export interface Expediente {
  id?: number;
  codigoExpediente: string;
  numeroLicitacion?: string | null;
  descripcion?: string | null;
  fechaApertura?: string | null;
  fechaAdjudicacion?: string | null;
  proveedorId?: number | null;
  estado?: string | null;
  importe?: number | null;
  observaciones?: string | null;
  activo?: boolean;
}

export interface ExpedienteRequest {
  codigoExpediente: string;
  numeroLicitacion?: string;
  descripcion?: string;
  fechaApertura?: string | null;
  fechaAdjudicacion?: string | null;
  proveedorId?: number | null;
  estado?: string;
  importe?: number | null;
  observaciones?: string;
  activo?: boolean;
}

export type ExpedienteResponse = Expediente;
