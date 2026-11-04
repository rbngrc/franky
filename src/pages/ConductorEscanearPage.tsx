import { useEffect, useRef, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { fetchTransporte } from '../features/transportes/api/transporteApiService';
import { getCachedTransportes } from '../features/offline/transportesCache';
import { useOffline } from '../features/offline/OfflineProvider';
import { CameraCapture, type CapturedImage } from '../features/camera';
import { parsePlate } from '../features/ocr/parsePlate';
import { parseWeighingTicket } from '../features/ocr/parseWeighingTicket';
import { saveCapturaTransporte, FOTOS_OBLIGATORIAS, tieneTodasLasFotos } from '../features/pesaje/captureService';
import type { CapturaDraft, FotoClave } from '../features/pesaje/types/captura.types';
import type { Transporte } from '../features/transportes/types/transporte.types';
import { LoadingIndicator } from '../components/LoadingIndicator';
import styles from '../styles/CamioneroEscanear.module.css';

type Step = 'capturar' | 'review';

const FOTO_LABEL: Record<FotoClave, string> = {
  frente: 'Camión de frente',
  trasera: 'Camión desde atrás',
  lateral: 'Camión de lado',
  ticket: 'Ticket de pesaje',
};

const FOTO_HINT: Record<FotoClave, string> = {
  frente: 'Foto completa del camión, se usará para leer la matrícula',
  trasera: 'Foto de la parte trasera del camión',
  lateral: 'Foto de un lateral del camión',
  ticket: 'Coloca el ticket de pesaje plano, que se lea bien',
};

const EMPTY_DRAFT: CapturaDraft = {
  matricula: '',
  pesoNetoKg: null,
  pesoBrutoKg: null,
  taraKg: null,
  numeroTicket: '',
  fecha: '',
  hora: '',
  fotos: {},
};

const ConductorEscanearPage = () => {
  const { transporteId } = useParams<{ transporteId: string }>();
  const { isOnline, pendingCount, syncNow } = useOffline();

  const [transporte, setTransporte] = useState<Transporte | null>(null);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [step, setStep] = useState<Step>('capturar');
  const [fotoActual, setFotoActual] = useState<FotoClave>('frente');
  const [draft, setDraft] = useState<CapturaDraft>(EMPTY_DRAFT);
  const [ocrWorking, setOcrWorking] = useState(false);
  const [ocrStatus, setOcrStatus] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [confidences, setConfidences] = useState<number[]>([]);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const capturaEnCurso = useRef(false);

  useEffect(() => {
    const id = Number(transporteId);
    if (Number.isNaN(id)) {
      setLoadError('Transporte no válido');
      setLoading(false);
      return;
    }
    const ac = new AbortController();
    (async () => {
      try {
        const data = await fetchTransporte(id, ac.signal);
        if (!ac.signal.aborted) setTransporte(data);
      } catch {
        if (ac.signal.aborted) return;
        const cached = await getCachedTransportes();
        const found = cached.find((c) => c.id === id);
        if (found) setTransporte(found);
        else setLoadError('No se pudo cargar el transporte');
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [transporteId]);

  const updateDraft = (key: keyof CapturaDraft, value: string | number | null) => {
    setDraft((prev) => ({ ...prev, [key]: value }));
  };

  const setFoto = (clave: FotoClave, dataUrl: string) => {
    setDraft((prev) => ({ ...prev, fotos: { ...prev.fotos, [clave]: dataUrl } }));
  };

  const handleCapture = async (captura: CapturedImage) => {
    if (capturaEnCurso.current) return;
    capturaEnCurso.current = true;
    const clave = fotoActual;
    setErrorMessage(null);
    setOcrStatus(null);
    setFoto(clave, captura.dataUrl);

    if (clave === 'frente') {
      setOcrWorking(true);
      setOcrStatus('Leyendo la matrícula de la foto de frente...');
      try {
        const { recognizePlate } = await import('../features/ocr/tesseractClient');
        const text = await recognizePlate(captura.dataUrl);
        const plate = parsePlate(text);
        if (plate) {
          setDraft((prev) => ({ ...prev, matricula: plate.formatted }));
          setConfidences((prev) => [...prev, plate.confidence]);
          setOcrStatus(`Matrícula detectada: ${plate.formatted}`);
        } else {
          setOcrStatus('No se detectó matrícula; puedes escribirla en la revisión.');
        }
      } catch {
        setErrorMessage('No se pudo leer la matrícula');
      } finally {
        setOcrWorking(false);
      }
    } else if (clave === 'ticket') {
      setOcrWorking(true);
      setOcrStatus('Leyendo el ticket de pesaje...');
      try {
        const { ocrImage } = await import('../features/ocr/tesseractClient');
        const text = await ocrImage(captura.dataUrl);
        const parsed = parseWeighingTicket(text);
        const confs: number[] = [];
        const next: CapturaDraft = { ...EMPTY_DRAFT };
        if (parsed.matricula) {
          next.matricula = parsed.matricula.value;
          confs.push(parsed.matricula.confidence);
        }
        if (parsed.pesoBrutoKg) {
          next.pesoBrutoKg = parsed.pesoBrutoKg.value;
          confs.push(parsed.pesoBrutoKg.confidence);
        }
        if (parsed.taraKg) {
          next.taraKg = parsed.taraKg.value;
          confs.push(parsed.taraKg.confidence);
        }
        if (parsed.pesoNetoKg) {
          next.pesoNetoKg = parsed.pesoNetoKg.value;
          confs.push(parsed.pesoNetoKg.confidence);
        }
        if (parsed.numeroTicket?.value) {
          next.numeroTicket = parsed.numeroTicket.value;
          confs.push(parsed.numeroTicket.confidence);
        }
        if (parsed.fecha?.value) {
          next.fecha = parsed.fecha.value;
          confs.push(parsed.fecha.confidence);
        }
        if (parsed.hora?.value) {
          next.hora = parsed.hora.value;
          confs.push(parsed.hora.confidence);
        }
        setConfidences((prev) => [...prev, ...confs]);
        setDraft((prev) => ({ ...prev, ...next, fotos: prev.fotos }));
        setOcrStatus('Ticket leído. Revisa y corrige los datos antes de guardar.');
      } catch {
        setErrorMessage('No se pudo leer el ticket');
      } finally {
        setOcrWorking(false);
      }
    }

    const fotosAhora = { ...draft.fotos, [clave]: captura.dataUrl };
    const pendientes = FOTOS_OBLIGATORIAS.filter((c) => !fotosAhora[c]);
    capturaEnCurso.current = false;
    if (pendientes.length === 0) {
      setStep('review');
    } else if (pendientes[0] !== clave) {
      setFotoActual(pendientes[0]);
    }
  };

  const irAFoto = (clave: FotoClave) => {
    setFotoActual(clave);
    setStep('capturar');
    setOcrStatus(null);
    setErrorMessage(null);
  };

  const handleSave = async () => {
    if (!transporte || !tieneTodasLasFotos(draft.fotos)) return;
    setSaving(true);
    setErrorMessage(null);
    const ocrConfidence =
      confidences.length > 0
        ? confidences.reduce((acc, value) => acc + value, 0) / confidences.length
        : 0.6;
    try {
      await saveCapturaTransporte({
        transporteId: transporte.id,
        parcelaId: transporte.parcelaId,
        camionMatricula: transporte.camionMatricula,
        camioneroDni: transporte.camioneroDni,
        fechaCarga: transporte.fechaCarga,
        toneladasCargadas: transporte.toneladasCargadas,
        tipoMadera: transporte.tipoMadera,
        destino: transporte.destino,
        centroId: transporte.centroId,
        parcelaReferenciaCatastral: transporte.parcelaReferenciaCatastral,
        matricula: draft.matricula,
        pesoNetoKg: draft.pesoNetoKg,
        pesoBrutoKg: draft.pesoBrutoKg,
        taraKg: draft.taraKg,
        numeroTicket: draft.numeroTicket || null,
        fecha: draft.fecha || null,
        hora: draft.hora || null,
        fotos: draft.fotos,
        ocrConfidence,
      });
      setSaved(true);
      if (isOnline) {
        await syncNow();
      }
    } catch {
      setErrorMessage('No se pudo guardar el transporte');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <LoadingIndicator />;

  return (
    <div className="page-container camionero-scan">
      <Link to="/conductor" className="back-link" style={{ marginBottom: '0.5rem' }}>
        &larr; Volver
      </Link>
      {loadError && !transporte && <div className="error-box">{loadError}</div>}

      {!loadError && transporte && (
        <>
          <h1 className="page-title" style={{ marginBottom: '0.25rem' }}>
            ★ Escáner transporte #{transporte.id}
          </h1>
          <p className="page-subtitle" style={{ marginBottom: '1rem' }}>
            {transporte.camionMatricula} · {transporte.destino || transporte.centroNombre || 'Sin destino'} ·{' '}
            {transporte.parcelaNombre || transporte.parcelaId}
          </p>

          {errorMessage && <div className="error-box">{errorMessage}</div>}

          {saved && (
            <div className={styles.successBox}>
              <strong>Transporte guardado.</strong> Se sincronizará automáticamente cuando el dispositivo tenga
              conexión ({pendingCount} pendiente{pendingCount !== 1 ? 's' : ''}).
              <div className={styles.successActions}>
                <Link to={`/transportes/${transporte.id}`} className="btn btn-primary">
                  Ver transporte actualizado
                </Link>
                <Link to="/conductor" className="btn btn-secondary">
                  Volver a mis transportes
                </Link>
              </div>
            </div>
          )}

          {!saved && step === 'capturar' && (
            <section className={styles.section}>
              <div style={{ display: 'flex', gap: '0.4rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                {FOTOS_OBLIGATORIAS.map((clave) => (
                  <button
                    key={clave}
                    type="button"
                    onClick={() => {
                      setFotoActual(clave);
                      setOcrStatus(null);
                      setErrorMessage(null);
                    }}
                    className={fotoActual === clave ? 'btn btn-primary btn-sm' : 'btn btn-secondary btn-sm'}
                    style={{ position: 'relative' }}
                  >
                    {FOTO_LABEL[clave]}
                    {draft.fotos[clave] && (
                      <span style={{ marginLeft: '0.35rem', color: '#2e7d32' }}>OK</span>
                    )}
                  </button>
                ))}
              </div>
              <div className={styles.stepBar}>
                <span className={styles.stepCount}>
                  Foto {FOTOS_OBLIGATORIAS.indexOf(fotoActual) + 1}/{FOTOS_OBLIGATORIAS.length}
                </span>
                <span className={styles.stepLabel}>{FOTO_LABEL[fotoActual]}</span>
              </div>
              <p className={styles.stepHint}>{FOTO_HINT[fotoActual]}</p>

              <div className={styles.scanner}>
                <CameraCapture
                  key={fotoActual}
                  color
                  buttonLabel={`Tomar ${FOTO_LABEL[fotoActual].toLowerCase()}`}
                  onCapture={handleCapture}
                  onError={setErrorMessage}
                />
              </div>

              {ocrWorking && <div className={styles.ocrStatus}>{ocrStatus}</div>}
              {!ocrWorking && ocrStatus && <div className={styles.ocrStatus}>{ocrStatus}</div>}

              {tieneTodasLasFotos(draft.fotos) && (
                <div style={{ marginTop: '0.75rem' }}>
                  <button type="button" className="btn btn-primary" onClick={() => setStep('review')}>
                    Revisar y guardar
                  </button>
                </div>
              )}
            </section>
          )}

          {!saved && step === 'review' && (
            <>
              <section className={styles.section}>
                <h2 className="section-title">★ Fotos</h2>
                <div className={styles.photoGrid}>
                  {FOTOS_OBLIGATORIAS.map((clave) => (
                    <div key={clave} className={styles.photoCard}>
                      <img className={styles.thumb} src={draft.fotos[clave]} alt={FOTO_LABEL[clave]} />
                      <div className={styles.photoMeta}>
                        <span className={styles.photoLabel}>{FOTO_LABEL[clave]}</span>
                        <button type="button" className="btn btn-sm" onClick={() => irAFoto(clave)}>
                          Retomar
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </section>

              <section className={styles.section}>
                <h2 className="section-title">★ Revisión de datos</h2>
                {confidences.length > 0 && (
                  <p className={styles.confidence}>
                    Confianza OCR:{' '}
                    {Math.round((confidences.reduce((a, b) => a + b, 0) / confidences.length) * 100)}%
                  </p>
                )}
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    void handleSave();
                  }}
                >
                  <div className={styles.formGrid}>
                    <label className={styles.field}>
                      Matrícula
                      <input className="form-input" value={draft.matricula} onChange={(e) => updateDraft('matricula', e.target.value)} placeholder="1234 ABC" />
                    </label>
                    <label className={styles.field}>
                      Peso bruto (kg)
                      <input className="form-input" type="number" value={draft.pesoBrutoKg ?? ''} onChange={(e) => updateDraft('pesoBrutoKg', e.target.value === '' ? null : Number(e.target.value))} placeholder="26780" />
                    </label>
                    <label className={styles.field}>
                      Tara (kg)
                      <input className="form-input" type="number" value={draft.taraKg ?? ''} onChange={(e) => updateDraft('taraKg', e.target.value === '' ? null : Number(e.target.value))} placeholder="13500" />
                    </label>
                    <label className={styles.field}>
                      Peso neto (kg)
                      <input className="form-input" type="number" value={draft.pesoNetoKg ?? ''} onChange={(e) => updateDraft('pesoNetoKg', e.target.value === '' ? null : Number(e.target.value))} placeholder="13280" />
                    </label>
                    <label className={styles.field}>
                      Nº ticket
                      <input className="form-input" value={draft.numeroTicket} onChange={(e) => updateDraft('numeroTicket', e.target.value)} placeholder="001234" />
                    </label>
                    <label className={styles.field}>
                      Fecha (DD/MM/AAAA)
                      <input className="form-input" value={draft.fecha} onChange={(e) => updateDraft('fecha', e.target.value)} placeholder="12/05/2026" />
                    </label>
                    <label className={styles.field}>
                      Hora (HH:MM)
                      <input className="form-input" value={draft.hora} onChange={(e) => updateDraft('hora', e.target.value)} placeholder="08:45" />
                    </label>
                  </div>
                  <p className={styles.offlineNote}>
                    {isOnline
                      ? 'El transporte se sincronizará al guardar.'
                      : 'Estás sin conexión: se guardará en el dispositivo y se sincronizará al recuperar cobertura.'}
                  </p>
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={saving || !tieneTodasLasFotos(draft.fotos)}
                  >
                    {tieneTodasLasFotos(draft.fotos)
                      ? saving
                        ? 'Guardando...'
                        : 'Guardar transporte'
                      : 'Faltan fotos por completar'}
                  </button>
                </form>
              </section>
            </>
          )}
        </>
      )}
    </div>
  );
}
export default ConductorEscanearPage;
