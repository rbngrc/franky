import { useParams, Link } from 'react-router-dom';
import { useProveedor } from '../features/proveedores/hooks/useProveedor';
import { DeclaracionDDL } from '../features/proveedores/components/DeclaracionDDL';
import { LoadingIndicator } from '../components/LoadingIndicator';

export const ProveedorDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { proveedor, isLoading, error } = useProveedor(id ? Number(id) : undefined);

  if (isLoading) return <LoadingIndicator />;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;
  if (!proveedor) return <p style={{ padding: '1rem' }}>Proveedor no encontrado.</p>;

  return (
    <div className="page-container" style={{ maxWidth: '800px' }}>
      <Link to="/proveedores" className="back-link">&larr; Volver a proveedores</Link>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>{proveedor.nombre}</h1>

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

      <Link to={`/proveedores/editar/${proveedor.id}`} className="btn btn-primary" style={{ marginTop: '1rem' }}>
        Editar proveedor
      </Link>
    </div>
  );
};
