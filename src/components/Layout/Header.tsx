import React from 'react';
import styles from './Header.module.css';

export const Header = () => {
  return (
    <header className={styles.header}>
      <h1 className={styles.title}>Panel de Gestión Forestal</h1>
      {/* Aquí podríamos añadir un buscador global, perfil de usuario, etc. */}
      <div>
        <span>Usuario</span>
      </div>
    </header>
  );
};