import { useCallback, useEffect, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTransportes } from '../features/transportes/hooks/useTransportes';
import { LoadingIndicator } from '../components/LoadingIndicator';
import { QrScanner } from '../components/QrScanner';

export default function AgenteEscanearPage() {
  const navigate = useNavigate();
  const { transportes, isLoading, error, reload } = useTransportes();
  const [pendingCode, setPendingCode] = useState<string | null>(null);
  const [manual, setManual] = useState('');
  const [status, setStatus] = useState<string | null>(null);
  const handledRef = useRef(false);

  const resolverCodigo = useCallback(
    (code: string) => {
      const limpio = code.trim();
      const urlMatch = limpio.match(/\/transportes\/(\d+)/);
      if (urlMatch) {
        navigate(`/transportes/${urlMatch[1]}`);
        return;
      }
      if (/^\d+$/.test(limpio)) {
        navigate(`/transportes/${limpio}`);
        return;
      }
      const encontrado = transportes.find((t) => t.codigoTrazabilidad === limpio);
      if (encontrado) {
        navigate(`/transportes/${encontrado.id}`);
        return;
      }
      setStatus(`No se encontro un transporte para el codigo ${limpio}.`);
    },
    [navigate, transportes]
  );

  const handleResult = useCallback(
    (value: string) => {
      if (handledRef.current) return;
      handledRef.current = true;
      setStatus('Codigo QR detectado. Cargando transporte...');
      const urlMatch = value.trim().match(/\/transportes\/(\d+)/);
      if (urlMatch || /^\d+$/.test(value.trim())) {
        resolverCodigo(value);
        return;
      }
      if (transportes.length > 0) {
        resolverCodigo(value);
      } else {
        setPendingCode(value);
      }
    },
    [resolverCodigo, transportes.length]
  );

  const handleError = useCallback((message: string) => {
    setStatus(message);
  }, []);

  useEffect(() => {
    if (!pendingCode || isLoading) return;
    resolverCodigo(pendingCode);
    setPendingCode(null);
  }, [pendingCode, isLoading, resolverCodigo]);

  useEffect(() => {
    handledRef.current = false;
  }, []);

  return (
    <div className="page-container">
      <h1 className="page-title">Escaner QR (Agente)</h1>
      <p className="page-subtitle">
        Apunta la camara al QR del transporte para consultar y validar sus datos.
      </p>

      {status && <div className="error-box" style={{ background: '#E3F2FD', color: '#0D47A1' }}>{status}</div>}
      {error && <div className="error-box">{error}</div>}
      {isLoading && <LoadingIndicator />}

      <section style={{ marginBottom: '1.5rem' }}>
        <QrScanner onResult={handleResult} onError={handleError} active={!handledRef.current} />
      </section>

      <section>
        <h2 className="section-title">Entrada manual</h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            if (manual.trim()) {
              handledRef.current = false;
              setStatus(null);
              resolverCodigo(manual);
            }
          }}
          style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}
        >
          <input
            type="text"
            className="form-input"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            placeholder="Codigo de trazabilidad o ID"
            style={{ flex: 1, minWidth: '220px' }}
          />
          <button type="submit" className="btn btn-primary">
            Abrir transporte
          </button>
          <button type="button" className="btn btn-secondary" onClick={() => void reload()}>
            Recargar lista
          </button>
        </form>
      </section>
    </div>
  );
}