import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { createCentro, updateCentro, fetchCentroById } from '../features/centros/api/centroApiService';
import { GoogleMapsLinkResolver } from '../features/centros/components/GoogleMapsLinkResolver';
import { applyDefaultLeafletIcon } from '../lib/leafletIcon';
applyDefaultLeafletIcon();

const TIPOS = ['Aserradero', 'Planta de procesamiento', 'Almacén', 'Puerto', 'Otro'];

export const CentroFormPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm] = useState({
    nombre: '', direccion: '', tipo: 'Aserradero', latitud: null as number | null, longitud: null as number | null,
  });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;
    const abortController = new AbortController();
    const load = async () => {
      setLoading(true);
      try {
        const centro = await fetchCentroById(Number(id), abortController.signal);
        if (abortController.signal.aborted) return;
        setForm({
          nombre: centro.nombre,
          direccion: centro.direccion || '',
          tipo: centro.tipo,
          latitud: centro.latitud,
          longitud: centro.longitud,
        });
      } catch (err: unknown) {
        if (abortController.signal.aborted) return;
        setErrorMsg(err instanceof Error ? err.message : 'Error al cargar centro');
        navigate('/centros');
      } finally {
        if (!abortController.signal.aborted) {
          setLoading(false);
        }
      }
    };
    load();
    return () => abortController.abort();
  }, [id, navigate]);

  const handleResolve = (data: { direccion: string; latitud: number; longitud: number }) => {
    setForm((prev) => ({ ...prev, ...data }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);
    if (!form.nombre.trim()) { setErrorMsg('El nombre es obligatorio.'); return; }

    setSaving(true);
    try {
      if (isEditing) {
        await updateCentro(Number(id), form);
      } else {
        await createCentro(form);
      }
      navigate('/centros');
    } catch (err: unknown) {
      setErrorMsg(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <p className="text-muted">Cargando...</p>;

  const hasCoords = form.latitud != null && form.longitud != null;

  return (
    <div className="page-container" style={{ maxWidth: '600px' }}>
      <h1 className="page-title" style={{ marginBottom: '1.5rem' }}>
        {isEditing ? 'Editar centro' : 'Nuevo centro'}
      </h1>

      <form onSubmit={handleSubmit} className="form-card">
        {errorMsg && <p className="error-message" style={{ marginBottom: '0.75rem' }}>{errorMsg}</p>}
        <GoogleMapsLinkResolver onResolve={handleResolve} />

        <div className="form-group">
          <label className="form-label">Nombre *</label>
          <input
            value={form.nombre}
            onChange={(e) => setForm({ ...form, nombre: e.target.value })}
            required
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label">Tipo *</label>
          <select
            value={form.tipo}
            onChange={(e) => setForm({ ...form, tipo: e.target.value })}
            className="form-select"
          >
            {TIPOS.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
        </div>

        <div className="form-group">
          <label className="form-label">Dirección</label>
          <input
            value={form.direccion}
            onChange={(e) => setForm({ ...form, direccion: e.target.value })}
            className="form-input"
          />
        </div>

        <div style={{ display: 'flex', gap: 8 }}>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Latitud</label>
            <input
              type="number" step="any"
              value={form.latitud ?? ''}
              onChange={(e) => setForm({ ...form, latitud: e.target.value ? Number(e.target.value) : null })}
              className="form-input"
            />
          </div>
          <div className="form-group" style={{ flex: 1 }}>
            <label className="form-label">Longitud</label>
            <input
              type="number" step="any"
              value={form.longitud ?? ''}
              onChange={(e) => setForm({ ...form, longitud: e.target.value ? Number(e.target.value) : null })}
              className="form-input"
            />
          </div>
        </div>

        {hasCoords && (
          <div style={{ height: 200, width: '100%', marginTop: '0.5rem', borderRadius: 4, overflow: 'hidden', border: '1px solid #ddd' }}>
            <MapContainer
              center={[form.latitud!, form.longitud!]}
              zoom={15}
              style={{ height: '100%', width: '100%' }}
              scrollWheelZoom={false}
            >
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={[form.latitud!, form.longitud!]}>
                <Popup>{form.direccion || form.nombre}</Popup>
              </Marker>
            </MapContainer>
          </div>
        )}

        <div className="form-actions">
          <button type="submit" disabled={saving} className="btn btn-primary">
            {saving ? 'Guardando...' : 'Guardar'}
          </button>
          <button type="button" onClick={() => navigate('/centros')} className="btn btn-secondary">
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
};
