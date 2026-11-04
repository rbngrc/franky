import { afterEach, describe, expect, it, vi } from 'vitest';
import { downscaleForColor } from '../capture';

const drawMock = vi.fn();
const ctxStub = { drawImage: drawMock } as unknown as CanvasRenderingContext2D;

describe('downscaleForColor', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('reduce hasta el máximo indicado manteniendo proporción en color', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxStub);

    const canvas = downscaleForColor({ width: 4000, height: 3000 } as HTMLImageElement, 1600);

    expect(canvas.width).toBe(1600);
    expect(canvas.height).toBe(1200);
    expect(drawMock).toHaveBeenCalledTimes(1);
  });

  it('no agranda imágenes más pequeñas que el máximo', () => {
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(ctxStub);

    const canvas = downscaleForColor({ width: 800, height: 600 } as HTMLImageElement, 1600);

    expect(canvas.width).toBe(800);
    expect(canvas.height).toBe(600);
  });
});