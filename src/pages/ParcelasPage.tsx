import { NavLink, Outlet } from 'react-router-dom';
import styles from '../styles/ParcelaPage.module.css';

export const ParcelasPage = () => {
  const navClass = ({ isActive }: { isActive: boolean }) =>
    `${styles.navLink} ${isActive ? styles.active : ''}`;

  return (
    <div style={{ padding: '1rem', maxWidth: '1200px', margin: '0 auto' }}>
      <header style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--color-border)', paddingBottom: '1rem' }}>
        <h1 className={styles.title}>Gestión de Parcelas</h1>
        <nav style={{ display: 'flex', gap: '1rem' }}>
          <NavLink to="/parcelas/tabla" className={navClass}>
            Listado de parcelas
          </NavLink>
          <NavLink to="/parcelas/crear-sigpac" className={navClass}>
            Añadir parcela desde SIGPAC
          </NavLink>
        </nav>
      </header>

      <Outlet />
    </div>
  );
};