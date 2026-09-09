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

  it('renders the form title and fields', () => {
    renderPage();
    expect(screen.getByText('Nuevo camión')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: 1234ABC')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Mercedes')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Ej: Actros')).toBeInTheDocument();
  });

  it('shows validation errors on empty submit', async () => {
    renderPage();

    fireEvent.click(screen.getByText('Guardar camión'));

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

    fireEvent.click(screen.getByText('Guardar camión'));

    await waitFor(() => {
      expect(camionApiService.createCamion).toHaveBeenCalledWith({
        matricula: '1234ABC', marca: 'Mercedes', modelo: 'Actros', capacidadToneladas: 24, tara: 12000,
      });
    });

    await waitFor(() => {
      expect(mockNavigate).toHaveBeenCalledWith('/camiones');
    });
  });

  it('shows error message on API failure', async () => {
    vi.mocked(camionApiService.createCamion).mockRejectedValueOnce(new Error('Error de red'));

    renderPage();

    await userEvent.type(screen.getByPlaceholderText('Ej: 1234ABC'), '1234ABC');
    await userEvent.type(screen.getByPlaceholderText('Ej: Mercedes'), 'Mercedes');
    await userEvent.type(screen.getByPlaceholderText('Ej: Actros'), 'Actros');

    fireEvent.click(screen.getByText('Guardar camión'));

    await waitFor(() => {
      expect(screen.getByText('Error de red')).toBeInTheDocument();
    });
  });

  it('clears field error when user starts typing', async () => {
    renderPage();

    fireEvent.click(screen.getByText('Guardar camión'));

    await screen.findByText('La matrícula es obligatoria');

    await userEvent.type(screen.getByPlaceholderText('Ej: 1234ABC'), 'A');

    expect(screen.queryByText('La matrícula es obligatoria')).not.toBeInTheDocument();
  });
});
