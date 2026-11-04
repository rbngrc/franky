import { beforeEach, describe, expect, it } from 'vitest';
import { db } from '../db';
import { clearTransportesCache, getCachedTransportes, saveTransportesToCache } from '../transportesCache';
import type { Transporte } from '../../transportes/types/transporte.types';

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

describe('transportesCache', () => {
  beforeEach(async () => {
    await db.transportesCache.clear();
  });

  it('guarda y recupera transportes con marca de tiempo', async () => {
    const transportes = [baseTransporte({ id: 1 }), baseTransporte({ id: 2 })];

    await saveTransportesToCache(transportes);
    const cached = await getCachedTransportes();

    expect(cached).toHaveLength(2);
    expect(cached.every((c) => typeof c.cachedAt === 'number')).toBe(true);
    expect(cached.map((c) => c.id).sort()).toEqual([1, 2]);
  });

  it('actualiza un transporte existente (misma clave id)', async () => {
    await saveTransportesToCache([baseTransporte({ id: 1, toneladasCargadas: 22 })]);
    await saveTransportesToCache([baseTransporte({ id: 1, toneladasCargadas: 25 })]);

    const cached = await getCachedTransportes();
    expect(cached).toHaveLength(1);
    expect(cached[0].toneladasCargadas).toBe(25);
  });

  it('limpia la caché', async () => {
    await saveTransportesToCache([baseTransporte({ id: 1 })]);
    await clearTransportesCache();

    expect(await getCachedTransportes()).toEqual([]);
  });
});