import { useEffect, useRef } from 'react';

type QrScannerProps = {
  onResult: (value: string) => void;
  onError?: (message: string) => void;
  active?: boolean;
};

export function QrScanner({ onResult, onError, active = true }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const stoppedRef = useRef(false);

  useEffect(() => {
    if (!active) return;
    stoppedRef.current = false;
    let stream: MediaStream | null = null;
    let raf = 0;

    const start = async () => {
      if (!('BarcodeDetector' in window)) {
        onError?.('Tu navegador no soporta lectura de QR automatica. Introduce el codigo manualmente.');
        return;
      }
      type BarcodeDetectorInstance = { detect: (source: unknown) => Promise<Array<{ rawValue?: string }>> };
      const BarcodeDetectorCtor = (window as unknown as { BarcodeDetector?: new (init?: { formats?: string[] }) => BarcodeDetectorInstance }).BarcodeDetector;
      let detector: BarcodeDetectorInstance | null = null;
      try {
        if (!BarcodeDetectorCtor) throw new Error('no detector');
        detector = new BarcodeDetectorCtor({ formats: ['qr_code'] });
      } catch {
        onError?.('No se pudo inicializar el lector de QR.');
        return;
      }
      try {
        stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'environment' } });
      } catch {
        onError?.('No se pudo acceder a la camara. Comprueba los permisos.');
        return;
      }
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      const scan = async () => {
        if (stoppedRef.current) return;
        if (videoRef.current && videoRef.current.readyState >= 2) {
          try {
            const barcodes = await detector!.detect(videoRef.current);
            if (barcodes && barcodes.length > 0 && barcodes[0].rawValue) {
              stoppedRef.current = true;
              onResult(barcodes[0].rawValue);
              return;
            }
          } catch {
            // retry
          }
        }
        raf = requestAnimationFrame(scan);
      };
      raf = requestAnimationFrame(scan);
    };

    void start();
    return () => {
      stoppedRef.current = true;
      cancelAnimationFrame(raf);
      stream?.getTracks().forEach((track) => track.stop());
    };
  }, [active, onResult, onError]);

  return (
    <div style={{ position: 'relative', width: '100%', maxWidth: '420px', margin: '0 auto' }}>
      <video
        ref={videoRef}
        playsInline
        muted
        autoPlay
        style={{ width: '100%', borderRadius: '12px', background: '#000' }}
      />
      {!active && (
        <div style={{ position: 'absolute', inset: 0, display: 'grid', placeItems: 'center', background: 'rgba(0,0,0,.4)', borderRadius: '12px', color: '#fff' }}>
          Escaner pausado
        </div>
      )}
    </div>
  );
}