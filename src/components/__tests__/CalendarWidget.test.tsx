import { render, screen } from '@testing-library/react';
import { CalendarWidget } from '../CalendarWidget';

const MESES = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];

describe('CalendarWidget', () => {
  it('renders the current month and year', () => {
    const hoy = new Date();
    render(<CalendarWidget transportes={[]} />);

    expect(screen.getByText(`${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`)).toBeInTheDocument();
  });

  it('shows the transporte count for a day with transportes', () => {
    const hoy = new Date();
    const dia = hoy.getDate();
    const fechaCarga = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(dia).padStart(2, '0')}T12:00:00`;

    render(<CalendarWidget transportes={[{ fechaCarga }]} />);

    expect(screen.getByTitle('1 transporte')).toBeInTheDocument();
  });

  it('renders without errors when transportes is empty', () => {
    const hoy = new Date();
    render(<CalendarWidget transportes={[]} />);

    expect(screen.getByText(`${MESES[hoy.getMonth()]} ${hoy.getFullYear()}`)).toBeInTheDocument();
    expect(screen.queryByTitle('1 transporte')).not.toBeInTheDocument();
  });
});