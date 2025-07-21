import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuthStatus } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { LoginPage } from '@/pages/LoginPage';
import { RegisterPage } from '@/pages/RegisterPage';
import { ClientesPage } from '../features/clientes/pages/ClientesListPage';
import { ClienteFormPage } from '../features/clientes/pages/ClienteFormPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MainLayout } from '@/layouts/MainLayout';
import { EnviosPage } from '../features/envios/pages/EnviosPage';
import { EnvioFormPage } from '../features/envios/pages/EnvioFormPage';
import { ConductoresPage } from '@/features/conductores/pages/ConductoresListPage';
import { ConductorFormPage } from '@/features/conductores/pages/ConductorFormPage';
import { VehiculosPage } from '@/features/vehiculos/pages/VehiculosListPage';
import { VehiculoFormPage } from '@/features/vehiculos/pages/VehiculoFormPage';
import { TiposCargaListPage } from '@/features/tiposCarga/pages/TiposCargaListPage';
import { TipoCargaFormPage } from '@/features/tiposCarga/pages/TipoCargaFormPage';
import UbicacionesListPage from '@/features/ubicaciones/pages/UbicacionesListPage';
import UbicacionFormPage from '@/features/ubicaciones/pages/UbicacionFormPage';
import { FacturasPage } from '@/features/facturas/pages/FacturasPage';
import { FacturaFormPage } from '@/features/facturas/pages/FacturaFormPage';
import { MovimientosCajaPage } from '@/features/movimientos-caja/pages/MovimientosCajaPage';
import { MetodosPagoPage } from '@/features/metodos-pago/pages/MetodosPagoPage';
import { MetodoPagoFormPage } from '@/features/metodos-pago/pages/MetodoPagoFormPage';

export const AppRoutes = () => {
  const { isAuthenticated, isLoading } = useAuthStatus();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-green-500"></div>
      </div>
    );
  }

  return (
    <Routes>
      {/* Public routes */}
      <Route 
        path="/login" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <LoginPage />} 
      />
      <Route 
        path="/register" 
        element={isAuthenticated ? <Navigate to="/" replace /> : <RegisterPage />} 
      />

      {/* Protected routes */}
      <Route path="/" element={
        <ProtectedRoute>
          <MainLayout />
        </ProtectedRoute>
      }>
        <Route index element={<DashboardPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="clientes/nuevo" element={<ClienteFormPage />} />
        <Route path="clientes/editar/:id" element={<ClienteFormPage />} />
        <Route path="conductores" element={<ConductoresPage />} />
        <Route path="conductores/nuevo" element={<ConductorFormPage />} />
        <Route path="conductores/editar/:id" element={<ConductorFormPage />} />
        <Route path='vehiculos' element={<VehiculosPage />} />
        <Route path="vehiculos/nuevo" element={<VehiculoFormPage />} />
        <Route path="vehiculos/editar/:id" element={<VehiculoFormPage />} />
        <Route path="envios" element={<EnviosPage />} />
        <Route path="envios/nuevo" element={<EnvioFormPage />} />
        <Route path="envios/editar/:id" element={<EnvioFormPage />} />
        <Route path="tipos-carga" element={<TiposCargaListPage />} />
        <Route path="tipos-carga/nuevo" element={<TipoCargaFormPage />} />
        <Route path="tipos-carga/editar/:id" element={<TipoCargaFormPage />} />
        <Route path="ubicaciones" element={<UbicacionesListPage />} />
        <Route path="ubicaciones/nuevo" element={<UbicacionFormPage />} />
        <Route path="ubicaciones/editar/:id" element={<UbicacionFormPage />} />
        <Route path="facturas" element={<FacturasPage />} />
        <Route path="facturas/nueva" element={<FacturaFormPage />} />
        <Route path="facturas/editar/:id" element={<FacturaFormPage />} />
        <Route path="movimientos-caja" element={<MovimientosCajaPage />} />
        <Route path="metodos-pago" element={<MetodosPagoPage />} />
        <Route path="metodos-pago/nuevo" element={<MetodoPagoFormPage />} />
        <Route path="metodos-pago/editar/:id" element={<MetodoPagoFormPage />} />
      </Route>

      {/* Fallback for unauthenticated users */}
      <Route path="*" element={<Navigate to={isAuthenticated ? "/" : "/login"} replace />} />
    </Routes>
  );
};
