import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { BackLinks } from '../BackLinks';
import { RoleProvider } from '../../features/config/RoleContext';

const renderEn = (ruta: string) =>
  render(
    <MemoryRouter initialEntries={[ruta]}>
      <RoleProvider>
        <BackLinks />
      </RoleProvider>
    </MemoryRouter>
  );

describe('BackLinks', () => {
  it('no muestra enlaces en Inicio', () => {
    const { container } = renderEn('/');
    expect(container).toBeEmptyDOMElement();
  });

  it('muestra solo la vuelta al menú en un listado', () => {
    renderEn('/camiones');
    expect(screen.getByRole('link', { name: /Volver al menú/ })).toHaveAttribute('href', '/');
    expect(screen.queryByRole('link', { name: /Volver a vehículos/ })).toBeNull();
  });

  it('muestra las dos vueltas al crear un vehículo', () => {
    renderEn('/camiones/nuevo');
    expect(screen.getByRole('link', { name: /Volver al menú/ })).toHaveAttribute('href', '/');
    expect(screen.getByRole('link', { name: /Volver a vehículos/ })).toHaveAttribute('href', '/camiones');
  });

  it('muestra la vuelta al módulo en un detalle', () => {
    renderEn('/transportes/7');
    expect(screen.getByRole('link', { name: /Volver a transportes/ })).toHaveAttribute('href', '/transportes');
  });

  it('no repite el enlace en las pestañas de parcelas', () => {
    renderEn('/parcelas/tabla');
    expect(screen.queryByRole('link', { name: /Volver a parcelas/ })).toBeNull();
  });
});
