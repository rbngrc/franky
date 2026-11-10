import { useState } from 'react';
import { useLocation, useNavigate, Link } from 'react-router-dom';
import { useRole, type PreviewRole } from '../../features/config/RoleContext';
import { useCamioneros } from '../../features/camioneros/hooks/useCamioneros';
import { ConnectionStatus } from '../../features/pwa/components/ConnectionStatus';
import { ROLE_LABELS, getRol } from '../../features/auth/mockRoles';
import styles from '../../styles/Header.module.css';

const routeLabels: Record<string, string> = {
  '/': 'Inicio',
  '/conductor': 'Escáner conductor',
  '/dashboard': 'Panel de Control',
  '/parcelas/tabla': 'Parcelas',
  '/parcelas/nueva': 'Nueva parcela',
  '/parcelas/crear-sigpac': 'Nueva parcela desde catastro',
  '/parcelas/importar-gis': 'Nueva parcela desde GIS',
  '/expedientes': 'Expedientes',
  '/expedientes/nuevo': 'Nuevo expediente',
  '/camiones': 'Vehículos',
  '/camiones/nuevo': 'Nuevo vehículo',
  '/conductores': 'Conductores',
  '/conductores/nuevo': 'Nuevo conductor',
  '/transportes': 'Transportes',
  '/transportes/nuevo': 'Nuevo transporte',
  '/centros': 'Centros',
  '/centros/nuevo': 'Nuevo centro',
  '/proveedores': 'Proveedores',
  '/proveedores/nuevo': 'Nuevo proveedor',
  '/eudr': 'Cumplimiento Certificaciones',
};

const breadcrumbMap: Record<string, string> = {
  '/parcelas/tabla': '/parcelas',
  '/parcelas/crear-sigpac': '/parcelas',
};

const editLabels: Array<[string, string]> = [
  ['/camiones/editar/', 'Editar vehículo'],
  ['/conductores/editar/', 'Editar conductor'],
  ['/transportes/editar/', 'Editar transporte'],
  ['/expedientes/editar/', 'Editar expediente'],
  ['/centros/editar/', 'Editar centro'],
  ['/proveedores/editar/', 'Editar proveedor'],
];

export const Header = () => {
  const location = useLocation();
  const label =
    routeLabels[location.pathname] ||
    editLabels.find(([prefix]) => location.pathname.startsWith(prefix))?.[1] ||
    (location.pathname.startsWith('/conductor/escanear/') ? 'Escáner conductor' : 'Franky App');

  const parentPath = breadcrumbMap[location.pathname];
  const parentLabel = parentPath ? routeLabels[parentPath] : undefined;
  const { role, isDios, previewAs, setPreviewAs, isConductor, conductorDni, setConductorDni } = useRole();
  const { camioneros: conductores } = useCamioneros();
  const navigate = useNavigate();
  const [perfilAbierto, setPerfilAbierto] = useState(false);

  const perfil = getRol(role);
  const iniciales = perfil.nombre
    .split(' ')
    .map((parte) => parte[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  const cerrarSesion = () => {
    try {
      sessionStorage.removeItem('franky.sesion');
    } catch {
      // sin almacenamiento disponible
    }
    setPerfilAbierto(false);
    navigate('/login');
  };

  return (
    <header className={styles.header}>
      <div className={styles.titleWrap}>
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

        <div className={styles.perfilWrap}>
          <button
            type="button"
            className={styles.perfilBoton}
            aria-expanded={perfilAbierto}
            onClick={() => setPerfilAbierto((abierto) => !abierto)}
          >
            <span className={styles.avatar}>{iniciales}</span>
            <span>Mi perfil</span>
            <span className={styles.perfilFlecha} aria-hidden="true">▾</span>
          </button>

          {perfilAbierto && (
            <>
              <div className={styles.perfilFondo} onClick={() => setPerfilAbierto(false)} />
              <div className={styles.perfilMenu}>
                <div className={styles.perfilNombre}>{perfil.nombre}</div>
                <div className={styles.perfilRol}>{ROLE_LABELS[perfil.rol]}</div>
                <div className={styles.perfilDato}><span>Cargo</span><span>{perfil.cargo}</span></div>
                <div className={styles.perfilDato}><span>Email</span><span>{perfil.email}</span></div>
                <div className={styles.perfilDato}><span>Teléfono</span><span>{perfil.telefono}</span></div>
                {perfil.dni && (
                  <div className={styles.perfilDato}><span>DNI</span><span>{perfil.dni}</span></div>
                )}
                <button type="button" className={styles.perfilSalir} onClick={cerrarSesion}>
                  Cerrar sesión
                </button>
              </div>
            </>
          )}
        </div>

        <ConnectionStatus />
      </div>
    </header>
  );
};
