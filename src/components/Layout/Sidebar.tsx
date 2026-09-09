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

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`;

const navItem = (to: string, icon: React.ReactNode, label: string) => (
  <NavLink to={to} className={linkClass}>
    <span className={styles.navIcon}>{icon}</span>
    <span>{label}</span>
  </NavLink>
);

export const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <span className={styles.brandStar}>★</span>
        FRANKY
      </div>
      <div className={styles.brandSub}>Forestal Tracker</div>

      <nav className={styles.nav}>
        {navItem('/', <HomeIcon fontSize="small" />, 'Inicio')}
        {navItem('/parcelas/tabla', <WarehouseIcon fontSize="small" />, 'Parcelas')}
        {navItem('/camiones', <LocalShippingIcon fontSize="small" />, 'Camiones')}
        {navItem('/camioneros', <PersonIcon fontSize="small" />, 'Camioneros')}
        {navItem('/transportes', <RouteIcon fontSize="small" />, 'Transportes')}
        {navItem('/centros', <StorefrontIcon fontSize="small" />, 'Centros')}
        {navItem('/proveedores', <HandshakeIcon fontSize="small" />, 'Proveedores')}
        {navItem('/eudr', <GppGoodIcon fontSize="small" />, 'Cumplimiento Certificaciones')}
      </nav>

      <div className={styles.footer}>SUPER!! ★</div>
    </aside>
  );
};
