import { useCallback, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransportes } from '../features/transportes/hooks/useTransportes';
import { CalendarWidget } from '../components/CalendarWidget';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { tipoMaderaLabel } from '../constants/madera';
import { escapeCSVCell } from '../features/transportes/utils/csv';

const exportToCSV = (data: ReturnType<typeof useTransportes>['transportes']) => {
  const headers = ['Código Trazabilidad', 'Camión', 'Camionero', 'Madera', 'Toneladas', 'Fecha', 'Destino', 'EUDR', 'PEFC', 'SURE'];
  const rows = data.map((t) => [
    t.codigoTrazabilidad, t.camionMatricula,
    t.camioneroNombre || t.camioneroDni, tipoMaderaLabel(t.tipoMadera),
    t.toneladasCargadas, new Date(t.fechaCarga).toLocaleDateString(),
    t.destino, t.eudrCumplimiento ? 'Cumple' : 'Pendiente',
    t.pefcCumplimiento ? 'Cumple' : 'Pendiente',
    t.sureCumplimiento ? 'Cumple' : 'Pendiente',
  ]);

  const csv = [headers.map(escapeCSVCell).join(','), ...rows.map((r) => r.map(escapeCSVCell).join(','))].join('\n');
  const blob = new Blob(['\uFEFF' + csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `transportes_${new Date().toISOString().split('T')[0]}.csv`;
  a.click();
  URL.revokeObjectURL(url);
};

export const TransportesPage = () => {
  const { transportes, isLoading, error, deleteTransporte } = useTransportes();
  const handleExport = useCallback(() => exportToCSV(transportes), [transportes]);
  const [pendingDelete, setPendingDelete] = useState<number | null>(null);

  const handleDelete = async () => {
    if (pendingDelete === null) return;
    try {
      await deleteTransporte(pendingDelete);
      setPendingDelete(null);
    } catch {
      // error silencioso
    }
  };

  return (
    <div className="page-container">
      <div className="page-header">
        <h1 className="page-title">Transportes</h1>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {transportes.length > 0 && (
            <button onClick={handleExport} className="btn btn-outline">
              Exportar CSV
            </button>
          )}
          <Link to="/transportes/nuevo" className="btn btn-primary">
            + Nuevo transporte
          </Link>
        </div>
      </div>

      {isLoading && (
        <div className="loading-container">
          <div className="loading-text">Cargando transportes...</div>
          <div className="loading-bar">
            <div className="loading-bar-fill" />
          </div>
        </div>
      )}

      {error && <div className="error-box">{error}</div>}

      {!isLoading && !error && transportes.length === 0 && (
        <div className="empty-state">
          <div className="empty-state-icon">📦</div>
          <p className="empty-state-text">No hay transportes registrados</p>
          <p className="empty-state-sub">Registra un transporte para empezar a trackear la trazabilidad.</p>
          <Link to="/transportes/nuevo" className="btn btn-primary">
            + Nuevo transporte
          </Link>
        </div>
      )}

      {transportes.length > 0 && (
        <div style={{ display: 'flex', gap: '1.5rem', flexWrap: 'wrap' }}>
          <div style={{ flex: 1, minWidth: 0 }} className="table-wrapper">
            <table className="table" style={{ minWidth: '750px' }}>
              <thead>
                <tr>
                  <th>Código Trazabilidad</th>
                  <th>Camión</th>
                  <th>Camionero</th>
                  <th>Madera</th>
                  <th>Toneladas</th>
                  <th>Fecha</th>
                  <th>EUDR</th>
                  <th>PEFC</th>
                  <th>SURE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transportes.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/transportes/${t.id}`} style={{
                        fontFamily: "'Courier New', monospace",
                        fontWeight: 600,
                        fontSize: '0.9rem',
                        letterSpacing: '0.5px',
                        background: '#f5f5f5',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        textDecoration: 'none',
                        color: '#1565C0',
                      }}>
                        {t.codigoTrazabilidad}
                      </Link>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>{t.camionMatricula}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{t.camioneroNombre || t.camioneroDni}</td>
                    <td>{tipoMaderaLabel(t.tipoMadera)}</td>
                    <td>{t.toneladasCargadas}</td>
                    <td style={{ whiteSpace: 'nowrap' }}>{new Date(t.fechaCarga).toLocaleDateString()}</td>
                    <td>
                      <span className={`badge ${t.eudrCumplimiento ? 'badge-success' : 'badge-danger'}`}>
                        {t.eudrCumplimiento ? '✓ EUDR' : '✗ EUDR'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.pefcCumplimiento ? 'badge-success' : 'badge-danger'}`}>
                        {t.pefcCumplimiento ? '✓ PEFC' : '✗ PEFC'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${t.sureCumplimiento ? 'badge-success' : 'badge-danger'}`}>
                        {t.sureCumplimiento ? '✓ SURE' : '✗ SURE'}
                      </span>
                    </td>
                    <td style={{ whiteSpace: 'nowrap' }}>
                      <Link to={`/transportes/${t.id}`} className="btn btn-sm btn-outline">
                        Ver detalle →
                      </Link>
                      {' | '}
                      <button onClick={() => setPendingDelete(t.id)} className="btn btn-sm btn-danger">
                        Eliminar
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <CalendarWidget transportes={transportes} />
        </div>
      )}

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Eliminar transporte"
        message="¿Eliminar este transporte? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setPendingDelete(null)}
      />
    </div>
  );
};
