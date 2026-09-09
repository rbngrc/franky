import { Link } from 'react-router-dom';
import { useProveedores } from '../features/proveedores/hooks/useProveedores';

export const ProveedoresPage = () => {
  const { proveedores, isLoading, error } = useProveedores();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Proveedores</h1>
        <Link to="/proveedores/nuevo" className="btn btn-primary">
          + Nuevo proveedor
        </Link>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-text">Cargando proveedores...</div>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {!isLoading && !error && proveedores.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📋</div>
          <p className="empty-state-text">No hay proveedores registrados</p>
          <p className="empty-state-sub">Añade proveedores externos de madera.</p>
          <Link to="/proveedores/nuevo" className="btn btn-primary">
            + Nuevo proveedor
          </Link>
        </div>
      )}

      {proveedores.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>NIF/CIF</th>
                <th>País origen</th>
                <th>Región</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {proveedores.map((p) => (
                <tr key={p.id}>
                  <td className="text-bold">{p.nombre}</td>
                  <td>{p.tipoDocumento} {p.numeroDocumento}</td>
                  <td>{p.paisOrigen}</td>
                  <td>{p.regionOrigen || '-'}</td>
                  <td>
                    <span className={`badge ${p.activo ? 'badge-success' : 'badge-danger'}`}>
                      {p.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/proveedores/${p.id}`} className="btn btn-sm btn-outline">
                      Ver detalle →
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
