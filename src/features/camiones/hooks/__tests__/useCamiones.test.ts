import { renderHook, waitFor } from '@testing-library/react';
import { useCamiones } from '../useCamiones';
import * as camionApiService from '../../api/camionApiService';
import type { Camion } from '../../types/camion.types';

vi.mock('../../api/camionApiService');

const mockCamiones: Camion[] = [
  { matricula: '1234ABC', marca: 'Mercedes', modelo: 'Actros', capacidadToneladas: 24, tara: 12000, activo: true },
  { matricula: '5678DEF', marca: 'Volvo', modelo: 'FH', capacidadToneladas: 20, tara: 11000, activo: false },
];

describe('useCamiones', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches camiones on mount and returns data', async () => {
    vi.mocked(camionApiService.fetchCamiones).mockResolvedValueOnce(mockCamiones);

    const { result } = renderHook(() => useCamiones());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.camiones).toEqual(mockCamiones);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(camionApiService.fetchCamiones).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCamiones());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Error al cargar camiones');
    expect(result.current.camiones).toEqual([]);
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useCamiones());
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
