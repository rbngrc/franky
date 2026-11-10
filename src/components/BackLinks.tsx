import { Link, useLocation } from 'react-router-dom';
import { useRole } from '../features/config/RoleContext';

const modulos: Record<string, { to: string; label: string }> = {
  camiones: { to: '/camiones', label: 'vehículos' },
  conductores: { to: '/conductores', label: 'conductores' },
  transportes: { to: '/transportes', label: 'transportes' },
  expedientes: { to: '/expedientes', label: 'expedientes' },
  centros: { to: '/centros', label: 'centros' },
  proveedores: { to: '/proveedores', label: 'proveedores' },
  parcelas: { to: '/parcelas/tabla', label: 'parcelas' },
};

export const BackLinks = () => {
  const { pathname } = useLocation();
  const { isConductor, isAgenteForestal } = useRole();

  if (pathname === '/') return null;

  const [, seccion, sub] = pathname.split('/');
  const modulo =
    sub && sub !== 'tabla' && !isConductor && !isAgenteForestal ? modulos[seccion] : undefined;

  return (
    <div className="back-links">
      <Link to="/" className="back-link">&larr; Volver al menú</Link>
      {modulo && <Link to={modulo.to} className="back-link">&larr; Volver a {modulo.label}</Link>}
    </div>
  );
};
