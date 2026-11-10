import { lazy, Suspense } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { LoginPage } from './pages/LoginPage';
import { InicioPage } from './pages/InicioPage';
import { ParcelasPage } from './pages/ParcelasPage';
import { TablaDetalladaPage } from './pages/TablaDetalladaPage';
import { NuevaParcelaPage } from './pages/NuevaParcelaPage';
import { CrearParcelaPage } from './pages/CrearParcelaPage';
import { ImportarParcelaGisPage } from './pages/ImportarParcelaGisPage';
import { ParcelaDetailPage } from './pages/ParcelaDetailPage';
import { CamionesPage } from './pages/CamionesPage';
import { CamionFormPage } from './pages/CamionFormPage';
import { CamionDetailPage } from './pages/CamionDetailPage';
import { ConductoresPage } from './pages/ConductoresPage';
import { ConductorFormPage } from './pages/ConductorFormPage';
import { ConductorDetailPage } from './pages/ConductorDetailPage';
import { ConductorHomePage } from './pages/ConductorHomePage';
import { TransportesPage } from './pages/TransportesPage';
import { TransporteFormPage } from './pages/TransporteFormPage';
import { TransporteDetailPage } from './pages/TransporteDetailPage';
import { CentrosPage } from './pages/CentrosPage';
import { CentroFormPage } from './pages/CentroFormPage';
import { CentroDetailPage } from './pages/CentroDetailPage';
import { EudrDashboardPage } from './pages/EudrDashboardPage';
import { DashboardPage } from './pages/DashboardPage';
import { ExpedientesPage } from './pages/ExpedientesPage';
import { ExpedienteFormPage } from './pages/ExpedienteFormPage';
import { ExpedienteDetailPage } from './pages/ExpedienteDetailPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { ProveedorFormPage } from './pages/ProveedorFormPage';
import { ProveedorDetailPage } from './pages/ProveedorDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import { LoadingIndicator } from './components/LoadingIndicator';
import './App.css';

const ConductorEscanearPage = lazy(() => import('./pages/ConductorEscanearPage'));
const AgenteHomePage = lazy(() => import('./pages/AgenteHomePage'));
const AgenteEscanearPage = lazy(() => import('./pages/AgenteEscanearPage'));

const haySesion = () => {
  try {
    return sessionStorage.getItem('franky.sesion') === '1';
  } catch {
    // sin almacenamiento disponible
    return false;
  }
};

function App() {
  const { pathname } = useLocation();

  if (pathname !== '/login' && !haySesion()) return <Navigate to="/login" replace />;

  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<AppLayout />}>
          <Route index element={<InicioPage />} />

          <Route path="parcelas/nueva" element={<ErrorBoundary><NuevaParcelaPage /></ErrorBoundary>} />

          <Route path="parcelas" element={<ParcelasPage />}>
            <Route index element={<Navigate to="tabla" replace />} />
            <Route path="tabla" element={<ErrorBoundary><TablaDetalladaPage /></ErrorBoundary>} />
            <Route path="crear-sigpac" element={<ErrorBoundary><CrearParcelaPage /></ErrorBoundary>} />
            <Route path="importar-gis" element={<ErrorBoundary><ImportarParcelaGisPage /></ErrorBoundary>} />
            <Route path="detalle/:id" element={<ErrorBoundary><ParcelaDetailPage /></ErrorBoundary>} />
          </Route>

          <Route path="camiones" element={<ErrorBoundary><CamionesPage /></ErrorBoundary>} />
          <Route path="camiones/nuevo" element={<ErrorBoundary><CamionFormPage /></ErrorBoundary>} />
          <Route path="camiones/editar/:matricula" element={<ErrorBoundary><CamionFormPage /></ErrorBoundary>} />
          <Route path="camiones/:matricula" element={<ErrorBoundary><CamionDetailPage /></ErrorBoundary>} />

          <Route path="conductores" element={<ErrorBoundary><ConductoresPage /></ErrorBoundary>} />
          <Route path="conductores/nuevo" element={<ErrorBoundary><ConductorFormPage /></ErrorBoundary>} />
          <Route path="conductores/editar/:dni" element={<ErrorBoundary><ConductorFormPage /></ErrorBoundary>} />
          <Route path="conductores/:dni" element={<ErrorBoundary><ConductorDetailPage /></ErrorBoundary>} />

          <Route path="transportes" element={<ErrorBoundary><TransportesPage /></ErrorBoundary>} />
          <Route path="transportes/nuevo" element={<ErrorBoundary><TransporteFormPage /></ErrorBoundary>} />
          <Route path="transportes/editar/:id" element={<ErrorBoundary><TransporteFormPage /></ErrorBoundary>} />
          <Route path="transportes/:id" element={<ErrorBoundary><TransporteDetailPage /></ErrorBoundary>} />

          <Route path="centros" element={<ErrorBoundary><CentrosPage /></ErrorBoundary>} />
          <Route path="centros/nuevo" element={<ErrorBoundary><CentroFormPage /></ErrorBoundary>} />
          <Route path="centros/editar/:id" element={<ErrorBoundary><CentroFormPage /></ErrorBoundary>} />
          <Route path="centros/:id" element={<ErrorBoundary><CentroDetailPage /></ErrorBoundary>} />

          <Route path="proveedores" element={<ErrorBoundary><ProveedoresPage /></ErrorBoundary>} />
          <Route path="proveedores/nuevo" element={<ErrorBoundary><ProveedorFormPage /></ErrorBoundary>} />
          <Route path="proveedores/editar/:id" element={<ErrorBoundary><ProveedorFormPage /></ErrorBoundary>} />
          <Route path="proveedores/:id" element={<ErrorBoundary><ProveedorDetailPage /></ErrorBoundary>} />

          <Route path="expedientes" element={<ErrorBoundary><ExpedientesPage /></ErrorBoundary>} />
          <Route path="expedientes/nuevo" element={<ErrorBoundary><ExpedienteFormPage /></ErrorBoundary>} />
          <Route path="expedientes/editar/:id" element={<ErrorBoundary><ExpedienteFormPage /></ErrorBoundary>} />
          <Route path="expedientes/:id" element={<ErrorBoundary><ExpedienteDetailPage /></ErrorBoundary>} />
          <Route path="dashboard" element={<ErrorBoundary><DashboardPage /></ErrorBoundary>} />
          <Route path="eudr" element={<ErrorBoundary><EudrDashboardPage /></ErrorBoundary>} />

          <Route path="conductor" element={<ErrorBoundary><ConductorHomePage /></ErrorBoundary>} />
          <Route
            path="conductor/escanear/:transporteId"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingIndicator />}>
                  <ConductorEscanearPage />
                </Suspense>
              </ErrorBoundary>
            }
          />

          <Route
            path="agente"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingIndicator />}>
                  <AgenteHomePage />
                </Suspense>
              </ErrorBoundary>
            }
          />
          <Route
            path="agente/escanear"
            element={
              <ErrorBoundary>
                <Suspense fallback={<LoadingIndicator />}>
                  <AgenteEscanearPage />
                </Suspense>
              </ErrorBoundary>
            }
          />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;