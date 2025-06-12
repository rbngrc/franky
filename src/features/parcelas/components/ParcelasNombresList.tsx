import React from 'react';
import type { Parcela } from '../types/parcela.types';

interface ParcelasNombresListProps {
  parcelas: Parcela[];
  selectedParcelaId: string | null;
  onParcelaSelect: (id: string | null) => void;
}

export const ParcelasNombresList: React.FC<ParcelasNombresListProps> = ({ parcelas, selectedParcelaId, onParcelaSelect }) => {
  
  const listItemStyle: React.CSSProperties = {
    padding: '0.75rem',
    borderBottom: '1px solid #eee',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
  };

  const selectedListItemStyle: React.CSSProperties = {
    ...listItemStyle,
    backgroundColor: '#e3f2fd',
    fontWeight: 'bold',
  };

  return (
    <ul style={{ listStyle: 'none', padding: 0, border: '1px solid #ccc', borderRadius: '4px', overflow: 'hidden' }}>
      {parcelas.map(parcela => {
        const isSelected = parcela.id === selectedParcelaId;

        return (
          <li
            key={parcela.id}
            style={isSelected ? selectedListItemStyle : listItemStyle}
            onClick={() => onParcelaSelect(parcela.id)}
            onMouseOver={(e) => (e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : '#f5f5f5')}
            onMouseOut={(e) => (e.currentTarget.style.backgroundColor = isSelected ? '#e3f2fd' : 'transparent')}
          >
            {parcela.nombre}
          </li>
        );
      })}
    </ul>
  );
};