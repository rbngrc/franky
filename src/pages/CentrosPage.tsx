import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useCentros } from '../features/centros/hooks/useCentros';
import { deleteCentro } from '../features/centros/api/centroApiService';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const CentrosPage = () => {
  const { centros, isLoading, error, reload } = useCentros();
  const navigate = useNavigate();
  const [pendingDelete, setPendingDelete] = useState<{ id: number; nombre: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    try {
      await deleteCentro(pendingDelete.id);
      reload();
      setPendingDelete(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar');
    }
  };

  if (isLoading) return <p className="text-muted" style={{ marginTop: '1rem' }}>Cargando centros...</p>;
  if (error) return <p className="text-danger" style={{ marginTop: '1rem' }}>{error}</p>;

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Centros</h1>
        <button onClick={() => navigate('/centros/nuevo')} className="btn btn-primary">
          + Nuevo centro
        </button>
      </div>

      {errorMsg && <p className="text-danger" style={{ marginTop: '1rem' }}>{errorMsg}</p>}

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
                <th>Acciones</th>
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
                  <td style={{ display: 'flex', gap: 8 }}>
                    <button onClick={() => navigate(`/centros/${centro.id}`)} className="btn btn-sm btn-outline">
                      Ver
                    </button>
                    <button onClick={() => navigate(`/centros/editar/${centro.id}`)} className="btn btn-sm btn-outline">
                      Editar
                    </button>
                    <button onClick={() => setPendingDelete({ id: centro.id, nombre: centro.nombre })} className="btn btn-sm btn-danger">
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar centro"
        message={pendingDelete ? `¿Eliminar el centro "${pendingDelete.nombre}"?` : ''}
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
