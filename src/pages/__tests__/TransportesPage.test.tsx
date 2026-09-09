import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { TransportesPage } from '../TransportesPage';
import * as useTransportesModule from '../../features/transportes/hooks/useTransportes';

vi.mock('../../features/transportes/hooks/useTransportes');

const mockTransportes = [
  { id: 1, parcelaId: 'p1', parcelaNombre: 'Parcela Norte', camionMatricula: '1234ABC', camioneroDni: '12345678A', camioneroNombre: 'Juan López', fechaCarga: '2026-05-01', toneladasCargadas: 22, tipoMadera: 'ROBLE', destino: 'Madrid', eudrCumplimiento: true, codigoTrazabilidad: 'abc-123' },
  { id: 2, parcelaId: 'p2', parcelaNombre: 'Parcela Sur', camionMatricula: '5678DEF', camioneroDni: '87654321B', camioneroNombre: 'Ana García', fechaCarga: '2026-05-02', toneladasCargadas: 18, tipoMadera: 'PINO', destino: 'Barcelona', eudrCumplimiento: false, codigoTrazabilidad: 'def-456' },
];

const renderPage = () =>
  render(
    <MemoryRouter>
      <TransportesPage />
    </MemoryRouter>
  );

describe('TransportesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows loading state', () => {
    vi.mocked(useTransportesModule.useTransportes).mockReturnValue({ transportes: [], isLoading: true, error: null });

    renderPage();
    expect(screen.getByText('Cargando transportes...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useTransportesModule.useTransportes).mockReturnValue({ transportes: [], isLoading: false, error: 'Error de conexión' });

    renderPage();
    expect(screen.getByText('Error de conexión')).toBeInTheDocument();
  });

  it('shows empty state when no transportes', () => {
    vi.mocked(useTransportesModule.useTransportes).mockReturnValue({ transportes: [], isLoading: false, error: null });

    renderPage();
    expect(screen.getByText('No hay transportes registrados')).toBeInTheDocument();
  });

  it('renders table with transportes data', () => {
    vi.mocked(useTransportesModule.useTransportes).mockReturnValue({ transportes: mockTransportes, isLoading: false, error: null });

    renderPage();
    expect(screen.getByText('1234ABC')).toBeInTheDocument();
    expect(screen.getByText('5678DEF')).toBeInTheDocument();
    expect(screen.getByText('Roble')).toBeInTheDocument();
    expect(screen.getByText('Pino')).toBeInTheDocument();
  });

  it('shows export CSV button when there are transportes', () => {
    vi.mocked(useTransportesModule.useTransportes).mockReturnValue({ transportes: mockTransportes, isLoading: false, error: null });

    renderPage();
    expect(screen.getByText('Exportar CSV')).toBeInTheDocument();
  });
});
