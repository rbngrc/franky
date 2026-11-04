import { Link } from 'react-router-dom';
import { useContext } from 'react';
import { RoleContext } from '../features/config/RoleContext';
import { ConductorHomePage } from './ConductorHomePage';
export const CamioneroHomePage = ConductorHomePage; // compatibilidad
import { AgenteHomePage } from './AgenteHomePage';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HandshakeIcon from '@mui/icons-material/Handshake';
import GppGoodIcon from '@mui/icons-material/GppGood';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DescriptionIcon from '@mui/icons-material/Description';
import styles from '../styles/InicioPage.module.css';

const MODULES = [
  {
    to: '/expedientes',
    label: 'Expedientes',
    description: 'Expedientes, licitaciones y proveedores',
    icon: <DescriptionIcon sx={{ fontSize: 32 }} />,
  },
  {
    to: '/parcelas/tabla',
    label: 'Parcelas',
    description: 'Fincas, superficies y geolocalización',
    icon: <WarehouseIcon sx={{ fontSize: 32 }} />,
  },
  {
    to: '/camiones',
    label: 'Camiones',
    description: 'Flota de vehículos de transporte',
    icon: <LocalShippingIcon sx={{ fontSize: 32 }} />,
  },
  {
    to: '/conductores',
    label: 'Conductores',
    description: 'Conductores y carnés profesionales',
    icon: <PersonIcon sx={{ fontSize: 32 }} />,
  },
  {
    to: '/transportes',
    label: 'Transportes',
    description: 'Cargas, trazabilidad y rutas',
    icon: <RouteIcon sx={{ fontSize: 32 }} />,
  },
  {
    to: '/centros',
    label: 'Centros',
    description: 'Destinos de recepción de madera',
    icon: <StorefrontIcon sx={{ fontSize: 32 }} />,
  },
  {
    to: '/proveedores',
    label: 'Proveedores',
    description: 'Orígenes y declaraciones DDL',
    icon: <HandshakeIcon sx={{ fontSize: 32 }} />,
  },
  {
    to: '/eudr',
    label: 'Cumplimiento',
    description: 'Certificaciones EUDR, PEFC y SURE',
    icon: <GppGoodIcon sx={{ fontSize: 32 }} />,
  },
  {
    to: '/dashboard',
    label: 'Panel de Control',
    description: 'Estadísticas y métricas del sistema',
    icon: <InsertChartIcon sx={{ fontSize: 32 }} />,
  },
];

const QUICK_ACTIONS = [
  { to: '/expedientes/nuevo', label: 'Crear nuevo expediente' },
  { to: '/parcelas/crear-sigpac', label: 'Añadir parcela desde SIGPAC' },
  { to: '/camiones/nuevo', label: 'Registrar nuevo camión' },
  { to: '/conductores/nuevo', label: 'Registrar nuevo conductor' },
  { to: '/transportes/nuevo', label: 'Registrar nuevo transporte' },
  { to: '/centros/nuevo', label: 'Registrar nuevo centro' },
  { to: '/proveedores/nuevo', label: 'Registrar nuevo proveedor' },
  { to: '/dashboard', label: 'Ver estadísticas del sistema' },
];

export const InicioPage = () => {
  // Un conductor no necesita el panel de administracion: su home es su
  // trabajo (transportes asignados, escaneo y sincronizacion offline).
  const roleCtx = useContext(RoleContext);
  if (roleCtx?.isConductor) {
    return <ConductorHomePage />;
  }
  if (roleCtx?.isAgenteForestal) {
    return <AgenteHomePage />;
  }
  return (
    <div className="page-container">
      <div className={styles.header}>
        <h1 className="page-title">Inicio</h1>
        <p className="page-subtitle">Sistema de gestión forestal y certificaciones</p>
      </div>

      <section className={styles.card}>
        <h2 className={`section-title ${styles.modulesTitle}`}>★ Módulos</h2>
        <div className={styles.modules}>
          {MODULES.map((m) => (
            <Link key={m.to} to={m.to} className={styles.moduleCard}>
              <span className={styles.moduleStar}>★</span>
              <span className={styles.moduleIcon}>{m.icon}</span>
              <span className={styles.moduleName}>{m.label}</span>
              <span className={styles.moduleDescription}>{m.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className={styles.card}>
        <h2 className={`section-title ${styles.quickTitle}`}>★ Acciones rápidas</h2>
        <div className={styles.quick}>
          {QUICK_ACTIONS.map((a) => (
            <Link key={a.to} to={a.to} className={styles.quickLink}>
              + {a.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};
