import { renderHook, waitFor } from '@testing-library/react';
import { useCentros } from '../useCentros';
import * as centroApiService from '../../api/centroApiService';
import type { Centro } from '../../types/centro.types';

vi.mock('../../api/centroApiService');

const mockCentros: Centro[] = [
  {
    id: 1,
    nombre: 'Centro A',
    direccion: 'Calle Mayor 1',
    localidad: 'Madrid',
    tipo: 'Almacen',
    latitud: 40.4168,
    longitud: -3.7038,
    activo: true,
  },
  {
    id: 2,
    nombre: 'Centro B',
    direccion: 'Calle Secundaria 2',
    localidad: 'Barcelona',
    tipo: 'Planta',
    latitud: 41.3851,
    longitud: 2.1734,
    activo: false,
  },
];

describe('useCentros', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches centros and returns data', async () => {
    vi.mocked(centroApiService.fetchCentros).mockResolvedValueOnce(mockCentros);

    const { result } = renderHook(() => useCentros());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.centros).toEqual(mockCentros);
    expect(result.current.error).toBeNull();
  });

  it('returns empty array on empty response', async () => {
    vi.mocked(centroApiService.fetchCentros).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useCentros());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.centros).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(centroApiService.fetchCentros).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useCentros());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Error al cargar centros.');
    expect(result.current.centros).toEqual([]);
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useCentros());
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
