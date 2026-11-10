import { Link } from 'react-router-dom';
import { useParcelas } from '../features/parcelas/hooks/useParcelas';

const eudrBadge = (eudrCompliant: boolean | null) => {
  if (eudrCompliant === true) return <span className="badge badge-success">Cumple</span>;
  if (eudrCompliant === false) return <span className="badge badge-danger">No cumple</span>;
  return <span className="badge badge-warning">Pendiente</span>;
};

export const TablaDetalladaPage = () => {
  const { parcelas, isLoading, error } = useParcelas();

  if (isLoading) return <p className="text-muted" style={{ marginTop: '1rem' }}>Cargando parcelas...</p>;
  if (error) return <p className="text-danger" style={{ marginTop: '1rem' }}>{error}</p>;
  if (parcelas.length === 0) return <p className="text-muted" style={{ marginTop: '1rem' }}>No se encontraron parcelas.</p>;

  return (
    <div className="table-wrapper">
      <table className="table">
        <thead>
          <tr>
            <th>Nombre</th>
            <th>Municipio</th>
            <th>Provincia</th>
            <th>Cumplimiento EUDR</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {parcelas.map((parcela) => (
            <tr key={parcela.id}>
              <td className="text-bold">{parcela.nombre}</td>
              <td>{parcela.municipio || '—'}</td>
              <td>{parcela.provincia || '—'}</td>
              <td>{eudrBadge(parcela.eudrCompliant)}</td>
              <td>
                <Link to={`/parcelas/detalle/${parcela.id}`} className="btn btn-sm btn-outline">
                  Ver detalle →
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};
