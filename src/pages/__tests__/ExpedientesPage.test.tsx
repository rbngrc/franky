import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { ExpedientesPage } from '../ExpedientesPage';
import * as useExpedientesModule from '../../features/expedientes/hooks/useExpedientes';
import * as useProveedoresModule from '../../features/proveedores/hooks/useProveedores';

vi.mock('../../features/expedientes/hooks/useExpedientes');
vi.mock('../../features/proveedores/hooks/useProveedores');

const mockExpedientes = [
  {
    id: 1,
    codigoExpediente: 'EXP-2026-001',
    numeroLicitacion: 'LIC-01',
    proveedorId: 10,
    estado: 'ABIERTO',
    importe: 25000,
    fechaAdjudicacion: '2026-05-01',
    activo: true,
  },
  {
    id: 2,
    codigoExpediente: 'EXP-2026-002',
    numeroLicitacion: 'LIC-02',
    proveedorId: null,
    estado: 'CERRADO',
    importe: null,
    fechaAdjudicacion: null,
    activo: false,
  },
];

const mockProveedores = [
  {
    id: 10,
    nombre: 'Maderas Norte',
    tipoDocumento: 'CIF',
    numeroDocumento: 'B123',
    direccion: null,
    telefono: null,
    email: null,
    paisOrigen: 'España',
    regionOrigen: null,
    activo: true,
  },
];

const expedienteResult = { codigoExpediente: '' };

const expedientesMock = (overrides: Partial<ReturnType<typeof useExpedientesModule.useExpedientes>> = {}) => ({
  expedientes: [],
  loading: false,
  error: null,
  refetch: async () => {},
  createExpediente: async () => expedienteResult,
  updateExpediente: async () => expedienteResult,
  deleteExpediente: async () => {},
  ...overrides,
});

const renderPage = () =>
  render(
    <MemoryRouter>
      <ExpedientesPage />
    </MemoryRouter>
  );

describe('ExpedientesPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(useProveedoresModule.useProveedores).mockReturnValue({
      proveedores: mockProveedores,
      isLoading: false,
      error: null,
      reload: async () => {},
      createProveedor: async () => mockProveedores[0],
      updateProveedor: async () => mockProveedores[0],
      deleteProveedor: async () => {},
    });
  });

  it('shows loading state', () => {
    vi.mocked(useExpedientesModule.useExpedientes).mockReturnValue(expedientesMock({ loading: true }));

    renderPage();
    expect(screen.getByText('Cargando expedientes...')).toBeInTheDocument();
  });

  it('shows error state', () => {
    vi.mocked(useExpedientesModule.useExpedientes).mockReturnValue(expedientesMock({ error: 'Error de conexión' }));

    renderPage();
    expect(screen.getByText('Error de conexión')).toBeInTheDocument();
  });

  it('shows empty state when no expedientes', () => {
    vi.mocked(useExpedientesModule.useExpedientes).mockReturnValue(expedientesMock());

    renderPage();
    expect(screen.getByText('No hay expedientes registrados')).toBeInTheDocument();
  });

  it('renders table with expedientes and resolved proveedor', () => {
    vi.mocked(useExpedientesModule.useExpedientes).mockReturnValue(
      expedientesMock({ expedientes: mockExpedientes })
    );

    renderPage();
    expect(screen.getByText('EXP-2026-001')).toBeInTheDocument();
    expect(screen.getByText('EXP-2026-002')).toBeInTheDocument();
    expect(screen.getByText('Maderas Norte')).toBeInTheDocument();
    expect(screen.getByText('Abierto')).toBeInTheDocument();
    expect(screen.getByText('Cerrado')).toBeInTheDocument();
  });

  it('shows the create link', () => {
    vi.mocked(useExpedientesModule.useExpedientes).mockReturnValue(expedientesMock());

    renderPage();
    expect(screen.getAllByRole('link', { name: '+ Nuevo expediente' }).length).toBeGreaterThan(0);
  });
});
