import { renderHook, waitFor } from '@testing-library/react';
import { useCamionero } from '../useCamionero';
import * as camioneroApiService from '../../api/camioneroApiService';
import type { Camionero } from '../../types/camionero.types';

vi.mock('../../api/camioneroApiService');

const mockCamionero: Camionero = {
  dni: '12345678A',
  nombre: 'Juan',
  apellidos: 'Garcia Lopez',
  telefono: '612345678',
  email: 'juan@test.com',
  numeroCarnet: 'C12345',
  activo: true,
};

describe('useCamionero', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches camionero by dni and returns data', async () => {
    vi.mocked(camioneroApiService.fetchCamionero).mockResolvedValueOnce(mockCamionero);

    const { result } = renderHook(() => useCamionero('12345678A'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.camionero).toEqual(mockCamionero);
    expect(result.current.error).toBeNull();
  });

  it('sets error when dni is undefined', async () => {
    const { result } = renderHook(() => useCamionero(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('DNI no proporcionado');
    expect(result.current.camionero).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(camioneroApiService.fetchCamionero).mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useCamionero('99999999Z'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Not found');
    expect(result.current.camionero).toBeNull();
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useCamionero('12345678A'));
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
