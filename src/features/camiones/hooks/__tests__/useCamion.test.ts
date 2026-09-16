import { renderHook, waitFor } from '@testing-library/react';
import { useCamion } from '../useCamion';
import * as camionApiService from '../../api/camionApiService';
import type { Camion } from '../../types/camion.types';

vi.mock('../../api/camionApiService');

const mockCamion: Camion = {
  matricula: '1234ABC',
  marca: 'Volvo',
  modelo: 'FH16',
  capacidadToneladas: 25,
  tara: 8.5,
  activo: true,
};

describe('useCamion', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches camion by matricula and returns data', async () => {
    vi.mocked(camionApiService.fetchCamion).mockResolvedValueOnce(mockCamion);

    const { result } = renderHook(() => useCamion('1234ABC'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.camion).toEqual(mockCamion);
    expect(result.current.error).toBeNull();
  });

  it('sets error when matricula is undefined', async () => {
    const { result } = renderHook(() => useCamion(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Matrícula no proporcionada');
    expect(result.current.camion).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(camionApiService.fetchCamion).mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useCamion('XXXXXXX'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Not found');
    expect(result.current.camion).toBeNull();
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useCamion('1234ABC'));
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
