import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import { flushOutbox } from './syncQueue';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { useOutbox } from './hooks/useOutbox';

type SyncStatus = 'idle' | 'syncing' | 'error';

type OfflineContextType = {
  isOnline: boolean;
  syncing: boolean;
  pendingCount: number;
  failedCount: number;
  lastError?: string;
  syncNow: () => Promise<void>;
};

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

export const OfflineProvider = ({ children }: { children: ReactNode }) => {
  const isOnline = useOnlineStatus();
  const { pendingCount, failedCount } = useOutbox();
  const [status, setStatus] = useState<SyncStatus>('idle');
  const [lastError, setLastError] = useState<string | undefined>(undefined);
  const syncingRef = useRef(false);

  const syncNow = useCallback(async () => {
    if (!isOnline || syncingRef.current) return;
    syncingRef.current = true;
    setStatus('syncing');
    setLastError(undefined);
    try {
      await flushOutbox();
      setStatus('idle');
    } catch (error) {
      setStatus('error');
      setLastError(error instanceof Error ? error.message : 'Error de sincronización');
    } finally {
      syncingRef.current = false;
    }
  }, [isOnline]);

  useEffect(() => {
    if (isOnline) void syncNow();
  }, [isOnline, syncNow]);

  useEffect(() => {
    if (!isOnline) return;
    const intervalId = setInterval(() => void syncNow(), 10000);
    return () => clearInterval(intervalId);
  }, [isOnline, syncNow]);

  const value: OfflineContextType = {
    isOnline,
    syncing: status === 'syncing',
    pendingCount,
    failedCount,
    lastError,
    syncNow,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = (): OfflineContextType => {
  const ctx = useContext(OfflineContext);
  if (!ctx) throw new Error('useOffline debe usarse dentro de OfflineProvider');
  return ctx;
};