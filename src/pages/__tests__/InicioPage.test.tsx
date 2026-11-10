import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { InicioPage } from '../InicioPage';

const renderInicio = () =>
  render(
    <MemoryRouter>
      <InicioPage />
    </MemoryRouter>
  );

describe('InicioPage', () => {
  it('renders the description', () => {
    renderInicio();
    expect(screen.getByText('Sistema de gestión forestal y certificaciones')).toBeInTheDocument();
  });

  it('renders the modules menu', () => {
    renderInicio();
    expect(screen.getByText(/Módulos/)).toBeInTheDocument();
    expect(screen.queryByText(/Acciones rápidas/)).not.toBeInTheDocument();
  });

  it('renders every module in the same order as the sidebar', () => {
    renderInicio();
    const orden = [
      'Panel de Control',
      'Expedientes',
      'Parcelas',
      'Vehículos',
      'Conductores',
      'Transportes',
      'Centros',
      'Proveedores',
      'Cumplimiento',
    ];
    const botones = screen.getAllByRole('button').map((b) => b.textContent ?? '');
    orden.forEach((m, i) => expect(botones[i]).toContain(m));
  });

  it('opens the submenu of a module with consultar and crear nuevo', () => {
    renderInicio();

    fireEvent.click(screen.getByRole('button', { name: /Transportes/ }));
    expect(screen.getByRole('link', { name: 'Consultar' })).toHaveAttribute('href', '/transportes');
    expect(screen.getByRole('link', { name: 'Nuevo transporte' })).toHaveAttribute('href', '/transportes/nuevo');

    fireEvent.click(screen.getByRole('button', { name: /Conductores/ }));
    expect(screen.queryByRole('link', { name: 'Nuevo transporte' })).not.toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Consultar' })).toHaveAttribute('href', '/conductores');
    expect(screen.getByRole('link', { name: 'Nuevo conductor' })).toHaveAttribute('href', '/conductores/nuevo');
  });
});
