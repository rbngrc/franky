import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import styles from '../../styles/Sidebar.module.css';
import { TerrenoIlustracion } from './TerrenoIlustracion';
import HomeIcon from '@mui/icons-material/Home';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import GppGoodIcon from '@mui/icons-material/GppGood';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HandshakeIcon from '@mui/icons-material/Handshake';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import { useRole } from '../../features/config/RoleContext';

type SubItem = { to: string; label: string };

const crear: Record<string, SubItem[]> = {
  '/expedientes': [{ to: '/expedientes/nuevo', label: 'Nuevo expediente' }],
  '/parcelas/tabla': [{ to: '/parcelas/nueva', label: 'Nueva parcela' }],
  '/camiones': [{ to: '/camiones/nuevo', label: 'Nuevo vehículo' }],
  '/conductores': [{ to: '/conductores/nuevo', label: 'Nuevo conductor' }],
  '/transportes': [{ to: '/transportes/nuevo', label: 'Nuevo transporte' }],
  '/centros': [{ to: '/centros/nuevo', label: 'Nuevo centro' }],
  '/proveedores': [{ to: '/proveedores/nuevo', label: 'Nuevo proveedor' }],
};

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

const navItem = (to: string, icon: React.ReactNode, label: string) => (
  <NavLink to={to} end={to === '/'} className={linkClass}>
    <span className={styles.navIcon}>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export const Sidebar = () => {
  const { canViewAll, isAdminChopos, isAdminForestal, isAgenteForestal, isConductor } = useRole();
  const { pathname } = useLocation();
  const [abierto, setAbierto] = useState<string | null>(null);
  const esInicio = pathname === '/' && !isConductor && !isAgenteForestal;

  if (isConductor) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.brand}>
          <span className={styles.brandStar}>*</span>
          FRANKY
        </div>
        <div className={styles.brandSub}>Conductor</div>

        <nav className={styles.nav}>
          {navItem('/', <HomeIcon fontSize="small" />, 'Inicio')}
          {navItem('/conductor', <PhotoCameraIcon fontSize="small" />, 'Escáner')}
        </nav>

        <div className={styles.footer}>SUPER!!</div>
      </aside>
    );
  }

  if (isAgenteForestal) {
    return (
      <aside className={styles.sidebar}>
        <div className={styles.brand}><span className={styles.brandStar}>*</span> FRANKY</div>
        <div className={styles.brandSub}>Agente forestal</div>
        <nav className={styles.nav}>
          {navItem('/', <HomeIcon fontSize="small" />, 'Inicio')}
          {navItem('/agente/escanear', <PhotoCameraIcon fontSize="small" />, 'Escaner QR')}
          {navItem('/transportes', <RouteIcon fontSize="small" />, 'Transportes')}
        </nav>
        <div className={styles.footer}>SUPER!!</div>
      </aside>
    );
  }

  const showExpedientes = canViewAll || isAdminForestal || isAgenteForestal || isAdminChopos;
  const showDashboard = canViewAll || isAdminChopos || isAdminForestal || isAgenteForestal;
  const showParcelas = canViewAll || isAdminChopos || isAdminForestal;
  const showCamiones = canViewAll || isAdminChopos || isAdminForestal;
  const showConductores = canViewAll || isAdminChopos || isAdminForestal;
  const showTransportes = canViewAll || isAdminChopos || isAdminForestal || isAgenteForestal;
  const showCentros = canViewAll || isAdminChopos || isAdminForestal;
  const showProveedores = canViewAll || isAdminChopos || isAdminForestal;
  const showEudr = canViewAll;

  const activo = (to: string) => pathname.startsWith(`/${to.split('/')[1]}`);

  const modulo = (to: string, icon: React.ReactNode, label: string) => {
    const expandido = abierto === to;
    return (
      <div key={to}>
        <button
          type="button"
          className={`${styles.navLink} ${styles.navButton} ${activo(to) ? styles.navLinkActive : ''}`}
          aria-expanded={expandido}
          onClick={() => setAbierto(expandido ? null : to)}
        >
          <span className={styles.navIcon}>{icon}</span>
          <span>{label}</span>
          <span className={styles.navArrow} aria-hidden="true">&rsaquo;</span>
        </button>
        {expandido && (
          <div className={styles.submenu}>
            {[{ to, label: 'Consultar' }, ...(crear[to] ?? [])].map((s) => (
              <NavLink
                key={s.label}
                to={s.to}
                className={styles.submenuLink}
                onClick={() => setAbierto(null)}
              >
                {s.label}
              </NavLink>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandStar}>*</span>
        FRANKY
      </div>
      <div className={styles.brandSub}>Forestal Tracker</div>

      <div className={styles.navWrap}>
        <TerrenoIlustracion className={esInicio ? undefined : styles.tenue} />
        {!esInicio && (
          <nav className={styles.nav}>
            {navItem('/', <HomeIcon fontSize="small" />, 'Inicio')}
            {showDashboard && modulo('/dashboard', <InsertChartIcon fontSize="small" />, 'Panel de Control')}
            {showExpedientes && modulo('/expedientes', <DescriptionIcon fontSize="small" />, 'Expedientes')}
            {showParcelas && modulo('/parcelas/tabla', <WarehouseIcon fontSize="small" />, 'Parcelas')}
            {showCamiones && modulo('/camiones', <LocalShippingIcon fontSize="small" />, 'Vehículos')}
            {showConductores && modulo('/conductores', <PersonIcon fontSize="small" />, 'Conductores')}
            {showTransportes && modulo('/transportes', <RouteIcon fontSize="small" />, 'Transportes')}
            {showCentros && modulo('/centros', <StorefrontIcon fontSize="small" />, 'Centros')}
            {showProveedores && modulo('/proveedores', <HandshakeIcon fontSize="small" />, 'Proveedores')}
            {showEudr && modulo('/eudr', <GppGoodIcon fontSize="small" />, 'Cumplimiento Certificaciones')}
          </nav>
        )}
      </div>

      <div className={styles.footer}>SUPER!!</div>
    </aside>
  );
};
