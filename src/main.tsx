import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import 'leaflet/dist/leaflet.css';
import App from './App.tsx';
import './index.css';
import { AuthProvider } from './features/auth/context/AuthContext';
import { RoleProvider } from './features/config/RoleContext';
import { UnidadProvider } from './features/config/UnidadContext';
import { OfflineProvider } from './features/offline/OfflineProvider';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <RoleProvider>
          <UnidadProvider>
          <OfflineProvider>
            <App />
          </OfflineProvider>
        </UnidadProvider>
        </RoleProvider>
      </AuthProvider>
    </BrowserRouter>
  </StrictMode>,
);
