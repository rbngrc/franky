import { Link } from 'react-router-dom';
import { useCentros } from '../features/centros/hooks/useCentros';

export const CentrosPage = () => {
  const { centros, isLoading, error } = useCentros();

  if (isLoading) return <p className="text-muted" style={{ marginTop: '1rem' }}>Cargando centros...</p>;
  if (error) return <p className="text-danger" style={{ marginTop: '1rem' }}>{error}</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <p className="page-desc">Destinos de recepción de madera</p>
        <Link to="/centros/nuevo" className="btn btn-primary">
          + Nuevo centro
        </Link>
      </div>

      {centros.length === 0 ? (
        <p className="text-muted" style={{ marginTop: '1rem' }}>No se encontraron centros.</p>
      ) : (
        <div className="table-wrapper">
          <table className="table">
            <thead>
              <tr>
                <th>Nombre</th>
                <th>Tipo</th>
                <th>Dirección</th>
                <th>Estado</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {centros.map((centro) => (
                <tr key={centro.id}>
                  <td className="text-bold">{centro.nombre}</td>
                  <td>{centro.tipo}</td>
                  <td>{centro.direccion || '—'}</td>
                  <td>
                    <span className={`badge ${centro.activo ? 'badge-success' : 'badge-danger'}`}>
                      {centro.activo ? 'Activo' : 'Inactivo'}
                    </span>
                  </td>
                  <td>
                    <Link to={`/centros/${centro.id}`} className="btn btn-sm btn-outline">
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
