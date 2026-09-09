import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ParcelasPage } from './pages/ParcelasPage';
import { TablaDetalladaPage } from './pages/TablaDetalladaPage';
import { CrearParcelaPage } from './pages/CrearParcelaPage';
import { ParcelaDetailPage } from './pages/ParcelaDetailPage';
import { CamionesPage } from './pages/CamionesPage';
import { CamionFormPage } from './pages/CamionFormPage';
import { CamionDetailPage } from './pages/CamionDetailPage';
import { CamionerosPage } from './pages/CamionerosPage';
import { CamioneroFormPage } from './pages/CamioneroFormPage';
import { CamioneroDetailPage } from './pages/CamioneroDetailPage';
import { TransportesPage } from './pages/TransportesPage';
import { TransporteFormPage } from './pages/TransporteFormPage';
import { TransporteDetailPage } from './pages/TransporteDetailPage';
import { CentrosPage } from './pages/CentrosPage';
import { CentroFormPage } from './pages/CentroFormPage';
import { CentroDetailPage } from './pages/CentroDetailPage';
import { EudrDashboardPage } from './pages/EudrDashboardPage';
import { ProveedoresPage } from './pages/ProveedoresPage';
import { ProveedorFormPage } from './pages/ProveedorFormPage';
import { ProveedorDetailPage } from './pages/ProveedorDetailPage';
import { NotFoundPage } from './pages/NotFoundPage';
import { ErrorBoundary } from './components/ErrorBoundary/ErrorBoundary';
import './App.css';

function App() {
  return (
    <ErrorBoundary>
      <Routes>
        <Route path="/" element={<AppLayout />}>
          <Route index element={<DashboardPage />} />

          <Route path="parcelas" element={<ParcelasPage />}>
            <Route index element={<Navigate to="tabla" replace />} />
            <Route path="tabla" element={<ErrorBoundary><TablaDetalladaPage /></ErrorBoundary>} />
            <Route path="crear-sigpac" element={<ErrorBoundary><CrearParcelaPage /></ErrorBoundary>} />
            <Route path="detalle/:id" element={<ErrorBoundary><ParcelaDetailPage /></ErrorBoundary>} />
          </Route>

          <Route path="camiones" element={<ErrorBoundary><CamionesPage /></ErrorBoundary>} />
          <Route path="camiones/nuevo" element={<ErrorBoundary><CamionFormPage /></ErrorBoundary>} />
          <Route path="camiones/editar/:matricula" element={<ErrorBoundary><CamionFormPage /></ErrorBoundary>} />
          <Route path="camiones/:matricula" element={<ErrorBoundary><CamionDetailPage /></ErrorBoundary>} />

          <Route path="camioneros" element={<ErrorBoundary><CamionerosPage /></ErrorBoundary>} />
          <Route path="camioneros/nuevo" element={<ErrorBoundary><CamioneroFormPage /></ErrorBoundary>} />
          <Route path="camioneros/editar/:dni" element={<ErrorBoundary><CamioneroFormPage /></ErrorBoundary>} />
          <Route path="camioneros/:dni" element={<ErrorBoundary><CamioneroDetailPage /></ErrorBoundary>} />

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

          <Route path="eudr" element={<ErrorBoundary><EudrDashboardPage /></ErrorBoundary>} />

          <Route path="*" element={<NotFoundPage />} />
        </Route>
      </Routes>
    </ErrorBoundary>
  );
}

export default App;