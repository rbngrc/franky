import { renderHook, waitFor } from '@testing-library/react';
import { useParcelas } from '../useParcelas';
import * as parcelaApiService from '../../api/parcelaApiService';
import type { PaginatedParcelasResponse, Parcela } from '../../types/parcela.types';

vi.mock('../../api/parcelaApiService');

const mockParcelas: Parcela[] = [
  { id: '1', nombre: 'Parcela A', wktGeolocalizacion: null },
  { id: '2', nombre: 'Parcela B', wktGeolocalizacion: null },
];

const mockResponse: PaginatedParcelasResponse = {
  content: mockParcelas,
  totalPages: 1,
  totalElements: 2,
  size: 100,
  number: 0,
};

describe('useParcelas', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches parcelas on mount and returns data', async () => {
    vi.mocked(parcelaApiService.fetchParcelas).mockResolvedValueOnce(mockResponse);

    const { result } = renderHook(() => useParcelas());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.parcelas).toEqual(mockParcelas);
    expect(result.current.totalParcelas).toBe(2);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(parcelaApiService.fetchParcelas).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useParcelas());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Error al cargar parcelas.');
    expect(result.current.parcelas).toEqual([]);
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useParcelas());
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
