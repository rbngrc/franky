import { describe, expect, it, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useTransportesOfflineFirst } from '../useTransportesOfflineFirst';
import * as transporteApiService from '../../api/transporteApiService';
import { db } from '../../../offline/db';
import type { Transporte } from '../../types/transporte.types';

vi.mock('../../api/transporteApiService');

const baseTransporte = (overrides: Partial<Transporte> & { id: number }): Transporte => ({
  parcelaId: 'p1',
  camionMatricula: '1234ABC',
  camioneroDni: '12345678A',
  fechaCarga: '2026-05-01',
  toneladasCargadas: 22,
  tipoMadera: 'ROBLE',
  destino: 'Madrid',
  eudrCumplimiento: true,
  eudrGeolocalizacionOk: true,
  eudrReferenciaCatastralOk: true,
  pefcCumplimiento: false,
  sureCumplimiento: false,
  codigoTrazabilidad: 'abc-123',
  ...overrides,
});

describe('useTransportesOfflineFirst', () => {
  beforeEach(async () => {
    vi.clearAllMocks();
    await db.transportesCache.clear();
  });

  it('carga desde la API y cachea el resultado', async () => {
    const mockTransportes = [baseTransporte({ id: 1 }), baseTransporte({ id: 2 })];
    vi.mocked(transporteApiService.fetchTransportes).mockResolvedValue(mockTransportes);

    const { result } = renderHook(() => useTransportesOfflineFirst());

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transportes).toEqual(mockTransportes);
    expect(result.current.fromCache).toBe(false);
    expect(result.current.error).toBeNull();
    expect(await db.transportesCache.count()).toBe(2);
  });

  it('usa la caché cuando la API falla y hay datos locales', async () => {
    vi.mocked(transporteApiService.fetchTransportes).mockRejectedValue(new Error('Network error'));
    await db.transportesCache.bulkPut([
      { ...baseTransporte({ id: 1, destino: 'Segovia' }), cachedAt: Date.now() },
    ]);

    const { result } = renderHook(() => useTransportesOfflineFirst());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transportes).toEqual([expect.objectContaining({ id: 1, destino: 'Segovia' })]);
    expect(result.current.fromCache).toBe(true);
    expect(result.current.error).toBeNull();
  });

  it('informa sin conexión y sin datos cuando no hay caché', async () => {
    vi.mocked(transporteApiService.fetchTransportes).mockRejectedValue(new Error('Network error'));

    const { result } = renderHook(() => useTransportesOfflineFirst());

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.transportes).toEqual([]);
    expect(result.current.fromCache).toBe(false);
    expect(result.current.error).toBe('Sin conexión y sin datos locales');
  });
});