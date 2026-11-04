import { describe, expect, it } from 'vitest';
import { getMinMax, preprocessPixelData, stretchContrast, toGrayscale } from '../imagePreprocess';

const pixel = (r: number, g: number, b: number, a = 255): number[] => [r, g, b, a];

describe('imagePreprocess', () => {
  describe('toGrayscale', () => {
    it('convierte un píxel rojo a gris (r === g === b)', () => {
      const data = new Uint8ClampedArray(pixel(255, 0, 0));
      toGrayscale(data);
      expect(data[0]).toBe(data[1]);
      expect(data[1]).toBe(data[2]);
      expect(data[0]).toBeGreaterThanOrEqual(70);
      expect(data[0]).toBeLessThanOrEqual(80);
      expect(data[3]).toBe(255);
    });
  });

  describe('getMinMax', () => {
    it('encuentra el mínimo y máximo del canal rojo', () => {
      const data = new Uint8ClampedArray([...pixel(30, 5, 5), ...pixel(220, 9, 9)]);
      expect(getMinMax(data)).toEqual([30, 220]);
    });
  });

  describe('stretchContrast', () => {
    it('estira el rango al 0..255', () => {
      const data = new Uint8ClampedArray([10, 10, 10, 255, 200, 200, 200, 255]);
      stretchContrast(data, 10, 200);
      expect(Math.round(data[0])).toBe(0);
      expect(Math.round(data[4])).toBe(255);
    });

    it('no divide por cero si el rango es nulo', () => {
      const data = new Uint8ClampedArray([128, 128, 128, 255]);
      stretchContrast(data, 128, 128);
      expect(data[0]).toBe(128);
    });
  });

  describe('preprocessPixelData', () => {
    it('aplica grises y estirado de contraste', () => {
      const data = new Uint8ClampedArray([...pixel(20, 10, 5), ...pixel(250, 0, 0)]);
      preprocessPixelData(data);
      expect(data[0]).toBe(data[1]);
      expect(data[1]).toBe(data[2]);
      expect(data[0]).toBe(0);
      expect(data[4]).toBe(data[5]);
      expect(data[4]).toBe(255);
    });
  });
});