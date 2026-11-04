import { createWorker, OEM, PSM, type Worker } from 'tesseract.js';
import { preprocessForOcr } from '../camera/imagePreprocess';
import type { ImageInput } from './types';

const LANG = 'spa';
const LANG_PATH = (import.meta.env.VITE_TESSERACT_LANG_PATH as string | undefined) ?? '';
const CORE_PATH = (import.meta.env.VITE_TESSERACT_CORE_PATH as string | undefined) ?? '';
const WORKER_PATH = (import.meta.env.VITE_TESSERACT_WORKER_PATH as string | undefined) ?? '';

let workerPromise: Promise<Worker> | null = null;

const dataUrlToPreprocessedDataUrl = (dataUrl: string): Promise<string> =>
  new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => {
      const canvas = preprocessForOcr(image);
      resolve(canvas.toDataURL('image/png'));
    };
    image.onerror = () => reject(new Error('No se pudo cargar la imagen'));
    image.src = dataUrl;
  });

const prepareOcrInput = async (image: ImageInput): Promise<ImageInput> => {
  if (typeof image === 'string' && image.startsWith('data:image/')) {
    return dataUrlToPreprocessedDataUrl(image);
  }
  return image;
};

export const getTesseractWorker = (): Promise<Worker> => {
  if (!workerPromise) {
    workerPromise = createWorker(LANG, OEM.LSTM_ONLY, {
      ...(LANG_PATH ? { langPath: LANG_PATH } : {}),
      ...(CORE_PATH ? { corePath: CORE_PATH } : {}),
      ...(WORKER_PATH ? { workerPath: WORKER_PATH } : {}),
      logger: (message) => {
        if (import.meta.env.DEV) {
          console.debug(`[tesseract] ${message.status} ${Math.round(message.progress * 100)}%`);
        }
      },
    }).catch((error) => {
      workerPromise = null;
      throw error;
    });
  }
  return workerPromise;
};

export const terminateTesseract = async (): Promise<void> => {
  if (workerPromise) {
    const worker = await workerPromise;
    await worker.terminate();
    workerPromise = null;
  }
};

export const ocrImage = async (image: ImageInput, options?: { psm?: PSM }): Promise<string> => {
  const worker = await getTesseractWorker();
  await worker.setParameters({ tessedit_char_whitelist: '', tessedit_pageseg_mode: options?.psm });
  const { data } = await worker.recognize(await prepareOcrInput(image));
  return data.text;
};

export const recognizePlate = async (image: ImageInput): Promise<string> => {
  const worker = await getTesseractWorker();
  await worker.setParameters({
    tessedit_char_whitelist: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789',
  });
  const { data } = await worker.recognize(await prepareOcrInput(image));
  return data.text;
};