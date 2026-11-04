import Dexie, { type EntityTable } from 'dexie';
import type { Transporte } from '../transportes/types/transporte.types';

export type OutboxStatus = 'pending' | 'processing' | 'failed';

export type OutboxEntry = {
  key: string;
  createdAt: number;
  type: string;
  endpoint: string;
  method: 'POST' | 'PUT';
  payload: Record<string, unknown>;
  clientRequestId: string;
  attemptCount: number;
  status: OutboxStatus;
  lastError?: string;
  lastAttemptAt?: number;
};

export type CachedTransporte = Transporte & { cachedAt: number };

export type CapturaRecord = {
  id: string;
  transporteId: number;
  matricula: string;
  pesoNetoKg: number | null;
  pesoBrutoKg: number | null;
  taraKg: number | null;
  numeroTicket: string | null;
  fecha: string | null;
  hora: string | null;
  fotoFrente?: string;
  fotoTrasera?: string;
  fotoLateral?: string;
  fotoTicket?: string;
  createdAt: number;
  ocrConfidence: number;
  synced: boolean;
  error?: string;
};

class FrankyDatabase extends Dexie {
  transportesCache!: EntityTable<CachedTransporte, 'id'>;
  outbox!: EntityTable<OutboxEntry, 'key'>;
  capturas!: EntityTable<CapturaRecord, 'id'>;

  constructor() {
    super('franky-offline');
    this.version(1).stores({
      transportesCache: 'id, cachedAt',
      outbox: 'key, createdAt, status',
    });
    this.version(2).stores({
      pesajes: 'id, transporteId, createdAt, synced',
    });
    this.version(3).stores({
      capturas: 'id, transporteId, createdAt, synced',
    });
  }
}

export const db = new FrankyDatabase();