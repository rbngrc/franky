import { useParams, useNavigate } from 'react-router-dom';
import { useCentro } from '../features/centros/hooks/useCentro';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { applyDefaultLeafletIcon } from '../lib/leafletIcon';
applyDefaultLeafletIcon();

export const CentroDetailPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { centro, isLoading, error } = useCentro(id ? Number(id) : null);

  if (isLoading) return <p className="text-muted" style={{ marginTop: '1rem' }}>Cargando centro...</p>;
  if (error) return <p className="text-danger" style={{ marginTop: '1rem' }}>{error}</p>;
  if (!centro) return <p className="text-muted" style={{ marginTop: '1rem' }}>Centro no encontrado.</p>;

  const hasCoords = centro.latitud != null && centro.longitud != null;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <div className="detail-header">
        <h1 className="page-title">{centro.nombre}</h1>
        <button onClick={() => navigate(`/centros/editar/${centro.id}`)} className="btn btn-primary btn-sm">
          Editar
        </button>
      </div>

      <div className="card" style={{ marginBottom: '1rem' }}>
        <div className="detail-grid">
          <div className="detail-item">
            <div className="detail-label">Tipo</div>
            <div className="detail-value">{centro.tipo}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Dirección</div>
            <div className="detail-value">{centro.direccion || '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Estado</div>
            <div className="detail-value">
              <span className={`badge ${centro.activo ? 'badge-success' : 'badge-danger'}`}>
                {centro.activo ? 'Activo' : 'Inactivo'}
              </span>
            </div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Latitud</div>
            <div className="detail-value">{centro.latitud ?? '—'}</div>
          </div>
          <div className="detail-item">
            <div className="detail-label">Longitud</div>
            <div className="detail-value">{centro.longitud ?? '—'}</div>
          </div>
        </div>
      </div>

      {hasCoords && (
        <div style={{ height: 300, width: '100%' }} className="map-container-box">
          <MapContainer
            center={[centro.latitud!, centro.longitud!]}
            zoom={15}
            style={{ height: '100%', width: '100%' }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            <Marker position={[centro.latitud!, centro.longitud!]}>
              <Popup>{centro.nombre}</Popup>
            </Marker>
          </MapContainer>
        </div>
      )}

      <button onClick={() => navigate('/centros')} className="btn btn-secondary" style={{ marginTop: '1rem' }}>
        ← Volver
      </button>
    </div>
  );
};
