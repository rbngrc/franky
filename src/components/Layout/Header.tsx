import { useLocation, Link } from 'react-router-dom';
import { useRole, type UserRole, type PreviewRole } from '../../features/config/RoleContext';
import { useCamioneros } from '../../features/camioneros/hooks/useCamioneros';
import { ConnectionStatus } from '../../features/pwa/components/ConnectionStatus';
import styles from '../../styles/Header.module.css';

const routeLabels: Record<string, string> = {
  '/': 'Inicio',
  '/conductor': 'Escáner conductor',
  '/parcelas/tabla': 'Parcelas',
  '/parcelas/crear-sigpac': 'Nueva parcela SIGPAC',
  '/camiones': 'Camiones',
  '/camiones/nuevo': 'Nuevo camión',
  '/conductores': 'Conductores',
  '/conductores/nuevo': 'Nuevo conductor',
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
  const label =
    routeLabels[location.pathname] ||
    (location.pathname.startsWith('/conductor/escanear/') ? 'Escáner conductor' : 'Franky App');

  const parentPath = breadcrumbMap[location.pathname];
  const parentLabel = parentPath ? routeLabels[parentPath] : undefined;
  const { role, setRole, isDios, previewAs, setPreviewAs, isConductor, conductorDni, setConductorDni } = useRole();
  const { camioneros: conductores } = useCamioneros();

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
        <select value={role} onChange={(e)=>setRole(e.target.value as UserRole)} style={{padding:"4px 8px",borderRadius:4,border:"1px solid var(--color-border)"}}><option value="ADMIN_GENERAL">Admin general</option><option value="ADMIN_CHOPOS">Admin chopos</option><option value="ADMIN_FORESTAL">Admin forestal</option><option value="EMPRESA">Empresa</option><option value="CONDUCTOR">Conductor</option><option value="AGENTE_FORESTAL_OPERARIO">Agente forestal/operario</option><option value="DIOS">Dios (superusuario)</option></select>
        {isDios && (
          <select value={previewAs} onChange={(e) => setPreviewAs(e.target.value as PreviewRole)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}>
            <option value="none">Sin vista previa</option>
            <option value="CONDUCTOR">Vista previa: conductor</option>
            <option value="agente">Vista previa: agente</option>
          </select>
        )}
        {(isConductor || (isDios && previewAs === 'CONDUCTOR')) && (
          <select value={conductorDni || ''} onChange={(e) => setConductorDni(e.target.value || null)} style={{ padding: '4px 8px', borderRadius: 4, border: '1px solid var(--color-border)' }}>
            <option value="">Selecciona conductor</option>
            {(conductores || []).map((c) => (
              <option key={c.dni} value={c.dni}>{c.dni} - {c.nombre} {c.apellidos}</option>
            ))}
          </select>
        )}
        <ConnectionStatus />
      </div>
    </header>
  );
};
