import { renderHook, waitFor } from '@testing-library/react';
import { useProveedores } from '../useProveedores';
import * as proveedorApiService from '../../api/proveedorApiService';
import type { Proveedor } from '../../types/proveedor.types';

vi.mock('../../api/proveedorApiService');

const mockProveedores: Proveedor[] = [
  {
    id: 1,
    nombre: 'Proveedor A',
    tipoDocumento: 'NIF',
    numeroDocumento: 'B12345678',
    direccion: 'Calle Industrial 10',
    telefono: '912345678',
    email: 'proveedor@test.com',
    paisOrigen: 'España',
    regionOrigen: 'Madrid',
    activo: true,
  },
  {
    id: 2,
    nombre: 'Proveedor B',
    tipoDocumento: 'CIF',
    numeroDocumento: 'A87654321',
    direccion: 'Avenida Principal 5',
    telefono: '934567890',
    email: 'proveedor2@test.com',
    paisOrigen: 'Francia',
    regionOrigen: 'Lyon',
    activo: false,
  },
];

describe('useProveedores', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches proveedores and returns data', async () => {
    vi.mocked(proveedorApiService.fetchProveedores).mockResolvedValueOnce(mockProveedores);

    const { result } = renderHook(() => useProveedores());

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.proveedores).toEqual(mockProveedores);
    expect(result.current.error).toBeNull();
  });

  it('returns empty array on empty response', async () => {
    vi.mocked(proveedorApiService.fetchProveedores).mockResolvedValueOnce([]);

    const { result } = renderHook(() => useProveedores());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.proveedores).toEqual([]);
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(proveedorApiService.fetchProveedores).mockRejectedValueOnce(new Error('Network error'));

    const { result } = renderHook(() => useProveedores());

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Error al cargar proveedores');
    expect(result.current.proveedores).toEqual([]);
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useProveedores());
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
