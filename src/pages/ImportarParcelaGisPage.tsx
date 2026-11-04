import { useCallback, useEffect, useMemo, useRef, useState, type MutableRefObject } from 'react'
import { useNavigate } from 'react-router-dom'
import { MapContainer, TileLayer, GeoJSON, useMap } from 'react-leaflet'
import L from 'leaflet'
import type { Feature, FeatureCollection, Geometry } from 'geojson'
import { parseGisFile, type GisImportedFeature } from '../features/parcelas/utils/gisImport'
import { createParcela, saveParcela, updateParcela } from '../features/parcelas/api/parcelaApiService'
import Wkt from 'wicket'

interface ParcelaImportForm {
  nombre: string
  referenciaCatastral: string
  municipio: string
  provincia: string
  datosExtra: Record<string, string>
}

type ParcelaImportField = 'nombre' | 'referenciaCatastral' | 'municipio' | 'provincia'

const IMPORT_FIELDS: Array<{ key: ParcelaImportField; label: string; required?: boolean }> = [
  { key: 'nombre', label: 'Nombre', required: true },
  { key: 'referenciaCatastral', label: 'Ref. catastral' },
  { key: 'municipio', label: 'Municipio' },
  { key: 'provincia', label: 'Provincia' },
]

const emptyForm = (): ParcelaImportForm => ({
  nombre: '',
  referenciaCatastral: '',
  municipio: '',
  provincia: '',
  datosExtra: {},
})

const SELECTED_STYLE = { color: '#2E7D32', weight: 3, fillColor: '#66BB6A', fillOpacity: 0.45 }
const UNSELECTED_STYLE = { color: '#78909C', weight: 1.5, fillColor: '#B0BEC5', fillOpacity: 0.15 }

interface MapViewControllerProps {
  mapRef: MutableRefObject<L.Map | null>
  data: FeatureCollection<Geometry> | null
}

const MapViewController = ({ mapRef, data }: MapViewControllerProps) => {
  const map = useMap()

  useEffect(() => {
    mapRef.current = map
    return () => {
      mapRef.current = null
    }
  }, [map, mapRef])

  useEffect(() => {
    if (!data || data.features.length === 0) return
    try {
      const bounds = L.geoJSON(data).getBounds()
      if (bounds.isValid()) map.fitBounds(bounds.pad(0.15))
    } catch {
      // geometrías no válidas: se mantiene la vista por defecto
    }
  }, [map, data])

  return null
}

const getFeatureBounds = (feature: Feature<Geometry>): L.LatLngBounds | null => {
  try {
    const bounds = L.geoJSON(feature).getBounds()
    return bounds.isValid() ? bounds : null
  } catch {
    return null
  }
}

const formatValue = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  return typeof value === 'object' ? JSON.stringify(value) : String(value)
}

const getErrorMessage = (error: unknown, fallback: string): string =>
  error instanceof Error && error.message ? error.message : fallback

const getPropertyText = (feature: GisImportedFeature, source: string | undefined): string => {
  if (!source) return ''
  const value = feature.properties[source]
  return value === undefined || value === null ? '' : formatValue(value).trim()
}

const buildInitialMapping = (features: GisImportedFeature[]): Partial<Record<ParcelaImportField, string>> => {
  const mapping: Partial<Record<ParcelaImportField, string>> = {}
  for (const feature of features) {
    for (const { key } of IMPORT_FIELDS) {
      const source = feature.fieldSources[key]
      if (!mapping[key] && source) mapping[key] = source
    }
  }
  return mapping
}

export const ImportarParcelaGisPage = () => {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [features, setFeatures] = useState<GisImportedFeature[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [geojson, setGeojson] = useState<FeatureCollection<Geometry> | null>(null)
  const [forms, setForms] = useState<Record<string, ParcelaImportForm>>({})
  const [fieldMapping, setFieldMapping] = useState<Partial<Record<ParcelaImportField, string>>>({})
  const [extraFields, setExtraFields] = useState<string[]>([])
  const [saving, setSaving] = useState(false)
  const mapRef = useRef<L.Map | null>(null)
  const cardRefs = useRef<Record<string, HTMLDivElement | null>>({})

  const extraAvailableFields = useMemo(
    () =>
      Array.from(new Set(features.flatMap((feature) => Object.keys(feature.properties))))
        .filter((field) => !Object.values(fieldMapping).includes(field))
        .sort((a, b) => a.localeCompare(b, 'es')),
    [features, fieldMapping]
  )

  const handleFile = async (f: File) => {
    setError(null)
    setLoading(true)
    try {
      const parsed = await parseGisFile(f)
      setFeatures(parsed)
      const fc: FeatureCollection<Geometry> = {
        type: 'FeatureCollection',
        features: parsed.map((p) => p.feature),
      }
      setGeojson(fc)
      const initialForms: Record<string, ParcelaImportForm> = {}
      const initialSelected = new Set<string>()
      parsed.forEach((p) => {
        initialForms[p.id] = {
          nombre: p.suggestedName,
          referenciaCatastral: p.suggestedRefCatastral,
          municipio: p.suggestedMunicipio,
          provincia: p.suggestedProvincia,
          datosExtra: {},
        }
        initialSelected.add(p.id)
      })
      setForms(initialForms)
      setFieldMapping(buildInitialMapping(parsed))
      setExtraFields([])
      setSelected(initialSelected)
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Error al procesar archivo'))
    } finally {
      setLoading(false)
    }
  }

  const toggle = useCallback((id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }, [])

  const focusFeatureOnMap = useCallback(
    (id: string) => {
      const map = mapRef.current
      if (!map) return
      const feat = features.find((f) => f.id === id)
      if (!feat) return
      const bounds = getFeatureBounds(feat.feature)
      if (bounds) map.fitBounds(bounds.pad(0.2), { maxZoom: 17 })
    },
    [features]
  )

  const scrollToCard = useCallback((id: string) => {
    const el = cardRefs.current[id]
    if (el && typeof el.scrollIntoView === 'function') {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  const handleMapFeatureClick = (id: string) => {
    setSelected((prev) => {
      if (prev.has(id)) return prev
      const next = new Set(prev)
      next.add(id)
      return next
    })
    scrollToCard(id)
  }

  const selectAll = useCallback(() => {
    setSelected(new Set(features.map((feature) => feature.id)))
  }, [features])

  const clearSelection = useCallback(() => setSelected(new Set()), [])

  const updateForm = (id: string, field: ParcelaImportField, value: string) => {
    setForms((prev) => ({ ...prev, [id]: { ...(prev[id] || emptyForm()), [field]: value } }))
  }

  const toggleExtraField = (field: string) => {
    const willSelect = !extraFields.includes(field)
    setExtraFields((prev) => (willSelect ? [...prev, field] : prev.filter((f) => f !== field)))
    setForms((prev) => {
      const next = { ...prev }
      for (const feature of features) {
        const form = next[feature.id] || emptyForm()
        const datosExtra = { ...form.datosExtra }
        if (willSelect) datosExtra[field] = getPropertyText(feature, field)
        else delete datosExtra[field]
        next[feature.id] = { ...form, datosExtra }
      }
      return next
    })
  }

  const updateExtraForm = (id: string, field: string, value: string) => {
    setForms((prev) => {
      const form = prev[id] || emptyForm()
      return { ...prev, [id]: { ...form, datosExtra: { ...form.datosExtra, [field]: value } } }
    })
  }

  const handleSave = async () => {
    if (selected.size === 0) {
      setError('Selecciona al menos una parcela')
      return
    }
    setSaving(true)
    setError(null)
    try {
      for (const id of selected) {
        const feat = features.find((f) => f.id === id)
        if (!feat) continue
        const form = forms[id] || emptyForm()
        const nombre = (form.nombre || feat.suggestedName || '').trim()
        if (!nombre) throw new Error('El nombre es obligatorio')
        const referenciaCatastral = form.referenciaCatastral.trim() || null
        const municipio = form.municipio.trim() || null
        const provincia = form.provincia.trim() || null
        const datosExtra = Object.fromEntries(
          Object.entries(form.datosExtra).filter(([, value]) => value.trim() !== '')
        ) as Record<string, string>
        const hasDatosExtra = Object.keys(datosExtra).length > 0
        const wkt =
          feat.geometryWkt ||
          (() => {
            try {
              const w = new Wkt.Wkt()
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              w.fromObject(feat.feature.geometry as any)
              return w.write()
            } catch {
              return null
            }
          })()

        let parcelaId: string
        try {
          const created = await createParcela({
            nombre,
            wktGeolocalizacion: wkt || undefined,
            datosExtra: hasDatosExtra ? datosExtra : undefined,
          })
          parcelaId = created.id
        } catch {
          const geomStr = JSON.stringify(feat.feature.geometry)
          const imported = await saveParcela({
            nombre,
            parcela: '',
            recinto: '',
            area: feat.areaHa ? Math.round(feat.areaHa * 10000) : 0,
            usoSigpac: null,
            geometria: geomStr,
            referenciaCatastral,
            datosExtra: hasDatosExtra ? datosExtra : undefined,
          })
          parcelaId = imported.id
        }

        if (referenciaCatastral || municipio || provincia || hasDatosExtra) {
          await updateParcela(parcelaId, {
            nombre,
            referenciaCatastral,
            municipio,
            provincia,
            datosExtra: hasDatosExtra ? datosExtra : undefined,
          })
        }
      }
      navigate('/parcelas/tabla')
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Error al guardar parcelas'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{ display: 'grid', gridTemplateColumns: geojson ? '1fr 420px' : '1fr', gap: '1rem', alignItems: 'start' }}
    >
      <div>
        {geojson ? (
          <div
            style={{
              height: '70vh',
              width: '100%',
              borderRadius: '8px',
              overflow: 'hidden',
              border: '1px solid #E8EDF2',
            }}
          >
            <MapContainer center={[40.4, -3.7]} zoom={6} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <MapViewController mapRef={mapRef} data={geojson} />
              {features.map((feat) => (
                <GeoJSON
                  key={feat.id}
                  data={feat.feature}
                  style={selected.has(feat.id) ? SELECTED_STYLE : UNSELECTED_STYLE}
                  eventHandlers={{ click: () => handleMapFeatureClick(feat.id) }}
                />
              ))}
            </MapContainer>
          </div>
        ) : (
          <div
            style={{
              height: '60vh',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'column',
              gap: '1rem',
              border: '2px dashed #90CAF9',
              borderRadius: '12px',
            }}
          >
            <div
              onDrop={(e) => {
                e.preventDefault()
                const f = e.dataTransfer.files?.[0]
                if (f) handleFile(f)
              }}
              onDragOver={(e) => e.preventDefault()}
              style={{ textAlign: 'center' }}
            >
              <div style={{ fontSize: '1.1rem', marginBottom: '0.5rem' }}>Arrastra aquí tu archivo GIS</div>
              <div style={{ color: '#546E7A', fontSize: '0.9rem' }}>o</div>
              <label className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem', cursor: 'pointer' }}>
                Seleccionar archivo
                <input
                  type="file"
                  accept=".geojson,.json,.zip,.rar,.kml,.kmz"
                  style={{ display: 'none' }}
                  onChange={(e) => {
                    const f = e.target.files?.[0]
                    if (f) handleFile(f)
                  }}
                />
              </label>
              <div style={{ marginTop: '0.75rem', fontSize: '0.8rem', color: '#78909C' }}>
                Formatos soportados: .geojson, .json, .zip (Shapefile), .rar (Shapefile), .kml, .kmz
              </div>
            </div>
            {loading && <div>Cargando archivo...</div>}
            {error && <div style={{ color: '#D32F2F' }}>{error}</div>}
          </div>
        )}
      </div>

      <div
        style={{
          border: '1px solid #E8EDF2',
          borderRadius: '8px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '70vh',
        }}
      >
        <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E8EDF2', background: '#F8FAFC' }}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'flex-start',
              gap: '0.5rem',
              flexWrap: 'wrap',
            }}
          >
            <div>
              <div style={{ fontWeight: 600 }}>Parcelas a importar</div>
              {features.length > 0 && (
                <div style={{ fontSize: '0.85rem', color: '#546E7A' }}>
                  {selected.size} / {features.length} seleccionadas
                </div>
              )}
            </div>
            {features.length > 0 && (
              <div style={{ display: 'flex', gap: '0.35rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={selectAll}
                  disabled={saving || selected.size === features.length}
                >
                  Seleccionar todas
                </button>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
                  onClick={clearSelection}
                  disabled={saving || selected.size === 0}
                >
                  Deseleccionar todas
                </button>
              </div>
            )}
          </div>
        </div>
        {features.length > 0 && (
          <div
            style={{
              padding: '0.75rem 1rem',
              borderBottom: '1px solid #E8EDF2',
              background: '#FAFCFF',
              fontSize: '0.75rem',
              color: '#546E7A',
            }}
          >
            Los campos principales se rellenan automáticamente con las columnas del archivo que coinciden por nombre.
            Los campos sin columna en el archivo no se muestran, salvo el nombre, que puedes escribir manualmente. Haz
            clic en una parcela del mapa para seleccionarla y saltar a su ficha; al marcarla en la lista, el mapa se
            centra en ella.
          </div>
        )}
        {features.length > 0 && extraAvailableFields.length > 0 && (
          <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E8EDF2', background: '#F5F8FF' }}>
            <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.15rem' }}>Campos adicionales</div>
            <div style={{ fontSize: '0.75rem', color: '#78909C', marginBottom: '0.5rem' }}>
              Marca las columnas adicionales que quieras guardar tal cual. Aparecerán con su propio nombre.
            </div>
            <div
              style={{ maxHeight: '9rem', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '0.2rem' }}
            >
              {extraAvailableFields.map((field) => (
                <label
                  key={field}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    fontSize: '0.78rem',
                    color: '#546E7A',
                  }}
                >
                  <input
                    type="checkbox"
                    checked={extraFields.includes(field)}
                    onChange={() => toggleExtraField(field)}
                  />
                  <span>{field}</span>
                </label>
              ))}
            </div>
          </div>
        )}
        {!geojson ? (
          <div style={{ padding: '1rem', color: '#78909C', textAlign: 'center' }}>
            Sube un archivo para ver las parcelas
          </div>
        ) : (
          <>
            <div
              style={{
                flex: 1,
                overflowY: 'auto',
                padding: '0.75rem 1rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '0.75rem',
              }}
            >
              {features.map((feat, idx) => {
                const isSelected = selected.has(feat.id)
                return (
                  <div
                    key={feat.id}
                    ref={(el) => {
                      cardRefs.current[feat.id] = el
                    }}
                    style={{
                      border: isSelected ? '1px solid #66BB6A' : '1px solid #E8EDF2',
                      background: isSelected ? '#F7FBF7' : '#FFFFFF',
                      borderRadius: '8px',
                      padding: '0.75rem',
                    }}
                  >
                    <label
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '0.5rem',
                        marginBottom: '0.5rem',
                        cursor: 'pointer',
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={() => {
                          const willSelect = !selected.has(feat.id)
                          toggle(feat.id)
                          if (willSelect) focusFeatureOnMap(feat.id)
                        }}
                      />
                      <span style={{ fontWeight: 600, flexShrink: 0 }}>Parcela {idx + 1}</span>
                      <span
                        style={{
                          color: '#546E7A',
                          fontSize: '0.85rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {forms[feat.id]?.nombre || feat.suggestedName}
                      </span>
                    </label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                      <label
                        style={{
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '0.25rem',
                          fontSize: '0.8rem',
                          color: '#546E7A',
                        }}
                      >
                        <span style={{ fontWeight: 600 }}>
                          Nombre <span style={{ color: '#D32F2F' }}>*</span>
                          <span style={{ fontWeight: 400 }}>
                            {fieldMapping.nombre ? ` · campo «${fieldMapping.nombre}»` : ' · sin columna detectada'}
                          </span>
                        </span>
                        <input
                          className="form-input"
                          value={forms[feat.id]?.nombre || ''}
                          onChange={(e) => updateForm(feat.id, 'nombre', e.target.value)}
                        />
                      </label>
                      {fieldMapping.referenciaCatastral && (
                        <label
                          style={{
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '0.25rem',
                            fontSize: '0.8rem',
                            color: '#546E7A',
                          }}
                        >
                          <span style={{ fontWeight: 600 }}>
                            Referencia catastral
                            <span style={{ fontWeight: 400 }}> · campo «{fieldMapping.referenciaCatastral}»</span>
                          </span>
                          <input
                            className="form-input"
                            value={forms[feat.id]?.referenciaCatastral || ''}
                            onChange={(e) => updateForm(feat.id, 'referenciaCatastral', e.target.value)}
                          />
                        </label>
                      )}
                      {(fieldMapping.municipio || fieldMapping.provincia) && (
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          {fieldMapping.municipio && (
                            <label
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                fontSize: '0.8rem',
                                color: '#546E7A',
                                flex: 1,
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                Municipio
                                <span style={{ fontWeight: 400 }}> · campo «{fieldMapping.municipio}»</span>
                              </span>
                              <input
                                className="form-input"
                                value={forms[feat.id]?.municipio || ''}
                                onChange={(e) => updateForm(feat.id, 'municipio', e.target.value)}
                              />
                            </label>
                          )}
                          {fieldMapping.provincia && (
                            <label
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                fontSize: '0.8rem',
                                color: '#546E7A',
                                flex: 1,
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>
                                Provincia
                                <span style={{ fontWeight: 400 }}> · campo «{fieldMapping.provincia}»</span>
                              </span>
                              <input
                                className="form-input"
                                value={forms[feat.id]?.provincia || ''}
                                onChange={(e) => updateForm(feat.id, 'provincia', e.target.value)}
                              />
                            </label>
                          )}
                        </div>
                      )}
                      {extraFields.length > 0 && (
                        <div style={{ marginTop: '0.25rem', paddingTop: '0.5rem', borderTop: '1px dashed #E8EDF2' }}>
                          <div
                            style={{ fontSize: '0.75rem', fontWeight: 600, color: '#78909C', marginBottom: '0.35rem' }}
                          >
                            Campos adicionales
                          </div>
                          {extraFields.map((field) => (
                            <label
                              key={field}
                              style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: '0.25rem',
                                fontSize: '0.8rem',
                                color: '#546E7A',
                                marginBottom: '0.5rem',
                              }}
                            >
                              <span style={{ fontWeight: 600 }}>{field}</span>
                              <input
                                className="form-input"
                                value={forms[feat.id]?.datosExtra?.[field] || ''}
                                onChange={(e) => updateExtraForm(feat.id, field, e.target.value)}
                              />
                            </label>
                          ))}
                        </div>
                      )}
                    </div>
                    {Object.keys(feat.properties).length > 0 && (
                      <details style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: '#78909C' }}>
                        <summary style={{ cursor: 'pointer' }}>
                          Campos detectados en el archivo ({Object.keys(feat.properties).length})
                        </summary>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.15rem', marginTop: '0.35rem' }}>
                          {Object.entries(feat.properties).map(([key, value]) => (
                            <div key={key} style={{ display: 'flex', gap: '0.35rem' }}>
                              <span style={{ fontWeight: 600 }}>{key}:</span>
                              <span style={{ wordBreak: 'break-word' }}>{formatValue(value)}</span>
                            </div>
                          ))}
                        </div>
                      </details>
                    )}
                  </div>
                )
              })}
            </div>
            <div
              style={{
                padding: '0.75rem 1rem',
                borderTop: '1px solid #E8EDF2',
                display: 'flex',
                gap: '0.5rem',
                justifyContent: 'flex-end',
              }}
            >
              <button
                onClick={() => navigate('/parcelas/tabla')}
                className="btn btn-secondary btn-sm"
                disabled={saving}
              >
                Cancelar
              </button>
              <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving || selected.size === 0}>
                {saving ? 'Guardando...' : `Crear ${selected.size} parcela(s)`}
              </button>
            </div>
          </>
        )}
        {error && geojson && (
          <div style={{ padding: '0 1rem 0.75rem', color: '#D32F2F', fontSize: '0.85rem' }}>{error}</div>
        )}
      </div>
    </div>
  )
}
