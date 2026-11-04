import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { DashboardPage } from '../DashboardPage';
import * as useParcelasModule from '../../features/parcelas/hooks/useParcelas';
import * as useCamionesModule from '../../features/camiones/hooks/useCamiones';
import * as useCamionerosModule from '../../features/camioneros/hooks/useCamioneros';
import * as useTransportesModule from '../../features/transportes/hooks/useTransportes';
import * as useCentrosModule from '../../features/centros/hooks/useCentros';
import * as useProveedoresModule from '../../features/proveedores/hooks/useProveedores';

vi.mock('../../features/parcelas/hooks/useParcelas');
vi.mock('../../features/camiones/hooks/useCamiones');
vi.mock('../../features/camioneros/hooks/useCamioneros');
vi.mock('../../features/transportes/hooks/useTransportes');
vi.mock('../../features/centros/hooks/useCentros');
vi.mock('../../features/proveedores/hooks/useProveedores');

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver = ResizeObserverStub as unknown as typeof ResizeObserver;

const renderDashboard = () =>
  render(
    <MemoryRouter>
      <DashboardPage />
    </MemoryRouter>
  );

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.mocked(useParcelasModule.useParcelas).mockReturnValue({ parcelas: [], totalParcelas: 5, isLoading: false, error: null, reload: async () => {} });
    vi.mocked(useCamionesModule.useCamiones).mockReturnValue({ camiones: [{ matricula: '1234ABC', marca: 'M', modelo: 'X', capacidadToneladas: 20, tara: 10000, activo: true }], isLoading: false, error: null });
    vi.mocked(useCamionerosModule.useCamioneros).mockReturnValue({ camioneros: [{ dni: '12345678A', nombre: 'Juan', apellidos: 'López', telefono: '', email: '', numeroCarnet: '', activo: true }], isLoading: false, error: null });
    vi.mocked(useTransportesModule.useTransportes).mockReturnValue({
      transportes: [
        { id: 1, parcelaId: 'p1', camionMatricula: '1234ABC', camioneroDni: '12345678A', fechaCarga: '2026-05-01', toneladasCargadas: 22, tipoMadera: 'ROBLE', destino: 'Madrid', eudrCumplimiento: true, eudrGeolocalizacionOk: true, eudrReferenciaCatastralOk: true, pefcCumplimiento: false, sureCumplimiento: false, codigoTrazabilidad: 'abc' },
        { id: 2, parcelaId: 'p2', camionMatricula: '5678DEF', camioneroDni: '87654321B', fechaCarga: '2026-05-02', toneladasCargadas: 18, tipoMadera: 'PINO', destino: 'Barcelona', eudrCumplimiento: false, eudrGeolocalizacionOk: false, eudrReferenciaCatastralOk: false, pefcCumplimiento: false, sureCumplimiento: false, codigoTrazabilidad: 'def' },
      ],
      isLoading: false,
      error: null,
      reload: async () => {},
      deleteTransporte: async () => {},
    });
    vi.mocked(useCentrosModule.useCentros).mockReturnValue({ centros: [], isLoading: false, error: null, reload: async () => {} });
    vi.mocked(useProveedoresModule.useProveedores).mockReturnValue({
      proveedores: [],
      isLoading: false,
      error: null,
      reload: async () => {},
      createProveedor: vi.fn(),
      updateProveedor: vi.fn(),
      deleteProveedor: vi.fn(),
    });
  });

  it('renders the title', () => {
    renderDashboard();
    expect(screen.getByText('Panel de Control')).toBeInTheDocument();
  });

  it('displays the KPI grid', () => {
    renderDashboard();
    expect(screen.getByText('Parcelas')).toBeInTheDocument();
    expect(screen.getByText('Toneladas cargadas')).toBeInTheDocument();
    expect(screen.getByText('Camiones activos')).toBeInTheDocument();
  });

  it('displays EUDR compliance count', () => {
    renderDashboard();
    expect(screen.getAllByText(/Cumplen EUDR/).length).toBeGreaterThan(0);
    expect(screen.getAllByText(/\/ 2/).length).toBeGreaterThan(0);
  });

  it('renders the charts sections', () => {
    renderDashboard();
    expect(screen.getByText('Toneladas por tipo de madera')).toBeInTheDocument();
    expect(screen.getByText('Evolución mensual de carga')).toBeInTheDocument();
    expect(screen.getByText('Cumplimiento de certificaciones')).toBeInTheDocument();
    expect(screen.getByText('Superficie por provincia')).toBeInTheDocument();
    expect(screen.getByText('Transportes por centro de destino')).toBeInTheDocument();
    expect(screen.getByText('Flota por marca')).toBeInTheDocument();
    expect(screen.getByText('Kilometraje de rutas')).toBeInTheDocument();
  });

  it('shows loading state for parcelas', () => {
    vi.mocked(useParcelasModule.useParcelas).mockReturnValueOnce({ parcelas: [], totalParcelas: 0, isLoading: true, error: null, reload: async () => {} });

    renderDashboard();
    const loadingIndicators = screen.getAllByText('...');
    expect(loadingIndicators.length).toBeGreaterThan(0);
  });
});
