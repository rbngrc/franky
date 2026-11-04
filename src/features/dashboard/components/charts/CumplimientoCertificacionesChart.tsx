import {
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
  ResponsiveContainer,
  Tooltip,
} from 'recharts';
import { ChartCard } from '../ChartCard';
import type { CertStat } from '../../types/dashboard.types';

interface Props {
  data: CertStat[];
}

export const CumplimientoCertificacionesChart = ({ data }: Props) => {
  const isEmpty = data.every((d) => d.total === 0);

  return (
    <ChartCard
      title="Cumplimiento de certificaciones"
      subtitle={isEmpty ? undefined : 'Porcentaje sobre total de transportes'}
      isEmpty={isEmpty}
      emptyText="Sin transportes registrados"
      legend={data.map((d) => ({
        label: `${d.label} · ${d.cumplidos}/${d.total}`,
        color: d.color,
        value: `${d.porcentaje}%`,
      }))}
      tall
    >
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart
          data={data}
          innerRadius="28%"
          outerRadius="100%"
          startAngle={90}
          endAngle={-270}
          barSize={14}
        >
          <PolarAngleAxis type="number" domain={[0, 100]} tick={false} />
          <Tooltip
            formatter={(v: unknown) => `${v}%`}
            contentStyle={{ borderRadius: 8, border: '1px solid #E8EDF2', fontSize: '0.8rem' }}
          />
          <RadialBar
            dataKey="porcentaje"
            background={{ fill: '#F1F5F9' }}
            cornerRadius={6}
            label={{
              position: 'insideStart',
              fill: '#FFFFFF',
              fontSize: 11,
              formatter: (v: unknown) => `${v}%`,
            }}
          />
        </RadialBarChart>
      </ResponsiveContainer>
    </ChartCard>
  );
};
