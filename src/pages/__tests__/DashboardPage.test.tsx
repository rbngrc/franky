import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import * as useParcelasModule from '../../features/parcelas/hooks/useParcelas';
import * as useCamionesModule from '../../features/camiones/hooks/useCamiones';
import * as useCamionerosModule from '../../features/camioneros/hooks/useCamioneros';
import * as useTransportesModule from '../../features/transportes/hooks/useTransportes';

vi.mock('../../features/parcelas/hooks/useParcelas');
vi.mock('../../features/camiones/hooks/useCamiones');
vi.mock('../../features/camioneros/hooks/useCamioneros');
vi.mock('../../features/transportes/hooks/useTransportes');

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(useParcelasModule.useParcelas).mockReturnValue({ parcelas: [], totalParcelas: 5, isLoading: false, error: null });
    vi.mocked(useCamionesModule.useCamiones).mockReturnValue({ camiones: [{ matricula: '1234ABC', marca: 'M', modelo: 'X', capacidadToneladas: 20, tara: 10000, activo: true }], isLoading: false, error: null });
    vi.mocked(useCamionerosModule.useCamioneros).mockReturnValue({ camioneros: [{ dni: '12345678A', nombre: 'Juan', apellidos: 'López', telefono: '', email: '', numeroCarnet: '', activo: true }], isLoading: false, error: null });
    vi.mocked(useTransportesModule.useTransportes).mockReturnValue({
      transportes: [
        { id: 1, parcelaId: 'p1', camionMatricula: '1234ABC', camioneroDni: '12345678A', fechaCarga: '2026-05-01', toneladasCargadas: 22, tipoMadera: 'ROBLE', destino: 'Madrid', eudrCumplimiento: true, codigoTrazabilidad: 'abc' },
        { id: 2, parcelaId: 'p2', camionMatricula: '5678DEF', camioneroDni: '87654321B', fechaCarga: '2026-05-02', toneladasCargadas: 18, tipoMadera: 'PINO', destino: 'Barcelona', eudrCumplimiento: false, codigoTrazabilidad: 'def' },
      ],
      isLoading: false,
      error: null,
    });
  });

  it('renders the title', () => {
    renderDashboard();
    expect(screen.getByText('Panel de Control')).toBeInTheDocument();
  });

  it('displays total parcelas count', () => {
    renderDashboard();
    expect(screen.getByText('5')).toBeInTheDocument();
    expect(screen.getByText('Parcelas')).toBeInTheDocument();
  });

  it('displays EUDR compliance count', () => {
    renderDashboard();
    expect(screen.getAllByText('Cumplen EUDR').length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\/ 2/).length).toBeGreaterThan(0);
  });

  it('shows loading state for parcelas', () => {
    vi.mocked(useParcelasModule.useParcelas).mockReturnValueOnce({ parcelas: [], totalParcelas: 0, isLoading: true, error: null });

    renderDashboard();
    const loadingIndicators = screen.getAllByText('...');
    expect(loadingIndicators.length).toBeGreaterThan(0);
  });
});
