import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCamionero } from '../features/camioneros/hooks/useCamionero';
import { deleteCamionero } from '../features/camioneros/api/camioneroApiService';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingIndicator } from '../components/LoadingIndicator';

export const ConductorDetailPage = () => {
  const { dni } = useParams<{ dni: string }>();
  const navigate = useNavigate();
  const { camionero, isLoading, error } = useCamionero(dni);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;
  if (!camionero) return <p style={{ padding: '1rem' }}>Conductor no encontrado.</p>;

  const handleDelete = async () => {
    try {
      await deleteCamionero(camionero.dni);
      navigate('/conductores');
    } catch (err: unknown) {
      setConfirmDelete(false);
      setDeleteError(
        err instanceof Error && err.message
          ? `No se pudo eliminar el conductor: ${err.message}`
          : 'No se pudo eliminar el conductor. Puede tener transportes asociados.'
      );
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="detail-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>{camionero.nombre} {camionero.apellidos}</h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/conductores/editar/${encodeURIComponent(camionero.dni)}`} className="btn btn-primary btn-sm">
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
            <div className="detail-label">DNI</div>
            <div className="detail-value text-bold">{camionero.dni}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Nombre completo</div>
            <div className="detail-value">{camionero.nombre} {camionero.apellidos}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Teléfono</div>
            <div className="detail-value">{camionero.telefono}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Email</div>
            <div className="detail-value">{camionero.email}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Nº Carnet</div>
            <div className="detail-value">{camionero.numeroCarnet}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Estado</div>
            <div className="detail-value">
              <span className={`badge ${camionero.activo ? 'badge-success' : 'badge-danger'}`}>
                {camionero.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar conductor"
        message={`¿Eliminar el conductor "${camionero.nombre} ${camionero.apellidos}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};

export { ConductorDetailPage as CamioneroDetailPage };
