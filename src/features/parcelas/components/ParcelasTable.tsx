import React from 'react';
import type { Parcela } from '../types/parcela.types';
import { Link } from 'react-router-dom'; // 1. Importamos Link

interface ParcelasTableProps {
  parcelas: Parcela[];
}

export const ParcelasTable: React.FC<ParcelasTableProps> = ({ parcelas }) => {
  if (parcelas.length === 0) {
    return <p>No se encontraron parcelas.</p>;
  }

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse' }}>
      <thead>
        <tr style={{ borderBottom: '2px solid black' }}>
          <th style={{ padding: '8px', textAlign: 'left' }}>Nombre / Ref. Catastral</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Área (m²)</th>
          <th style={{ padding: '8px', textAlign: 'left' }}>Acciones</th>
        </tr>
      </thead>
      <tbody>
        {parcelas.map((parcela) => (
          <tr key={parcela.id} style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px' }}>
              {parcela.nombre}
            </td>
            {/* <td style={{ padding: '8px' }}>
              {parcela.areaMetrosCuadrados?.toFixed(2) || 'N/A'}
            </td> */}
            <td style={{ padding: '8px' }}>
              <Link to={`/parcelas/detalle/${parcela.id}`}>Ver Detalles</Link>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
};