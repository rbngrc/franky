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
import { formatHectareas, PALETTE } from '../../utils/formatters';
import type { LabelValue } from '../../types/dashboard.types';

interface Props {
  data: LabelValue[];
  titulo: string;
  subtitulo?: string;
  orientacion?: 'horizontal' | 'vertical';
}

export const SuperficieChart = ({ data, titulo, subtitulo, orientacion = 'vertical' }: Props) => {
  const isEmpty = data.length === 0 || data.every((d) => d.value === 0);
  const total = data.reduce((s, d) => s + d.value, 0);
  const horizontal = orientacion === 'horizontal' || data.length > 6;

  return (
    <ChartCard
      title={titulo}
      subtitle={total > 0 ? `Total: ${formatHectareas(total)}` : subtitulo}
      isEmpty={isEmpty}
      emptyText="Las parcelas cargadas no tienen superficie declarada"
      tall={data.length > 6}
    >
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          data={data}
          layout={horizontal ? 'vertical' : 'horizontal'}
          margin={{ top: 4, right: 16, left: horizontal ? 8 : 0, bottom: horizontal ? 4 : 0 }}
        >
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" />
          {horizontal ? (
            <>
              <XAxis type="number" tick={{ fontSize: 11 }} stroke="#90A4AE" />
              <YAxis type="category" dataKey="label" width={110} tick={{ fontSize: 11 }} stroke="#90A4AE" />
            </>
          ) : (
            <>
              <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#90A4AE" interval={0} angle={-30} textAnchor="end" height={60} />
              <YAxis tick={{ fontSize: 11 }} stroke="#90A4AE" />
            </>
          )}
          <Tooltip
            formatter={(v: unknown) => formatHectareas(Number(v))}
            contentStyle={{ borderRadius: 8, border: '1px solid #E8EDF2', fontSize: '0.8rem' }}
          />
          <Bar dataKey="value" radius={horizontal ? [0, 4, 4, 0] : [4, 4, 0, 0]} maxBarSize={horizontal ? 22 : 48}>
            {data.map((d, i) => (
              <Cell key={d.label} fill={PALETTE[i % PALETTE.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
