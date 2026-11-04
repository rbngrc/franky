import { NavLink } from 'react-router-dom';
import styles from '../../styles/Sidebar.module.css';
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

  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandStar}>*</span>
        FRANKY
      </div>
      <div className={styles.brandSub}>Forestal Tracker</div>

      <nav className={styles.nav}>
        {navItem('/', <HomeIcon fontSize="small" />, 'Inicio')}
        {showDashboard && navItem('/dashboard', <InsertChartIcon fontSize="small" />, 'Panel de Control')}
        {showExpedientes && navItem('/expedientes', <DescriptionIcon fontSize="small" />, 'Expedientes')}
        {showParcelas && navItem('/parcelas/tabla', <WarehouseIcon fontSize="small" />, 'Parcelas')}
        {showCamiones && navItem('/camiones', <LocalShippingIcon fontSize="small" />, 'Camiones')}
        {showConductores && navItem('/conductores', <PersonIcon fontSize="small" />, 'Conductores')}
        {showTransportes && navItem('/transportes', <RouteIcon fontSize="small" />, 'Transportes')}
        {showCentros && navItem('/centros', <StorefrontIcon fontSize="small" />, 'Centros')}
        {showProveedores && navItem('/proveedores', <HandshakeIcon fontSize="small" />, 'Proveedores')}
        {showEudr && navItem('/eudr', <GppGoodIcon fontSize="small" />, 'Cumplimiento Certificaciones')}
      </nav>

      <div className={styles.footer}>SUPER!!</div>
    </aside>
  );
};
