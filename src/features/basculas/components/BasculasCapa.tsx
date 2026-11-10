import L from 'leaflet';
import { Marker, Popup } from 'react-leaflet';
import type { Bascula } from '../types/bascula.types';
import { RADIO_VALIDO_KM, urlNavegacion } from '../utils/routeGeometry';

const colorBascula = (bascula: Bascula) => {
  if (!bascula.dentroRadio) return '#9E9E9E';
  return bascula.estado === 'operativa' ? '#2E7D32' : '#F57F17';
};

const iconoBascula = (bascula: Bascula) =>
  L.divIcon({
    className: '',
    html: `<span style="display:block;width:14px;height:14px;border-radius:50%;border:2px solid #fff;box-shadow:0 0 3px rgba(0,0,0,0.5);background:${colorBascula(bascula)}"></span>`,
    iconSize: [14, 14],
    iconAnchor: [7, 7],
    popupAnchor: [0, -8],
  });

const etiquetaEstado = (bascula: Bascula) => {
  if (bascula.estado === 'operativa') return 'Operativa (confirmada)';
  if (bascula.estado === 'cerrada') return 'Cerrada';
  return 'Sin verificar';
};

export const BasculasCapa = ({ basculas }: { basculas: Bascula[] }) => (
  <>
    {basculas.map((b) => (
      <Marker key={b.id} position={[b.lat, b.lng]} icon={iconoBascula(b)}>
        <Popup>
          <strong>{b.nombre}</strong>
          <div style={{ fontSize: '0.8rem' }}>
            {b.sobreRuta
              ? 'Sobre la ruta'
              : b.dentroRadio
                ? `${b.distanciaRutaKm} km de la ruta (+${b.desvioKm} km)`
                : `A ${b.distanciaRutaKm} km · fuera del radio de ${RADIO_VALIDO_KM} km`}
          </div>
          {b.direccion && <div style={{ fontSize: '0.8rem' }}>{b.direccion}</div>}
          <div style={{ fontSize: '0.8rem' }}>Estado: {etiquetaEstado(b)}</div>
          {b.horario && <div style={{ fontSize: '0.8rem' }}>Horario: {b.horario}</div>}
          {b.telefono && <div style={{ fontSize: '0.8rem' }}>Tel: {b.telefono}</div>}
          <a href={urlNavegacion(b.lat, b.lng)} target="_blank" rel="noreferrer">
            Navegar
          </a>
        </Popup>
      </Marker>
    ))}
  </>
);
