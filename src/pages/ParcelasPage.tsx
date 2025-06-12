// src/pages/ParcelasPage.tsx

import { NavLink, Outlet } from 'react-router-dom';

export const ParcelasPage = () => {
  const navLinkStyle = {
    padding: '0.5rem 1rem',
    textDecoration: 'none',
    color: 'black',
    borderBottom: '2px solid transparent',
  };

  const activeNavLinkStyle = {
    ...navLinkStyle,
    borderBottom: '2px solid #1976d2',
    color: '#1976d2',
  };

  return (
    <div>
      <header style={{ marginBottom: '1.5rem' }}>
        <h1>Gestión de Parcelas</h1>
        <nav style={{ borderBottom: '1px solid #ccc', display: 'flex' }}>
          <NavLink 
            to="/parcelas/tabla" 
            style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}
          >
            Listado de parcelas
          </NavLink>
          <NavLink 
            to="/parcelas/crear" 
            style={({ isActive }) => isActive ? activeNavLinkStyle : navLinkStyle}
          >
            Añadir nueva parcela
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  );
};