import { renderHook, waitFor } from '@testing-library/react';
import { useTransporte } from '../useTransporte';
import * as transporteApiService from '../../api/transporteApiService';
import type { Transporte } from '../../types/transporte.types';

vi.mock('../../api/transporteApiService');

const mockTransporte: Transporte = {
  id: 1,
  parcelaId: 'p1',
  camionMatricula: '1234ABC',
  camioneroDni: '12345678A',
  fechaCarga: '2026-01-15',
  toneladasCargadas: 10,
  tipoMadera: 'Pino',
  destino: 'Centro Madrid',
  eudrCumplimiento: true,
  eudrGeolocalizacionOk: true,
  eudrReferenciaCatastralOk: true,
  pefcCumplimiento: true,
  sureCumplimiento: true,
  codigoTrazabilidad: 'TRZ-001',
};

describe('useTransporte', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches transporte by id and returns data', async () => {
    vi.mocked(transporteApiService.fetchTransporte).mockResolvedValueOnce(mockTransporte);

    const { result } = renderHook(() => useTransporte(1));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transporte).toEqual(mockTransporte);
    expect(result.current.error).toBeNull();
  });

  it('sets error when id is undefined', async () => {
    const { result } = renderHook(() => useTransporte(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('ID no proporcionado');
    expect(result.current.transporte).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(transporteApiService.fetchTransporte).mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useTransporte(999));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Not found');
    expect(result.current.transporte).toBeNull();
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useTransporte(1));
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
