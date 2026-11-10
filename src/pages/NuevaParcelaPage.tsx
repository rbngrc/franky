import { useState } from 'react';
import { CrearParcelaPage } from './CrearParcelaPage';
import { ImportarParcelaGisPage } from './ImportarParcelaGisPage';
import styles from '../styles/ParcelaPage.module.css';

type Modo = 'catastro' | 'gis';

export const NuevaParcelaPage = () => {
  const [modo, setModo] = useState<Modo>('catastro');

  return (
    <div className="page-container">
      <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
        Alta de una nueva parcela en la explotación
      </p>

      <div className={styles.tabs}>
        <button
          type="button"
          className={`${styles.tab} ${modo === 'catastro' ? styles.tabActiva : ''}`}
          onClick={() => setModo('catastro')}
        >
          Desde catastro
        </button>
        <button
          type="button"
          className={`${styles.tab} ${modo === 'gis' ? styles.tabActiva : ''}`}
          onClick={() => setModo('gis')}
        >
          Importar desde GIS
        </button>
      </div>

      {modo === 'catastro' ? <CrearParcelaPage /> : <ImportarParcelaGisPage />}
    </div>
  );
};
