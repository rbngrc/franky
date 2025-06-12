import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './Sidebar.module.css';

export const Sidebar = () => {
  return (
    <aside className={styles.sidebar}>
      <h2 className={styles.brand}>Lagalley App</h2>
      <nav className={styles.nav}>
        <NavLink
          to="/"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
        >
          {/* Aquí podrías poner un icono */}
          <span>Inicio</span>
        </NavLink>
        <NavLink
          to="/parcelas/tabla"
          className={({ isActive }) => `${styles.navLink} ${isActive ? styles.navLinkActive : ''}`}
        >
          <span>Parcelas</span>
        </NavLink>
      </nav>
    </aside>
  );
};