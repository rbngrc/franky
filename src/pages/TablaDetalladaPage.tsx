import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useParcelas } from '../features/parcelas/hooks/useParcelas';
import { deleteParcela } from '../features/parcelas/api/parcelaApiService';
import { ConfirmDialog } from '../components/ConfirmDialog';

export const TablaDetalladaPage = () => {
  const { parcelas, isLoading, error, reload } = useParcelas();
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [pendingDelete, setPendingDelete] = useState<{ id: string; nombre: string } | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const handleDelete = async () => {
    if (!pendingDelete) return;
    setDeletingId(pendingDelete.id);
    try {
      await deleteParcela(pendingDelete.id);
      reload();
      setPendingDelete(null);
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al eliminar la parcela');
    } finally {
      setDeletingId(null);
    }
  };

  if (isLoading) {
    return <p style={{ marginTop: '1rem', color: '#666' }}>Cargando parcelas...</p>;
  }

  if (error) {
    return <p style={{ marginTop: '1rem', color: 'red' }}>{error}</p>;
  }

  if (parcelas.length === 0) {
    return <p style={{ marginTop: '1rem' }}>No se encontraron parcelas.</p>;
  }

  return (
    <>
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid black' }}>
          <th style={{ padding: '8px', textAlign: 'left' }}>Nombre</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Municipio</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Provincia</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Cumplimiento EUDR</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {parcelas.map((parcela) => (
          <tr key={parcela.id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>{parcela.nombre}</td>
            <td style={{ padding: '8px' }}>{parcela.municipio || '—'}</td>
            <td style={{ padding: '8px' }}>{parcela.provincia || '—'}</td>
            <td style={{ padding: '8px' }}>
              <span style={{
                color: parcela.eudrCompliant === true ? 'green' : parcela.eudrCompliant === false ? 'red' : '#b8860b',
                fontWeight: 'bold'
              }}>
                {parcela.eudrCompliant === true ? 'Cumple' : parcela.eudrCompliant === false ? 'No cumple' : 'Pendiente'}
              </span>
            </td>
            <td style={{ padding: '8px' }}>
              <div style={{ display: 'flex', gap: 8 }}>
              <Link
                to={`/parcelas/detalle/${parcela.id}`}
                style={{ color: '#0097A7', textDecoration: 'none', fontWeight: 500 }}
              >
                Ver detalles
              </Link>
              <button
                onClick={() => setPendingDelete({ id: parcela.id, nombre: parcela.nombre })}
                disabled={deletingId === parcela.id}
                style={{
                  background: 'none',
                  border: 'none',
                  color: deletingId === parcela.id ? '#999' : '#d32f2f',
                  cursor: deletingId === parcela.id ? 'not-allowed' : 'pointer',
                  fontWeight: 500,
                  fontSize: 'inherit'
                }}
              >
                {deletingId === parcela.id ? 'Eliminando...' : 'Eliminar'}
              </button>
              </div>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {errorMsg && <p style={{ marginTop: '1rem', color: 'red' }}>{errorMsg}</p>}
    <ConfirmDialog
      open={pendingDelete !== null}
      title="Eliminar parcela"
      message={pendingDelete ? `¿Eliminar la parcela "${pendingDelete.nombre}"? Esta acción no se puede deshacer.` : ''}
      onConfirm={handleDelete}
      onCancel={() => setPendingDelete(null)}
    />
    </>
  );
};
