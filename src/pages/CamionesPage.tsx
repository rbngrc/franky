import { Link } from 'react-router-dom';
import { useCamiones } from '../features/camiones/hooks/useCamiones';

export const CamionesPage = () => {
  const { camiones, isLoading, error } = useCamiones();

  return (
    <div className="page-container">
      <div className="page-header">
        <p className="page-desc">Flota de vehículos de transporte</p>
        <Link to="/camiones/nuevo" className="btn btn-primary">
          + Nuevo vehículo
        </Link>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-text">Cargando vehículos...</div>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {!isLoading && !error && camiones.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">🚛</div>
          <p className="empty-state-text">No hay vehículos registrados</p>
          <p className="empty-state-sub">Añade tu primer camión o remolque para empezar.</p>
          <Link to="/camiones/nuevo" className="btn btn-primary">
            + Nuevo vehículo
          </Link>
        </div>
      )}

      {camiones.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Matrícula</th>
                <th>Tipo</th>
                <th>Marca</th>
                <th>Modelo</th>
                <th>Capacidad (m³)</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {camiones.map((c) => (
                <tr key={c.matricula}>
                  <td className="text-bold" style={{ whiteSpace: 'nowrap' }}>{c.matricula}</td>
                  <td>
                    <span className={`badge ${c.tipo === 'REMOLQUE' ? 'badge-warning' : 'badge-info'}`}>
                      {c.tipo === 'REMOLQUE' ? 'Remolque' : 'Camión'}
                    </span>
                  </td>
                  <td>{c.marca || '—'}</td>
                  <td>{c.modelo || '—'}</td>
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
