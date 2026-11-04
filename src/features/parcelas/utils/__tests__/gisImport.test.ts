import { describe, expect, it } from 'vitest'
import { parseGisFile } from '../gisImport'

const polygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 0],
    ],
  ],
}

const geojsonFile = (properties: Record<string, unknown>): File =>
  new File(
    [
      JSON.stringify({
        type: 'FeatureCollection',
        features: [{ type: 'Feature', properties, geometry: polygon }],
      }),
    ],
    'parcelas.geojson',
    { type: 'application/json' }
  )

describe('parseGisFile', () => {
  it('detecta los campos sin distinguir mayúsculas, acentos ni separadores', async () => {
    const [parsed] = await parseGisFile(
      geojsonFile({
        NOMBRE: 'Finca El Pinar',
        'Ref. Catastral': '1234567VK1234A0001AA',
        MUNICIPIO: 'Cuenca',
        Província: 'Cuenca',
        SUPERFICIE: 12.5,
      })
    )

    expect(parsed.suggestedName).toBe('Finca El Pinar')
    expect(parsed.suggestedRefCatastral).toBe('1234567VK1234A0001AA')
    expect(parsed.suggestedMunicipio).toBe('Cuenca')
    expect(parsed.suggestedProvincia).toBe('Cuenca')
    expect(parsed.fieldSources).toEqual({
      nombre: 'NOMBRE',
      referenciaCatastral: 'Ref. Catastral',
      municipio: 'MUNICIPIO',
      provincia: 'Província',
    })
  })

  it('usa la referencia catastral como nombre si no hay campo de nombre', async () => {
    const [parsed] = await parseGisFile(geojsonFile({ REFCAT: 'ABC123' }))

    expect(parsed.suggestedName).toBe('ABC123')
    expect(parsed.fieldSources.nombre).toBe('REFCAT')
  })

  it('usa un nombre genérico solo cuando no hay datos identificativos', async () => {
    const [parsed] = await parseGisFile(geojsonFile({ USO_SIGPAC: 'CR' }))

    expect(parsed.suggestedName).toBe('Parcela 1')
    expect(parsed.fieldSources.nombre).toBeUndefined()
  })
})
