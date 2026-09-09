import { useState, useEffect, useCallback, useRef } from 'react';
import { fetchParcelaById, updateParcela as updateParcelaApi } from '../api/parcelaApiService';
import type { Parcela, ParcelaUpdateData } from '../types/parcela.types';

export const useParcela = (id: string | undefined) => {
    const [parcela, setParcela] = useState<Parcela | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const abortRef = useRef<AbortController | null>(null);

    const loadData = useCallback(async (signal?: AbortSignal) => {
        if (!id) {
            setError('ID de parcela no proporcionado.');
            setIsLoading(false);
            return;
        }
        try {
            setIsLoading(true);
            const data = await fetchParcelaById(id, signal);
            if (!signal?.aborted) {
                setParcela(data);
                setError(null);
            }
        } catch (err) {
            if (signal?.aborted) return;
            setError(err instanceof Error ? err.message : 'Error desconocido.');
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    }, [id]);

    useEffect(() => {
        const abortController = new AbortController();
        abortRef.current = abortController;
        loadData(abortController.signal);
        return () => abortController.abort();
    }, [loadData]);

    const reload = useCallback(async () => {
        abortRef.current?.abort();
        const ac = new AbortController();
        abortRef.current = ac;
        await loadData(ac.signal);
    }, [loadData]);

    const updateParcela = useCallback(async (data: ParcelaUpdateData) => {
        if (!id) throw new Error('ID de parcela no disponible');
        const updated = await updateParcelaApi(id, data);
        setParcela(updated);
        return updated;
    }, [id]);

    return { parcela, isLoading, error, reload, updateParcela };
};