import type { Bascula } from '../types/bascula.types';
import {
  RADIO_BUSQUEDA_KM,
  RADIO_VALIDO_KM,
  urlNavegacion,
  urlRutaGoogleMaps,
} from '../utils/routeGeometry';
import styles from '../../../styles/BasculasRuta.module.css';

const etiquetaEstado = (bascula: Bascula) => {
  if (bascula.estado === 'operativa') return 'Operativa (confirmada)';
  if (bascula.estado === 'cerrada') return 'Cerrada';
  return 'Sin verificar';
};

const etiquetaAcceso = (bascula: Bascula) => {
  if (bascula.acceso === 'publico') return 'Acceso público';
  if (bascula.acceso === 'restringido') return 'Acceso restringido';
  return 'Acceso sin verificar';
};

const etiquetaFuente = (bascula: Bascula) =>
  bascula.fuente === 'nakordoni' ? 'Nakordoni (terceros)' : 'OpenStreetMap (comunitaria)';

const formatearFecha = (valor?: string) => {
  if (!valor) return null;
  const fecha = new Date(valor);
  return Number.isNaN(fecha.getTime()) ? valor : fecha.toLocaleDateString('es-ES');
};

interface ItemProps {
  bascula: Bascula;
  origen?: [number, number] | null;
  destino?: [number, number] | null;
}

const BasculaItem = ({ bascula: b, origen, destino }: ItemProps) => {
  const verificada = b.estado === 'operativa';
  const ultimaVerificacion = formatearFecha(b.ultimaVerificacion);

  return (
    <article
      className={`${styles.item} ${verificada ? styles.itemVerified : styles.itemUnverified} ${
        b.dentroRadio ? '' : styles.itemFar
      }`}
    >
      <div className={styles.itemHeader}>
        <span className={styles.name}>{b.nombre}</span>
        <span className={`${styles.badge} ${verificada ? styles.badgeVerified : styles.badgeUnverified}`}>
          {etiquetaEstado(b)}
        </span>
      </div>

      <div className={styles.meta}>
        {b.sobreRuta
          ? 'Sobre la ruta'
          : b.dentroRadio
            ? `${b.distanciaRutaKm} km de la ruta · desvío aprox. +${b.desvioKm} km`
            : `A ${b.distanciaRutaKm} km de la ruta · fuera del radio de ${RADIO_VALIDO_KM} km`}
        {' · '}
        {b.lat.toFixed(5)}, {b.lng.toFixed(5)}
      </div>

      {b.direccion && <div className={styles.meta}>{b.direccion}</div>}

      <div className={styles.meta}>
        {etiquetaAcceso(b)}
        {b.horario ? ` · Horario: ${b.horario}` : ' · Horario sin verificar'}
        {b.telefono ? ` · Tel: ${b.telefono}` : ''}
      </div>

      <div className={styles.footer}>
        <span className={styles.note}>
          <span className={`${styles.badge} ${styles.badgeSource}`}>{etiquetaFuente(b)}</span>
          {ultimaVerificacion ? ` · Última verificación: ${ultimaVerificacion}` : ' · Sin verificar'}
        </span>
        <span className={styles.links}>
          {origen && destino && (
            <a
              className={styles.navLink}
              href={urlRutaGoogleMaps(origen, destino, [b.lat, b.lng])}
              target="_blank"
              rel="noreferrer"
            >
              Ruta con parada →
            </a>
          )}
          <a
            className={styles.navLink}
            href={urlNavegacion(b.lat, b.lng)}
            target="_blank"
            rel="noreferrer"
          >
            Navegar →
          </a>
        </span>
      </div>
    </article>
  );
};

interface Props {
  basculas: Bascula[];
  isLoading: boolean;
  error: string | null;
  origen?: [number, number] | null;
  destino?: [number, number] | null;
}

export const BasculasLista = ({ basculas, isLoading, error, origen, destino }: Props) => {
  const cercanas = basculas.filter((b) => b.dentroRadio);
  const lejanas = basculas.filter((b) => !b.dentroRadio);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h4 className={styles.title}>
          Básculas en la ruta ({cercanas.length} a ≤{RADIO_VALIDO_KM} km)
        </h4>
        <span className={styles.note}>
          Búsqueda a {RADIO_BUSQUEDA_KM} km · {basculas.length} en la zona · OpenStreetMap /
          Nakordoni
        </span>
      </div>

      {isLoading && <p className={styles.note}>Buscando básculas próximas a la ruta...</p>}
      {error && <p className={styles.note}>No se pudieron cargar las básculas: {error}</p>}

      {!isLoading && !error && basculas.length === 0 && (
        <p className={styles.note}>
          No se han encontrado básculas en la zona de la ruta. OpenStreetMap no siempre etiqueta las
          básculas.
        </p>
      )}

      {!isLoading && !error && basculas.length > 0 && cercanas.length === 0 && (
        <p className={styles.note}>
          No hay básculas a menos de {RADIO_VALIDO_KM} km del recorrido. Hay {lejanas.length} fuera
          de ese radio.
        </p>
      )}

      {cercanas.length > 0 && (
        <div className={styles.list}>
          {cercanas.map((b) => (
            <BasculaItem key={b.id} bascula={b} origen={origen} destino={destino} />
          ))}
        </div>
      )}

      {lejanas.length > 0 && (
        <details className={styles.farSection}>
          <summary className={styles.farSummary}>
            Fuera del radio de {RADIO_VALIDO_KM} km ({lejanas.length})
          </summary>
          <div className={styles.list}>
            {lejanas.map((b) => (
              <BasculaItem key={b.id} bascula={b} origen={origen} destino={destino} />
            ))}
          </div>
        </details>
      )}
    </div>
  );
};
