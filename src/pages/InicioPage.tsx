import { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
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

type SubItem = { to: string; label: string };

const MODULES: Array<{
  to: string;
  label: string;
  description: string;
  icon: React.ReactNode;
  crear?: SubItem[];
}> = [
  {
    to: '/dashboard',
    label: 'Panel de Control',
    description: 'Estadísticas y métricas del sistema',
    icon: <InsertChartIcon sx={{ fontSize: 24 }} />,
  },
  {
    to: '/expedientes',
    label: 'Expedientes',
    description: 'Expedientes, licitaciones y proveedores',
    icon: <DescriptionIcon sx={{ fontSize: 24 }} />,
    crear: [{ to: '/expedientes/nuevo', label: 'Nuevo expediente' }],
  },
  {
    to: '/parcelas/tabla',
    label: 'Parcelas',
    description: 'Fincas, superficies y geolocalización',
    icon: <WarehouseIcon sx={{ fontSize: 24 }} />,
    crear: [{ to: '/parcelas/nueva', label: 'Nueva parcela' }],
  },
  {
    to: '/camiones',
    label: 'Vehículos',
    description: 'Flota de vehículos de transporte',
    icon: <LocalShippingIcon sx={{ fontSize: 24 }} />,
    crear: [{ to: '/camiones/nuevo', label: 'Nuevo vehículo' }],
  },
  {
    to: '/conductores',
    label: 'Conductores',
    description: 'Conductores y carnés profesionales',
    icon: <PersonIcon sx={{ fontSize: 24 }} />,
    crear: [{ to: '/conductores/nuevo', label: 'Nuevo conductor' }],
  },
  {
    to: '/transportes',
    label: 'Transportes',
    description: 'Cargas, trazabilidad y rutas',
    icon: <RouteIcon sx={{ fontSize: 24 }} />,
    crear: [{ to: '/transportes/nuevo', label: 'Nuevo transporte' }],
  },
  {
    to: '/centros',
    label: 'Centros',
    description: 'Destinos de recepción de madera',
    icon: <StorefrontIcon sx={{ fontSize: 24 }} />,
    crear: [{ to: '/centros/nuevo', label: 'Nuevo centro' }],
  },
  {
    to: '/proveedores',
    label: 'Proveedores',
    description: 'Orígenes y declaraciones DDL',
    icon: <HandshakeIcon sx={{ fontSize: 24 }} />,
    crear: [{ to: '/proveedores/nuevo', label: 'Nuevo proveedor' }],
  },
  {
    to: '/eudr',
    label: 'Cumplimiento',
    description: 'Certificaciones EUDR, PEFC y SURE',
    icon: <GppGoodIcon sx={{ fontSize: 24 }} />,
  },
];

export const InicioPage = () => {
  // Un conductor no necesita el panel de administracion: su home es su
  // trabajo (transportes asignados, escaneo y sincronizacion offline).
  const roleCtx = useContext(RoleContext);
  const navigate = useNavigate();
  const [abierto, setAbierto] = useState<string | null>(null);
  const [saliendo, setSaliendo] = useState(false);

  const irA = (to: string) => {
    setAbierto(null);
    setSaliendo(true);
    window.setTimeout(() => navigate(to), 280);
  };

  if (roleCtx?.isConductor) {
    return <ConductorHomePage />;
  }
  if (roleCtx?.isAgenteForestal) {
    return <AgenteHomePage />;
  }
  return (
    <div className="page-container">
      <div className={styles.header}>
        <p className="page-desc">Sistema de gestión forestal y certificaciones</p>
      </div>

      <section className={`${styles.card} ${saliendo ? styles.cardSaliendo : ''}`}>
        <h2 className={`section-title ${styles.modulesTitle}`}>Módulos</h2>
        <nav className={styles.modules}>
          {MODULES.map((m) => (
            <div key={m.to} className={styles.moduleItem}>
              <button
                type="button"
                className={styles.moduleRow}
                aria-expanded={abierto === m.to}
                onClick={() => setAbierto(abierto === m.to ? null : m.to)}
              >
                <span className={styles.moduleIcon}>{m.icon}</span>
                <span className={styles.moduleText}>
                  <span className={styles.moduleName}>{m.label}</span>
                  <span className={styles.moduleDescription}>{m.description}</span>
                </span>
                <span className={styles.moduleArrow} aria-hidden="true">›</span>
              </button>

              {abierto === m.to && (
                <div className={styles.submenu}>
                  {[{ to: m.to, label: 'Consultar' }, ...(m.crear ?? [])].map((s) => (
                    <button
                      key={s.to}
                      type="button"
                      className={styles.submenuLink}
                      onClick={() => irA(s.to)}
                    >
                      {s.label}
                    </button>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </section>
    </div>
  );
};
