import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { createCamion, updateCamion, fetchCamion } from '../features/camiones/api/camionApiService';
import { useCamiones } from '../features/camiones/hooks/useCamiones';
import type { TipoVehiculo } from '../features/camiones/types/camion.types';
import { LoadingIndicator } from '../components/LoadingIndicator';
import styles from '../styles/CamionFormPage.module.css';

interface FieldErrors {
  matricula?: string;
  marca?: string;
  modelo?: string;
}

export const CamionFormPage = () => {
  const { matricula: editMatricula } = useParams<{ matricula: string }>();
  const navigate = useNavigate();
  const isEditing = Boolean(editMatricula);
  const { camiones } = useCamiones();
  const [form, setForm] = useState({
    matricula: '',
    marca: '',
    modelo: '',
    capacidadToneladas: 0,
    tara: 0,
    remolqueMatricula: '',
    tipo: 'CAMION' as TipoVehiculo,
  });
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
            remolqueMatricula: data.remolqueMatricula || '',
            tipo: data.tipo === 'REMOLQUE' ? 'REMOLQUE' : 'CAMION',
          });
        }
      } catch {
        if (ac.signal.aborted) return;
        setError('Error al cargar datos del vehículo');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [editMatricula]);

  const validate = (): boolean => {
    const errs: FieldErrors = {};
    if (!form.matricula.trim()) errs.matricula = 'La matrícula es obligatoria';
    if (form.tipo !== 'REMOLQUE') {
      if (!form.marca.trim()) errs.marca = 'La marca es obligatoria';
      if (!form.modelo.trim()) errs.modelo = 'El modelo es obligatorio';
    }
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
      setError(err instanceof Error ? err.message : 'Error al guardar vehículo');
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

  const esRemolque = form.tipo === 'REMOLQUE';
  const remolques = camiones.filter((c) => c.activo && c.tipo === 'REMOLQUE');

  if (loading) return <LoadingIndicator />;

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <p className="page-desc" style={{ marginBottom: '1.5rem' }}>
        {isEditing ? 'Datos del vehículo de la flota' : 'Alta de un nuevo vehículo para la flota'}
      </p>

      {!isEditing && (
        <div className={styles.tabs}>
          <button
            type="button"
            className={`${styles.tab} ${!esRemolque ? styles.tabActiva : ''}`}
            onClick={() => {
              update('tipo', 'CAMION');
              update('remolqueMatricula', '');
            }}
          >
            Camiones
          </button>
          <button
            type="button"
            className={`${styles.tab} ${esRemolque ? styles.tabActiva : ''}`}
            onClick={() => {
              update('tipo', 'REMOLQUE');
              update('remolqueMatricula', '');
            }}
          >
            Remolques
          </button>
        </div>
      )}

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
          <label className="form-label">Marca {!esRemolque && '*'}</label>
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
          <label className="form-label">Modelo {!esRemolque && '*'}</label>
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
          <label className="form-label">Capacidad (m³)</label>
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

        {!esRemolque && (
          <div className="form-group">
            <label className="form-label">Remolque</label>
            <select
              value={form.remolqueMatricula}
              onChange={(e) => update('remolqueMatricula', e.target.value)}
              className="form-select"
            >
              <option value="">Sin remolque</option>
              {remolques.map((r) => (
                <option key={r.matricula} value={r.matricula}>
                  {[r.matricula, r.marca, r.modelo].filter(Boolean).join(' — ')}
                </option>
              ))}
            </select>
          </div>
        )}

        <button type="submit" disabled={saving} className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
          {saving ? 'Guardando...' : (isEditing ? 'Actualizar vehículo' : 'Guardar vehículo')}
        </button>
      </form>
    </div>
  );
};
