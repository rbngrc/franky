import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useProveedor } from '../features/proveedores/hooks/useProveedor';
import { deleteProveedor } from '../features/proveedores/api/proveedorApiService';
import { DeclaracionDDL } from '../features/proveedores/components/DeclaracionDDL';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingIndicator } from '../components/LoadingIndicator';

export const ProveedorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { proveedor, isLoading, error } = useProveedor(id ? Number(id) : undefined);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;
  if (!proveedor) return <p style={{ padding: '1rem' }}>Proveedor no encontrado.</p>;

  const handleDelete = async () => {
    try {
      await deleteProveedor(proveedor.id);
      navigate('/proveedores');
    } catch (err: unknown) {
      setConfirmDelete(false);
      setDeleteError(
        err instanceof Error && err.message
          ? `No se pudo eliminar el proveedor: ${err.message}`
          : 'No se pudo eliminar el proveedor. Puede tener expedientes asociados.'
      );
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="detail-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>{proveedor.nombre}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/proveedores/editar/${proveedor.id}`} className="btn btn-primary btn-sm">
            Editar
          </Link>
          <button onClick={() => setConfirmDelete(true)} className="btn btn-outline-danger btn-sm">
            Eliminar
          </button>
        </div>
      </div>

      {deleteError && <div className="error-box" style={{ marginBottom: '1rem' }}>{deleteError}</div>}

      <div className="card card-body">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Nombre / Razón social</div>
            <div className="detail-value text-bold">{proveedor.nombre}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Documento</div>
            <div className="detail-value">{proveedor.tipoDocumento} {proveedor.numeroDocumento}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Dirección</div>
            <div className="detail-value">{proveedor.direccion || <span className="text-muted">No disponible</span>}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Teléfono</div>
            <div className="detail-value">{proveedor.telefono || <span className="text-muted">No disponible</span>}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{proveedor.email || <span className="text-muted">No disponible</span>}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">País de origen</div>
            <div className="detail-value">{proveedor.paisOrigen}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Región / Estado</div>
            <div className="detail-value">{proveedor.regionOrigen || <span className="text-muted">No especificado</span>}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Estado</div>
            <div className="detail-value">
              <span className={`badge ${proveedor.activo ? 'badge-success' : 'badge-danger'}`}>
                {proveedor.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: '1rem' }}>
        <DeclaracionDDL proveedor={proveedor} />
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar proveedor"
        message={`¿Eliminar el proveedor "${proveedor.nombre}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};
