export type MaquinariaAsignada = {
  id: string;
  parcelaId: string;
  nombre: string;
  tipo: string | null;
  horas: number | null;
  costeHora: number | null;
  fecha: string;
};

export type MaquinariaAsignadaFormData = {
  parcelaId: string;
  nombre: string;
  tipo: string;
  horas: number | null;
  costeHora: number | null;
  fecha: string;
};
