import { createContext, useContext, useState, type ReactNode } from 'react';

export type UnidadVolumen = 't' | 'm3';

interface UnidadContextType {
  unidad: UnidadVolumen;
  setUnidad: (u: UnidadVolumen) => void;
  formatVol: (v?: number | null) => string;
}

const UnidadContext = createContext<UnidadContextType | undefined>(undefined);

export const UnidadProvider = ({ children }: { children: ReactNode }) => {
  const [unidad, setUnidad] = useState<UnidadVolumen>('m3');

  const formatVol = (v?: number | null) => {
    if (v === undefined || v === null) return '-';
    return `${v} ${unidad}`;
  };

  return (
    <UnidadContext.Provider value={{ unidad, setUnidad, formatVol }}>{children}</UnidadContext.Provider>
  );
};

export const useUnidad = () => {
  const ctx = useContext(UnidadContext);
  if (!ctx) throw new Error('useUnidad must be used within UnidadProvider');
  return ctx;
};
