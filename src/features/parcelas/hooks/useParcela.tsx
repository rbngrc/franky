import { useState, useEffect } from 'react';
import { fetchParcelaById } from '../api/parcelaApiService';
import type { Parcela } from '../types/parcela.types';

export const useParcela = (id: string | undefined) => {
    const [parcela, setParcela] = useState<Parcela | null>(null);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        if (!id) {
            setError('ID de parcela no proporcionado.');
            setIsLoading(false);
            return;
        }

        const loadData = async () => {
            try {
                setIsLoading(true);
                const data = await fetchParcelaById(id);
                setParcela(data);
                setError(null);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Un error desconocido ha ocurrido.');
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [id]);

    return { parcela, isLoading, error };
};