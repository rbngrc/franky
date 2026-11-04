import { useMemo } from 'react';
import { useParcelas } from '../../parcelas/hooks/useParcelas';
import { useCamiones } from '../../camiones/hooks/useCamiones';
import { useCamioneros } from '../../camioneros/hooks/useCamioneros';
import { useTransportes } from '../../transportes/hooks/useTransportes';
import { useCentros } from '../../centros/hooks/useCentros';
import { useProveedores } from '../../proveedores/hooks/useProveedores';
import { tipoMaderaLabel } from '../../../constants/madera';
import type { LabelValue, MonthValue, CertStat, Kpi } from '../types/dashboard.types';

const CERT_COLORS: Record<string, string> = {
  eudr: '#2E7D32',
  pefc: '#1565C0',
  sure: '#F57F17',
};

const MESES = [
  'ene', 'feb', 'mar', 'abr', 'may', 'jun',
  'jul', 'ago', 'sep', 'oct', 'nov', 'dic',
];

function monthKeyOf(iso: string): string | null {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return null;
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

function lastTwelveMonths(): string[] {
  const keys: string[] = [];
  const now = new Date();
  for (let i = 11; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    keys.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
  }
  return keys;
}

function labelForMonth(key: string): string {
  const [year, month] = key.split('-');
  return `${MESES[Number(month) - 1]} ${year.slice(2)}`;
}

function sumBy<T>(items: T[], getKey: (item: T) => string | null, getValue: (item: T) => number) {
  const acc = new Map<string, number>();
  items.forEach((item) => {
    const key = getKey(item);
    if (key == null || key === '') return;
    acc.set(key, (acc.get(key) ?? 0) + getValue(item));
  });
  return acc;
}

function toSortedList(acc: Map<string, number>, limit?: number): LabelValue[] {
  const list = [...acc.entries()].map(([label, value]) => ({ label, value }));
  list.sort((a, b) => b.value - a.value);
  return limit ? list.slice(0, limit) : list;
}

export const useDashboardStats = () => {
  const { parcelas, totalParcelas, isLoading: loadingParcelas } = useParcelas();
  const { camiones, isLoading: loadingCamiones } = useCamiones();
  const { camioneros, isLoading: loadingCamioneros } = useCamioneros();
  const { transportes, isLoading: loadingTransportes } = useTransportes();
  const { centros, isLoading: loadingCentros } = useCentros();
  const { proveedores, isLoading: loadingProveedores } = useProveedores();

  const isLoading =
    loadingParcelas || loadingCamiones || loadingCamioneros ||
    loadingTransportes || loadingCentros || loadingProveedores;

  const datos = useMemo(
    () => ({ parcelas, camiones, camioneros, transportes, centros, proveedores }),
    [parcelas, camiones, camioneros, transportes, centros, proveedores],
  );

  const stats = useMemo(() => {
    const { parcelas: pr, camiones: cm, camioneros: cr, transportes: tr, centros: ce, proveedores: pv } = datos;

    const camionesActivos = cm.filter((c) => c.activo);
    const camionerosActivos = cr.filter((c) => c.activo);
    const centrosActivos = ce.filter((c) => c.activo);
    const proveedoresActivos = pv.filter((c) => c.activo);

    const totalToneladas = tr.reduce((s, t) => s + (t.toneladasCargadas || 0), 0);
    const superficieM2 = pr.reduce((s, p) => s + (p.areaMetrosCuadrados || 0), 0);
    const superficieTotalHectareas = superficieM2 / 10000;

    const capacityTotal = camionesActivos.reduce((s, c) => s + (c.capacidadToneladas || 0), 0);

    const months = lastTwelveMonths();
    const monthLabel = new Map(months.map((k) => [k, labelForMonth(k)]));
    const tonAcum = sumBy(tr, (t) => monthKeyOf(t.fechaCarga), (t) => t.toneladasCargadas || 0);
    const udsAcum = sumBy(tr, (t) => monthKeyOf(t.fechaCarga), () => 1);
    const toneladasPorMes: MonthValue[] = months.map((k) => ({
      monthKey: k,
      label: monthLabel.get(k) ?? k,
      value: tonAcum.get(k) ?? 0,
    }));
    const transportesPorMes: LabelValue[] = months.map((k) => ({
      label: monthLabel.get(k) ?? k,
      value: udsAcum.get(k) ?? 0,
    }));

    const tipoAcum = sumBy(tr, (t) => (t.tipoMadera ? tipoMaderaLabel(t.tipoMadera) : null), (t) => t.toneladasCargadas || 0);
    const toneladasPorTipoMadera = toSortedList(tipoAcum);
    if (toneladasPorTipoMadera.length === 0) {
      toneladasPorTipoMadera.push({ label: 'Sin datos', value: 0 });
    }

    const provAcum = sumBy(pr, (p) => p.provincia || null, (p) => (p.areaMetrosCuadrados || 0) / 10000);
    const muniAcum = sumBy(pr, (p) => p.municipio || null, (p) => (p.areaMetrosCuadrados || 0) / 10000);
    const hectareasPorProvincia = toSortedList(provAcum);
    const hectareasPorMunicipio = toSortedList(muniAcum, 10);

    const destinoAcum = sumBy(tr, (t) => t.centroNombre || t.destino || null, () => 1);
    const transportesPorDestino = toSortedList(destinoAcum, 10);

    const marcaAcum = sumBy(camionesActivos, (c) => c.marca || null, () => 1);
    const camionesPorMarca = toSortedList(marcaAcum);

    const total = tr.length;
    const certificaciones: CertStat[] = (
      [
        { key: 'eudr' as const, label: 'EUDR', get: (t: (typeof tr)[number]) => t.eudrCumplimiento },
        { key: 'pefc' as const, label: 'PEFC', get: (t: (typeof tr)[number]) => t.pefcCumplimiento },
        { key: 'sure' as const, label: 'SURE', get: (t: (typeof tr)[number]) => t.sureCumplimiento },
      ] as const
    ).map(({ key, label, get }) => {
      const cumplidos = tr.filter((t) => get(t)).length;
      return {
        key,
        label,
        cumplidos,
        total,
        porcentaje: total > 0 ? Math.round((cumplidos / total) * 100) : 0,
        color: CERT_COLORS[key],
      };
    });

    const kpis: Kpi[] = [
      { value: totalParcelas, label: 'Parcelas', link: '/parcelas/tabla', loading: loadingParcelas },
      { value: superficieTotalHectareas, label: 'Superficie (ha)', link: '/parcelas/tabla', loading: loadingParcelas, decimals: 1 },
      { value: camionesActivos.length, label: 'Camiones activos', link: '/camiones', loading: loadingCamiones },
      { value: camionerosActivos.length, label: 'Conductores activos', link: '/conductores', loading: loadingCamioneros },
      { value: total, label: 'Transportes', link: '/transportes', loading: loadingTransportes },
      { value: totalToneladas, label: 'Toneladas cargadas', link: '/transportes', loading: loadingTransportes, decimals: 1 },
      { value: ratio(totalToneladas, total), label: 'Toneladas por transporte', link: '/transportes', loading: loadingTransportes, decimals: 1 },
      { value: ratio(totalToneladas, capacityTotal), label: 'Toneladas por camión', link: '/transportes', loading: loadingTransportes || loadingCamiones, decimals: 1 },
      { value: ratio(capacityTotal, camionesActivos.length), label: 'Capacidad media (t)', link: '/camiones', loading: loadingCamiones, decimals: 1 },
      { value: centrosActivos.length, label: 'Centros activos', link: '/centros', loading: loadingCentros },
      { value: proveedoresActivos.length, label: 'Proveedores activos', link: '/proveedores', loading: loadingProveedores },
    ];

    return {
      kpis,
      totalToneladas,
      mediaToneladasPorTransporte: total > 0 ? totalToneladas / total : 0,
      superficieTotalHectareas,
      toneladasPorTipoMadera,
      toneladasPorMes,
      transportesPorMes,
      certificaciones,
      hectareasPorProvincia,
      hectareasPorMunicipio,
      transportesPorDestino,
      camionesPorMarca,
      capacityTotalCamiones: capacityTotal,
      cargaMediaPorCamion: camionesActivos.length > 0 ? totalToneladas / camionesActivos.length : 0,
      totalTransportes: total,
      ultimosTransportes: [...tr].sort((a, b) => (b.id || 0) - (a.id || 0)).slice(0, 5),
      parcelasTruncadas: totalParcelas > pr.length,
    };
  }, [datos, loadingParcelas, loadingCamiones, loadingCamioneros, loadingTransportes, loadingCentros, loadingProveedores, totalParcelas]);

  return { ...stats, isLoading };
};

function ratio(total: number, count: number): number {
  return count > 0 ? total / count : 0;
}
