import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter } from 'react-router-dom';
import { CamionFormPage } from '../CamionFormPage';
import * as camionApiService from '../../features/camiones/api/camionApiService';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return { ...actual, useNavigate: () => mockNavigate };
});

vi.mock('../../features/camiones/api/camionApiService');

vi.mock('../../features/camiones/hooks/useCamiones', () => ({
  useCamiones: () => ({ camiones: [], isLoading: false, error: null }),
}));

const renderPage = () =>
  render(
    <MemoryRouter>
      <CamionFormPage />
    </MemoryRouter>
  );

describe('CamionFormPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the form title, tabs and fields', () => {
    renderPage();
    expect(screen.getByText('Alta de un nuevo vehículo para la flota')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Camiones' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Remolques' })).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 1234ABC')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Mercedes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Actros')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    renderPage();

    fireEvent.click(screen.getByText('Guardar vehículo'));

    await waitFor(() => {
      expect(screen.getByText('La matrícula es obligatoria')).toBeInTheDocument();
      expect(screen.getByText('La marca es obligatoria')).toBeInTheDocument();
      expect(screen.getByText('El modelo es obligatorio')).toBeInTheDocument();
    });
  });

  it('submits form successfully with valid data', async () => {
    vi.mocked(camionApiService.createCamion).mockResolvedValueOnce({
      matricula: '1234ABC', marca: 'Mercedes', modelo: 'Actros', capacidadToneladas: 24, tara: 12000, activo: true,
    });

    renderPage();

    await userEvent.type(screen.getByPlaceholderText('Ej: 1234ABC'), '1234ABC');
    await userEvent.type(screen.getByPlaceholderText('Ej: Mercedes'), 'Mercedes');
    await userEvent.type(screen.getByPlaceholderText('Ej: Actros'), 'Actros');
    fireEvent.change(screen.getByPlaceholderText('Ej: 24'), { target: { value: '24' } });
    fireEvent.change(screen.getByPlaceholderText('Ej: 12000'), { target: { value: '12000' } });

    fireEvent.click(screen.getByText('Guardar vehículo'));

    await waitFor(() => {
      expect(camionApiService.createCamion).toHaveBeenCalledWith({
        matricula: '1234ABC', marca: 'Mercedes', modelo: 'Actros', capacidadToneladas: 24, tara: 12000, remolqueMatricula: '', tipo: 'CAMION',
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/camiones');
    });
  });

  it('saves a remolque when the Remolques tab is selected', async () => {
    vi.mocked(camionApiService.createCamion).mockResolvedValueOnce({
      matricula: 'R-1234', marca: 'Schmitz', modelo: 'S.KO', capacidadToneladas: 90, tara: 7000, activo: true, tipo: 'REMOLQUE',
    });

    renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'Remolques' }));
    expect(screen.queryByText('Remolque')).not.toBeInTheDocument();

    await userEvent.type(screen.getByPlaceholderText('Ej: 1234ABC'), 'R-1234');

    fireEvent.click(screen.getByText('Guardar vehículo'));

    await waitFor(() => {
      expect(camionApiService.createCamion).toHaveBeenCalledWith(
        expect.objectContaining({ matricula: 'R-1234', marca: '', modelo: '', tipo: 'REMOLQUE' })
      );
    });
  });

  it('shows error message on API failure', async () => {
    vi.mocked(camionApiService.createCamion).mockRejectedValueOnce(new Error('Error de red'));

    renderPage();

    await userEvent.type(screen.getByPlaceholderText('Ej: 1234ABC'), '1234ABC');
    await userEvent.type(screen.getByPlaceholderText('Ej: Mercedes'), 'Mercedes');
    await userEvent.type(screen.getByPlaceholderText('Ej: Actros'), 'Actros');

    fireEvent.click(screen.getByText('Guardar vehículo'));

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  it('clears field error when user starts typing', async () => {
    renderPage();

    fireEvent.click(screen.getByText('Guardar vehículo'));

    await screen.findByText('La matrícula es obligatoria');

    await userEvent.type(screen.getByPlaceholderText('Ej: 1234ABC'), 'A');

    expect(screen.queryByText('La matrícula es obligatoria')).not.toBeInTheDocument();
  });
});
