import { describe, expect, it } from 'vitest'
import {
  bboxKey,
  corredorBbox,
  distanciaAPolilineaKm,
  enriquecerBasculas,
  haversineKm,
  longitudRutaKm,
  segmentosBbox,
  urlGeo,
  urlRutaGoogleMaps,
  urlWaze,
} from '../utils/routeGeometry'
import type { BasculaCandidata } from '../types/bascula.types'

const candidata = (overrides: Partial<BasculaCandidata> = {}): BasculaCandidata => ({
  id: 'b1',
  nombre: 'Báscula',
  lat: 40,
  lng: -2.5,
  acceso: 'desconocido',
  estado: 'desconocido',
  fuente: 'osm',
  ...overrides,
})

describe('routeGeometry', () => {
  it('calcula distancias entre coordenadas', () => {
    const madrid: [number, number] = [40.4168, -3.7038]
    const barcelona: [number, number] = [41.3874, 2.1686]
    expect(haversineKm(madrid, barcelona)).toBeGreaterThan(490)
    expect(haversineKm(madrid, barcelona)).toBeLessThan(520)
  })

  it('calcula la distancia mínima a una polilínea', () => {
    const ruta: [number, number][] = [
      [40, -3],
      [40, -2],
    ]
    expect(distanciaAPolilineaKm([40, -2.5], ruta)).toBeCloseTo(0, 5)
    expect(distanciaAPolilineaKm([40.01, -2.5], ruta)).toBeGreaterThan(1)
    expect(distanciaAPolilineaKm([40.01, -2.5], ruta)).toBeLessThan(1.3)
  })

  it('marca las que están dentro del radio y sobre la ruta, y ordena por distancia', () => {
    const ruta: [number, number][] = [
      [40, -3],
      [40, -2],
    ]
    const resultado = enriquecerBasculas(
      [
        candidata({ id: 'cerca', lat: 40.02 }),
        candidata({ id: 'sobre', lat: 40, lng: -2.5 }),
        candidata({ id: 'lejos', lat: 41, lng: -2.5 }),
      ],
      ruta,
      5
    )

    expect(resultado.map((b) => b.id)).toEqual(['sobre', 'cerca', 'lejos'])
    expect(resultado[0].sobreRuta).toBe(true)
    expect(resultado[0].dentroRadio).toBe(true)
    expect(resultado[0].desvioKm).toBe(0)
    expect(resultado[1].sobreRuta).toBe(false)
    expect(resultado[1].dentroRadio).toBe(true)
    expect(resultado[1].desvioKm).toBeGreaterThan(4)
    expect(resultado[2].dentroRadio).toBe(false)
  })

  it('genera un bbox que cubre el radio de búsqueda y una clave estable para caché', () => {
    const bbox = corredorBbox(
      [
        [40, -3],
        [41, -2],
      ],
      5
    )
    expect(bbox).not.toBeNull()
    expect(bbox!.south).toBeLessThan(40)
    expect(bbox!.north).toBeGreaterThan(41)
    expect(bbox!.west).toBeLessThan(-3)
    expect(bbox!.east).toBeGreaterThan(-2)
    expect(bbox!.north - bbox!.south).toBeGreaterThan(0.09)
    expect(bboxKey(bbox!)).toBe(bboxKey({ ...bbox!, south: bbox!.south + 0.0001 }))
    expect(corredorBbox([])).toBeNull()
  })

  it('divide la ruta en varios segmentos para rutas largas', () => {
    const corta: [number, number][] = [
      [40, -3],
      [40.5, -3],
    ]
    const larga: [number, number][] = [
      [40, -3],
      [42, -3],
    ]
    expect(longitudRutaKm(corta)).toBeLessThan(100)
    expect(segmentosBbox(corta, 10)).toHaveLength(1)
    expect(longitudRutaKm(larga)).toBeGreaterThan(200)
    expect(segmentosBbox(larga, 10).length).toBeGreaterThan(1)
  })

  it('genera enlaces de navegación para Google Maps, Waze y GPS genérico', () => {
    const origen: [number, number] = [41.65, -4.72]
    const destino: [number, number] = [40.42, -3.7]
    const parada: [number, number] = [41.5, -4.6]

    expect(urlRutaGoogleMaps(origen, destino)).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=41.65,-4.72&destination=40.42,-3.7&travelmode=driving'
    )
    expect(urlRutaGoogleMaps(origen, destino, parada)).toBe(
      'https://www.google.com/maps/dir/?api=1&origin=41.65,-4.72&destination=40.42,-3.7&waypoints=41.5,-4.6&travelmode=driving'
    )
    expect(urlWaze(destino)).toBe('https://waze.com/ul?ll=40.42,-3.7&navigate=yes')
    expect(urlGeo(destino, 'Centro')).toBe('geo:40.42,-3.7?q=40.42,-3.7(Centro)')
  })
})
