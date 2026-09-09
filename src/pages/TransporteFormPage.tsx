import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createTransporte, updateTransporte, fetchTransporte } from '../features/transportes/api/transporteApiService';
import { useParcelas } from '../features/parcelas/hooks/useParcelas';
import { useCamiones } from '../features/camiones/hooks/useCamiones';
import { useCamioneros } from '../features/camioneros/hooks/useCamioneros';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { useCentros } from '../features/centros/hooks/useCentros';
import { TIPO_MADERA_OPTIONS } from '../constants/madera';

interface FieldErrors {
  parcelaId?: string;
  camionMatricula?: string;
  camioneroDni?: string;
  destino?: string;
  centroId?: string;
}

export const TransporteFormPage = () => {
  const { id: editId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(editId);
  const { parcelas } = useParcelas();
  const { camiones } = useCamiones();
  const { camioneros } = useCamioneros();
  const { centros } = useCentros();

  const [form, setForm] = useState({
    parcelaId: '', camionMatricula: '', camioneroDni: '',
    fechaCarga: new Date().toISOString().split('T')[0],
    toneladasCargadas: 0, tipoMadera: 'PINO', destino: '', centroId: undefined as number | undefined,
    ddsOk: null as boolean | null, referenciaDds: '',
    cocPefcOk: false, referenciaCocPefc: '',
    cocSureOk: false, geiReduccionOk: null as boolean | null, referenciaCocSure: '',
  });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editId) return;
    const ac = new AbortController();
    (async () => {
      try {
        const data = await fetchTransporte(Number(editId), ac.signal);
        if (!ac.signal.aborted) {
          setForm({
            parcelaId: data.parcelaId,
            camionMatricula: data.camionMatricula,
            camioneroDni: data.camioneroDni,
            fechaCarga: data.fechaCarga,
            toneladasCargadas: data.toneladasCargadas,
            tipoMadera: data.tipoMadera,
            destino: data.destino,
            centroId: data.centroId,
            ddsOk: data.ddsOk ?? null,
            referenciaDds: data.referenciaDds || '',
            cocPefcOk: data.cocPefcOk || false,
            referenciaCocPefc: data.referenciaCocPefc || '',
            cocSureOk: data.cocSureOk || false,
            geiReduccionOk: data.geiReduccionOk ?? null,
            referenciaCocSure: data.referenciaCocSure || '',
          });
        }
      } catch {
        if (ac.signal.aborted) return;
        setError('Error al cargar datos del transporte');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [editId]);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.parcelaId) errs.parcelaId = 'Selecciona una parcela';
    if (!form.camionMatricula) errs.camionMatricula = 'Selecciona un camión';
    if (!form.camioneroDni) errs.camioneroDni = 'Selecciona un camionero';
    if (!form.centroId && !form.destino.trim()) errs.destino = 'Selecciona un centro o escribe un destino';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEditing && editId) {
        await updateTransporte(Number(editId), form);
      } else {
        await createTransporte(form);
      }
      navigate('/transportes');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar transporte');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string | number | boolean | null | undefined) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <Link to="/transportes" className="back-link">&larr; Volver</Link>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        {isEditing ? 'Editar transporte' : 'Nuevo transporte'}
      </h1>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Parcela *</label>
          <select
            value={form.parcelaId}
            onChange={(e) => update('parcelaId', e.target.value)}
            className={`form-select ${fieldErrors.parcelaId ? 'error' : ''}`}
          >
            <option value="">Seleccionar parcela...</option>
            {parcelas.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre} {p.municipio ? `(${p.municipio})` : ''}</option>
            ))}
          </select>
          {fieldErrors.parcelaId && <span className="form-error">{fieldErrors.parcelaId}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Camión *</label>
          <select
            value={form.camionMatricula}
            onChange={(e) => update('camionMatricula', e.target.value)}
            className={`form-select ${fieldErrors.camionMatricula ? 'error' : ''}`}
          >
            <option value="">Seleccionar camión...</option>
            {camiones.filter((c) => c.activo).map((c) => (
              <option key={c.matricula} value={c.matricula}>{c.matricula} — {c.marca} {c.modelo}</option>
            ))}
          </select>
          {fieldErrors.camionMatricula && <span className="form-error">{fieldErrors.camionMatricula}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Camionero *</label>
          <select
            value={form.camioneroDni}
            onChange={(e) => update('camioneroDni', e.target.value)}
            className={`form-select ${fieldErrors.camioneroDni ? 'error' : ''}`}
          >
            <option value="">Seleccionar camionero...</option>
            {camioneros.filter((c) => c.activo).map((c) => (
              <option key={c.dni} value={c.dni}>{c.dni} — {c.nombre} {c.apellidos}</option>
            ))}
          </select>
          {fieldErrors.camioneroDni && <span className="form-error">{fieldErrors.camioneroDni}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de carga *</label>
          <input
            type="date"
            value={form.fechaCarga}
            onChange={(e) => update('fechaCarga', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Toneladas cargadas</label>
          <input
            type="number"
            step="0.1"
            value={form.toneladasCargadas || ''}
            onChange={(e) => update('toneladasCargadas', Number(e.target.value))}
            className="form-input"
            placeholder="Ej: 22.5"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tipo de madera</label>
          <select
            value={form.tipoMadera}
            onChange={(e) => update('tipoMadera', e.target.value)}
            className="form-select"
          >
            {TIPO_MADERA_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Centro de destino</label>
          <select
            value={form.centroId ?? ''}
            onChange={(e) => {
              const val = e.target.value ? Number(e.target.value) : undefined;
              update('centroId', val);
              const centro = centros.find(c => c.id === val);
              update('destino', centro ? centro.nombre : '');
            }}
            className="form-select"
          >
            <option value="">Seleccionar centro...</option>
            {centros.filter((c) => c.activo).map((c) => (
              <option key={c.id} value={c.id}>{c.nombre} {c.localidad ? `(${c.localidad})` : ''}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">o escribir destino manual</label>
          <input
            type="text"
            value={form.destino}
            onChange={(e) => {
              update('destino', e.target.value);
              if (e.target.value) update('centroId', undefined);
            }}
            placeholder="Ej: Aserradero Madrid"
            className={`form-input ${fieldErrors.destino ? 'error' : ''}`}
          />
          {fieldErrors.destino && <span className="form-error">{fieldErrors.destino}</span>}
        </div>

        <details style={{ marginTop: '1rem', border: '1px solid #E8EDF2', borderRadius: '8px', padding: '0.5rem' }}>
          <summary style={{ fontWeight: 600, cursor: 'pointer', color: '#0D47A1', fontSize: '0.9rem' }}>
            ★ Certificaciones
          </summary>
          <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            <div>
              <label style={{ fontWeight: 600, color: '#2E7D32', fontSize: '0.85rem' }}>EUDR</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={!!form.ddsOk} onChange={(e) => update('ddsOk', e.target.checked || null)} style={{ marginRight: '0.4rem' }} />
                  DDS presentada (Declaración de Diligencia Debida)
                </label>
                <input type="text" placeholder="Referencia DDS (TRACES)" value={form.referenciaDds} onChange={(e) => update('referenciaDds', e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }} />
              </div>
            </div>
            <div>
              <label style={{ fontWeight: 600, color: '#1565C0', fontSize: '0.85rem' }}>PEFC</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.cocPefcOk} onChange={(e) => update('cocPefcOk', e.target.checked)} style={{ marginRight: '0.4rem' }} />
                  Cadena de custodia PEFC verificada
                </label>
                <input type="text" placeholder="Referencia CoC PEFC" value={form.referenciaCocPefc} onChange={(e) => update('referenciaCocPefc', e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }} />
              </div>
            </div>
            <div>
              <label style={{ fontWeight: 600, color: '#F57F17', fontSize: '0.85rem' }}>SURE</label>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={form.cocSureOk} onChange={(e) => update('cocSureOk', e.target.checked)} style={{ marginRight: '0.4rem' }} />
                  Cadena de custodia SURE verificada
                </label>
                <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                  <input type="checkbox" checked={!!form.geiReduccionOk} onChange={(e) => update('geiReduccionOk', e.target.checked || null)} style={{ marginRight: '0.4rem' }} />
                  Reducción de emisiones GEI verificada
                </label>
                <input type="text" placeholder="Referencia CoC SURE" value={form.referenciaCocSure} onChange={(e) => update('referenciaCocSure', e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }} />
              </div>
            </div>
          </div>
        </details>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {saving ? 'Guardando...' : (isEditing ? 'Actualizar transporte' : 'Registrar transporte')}
        </button>
      </form>
    </div>
  );
};
