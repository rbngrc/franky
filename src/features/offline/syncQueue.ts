import { db, type OutboxEntry } from './db';

const BASE_URL = '/api/v1';

export const generateClientRequestId = (): string => {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `id-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
};

export type EnqueueOutboxInput = {
  type: string;
  endpoint: string;
  method: 'POST' | 'PUT';
  payload: Record<string, unknown>;
  clientRequestId?: string;
};

export const enqueueOutbox = async (input: EnqueueOutboxInput): Promise<OutboxEntry> => {
  const clientRequestId = input.clientRequestId ?? generateClientRequestId();
  const existing = await db.outbox.get(clientRequestId);
  if (existing) return existing;

  const now = Date.now();
  const entry: OutboxEntry = {
    key: clientRequestId,
    createdAt: now,
    type: input.type,
    endpoint: input.endpoint,
    method: input.method,
    payload: { ...input.payload, clientRequestId },
    clientRequestId,
    attemptCount: 0,
    status: 'pending',
  };
  await db.outbox.add(entry);
  return entry;
};

const isNetworkFailure = (error: unknown): boolean => error instanceof TypeError;

const errorMessage = (error: unknown): string =>
  error instanceof Error ? error.message : 'Error desconocido';

const syncRequest = async (entry: OutboxEntry): Promise<Response> => {
  return fetch(`${BASE_URL}${entry.endpoint}`, {
    method: entry.method,
    headers: {
      'Content-Type': 'application/json',
      'X-Client-Request-Id': entry.clientRequestId,
    },
    body: JSON.stringify(entry.payload),
  });
};

export type FlushResult = {
  flushed: number;
  failed: number;
};

export const flushOutbox = async (): Promise<FlushResult> => {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return { flushed: 0, failed: 0 };
  }

  const pending = await db.outbox.where('status').equals('pending').sortBy('createdAt');
  let flushed = 0;
  let failed = 0;

  for (const entry of pending) {
    const attemptCount = entry.attemptCount + 1;
    const lastAttemptAt = Date.now();

    try {
      const response = await syncRequest(entry);
      if (response.ok) {
        await db.outbox.delete(entry.key);
        if (entry.type === 'TRANSPORTE_UPDATE') {
          await db.capturas.update(entry.key, { synced: true });
        }
        flushed += 1;
        continue;
      }
      await db.outbox.update(entry.key, {
        attemptCount,
        lastAttemptAt,
        status: 'failed',
        lastError: `HTTP ${response.status}`,
      });
      failed += 1;
    } catch (error) {
      await db.outbox.update(entry.key, {
        attemptCount,
        lastAttemptAt,
        status: 'pending',
        lastError: isNetworkFailure(error) ? 'Sin conexión' : errorMessage(error),
      });
      failed += 1;
      break;
    }
  }

  return { flushed, failed };
};