import { useLiveQuery } from 'dexie-react-hooks';
import { db, type OutboxEntry } from '../db';

export const useOutbox = (): {
  pendingCount: number;
  failedCount: number;
  entries: OutboxEntry[];
} => {
  const pendingCount = useLiveQuery(() => db.outbox.where('status').equals('pending').count(), []) ?? 0;
  const failedCount = useLiveQuery(() => db.outbox.where('status').equals('failed').count(), []) ?? 0;
  const entries = useLiveQuery(() => db.outbox.toArray(), []) ?? [];

  return { pendingCount, failedCount, entries };
};