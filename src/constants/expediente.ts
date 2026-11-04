export const ESTADO_OPTIONS = [
  { value: 'BORRADOR', label: 'Borrador' },
  { value: 'ABIERTO', label: 'Abierto' },
  { value: 'ADJUDICADO', label: 'Adjudicado' },
  { value: 'EN_EJECUCION', label: 'En ejecución' },
  { value: 'CERRADO', label: 'Cerrado' },
  { value: 'ANULADO', label: 'Anulado' },
];

const ESTADO_BADGE: Record<string, string> = {
  BORRADOR: 'badge-warning',
  ABIERTO: 'badge-success',
  ADJUDICADO: 'badge-success',
  EN_EJECUCION: 'badge-success',
  CERRADO: 'badge-warning',
  ANULADO: 'badge-danger',
};

export const estadoLabel = (estado?: string | null) =>
  ESTADO_OPTIONS.find((o) => o.value === estado)?.label ?? estado ?? '';

export const estadoBadgeClass = (estado?: string | null) =>
  (estado && ESTADO_BADGE[estado]) || 'badge-warning';
