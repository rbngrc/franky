import React from 'react';
import type { Parcela } from '../features/parcelas/types/parcela.types';

interface TablaDetalladaPageProps {
  parcelas?: Parcela[];
}

export const TablaDetalladaPage: React.FC<TablaDetalladaPageProps> = ({ parcelas = [] }) => {
  if (parcelas.length === 0) {
    return <p>No se encontraron parcelas.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', marginTop: '1rem' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid black' }}>
          <th style={{ padding: '8px', textAlign: 'left' }}>ID</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Nombre</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Geometría (WKT)</th>
        </tr>
      </thead>
      <tbody>
        {parcelas.map((parcela) => (
          <tr key={parcela.id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px', fontFamily: 'monospace', fontSize: '0.8rem' }}>
              {parcela.id}
            </td>
            <td style={{ padding: '8px' }}>
              {parcela.nombre}
            </td>
            <td
              style={{
                padding: '8px',
                maxWidth: '400px',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
              }}
              title={parcela.wktGeolocalizacion || ''}
            >
              {parcela.wktGeolocalizacion || 'N/A'}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};
