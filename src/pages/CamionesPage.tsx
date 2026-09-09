import { Link } from 'react-router-dom';
import { useCamiones } from '../features/camiones/hooks/useCamiones';

export const CamionesPage = () => {
  const { camiones, isLoading, error } = useCamiones();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Camiones</h1>
        <Link to="/camiones/nuevo" className="btn btn-primary">
          + Nuevo camión
        </Link>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-text">Cargando camiones...</div>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {!isLoading && !error && camiones.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🚛</div>
          <p className="empty-state-text">No hay camiones registrados</p>
          <p className="empty-state-sub">Añade tu primer camión para empezar.</p>
          <Link to="/camiones/nuevo" className="btn btn-primary">
            + Nuevo camión
          </Link>
        </div>
      )}

      {camiones.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Capacidad (t)</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {camiones.map((c) => (
                <tr key={c.matricula}>
                  <td className="text-bold" style={{ whiteSpace: 'nowrap' }}>{c.matricula}</td>
                  <td>{c.marca}</td>
                  <td>{c.modelo}</td>
                  <td>{c.capacidadToneladas}</td>
                  <td>
                    <span className={`badge ${c.activo ? 'badge-success' : 'badge-danger'}`}>
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/camiones/${encodeURIComponent(c.matricula)}`} className="btn btn-sm btn-outline">
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
