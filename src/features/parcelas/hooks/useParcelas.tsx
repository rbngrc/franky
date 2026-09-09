import { useState, useEffect } from 'react';
import { fetchParcelas } from '../api/parcelaApiService';
import type { Parcela } from '../types/parcela.types';

export const useParcelas = () => {
    const [parcelas, setParcelas] = useState<Parcela[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);
    const [totalParcelas, setTotalParcelas] = useState<number>(0);

    const loadData = async (signal?: AbortSignal) => {
        try {
            setIsLoading(true);
            const response = await fetchParcelas(0, 100, signal);
            if (!signal?.aborted) {
                setParcelas(response.content);
                setTotalParcelas(response.totalElements);
                setError(null);
            }
        } catch {
            if (signal?.aborted) return;
            setError('Error al cargar parcelas.');
        } finally {
            if (!signal?.aborted) {
                setIsLoading(false);
            }
        }
    };

    useEffect(() => {
        const abortController = new AbortController();
        loadData(abortController.signal);
        return () => abortController.abort();
    }, []);

    return { parcelas, totalParcelas, isLoading, error, reload: () => loadData() };
};