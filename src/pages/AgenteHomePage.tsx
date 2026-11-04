import { Link } from 'react-router-dom';
import { useTransportesOfflineFirst } from '../features/transportes/hooks/useTransportesOfflineFirst';
import { useOffline } from '../features/offline/OfflineProvider';
import { tipoMaderaLabel } from '../constants/madera';
import { LoadingIndicator } from '../components/LoadingIndicator';

export const AgenteHomePage = () => {
  const { transportes, loading, fromCache, error, reload } = useTransportesOfflineFirst();
  const { isOnline, pendingCount, syncing, syncNow } = useOffline();

  return (
    <div className="page-container">
      <h1 className="page-title">Panel del agente</h1>
      <p className="page-subtitle">
        Lee el QR de un transporte y valida pesos, ticket y certificaciones en campo.
      </p>

      <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <Link to="/agente/escanear" className="btn btn-primary">
          Escanear QR
        </Link>
        <button type="button" className="btn btn-secondary" onClick={() => void reload()} disabled={loading}>
          Actualizar
        </button>
        <button type="button" className="btn btn-secondary" onClick={() => void syncNow()} disabled={syncing || pendingCount === 0 || !isOnline}>
          {syncing ? 'Sincronizando...' : `Sincronizar ${pendingCount > 0 ? `(${pendingCount})` : ''}`}
        </button>
        <span className={isOnline ? 'badge badge-success' : 'badge badge-danger'}>{isOnline ? 'Online' : 'Offline'}</span>
      </div>

      {fromCache && !error && <div style={{ color: '#1565C0', marginBottom: '0.75rem' }}>Mostrando datos guardados sin conexion</div>}
      {error && <div className="error-box">{error}</div>}

      <section>
        <h2 className="section-title">Transportes a validar ({transportes.length})</h2>
        {loading && <LoadingIndicator />}
        {!loading && transportes.length === 0 && !error && <p>No hay transportes disponibles.</p>}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
          {transportes.slice(0, 30).map((t) => (
            <article key={t.id} style={{ border: '1px solid #E8EDF2', borderRadius: '10px', padding: '0.85rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap' }}>
                <strong>#{t.id} · {t.camionMatricula}</strong>
                <code>{t.codigoTrazabilidad}</code>
              </div>
              <div style={{ fontSize: '0.9rem', marginTop: '0.35rem' }}>
                <div>Destino: {t.destino || t.centroNombre || '-'}</div>
                <div>Madera: {tipoMaderaLabel(t.tipoMadera) || t.tipoMadera} · {t.toneladasCargadas} t</div>
                <div>Parcela: {t.parcelaNombre || t.parcelaId}</div>
                <div>Fecha: {new Date(t.fechaCarga).toLocaleDateString()}</div>
              </div>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginTop: '0.6rem' }}>
                <span className={`badge ${t.eudrCumplimiento ? 'badge-success' : 'badge-danger'}`}>EUDR {t.eudrCumplimiento ? 'OK' : 'NO'}</span>
                <span className={`badge ${t.pefcCumplimiento ? 'badge-success' : 'badge-danger'}`}>PEFC {t.pefcCumplimiento ? 'OK' : 'NO'}</span>
                <span className={`badge ${t.sureCumplimiento ? 'badge-success' : 'badge-danger'}`}>SURE {t.sureCumplimiento ? 'OK' : 'NO'}</span>
              </div>
              <div style={{ marginTop: '0.6rem' }}>
                <Link to={`/transportes/${t.id}`} className="btn btn-sm btn-primary">
                  Validar datos
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
};

export default AgenteHomePage;