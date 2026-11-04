import { useEffect, useRef, useState, type ChangeEvent } from 'react';
import { useCamera } from './useCamera';
import { captureVideoFrame, readImageFile } from './capture';
import type { CapturedImage } from './types';
import styles from '../../styles/CameraCapture.module.css';

type CameraCaptureProps = {
  onCapture: (image: CapturedImage) => void;
  onError?: (message: string) => void;
  buttonLabel?: string;
  color?: boolean;
  maxDimension?: number;
};

export const CameraCapture = ({
  onCapture,
  onError,
  buttonLabel = 'Tomar foto',
  color = false,
  maxDimension,
}: CameraCaptureProps) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { stream, liveAvailable, previewError, startLive, stopLive } = useCamera();
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (videoRef.current) videoRef.current.srcObject = stream;
  }, [stream]);

  const handleFile = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setBusy(true);
    try {
      const image = await readImageFile(file, color ? { preprocess: false, maxDimension } : {});
      onCapture(image);
    } catch (error) {
      onError?.(error instanceof Error ? error.message : 'No se pudo leer la imagen');
    } finally {
      setBusy(false);
    }
  };

  const handleLiveCapture = () => {
    if (!videoRef.current || !liveAvailable) return;
    setBusy(true);
    try {
      onCapture(captureVideoFrame(videoRef.current, { color, maxDimension }));
      stopLive();
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className={styles.wrapper}>
      <video
        ref={videoRef}
        className={`${styles.video} ${liveAvailable ? styles.visible : styles.hidden}`}
        muted
        playsInline
        autoPlay={Boolean(stream)}
      />
      {!liveAvailable && (
        <div className={styles.placeholder}>
          {previewError ? (
            <p className={styles.error}>{previewError}</p>
          ) : (
            <p className={styles.hint}>La foto se tomará con la cámara del dispositivo</p>
          )}
        </div>
      )}

      <div className={styles.actions}>
        <button type="button" className="btn btn-primary" onClick={() => inputRef.current?.click()} disabled={busy}>
          {busy ? 'Procesando...' : buttonLabel}
        </button>
        {liveAvailable && (
          <button type="button" className="btn" onClick={handleLiveCapture} disabled={busy}>
            Capturar desde vídeo
          </button>
        )}
        {!liveAvailable && (
          <button type="button" className="btn" onClick={() => void startLive()}>
            Usar cámara en vivo
          </button>
        )}
      </div>

      <input ref={inputRef} type="file" accept="image/*" capture="environment" hidden onChange={handleFile} />
    </div>
  );
};