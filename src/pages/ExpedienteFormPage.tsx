import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { ExpedienteApiService } from '../features/expedientes/api/ExpedienteApiService';
import { useProveedores } from '../features/proveedores/hooks/useProveedores';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ESTADO_OPTIONS } from '../constants/expediente';

interface FieldErrors {
  codigoExpediente?: string;
}

export const ExpedienteFormPage = () => {
  const { id: editId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(editId);
  const { proveedores } = useProveedores();

  const [form, setForm] = useState({
    codigoExpediente: '',
    numeroLicitacion: '',
    descripcion: '',
    fechaApertura: '',
    fechaAdjudicacion: '',
    proveedorId: '' as string,
    estado: 'ABIERTO',
    importe: '',
    observaciones: '',
    activo: true,
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
        const data = await ExpedienteApiService.getById(Number(editId));
        if (!ac.signal.aborted) {
          setForm({
            codigoExpediente: data.codigoExpediente || '',
            numeroLicitacion: data.numeroLicitacion || '',
            descripcion: data.descripcion || '',
            fechaApertura: data.fechaApertura || '',
            fechaAdjudicacion: data.fechaAdjudicacion || '',
            proveedorId: data.proveedorId != null ? String(data.proveedorId) : '',
            estado: data.estado || 'ABIERTO',
            importe: data.importe != null ? String(data.importe) : '',
            observaciones: data.observaciones || '',
            activo: data.activo ?? true,
          });
        }
      } catch {
        if (ac.signal.aborted) return;
        setError('Error al cargar datos del expediente');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [editId]);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.codigoExpediente.trim()) errs.codigoExpediente = 'El código de expediente es obligatorio';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      const payload = {
        codigoExpediente: form.codigoExpediente.trim(),
        numeroLicitacion: form.numeroLicitacion.trim() || undefined,
        descripcion: form.descripcion.trim() || undefined,
        fechaApertura: form.fechaApertura || null,
        fechaAdjudicacion: form.fechaAdjudicacion || null,
        proveedorId: form.proveedorId ? Number(form.proveedorId) : null,
        estado: form.estado || undefined,
        importe: form.importe ? Number(form.importe) : null,
        observaciones: form.observaciones.trim() || undefined,
        activo: form.activo,
      };
      if (isEditing && editId) {
        await ExpedienteApiService.update(Number(editId), payload);
      } else {
        await ExpedienteApiService.create(payload);
      }
      navigate('/expedientes');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar el expediente');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string | boolean) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <Link to="/expedientes" className="back-link">&larr; Volver</Link>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        {isEditing ? 'Editar expediente' : 'Nuevo expediente'}
      </h1>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Código de expediente *</label>
          <input
            type="text"
            value={form.codigoExpediente}
            onChange={(e) => update('codigoExpediente', e.target.value)}
            className={`form-input ${fieldErrors.codigoExpediente ? 'error' : ''}`}
            placeholder="Ej: EXP-2026-001"
          />
          {fieldErrors.codigoExpediente && <span className="form-error">{fieldErrors.codigoExpediente}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Nº de licitación</label>
          <input
            type="text"
            value={form.numeroLicitacion}
            onChange={(e) => update('numeroLicitacion', e.target.value)}
            className="form-input"
            placeholder="Ej: LIC-2026-045"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Proveedor / Empresa</label>
          <select
            value={form.proveedorId}
            onChange={(e) => update('proveedorId', e.target.value)}
            className="form-select"
          >
            <option value="">Sin proveedor asignado</option>
            {proveedores.map((p) => (
              <option key={p.id} value={p.id}>{p.nombre}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Estado</label>
          <select
            value={form.estado}
            onChange={(e) => update('estado', e.target.value)}
            className="form-select"
          >
            {ESTADO_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Importe (€)</label>
          <input
            type="number"
            step="0.01"
            value={form.importe}
            onChange={(e) => update('importe', e.target.value)}
            className="form-input"
            placeholder="Ej: 25000.00"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de apertura</label>
          <input
            type="date"
            value={form.fechaApertura}
            onChange={(e) => update('fechaApertura', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Fecha de adjudicación</label>
          <input
            type="date"
            value={form.fechaAdjudicacion}
            onChange={(e) => update('fechaAdjudicacion', e.target.value)}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Descripción</label>
          <textarea
            value={form.descripcion}
            onChange={(e) => update('descripcion', e.target.value)}
            className="form-input"
            rows={3}
            placeholder="Descripción del expediente..."
          />
        </div>

        <div className="form-group">
          <label className="form-label">Observaciones</label>
          <textarea
            value={form.observaciones}
            onChange={(e) => update('observaciones', e.target.value)}
            className="form-input"
            rows={3}
            placeholder="Observaciones internas..."
          />
        </div>

        <div className="form-group">
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={form.activo}
              onChange={(e) => update('activo', e.target.checked)}
              style={{ width: '16px', height: '16px' }}
            />
            <span>Expediente activo</span>
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {saving ? 'Guardando...' : (isEditing ? 'Actualizar expediente' : 'Guardar expediente')}
        </button>
      </form>
    </div>
  );
};

export default ExpedienteFormPage;
