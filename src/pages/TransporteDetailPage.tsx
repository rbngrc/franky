import { useEffect, useRef, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTransporte } from '../features/transportes/hooks/useTransporte';
import type { Transporte } from '../features/transportes/types/transporte.types';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { updateTransporte, deleteTransporte } from '../features/transportes/api/transporteApiService';
import { useRole } from '../features/config/RoleContext';
import { useParcela } from '../features/parcelas/hooks/useParcela';
import { useCentro } from '../features/centros/hooks/useCentro';
import { useParcelas } from '../features/parcelas/hooks/useParcelas';
import { useCamiones } from '../features/camiones/hooks/useCamiones';
import { useCamioneros } from '../features/camioneros/hooks/useCamioneros';
import { useCentros } from '../features/centros/hooks/useCentros';
import { useExpedientes } from '../features/expedientes/hooks/useExpedientes';
import { RoutingMachine } from '../features/transportes/components/RoutingMachine';
import { NavegacionRuta } from '../features/transportes/components/NavegacionRuta';
import { BasculasCapa } from '../features/basculas/components/BasculasCapa';
import { BasculasLista } from '../features/basculas/components/BasculasLista';
import { useBasculasRuta } from '../features/basculas/hooks/useBasculasRuta';
import { TIPO_MADERA_OPTIONS, tipoMaderaLabel } from '../constants/madera';
import { parseWktCenter } from '../lib/geojson';
import { applyDefaultLeafletIcon } from '../lib/leafletIcon';
import navegacionStyles from '../styles/NavegacionRuta.module.css';

applyDefaultLeafletIcon();

const FOTO_PESAJE_LABEL: Record<keyof NonNullable<Transporte['fotos']>, string> = {
  frente: 'Camión de frente',
  trasera: 'Camión desde atrás',
  lateral: 'Camión de lado',
  ticket: 'Ticket de pesaje',
};

const QRCanvas: React.FC<{ text: string }> = ({ text }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [error, setError] = useState(false);
  useEffect(() => {
    if (canvasRef.current && text) {
      QRCode.toCanvas(canvasRef.current, text, { width: 180, margin: 2 }, (err) => { if (err) setError(true); });
    }
  }, [text]);
  if (error) return <p className="text-danger" style={{ fontSize: '0.85rem' }}>Error al generar QR</p>;
  return <canvas ref={canvasRef} style={{ border: '1px solid #ddd', borderRadius: '8px' }} />;
};

export const TransporteDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { isConductor, isAgenteForestal } = useRole();
  const { transporte, isLoading, error, reload } = useTransporte(id ? Number(id) : undefined);
  const { parcela } = useParcela(transporte?.parcelaId);
  const { centro } = useCentro(transporte?.centroId ?? null);
  const { parcelas } = useParcelas();
  const { camiones } = useCamiones();
  const { camioneros } = useCamioneros();
  const { centros } = useCentros();
  const { expedientes } = useExpedientes();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    parcelaId: '', camionMatricula: '', camioneroDni: '',
    fechaCarga: '', toneladasCargadas: 0, tipoMadera: 'PINO',
    destino: '', centroId: undefined as number | undefined,
    expedienteId: undefined as number | undefined,
    remolqueMatricula: '',
    parcelaReferenciaCatastral: '',
    ddsOk: null as boolean | null, referenciaDds: '',
    cocPefcOk: false, referenciaCocPefc: '',
    cocSureOk: false, geiReduccionOk: null as boolean | null, referenciaCocSure: '',
  });
  const [editError, setEditError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [lightboxFoto, setLightboxFoto] = useState<string | null>(null);
  const [routeInfo, setRouteInfo] = useState<{ distanceKm: number; durationMin: number } | null>(null);
  const [routeCoords, setRouteCoords] = useState<[number, number][] | null>(null);
  const [showBasculas, setShowBasculas] = useState(false);
  const [showGps, setShowGps] = useState(false);
  const {
    basculas,
    basculasCercanas,
    isLoading: basculasLoading,
    error: basculasError,
  } = useBasculasRuta(routeCoords, showBasculas || showGps);

  const copyTraceabilityCode = async () => {
    if (!transporte?.codigoTrazabilidad) return;
    try {
      await navigator.clipboard.writeText(transporte.codigoTrazabilidad);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback
    }
  };

  const copyTransportLink = async () => {
    if (!transporte) return;
    try {
      const url = `${window.location.origin}/transportes/${transporte.id}`;
      await navigator.clipboard.writeText(url);
      setCopiedLink(true);
      setTimeout(() => setCopiedLink(false), 2000);
    } catch {
      // fallback
    }
  };

  const startEditing = () => {
    if (!transporte) return;
    setEditForm({
      nombre: (transporte.nombre || '').toUpperCase(),
      parcelaId: transporte.parcelaId,
      camionMatricula: transporte.camionMatricula,
      camioneroDni: transporte.camioneroDni,
      fechaCarga: transporte.fechaCarga,
      toneladasCargadas: transporte.toneladasCargadas,
      tipoMadera: transporte.tipoMadera,
      destino: transporte.destino,
      centroId: transporte.centroId,
      expedienteId: transporte.expedienteId,
      remolqueMatricula: transporte.remolqueMatricula || '',
      parcelaReferenciaCatastral: transporte.parcelaReferenciaCatastral || '',
      ddsOk: transporte.ddsOk ?? null, referenciaDds: transporte.referenciaDds || '',
      cocPefcOk: transporte.cocPefcOk || false, referenciaCocPefc: transporte.referenciaCocPefc || '',
      cocSureOk: transporte.cocSureOk || false, geiReduccionOk: transporte.geiReduccionOk ?? null, referenciaCocSure: transporte.referenciaCocSure || '',
    });
    setEditing(true);
    setEditError(null);
  };

  const handleSave = async () => {
    if (!transporte) return;
    setSaving(true);
    setEditError(null);
    try {
      await updateTransporte(transporte.id, editForm);
      setEditing(false);
      await reload();
    } catch (err: unknown) {
      setEditError(err instanceof Error ? err.message : 'Error al guardar');
    } finally {
      setSaving(false);
    }
  };

  const ef = (field: string, value: string | number | boolean | null | undefined) =>
    setEditForm((p) => ({ ...p, [field]: field === 'nombre' && typeof value === 'string' ? value.toUpperCase() : value }));

  const handleDelete = async () => {
    if (!transporte) return;
    try {
      await deleteTransporte(transporte.id);
      navigate('/transportes');
    } catch {
      // error silencioso
    }
  };

  if (isLoading) return <LoadingIndicator />;
  if (error) {
    return (
      <div style={{ padding: '1rem', maxWidth: '600px' }}>
        <p className="text-danger" style={{ marginBottom: '0.75rem' }}>{error}</p>
        <button onClick={() => reload()} className="btn btn-primary btn-sm">
          Reintentar
        </button>
      </div>
    );
  }
  if (!transporte) return <p style={{ padding: '1rem' }}>Transporte no encontrado.</p>;

  const handleDownloadPDF = async () => {
    const qrData = `${window.location.origin}/transportes/${transporte.id}`;

    const qrCanvas = document.createElement('canvas');
    await QRCode.toCanvas(qrCanvas, qrData, { width: 150, margin: 1 });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 20;
    let y = margin;

    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('es-ES') : '??';
    const writeSection = (title: string) => {
      if (y > 262) { pdf.addPage(); y = margin; }
      pdf.setFontSize(11);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(title, margin, y);
      y += 5;
      pdf.setDrawColor(0, 0, 0);
      pdf.line(margin, y, 190, y);
      y += 5;
    };
    const writeField = (label: string, value: string) => {
      if (y > 280) { pdf.addPage(); y = margin; }
      pdf.setFontSize(9);
      pdf.setFont('Helvetica', 'bold');
      pdf.text(label, margin + 3, y);
      const lw = pdf.getTextWidth(label + '  ');
      pdf.setFont('Helvetica', 'normal');
      pdf.text(value || '??', margin + 3 + lw, y);
      y += 5;
    };

    pdf.setFontSize(14);
    pdf.setFont('Helvetica', 'bold');
    pdf.text('CÓDIGO DE TRAZABILIDAD', 105, y, { align: 'center' });
    y += 8;

    pdf.setFontSize(18);
    pdf.setFont('Courier', 'bold');
    pdf.text(transporte.codigoTrazabilidad, 105, y, { align: 'center' });
    y += 12;

    pdf.setDrawColor(0, 0, 0);
    pdf.line(margin, y, 190, y);
    y += 8;

    writeSection('DATOS DEL TRANSPORTE');
    writeField('Nombre:', (transporte.nombre || `Transporte #${transporte.id}`).toUpperCase());
    writeField('Código trazabilidad:', transporte.codigoTrazabilidad);
    writeField('Camión:', transporte.camionMatricula + (transporte.camionMarca ? ` (${transporte.camionMarca})` : ''));
    writeField('Camionero:', transporte.camioneroNombre || transporte.camioneroDni);
    writeField('Fecha de carga:', fmtDate(transporte.fechaCarga));
    writeField('Metros cúbicos:', transporte.toneladasCargadas ? `${transporte.toneladasCargadas} m³` : '??');
    writeField('Tipo de madera:', tipoMaderaLabel(transporte.tipoMadera) || '??');
    writeField('Destino:', transporte.centroNombre || transporte.destino || '??');
    y += 3;

    writeSection('ORIGEN');
    writeField('Parcela:', transporte.parcelaNombre || transporte.parcelaId);
    writeField('Municipio:', parcela?.municipio || '??');
    writeField('Provincia:', parcela?.provincia || '??');
    writeField('Referencia catastral:', transporte.parcelaReferenciaCatastral || '??');
    y += 3;

    writeSection('CERTIFICACIONES');
    writeField('EUDR:', transporte.eudrCumplimiento ? 'Disponible' : 'No disponible');
    writeField('PEFC:', transporte.pefcCumplimiento ? 'Disponible' : 'No disponible');
    writeField('SURE:', transporte.sureCumplimiento ? 'Disponible' : 'No disponible');
    y += 8;

    pdf.line(margin, y, 190, y);
    y += 10;

    if (y > 235) { pdf.addPage(); y = margin; }
    y += 5;
    const qrImgData = qrCanvas.toDataURL('image/png');
    const qrSize = 45;
    const qrX = (210 - qrSize) / 2;
    pdf.addImage(qrImgData, 'PNG', qrX, y, qrSize, qrSize);
    y += qrSize + 5;

    pdf.setFontSize(8);
    pdf.setFont('Helvetica', 'normal');
    pdf.text('Escanee para verificar los datos del transporte', 105, y, { align: 'center' });

    pdf.save(`TRAZA-${transporte.codigoTrazabilidad}.pdf`);
  };

  const qrData = `${window.location.origin}/transportes/${transporte.id}`;

  const parcelaCenter = parcela?.wktGeolocalizacion ? parseWktCenter(parcela.wktGeolocalizacion) : null;
  const centroPos: [number, number] | null = centro?.latitud != null && centro?.longitud != null ? [centro.latitud, centro.longitud] : null;
  const showRoute = parcelaCenter && centroPos;
  const routeWaypoints: [number, number][] | null = parcelaCenter && centroPos ? [parcelaCenter, centroPos] : null;
  let mapCenter: [number, number] | null = null;
  if (parcelaCenter && centroPos) mapCenter = [(parcelaCenter[0] + centroPos[0]) / 2, (parcelaCenter[1] + centroPos[1]) / 2];
  else if (parcelaCenter) mapCenter = parcelaCenter;
  else if (centroPos) mapCenter = centroPos;

  const hasPesaje =
    transporte.numeroTicket != null ||
    transporte.pesoBrutoKg != null ||
    transporte.taraKg != null ||
    transporte.pesoNetoKg != null ||
    (transporte.fotos && Object.values(transporte.fotos).some(Boolean)) ||
    false;

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      {(isConductor || isAgenteForestal) && (
        <Link to={isConductor ? '/conductor' : '/agente'} className="back-link">
          &larr; {isConductor ? 'Volver a mi trabajo' : 'Volver al panel del agente'}
        </Link>
      )}

      <div className="detail-header" style={{ marginBottom: '1.5rem' }}>
        <div style={{ flex: 1 }}>
          {editing ? (
            <input
              type="text"
              value={editForm.nombre}
              onChange={(e) => ef('nombre', e.target.value)}
              className="form-input"
              style={{ fontSize: '1.8rem', fontFamily: "'Bebas Neue', sans-serif", fontWeight: 700, padding: '0.25rem 0.5rem', width: '100%', boxSizing: 'border-box' }}
              placeholder={`Transporte #${transporte.id}`}
            />
          ) : (
            <h1 className="page-title" style={{ margin: 0 }}>
              {(transporte.nombre || `Transporte #${transporte.id}`).toUpperCase()}
            </h1>
          )}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            marginTop: '0.25rem',
            flexWrap: 'wrap',
          }}>
            <div style={{
              fontFamily: "'Courier New', monospace",
              fontSize: '1.15rem',
              fontWeight: 700,
              color: '#333',
              letterSpacing: '0.5px',
            }}>
              {transporte.codigoTrazabilidad}
            </div>
            <button
              onClick={copyTraceabilityCode}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
              title="Copiar código de trazabilidad"
            >
              {copied ? '¡Copiado!' : 'Copiar código'}
            </button>
            <button
              onClick={copyTransportLink}
              className="btn btn-secondary btn-sm"
              style={{ padding: '0.2rem 0.6rem', fontSize: '0.8rem' }}
              title="Copiar enlace del transporte"
            >
              {copiedLink ? '¡Enlace copiado!' : 'Copiar enlace'}
            </button>
          </div>
        </div>
        {!editing && (
          <div style={{ display: 'flex', gap: '0.5rem' }}>
            <button onClick={startEditing} className="btn btn-primary btn-sm">
              Editar
            </button>
            <button onClick={() => setConfirmDelete(true)} className="btn btn-outline-danger btn-sm">
              Eliminar
            </button>
          </div>
        )}
      </div>

      {editError && <div className="error-box">{editError}</div>}

      {!editing && transporte.razonesIncumplimiento && transporte.razonesIncumplimiento.length > 0 && (
        <div style={{ background: '#fff3e0', border: '1px solid #ffb74d', borderRadius: '6px', padding: '1rem', marginBottom: '1rem', borderLeft: '4px solid #f57c00' }}>
          <strong style={{ color: '#e65100' }}>No cumple EUDR</strong>
          <div style={{ marginTop: '0.5rem', fontSize: '0.9rem' }}>
            {transporte.razonesIncumplimiento.map((razon, i) => (
              <div key={i} className="text-danger">✗ {razon}</div>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '2rem', flexWrap: 'wrap' }}>
        <div style={{ flex: 1, minWidth: '300px' }} className="card card-body">

          {editing ? (
            <div className="form-card" style={{ maxWidth: 'none' }}>
              <div className="form-group">
                <label className="form-label">Parcela *</label>
                <select value={editForm.parcelaId} onChange={(e) => ef('parcelaId', e.target.value)} className="form-select">
                  <option value="">Seleccionar parcela...</option>
                  {parcelas.map((p) => <option key={p.id} value={p.id}>{p.nombre} {p.municipio ? `(${p.municipio})` : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Camión *</label>
                <select value={editForm.camionMatricula} onChange={(e) => ef('camionMatricula', e.target.value)} className="form-select">
                  <option value="">Seleccionar camión...</option>
                  {camiones.filter((c) => c.activo && c.tipo !== 'REMOLQUE').map((c) => <option key={c.matricula} value={c.matricula}>{c.matricula} {c.marca} {c.modelo}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Camionero *</label>
                <select value={editForm.camioneroDni} onChange={(e) => ef('camioneroDni', e.target.value)} className="form-select">
                  <option value="">Seleccionar camionero...</option>
                  {camioneros.filter((c) => c.activo).map((c) => <option key={c.dni} value={c.dni}>{c.dni} {c.nombre} {c.apellidos}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de carga *</label>
                <input type="date" value={editForm.fechaCarga} onChange={(e) => ef('fechaCarga', e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Metros cúbicos cargados</label>
                <input type="number" step="0.1" value={editForm.toneladasCargadas || ''} onChange={(e) => ef('toneladasCargadas', Number(e.target.value))} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Tipo de madera</label>
                <select value={editForm.tipoMadera} onChange={(e) => ef('tipoMadera', e.target.value)} className="form-select">
                  {TIPO_MADERA_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Centro de destino</label>
                <select value={editForm.centroId ?? ''} onChange={(e) => {
                  const val = e.target.value ? Number(e.target.value) : undefined;
                  ef('centroId', val);
                  const c = centros.find((cc) => cc.id === val);
                  ef('destino', c ? c.nombre : '');
                }} className="form-select">
                  <option value="">Seleccionar centro...</option>
                  {centros.filter((c) => c.activo).map((c) => <option key={c.id} value={c.id}>{c.nombre} {c.localidad ? `(${c.localidad})` : ''}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">o escribir destino manual</label>
                <input type="text" value={editForm.destino} onChange={(e) => {
                  ef('destino', e.target.value);
                  if (e.target.value) ef('centroId', undefined);
                }} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Expediente</label>
                <select
                  value={editForm.expedienteId ?? ''}
                  onChange={(e) => ef('expedienteId', e.target.value ? Number(e.target.value) : undefined)}
                  className="form-select"
                >
                  <option value="">Sin expediente asignado</option>
                  {expedientes
                    .filter((ex) => ex.activo !== false)
                    .map((ex) => (
                      <option key={ex.id} value={ex.id}>
                        {ex.codigoExpediente}{ex.numeroLicitacion ? ` / ${ex.numeroLicitacion}` : ''}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Remolque</label>
                <select
                  value={editForm.remolqueMatricula}
                  onChange={(e) => ef('remolqueMatricula', e.target.value)}
                  className="form-select"
                >
                  <option value="">Sin remolque</option>
                  {camiones.filter((c) => c.activo && c.tipo === 'REMOLQUE').map((c) => (
                    <option key={c.matricula} value={c.matricula}>{[c.matricula, c.marca, c.modelo].filter(Boolean).join(' — ')}</option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Referencia catastral de la parcela</label>
                <input type="text" value={editForm.parcelaReferenciaCatastral} onChange={(e) => ef('parcelaReferenciaCatastral', e.target.value)} className="form-input" />
              </div>
              <details style={{ margin: '0.75rem 0', border: '1px solid #E8EDF2', borderRadius: '8px', padding: '0.5rem' }}>
                <summary style={{ fontWeight: 600, cursor: 'pointer', color: '#0D47A1', fontSize: '0.9rem' }}>
                  â˜… Certificaciones
                </summary>
                <div style={{ marginTop: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                  <div>
                    <label style={{ fontWeight: 600, color: '#2E7D32', fontSize: '0.85rem' }}>EUDR</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                      <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={!!editForm.ddsOk} onChange={(e) => ef('ddsOk', e.target.checked || null)} style={{ marginRight: '0.4rem' }} />
                        DDS presentada
                      </label>
                      <input type="text" placeholder="Referencia DDS (TRACES)" value={editForm.referenciaDds} onChange={(e) => ef('referenciaDds', e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#1565C0', fontSize: '0.85rem' }}>PEFC</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                      <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={editForm.cocPefcOk} onChange={(e) => ef('cocPefcOk', e.target.checked)} style={{ marginRight: '0.4rem' }} />
                        Cadena de custodia PEFC
                      </label>
                      <input type="text" placeholder="Ref. CoC PEFC" value={editForm.referenciaCocPefc} onChange={(e) => ef('referenciaCocPefc', e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                  <div>
                    <label style={{ fontWeight: 600, color: '#F57F17', fontSize: '0.85rem' }}>SURE</label>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.3rem', marginTop: '0.3rem' }}>
                      <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={editForm.cocSureOk} onChange={(e) => ef('cocSureOk', e.target.checked)} style={{ marginRight: '0.4rem' }} />
                        Cadena de custodia SURE
                      </label>
                      <label className="form-label" style={{ fontWeight: 400, fontSize: '0.85rem' }}>
                        <input type="checkbox" checked={!!editForm.geiReduccionOk} onChange={(e) => ef('geiReduccionOk', e.target.checked || null)} style={{ marginRight: '0.4rem' }} />
                        Reducción GEI verificada
                      </label>
                      <input type="text" placeholder="Ref. CoC SURE" value={editForm.referenciaCocSure} onChange={(e) => ef('referenciaCocSure', e.target.value)} className="form-input" style={{ fontSize: '0.85rem' }} />
                    </div>
                  </div>
                </div>
              </details>
              <div className="form-actions">
                <button onClick={handleSave} disabled={saving} className="btn btn-primary btn-sm">
                  {saving ? 'Guardando...' : 'Guardar cambios'}
                </button>
                <button onClick={() => setEditing(false)} disabled={saving} className="btn btn-secondary btn-sm">
                  Cancelar
                </button>
              </div>
            </div>
          ) : (
            <>
              <div className="detail-grid">
                <div className="detail-item">
                  <div className="detail-label">Parcela</div>
                  <div className="detail-value">
                    {transporte.parcelaId ? (
                      <Link to={`/parcelas/detalle/${transporte.parcelaId}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {transporte.parcelaNombre || transporte.parcelaId}
                      </Link>
                    ) : transporte.parcelaNombre || <span className="text-muted">(vacío)</span>}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Camión</div>
                  <div className="detail-value">
                    {transporte.camionMatricula ? (
                      <Link to={`/camiones/${transporte.camionMatricula}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {transporte.camionMatricula}{transporte.camionMarca ? ` (${transporte.camionMarca})` : ''}
                      </Link>
                    ) : transporte.camionMatricula || <span className="text-muted">(vacío)</span>}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Camionero</div>
                  <div className="detail-value">
                    {transporte.camioneroDni ? (
                      <Link to={`/conductores/${transporte.camioneroDni}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {transporte.camioneroNombre || transporte.camioneroDni}
                      </Link>
                    ) : transporte.camioneroNombre || <span className="text-muted">(vacío)</span>}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Fecha de carga</div>
                  <div className="detail-value">{new Date(transporte.fechaCarga).toLocaleDateString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Metros cúbicos</div>
                  <div className="detail-value">{transporte.toneladasCargadas ? `${transporte.toneladasCargadas} m³` : <span className="text-muted">(vacío)</span>}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Tipo de madera</div>
                  <div className="detail-value">{tipoMaderaLabel(transporte.tipoMadera) || <span className="text-muted">(vacío)</span>}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Destino</div>
                  <div className="detail-value">
                    {transporte.centroId ? (
                      <Link to={`/centros/${transporte.centroId}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {transporte.centroNombre || transporte.destino}
                      </Link>
                    ) : transporte.centroNombre || transporte.destino || <span className="text-muted">(vacío)</span>}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Expediente</div>
                  <div className="detail-value">
                    {transporte.expedienteId != null ? (
                      <Link to={`/expedientes/${transporte.expedienteId}`} style={{ color: '#1976d2', textDecoration: 'none' }}>
                        {expedientes.find((ex) => ex.id === transporte.expedienteId)?.codigoExpediente || `#${transporte.expedienteId}`}
                      </Link>
                    ) : <span className="text-muted">Sin expediente</span>}
                  </div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Remolque</div>
                  <div className="detail-value">{transporte.remolqueMatricula || <span className="text-muted">Sin remolque</span>}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Código trazabilidad</div>
                  <div className="detail-value"><code style={{ background: '#eee', padding: '2px 6px', borderRadius: '4px' }}>{transporte.codigoTrazabilidad}</code></div>
                </div>
              </div>

              <div className="detail-grid" style={{ marginTop: '0.75rem' }}>
                <div className="detail-item">
                  <div className="detail-label">Referencia catastral (parcela)</div>
                  <div className="detail-value">{transporte.parcelaReferenciaCatastral || <span className="text-muted">(vacío)</span>}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Geolocalización (parcela)</div>
                  {transporte.parcelaWktGeolocalizacion ? (
                    <details style={{ marginTop: '0.25rem' }}>
                      <summary style={{ cursor: 'pointer', fontSize: '0.85rem', color: '#1565C0' }}>
                        Ver geometría ({transporte.parcelaWktGeolocalizacion.length.toLocaleString('es-ES')} caracteres)
                      </summary>
                      <pre
                        style={{
                          whiteSpace: 'pre-wrap',
                          wordBreak: 'break-all',
                          backgroundColor: '#f0f0f0',
                          padding: '0.5rem',
                          borderRadius: '4px',
                          fontSize: '0.8rem',
                          marginTop: '0.25rem',
                          maxHeight: '12rem',
                          overflowY: 'auto',
                        }}
                      >
                        {transporte.parcelaWktGeolocalizacion}
                      </pre>
                    </details>
                  ) : (
                    <div className="detail-value"><span className="text-muted">(vacío)</span></div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>

        <div style={{ textAlign: 'center' }}>
          <div style={{ marginBottom: '0.75rem', display: 'flex', flexDirection: 'column', gap: '0.4rem', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', justifyContent: 'center' }}>
              <span className={`badge ${transporte.eudrCumplimiento ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.9rem' }}>
                {transporte.eudrCumplimiento ? '✓ EUDR' : '✗ EUDR'}
              </span>
              <span className={`badge ${transporte.pefcCumplimiento ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.9rem' }}>
                {transporte.pefcCumplimiento ? '✓ PEFC' : '✗ PEFC'}
              </span>
              <span className={`badge ${transporte.sureCumplimiento ? 'badge-success' : 'badge-danger'}`} style={{ fontSize: '0.85rem', padding: '0.35rem 0.9rem' }}>
                {transporte.sureCumplimiento ? '✓ SURE' : '✗ SURE'}
              </span>
            </div>
            <div style={{ marginTop: '0.5rem', textAlign: 'left', fontSize: '0.75rem', color: '#546E7A', display: 'flex', flexDirection: 'column', gap: '0.15rem' }}>
              <div>EUDR: {transporte.ddsOk === null ? 'DDS no evaluada' : transporte.ddsOk ? `✓ DDS ${transporte.referenciaDds ? `(${transporte.referenciaDds})` : ''}` : '✗ DDS pendiente'}</div>
              <div>PEFC: {transporte.cocPefcOk ? `✓ CoC ${transporte.referenciaCocPefc ? `(${transporte.referenciaCocPefc})` : ''}` : '✗ CoC pendiente'}</div>
              <div>SURE: {transporte.cocSureOk ? `✓ CoC ${transporte.referenciaCocSure ? `(${transporte.referenciaCocSure})` : ''}` : '✗ CoC pendiente'} {transporte.geiReduccionOk === null ? '| GEI no evaluado' : transporte.geiReduccionOk ? '| ✓ GEI' : '| ✗ GEI'}</div>
            </div>
          </div>
          <h3 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Código QR de trazabilidad</h3>
          <QRCanvas text={qrData} />
          <p className="text-muted" style={{ fontSize: '0.8rem', marginTop: '0.5rem' }}>
            Escanea para abrir el detalle del transporte
          </p>
          <button onClick={handleDownloadPDF} className="btn btn-primary btn-sm" style={{ marginTop: '0.75rem' }}>
            Imprimir QR (PDF)
          </button>
        </div>
      </div>

      {hasPesaje && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Pesaje y fotos</h3>
          <div className="card card-body">
            <div className="detail-grid">
              <div className="detail-item">
                <div className="detail-label">Peso bruto</div>
                <div className="detail-value">{transporte.pesoBrutoKg != null ? `${transporte.pesoBrutoKg} kg` : <span className="text-muted">(vacío)</span>}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Tara</div>
                <div className="detail-value">{transporte.taraKg != null ? `${transporte.taraKg} kg` : <span className="text-muted">(vacío)</span>}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Peso neto</div>
                <div className="detail-value">{transporte.pesoNetoKg != null ? `${transporte.pesoNetoKg} kg` : <span className="text-muted">(vacío)</span>}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">NÂº ticket</div>
                <div className="detail-value">{transporte.numeroTicket || <span className="text-muted">(vacío)</span>}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Fecha de pesaje</div>
                <div className="detail-value">{transporte.fechaPesaje || <span className="text-muted">(vacío)</span>}</div>
              </div>
              <div className="detail-item">
                <div className="detail-label">Hora de pesaje</div>
                <div className="detail-value">{transporte.horaPesaje || <span className="text-muted">(vacío)</span>}</div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', marginTop: '1rem' }}>
              {Object.keys(FOTO_PESAJE_LABEL).map((clave) => {
                const foto = transporte.fotos?.[clave as keyof typeof FOTO_PESAJE_LABEL];
                return (
                  <figure key={clave} style={{ margin: 0, maxWidth: '200px' }}>
                    {foto ? (
                      <img
                        src={foto}
                        alt={FOTO_PESAJE_LABEL[clave as keyof typeof FOTO_PESAJE_LABEL]}
                        style={{ width: '100%', borderRadius: '8px', border: '1px solid #E8EDF2', cursor: 'pointer' }}
                        onClick={() => setLightboxFoto(foto)}
                        title="Ampliar foto"
                      />
                    ) : (
                      <div className="text-muted" style={{ width: '200px', height: '120px', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px dashed #ccc', borderRadius: '8px' }}>
                        Sin foto
                      </div>
                    )}
                    <figcaption style={{ marginTop: '0.4rem', fontSize: '0.85rem', color: '#546E7A' }}>
                      {FOTO_PESAJE_LABEL[clave as keyof typeof FOTO_PESAJE_LABEL]}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {showRoute && (
        <div style={{ marginTop: '1.5rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
            <h3 style={{ margin: 0 }}>Ruta parcela → destino</h3>
            <div className={navegacionStyles.actions}>
              <button
                type="button"
                onClick={() => setShowGps((prev) => !prev)}
                className={`btn btn-sm ${showGps ? 'btn-primary' : 'btn-secondary'}`}
              >
                {showGps ? 'Ocultar GPS' : 'Cargar en GPS'}
              </button>
              <button
                type="button"
                onClick={() => setShowBasculas((prev) => !prev)}
                disabled={!routeCoords}
                className={`btn btn-sm ${showBasculas ? 'btn-primary' : 'btn-secondary'}`}
              >
                {showBasculas ? `Ocultar básculas${basculasCercanas.length ? ` (${basculasCercanas.length})` : ''}` : 'Mostrar básculas'}
              </button>
            </div>
          </div>
          {showGps && (
            <NavegacionRuta
              origen={parcelaCenter!}
              destino={centroPos!}
              basculas={basculasCercanas}
              nombreOrigen={transporte.parcelaNombre || transporte.parcelaId}
              nombreDestino={transporte.centroNombre || transporte.destino}
            />
          )}
          {routeInfo && (
            <div style={{ marginBottom: '0.5rem', fontSize: '0.9rem', color: '#455A64' }}>
              <strong>{routeInfo.distanceKm.toFixed(1)} km</strong> • <strong>{Math.round(routeInfo.durationMin)} min</strong> (estimado)
            </div>
          )}
          <div style={{ height: 300 }} className="map-container-box">
            <MapContainer center={mapCenter!} zoom={8} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={parcelaCenter!}><Popup>Parcela: {transporte.parcelaNombre || transporte.parcelaId}</Popup></Marker>
              <Marker position={centroPos!}><Popup>Destino: {transporte.centroNombre || transporte.destino}</Popup></Marker>
              <RoutingMachine waypoints={routeWaypoints!} onRouteFound={setRouteInfo} onRouteGeometry={setRouteCoords} />
              {showBasculas && <BasculasCapa basculas={basculas} />}
            </MapContainer>
          </div>
          {showBasculas && (
            <BasculasLista
              basculas={basculas}
              isLoading={basculasLoading}
              error={basculasError}
              origen={parcelaCenter}
              destino={centroPos}
            />
          )}
        </div>
      )}

      {lightboxFoto && (
        <div
          onClick={() => setLightboxFoto(null)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0, 0, 0, 0.85)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            cursor: 'zoom-out',
          }}
        >
          <img
            src={lightboxFoto}
            alt="Foto ampliada"
            style={{
              maxWidth: '90vw',
              maxHeight: '90vh',
              borderRadius: '8px',
              boxShadow: '0 4px 20px rgba(0, 0, 0, 0.5)',
            }}
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}

      <ConfirmDialog
        open={confirmDelete}
        title="Eliminar transporte"
        message="¿Eliminar este transporte? Esta acción no se puede deshacer."
        onConfirm={handleDelete}
        onCancel={() => setConfirmDelete(false)}
      />
    </div>
  );
};