import { db, type CachedTransporte } from './db';
import type { Transporte } from '../transportes/types/transporte.types';

export const saveTransportesToCache = async (transportes: Transporte[]): Promise<void> => {
  const cachedAt = Date.now();
  await db.transportesCache.bulkPut(
    transportes.map((transporte) => ({ ...transporte, cachedAt })),
  );
};

export const getCachedTransportes = async (): Promise<CachedTransporte[]> => {
  return db.transportesCache.toArray();
};

export const clearTransportesCache = async (): Promise<void> => {
  await db.transportesCache.clear();
};