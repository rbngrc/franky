export const formatMetrosCubicos = (value: number) =>
  `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value)} m³`;

export const formatHectareas = (value: number) =>
  `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 1 }).format(value)} ha`;

export const formatKilometros = (value: number) =>
  `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value)} km`;

export const formatEntero = (value: number) =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(value);

export const formatKpi = (value: number, decimals = 0) =>
  new Intl.NumberFormat('es-ES', { maximumFractionDigits: decimals }).format(value);

export const PALETTE = [
  '#1565C0',
  '#2E7D32',
  '#F57F17',
  '#0097A7',
  '#6A1B9A',
  '#C62828',
  '#4527A0',
  '#00838F',
];
