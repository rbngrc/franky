import { useEffect, useRef, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import QRCode from 'qrcode';
import { jsPDF } from 'jspdf';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import { useTransporte } from '../features/transportes/hooks/useTransporte';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { updateTransporte } from '../features/transportes/api/transporteApiService';
import { useParcela } from '../features/parcelas/hooks/useParcela';
import { useCentro } from '../features/centros/hooks/useCentro';
import { useParcelas } from '../features/parcelas/hooks/useParcelas';
import { useCamiones } from '../features/camiones/hooks/useCamiones';
import { useCamioneros } from '../features/camioneros/hooks/useCamioneros';
import { useCentros } from '../features/centros/hooks/useCentros';
import { RoutingMachine } from '../features/transportes/components/RoutingMachine';
import { TIPO_MADERA_OPTIONS, tipoMaderaLabel } from '../constants/madera';
import { parseWktCenter } from '../lib/geojson';
import { applyDefaultLeafletIcon } from '../lib/leafletIcon';

applyDefaultLeafletIcon();

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
  const { transporte, isLoading, error, reload } = useTransporte(id ? Number(id) : undefined);
  const { parcela } = useParcela(transporte?.parcelaId);
  const { centro } = useCentro(transporte?.centroId ?? null);
  const { parcelas } = useParcelas();
  const { camiones } = useCamiones();
  const { camioneros } = useCamioneros();
  const { centros } = useCentros();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    nombre: '',
    parcelaId: '', camionMatricula: '', camioneroDni: '',
    fechaCarga: '', toneladasCargadas: 0, tipoMadera: 'PINO',
    destino: '', centroId: undefined as number | undefined,
    parcelaReferenciaCatastral: '',
    ddsOk: null as boolean | null, referenciaDds: '',
    cocPefcOk: false, referenciaCocPefc: '',
    cocSureOk: false, geiReduccionOk: null as boolean | null, referenciaCocSure: '',
  });
  const [editError, setEditError] = useState<string | null>(null);

  const startEditing = () => {
    if (!transporte) return;
    setEditForm({
      nombre: transporte.nombre || '',
      parcelaId: transporte.parcelaId,
      camionMatricula: transporte.camionMatricula,
      camioneroDni: transporte.camioneroDni,
      fechaCarga: transporte.fechaCarga,
      toneladasCargadas: transporte.toneladasCargadas,
      tipoMadera: transporte.tipoMadera,
      destino: transporte.destino,
      centroId: transporte.centroId,
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

  const ef = (field: string, value: string | number | boolean | null | undefined) => setEditForm((p) => ({ ...p, [field]: value }));

  if (isLoading) return <LoadingIndicator />;
  if (error) return <p className="text-danger" style={{ padding: '1rem' }}>{error}</p>;
  if (!transporte) return <p style={{ padding: '1rem' }}>Transporte no encontrado.</p>;

  const handleDownloadPDF = async () => {
    const qrData = `${window.location.origin}/transportes/${transporte.id}`;

    const qrCanvas = document.createElement('canvas');
    QRCode.toCanvas(qrCanvas, qrData, { width: 150, margin: 1 });
    await new Promise<void>((resolve) => { setTimeout(resolve, 300); });

    const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' });
    const margin = 20;
    let y = margin;

    const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('es-ES') : '—';
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
      pdf.text(value || '—', margin + 3 + lw, y);
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
    writeField('Nombre:', transporte.nombre || `Transporte #${transporte.id}`);
    writeField('Código trazabilidad:', transporte.codigoTrazabilidad);
    writeField('Camión:', transporte.camionMatricula + (transporte.camionMarca ? ` (${transporte.camionMarca})` : ''));
    writeField('Camionero:', transporte.camioneroNombre || transporte.camioneroDni);
    writeField('Fecha de carga:', fmtDate(transporte.fechaCarga));
    writeField('Toneladas:', transporte.toneladasCargadas ? `${transporte.toneladasCargadas} t` : '—');
    writeField('Tipo de madera:', tipoMaderaLabel(transporte.tipoMadera) || '—');
    writeField('Destino:', transporte.centroNombre || transporte.destino || '—');
    y += 3;

    writeSection('ORIGEN');
    writeField('Parcela:', transporte.parcelaNombre || transporte.parcelaId);
    writeField('Municipio:', parcela?.municipio || '—');
    writeField('Provincia:', parcela?.provincia || '—');
    writeField('Referencia catastral:', transporte.parcelaReferenciaCatastral || '—');
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
  let mapCenter: [number, number] | null = null;
  if (parcelaCenter && centroPos) mapCenter = [(parcelaCenter[0] + centroPos[0]) / 2, (parcelaCenter[1] + centroPos[1]) / 2];
  else if (parcelaCenter) mapCenter = parcelaCenter;
  else if (centroPos) mapCenter = centroPos;

  return (
    <div className="page-container" style={{ maxWidth: '900px' }}>
      <Link to="/transportes" className="back-link">&larr; Volver a transportes</Link>

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
              {transporte.nombre || `Transporte #${transporte.id}`}
            </h1>
          )}
          <div style={{
            fontFamily: "'Courier New', monospace",
            fontSize: '1.15rem',
            fontWeight: 700,
            color: '#333',
            marginTop: '0.25rem',
            letterSpacing: '0.5px',
          }}>
            {transporte.codigoTrazabilidad}
          </div>
        </div>
        {!editing && (
          <button onClick={startEditing} className="btn btn-primary btn-sm">
            Editar
          </button>
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
                  {camiones.filter((c) => c.activo).map((c) => <option key={c.matricula} value={c.matricula}>{c.matricula} — {c.marca} {c.modelo}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Camionero *</label>
                <select value={editForm.camioneroDni} onChange={(e) => ef('camioneroDni', e.target.value)} className="form-select">
                  <option value="">Seleccionar camionero...</option>
                  {camioneros.filter((c) => c.activo).map((c) => <option key={c.dni} value={c.dni}>{c.dni} — {c.nombre} {c.apellidos}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Fecha de carga *</label>
                <input type="date" value={editForm.fechaCarga} onChange={(e) => ef('fechaCarga', e.target.value)} className="form-input" />
              </div>
              <div className="form-group">
                <label className="form-label">Toneladas cargadas</label>
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
                <label className="form-label">Referencia catastral de la parcela</label>
                <input type="text" value={editForm.parcelaReferenciaCatastral} onChange={(e) => ef('parcelaReferenciaCatastral', e.target.value)} className="form-input" />
              </div>
              <details style={{ margin: '0.75rem 0', border: '1px solid #E8EDF2', borderRadius: '8px', padding: '0.5rem' }}>
                <summary style={{ fontWeight: 600, cursor: 'pointer', color: '#0D47A1', fontSize: '0.9rem' }}>
                  ★ Certificaciones
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
                  <div className="detail-value">{transporte.parcelaNombre || transporte.parcelaId || <span className="text-muted">(vacío)</span>}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Camión</div>
                  <div className="detail-value">{transporte.camionMatricula}{transporte.camionMarca ? ` (${transporte.camionMarca})` : ''}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Camionero</div>
                  <div className="detail-value">{transporte.camioneroNombre || transporte.camioneroDni || <span className="text-muted">(vacío)</span>}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Fecha de carga</div>
                  <div className="detail-value">{new Date(transporte.fechaCarga).toLocaleDateString()}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Toneladas</div>
                  <div className="detail-value">{transporte.toneladasCargadas ? `${transporte.toneladasCargadas} t` : <span className="text-muted">(vacío)</span>}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Tipo de madera</div>
                  <div className="detail-value">{tipoMaderaLabel(transporte.tipoMadera) || <span className="text-muted">(vacío)</span>}</div>
                </div>
                <div className="detail-item">
                  <div className="detail-label">Destino</div>
                  <div className="detail-value">{transporte.centroNombre || transporte.destino || <span className="text-muted">(vacío)</span>}</div>
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
                  <div className="detail-value" style={{ fontSize: '0.8rem', wordBreak: 'break-all' }}>{transporte.parcelaWktGeolocalizacion || <span className="text-muted">(vacío)</span>}</div>
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

      {showRoute && (
        <div style={{ marginTop: '1.5rem' }}>
          <h3 style={{ marginBottom: '0.75rem' }}>Ruta parcela → destino</h3>
          <div style={{ height: 300 }} className="map-container-box">
            <MapContainer center={mapCenter!} zoom={8} style={{ height: '100%', width: '100%' }}>
              <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
              <Marker position={parcelaCenter!}><Popup>Parcela: {transporte.parcelaNombre || transporte.parcelaId}</Popup></Marker>
              <Marker position={centroPos!}><Popup>Destino: {transporte.centroNombre || transporte.destino}</Popup></Marker>
              <RoutingMachine waypoints={[parcelaCenter!, centroPos!]} />
            </MapContainer>
          </div>
        </div>
      )}
    </div>
  );
};
