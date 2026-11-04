import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from '../ChartCard';
import { formatEntero, PALETTE } from '../../utils/formatters';
import type { LabelValue } from '../../types/dashboard.types';

interface Props {
  data: LabelValue[];
  subtitulo?: string;
}

export const CamionesPorMarcaChart = ({ data, subtitulo }: Props) => {
  const isEmpty = data.length === 0;
  const total = data.reduce((s, d) => s + d.value, 0);

  return (
    <ChartCard
      title="Flota por marca"
      subtitle={total > 0 ? `${formatEntero(total)} camiones activos` : subtitulo}
      isEmpty={isEmpty}
      emptyText="Sin camiones activos"
      legend={data.map((d, i) => ({
        label: d.label,
        color: PALETTE[i % PALETTE.length],
        value: formatEntero(d.value),
      }))}
    >
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="label"
            cx="50%"
            cy="50%"
            innerRadius="45%"
            outerRadius="72%"
            paddingAngle={2}
          >
            {data.map((d, i) => (
              <Cell key={d.label} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v: unknown) => `${formatEntero(Number(v))} camiones`}
            contentStyle={{ borderRadius: 8, border: '1px solid #E8EDF2', fontSize: '0.8rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.72rem' }} />
        </PieChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
