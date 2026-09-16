import { renderHook, waitFor } from '@testing-library/react';
import { useProveedor } from '../useProveedor';
import * as proveedorApiService from '../../api/proveedorApiService';
import type { Proveedor } from '../../types/proveedor.types';

vi.mock('../../api/proveedorApiService');

const mockProveedor: Proveedor = {
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
};

describe('useProveedor', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches proveedor by id and returns data', async () => {
    vi.mocked(proveedorApiService.fetchProveedor).mockResolvedValueOnce(mockProveedor);

    const { result } = renderHook(() => useProveedor(1));

    expect(result.current.isLoading).toBe(true);

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.proveedor).toEqual(mockProveedor);
    expect(result.current.error).toBeNull();
  });

  it('sets null when id is null', async () => {
    const { result } = renderHook(() => useProveedor(null));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.proveedor).toBeNull();
    expect(result.current.error).toBeNull();
  });

  it('sets error on fetch failure', async () => {
    vi.mocked(proveedorApiService.fetchProveedor).mockRejectedValueOnce(new Error('Not found'));

    const { result } = renderHook(() => useProveedor(999));

    await waitFor(() => expect(result.current.isLoading).toBe(false));

    expect(result.current.error).toBe('Error al cargar el proveedor');
    expect(result.current.proveedor).toBeNull();
  });

  it('aborts request on unmount', () => {
    const abortSpy = vi.spyOn(AbortController.prototype, 'abort');
    const { unmount } = renderHook(() => useProveedor(1));
    unmount();
    expect(abortSpy).toHaveBeenCalled();
  });
});
