export type FotoClave = 'frente' | 'trasera' | 'lateral' | 'ticket';

export type CapturaFotos = Partial<Record<FotoClave, string>>;

export type CapturaDraft = {
  matricula: string;
  pesoNetoKg: number | null;
  pesoBrutoKg: number | null;
  taraKg: number | null;
  numeroTicket: string;
  fecha: string;
  hora: string;
  fotos: CapturaFotos;
};