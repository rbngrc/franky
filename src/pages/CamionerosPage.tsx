import { Link } from 'react-router-dom';
import { useCamioneros } from '../features/camioneros/hooks/useCamioneros';

export const CamionerosPage = () => {
  const { camioneros, isLoading, error } = useCamioneros();

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Camioneros</h1>
        <Link to="/camioneros/nuevo" className="btn btn-primary">
          + Nuevo camionero
        </Link>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-text">Cargando camioneros...</div>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {!isLoading && !error && camioneros.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">👤</div>
          <p className="empty-state-text">No hay camioneros registrados</p>
          <p className="empty-state-sub">Añade tu primer camionero para empezar.</p>
          <Link to="/camioneros/nuevo" className="btn btn-primary">
            + Nuevo camionero
          </Link>
        </div>
      )}

      {camioneros.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>DNI</th>
                <th>Nombre</th>
                <th>Teléfono</th>
                <th>Email</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {camioneros.map((c) => (
                <tr key={c.dni}>
                  <td className="text-bold" style={{ whiteSpace: 'nowrap' }}>{c.dni}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{c.nombre} {c.apellidos}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{c.telefono}</td>
                  <td>{c.email}</td>
                  <td>
                    <span className={`badge ${c.activo ? 'badge-success' : 'badge-danger'}`}>
                      {c.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/camioneros/${c.dni}`} className="btn btn-sm btn-outline">
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
