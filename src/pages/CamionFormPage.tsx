import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCamion, updateCamion, fetchCamion } from '../features/camiones/api/camionApiService';
import { LoadingIndicator } from '../components/LoadingIndicator';

interface FieldErrors {
  matricula?: string;
  marca?: string;
  modelo?: string;
}

export const CamionFormPage = () => {
  const { matricula: editMatricula } = useParams<{ matricula: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(editMatricula);
  const [form, setForm] = useState({ matricula: '', marca: '', modelo: '', capacidadToneladas: 0, tara: 0 });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editMatricula) return;
    const ac = new AbortController();
    (async () => {
      try {
        const data = await fetchCamion(editMatricula, ac.signal);
        if (!ac.signal.aborted) {
          setForm({
            matricula: data.matricula,
            marca: data.marca,
            modelo: data.modelo,
            capacidadToneladas: data.capacidadToneladas,
            tara: data.tara,
          });
        }
      } catch {
        if (ac.signal.aborted) return;
        setError('Error al cargar datos del camión');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [editMatricula]);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.matricula.trim()) errs.matricula = 'La matrícula es obligatoria';
    if (!form.marca.trim()) errs.marca = 'La marca es obligatoria';
    if (!form.modelo.trim()) errs.modelo = 'El modelo es obligatorio';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEditing && editMatricula) {
        await updateCamion(editMatricula, form);
      } else {
        await createCamion(form);
      }
      navigate('/camiones');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar camión');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string | number) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <Link to="/camiones" className="back-link">&larr; Volver</Link>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        {isEditing ? 'Editar camión' : 'Nuevo camión'}
      </h1>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Matrícula *</label>
          <input
            type="text"
            value={form.matricula}
            onChange={(e) => update('matricula', e.target.value)}
            className={`form-input ${fieldErrors.matricula ? 'error' : ''}`}
            placeholder="Ej: 1234ABC"
            disabled={isEditing}
          />
          {fieldErrors.matricula && <span className="form-error">{fieldErrors.matricula}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Marca *</label>
          <input
            type="text"
            value={form.marca}
            onChange={(e) => update('marca', e.target.value)}
            className={`form-input ${fieldErrors.marca ? 'error' : ''}`}
            placeholder="Ej: Mercedes"
          />
          {fieldErrors.marca && <span className="form-error">{fieldErrors.marca}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Modelo *</label>
          <input
            type="text"
            value={form.modelo}
            onChange={(e) => update('modelo', e.target.value)}
            className={`form-input ${fieldErrors.modelo ? 'error' : ''}`}
            placeholder="Ej: Actros"
          />
          {fieldErrors.modelo && <span className="form-error">{fieldErrors.modelo}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Capacidad (toneladas)</label>
          <input
            type="number"
            value={form.capacidadToneladas || ''}
            onChange={(e) => update('capacidadToneladas', Number(e.target.value))}
            className="form-input"
            placeholder="Ej: 24"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tara (kg)</label>
          <input
            type="number"
            value={form.tara || ''}
            onChange={(e) => update('tara', Number(e.target.value))}
            className="form-input"
            placeholder="Ej: 12000"
          />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {saving ? 'Guardando...' : (isEditing ? 'Actualizar camión' : 'Guardar camión')}
        </button>
      </form>
    </div>
  );
};
