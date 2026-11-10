import type { AccesoBascula, BasculaCandidata, Bbox, EstadoBascula } from '../types/bascula.types';
import { bboxKey, bboxesKey, corredorBbox, segmentosBbox, type LatLng } from '../utils/routeGeometry';

const debug = (...args: unknown[]) => {
  if (import.meta.env.DEV) console.debug('[basculas]', ...args);
};

const PHOTON_URL = 'https://photon.komoot.io/api/';
const PHOTON_TIMEOUT_MS = 6000;

const OVERPASS_ENDPOINTS = [
  'https://overpass-api.de/api/interpreter',
  'https://overpass.kumi.systems/api/interpreter',
];
const OVERPASS_TIMEOUT_MS = 12000;
const OVERPASS_DEADLINE_MS = 20000;
const OVERPASS_MAX_INTENTOS = 2;
const OVERPASS_RETRY_DELAY_MS = 1000;

const SNAPSHOT_URL = `${import.meta.env.BASE_URL}basculas-es.json`;
const SNAPSHOT_TIMEOUT_MS = 5000;

const NAKORDONI_URL = import.meta.env.VITE_NAKORDONI_API_URL as string | undefined;

type SnapshotFile = { captured?: string; elements?: OverpassElement[] };

let snapshotDatos: BasculaCandidata[] | null = null;
let snapshotCargando: Promise<BasculaCandidata[]> | null = null;

const cargarSnapshot = (signal?: AbortSignal): Promise<BasculaCandidata[]> => {
  if (snapshotDatos) return Promise.resolve(snapshotDatos);
  if (snapshotCargando) return snapshotCargando;
  snapshotCargando = (async () => {
    try {
      const res = await fetchConSenal(SNAPSHOT_URL, {}, SNAPSHOT_TIMEOUT_MS, signal);
      if (!res.ok) throw new Error(`Volcado local respondió ${res.status}`);
      const json = (await res.json()) as SnapshotFile;
      const datos = parseOverpassElements(json.elements || []);
      snapshotDatos = datos;
      debug('volcado local', { total: datos.length, captured: json.captured });
      return datos;
    } catch (err) {
      if (signal?.aborted) throw abortError();
      debug('volcado local no disponible', err);
      return [];
    } finally {
      snapshotCargando = null;
    }
  })();
  return snapshotCargando;
};

const filtrarPorBbox = (basculas: BasculaCandidata[], bbox: Bbox): BasculaCandidata[] =>
  basculas.filter(
    (b) => b.lat >= bbox.south && b.lat <= bbox.north && b.lng >= bbox.west && b.lng <= bbox.east,
  );

export const __resetSnapshotParaTests = () => {
  snapshotDatos = null;
  snapshotCargando = null;
  memoryCache.clear();
  inFlight.clear();
};

const CACHE_PREFIX = 'franky.basculas.v5.';
const CACHE_PREFIX_LEGADO = 'franky.basculas.v4.';
const CACHE_TTL_MS = 7 * 24 * 60 * 60 * 1000;

type CacheEntry = { ts: number; data: BasculaCandidata[] };

type OverpassElement = {
  type: string;
  id: number;
  lat?: number;
  lon?: number;
  center?: { lat: number; lon: number };
  tags?: Record<string, string>;
};

type OverpassResponse = { elements?: OverpassElement[] };

type PhotonFeature = {
  properties?: {
    osm_type?: string;
    osm_id?: number;
    osm_key?: string;
    osm_value?: string;
    name?: string;
    street?: string;
    housenumber?: string;
    postcode?: string;
    city?: string;
    district?: string;
    county?: string;
    state?: string;
  };
  geometry?: { coordinates?: [number, number] };
};

type PhotonResponse = { features?: PhotonFeature[] };

type NakordoniItem = {
  id?: string | number;
  lat?: number;
  lng?: number;
  lon?: number;
  latitude?: number;
  longitude?: number;
  name?: string;
  nombre?: string;
  address?: string;
  direccion?: string;
  opening_hours?: string;
  horario?: string;
  phone?: string;
  telefono?: string;
  access?: string;
  acceso?: string;
  status?: string;
  estado?: string;
  last_verified?: string;
  updated_at?: string;
  geometry?: { coordinates?: [number, number] };
};

const memoryCache = new Map<string, CacheEntry>();
const inFlight = new Map<string, Promise<BasculaCandidata[]>>();

const leerEntrada = (
  prefijo: string,
  key: string,
  permitirCaducada: boolean,
): CacheEntry | null => {
  try {
    const raw = localStorage.getItem(prefijo + key);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as CacheEntry;
    if (!parsed || !Array.isArray(parsed.data)) return null;
    if (!permitirCaducada && Date.now() - parsed.ts >= CACHE_TTL_MS) return null;
    return parsed;
  } catch {
    return null;
  }
};

const readCache = (key: string, permitirCaducada = false): BasculaCandidata[] | null => {
  const vigente = (entry: CacheEntry) => permitirCaducada || Date.now() - entry.ts < CACHE_TTL_MS;
  const memoria = memoryCache.get(key);
  if (memoria && vigente(memoria)) return memoria.data;
  const entrada = leerEntrada(CACHE_PREFIX, key, permitirCaducada);
  if (!entrada) return null;
  memoryCache.set(key, entrada);
  return entrada.data;
};

const readCacheLegado = (key: string, permitirCaducada = false): BasculaCandidata[] | null => {
  const entrada = leerEntrada(CACHE_PREFIX_LEGADO, key, permitirCaducada);
  return entrada ? entrada.data : null;
};

const writeCache = (key: string, data: BasculaCandidata[]) => {
  const entry: CacheEntry = { ts: Date.now(), data };
  memoryCache.set(key, entry);
  try {
    localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(entry));
  } catch {
    // sin espacio o localStorage no disponible: la caché en memoria sigue activa
  }
};

const abortError = () => new DOMException('Petición cancelada', 'AbortError');

const sleep = (ms: number, signal?: AbortSignal): Promise<void> =>
  new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(abortError());
      return;
    }
    const onAbort = () => {
      clearTimeout(id);
      reject(abortError());
    };
    const id = setTimeout(() => {
      signal?.removeEventListener('abort', onAbort);
      resolve();
    }, ms);
    signal?.addEventListener('abort', onAbort, { once: true });
    if (signal?.aborted) onAbort();
  });

const fetchConSenal = async (
  input: RequestInfo | URL,
  init: RequestInit,
  timeoutMs: number,
  signal?: AbortSignal,
): Promise<Response> => {
  const controller = new AbortController();
  let canceladoPorSenal = false;
  let vencioTimeout = false;
  const onAbort = () => {
    canceladoPorSenal = true;
    controller.abort();
  };
  if (signal) {
    if (signal.aborted) onAbort();
    else {
      signal.addEventListener('abort', onAbort, { once: true });
      if (signal.aborted) onAbort();
    }
  }
  const timeout = setTimeout(() => {
    vencioTimeout = true;
    controller.abort();
  }, timeoutMs);
  try {
    return await fetch(input, { ...init, signal: controller.signal });
  } catch (err) {
    if (canceladoPorSenal) throw abortError();
    if (vencioTimeout) {
      throw new Error(`Tiempo de espera agotado (timeout tras ${Math.round(timeoutMs / 1000)} s)`);
    }
    throw err;
  } finally {
    clearTimeout(timeout);
    signal?.removeEventListener('abort', onAbort);
  }
};

const tieneTagPeso = (tags: Record<string, string>): boolean =>
  tags.amenity === 'weighbridge' ||
  tags.amenity === 'weightbridge' ||
  tags.amenity === 'weigh_station' ||
  tags.man_made === 'weighbridge' ||
  tags.man_made === 'weighting_machine' ||
  tags.man_made === 'weighting_scale' ||
  tags.industrial === 'weighbridge';

const CLAVES_NO_BASCULA = [
  'highway',
  'place',
  'boundary',
  'waterway',
  'natural',
  'shop',
  'tourism',
  'leisure',
  'railway',
  'aeroway',
  'public_transport',
];

const esPoiNoBascula = (tags: Record<string, string>): boolean =>
  CLAVES_NO_BASCULA.some((clave) => tags[clave] != null) ||
  (tags.amenity != null && !tieneTagPeso(tags));

const estadoDesdeTags = (tags: Record<string, string>): EstadoBascula => {
  const status = (tags.operational_status || '').toLowerCase();
  if (status === 'operational') return 'operativa';
  if (status === 'out_of_order' || status === 'closed') return 'cerrada';
  if (tags.disused === 'yes' || tags.abandoned === 'yes') return 'cerrada';
  return 'desconocido';
};

const accesoDesdeValor = (value?: string): AccesoBascula => {
  const v = (value || '').toLowerCase();
  if (v === 'yes' || v === 'public' || v === 'permissive') return 'publico';
  if (v === 'no' || v === 'private') return 'restringido';
  return 'desconocido';
};

const direccionDesdeTags = (tags: Record<string, string>): string | undefined => {
  const calle = [tags['addr:street'], tags['addr:housenumber']].filter(Boolean).join(' ');
  const localidad = [tags['addr:postcode'], tags['addr:city']].filter(Boolean).join(' ');
  const direccion = [calle, localidad].filter(Boolean).join(', ');
  return direccion || tags['addr:full'] || undefined;
};

export const parseOverpassElements = (elements: OverpassElement[]): BasculaCandidata[] => {
  const resultado: BasculaCandidata[] = [];
  for (const el of elements) {
    const lat = el.lat ?? el.center?.lat;
    const lon = el.lon ?? el.center?.lon;
    if (lat == null || lon == null || !Number.isFinite(lat) || !Number.isFinite(lon)) continue;
    const tags = el.tags || {};
    if (!tieneTagPeso(tags) && esPoiNoBascula(tags)) continue;
    resultado.push({
      id: `osm-${el.type}-${el.id}`,
      nombre: tags.name || tags.operator || 'Báscula de pesaje',
      lat,
      lng: lon,
      direccion: direccionDesdeTags(tags),
      horario: tags.opening_hours || undefined,
      telefono: tags.phone || tags['contact:phone'] || undefined,
      acceso: accesoDesdeValor(tags.access),
      estado: estadoDesdeTags(tags),
      ultimaVerificacion: tags.check_date || tags['check_date:opening_hours'] || tags['survey:date'] || undefined,
      fuente: 'osm',
    });
  }
  return resultado;
};

const NOMBRE_BASCULA = /b[áa]scu|pesaje|weighbridge|weightbridge/i;
const NOMBRE_NO_BASCULA =
  /^(calle|plaza|camino|avenida|carretera|nave|edificio|barrio|urbanizaci[oó]n|pol[ií]gono)\b/i;

const tieneTagPesoPhoton = (key: string, value: string): boolean => {
  if (key === 'amenity') {
    return value === 'weighbridge' || value === 'weightbridge' || value === 'weigh_station';
  }
  if (key === 'man_made') {
    return value === 'weighbridge' || value === 'weighting_machine' || value === 'weighting_scale';
  }
  if (key === 'industrial') return value === 'weighbridge';
  return false;
};

const esBasculaPhoton = (key: string, value: string, nombre: string): boolean => {
  if (tieneTagPesoPhoton(key, value)) return true;
  if (CLAVES_NO_BASCULA.includes(key)) return false;
  if (key === 'amenity') return false;
  if (!nombre || NOMBRE_NO_BASCULA.test(nombre)) return false;
  return NOMBRE_BASCULA.test(nombre);
};

export const parsePhotonFeatures = (features: PhotonFeature[]): BasculaCandidata[] => {
  const resultado: BasculaCandidata[] = [];
  for (const feature of features) {
    const coords = feature.geometry?.coordinates;
    const props = feature.properties;
    if (!coords || !props) continue;
    const [lng, lat] = coords;
    if (!Number.isFinite(lat) || !Number.isFinite(lng)) continue;
    const nombre = (props.name || '').trim();
    if (!esBasculaPhoton(props.osm_key || '', props.osm_value || '', nombre)) continue;
    const calle = [props.street, props.housenumber].filter(Boolean).join(' ');
    const localidad = [props.postcode, props.city].filter(Boolean).join(' ');
    const direccion = [calle, localidad].filter(Boolean).join(', ') || undefined;
    resultado.push({
      id: `osm-${props.osm_type || 'X'}-${props.osm_id ?? `${lat.toFixed(5)}:${lng.toFixed(5)}`}`,
      nombre: nombre || 'Báscula de pesaje',
      lat,
      lng,
      direccion,
      acceso: 'desconocido',
      estado: 'desconocido',
      fuente: 'osm',
    });
  }
  return resultado;
};

export const parseNakordoni = (payload: unknown): BasculaCandidata[] => {
  let items: NakordoniItem[] = [];
  if (Array.isArray(payload)) {
    items = payload as NakordoniItem[];
  } else if (payload && typeof payload === 'object') {
    const obj = payload as { features?: NakordoniItem[]; data?: NakordoniItem[] };
    if (Array.isArray(obj.features)) items = obj.features;
    else if (Array.isArray(obj.data)) items = obj.data;
  }

  const resultado: BasculaCandidata[] = [];
  items.forEach((item, index) => {
    const lat = item.lat ?? item.latitude ?? item.geometry?.coordinates?.[1];
    const lng = item.lng ?? item.lon ?? item.longitude ?? item.geometry?.coordinates?.[0];
    if (lat == null || lng == null || !Number.isFinite(lat) || !Number.isFinite(lng)) return;
    const estadoRaw = (item.status || item.estado || '').toLowerCase();
    const estado: EstadoBascula =
      estadoRaw === 'operativa' || estadoRaw === 'operational'
        ? 'operativa'
        : estadoRaw === 'cerrada' || estadoRaw === 'closed'
          ? 'cerrada'
          : 'desconocido';
    resultado.push({
      id: `nakordoni-${item.id ?? index}`,
      nombre: item.name || item.nombre || 'Báscula de pesaje',
      lat,
      lng,
      direccion: item.address || item.direccion,
      horario: item.opening_hours || item.horario,
      telefono: item.phone || item.telefono,
      acceso: accesoDesdeValor(item.access || item.acceso),
      estado,
      ultimaVerificacion: item.last_verified || item.updated_at,
      fuente: 'nakordoni',
    });
  });
  return resultado;
};

const deduplicar = (basculas: BasculaCandidata[]): BasculaCandidata[] => {
  const vistos = new Map<string, BasculaCandidata>();
  for (const b of basculas) {
    const key = `${b.lat.toFixed(3)}:${b.lng.toFixed(3)}`;
    if (!vistos.has(key)) vistos.set(key, b);
  }
  return [...vistos.values()];
};

const fetchPhoton = async (bbox: Bbox, signal?: AbortSignal): Promise<BasculaCandidata[]> => {
  const url = new URL(PHOTON_URL);
  url.searchParams.set('q', 'báscula');
  url.searchParams.set('bbox', [bbox.west, bbox.south, bbox.east, bbox.north].join(','));
  url.searchParams.set('limit', '50');

  const inicio = Date.now();
  debug('photon url', url.toString());
  const res = await fetchConSenal(url.toString(), {}, PHOTON_TIMEOUT_MS, signal);
  debug('photon', { status: res.status, ms: Date.now() - inicio });
  if (!res.ok) throw new Error(`Photon respondió ${res.status}`);
  const json = (await res.json()) as PhotonResponse;
  const features = json.features || [];
  debug('photon features', features.length);
  return parsePhotonFeatures(features);
};

const PHOTON_SEGMENTO_DELAY_MS = 300;

const fetchPhotonSegmentos = async (
  segmentos: Bbox[],
  signal?: AbortSignal,
): Promise<BasculaCandidata[]> => {
  if (segmentos.length === 0) return [];
  const resultados: BasculaCandidata[] = [];
  let fallos = 0;
  let ultimoError: unknown = null;

  for (let i = 0; i < segmentos.length; i += 1) {
    if (signal?.aborted) throw abortError();
    if (i > 0) await sleep(PHOTON_SEGMENTO_DELAY_MS, signal);
    try {
      resultados.push(...(await fetchPhoton(segmentos[i], signal)));
    } catch (err) {
      fallos += 1;
      ultimoError = err;
      debug('photon segmento fallido', { i, err });
      if (resultados.length === 0 && fallos >= 2) break;
    }
  }

  if (resultados.length === 0 && fallos > 0) {
    throw ultimoError instanceof Error ? ultimoError : new Error('Photon no disponible');
  }
  return resultados;
};

const construirConsulta = (bbox: Bbox): string => {
  const area = `${bbox.south},${bbox.west},${bbox.north},${bbox.east}`;
  return [
    '[out:json][timeout:25];(',
    `nwr["amenity"~"^(weighbridge|weightbridge|weigh_station)$"](${area});`,
    `nwr["man_made"~"^(weighbridge|weighting_machine|weighting_scale)$"](${area});`,
    `nwr["industrial"="weighbridge"](${area});`,
    ');out tags center;',
  ].join('');
};

const fetchOverpass = async (
  bbox: Bbox,
  signal?: AbortSignal,
): Promise<BasculaCandidata[]> => {
  const query = construirConsulta(bbox);
  const inicio = Date.now();
  let ultimoError: unknown = null;
  let intento = 0;

  while (intento < OVERPASS_MAX_INTENTOS && Date.now() - inicio < OVERPASS_DEADLINE_MS) {
    if (signal?.aborted) throw abortError();
    const endpoint = OVERPASS_ENDPOINTS[intento % OVERPASS_ENDPOINTS.length];
    const t0 = Date.now();
    try {
      const res = await fetchConSenal(
        endpoint,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: `data=${encodeURIComponent(query)}`,
        },
        OVERPASS_TIMEOUT_MS,
        signal,
      );
      debug('overpass', { endpoint, status: res.status, ms: Date.now() - t0, intento });
      if (res.ok) {
        const json = (await res.json()) as OverpassResponse;
        return parseOverpassElements(json.elements || []);
      }
      if (res.status === 400) throw new Error(`Overpass respondió ${res.status}`);
      ultimoError = new Error(`Overpass respondió ${res.status}`);
    } catch (err) {
      if (signal?.aborted) throw abortError();
      ultimoError = err;
    }
    intento += 1;
    if (intento < OVERPASS_MAX_INTENTOS && Date.now() - inicio < OVERPASS_DEADLINE_MS) {
      await sleep(OVERPASS_RETRY_DELAY_MS, signal);
    }
  }

  throw ultimoError instanceof Error ? ultimoError : new Error('Overpass no disponible');
};

const fetchNakordoni = async (
  bbox: Bbox,
  signal?: AbortSignal,
): Promise<BasculaCandidata[] | null> => {
  if (!NAKORDONI_URL) return null;
  const url = new URL(NAKORDONI_URL);
  url.searchParams.set('bbox', [bbox.south, bbox.west, bbox.north, bbox.east].join(','));
  const res = await fetchConSenal(url.toString(), {}, 8000, signal);
  if (!res.ok) throw new Error(`Nakordoni respondió ${res.status}`);
  return parseNakordoni(await res.json());
};

export const fetchBasculasCercanas = (
  ruta: LatLng[],
  signal?: AbortSignal,
  radioKm = 10,
): Promise<BasculaCandidata[]> => {
  if (signal?.aborted) {
    return Promise.reject(abortError());
  }
  const bbox = corredorBbox(ruta, radioKm);
  if (!bbox || ruta.length === 0) return Promise.resolve([]);
  const segmentos = segmentosBbox(ruta, radioKm);
  const key = `${bboxKey(bbox)}:${radioKm}:${bboxesKey(segmentos)}`;
  debug('corredor', { puntos: ruta.length, radioKm, segmentos: segmentos.length, key, bbox });
  const pendiente = inFlight.get(key);
  if (pendiente) return pendiente;

  const peticion = (async () => {
    const snapshot = await cargarSnapshot(signal).catch(() => [] as BasculaCandidata[]);
    const snapshotDatos = filtrarPorBbox(snapshot, bbox);
    if (snapshotDatos.length > 0) {
      debug('resultado (volcado local)', { total: snapshotDatos.length });
      return snapshotDatos;
    }

    const cached = readCache(key) ?? readCacheLegado(key);
    if (cached && cached.length > 0) {
      debug('cache', { key, resultados: cached.length });
      return cached;
    }

    if (snapshot.length > 0) {
      debug('corredor fuera del volcado local', { key });
      return [];
    }

    const [photon, nakordoni] = await Promise.allSettled([
      fetchPhotonSegmentos(segmentos, signal),
      fetchNakordoni(bbox, signal),
    ]);
    const photonDatos = photon.status === 'fulfilled' ? photon.value : null;
    const nakordoniDatos = nakordoni.status === 'fulfilled' ? nakordoni.value : null;

    let overpassDatos: BasculaCandidata[] | null = null;
    if ((photonDatos?.length ?? 0) === 0 && !nakordoniDatos) {
      debug('sin datos en Photon, probando Overpass');
      overpassDatos = await fetchOverpass(bbox, signal).catch((err) => {
        debug('overpass no disponible', err);
        return null;
      });
    }

    debug('fuentes', {
      snapshot: snapshotDatos.length,
      photon: photon.status === 'fulfilled' ? photon.value.length : 'error',
      overpass: overpassDatos?.length ?? null,
      nakordoni: nakordoni.status === 'fulfilled' ? (nakordoni.value?.length ?? null) : 'error',
    });
    if (photon.status === 'rejected') debug('photon no disponible', photon.reason);

    if (
      (photonDatos?.length ?? 0) === 0 &&
      (overpassDatos?.length ?? 0) === 0 &&
      !nakordoniDatos
    ) {
      const caducada = readCache(key, true) ?? readCacheLegado(key, true);
      if (caducada && caducada.length > 0) {
        debug('cache caducada como respaldo', { key, resultados: caducada.length });
        return caducada;
      }
      const motivo =
        photon.status === 'rejected' && photon.reason instanceof Error
          ? photon.reason.message
          : '';
      if (/tiempo|timeout/i.test(motivo)) throw new Error(motivo);
      throw new Error(
        'No se pudieron cargar las básculas: sin respuesta de las fuentes y sin datos guardados para esta ruta',
      );
    }

    const datos = deduplicar([
      ...(nakordoniDatos ?? []),
      ...(photonDatos ?? []),
      ...(overpassDatos ?? []),
    ]);
    if (datos.length > 0) writeCache(key, datos);
    debug('resultado', { total: datos.length });
    return datos;
  })();

  inFlight.set(key, peticion);
  return peticion.finally(() => inFlight.delete(key));
};
