import { useParams, Link } from 'react-router-dom';
import { useCamionero } from '../features/camioneros/hooks/useCamionero';
import { LoadingIndicator } from '../components/LoadingIndicator';

export const CamioneroDetailPage = () => {
  const { dni } = useParams<{ dni: string }>();
  const { camionero, isLoading, error } = useCamionero(dni);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;
  if (!camionero) return <p style={{ padding: '1rem' }}>Camionero no encontrado.</p>;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <Link to="/camioneros" className="back-link">&larr; Volver a camioneros</Link>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>{camionero.nombre} {camionero.apellidos}</h1>

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

      <Link to={`/camioneros/editar/${encodeURIComponent(camionero.dni)}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Editar camionero
      </Link>
    </div>
  );
};
