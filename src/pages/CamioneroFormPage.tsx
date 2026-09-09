import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createCamionero, updateCamionero, fetchCamionero } from '../features/camioneros/api/camioneroApiService';
import { LoadingIndicator } from '../components/LoadingIndicator';

interface FieldErrors {
  dni?: string;
  nombre?: string;
  apellidos?: string;
}

export const CamioneroFormPage = () => {
  const { dni: editDni } = useParams<{ dni: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(editDni);
  const [form, setForm] = useState({ dni: '', nombre: '', apellidos: '', telefono: '', email: '', numeroCarnet: '' });
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(isEditing);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!editDni) return;
    const ac = new AbortController();
    (async () => {
      try {
        const data = await fetchCamionero(editDni, ac.signal);
        if (!ac.signal.aborted) {
          setForm({
            dni: data.dni,
            nombre: data.nombre,
            apellidos: data.apellidos,
            telefono: data.telefono,
            email: data.email,
            numeroCarnet: data.numeroCarnet,
          });
        }
      } catch {
        if (ac.signal.aborted) return;
        setError('Error al cargar datos del camionero');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [editDni]);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.dni.trim()) errs.dni = 'El DNI es obligatorio';
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!form.apellidos.trim()) errs.apellidos = 'Los apellidos son obligatorios';
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSaving(true);
    setError(null);
    try {
      if (isEditing && editDni) {
        await updateCamionero(editDni, form);
      } else {
        await createCamionero(form);
      }
      navigate('/camioneros');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar camionero');
    } finally {
      setSaving(false);
    }
  };

  const update = (field: string, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field as keyof FieldErrors]) {
      setFieldErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <Link to="/camioneros" className="back-link">&larr; Volver</Link>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        {isEditing ? 'Editar camionero' : 'Nuevo camionero'}
      </h1>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">DNI *</label>
          <input
            type="text"
            value={form.dni}
            onChange={(e) => update('dni', e.target.value)}
            className={`form-input ${fieldErrors.dni ? 'error' : ''}`}
            placeholder="Ej: 12345678Z"
            disabled={isEditing}
          />
          {fieldErrors.dni && <span className="form-error">{fieldErrors.dni}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => update('nombre', e.target.value)}
            className={`form-input ${fieldErrors.nombre ? 'error' : ''}`}
            placeholder="Ej: Juan"
          />
          {fieldErrors.nombre && <span className="form-error">{fieldErrors.nombre}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Apellidos *</label>
          <input
            type="text"
            value={form.apellidos}
            onChange={(e) => update('apellidos', e.target.value)}
            className={`form-input ${fieldErrors.apellidos ? 'error' : ''}`}
            placeholder="Ej: García López"
          />
          {fieldErrors.apellidos && <span className="form-error">{fieldErrors.apellidos}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            value={form.telefono}
            onChange={(e) => update('telefono', e.target.value)}
            className="form-input"
            placeholder="Ej: 612345678"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="form-input"
            placeholder="Ej: juan@example.com"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Nº Carnet</label>
          <input
            type="text"
            value={form.numeroCarnet}
            onChange={(e) => update('numeroCarnet', e.target.value)}
            className="form-input"
            placeholder="Ej: CAP-12345"
          />
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {saving ? 'Guardando...' : (isEditing ? 'Actualizar camionero' : 'Guardar camionero')}
        </button>
      </form>
    </div>
  );
};
