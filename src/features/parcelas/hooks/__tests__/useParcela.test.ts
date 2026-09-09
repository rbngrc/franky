import { renderHook, waitFor } from '@testing-library/react';
import { useParcela } from '../useParcela';
import * as parcelaApiService from '../../api/parcelaApiService';
import type { Parcela } from '../../types/parcela.types';

vi.mock('../../api/parcelaApiService');

const mockParcela: Parcela = {
  id: '1',
  nombre: 'Parcela A',
  wktGeolocalizacion: null,
};

describe('useParcela', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches parcela by id and returns data', async () => {
    vi.mocked(parcelaApiService.fetchParcelaById).mockResolvedValueOnce(mockParcela);

    const { result } = renderHook(() => useParcela('1'));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.parcela).toEqual(mockParcela);
    expect(result.current.error).toBeNull();
  });

  it('sets error when id is undefined', async () => {
    const { result } = renderHook(() => useParcela(undefined));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('ID de parcela no proporcionado.');
    expect(result.current.parcela).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(parcelaApiService.fetchParcelaById).mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useParcela('999'));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Not found');
    expect(result.current.parcela).toBeNull();
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useParcela('1'));
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
