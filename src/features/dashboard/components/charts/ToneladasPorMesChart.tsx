import {
  Bar,
  Line,
  ComposedChart,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { ChartCard } from '../ChartCard';
import { formatToneladas, formatEntero, PALETTE } from '../../utils/formatters';
import type { MonthValue, LabelValue } from '../../types/dashboard.types';

interface Props {
  toneladas: MonthValue[];
  transportes: LabelValue[];
}

export const ToneladasPorMesChart = ({ toneladas, transportes }: Props) => {
  const data = toneladas.map((t, i) => ({
    label: t.label,
    toneladas: t.value,
    transportes: transportes[i]?.value ?? 0,
  }));
  const isEmpty = data.every((d) => d.toneladas === 0 && d.transportes === 0);
  const total = data.reduce((s, d) => s + d.toneladas, 0);

  return (
    <ChartCard
      title="Evolución mensual de carga"
      subtitle={
        total > 0
          ? `${formatToneladas(total)} en los últimos 12 meses`
          : 'Últimos 12 meses'
      }
      isEmpty={isEmpty}
    >
      <ResponsiveContainer width="100%" height="100%">
        <ComposedChart data={data} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="#E8EDF2" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} stroke="#90A4AE" interval={0} angle={-35} textAnchor="end" height={55} />
          <YAxis yAxisId="left" tick={{ fontSize: 11 }} stroke="#90A4AE" />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 11 }} stroke="#90A4AE" />
          <Tooltip
            formatter={(v: unknown, name?: unknown) =>
              name === 'Toneladas' ? formatToneladas(Number(v)) : formatEntero(Number(v))
            }
            contentStyle={{ borderRadius: 8, border: '1px solid #E8EDF2', fontSize: '0.8rem' }}
          />
          <Legend wrapperStyle={{ fontSize: '0.75rem' }} />
          <Bar yAxisId="left" dataKey="toneladas" name="Toneladas" fill={PALETTE[0]} radius={[4, 4, 0, 0]} maxBarSize={32} />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="transportes"
            name="Transportes"
            stroke={PALETTE[2]}
            strokeWidth={2}
            dot={{ r: 3 }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
