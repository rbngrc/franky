import { useMemo, useState } from 'react';

const DIAS_SEMANA = ['Lu', 'Ma', 'Mi', 'Ju', 'Vi', 'Sa', 'Do'];
const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

interface CalendarTransporte {
  fechaCarga: string;
}

interface CalendarWidgetProps {
  transportes: CalendarTransporte[];
}

export const CalendarWidget = ({ transportes }: CalendarWidgetProps) => {
  const hoy = new Date();
  const [mes, setMes] = useState(hoy.getMonth());
  const [anio, setAnio] = useState(hoy.getFullYear());

  const transporteCountPorDia = useMemo(() => {
    const map = new Map<string, number>();
    transportes.forEach((t) => {
      const key = new Date(t.fechaCarga).toISOString().split('T')[0];
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [transportes]);

  const primerDia = new Date(anio, mes, 1);
  const ultimoDia = new Date(anio, mes + 1, 0);
  const diasEnMes = ultimoDia.getDate();
  const diaSemInicio = (primerDia.getDay() + 6) % 7;

  const prev = () => {
    if (mes === 0) { setMes(11); setAnio((a) => a - 1); }
    else setMes((m) => m - 1);
  };
  const next = () => {
    if (mes === 11) { setMes(0); setAnio((a) => a + 1); }
    else setMes((m) => m + 1);
  };

  const celdas = [];
  for (let i = 0; i < diaSemInicio; i++) {
    celdas.push(<div key={`e-${i}`} style={{ width: 36, height: 36 }} />);
  }
  for (let d = 1; d <= diasEnMes; d++) {
    const fechaStr = `${anio}-${String(mes + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
    const count = transporteCountPorDia.get(fechaStr) || 0;
    const esHoy = d === hoy.getDate() && mes === hoy.getMonth() && anio === hoy.getFullYear();
    celdas.push(
      <div key={d}
        style={{
          width: 36, height: 36, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
          fontSize: '0.85rem', borderRadius: 4,
          background: count > 0 ? '#0097A7' : esHoy ? '#e0f2f1' : 'transparent',
          color: count > 0 ? '#fff' : esHoy ? '#0097A7' : '#333',
          fontWeight: count > 0 ? 700 : esHoy ? 600 : 400,
          cursor: count > 0 ? 'pointer' : 'default',
          position: 'relative' as const,
        }}
        title={count > 0 ? `${count} transporte${count > 1 ? 's' : ''}` : undefined}
      >
        <span>{d}</span>
        {count > 0 && <span style={{ fontSize: '0.55rem', lineHeight: 1 }}>{count}</span>}
      </div>
    );
  }

  return (
    <div style={{ minWidth: 280, background: '#fafafa', borderRadius: 8, padding: '1rem', border: '1px solid #e0e0e0', alignSelf: 'flex-start' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <button onClick={prev} className="btn btn-sm btn-secondary">&larr;</button>
        <strong style={{ fontSize: '1rem' }}>{MESES[mes]} {anio}</strong>
        <button onClick={next} className="btn btn-sm btn-secondary">&rarr;</button>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 36px)', gap: 2, justifyContent: 'center' }}>
        {DIAS_SEMANA.map((d) => (
          <div key={d} style={{ width: 36, height: 24, textAlign: 'center', fontSize: '0.75rem', fontWeight: 600, color: '#666', display: 'flex', alignItems: 'flex-end', justifyContent: 'center' }}>{d}</div>
        ))}
        {celdas}
      </div>
    </div>
  );
};
