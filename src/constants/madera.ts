export interface TipoMaderaOption {
  value: string;
  label: string;
}

export const TIPO_MADERA_OPTIONS: TipoMaderaOption[] = [
  { value: 'ROBLE', label: 'Roble' },
  { value: 'HAYA', label: 'Haya' },
  { value: 'PINO', label: 'Pino' },
  { value: 'CASTANO', label: 'Castaño' },
  { value: 'CHOPO', label: 'Chopo' },
  { value: 'ENCINA', label: 'Encina' },
  { value: 'ALCORNOQUE', label: 'Alcornoque' },
  { value: 'EUCALIPTO', label: 'Eucalipto' },
  { value: 'NOGAL', label: 'Nogal' },
  { value: 'CEREZO', label: 'Cerezo' },
];

export const TIPO_MADERA_LABEL: Record<string, string> = Object.fromEntries(
  TIPO_MADERA_OPTIONS.map((o) => [o.value, o.label])
);

export const tipoMaderaLabel = (tipo: string): string =>
  TIPO_MADERA_LABEL[tipo] || tipo;
