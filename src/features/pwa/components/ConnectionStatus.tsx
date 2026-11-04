import { useOffline } from '../../offline/OfflineProvider';
import styles from '../../../styles/ConnectionStatus.module.css';

export const ConnectionStatus = () => {
  const { isOnline, pendingCount, failedCount, syncing } = useOffline();

  if (!isOnline) {
    return (
      <span className={`${styles.status} ${styles.offline}`} title="Sin conexión. Los cambios se guardarán localmente.">
        <span className={styles.dot} />
        Offline
      </span>
    );
  }

  if (syncing) {
    return (
      <span className={`${styles.status} ${styles.syncing}`} title="Sincronizando cambios pendientes...">
        <span className={styles.dot} />
        Sincronizando...
      </span>
    );
  }

  if (failedCount > 0) {
    return (
      <span className={`${styles.status} ${styles.error}`} title={`${failedCount} operación(es) con error`}>
        <span className={styles.dot} />
        {failedCount} con error
      </span>
    );
  }

  if (pendingCount > 0) {
    return (
      <span className={`${styles.status} ${styles.pending}`} title={`${pendingCount} cambio(s) pendientes de sincronizar`}>
        <span className={styles.dot} />
        {pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}
      </span>
    );
  }

  return (
    <span className={`${styles.status} ${styles.online}`} title="Con conexión">
      <span className={styles.dot} />
      Online
    </span>
  );
};