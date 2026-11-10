import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useExpediente } from '../features/expedientes/hooks/useExpediente';
import { useExpedientes } from '../features/expedientes/hooks/useExpedientes';
import { useProveedores } from '../features/proveedores/hooks/useProveedores';
import { useTransportes } from '../features/transportes/hooks/useTransportes';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { estadoBadgeClass, estadoLabel } from '../constants/expediente';

const formatFecha = (fecha?: string | null) => (fecha ? new Date(fecha).toLocaleDateString() : '—');

const formatImporte = (importe?: number | null) =>
  importe != null ? `${importe.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €` : '—';

export const ExpedienteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { expediente, isLoading, error } = useExpediente(id ? Number(id) : undefined);
  const { deleteExpediente } = useExpedientes();
  const { proveedores } = useProveedores();
  const { transportes } = useTransportes();
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleDelete = async () => {
    if (!id) return;
    try {
      await deleteExpediente(Number(id));
      navigate('/expedientes');
    } catch {
      // error silencioso
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;
  if (!expediente) return <p style={{ padding: '1rem' }}>Expediente no encontrado.</p>;

  const proveedor = proveedores.find((p) => p.id === expediente.proveedorId);
  const transportesVinculados = transportes.filter((t) => t.expedienteId === expediente.id);

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <div className="detail-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          <h1 className="page-title" style={{ margin: 0 }}>{expediente.codigoExpediente}</h1>
          {expediente.numeroLicitacion && (
            <div className="text-muted" style={{ marginTop: '0.25rem' }}>
              Licitación: {expediente.numeroLicitacion}
            </div>
          )}
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/expedientes/editar/${expediente.id}`} className="btn btn-primary btn-sm">
            Editar
          </Link>
          <button onClick={() => setConfirmDelete(true)} className="btn btn-outline-danger btn-sm">
            Eliminar
          </button>
        </div>
      </div>

      <div className="card card-body">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Estado</div>
            <div className="detail-value">
              {expediente.estado
                ? <span className={`badge ${estadoBadgeClass(expediente.estado)}`}>{estadoLabel(expediente.estado)}</span>
                : <span className="text-muted">(vacío)</span>}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Activo</div>
            <div className="detail-value">
              <span className={`badge ${expediente.activo ? 'badge-success' : 'badge-danger'}`}>
                {expediente.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Proveedor / Empresa</div>
            <div className="detail-value">
              {proveedor
                ? <Link to={`/proveedores/${proveedor.id}`}>{proveedor.nombre}</Link>
                : <span className="text-muted">Sin proveedor asignado</span>}
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Importe</div>
            <div className="detail-value">{formatImporte(expediente.importe)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Fecha de apertura</div>
            <div className="detail-value">{formatFecha(expediente.fechaApertura)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Fecha de adjudicación</div>
            <div className="detail-value">{formatFecha(expediente.fechaAdjudicacion)}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Descripción</div>
            <div className="detail-value">{expediente.descripcion || <span className="text-muted">(vacío)</span>}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Observaciones</div>
            <div className="detail-value">{expediente.observaciones || <span className="text-muted">(vacío)</span>}</div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1.5rem' }}>
        <h3 style={{ marginBottom: '0.75rem' }}>
          Transportes vinculados ({transportesVinculados.length})
        </h3>
        {transportesVinculados.length === 0 ? (
          <div className="card card-body">
            <p className="text-muted" style={{ margin: 0 }}>
              Este expediente no tiene transportes asociados. Puedes asociar un transporte desde su
              formulario de alta o edición, seleccionando este expediente.
            </p>
          </div>
        ) : (
          <div className="table-wrapper">
            <table className="table">
              <thead>
                <tr>
                  <th>Código trazabilidad</th>
                  <th>Camión</th>
                  <th>Conductor</th>
                  <th>Fecha</th>
                  <th>Destino</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transportesVinculados.map((t) => (
                  <tr key={t.id}>
                    <td>{t.codigoTrazabilidad}</td>
                    <td>{t.camionMatricula}</td>
                    <td>{t.conductorNombre || t.conductorDni}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.fechaCarga).toLocaleDateString()}</td>
                    <td>{t.centroNombre || t.destino || '-'}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link to={`/transportes/${t.id}`} className="btn btn-sm btn-outline">
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

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar expediente"
        message="¿Eliminar este expediente? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export default ExpedienteDetailPage;
