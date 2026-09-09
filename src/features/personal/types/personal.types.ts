export type PersonalAsignado = {
  id: string;
  parcelaId: string;
  nombre: string;
  rol: string | null;
  jornadas: number | null;
  costeJornada: number | null;
  fecha: string;
};

export type PersonalAsignadoFormData = {
  parcelaId: string;
  nombre: string;
  rol: string;
  jornadas: number | null;
  costeJornada: number | null;
  fecha: string;
};
