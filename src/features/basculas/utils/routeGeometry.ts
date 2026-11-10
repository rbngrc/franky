import type { Bascula, BasculaCandidata, Bbox } from '../types/bascula.types';

export type LatLng = [number, number];

const EARTH_RADIUS_KM = 6371;
const KM_PER_DEG_LAT = 110.574;
const KM_PER_DEG_LNG_EQ = 111.32;
const SOBRE_RUTA_KM = 0.3;

export const RADIO_BUSQUEDA_KM = 10;
export const RADIO_VALIDO_KM = 5;

const rad = (deg: number) => (deg * Math.PI) / 180;

const redondear1 = (value: number) => Math.round(value * 10) / 10;

export const haversineKm = ([lat1, lng1]: LatLng, [lat2, lng2]: LatLng): number => {
  const dLat = rad(lat2 - lat1);
  const dLng = rad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLng / 2) ** 2;
  return 2 * EARTH_RADIUS_KM * Math.asin(Math.sqrt(a));
};

const distanciaASegmentoKm = (p: LatLng, a: LatLng, b: LatLng): number => {
  const kx = Math.cos(rad(p[0])) * KM_PER_DEG_LNG_EQ;
  const ax = (a[1] - p[1]) * kx;
  const ay = (a[0] - p[0]) * KM_PER_DEG_LAT;
  const bx = (b[1] - p[1]) * kx;
  const by = (b[0] - p[0]) * KM_PER_DEG_LAT;
  const dx = bx - ax;
  const dy = by - ay;
  const len2 = dx * dx + dy * dy;
  const t = len2 === 0 ? 0 : Math.max(0, Math.min(1, -(ax * dx + ay * dy) / len2));
  return Math.hypot(ax + t * dx, ay + t * dy);
};

export const distanciaAPolilineaKm = (p: LatLng, ruta: LatLng[]): number => {
  if (ruta.length === 0) return Number.POSITIVE_INFINITY;
  if (ruta.length === 1) return haversineKm(p, ruta[0]);
  let min = Number.POSITIVE_INFINITY;
  for (let i = 1; i < ruta.length; i += 1) {
    const d = distanciaASegmentoKm(p, ruta[i - 1], ruta[i]);
    if (d < min) min = d;
  }
  return min;
};

export const corredorBbox = (ruta: LatLng[], radioKm = 5): Bbox | null => {
  if (ruta.length === 0) return null;
  let south = ruta[0][0];
  let north = ruta[0][0];
  let west = ruta[0][1];
  let east = ruta[0][1];
  for (const [lat, lng] of ruta) {
    if (lat < south) south = lat;
    if (lat > north) north = lat;
    if (lng < west) west = lng;
    if (lng > east) east = lng;
  }
  const latPad = radioKm / KM_PER_DEG_LAT;
  const lngPad =
    radioKm /
    (KM_PER_DEG_LNG_EQ * Math.cos(rad(Math.max(Math.abs(south), Math.abs(north)))));
  return {
    south: south - latPad,
    west: west - lngPad,
    north: north + latPad,
    east: east + lngPad,
  };
};

export const bboxKey = (bbox: Bbox): string =>
  [bbox.south, bbox.west, bbox.north, bbox.east].map((v) => v.toFixed(2)).join(':');

export const longitudRutaKm = (ruta: LatLng[]): number => {
  let total = 0;
  for (let i = 1; i < ruta.length; i += 1) total += haversineKm(ruta[i - 1], ruta[i]);
  return total;
};

export const segmentosBbox = (ruta: LatLng[], radioKm = 10, maxSegmentos = 4): Bbox[] => {
  if (ruta.length === 0) return [];
  const total = longitudRutaKm(ruta);
  const objetivo = total <= 100 ? 1 : total <= 250 ? 2 : total <= 450 ? 3 : 4;
  const segmentos = Math.min(objetivo, maxSegmentos);
  const bboxUnico = corredorBbox(ruta, radioKm + 2);
  if (segmentos === 1) return bboxUnico ? [bboxUnico] : [];

  const objetivoKm = total / segmentos;
  const grupos: LatLng[][] = [];
  let actual: LatLng[] = [ruta[0]];
  let acumulado = 0;
  for (let i = 1; i < ruta.length; i += 1) {
    acumulado += haversineKm(ruta[i - 1], ruta[i]);
    actual.push(ruta[i]);
    if (acumulado >= objetivoKm && grupos.length < segmentos - 1) {
      grupos.push(actual);
      actual = [ruta[i]];
      acumulado = 0;
    }
  }
  grupos.push(actual);

  return grupos
    .map((grupo) => corredorBbox(grupo, radioKm + 2))
    .filter((bbox): bbox is Bbox => bbox !== null);
};

export const bboxesKey = (bboxes: Bbox[]): string =>
  bboxes.map((bbox) => bboxKey(bbox)).join('|');

export const enriquecerBasculas = (
  candidatas: BasculaCandidata[],
  ruta: LatLng[],
  radioValidoKm = RADIO_VALIDO_KM,
): Bascula[] =>
  candidatas
    .map((b) => {
      const distancia = distanciaAPolilineaKm([b.lat, b.lng], ruta);
      return {
        ...b,
        distanciaRutaKm: redondear1(distancia),
        desvioKm: redondear1(distancia * 2),
        sobreRuta: distancia <= SOBRE_RUTA_KM,
        dentroRadio: distancia <= radioValidoKm,
      };
    })
    .sort((a, b) => {
      if (a.dentroRadio !== b.dentroRadio) return a.dentroRadio ? -1 : 1;
      return a.distanciaRutaKm - b.distanciaRutaKm;
    });

export const urlNavegacion = (lat: number, lng: number): string =>
  `https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}`;

export const urlRutaGoogleMaps = (
  origen: LatLng,
  destino: LatLng,
  parada?: LatLng | null,
): string => {
  const waypoints = parada ? `&waypoints=${parada[0]},${parada[1]}` : '';
  return `https://www.google.com/maps/dir/?api=1&origin=${origen[0]},${origen[1]}&destination=${destino[0]},${destino[1]}${waypoints}&travelmode=driving`;
};

export const urlWaze = (destino: LatLng): string =>
  `https://waze.com/ul?ll=${destino[0]},${destino[1]}&navigate=yes`;

export const urlGeo = (destino: LatLng, etiqueta?: string): string => {
  const coords = `${destino[0]},${destino[1]}`;
  const query = etiqueta ? `${coords}(${encodeURIComponent(etiqueta)})` : coords;
  return `geo:${coords}?q=${query}`;
};
