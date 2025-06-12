import React from 'react';
import type { Parcela } from '../types/parcela.types';

type Provincia = 'Ávila' | 'Burgos' | 'León' | 'Palencia';

interface ParcelaFormProps {
  provincia: Provincia | '';
  municipio: string;
  parcelaSeleccionada: Parcela | null;
  onProvinciaChange: (provincia: Provincia | '') => void;
  onMunicipioChange: (municipio: string) => void;
  onGuardar: () => void;
  isSubmitting: boolean;
}

const provincias: Provincia[] = ['Ávila', 'Burgos', 'León', 'Palencia'];

const municipiosMock: Record<Provincia, string[]> = {
  Ávila: ['Ávila', 'Arenas de San Pedro'],
  Burgos: ['Burgos', 'Aranda de Duero'],
  León: ['León', 'Ponferrada'],
  Palencia: ['Palencia', 'Aguilar de Campoo'],
};

export const ParcelaForm: React.FC<ParcelaFormProps> = ({
  provincia,
  municipio,
  parcelaSeleccionada,
  onProvinciaChange,
  onMunicipioChange,
  onGuardar,
  isSubmitting,
}) => {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
      <label>
        Provincia:
        <select value={provincia} onChange={(e) => onProvinciaChange(e.target.value as Provincia)}>
          <option value="">Selecciona provincia</option>
          {provincias.map((prov) => (
            <option key={prov} value={prov}>
              {prov}
            </option>
          ))}
        </select>
      </label>

      {provincia && (
        <label>
          Municipio:
          <select value={municipio} onChange={(e) => onMunicipioChange(e.target.value)}>
            <option value="">Selecciona municipio</option>
            {municipiosMock[provincia].map((mun) => (
              <option key={mun} value={mun}>
                {mun}
              </option>
            ))}
          </select>
        </label>
      )}

      {provincia && municipio && (
        <div>
          <p>Aquí iría el visor SIGPAC para seleccionar la parcela.</p>
          {/* Simulación de selección de parcela */}
          <button
            onClick={() =>
              onGuardar()
            }
          >
            Simular guardar parcela (usar mapa real aquí)
          </button>
        </div>
      )}

      {parcelaSeleccionada && (
        <p>
          Parcela seleccionada: <strong>{parcelaSeleccionada.nombre}</strong>
        </p>
      )}
    </div>
  );
};
