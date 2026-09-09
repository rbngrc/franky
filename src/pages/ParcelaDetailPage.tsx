import { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useParcela } from '../features/parcelas/hooks/useParcela';
import { useLotes } from '../features/lotes/hooks/useLotes';
import { usePersonal } from '../features/personal/hooks/usePersonal';
import { useMaquinaria } from '../features/maquinaria/hooks/useMaquinaria';
import { recalcularEudrPorParcela } from '../features/transportes/api/transporteApiService';
import { MiniMap } from '../features/parcelas/components/MiniMap';
import { LoteMapDrawer } from '../features/lotes/components/LoteMapDrawer';
import { GeoMiniMap } from '../features/lotes/components/GeoMiniMap';
import type { Lote } from '../features/lotes/types/lote.types';
import type { ParcelaUpdateData } from '../features/parcelas/types/parcela.types';
import type { Polygon } from 'geojson';

const tabs = ['Información', 'Lotes', 'Personal', 'Maquinaria'] as const;
type Tab = (typeof tabs)[number];

const ESPECIES = ['Roble', 'Haya', 'Pino', 'Castaño', 'Chopo', 'Encina', 'Alcornoque', 'Eucalipto', 'Nogal', 'Cerezo'];
const ROLES = ['Agente forestal', 'Capataz', 'Peón', 'Ingeniero', 'Técnico', 'Conductor'];
const TIPOS_MAQUINARIA = ['Desbrozadora', 'Tractor', 'Motosierra', 'Ahoyadora', 'Cortadora', 'Astilladora'];

export const ParcelaDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const { parcela, isLoading, error, reload, updateParcela } = useParcela(id);
  const { lotes, isLoading: lotesLoading, createLote, updateLote, deleteLote } = useLotes(id);
  const { personal, isLoading: personalLoading, createPersonal, deletePersonal } = usePersonal(id);
  const { maquinaria, isLoading: maquinariaLoading, createMaquinaria, deleteMaquinaria } = useMaquinaria(id);
  const [activeTab, setActiveTab] = useState<Tab>('Información');
  const [recalculando, setRecalculando] = useState(false);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState<ParcelaUpdateData>({});
  const [editError, setEditError] = useState<string | null>(null);

  // Lote form
  const [showLoteForm, setShowLoteForm] = useState(false);
  const [loteNombre, setLoteNombre] = useState('');
  const [loteEspecie, setLoteEspecie] = useState('');
  const [loteSuperficie, setLoteSuperficie] = useState('');
  const [loteFecha, setLoteFecha] = useState('');
  const [loteGeometria, setLoteGeometria] = useState<Polygon | null>(null);
  const [editLoteId, setEditLoteId] = useState<string | null>(null);

  const resetLoteForm = () => {
    setLoteNombre('');
    setLoteEspecie('');
    setLoteSuperficie('');
    setLoteFecha('');
    setLoteGeometria(null);
    setEditLoteId(null);
    setShowLoteForm(false);
  };

  const handleCreateLote = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!loteNombre.trim() || !id) return;
    try {
      const data = { parcelaId: id, nombre: loteNombre.trim(), especie: loteEspecie, superficieHectareas: loteSuperficie ? parseFloat(loteSuperficie) : null, fechaPlantacion: loteFecha, geometria: loteGeometria };
      if (editLoteId) {
        await updateLote(editLoteId, data);
      } else {
        await createLote(data);
      }
      resetLoteForm();
    } catch {
      // error silencioso: el hook expone el mensaje vía su estado
    }
  };

  const handleEditLote = (lote: Lote) => {
    setLoteNombre(lote.nombre);
    setLoteEspecie(lote.especie || '');
    setLoteSuperficie(lote.superficieHectareas?.toString() || '');
    setLoteFecha(lote.fechaPlantacion || '');
    setLoteGeometria(lote.geometria || null);
    setEditLoteId(lote.id);
    setShowLoteForm(true);
  };

  // Personal form
  const [showPersonalForm, setShowPersonalForm] = useState(false);
  const [persNombre, setPersNombre] = useState('');
  const [persRol, setPersRol] = useState('');
  const [persJornadas, setPersJornadas] = useState('');
  const [persCoste, setPersCoste] = useState('');
  const [persFecha, setPersFecha] = useState('');

  const handleCreatePersonal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!persNombre.trim() || !id) return;
    try {
      await createPersonal({ parcelaId: id, nombre: persNombre.trim(), rol: persRol, jornadas: persJornadas ? parseFloat(persJornadas) : null, costeJornada: persCoste ? parseFloat(persCoste) : null, fecha: persFecha });
      setPersNombre(''); setPersRol(''); setPersJornadas(''); setPersCoste(''); setPersFecha('');
      setShowPersonalForm(false);
    } catch {
      // error silencioso
    }
  };

  // Maquinaria form
  const [showMaqForm, setShowMaqForm] = useState(false);
  const [maqNombre, setMaqNombre] = useState('');
  const [maqTipo, setMaqTipo] = useState('');
  const [maqHoras, setMaqHoras] = useState('');
  const [maqCoste, setMaqCoste] = useState('');
  const [maqFecha, setMaqFecha] = useState('');

  const handleCreateMaquinaria = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!maqNombre.trim() || !id) return;
    try {
      await createMaquinaria({ parcelaId: id, nombre: maqNombre.trim(), tipo: maqTipo, horas: maqHoras ? parseFloat(maqHoras) : null, costeHora: maqCoste ? parseFloat(maqCoste) : null, fecha: maqFecha });
      setMaqNombre(''); setMaqTipo(''); setMaqHoras(''); setMaqCoste(''); setMaqFecha('');
      setShowMaqForm(false);
    } catch {
      // error silencioso
    }
  };

  const handleRecalcularEudr = async () => {
    if (!id) return;
    try { setRecalculando(true); await recalcularEudrPorParcela(id); await reload(); }
    catch { /* error silencioso */ }
    finally { setRecalculando(false); }
  };

  const startEditing = () => {
    if (!parcela) return;
    setEditForm({
      nombre: parcela.nombre,
      referenciaCatastral: parcela.referenciaCatastral,
      municipio: parcela.municipio,
      provincia: parcela.provincia,
      deforestacionOk: parcela.deforestacionOk,
      produccionLegalOk: parcela.produccionLegalOk,
      certificacionPefc: parcela.certificacionPefc,
      codigoCertificacionPefc: parcela.codigoCertificacionPefc,
      fechaAuditoriaPefc: parcela.fechaAuditoriaPefc,
      fechaVencimientoPefc: parcela.fechaVencimientoPefc,
      certificacionSure: parcela.certificacionSure,
      codigoCertificacionSure: parcela.codigoCertificacionSure,
      fechaAuditoriaSure: parcela.fechaAuditoriaSure,
      fechaVencimientoSure: parcela.fechaVencimientoSure,
    });
    setEditing(true);
    setEditError(null);
  };

  const handleSaveCertificaciones = async () => {
    if (!id) return;
    setSaving(true);
    setEditError(null);
    try {
      await updateParcela(editForm);
      setEditing(false);
      await reload();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const ef = (field: string, value: string | number | boolean | null | undefined) => setEditForm((p) => ({ ...p, [field]: value }));

  if (isLoading) return <p className="text-muted">Cargando detalles de la parcela...</p>;
  if (error) return <p className="text-danger">{error}</p>;
  if (!parcela) return <p className="text-muted">Parcela no encontrada.</p>;

  const persTotal = personal.reduce((s, p) => s + ((p.jornadas || 0) * (p.costeJornada || 0)), 0);
  const maqTotal = maquinaria.reduce((s, m) => s + ((m.horas || 0) * (m.costeHora || 0)), 0);

  return (
    <div className="page-container">
      <Link to="/parcelas/tabla" className="back-link">&larr; Volver a parcelas</Link>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h1 className="page-title" style={{ marginBottom: 0 }}>{parcela.nombre}</h1>
        {!editing && (
          <button onClick={startEditing} className="btn btn-primary btn-sm">
            Editar parcela
          </button>
        )}
      </div>

      <div className="tab-bar">
        {tabs.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`tab ${activeTab === tab ? 'tab-active' : 'tab-inactive'}`}
          >
            {tab}
          </button>
        ))}
      </div>

      {activeTab === 'Información' && (
        <div className="tab-content">
          {editError && <div className="error-box">{editError}</div>}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem' }}>
            <div>
              <div className="detail-item" style={{ marginBottom: '0.75rem' }}>
                <div className="detail-label">ID</div>
                <div className="detail-value">{parcela.id}</div>
              </div>
              <div className="detail-item" style={{ marginBottom: '0.75rem' }}>
                <div className="detail-label">Ubicación</div>
                <div className="detail-value">
                  {parcela.municipio ? `${parcela.municipio} (${parcela.provincia})` : 'Desconocida'}
                  {parcela.datosFromSigpac && <span title="Dato cargado automáticamente desde SIGPAC/Catastro" style={{ marginLeft: '0.4rem', cursor: 'help', color: '#F57F17' }}>⚠</span>}
                </div>
              </div>
              <div className="detail-item" style={{ marginBottom: '0.75rem' }}>
                <div className="detail-label">Estado EUDR</div>
                <div className="detail-value">
                  {parcela.eudrCompliant ?
                    <span className="badge badge-success">✓ Cumple</span> :
                    <span className="badge badge-warning">? Pendiente</span>}
                </div>
              </div>
              <div className="detail-item" style={{ marginBottom: '0.75rem' }}>
                <div className="detail-label">Referencia Catastral</div>
                <div className="detail-value">
                  {parcela.referenciaCatastral || 'No disponible'}
                  {parcela.datosFromSigpac && parcela.referenciaCatastral && <span title="Dato cargado automáticamente desde SIGPAC/Catastro. Modificarlo puede invalidar la trazabilidad oficial." style={{ marginLeft: '0.4rem', cursor: 'help', color: '#F57F17' }}>⚠</span>}
                </div>
              </div>
              <div className="detail-item" style={{ marginBottom: '0.75rem' }}>
                <div className="detail-label">Área</div>
                <div className="detail-value">{parcela.areaMetrosCuadrados ? `${(parcela.areaMetrosCuadrados / 10000).toFixed(2)} ha` : 'No disponible'}</div>
              </div>
              <div className="detail-item" style={{ marginBottom: '0.75rem' }}>
                <div className="detail-label">Geometría (WKT)</div>
                <pre style={{ whiteSpace: 'pre-wrap', wordBreak: 'break-all', backgroundColor: '#f0f0f0', padding: '0.5rem', borderRadius: '4px', fontSize: '0.8rem', marginTop: '0.25rem' }}>
                  {parcela.wktGeolocalizacion || 'No disponible'}
                </pre>
                {parcela.datosFromSigpac && parcela.wktGeolocalizacion && <span title="Geometría cargada desde fuente oficial (SIGPAC). Modificarla puede afectar certificaciones." style={{ fontSize: '0.75rem', color: '#F57F17' }}>⚠ Cargada desde SIGPAC</span>}
              </div>

              <div style={{ marginTop: '1.5rem', borderTop: '1px solid #E8EDF2', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '0.75rem' }}>
                  <h3 style={{ fontFamily: "'Bebas Neue', sans-serif", fontSize: '1.1rem', margin: 0, color: '#0D47A1', letterSpacing: '1px' }}>
                    ★ Certificaciones
                  </h3>
                </div>

                {editing ? (
                  <div className="form-card" style={{ maxWidth: 'none', padding: '0.75rem' }}>
                    <div className="form-group">
                      <label className="form-label" style={{ fontWeight: 600 }}>Nombre</label>
                      <input
                        type="text"
                        value={editForm.nombre || ''}
                        onChange={(e) => ef('nombre', e.target.value)}
                        className="form-input"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Referencia catastral</label>
                      <input
                        type="text"
                        placeholder="Código SIGPAC/Catastral"
                        value={editForm.referenciaCatastral || ''}
                        onChange={(e) => ef('referenciaCatastral', e.target.value || null)}
                        className="form-input"
                        style={{ fontSize: '0.85rem' }}
                      />
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label className="form-label" style={{ fontWeight: 600 }}>Ubicación</label>
                      <div style={{ display: 'flex', gap: '0.5rem' }}>
                        <input
                          type="text"
                          placeholder="Municipio"
                          value={editForm.municipio || ''}
                          onChange={(e) => ef('municipio', e.target.value || null)}
                          className="form-input"
                          style={{ fontSize: '0.85rem', flex: 1 }}
                        />
                        <input
                          type="text"
                          placeholder="Provincia"
                          value={editForm.provincia || ''}
                          onChange={(e) => ef('provincia', e.target.value || null)}
                          className="form-input"
                          style={{ fontSize: '0.85rem', flex: 1 }}
                        />
                      </div>
                    </div>
                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#2E7D32' }}>EUDR</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                          <input type="checkbox" checked={!!editForm.deforestacionOk} onChange={(e) => ef('deforestacionOk', e.target.checked || null)} style={{ marginRight: '0.4rem' }} />
                          Sin deforestación después del 31/12/2020
                        </label>
                        <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                          <input type="checkbox" checked={!!editForm.produccionLegalOk} onChange={(e) => ef('produccionLegalOk', e.target.checked || null)} style={{ marginRight: '0.4rem' }} />
                          Producción legal (laboral, ambiental, fiscal)
                        </label>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#1565C0' }}>PEFC</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                          <input type="checkbox" checked={!!editForm.certificacionPefc} onChange={(e) => ef('certificacionPefc', e.target.checked)} style={{ marginRight: '0.4rem' }} />
                          Monte con certificación PEFC
                        </label>
                        <input type="text" placeholder="Código certificación PEFC" value={editForm.codigoCertificacionPefc || ''} onChange={(e) => ef('codigoCertificacionPefc', e.target.value || null)} className="form-input" style={{ fontSize: '0.85rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="date" value={editForm.fechaAuditoriaPefc || ''} onChange={(e) => ef('fechaAuditoriaPefc', e.target.value || null)} className="form-input" style={{ fontSize: '0.85rem', flex: 1 }} title="Fecha última auditoría" />
                          <input type="date" value={editForm.fechaVencimientoPefc || ''} onChange={(e) => ef('fechaVencimientoPefc', e.target.value || null)} className="form-input" style={{ fontSize: '0.85rem', flex: 1 }} title="Fecha vencimiento" />
                        </div>
                      </div>
                    </div>

                    <div className="form-group" style={{ marginTop: '0.75rem' }}>
                      <label className="form-label" style={{ fontWeight: 600, color: '#F57F17' }}>SURE</label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem' }}>
                        <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                          <input type="checkbox" checked={!!editForm.certificacionSure} onChange={(e) => ef('certificacionSure', e.target.checked)} style={{ marginRight: '0.4rem' }} />
                          Biomasa certificada sostenible (RED II)
                        </label>
                        <input type="text" placeholder="Código certificación SURE" value={editForm.codigoCertificacionSure || ''} onChange={(e) => ef('codigoCertificacionSure', e.target.value || null)} className="form-input" style={{ fontSize: '0.85rem' }} />
                        <div style={{ display: 'flex', gap: '0.5rem' }}>
                          <input type="date" value={editForm.fechaAuditoriaSure || ''} onChange={(e) => ef('fechaAuditoriaSure', e.target.value || null)} className="form-input" style={{ fontSize: '0.85rem', flex: 1 }} title="Fecha última auditoría" />
                          <input type="date" value={editForm.fechaVencimientoSure || ''} onChange={(e) => ef('fechaVencimientoSure', e.target.value || null)} className="form-input" style={{ fontSize: '0.85rem', flex: 1 }} title="Fecha vencimiento" />
                        </div>
                      </div>
                    </div>

                    <div className="form-actions" style={{ marginTop: '0.75rem' }}>
                      <button onClick={handleSaveCertificaciones} disabled={saving} className="btn btn-primary btn-sm">
                        {saving ? 'Guardando...' : 'Guardar parcela'}
                      </button>
                      <button onClick={() => setEditing(false)} disabled={saving} className="btn btn-secondary btn-sm">
                        Cancelar
                      </button>
                    </div>
                  </div>
                ) : (
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
                    <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#F5F7FA', border: '1px solid #E8EDF2' }}>
                      <div style={{ fontWeight: 600, color: '#2E7D32', fontSize: '0.85rem', marginBottom: '0.25rem' }}>EUDR</div>
                      <div style={{ fontSize: '0.8rem', color: '#546E7A' }}>
                        <div>✓ Sin deforestación: {parcela.deforestacionOk === null ? <span className="text-muted">No evaluado</span> : parcela.deforestacionOk ? <span style={{ color: '#2E7D32' }}>Sí</span> : <span style={{ color: '#D32F2F' }}>No</span>}</div>
                        <div>✓ Producción legal: {parcela.produccionLegalOk === null ? <span className="text-muted">No evaluado</span> : parcela.produccionLegalOk ? <span style={{ color: '#2E7D32' }}>Sí</span> : <span style={{ color: '#D32F2F' }}>No</span>}</div>
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#F5F7FA', border: '1px solid #E8EDF2' }}>
                      <div style={{ fontWeight: 600, color: '#1565C0', fontSize: '0.85rem', marginBottom: '0.25rem' }}>PEFC</div>
                      <div style={{ fontSize: '0.8rem', color: '#546E7A' }}>
                        <div>✓ Certificación: {parcela.certificacionPefc ? <span style={{ color: '#2E7D32' }}>Sí{parcela.codigoCertificacionPefc ? ` (${parcela.codigoCertificacionPefc})` : ''}</span> : <span className="text-muted">No</span>}</div>
                        <div>✓ Auditoría: {parcela.fechaAuditoriaPefc ? new Date(parcela.fechaAuditoriaPefc).toLocaleDateString() : <span className="text-muted">Pendiente</span>}</div>
                        <div>✓ Vence: {parcela.fechaVencimientoPefc ? new Date(parcela.fechaVencimientoPefc).toLocaleDateString() : <span className="text-muted">-</span>}</div>
                      </div>
                    </div>
                    <div style={{ padding: '0.5rem 0.75rem', borderRadius: '8px', background: '#F5F7FA', border: '1px solid #E8EDF2' }}>
                      <div style={{ fontWeight: 600, color: '#F57F17', fontSize: '0.85rem', marginBottom: '0.25rem' }}>SURE</div>
                      <div style={{ fontSize: '0.8rem', color: '#546E7A' }}>
                        <div>✓ Certificación: {parcela.certificacionSure ? <span style={{ color: '#2E7D32' }}>Sí{parcela.codigoCertificacionSure ? ` (${parcela.codigoCertificacionSure})` : ''}</span> : <span className="text-muted">No</span>}</div>
                        <div>✓ Auditoría: {parcela.fechaAuditoriaSure ? new Date(parcela.fechaAuditoriaSure).toLocaleDateString() : <span className="text-muted">Pendiente</span>}</div>
                        <div>✓ Vence: {parcela.fechaVencimientoSure ? new Date(parcela.fechaVencimientoSure).toLocaleDateString() : <span className="text-muted">-</span>}</div>
                      </div>
                    </div>
                    <button onClick={handleRecalcularEudr} disabled={recalculando} className="btn btn-sm btn-secondary" style={{ alignSelf: 'flex-start' }}>
                      {recalculando ? 'Recalculando...' : 'Re-evaluar EUDR'}
                    </button>
                  </div>
                )}
              </div>
            </div>
            <div>
              <div style={{ height: '400px', width: '100%' }}>
                <MiniMap wktGeometry={parcela.wktGeolocalizacion} />
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'Lotes' && (
        <div className="tab-content">
          {lotesLoading ? <p className="text-muted">Cargando lotes...</p> : lotes.length === 0 ? <p className="text-muted">No hay lotes.</p> : (
            <div className="table-wrapper">
              <table className="table">
                <thead>
                  <tr>
                    <th>Nombre</th><th>Especie</th><th>Superficie</th><th>Plantación</th><th>Geometría</th><th></th>
                  </tr>
                </thead>
                <tbody>
                  {lotes.map((l) => (
                    <tr key={l.id}>
                      <td className="text-bold">{l.nombre}</td>
                      <td>{l.especie || '-'}</td>
                      <td>{l.superficieHectareas ? `${l.superficieHectareas} ha` : '-'}</td>
                      <td>{l.fechaPlantacion ? new Date(l.fechaPlantacion).toLocaleDateString() : '-'}</td>
                      <td>{l.geometria ? <GeoMiniMap geometria={l.geometria} /> : '-'}</td>
                      <td style={{ display: 'flex', gap: 4 }}>
                        <button onClick={() => handleEditLote(l)} className="btn btn-sm btn-secondary">Editar</button>
                        <button onClick={() => deleteLote(l.id)} className="btn btn-sm btn-danger">Eliminar</button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
          {showLoteForm ? (
            <form onSubmit={handleCreateLote} className="form-card" style={{ marginTop: '1.5rem', maxWidth: '600px' }}>
              <h4 style={{ margin: '0 0 0.75rem' }}>{editLoteId ? 'Editar lote' : 'Nuevo lote'}</h4>
              <input type="text" placeholder="Nombre" value={loteNombre} onChange={(e) => setLoteNombre(e.target.value)} required className="form-input" />
              <select value={loteEspecie} onChange={(e) => setLoteEspecie(e.target.value)} className="form-select">
                <option value="">Especie...</option>
                {ESPECIES.map((e) => <option key={e} value={e}>{e}</option>)}
              </select>
              <input type="number" step="0.01" placeholder="Superficie (ha)" value={loteSuperficie} onChange={(e) => setLoteSuperficie(e.target.value)} className="form-input" />
              <input type="date" value={loteFecha} onChange={(e) => setLoteFecha(e.target.value)} className="form-input" />
              <LoteMapDrawer
                parcelaWkt={parcela.wktGeolocalizacion}
                geometria={loteGeometria}
                onGeometriaChange={setLoteGeometria}
              />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-sm">{editLoteId ? 'Actualizar' : 'Guardar'}</button>
                <button type="button" onClick={resetLoteForm} className="btn btn-secondary btn-sm">Cancelar</button>
              </div>
            </form>
          ) : (
            <button onClick={() => { resetLoteForm(); setShowLoteForm(true); }} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>+ Añadir lote</button>
          )}
        </div>
      )}

      {activeTab === 'Personal' && (
        <div className="tab-content">
          {personalLoading ? <p className="text-muted">Cargando...</p> : personal.length === 0 ? <p className="text-muted">No hay personal asignado.</p> : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th><th>Rol</th><th>Jornadas</th><th>Coste/jornada</th><th>Fecha</th><th>Total</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {personal.map((p) => (
                      <tr key={p.id}>
                        <td>{p.nombre}</td>
                        <td>{p.rol || '-'}</td>
                        <td>{p.jornadas ?? '-'}</td>
                        <td>{p.costeJornada ? `${p.costeJornada} €` : '-'}</td>
                        <td>{new Date(p.fecha).toLocaleDateString()}</td>
                        <td className="text-bold">{((p.jornadas || 0) * (p.costeJornada || 0)).toFixed(2)} €</td>
                        <td><button onClick={() => deletePersonal(p.id)} className="btn btn-sm btn-danger">Eliminar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-bold" style={{ marginTop: '0.5rem' }}>Total personal: {persTotal.toFixed(2)} €</p>
            </>
          )}
          {showPersonalForm ? (
            <form onSubmit={handleCreatePersonal} className="form-card" style={{ marginTop: '1.5rem', maxWidth: '400px' }}>
              <input type="text" placeholder="Nombre" value={persNombre} onChange={(e) => setPersNombre(e.target.value)} required className="form-input" />
              <select value={persRol} onChange={(e) => setPersRol(e.target.value)} className="form-select">
                <option value="">Rol...</option>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
              <input type="number" step="0.5" placeholder="Jornadas" value={persJornadas} onChange={(e) => setPersJornadas(e.target.value)} className="form-input" />
              <input type="number" step="0.01" placeholder="Coste por jornada (€)" value={persCoste} onChange={(e) => setPersCoste(e.target.value)} className="form-input" />
              <input type="date" value={persFecha} onChange={(e) => setPersFecha(e.target.value)} className="form-input" />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-sm">Guardar</button>
                <button type="button" onClick={() => setShowPersonalForm(false)} className="btn btn-secondary btn-sm">Cancelar</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowPersonalForm(true)} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>+ Añadir personal</button>
          )}
        </div>
      )}

      {activeTab === 'Maquinaria' && (
        <div className="tab-content">
          {maquinariaLoading ? <p className="text-muted">Cargando...</p> : maquinaria.length === 0 ? <p className="text-muted">No hay maquinaria asignada.</p> : (
            <>
              <div className="table-wrapper">
                <table className="table">
                  <thead>
                    <tr>
                      <th>Nombre</th><th>Tipo</th><th>Horas</th><th>Coste/hora</th><th>Fecha</th><th>Total</th><th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {maquinaria.map((m) => (
                      <tr key={m.id}>
                        <td>{m.nombre}</td>
                        <td>{m.tipo || '-'}</td>
                        <td>{m.horas ?? '-'}</td>
                        <td>{m.costeHora ? `${m.costeHora} €` : '-'}</td>
                        <td>{new Date(m.fecha).toLocaleDateString()}</td>
                        <td className="text-bold">{((m.horas || 0) * (m.costeHora || 0)).toFixed(2)} €</td>
                        <td><button onClick={() => deleteMaquinaria(m.id)} className="btn btn-sm btn-danger">Eliminar</button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <p className="text-bold" style={{ marginTop: '0.5rem' }}>Total maquinaria: {maqTotal.toFixed(2)} €</p>
            </>
          )}
          {showMaqForm ? (
            <form onSubmit={handleCreateMaquinaria} className="form-card" style={{ marginTop: '1.5rem', maxWidth: '400px' }}>
              <input type="text" placeholder="Nombre" value={maqNombre} onChange={(e) => setMaqNombre(e.target.value)} required className="form-input" />
              <select value={maqTipo} onChange={(e) => setMaqTipo(e.target.value)} className="form-select">
                <option value="">Tipo...</option>
                {TIPOS_MAQUINARIA.map((t) => <option key={t} value={t}>{t}</option>)}
              </select>
              <input type="number" step="0.5" placeholder="Horas" value={maqHoras} onChange={(e) => setMaqHoras(e.target.value)} className="form-input" />
              <input type="number" step="0.01" placeholder="Coste por hora (€)" value={maqCoste} onChange={(e) => setMaqCoste(e.target.value)} className="form-input" />
              <input type="date" value={maqFecha} onChange={(e) => setMaqFecha(e.target.value)} className="form-input" />
              <div className="form-actions">
                <button type="submit" className="btn btn-primary btn-sm">Guardar</button>
                <button type="button" onClick={() => setShowMaqForm(false)} className="btn btn-secondary btn-sm">Cancelar</button>
              </div>
            </form>
          ) : (
            <button onClick={() => setShowMaqForm(true)} className="btn btn-primary btn-sm" style={{ marginTop: '1rem' }}>+ Añadir maquinaria</button>
          )}
        </div>
      )}
    </div>
  );
};
