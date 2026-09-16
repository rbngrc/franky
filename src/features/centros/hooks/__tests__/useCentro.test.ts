import { renderHook, waitFor } from '@testing-library/react';
import { useCentro } from '../useCentro';
import * as centroApiService from '../../api/centroApiService';
import type { Centro } from '../../types/centro.types';

vi.mock('../../api/centroApiService');

const mockCentro: Centro = {
  id: 1,
  nombre: 'Centro A',
  direccion: 'Calle Mayor 1',
  localidad: 'Madrid',
  tipo: 'Almacen',
  latitud: 40.4168,
  longitud: -3.7038,
  activo: true,
};

describe('useCentro', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches centro by id and returns data', async () => {
    vi.mocked(centroApiService.fetchCentroById).mockResolvedValueOnce(mockCentro);

    const { result } = renderHook(() => useCentro(1));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.centro).toEqual(mockCentro);
    expect(result.current.error).toBeNull();
  });

  it('sets null when id is null', async () => {
    const { result } = renderHook(() => useCentro(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.centro).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(centroApiService.fetchCentroById).mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useCentro(999));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Error al cargar el centro.');
    expect(result.current.centro).toBeNull();
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useCentro(1));
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
