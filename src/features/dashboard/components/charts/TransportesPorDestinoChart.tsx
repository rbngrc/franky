import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { ChartCard } from '../ChartCard';
import { formatEntero, PALETTE } from '../../utils/formatters';
import type { LabelValue } from '../../types/dashboard.types';

interface Props {
  data: LabelValue[];
}

export const TransportesPorDestinoChart = ({ data }: Props) => {
  const isEmpty = data.length === 0;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Transportes por centro de destino"
      subtitle={total > 0 ? `${formatEntero(total)} viajes` : undefined}
      isEmpty={isEmpty}
      emptyText="Sin destinos asignados"
      tall={data.length > 6}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout="vertical"
          margin={{ top: 4, right: 16, left: 8, bottom: 4 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#90A4AE" allowDecimals={false} />
          <YAxis
            type="category"
            dataKey="label"
            width={130}
            tick={{ fontSize: 10 }}
            stroke="#90A4AE"
            tickFormatter={(v: string) => (v.length > 20 ? `${v.slice(0, 19)}…` : v)}
          />
          <Tooltip
            formatter={(v: unknown) => `${formatEntero(Number(v))} viajes`}
            contentStyle={{ borderRadius: 8, border: '1px solid #E8EDF2', fontSize: '0.8rem' }}
          />
          <Bar dataKey="value" radius={[0, 4, 4, 0]} maxBarSize={22}>
            {data.map((d, i) => (
              <Cell key={d.label} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
