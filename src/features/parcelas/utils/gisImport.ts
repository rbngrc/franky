import shp from 'shpjs'
import { kml } from '@tmcw/togeojson'
import JSZip from 'jszip'
import { createExtractorFromData } from 'node-unrar-js'
import unrarWasmUrl from 'node-unrar-js/esm/js/unrar.wasm?url'
import Wkt from 'wicket'
import type { FeatureCollection, Feature, Geometry } from 'geojson'

let unrarWasmPromise: Promise<ArrayBuffer> | null = null

const getUnrarWasm = (): Promise<ArrayBuffer> => {
  if (!unrarWasmPromise) {
    unrarWasmPromise = fetch(unrarWasmUrl).then((res) => {
      if (!res.ok) throw new Error('No se pudo cargar el motor de descompresión RAR')
      return res.arrayBuffer()
    })
  }
  return unrarWasmPromise
}

const extractRar = async (arrayBuffer: ArrayBuffer): Promise<Record<string, Uint8Array>> => {
  const wasmBinary = await getUnrarWasm()
  const extractor = await createExtractorFromData({ wasmBinary, data: arrayBuffer })
  const { files } = extractor.extract()
  const result: Record<string, Uint8Array> = {}
  for (const { fileHeader, extraction } of files) {
    if (!fileHeader.flags.directory && extraction) {
      result[fileHeader.name] = extraction
    }
  }
  return result
}

export interface GisFieldSources {
  nombre?: string
  referenciaCatastral?: string
  municipio?: string
  provincia?: string
}

export interface GisImportedFeature {
  id: string
  feature: Feature<Geometry>
  properties: Record<string, unknown>
  fieldSources: GisFieldSources
  suggestedName: string
  suggestedRefCatastral: string
  suggestedMunicipio: string
  suggestedProvincia: string
  geometryWkt: string | null
  areaHa?: number | null
}

const tryReproject = (geojson: FeatureCollection<Geometry>): FeatureCollection<Geometry> => {
  try {
    return geojson
  } catch {
    return geojson
  }
}

const normalizeFieldName = (value: string): string =>
  value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

interface FieldMatch {
  key: string
  value: string
}

const buildFieldIndex = (
  props: Record<string, unknown> | null | undefined
): Map<string, { key: string; value: unknown }> => {
  const index = new Map<string, { key: string; value: unknown }>()
  if (!props) return index
  for (const [key, value] of Object.entries(props)) {
    const normalized = normalizeFieldName(key)
    if (normalized && !index.has(normalized)) {
      index.set(normalized, { key, value })
    }
  }
  return index
}

const findField = (index: Map<string, { key: string; value: unknown }>, aliases: string[]): FieldMatch | null => {
  for (const alias of aliases) {
    const match = index.get(normalizeFieldName(alias))
    if (match && match.value !== undefined && match.value !== null && String(match.value).trim() !== '') {
      return { key: match.key, value: String(match.value).trim() }
    }
  }
  return null
}

const featureToWkt = (feature: Feature<Geometry>): string | null => {
  try {
    const wkt = new Wkt.Wkt()
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    wkt.fromObject(feature.geometry as any)
    return wkt.write()
  } catch {
    return null
  }
}

const calcAreaHa = (feature: Feature<Geometry>): number | null => {
  try {
    const wkt = featureToWkt(feature)
    if (!wkt) return null
    const areaM2 = 0 // simple fallback
    return areaM2
  } catch {
    return null
  }
}

export const parseGisFile = async (file: File): Promise<GisImportedFeature[]> => {
  const name = file.name.toLowerCase()
  let geojson: FeatureCollection<Geometry> | null = null

  if (name.endsWith('.geojson') || name.endsWith('.json')) {
    const text = await file.text()
    geojson = JSON.parse(text)
  } else if (name.endsWith('.zip')) {
    const arrayBuffer = await file.arrayBuffer()
    const parsed = await shp(arrayBuffer)
    if (Array.isArray(parsed)) {
      geojson = {
        type: 'FeatureCollection',
        features: parsed.flatMap((p: FeatureCollection<Geometry>) => p.features),
      } as FeatureCollection<Geometry>
    } else {
      geojson = parsed as FeatureCollection<Geometry>
    }
  } else if (name.endsWith('.rar')) {
    const arrayBuffer = await file.arrayBuffer()
    const files = await extractRar(arrayBuffer)
    const shpName = Object.keys(files).find((f) => f.toLowerCase().endsWith('.shp'))
    if (!shpName) throw new Error('No se encontró archivo .shp dentro del .rar')
    const base = shpName.replace(/\.shp$/i, '')
    const filesForShp: Record<string, ArrayBuffer> = {}
    for (const [k, v] of Object.entries(files)) {
      const kl = k.toLowerCase()
      if (!kl.startsWith(base.toLowerCase() + '.')) continue
      const ext = kl.slice(kl.lastIndexOf('.') + 1)
      if (ext === 'shp' || ext === 'dbf' || ext === 'prj' || ext === 'cpg') {
        filesForShp[ext] = v.buffer.slice(v.byteOffset, v.byteOffset + v.byteLength)
      }
    }
    const parsed = await shp(filesForShp as unknown as Parameters<typeof shp>[0])
    if (Array.isArray(parsed)) {
      geojson = {
        type: 'FeatureCollection',
        features: parsed.flatMap((p: FeatureCollection<Geometry>) => p.features),
      } as FeatureCollection<Geometry>
    } else {
      geojson = parsed as FeatureCollection<Geometry>
    }
  } else if (name.endsWith('.kmz')) {
    const arrayBuffer = await file.arrayBuffer()
    const zip = await JSZip.loadAsync(arrayBuffer)
    const kmlFile = Object.keys(zip.files).find((f) => f.toLowerCase().endsWith('.kml'))
    if (!kmlFile) throw new Error('No se encontró archivo .kml dentro del .kmz')
    const kmlText = await zip.files[kmlFile].async('text')
    const dom = new DOMParser().parseFromString(kmlText, 'text/xml')
    geojson = kml(dom) as FeatureCollection<Geometry>
  } else if (name.endsWith('.kml')) {
    const text = await file.text()
    const dom = new DOMParser().parseFromString(text, 'text/xml')
    geojson = kml(dom) as FeatureCollection<Geometry>
  } else {
    throw new Error('Formato no soportado. Usa .geojson, .json, .zip (Shapefile), .kml o .kmz')
  }

  if (!geojson || !geojson.features || geojson.features.length === 0) {
    throw new Error('El archivo no contiene geometrías válidas')
  }

  const reproj = tryReproject(geojson)

  return reproj.features
    .filter((f) => f && f.geometry && (f.geometry.type === 'Polygon' || f.geometry.type === 'MultiPolygon'))
    .map((feature, idx) => {
      const props = (feature.properties || {}) as Record<string, unknown>
      const index = buildFieldIndex(props)
      const nombreMatch = findField(index, [
        'nombre',
        'name',
        'titulo',
        'title',
        'nombreparcela',
        'nombrepar',
        'nombparc',
        'nomparcela',
        'nompar',
        'nomparc',
        'parcelanombre',
        'parcelanom',
        'nombrepredio',
        'nombrepred',
        'nombrefinca',
        'nombrefin',
        'nomfinca',
        'denominacion',
        'denominaci',
        'denom',
        'descripcion',
        'paraje',
        'nom',
      ])
      const refMatch = findField(index, [
        'referenciacatastral',
        'refcatastral',
        'referenciacata',
        'referenciac',
        'refcatastro',
        'refcatast',
        'refcatas',
        'refcata',
        'refcat',
        'refparcela',
        'referenciaparcela',
        'parcelaid',
        'idparcela',
        'codparcela',
        'codigoparcela',
      ])
      const municipioMatch = findField(index, [
        'municipio',
        'municipi',
        'nombremunicipio',
        'municipionombre',
        'municipioine',
        'municipiocma',
        'terminomunicipal',
        'termmun',
        'nmmuni',
        'mun',
      ])
      const provinciaMatch = findField(index, [
        'provincia',
        'provinci',
        'nombreprovincia',
        'provincianombre',
        'provinciacma',
        'nmprov',
        'prov',
      ])

      const suggestedName = nombreMatch?.value || refMatch?.value || `Parcela ${idx + 1}`
      const suggestedRefCatastral = refMatch?.value || ''
      const suggestedMunicipio = municipioMatch?.value || ''
      const suggestedProvincia = provinciaMatch?.value || ''
      const geometryWkt = featureToWkt(feature)
      const areaHa = calcAreaHa(feature)

      return {
        id: `import-${Date.now()}-${idx}`,
        feature,
        properties: props,
        fieldSources: {
          nombre: nombreMatch?.key ?? refMatch?.key,
          referenciaCatastral: refMatch?.key,
          municipio: municipioMatch?.key,
          provincia: provinciaMatch?.key,
        },
        suggestedName,
        suggestedRefCatastral,
        suggestedMunicipio,
        suggestedProvincia,
        geometryWkt,
        areaHa,
      }
    })
}
