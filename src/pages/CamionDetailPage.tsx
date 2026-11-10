import { useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useCamion } from '../features/camiones/hooks/useCamion';
import { deleteCamion } from '../features/camiones/api/camionApiService';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { LoadingIndicator } from '../components/LoadingIndicator';

export const CamionDetailPage = () => {
  const { matricula } = useParams<{ matricula: string }>();
  const navigate = useNavigate();
  const { camion, isLoading, error } = useCamion(matricula);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;
  if (!camion) return <p style={{ padding: '1rem' }}>Vehículo no encontrado.</p>;

  const esRemolque = camion.tipo === 'REMOLQUE';

  const handleDelete = async () => {
    try {
      await deleteCamion(camion.matricula);
      navigate('/camiones');
    } catch (err: unknown) {
      setConfirmDelete(false);
      setDeleteError(
        err instanceof Error && err.message
          ? `No se pudo eliminar el vehículo: ${err.message}`
          : 'No se pudo eliminar el vehículo. Puede tener transportes asociados.'
      );
    }
  };

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="detail-header" style={{ marginBottom: '1.5rem' }}>
        <h1 className="page-title" style={{ margin: 0 }}>
          {esRemolque ? 'Remolque' : 'Camión'} {camion.matricula}
        </h1>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link to={`/camiones/editar/${encodeURIComponent(camion.matricula)}`} className="btn btn-primary btn-sm">
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
            <div className="detail-label">Matrícula</div>
            <div className="detail-value text-bold">{camion.matricula}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Tipo</div>
            <div className="detail-value">
              <span className={`badge ${esRemolque ? 'badge-warning' : 'badge-info'}`}>
                {esRemolque ? 'Remolque' : 'Camión'}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Marca</div>
            <div className="detail-value">{camion.marca || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Modelo</div>
            <div className="detail-value">{camion.modelo || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Capacidad</div>
            <div className="detail-value">{camion.capacidadToneladas} m³</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Tara</div>
            <div className="detail-value">{camion.tara} kg</div>
          </div>
          {!esRemolque && (
            <div className="detail-item">
              <div className="detail-label">Remolque</div>
              <div className="detail-value">{camion.remolqueMatricula || <span className="text-muted">Sin remolque</span>}</div>
            </div>
          )}
          <div className="detail-item">
            <div className="detail-label">Estado</div>
            <div className="detail-value">
              <span className={`badge ${camion.activo ? 'badge-success' : 'badge-danger'}`}>
                {camion.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar vehículo"
        message={`¿Eliminar el vehículo "${camion.matricula}"? Esta acción no se puede deshacer.`}
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};
