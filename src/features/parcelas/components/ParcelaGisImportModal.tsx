import { useMemo, useState } from 'react'
import { MapContainer, TileLayer, GeoJSON } from 'react-leaflet'
import type { FeatureCollection, Geometry } from 'geojson'
import { parseGisFile, type GisImportedFeature } from '../utils/gisImport'
import { createParcela, saveParcela, updateParcela } from '../api/parcelaApiService'
import Wkt from 'wicket'

interface Props {
  onClose: () => void
  onImported: () => void
}

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

export const ParcelaGisImportModal: React.FC<Props> = ({ onClose, onImported }) => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [features, setFeatures] = useState<GisImportedFeature[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [geojson, setGeojson] = useState<FeatureCollection<Geometry> | null>(null)
  const [forms, setForms] = useState<Record<string, ParcelaImportForm>>({})
  const [fieldMapping, setFieldMapping] = useState<Partial<Record<ParcelaImportField, string>>>({})
  const [extraFields, setExtraFields] = useState<string[]>([])
  const [saving, setSaving] = useState(false)

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

  const toggle = (id: string) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

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
      onImported()
      onClose()
    } catch (e: unknown) {
      setError(getErrorMessage(e, 'Error al guardar parcelas'))
    } finally {
      setSaving(false)
    }
  }

  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        background: 'rgba(0,0,0,0.6)',
        zIndex: 3000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '1rem',
      }}
    >
      <div
        style={{
          background: '#fff',
          borderRadius: '12px',
          width: '95vw',
          maxWidth: '1100px',
          height: '90vh',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: '1rem 1.25rem',
            borderBottom: '1px solid #E8EDF2',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <h2 style={{ margin: 0, fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.4rem' }}>
            Importar parcelas desde archivo GIS
          </h2>
          <button onClick={onClose} className="btn btn-secondary btn-sm">
            Cerrar
          </button>
        </div>
        <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '1fr 380px', overflow: 'hidden' }}>
          <div style={{ position: 'relative' }}>
            {geojson ? (
              <MapContainer center={[40.4, -3.7]} zoom={6} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                <GeoJSON data={geojson} style={{ color: '#2E7D32', weight: 2, fillOpacity: 0.25 }} />
              </MapContainer>
            ) : (
              <div
                style={{
                  height: '100%',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexDirection: 'column',
                  gap: '1rem',
                }}
              >
                <div
                  onDrop={(e) => {
                    e.preventDefault()
                    const f = e.dataTransfer.files?.[0]
                    if (f) handleFile(f)
                  }}
                  onDragOver={(e) => e.preventDefault()}
                  style={{
                    border: '2px dashed #90CAF9',
                    borderRadius: '12px',
                    padding: '2rem',
                    textAlign: 'center',
                    width: '80%',
                    maxWidth: '400px',
                  }}
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
            style={{ borderLeft: '1px solid #E8EDF2', display: 'flex', flexDirection: 'column', overflow: 'hidden' }}
          >
            <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E8EDF2', background: '#F8FAFC' }}>
              <div style={{ fontWeight: 600 }}>
                Parcelas: {selected.size} / {features.length} seleccionadas
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
                Los campos principales se rellenan automáticamente con las columnas del archivo que coinciden por
                nombre. Los campos sin columna en el archivo no se muestran, salvo el nombre, que puedes escribir
                manualmente.
              </div>
            )}
            {features.length > 0 && extraAvailableFields.length > 0 && (
              <div style={{ padding: '0.75rem 1rem', borderBottom: '1px solid #E8EDF2', background: '#F5F8FF' }}>
                <div style={{ fontWeight: 600, fontSize: '0.85rem', marginBottom: '0.15rem' }}>Campos adicionales</div>
                <div style={{ fontSize: '0.75rem', color: '#78909C', marginBottom: '0.5rem' }}>
                  Marca las columnas adicionales que quieras guardar tal cual. Aparecerán con su propio nombre.
                </div>
                <div
                  style={{
                    maxHeight: '9rem',
                    overflowY: 'auto',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '0.2rem',
                  }}
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
              {features.map((feat, idx) => (
                <div key={feat.id} style={{ border: '1px solid #E8EDF2', borderRadius: '8px', padding: '0.75rem' }}>
                  <label
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      marginBottom: '0.5rem',
                      cursor: 'pointer',
                    }}
                  >
                    <input type="checkbox" checked={selected.has(feat.id)} onChange={() => toggle(feat.id)} />
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
              ))}
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
              <button onClick={onClose} className="btn btn-secondary btn-sm" disabled={saving}>
                Cancelar
              </button>
              <button onClick={handleSave} className="btn btn-primary btn-sm" disabled={saving || selected.size === 0}>
                {saving ? 'Guardando...' : `Crear ${selected.size} parcela(s)`}
              </button>
            </div>
            {error && <div style={{ padding: '0 1rem 0.75rem', color: '#D32F2F', fontSize: '0.85rem' }}>{error}</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
