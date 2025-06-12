import { Routes, Route, Navigate } from 'react-router-dom';
import { AppLayout } from './components/Layout/AppLayout';
import { DashboardPage } from './pages/DashboardPage';
import { ParcelasPage } from './pages/ParcelasPage';
import { TablaDetalladaPage } from './pages/TablaDetalladaPage';
import { CrearParcelaPage } from './pages/CrearParcelaPage';
import { ParcelaDetailPage } from './pages/ParcelaDetailPage';
import './App.css';

function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="parcelas" element={<ParcelasPage />}>
          <Route index element={<Navigate to="tabla" replace />} />
          <Route path="tabla" element={<TablaDetalladaPage />} />
          <Route path="crear" element={<CrearParcelaPage />} />
          <Route path="detalle/:id" element={<ParcelaDetailPage />} />
        </Route>
        <Route path="*" element={<h2>404: Página no encontrada</h2>} />
      </Route>
    </Routes>
  );
}

export default App;