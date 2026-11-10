import type { UserRole } from '../config/RoleContext';

export const ROLE_LABELS: Record<UserRole, string> = {
  ADMIN_GENERAL: 'Administrador general',
  ADMIN_CHOPOS: 'Administrador de chopos',
  ADMIN_FORESTAL: 'Administrador forestal',
  EMPRESA: 'Empresa',
  CONDUCTOR: 'Conductor',
  AGENTE_FORESTAL_OPERARIO: 'Agente forestal / operario',
  DIOS: 'Superusuario',
};

export type RolFranky = {
  rol: UserRole;
  descripcion: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono: string;
  dni?: string;
};

export const ROLES: RolFranky[] = [
  {
    rol: 'ADMIN_GENERAL',
    descripcion: 'Control total de la aplicación: parcelas, expedientes, transportes, flota, conductores, centros y proveedores.',
    nombre: 'Carlos Serrano',
    cargo: 'Dirección de operaciones',
    email: 'carlos.serrano@franky.es',
    telefono: '600 100 100',
  },
  {
    rol: 'ADMIN_CHOPOS',
    descripcion: 'Gestión centrada en choperas: parcelas, expedientes y transportes de chopo.',
    nombre: 'Marta Ruiz',
    cargo: 'Responsable de choperas',
    email: 'marta.ruiz@franky.es',
    telefono: '600 100 101',
  },
  {
    rol: 'ADMIN_FORESTAL',
    descripcion: 'Gestión forestal: parcelas, expedientes, certificaciones y cumplimiento EUDR.',
    nombre: 'Javier Nogal',
    cargo: 'Ingeniero forestal',
    email: 'javier.nogal@franky.es',
    telefono: '600 100 102',
  },
  {
    rol: 'EMPRESA',
    descripcion: 'Consulta de expedientes y trazabilidad de la madera para el cumplimiento EUDR.',
    nombre: 'Silvia Prado',
    cargo: 'Compras de madera',
    email: 'silvia.prado@maderas-prado.es',
    telefono: '600 100 103',
  },
  {
    rol: 'CONDUCTOR',
    descripcion: 'Ve sus transportes asignados, escanea QR y registra pesajes y fotos del camión.',
    nombre: 'Juan Juanez Juanez',
    cargo: 'Conductor',
    email: 'juan.juanez@franky.es',
    telefono: '612 345 678',
    dni: '12345678Z',
  },
  {
    rol: 'AGENTE_FORESTAL_OPERARIO',
    descripcion: 'Trabajo de campo: escaneo de QR, consulta de parcelas y estado de los transportes.',
    nombre: 'Pedro Alameda',
    cargo: 'Agente forestal',
    email: 'pedro.alameda@franky.es',
    telefono: '600 100 105',
  },
  {
    rol: 'DIOS',
    descripcion: 'Superusuario: todo el sistema y vista previa de las experiencias de conductor y agente.',
    nombre: 'Franky Superusuario',
    cargo: 'Superusuario',
    email: 'dios@franky.es',
    telefono: '600 100 106',
  },
];

export const getRol = (rol: UserRole): RolFranky => ROLES.find((r) => r.rol === rol) ?? ROLES[0];
