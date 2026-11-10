import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  __resetSnapshotParaTests,
  fetchBasculasCercanas,
  parseNakordoni,
  parseOverpassElements,
  parsePhotonFeatures,
} from '../api/basculasApi'

describe('parseOverpassElements', () => {
  it('normaliza etiquetas OSM sin inventar estado ni horario', () => {
    const [bascula] = parseOverpassElements([
      {
        type: 'node',
        id: 1,
        lat: 41.65,
        lon: -4.72,
        tags: {
          amenity: 'weighbridge',
          name: 'Báscula de Valladolid',
          'addr:street': 'Camino Viejo',
          'addr:housenumber': '12',
          'addr:city': 'Valladolid',
          phone: '+34 983 000 000',
          opening_hours: 'Mo-Fr 08:00-20:00',
          access: 'yes',
          check_date: '2026-09-01',
        },
      },
    ])

    expect(bascula.nombre).toBe('Báscula de Valladolid')
    expect(bascula.direccion).toBe('Camino Viejo 12, Valladolid')
    expect(bascula.horario).toBe('Mo-Fr 08:00-20:00')
    expect(bascula.telefono).toBe('+34 983 000 000')
    expect(bascula.acceso).toBe('publico')
    expect(bascula.estado).toBe('desconocido')
    expect(bascula.ultimaVerificacion).toBe('2026-09-01')
    expect(bascula.fuente).toBe('osm')
  })

  it('solo marca operativa si operational_status lo confirma', () => {
    const [operativa, cerrada, sinDatos] = parseOverpassElements([
      { type: 'node', id: 1, lat: 41, lon: -4, tags: { operational_status: 'operational' } },
      { type: 'node', id: 2, lat: 41, lon: -4, tags: { operational_status: 'out_of_order' } },
      { type: 'node', id: 3, lat: 41, lon: -4, tags: { name: 'Sin estado' } },
    ])
    expect(operativa.estado).toBe('operativa')
    expect(cerrada.estado).toBe('cerrada')
    expect(sinDatos.estado).toBe('desconocido')
  })

  it('usa el centro en ways y descarta elementos sin coordenadas', () => {
    const resultado = parseOverpassElements([
      { type: 'way', id: 10, center: { lat: 41.1, lon: -4.1 }, tags: {} },
      { type: 'way', id: 11, tags: {} },
    ])
    expect(resultado).toHaveLength(1)
    expect(resultado[0].lat).toBe(41.1)
  })

  it('detecta básculas por nombre y descarta calles y locales con ese nombre', () => {
    const resultado = parseOverpassElements([
      {
        type: 'way',
        id: 20,
        center: { lat: 41.52, lon: -4.69 },
        tags: { name: 'Báscula de Pesaje', building: 'yes' },
      },
      {
        type: 'way',
        id: 21,
        center: { lat: 41.52, lon: -4.69 },
        tags: { name: 'Calle Báscula', highway: 'residential' },
      },
      {
        type: 'node',
        id: 22,
        lat: 41.52,
        lon: -4.69,
        tags: { name: 'Restaurante La Báscula', amenity: 'restaurant' },
      },
    ])

    expect(resultado).toHaveLength(1)
    expect(resultado[0].nombre).toBe('Báscula de Pesaje')
  })

  it('acepta las variantes de etiqueta de pesaje habituales', () => {
    const resultado = parseOverpassElements([
      { type: 'node', id: 30, lat: 41, lon: -4, tags: { amenity: 'weightbridge' } },
      { type: 'node', id: 31, lat: 41, lon: -4, tags: { amenity: 'weigh_station' } },
      { type: 'node', id: 32, lat: 41, lon: -4, tags: { man_made: 'weighbridge' } },
    ])
    expect(resultado).toHaveLength(3)
  })
})

describe('parsePhotonFeatures', () => {
  it('normaliza resultados de Photon y descarta calles y falsos positivos', () => {
    const resultado = parsePhotonFeatures([
      {
        properties: {
          osm_type: 'W',
          osm_id: 1,
          osm_key: 'amenity',
          osm_value: 'weighbridge',
          name: 'Báscula Norte',
        },
        geometry: { coordinates: [-4.7, 41.6] },
      },
      {
        properties: {
          osm_type: 'W',
          osm_id: 2,
          osm_key: 'building',
          osm_value: 'yes',
          name: 'Báscula de Pesaje',
          street: 'Camino Viejo',
          housenumber: '12',
          postcode: '47001',
          city: 'Valladolid',
        },
        geometry: { coordinates: [-4.72, 41.65] },
      },
      {
        properties: {
          osm_type: 'W',
          osm_id: 3,
          osm_key: 'highway',
          osm_value: 'residential',
          name: 'Calle de la Báscula',
        },
        geometry: { coordinates: [-4.7, 41.6] },
      },
      {
        properties: {
          osm_type: 'N',
          osm_id: 4,
          osm_key: 'shop',
          osm_value: 'butcher',
          name: 'Barcala',
        },
        geometry: { coordinates: [-4.1, 40.5] },
      },
      {
        properties: {
          osm_type: 'W',
          osm_id: 5,
          osm_key: 'building',
          osm_value: 'industrial',
          name: 'Nave de la báscula',
        },
        geometry: { coordinates: [-4.7, 41.6] },
      },
    ])

    expect(resultado).toHaveLength(2)
    expect(resultado[0]).toMatchObject({
      nombre: 'Báscula Norte',
      lat: 41.6,
      lng: -4.7,
      fuente: 'osm',
    })
    expect(resultado[1].direccion).toBe('Camino Viejo 12, 47001 Valladolid')
    expect(resultado[1].estado).toBe('desconocido')
  })
})

describe('parseNakordoni', () => {
  it('acepta arrays y GeoJSON y conserva la fuente de terceros', () => {
    const desdeArray = parseNakordoni([
      { id: 7, lat: 41.5, lon: -4.5, nombre: 'Báscula Norte', estado: 'operativa' },
    ])
    const desdeGeoJson = parseNakordoni({
      features: [
        {
          id: 8,
          geometry: { coordinates: [-4.6, 41.6] },
          name: 'Báscula Sur',
          status: 'closed',
        },
      ],
    })

    expect(desdeArray[0]).toMatchObject({
      id: 'nakordoni-7',
      nombre: 'Báscula Norte',
      estado: 'operativa',
      fuente: 'nakordoni',
    })
    expect(desdeGeoJson[0]).toMatchObject({
      nombre: 'Báscula Sur',
      estado: 'cerrada',
      lat: 41.6,
      lng: -4.6,
    })
  })
})

describe('fetchBasculasCercanas', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
    vi.unstubAllGlobals()
    __resetSnapshotParaTests()
  })

  const urlDe = (input: RequestInfo | URL) =>
    typeof input === 'string' ? input : input instanceof URL ? input.toString() : input.url

  const respuestaPhoton = (lat: number, lon: number) => ({
    ok: true,
    status: 200,
    json: async () => ({
      features: [
        {
          properties: {
            osm_type: 'N',
            osm_id: 99,
            osm_key: 'amenity',
            osm_value: 'weighbridge',
            name: 'Báscula Photon',
          },
          geometry: { coordinates: [lon, lat] },
        },
      ],
    }),
  })

  const respuestaSnapshot = (lat: number, lon: number) => ({
    ok: true,
    status: 200,
    json: async () => ({
      captured: '2026-11-10',
      elements: [{ type: 'node', id: 7, lat, lon, tags: { amenity: 'weighbridge' } }],
    }),
  })

  const respuestaOverpass = (lat: number, lon: number) => ({
    ok: true,
    status: 200,
    json: async () => ({
      elements: [{ type: 'node', id: 5, lat, lon, tags: { amenity: 'weighbridge' } }],
    }),
  })

  it('devuelve el volcado local sin consultar fuentes en vivo', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = urlDe(input)
      if (url.includes('basculas-es.json')) return Promise.resolve(respuestaSnapshot(41.9, -5.1))
      return Promise.resolve({ ok: false, status: 502, json: async () => ({}) })
    })
    vi.stubGlobal('fetch', fetchMock)

    const muestras: [number, number][] = [
      [41.8, -5.2],
      [42, -5],
    ]
    const primera = await fetchBasculasCercanas(muestras)
    const segunda = await fetchBasculasCercanas(muestras)

    expect(fetchMock).toHaveBeenCalledTimes(1)
    expect(primera).toHaveLength(1)
    expect(primera[0].nombre).toBe('Báscula de pesaje')
    expect(segunda).toEqual(primera)
  })

  it('no consulta fuentes en vivo si el volcado no cubre el corredor', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = urlDe(input)
      if (url.includes('basculas-es.json')) return Promise.resolve(respuestaSnapshot(50, 10))
      if (url.includes('photon')) return Promise.resolve(respuestaPhoton(41.9, -5.1))
      return Promise.resolve({ ok: false, status: 502, json: async () => ({}) })
    })
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await fetchBasculasCercanas([
      [41.8, -5.2],
      [42, -5],
    ])

    expect(resultado).toEqual([])
    expect(fetchMock).toHaveBeenCalledTimes(1)
  })

  it('reutiliza la caché de una consulta en vivo anterior', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = urlDe(input)
      if (url.includes('basculas-es.json')) return Promise.resolve({ ok: false, status: 404, json: async () => ({}) })
      if (url.includes('photon')) return Promise.resolve(respuestaPhoton(40.7, -3.3))
      return Promise.resolve({ ok: false, status: 502, json: async () => ({}) })
    })
    vi.stubGlobal('fetch', fetchMock)

    const muestras: [number, number][] = [
      [40.4, -3.6],
      [40.6, -3.4],
    ]
    const primera = await fetchBasculasCercanas(muestras)
    const segunda = await fetchBasculasCercanas(muestras)

    expect(primera).toHaveLength(1)
    expect(segunda).toEqual(primera)
    expect(fetchMock).toHaveBeenCalledTimes(3)
  })

  it('usa Overpass si el snapshot y Photon fallan', async () => {
    const fetchMock = vi.fn().mockImplementation((input: RequestInfo | URL) => {
      const url = urlDe(input)
      if (url.includes('basculas-es.json')) return Promise.resolve({ ok: false, status: 404, json: async () => ({}) })
      if (url.includes('photon')) return Promise.resolve({ ok: false, status: 503, json: async () => ({}) })
      return Promise.resolve(respuestaOverpass(41.9, -5.1))
    })
    vi.stubGlobal('fetch', fetchMock)

    const resultado = await fetchBasculasCercanas([
      [42.3, -5.4],
      [42.5, -5.2],
    ])

    expect(resultado).toHaveLength(1)
    expect(resultado[0].nombre).toBe('Báscula de pesaje')
  })

  it('propaga un error legible cuando el snapshot, Photon y Overpass fallan', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: false, status: 502, json: async () => ({}) })
    vi.stubGlobal('fetch', fetchMock)

    await expect(
      fetchBasculasCercanas([
        [39.1, -6.1],
        [39.2, -6.0],
      ]),
    ).rejects.toThrow(/No se pudieron cargar las básculas/)
  })
})
