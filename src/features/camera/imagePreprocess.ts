export const toGrayscale = (data: Uint8ClampedArray): void => {
  for (let i = 0; i < data.length; i += 4) {
    const gray = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    data[i] = gray;
    data[i + 1] = gray;
    data[i + 2] = gray;
  }
};

export const getMinMax = (data: Uint8ClampedArray, offset = 0): [number, number] => {
  let min = 255;
  let max = 0;
  for (let i = offset; i < data.length; i += 4) {
    const v = data[i];
    if (v < min) min = v;
    if (v > max) max = v;
  }
  return [min, max];
};

export const stretchContrast = (data: Uint8ClampedArray, min: number, max: number): void => {
  const range = max - min;
  if (range <= 0) return;
  for (let i = 0; i < data.length; i += 4) {
    const value = ((data[i] - min) / range) * 255;
    data[i] = value;
    data[i + 1] = value;
    data[i + 2] = value;
  }
};

export const preprocessPixelData = (data: Uint8ClampedArray): void => {
  toGrayscale(data);
  const [min, max] = getMinMax(data);
  stretchContrast(data, min, max);
};

const MAX_DIMENSION = 1600;

export const preprocessForOcr = (source: CanvasImageSource & { width: number; height: number }): HTMLCanvasElement => {
  const width = source instanceof HTMLVideoElement && source.videoWidth ? source.videoWidth : source.width;
  const height = source instanceof HTMLVideoElement && source.videoHeight ? source.videoHeight : source.height;
  const scale = Math.min(1, MAX_DIMENSION / Math.max(width, height));

  const canvas = document.createElement('canvas');
  canvas.width = Math.max(1, Math.round(width * scale));
  canvas.height = Math.max(1, Math.round(height * scale));

  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) return canvas;

  ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  preprocessPixelData(imageData.data);
  ctx.putImageData(imageData, 0, 0);

  return canvas;
};