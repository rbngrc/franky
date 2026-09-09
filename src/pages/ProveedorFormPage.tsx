import { useState, useEffect } from 'react';
import { useNavigate, useParams, Link } from 'react-router-dom';
import { createProveedor, updateProveedor, fetchProveedor } from '../features/proveedores/api/proveedorApiService';
import { LoadingIndicator } from '../components/LoadingIndicator';

const TIPO_DOC_OPTIONS = [
  { value: 'NIF', label: 'NIF' },
  { value: 'CIF', label: 'CIF' },
  { value: 'PASAPORTE', label: 'Pasaporte' },
];

interface FieldErrors {
  nombre?: string;
  numeroDocumento?: string;
  paisOrigen?: string;
}

export const ProveedorFormPage = () => {
  const { id: editId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(editId);
  const [form, setForm] = useState({
    nombre: '', tipoDocumento: 'NIF', numeroDocumento: '',
    direccion: '', telefono: '', email: '',
    paisOrigen: '', regionOrigen: '', activo: true,
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
        const data = await fetchProveedor(Number(editId), ac.signal);
        if (!ac.signal.aborted) {
          setForm({
            nombre: data.nombre,
            tipoDocumento: data.tipoDocumento,
            numeroDocumento: data.numeroDocumento,
            direccion: data.direccion || '',
            telefono: data.telefono || '',
            email: data.email || '',
            paisOrigen: data.paisOrigen,
            regionOrigen: data.regionOrigen || '',
            activo: data.activo,
          });
        }
      } catch {
        if (ac.signal.aborted) return;
        setError('Error al cargar datos del proveedor');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [editId]);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.nombre.trim()) errs.nombre = 'El nombre es obligatorio';
    if (!form.numeroDocumento.trim()) errs.numeroDocumento = 'El NIF/CIF es obligatorio';
    if (!form.paisOrigen.trim()) errs.paisOrigen = 'El país de origen es obligatorio';
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
        await updateProveedor(Number(editId), form);
      } else {
        await createProveedor(form);
      }
      navigate('/proveedores');
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Error al guardar proveedor');
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
      <Link to="/proveedores" className="back-link">&larr; Volver</Link>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        {isEditing ? 'Editar proveedor' : 'Nuevo proveedor'}
      </h1>

      {error && <div className="error-box">{error}</div>}

      <form onSubmit={handleSubmit} className="form-card">
        <div className="form-group">
          <label className="form-label">Nombre / Razón social *</label>
          <input
            type="text"
            value={form.nombre}
            onChange={(e) => update('nombre', e.target.value)}
            className={`form-input ${fieldErrors.nombre ? 'error' : ''}`}
            placeholder="Ej: Maderas del Norte S.L."
          />
          {fieldErrors.nombre && <span className="form-error">{fieldErrors.nombre}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Tipo de documento</label>
          <select
            value={form.tipoDocumento}
            onChange={(e) => update('tipoDocumento', e.target.value)}
            className="form-select"
          >
            {TIPO_DOC_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Nº de documento *</label>
          <input
            type="text"
            value={form.numeroDocumento}
            onChange={(e) => update('numeroDocumento', e.target.value)}
            className={`form-input ${fieldErrors.numeroDocumento ? 'error' : ''}`}
            placeholder="Ej: B12345678"
          />
          {fieldErrors.numeroDocumento && <span className="form-error">{fieldErrors.numeroDocumento}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Dirección</label>
          <input
            type="text"
            value={form.direccion}
            onChange={(e) => update('direccion', e.target.value)}
            className="form-input"
            placeholder="Ej: C/ Mayor 5, 47001 Valladolid"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Teléfono</label>
          <input
            type="text"
            value={form.telefono}
            onChange={(e) => update('telefono', e.target.value)}
            className="form-input"
            placeholder="Ej: +34 666 777 888"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => update('email', e.target.value)}
            className="form-input"
            placeholder="Ej: info@maderasnorte.es"
          />
        </div>

        <div className="form-group">
          <label className="form-label">País de origen *</label>
          <input
            type="text"
            value={form.paisOrigen}
            onChange={(e) => update('paisOrigen', e.target.value)}
            className={`form-input ${fieldErrors.paisOrigen ? 'error' : ''}`}
            placeholder="Ej: España"
          />
          {fieldErrors.paisOrigen && <span className="form-error">{fieldErrors.paisOrigen}</span>}
        </div>

        <div className="form-group">
          <label className="form-label">Región / Estado</label>
          <input
            type="text"
            value={form.regionOrigen}
            onChange={(e) => update('regionOrigen', e.target.value)}
            className="form-input"
            placeholder="Ej: Castilla y León"
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
            <span>Proveedor activo</span>
          </label>
        </div>

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {saving ? 'Guardando...' : (isEditing ? 'Actualizar proveedor' : 'Guardar proveedor')}
        </button>
      </form>
    </div>
  );
};
