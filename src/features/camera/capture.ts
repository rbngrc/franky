import { preprocessForOcr } from './imagePreprocess';
import type { CapturedImage } from './types';

export const generateImageId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export const fileToDataUrl = (file: Blob): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(reader.error ?? new Error('No se pudo leer la imagen'));
    reader.readAsDataURL(file);
  });

const loadImage = (src: string): Promise<HTMLImageElement> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    image.src = src;
  });

const canvasToCapturedImage = (canvas: HTMLCanvasElement, name: string): CapturedImage => ({
  id: generateImageId(),
  name,
  dataUrl: canvas.toDataURL('image/jpeg', 0.85),
  width: canvas.width,
  height: canvas.height,
});

const sourceSize = (
  source: CanvasImageSource & { width: number; height: number },
): { width: number; height: number } => {
  if (source instanceof HTMLVideoElement) {
    return { width: source.videoWidth || source.width, height: source.videoHeight || source.height };
  }
  return { width: source.width, height: source.height };
};

export const downscaleForColor = (
  source: CanvasImageSource & { width: number; height: number },
  maxDimension = 1600,
): HTMLCanvasElement => {
  const { width, height } = sourceSize(source);
  const scale = Math.min(1, maxDimension / Math.max(width, height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const ctx = canvas.getContext('2d');
  if (ctx) ctx.drawImage(source, 0, 0, canvas.width, canvas.height);

  return canvas;
};

export const captureVideoFrame = (
  video: HTMLVideoElement,
  options: { color?: boolean; maxDimension?: number } = {},
): CapturedImage => {
  const canvas = options.color
    ? downscaleForColor(video, options.maxDimension ?? 1600)
    : preprocessForOcr(video);
  if (video.paused) video.play().catch(() => undefined);
  return canvasToCapturedImage(canvas, `captura-video-${Date.now()}.jpg`);
};

export const readImageFile = async (
  file: File,
  options: { preprocess?: boolean; maxDimension?: number } = {},
): Promise<CapturedImage> => {
  const dataUrl = await fileToDataUrl(file);
  const image = await loadImage(dataUrl);

  if (options.preprocess === false) {
    if (options.maxDimension) {
      const canvas = downscaleForColor(image, options.maxDimension);
      return canvasToCapturedImage(canvas, file.name);
    }
    return {
      id: generateImageId(),
      name: file.name,
      dataUrl,
      width: image.naturalWidth,
      height: image.naturalHeight,
    };
  }

  const canvas = preprocessForOcr(image);
  return canvasToCapturedImage(canvas, file.name);
};