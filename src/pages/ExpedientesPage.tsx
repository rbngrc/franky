import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useExpedientes } from '../features/expedientes/hooks/useExpedientes';
import { useProveedores } from '../features/proveedores/hooks/useProveedores';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { estadoBadgeClass, estadoLabel } from '../constants/expediente';

const formatImporte = (importe?: number | null) =>
  importe != null ? `${importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '-';

const formatFecha = (fecha?: string | null) =>
  fecha ? new Date(fecha).toLocaleDateString() : '-';

export const ExpedientesPage = () => {
  const { expedientes, loading, error, deleteExpediente } = useExpedientes();
  const { proveedores } = useProveedores();
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const proveedorNombre = (id?: number | null) =>
    id != null ? proveedores.find((p) => p.id === id)?.nombre : undefined;

  const handleDelete = async () => {
    if (pendingDelete === null) return;
    setDeleteError(null);
    try {
      await deleteExpediente(pendingDelete);
      setPendingDelete(null);
    } catch (e) {
      setDeleteError(e instanceof Error ? e.message : 'Error al eliminar el expediente');
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Expedientes</h1>
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
      {deleteError && <div className="error-box">{deleteError}</div>}

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
                    {' | '}
                    <Link to={`/expedientes/editar/${e.id}`} className="btn btn-sm btn-outline">
                      Editar
                    </Link>
                    {' | '}
                    <button
                      type="button"
                      onClick={() => e.id != null && setPendingDelete(e.id)}
                      className="btn btn-sm btn-danger"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar expediente"
        message="¿Eliminar este expediente? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};

export default ExpedientesPage;
