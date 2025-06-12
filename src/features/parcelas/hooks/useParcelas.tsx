import { useState, useEffect } from 'react';
import { fetchParcelas } from '../api/parcelaApiService';
import type { Parcela } from '../types/parcela.types';

export const useParcelas = () => {

    const [parcelas, setParcelas] = useState<Parcela[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [error, setError] = useState<string | null>(null);

    const [totalParcelas, setTotalParcelas] = useState<number>(0);

    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                const response = await fetchParcelas(0, 100); 
                setParcelas(response.content);
                
                setTotalParcelas(response.totalElements);
                
                setError(null);
            } catch (err) {
                setError('Error: No se pudo cargar los datos desde la API de Vegapunk.');
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    return { parcelas, totalParcelas, isLoading, error };
};