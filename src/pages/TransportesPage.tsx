import { useCallback, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTransportes } from '../features/transportes/hooks/useTransportes';
import { CalendarWidget } from '../components/CalendarWidget';
import { tipoMaderaLabel } from '../constants/madera';
import { escapeCSVCell } from '../features/transportes/utils/csv';
import styles from '../styles/TransportesPage.module.css';

const exportToCSV = (data: ReturnType<typeof useTransportes>['transportes']) => {
  const headers = ['Código Trazabilidad', 'Camión', 'Camionero', 'Madera', 'Metros cúbicos', 'Fecha', 'Destino', 'EUDR', 'PEFC', 'SURE'];
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
  const { transportes, isLoading, error } = useTransportes();
  const [fechaFiltro, setFechaFiltro] = useState('');
  const [orden, setOrden] = useState<'desc' | 'asc'>('desc');

  const transportesVisibles = useMemo(() => {
    const filtrados = fechaFiltro
      ? transportes.filter((t) => t.fechaCarga.slice(0, 10) === fechaFiltro)
      : transportes;
    return [...filtrados].sort((a, b) => {
      const dif = new Date(a.fechaCarga).getTime() - new Date(b.fechaCarga).getTime();
      return orden === 'asc' ? dif : -dif;
    });
  }, [transportes, fechaFiltro, orden]);

  const handleExport = useCallback(() => exportToCSV(transportesVisibles), [transportesVisibles]);

  return (
    <div className="page-container">
      <div className="page-header">
        <p className="page-desc">Cargas, trazabilidad y rutas</p>
        <div className={styles.acciones}>
          {transportes.length > 0 && (
            <button onClick={handleExport} className={`btn btn-outline ${styles.botonGrande}`}>
              Exportar CSV
            </button>
          )}
          <Link to="/transportes/nuevo" className={`btn btn-primary ${styles.botonGrande}`}>
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
        <>
          <div className={styles.calendarioFijo}>
            <CalendarWidget transportes={transportes} />
          </div>

          <div className={styles.filtros}>
            <label>
              Fecha
              <input
                type="date"
                value={fechaFiltro}
                onChange={(e) => setFechaFiltro(e.target.value)}
              />
            </label>
            <label>
              Orden
              <select value={orden} onChange={(e) => setOrden(e.target.value as 'asc' | 'desc')}>
                <option value="desc">Más recientes primero</option>
                <option value="asc">Más antiguos primero</option>
              </select>
            </label>
            {fechaFiltro && (
              <button className="btn btn-sm btn-outline" onClick={() => setFechaFiltro('')}>
                Ver todas
              </button>
            )}
          </div>

          <div className="table-wrapper">
            <table className="table" style={{ minWidth: '750px' }}>
              <thead>
                <tr>
                  <th>Nombre</th>
                  <th>Madera</th>
                  <th>Metros cúbicos</th>
                  <th>Fecha</th>
                  <th>EUDR</th>
                  <th>PEFC</th>
                  <th>SURE</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {transportesVisibles.length === 0 && (
                  <tr>
                    <td colSpan={8} className={styles.sinResultados}>
                      No hay transportes en la fecha seleccionada
                    </td>
                  </tr>
                )}
                {transportesVisibles.map((t) => (
                  <tr key={t.id}>
                    <td>
                      <Link to={`/transportes/${t.id}`} style={{ fontWeight: 600, textDecoration: 'none', color: '#1565C0' }}>
                        {(t.nombre || `Transporte #${t.id}`).toUpperCase()}
                      </Link>
                    </td>
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
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}

    </div>
  );
};
