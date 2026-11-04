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
import { formatToneladas, PALETTE } from '../../utils/formatters';
import type { LabelValue } from '../../types/dashboard.types';

interface Props {
  data: LabelValue[];
}

export const ToneladasPorTipoMaderaChart = ({ data }: Props) => {
  const isEmpty = data.length === 0 || data.every((d) => d.value === 0);
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Toneladas por tipo de madera"
      subtitle={total > 0 ? `Total: ${formatToneladas(total)}` : undefined}
      isEmpty={isEmpty}
      tall={data.length > 6}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} layout="vertical" margin={{ top: 4, right: 16, left: 8, bottom: 4 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" />
          <XAxis type="number" tick={{ fontSize: 11 }} stroke="#90A4AE" />
          <YAxis type="category" dataKey="label" width={90} tick={{ fontSize: 11 }} stroke="#90A4AE" />
          <Tooltip
            formatter={(v: unknown) => formatToneladas(Number(v))}
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
