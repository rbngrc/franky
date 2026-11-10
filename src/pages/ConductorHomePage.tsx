import { Link } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { useTransportesOfflineFirst } from '../features/transportes/hooks/useTransportesOfflineFirst';
import { useOffline } from '../features/offline/OfflineProvider';
import { useRole } from '../features/config/RoleContext';
import { db } from '../features/offline/db';
import { tipoMaderaLabel } from '../constants/madera';
import { LoadingIndicator } from '../components/LoadingIndicator';
import styles from '../styles/CamioneroHome.module.css';

export const ConductorHomePage = () => {
  const { conductorDni } = useRole();
  const { transportes, loading, fromCache, error, reload } = useTransportesOfflineFirst(conductorDni);

  const { isOnline, pendingCount, syncing, syncNow } = useOffline();
  const capturas = useLiveQuery(() => db.capturas.toArray(), []) ?? [];
  const pendientesPorTransporte = new Map<number, number>();
  for (const captura of capturas) {
    if (captura.synced) continue;
    const current = pendientesPorTransporte.get(captura.transporteId) ?? 0;
    pendientesPorTransporte.set(captura.transporteId, current + 1);
  }

  const primerPendienteDeEscaneo = transportes.find((t) => !pendientesPorTransporte.get(t.id));

  return (
    <div className="page-container">
      <div className={styles.header}>
        <h1 className="page-title">Mi trabajo</h1>
        <p className="page-subtitle">
          Consulta tus transportes asignados, escanea el ticket de pesaje y sincroniza cuando tengas cobertura.
        </p>
      </div>

      <div className={styles.statusBar}>
        <span className={`${styles.statusPill} ${isOnline ? styles.online : styles.offline}`}>
          {isOnline ? 'Online' : 'Offline'}
        </span>
        {pendingCount > 0 && (
          <span className={styles.pendingPill}>
            {syncing ? 'Sincronizando...' : `${pendingCount} captura${pendingCount !== 1 ? 's' : ''} pendiente${pendingCount !== 1 ? 's' : ''}`}
          </span>
        )}
        {!isOnline && pendingCount === 0 && (
          <span className={styles.pendingPill}>Se guardará localmente</span>
        )}
        <button
          type="button"
          className="btn btn-sm"
          onClick={() => void reload()}
          disabled={loading}
        >
          Actualizar
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => void syncNow()}
          disabled={syncing || pendingCount === 0 || !isOnline}
        >
          {syncing ? 'Sincronizando...' : 'Sincronizar'}
        </button>
      </div>

      {fromCache && !error && <div className={styles.cacheNote}>Mostrando datos guardados sin conexión</div>}
      {error && <div className="error-box">{error}</div>}

      <section className={styles.section}>
        <h2 className="section-title">Mis transportes asignados ({transportes.length})</h2>
        {loading && <LoadingIndicator />}
        {!loading && transportes.length === 0 && !error && (
          <p className={styles.empty}>No tienes transportes asignados por ahora.</p>
        )}
        <div className={styles.list}>
          {transportes.map((t) => (
            <article key={t.id} className={styles.card}>
              <div className={styles.cardTop}>
                <span className={styles.cardNumber}>#{t.id}</span>
                <span className={styles.cardMatricula}>{t.camionMatricula}</span>
                {pendientesPorTransporte.get(t.id) ? (
                  <span className={styles.pendingCard}>
                    {pendientesPorTransporte.get(t.id)} pendiente(s) de sync
                  </span>
                ) : (
                  <span className={styles.okCard}>Al dia</span>
                )}
              </div>
              <div className={styles.cardBody}>
                <div><strong>Destino:</strong> {t.destino || t.centroNombre || '-'}</div>
                <div><strong>Parcela:</strong> {t.parcelaNombre || t.parcelaId}</div>
                <div><strong>Fecha de carga:</strong> {new Date(t.fechaCarga).toLocaleDateString()}</div>
                <div><strong>Metros cúbicos:</strong> {t.toneladasCargadas} m³</div>
                <div><strong>Madera:</strong> {tipoMaderaLabel(t.tipoMadera) || t.tipoMadera}</div>
                {t.pesoNetoKg != null && (
                  <div><strong>Peso neto medido:</strong> {t.pesoNetoKg} kg</div>
                )}
                {t.numeroTicket && <div><strong>Ticket:</strong> {t.numeroTicket}</div>}
              </div>
              <div className={styles.cardFooter} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <Link to={`/conductor/escanear/${t.id}`} className="btn btn-primary btn-sm">
                  Fotos ticket y vehículo
                </Link>
                <Link to={`/transportes/${t.id}`} className="btn btn-secondary btn-sm">
                  Ver / editar datos
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section className={styles.section}>
        <h2 className="section-title">Acciones rápidas</h2>
        <div className={styles.actions}>
          {primerPendienteDeEscaneo && (
            <Link to={`/conductor/escanear/${primerPendienteDeEscaneo.id}`} className="btn btn-primary">
              Fotos ticket y vehículo pendiente
            </Link>
          )}
          <button type="button" className="btn btn-secondary" onClick={() => void reload()} disabled={loading}>
            Actualizar transportes
          </button>
          <button
            type="button"
            className="btn btn-secondary"
            onClick={() => void syncNow()}
            disabled={syncing || pendingCount === 0 || !isOnline}
          >
            Sincronizar {pendingCount > 0 ? `(${pendingCount})` : ''}
          </button>
        </div>
      </section>
    </div>
  );
};

export { ConductorHomePage as CamioneroHomePage };
export default ConductorHomePage;