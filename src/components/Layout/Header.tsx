import { useLocation, Link } from 'react-router-dom';
import styles from '../../styles/Header.module.css';

const routeLabels: Record<string, string> = {
  '/': 'Inicio',
  '/parcelas/tabla': 'Parcelas',
  '/parcelas/crear-sigpac': 'Nueva parcela SIGPAC',
  '/camiones': 'Camiones',
  '/camiones/nuevo': 'Nuevo camión',
  '/camioneros': 'Camioneros',
  '/camioneros/nuevo': 'Nuevo camionero',
  '/transportes': 'Transportes',
  '/transportes/nuevo': 'Nuevo transporte',
  '/centros': 'Centros',
  '/centros/nuevo': 'Nuevo centro',
  '/eudr': 'Cumplimiento Certificaciones',
};

const breadcrumbMap: Record<string, string> = {
  '/parcelas/tabla': '/parcelas',
  '/parcelas/crear-sigpac': '/parcelas',
};

export const Header = () => {
  const location = useLocation();
  const label = routeLabels[location.pathname] || 'Franky App';

  const parentPath = breadcrumbMap[location.pathname];
  const parentLabel = parentPath ? routeLabels[parentPath] : undefined;

  return (
    <header className={styles.header}>
      <div>
        <h1 className={styles.title}>
          <span className={styles.titleAccent}>★</span> {label}
        </h1>
        {parentLabel && (
          <div className={styles.breadcrumb}>
            <Link to={parentPath!}>{parentLabel}</Link> / {label}
          </div>
        )}
      </div>
      <div className={styles.userArea}>
        <span className={styles.userDot} />
        Online
      </div>
    </header>
  );
};
