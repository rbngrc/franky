import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Header } from './Header';
import { MobileBottomNav } from './MobileBottomNav';
import { SeccionFondo } from './SeccionFondo';
import { BackLinks } from '../BackLinks';
import { useRole } from '../../features/config/RoleContext';
import styles from '../../styles/AppLayout.module.css';

export const AppLayout = () => {
  const { isConductor, isAgenteForestal } = useRole();

  return (
    <div className={styles.appLayout}>
      <Sidebar />
      <div className={`${styles.mainContent} ${(isConductor || isAgenteForestal) ? styles.mainContentMobile : ''}`}>
        <Header />
        <main className={styles.pageContent}>
          <SeccionFondo />
          <div className={styles.content}>
            <BackLinks />
            <Outlet />
          </div>
        </main>
      </div>
      {(isConductor || isAgenteForestal) && <MobileBottomNav />}
    </div>
  );
};
