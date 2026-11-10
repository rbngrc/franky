import { useState } from 'react';
import type { Bascula } from '../../basculas/types/bascula.types';
import { urlGeo, urlRutaGoogleMaps, urlWaze } from '../../basculas/utils/routeGeometry';
import styles from '../../../styles/NavegacionRuta.module.css';

interface Props {
  origen: [number, number];
  destino: [number, number];
  basculas?: Bascula[];
  nombreOrigen?: string;
  nombreDestino?: string;
}

export const NavegacionRuta = ({
  origen,
  destino,
  basculas = [],
  nombreOrigen,
  nombreDestino,
}: Props) => {
  const [paradaId, setParadaId] = useState('');
  const parada = basculas.find((b) => b.id === paradaId) ?? null;
  const paradaCoords: [number, number] | null = parada ? [parada.lat, parada.lng] : null;

  const googleUrl = urlRutaGoogleMaps(origen, destino, paradaCoords);
  const wazeDestino = urlWaze(destino);
  const wazeParada = paradaCoords ? urlWaze(paradaCoords) : null;
  const geoUrl = urlGeo(destino, nombreDestino);

  return (
    <div className={styles.panel}>
      <div className={styles.header}>
        <h4 className={styles.title}>Cargar ruta en el GPS</h4>
        <span className={styles.note}>
          {nombreOrigen || 'Parcela'} → {nombreDestino || 'Destino'}
        </span>
      </div>

      {basculas.length > 0 && (
        <div className={styles.row}>
          <label className={styles.label} htmlFor="gps-parada">
            Parada intermedia
          </label>
          <select
            id="gps-parada"
            className={styles.select}
            value={paradaId}
            onChange={(event) => setParadaId(event.target.value)}
          >
            <option value="">Sin parada</option>
            {basculas.map((b) => (
              <option key={b.id} value={b.id}>
                {`${[b.nombre, b.direccion].filter(Boolean).join(', ')} (${b.distanciaRutaKm} km de la ruta)`}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className={styles.links}>
        <a
          className={`${styles.link} ${styles.linkPrimary}`}
          href={googleUrl}
          target="_blank"
          rel="noreferrer"
        >
          Google Maps{parada ? ` con parada en ${parada.nombre}` : ''}
        </a>

        {wazeParada ? (
          <>
            <a className={styles.link} href={wazeParada} target="_blank" rel="noreferrer">
              Waze a la parada
            </a>
            <a className={styles.link} href={wazeDestino} target="_blank" rel="noreferrer">
              Waze al destino
            </a>
          </>
        ) : (
          <a className={styles.link} href={wazeDestino} target="_blank" rel="noreferrer">
            Waze al destino
          </a>
        )}

        <a className={styles.link} href={geoUrl}>
          GPS del dispositivo
        </a>
      </div>

      <p className={styles.note}>
        Google Maps admite la báscula como parada. Waze no admite paradas intermedias: usa los
        enlaces a la parada y al destino.
      </p>
    </div>
  );
};
