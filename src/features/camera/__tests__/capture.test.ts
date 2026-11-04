import { describe, expect, it } from 'vitest';
import { fileToDataUrl, generateImageId } from '../capture';

describe('capture', () => {
  it('genera ids únicos', () => {
    expect(generateImageId()).not.toBe(generateImageId());
  });

  it('convierte un archivo en data URL', async () => {
    const blob = new Blob(['hola'], { type: 'text/plain' });
    const dataUrl = await fileToDataUrl(blob);
    expect(dataUrl.startsWith('data:text/plain;base64,')).toBe(true);
  });

  it('rechaza si el lector falla', async () => {
    await expect(fileToDataUrl(null as unknown as Blob)).rejects.toBeTruthy();
  });
});