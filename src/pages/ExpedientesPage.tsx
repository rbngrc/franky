import { Link } from 'react-router-dom';
import { useExpedientes } from '../features/expedientes/hooks/useExpedientes';
import { useProveedores } from '../features/proveedores/hooks/useProveedores';
import { estadoBadgeClass, estadoLabel } from '../constants/expediente';

const formatImporte = (importe?: number | null) =>
  importe != null ? `${importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '-';

const formatFecha = (fecha?: string | null) =>
  fecha ? new Date(fecha).toLocaleDateString() : '-';

export const ExpedientesPage = () => {
  const { expedientes, loading, error } = useExpedientes();
  const { proveedores } = useProveedores();

  const proveedorNombre = (id?: number | null) =>
    id != null ? proveedores.find((p) => p.id === id)?.nombre : undefined;

  return (
    <div className="page-container">
      <div className="page-header">
        <p className="page-desc">Expedientes, licitaciones y proveedores</p>
        <Link to="/expedientes/nuevo" className="btn btn-primary">
          + Nuevo expediente
        </Link>
      </div>

      {loading && (
        <div className="loading-container">
          <div className="loading-text">Cargando expedientes...</div>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {!loading && !error && expedientes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📁</div>
          <p className="empty-state-text">No hay expedientes registrados</p>
          <p className="empty-state-sub">Crea un expediente y asócialo a un proveedor y a sus transportes.</p>
          <Link to="/expedientes/nuevo" className="btn btn-primary">
            + Nuevo expediente
          </Link>
        </div>
      )}

      {expedientes.length > 0 && (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Código</th>
                <th>Nº licitación</th>
                <th>Proveedor</th>
                <th>Estado</th>
                <th>Importe</th>
                <th>Adjudicación</th>
                <th>Activo</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {expedientes.map((e) => (
                <tr key={e.id}>
                  <td className="text-bold">{e.codigoExpediente}</td>
                  <td>{e.numeroLicitacion || '-'}</td>
                  <td>{proveedorNombre(e.proveedorId) || '-'}</td>
                  <td>{e.estado ? <span className={`badge ${estadoBadgeClass(e.estado)}`}>{estadoLabel(e.estado)}</span> : '-'}</td>
                  <td>{formatImporte(e.importe)}</td>
                  <td style={{ whiteSpace: 'nowrap' }}>{formatFecha(e.fechaAdjudicacion)}</td>
                  <td>
                    <span className={`badge ${e.activo ? 'badge-success' : 'badge-danger'}`}>
                      {e.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td style={{ whiteSpace: 'nowrap' }}>
                    <Link to={`/expedientes/${e.id}`} className="btn btn-sm btn-outline">
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

export default ExpedientesPage;
