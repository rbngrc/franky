import { useLocation } from 'react-router-dom';
import type { SvgIconComponent } from '@mui/icons-material';
import InsertChartIcon from '@mui/icons-material/InsertChart';
import DescriptionIcon from '@mui/icons-material/Description';
import WarehouseIcon from '@mui/icons-material/Warehouse';
import LocalShippingIcon from '@mui/icons-material/LocalShipping';
import PersonIcon from '@mui/icons-material/Person';
import RouteIcon from '@mui/icons-material/Route';
import StorefrontIcon from '@mui/icons-material/Storefront';
import HandshakeIcon from '@mui/icons-material/Handshake';
import GppGoodIcon from '@mui/icons-material/GppGood';
import styles from '../../styles/AppLayout.module.css';

const iconos: Record<string, SvgIconComponent> = {
  dashboard: InsertChartIcon,
  expedientes: DescriptionIcon,
  parcelas: WarehouseIcon,
  camiones: LocalShippingIcon,
  conductores: PersonIcon,
  transportes: RouteIcon,
  centros: StorefrontIcon,
  proveedores: HandshakeIcon,
  eudr: GppGoodIcon,
};

export const SeccionFondo = () => {
  const { pathname } = useLocation();
  const Icono = iconos[pathname.split('/')[1]];

  if (!Icono) return null;

  return (
    <Icono
      aria-hidden="true"
      className={styles.watermark}
      sx={{ fontSize: 'clamp(14rem, 34vw, 34rem)' }}
    />
  );
};
