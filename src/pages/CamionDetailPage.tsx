import { useParams, Link } from 'react-router-dom';
import { useCamion } from '../features/camiones/hooks/useCamion';
import { LoadingIndicator } from '../components/LoadingIndicator';

export const CamionDetailPage = () => {
  const { matricula } = useParams<{ matricula: string }>();
  const { camion, isLoading, error } = useCamion(matricula);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;
  if (!camion) return <p style={{ padding: '1rem' }}>Camión no encontrado.</p>;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <Link to="/camiones" className="back-link">&larr; Volver a camiones</Link>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>Camión {camion.matricula}</h1>

      <div className="card card-body">
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Matrícula</div>
            <div className="detail-value text-bold">{camion.matricula}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Marca</div>
            <div className="detail-value">{camion.marca}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Modelo</div>
            <div className="detail-value">{camion.modelo}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Capacidad</div>
            <div className="detail-value">{camion.capacidadToneladas} t</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Tara</div>
            <div className="detail-value">{camion.tara} kg</div>
          </div>
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

      <Link to={`/camiones/editar/${encodeURIComponent(camion.matricula)}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Editar camión
      </Link>
    </div>
  );
};
