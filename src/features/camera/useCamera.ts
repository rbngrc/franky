import { useCallback, useEffect, useRef, useState } from 'react';

export const useCamera = (): {
  stream: MediaStream | null;
  liveAvailable: boolean;
  previewError: string | null;
  startLive: () => Promise<void>;
  stopLive: () => void;
} => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [liveAvailable, setLiveAvailable] = useState(false);
  const [previewError, setPreviewError] = useState<string | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const stopLive = useCallback(() => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setStream(null);
    setLiveAvailable(false);
  }, []);

  const startLive = useCallback(async () => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setLiveAvailable(false);
      setPreviewError('La cámara en vivo no está disponible en este navegador');
      return;
    }
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } },
        audio: false,
      });
      streamRef.current = mediaStream;
      setStream(mediaStream);
      setLiveAvailable(true);
      setPreviewError(null);
    } catch (error) {
      setLiveAvailable(false);
      setPreviewError(error instanceof Error ? error.message : 'No se pudo acceder a la cámara');
    }
  }, []);

  useEffect(() => () => stopLive(), [stopLive]);

  return { stream, liveAvailable, previewError, startLive, stopLive };
};