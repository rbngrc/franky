import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  LabelList,
} from 'recharts';
import { ChartCard } from '../ChartCard';
import { formatKilometros, formatEntero, PALETTE } from '../../utils/formatters';
import type { RouteDistance } from '../../types/dashboard.types';

interface Props {
  data: RouteDistance[];
  isLoading?: boolean;
}

export const KilometrajeRutasChart = ({ data, isLoading }: Props) => {
  const top = data.slice(0, 10);
  const chartData = top.map((d) => ({
    label: `#${d.codigo.slice(0, 8)} · ${d.destino.length > 18 ? `${d.destino.slice(0, 17)}…` : d.destino}`,
    kilometros: Math.round(d.kilometros * 10) / 10,
  }));
  const isEmpty = chartData.length === 0;
  const total = data.reduce((s, d) => s + d.kilometros, 0);

  return (
    <ChartCard
      title="Kilometraje de rutas"
      subtitle={
        total > 0
          ? `${formatKilometros(total)} en ${data.length} rutas (distancias reales vía OSRM)`
          : 'Distancias calculadas con OSRM'
      }
      isEmpty={isEmpty}
      emptyText={isLoading ? 'Calculando rutas…' : 'Sin rutas con origen y destino geolocalizados'}
      tall={chartData.length > 6}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={chartData}
          layout="vertical"
          margin={{ top: 4, right: 32, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#90A4AE" />
          <YAxis type="category" dataKey="label" width={150} tick={{ fontSize: 9 }} stroke="#90A4AE" />
          <Tooltip
            formatter={(v: unknown) => formatKilometros(Number(v))}
            contentStyle={{ borderRadius: 8, border: '1px solid #E8EDF2', fontSize: '0.8rem' }}
          />
          <Bar dataKey="kilometros" radius={[0, 4, 4, 0]} maxBarSize={20}>
            {chartData.map((d, i) => (
              <Cell key={d.label} fill={PALETTE[i % PALETTE.length]} />
            ))}
            <LabelList
              dataKey="kilometros"
              position="right"
              formatter={(v: unknown) => `${formatEntero(Number(v))} km`}
              style={{ fontSize: 9, fill: '#546E7A' }}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
