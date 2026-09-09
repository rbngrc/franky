import { renderHook, waitFor } from '@testing-library/react';
import { useTransportes } from '../useTransportes';
import * as transporteApiService from '../../api/transporteApiService';
import type { Transporte } from '../../types/transporte.types';

vi.mock('../../api/transporteApiService');

const mockTransportes: Transporte[] = [
  {
    id: 1, parcelaId: 'p1', camionMatricula: '1234ABC', camioneroDni: '12345678A',
    fechaCarga: '2026-05-01', toneladasCargadas: 22, tipoMadera: 'ROBLE',
    destino: 'Madrid', eudrCumplimiento: true, codigoTrazabilidad: 'abc-123',
  },
  {
    id: 2, parcelaId: 'p2', camionMatricula: '5678DEF', camioneroDni: '87654321B',
    fechaCarga: '2026-05-02', toneladasCargadas: 18, tipoMadera: 'PINO',
    destino: 'Barcelona', eudrCumplimiento: false, codigoTrazabilidad: 'def-456',
  },
];

describe('useTransportes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches transportes on mount and returns data', async () => {
    vi.mocked(transporteApiService.fetchTransportes).mockResolvedValueOnce(mockTransportes);

    const { result } = renderHook(() => useTransportes());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.transportes).toEqual(mockTransportes);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(transporteApiService.fetchTransportes).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useTransportes());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Error al cargar transportes');
    expect(result.current.transportes).toEqual([]);
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useTransportes());
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
