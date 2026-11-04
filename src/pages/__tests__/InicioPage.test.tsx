import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InicioPage } from '../InicioPage';

const renderInicio = () =>
  render(
    <MemoryRouter>
      <InicioPage />
    </MemoryRouter>
  );

describe('InicioPage', () => {
  it('renders the title', () => {
    renderInicio();
    expect(screen.getByRole('heading', { name: 'Inicio' })).toBeInTheDocument();
  });

  it('renders the modules and quick actions sections', () => {
    renderInicio();
    expect(screen.getByText(/Módulos/)).toBeInTheDocument();
    expect(screen.getByText(/Acciones rápidas/)).toBeInTheDocument();
  });

  it('links to every main module', () => {
    renderInicio();
    const modules = [
      'Expedientes',
      'Parcelas',
      'Camiones',
      'Conductores',
      'Transportes',
      'Centros',
      'Proveedores',
      'Cumplimiento',
      'Panel de Control',
    ];
    modules.forEach((m) => {
      expect(screen.getByRole('link', { name: new RegExp(m) })).toBeInTheDocument();
    });
  });

  it('links to the creation forms', () => {
    renderInicio();
    expect(screen.getByRole('link', { name: /Añadir parcela desde SIGPAC/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Registrar nuevo camión/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Registrar nuevo transporte/ })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Registrar nuevo conductor/ })).toBeInTheDocument();
  });
});
