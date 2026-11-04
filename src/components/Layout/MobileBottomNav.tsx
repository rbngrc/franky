import { NavLink } from 'react-router-dom';
import HomeIcon from '@mui/icons-material/Home';
import PhotoCameraIcon from '@mui/icons-material/PhotoCamera';
import SyncIcon from '@mui/icons-material/Sync';
import styles from '../../styles/MobileBottomNav.module.css';
import { useOffline } from '../../features/offline/OfflineProvider';
import { useRole } from '../../features/config/RoleContext';

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `${styles.item} ${isActive ? styles.active : ''}`;

export const MobileBottomNav = () => {
  const { isOnline, pendingCount, syncing, syncNow } = useOffline();
  const { isAgenteForestal } = useRole();
  const homePath = isAgenteForestal ? '/agente' : '/';
  const scanPath = isAgenteForestal ? '/agente/escanear' : '/conductor';
  const scanLabel = isAgenteForestal ? 'Escaner QR' : 'Escaner';

  return (
    <nav className={styles.nav} aria-label="Navegacion movil">
      <NavLink to={homePath} end className={linkClass}>
        <HomeIcon fontSize="small" />
        <span>Inicio</span>
      </NavLink>
      <NavLink to={scanPath} className={linkClass}>
        <PhotoCameraIcon fontSize="small" />
        <span>{scanLabel}</span>
      </NavLink>
      <button
        type="button"
        className={styles.item}
        onClick={() => void syncNow()}
        disabled={syncing || pendingCount === 0 || !isOnline}
        style={{ border: 'none', background: 'transparent', cursor: 'pointer' }}
      >
        <SyncIcon fontSize="small" />
        <span>{syncing ? 'Sync...' : pendingCount > 0 ? `Sync (${pendingCount})` : 'Sync'}</span>
      </button>
    </nav>
  );
};
