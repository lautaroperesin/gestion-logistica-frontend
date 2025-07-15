import { Routes, Route } from 'react-router-dom';
import { ClientesPage } from '../features/clientes/pages/ClientesListPage';
import { ClienteFormPage } from '../features/clientes/pages/ClienteFormPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MainLayout } from '@/layouts/MainLayout';
import { EnviosPage } from '../features/envios/pages/EnviosPage';
import { EnvioFormPage } from '../features/envios/pages/EnvioFormPage';
import { ConductoresPage } from '@/features/conductores/pages/ConductoresListPage';
import { ConductorFormPageNew } from '@/features/conductores/pages/ConductorFormPageNew';
import { VehiculosPage } from '@/features/vehiculos/pages/VehiculosListPage';
import { VehiculoFormPage } from '@/features/vehiculos/pages/VehiculoFormPage';
import { TiposCargaListPage } from '@/features/tiposCarga/pages/TiposCargaListPage';
import { TipoCargaFormPage } from '@/features/tiposCarga/pages/TipoCargaFormPage';
import UbicacionesListPage from '@/features/ubicaciones/pages/UbicacionesListPage';
import UbicacionFormPage from '@/features/ubicaciones/pages/UbicacionFormPage';
import { FacturasPage } from '@/features/facturas/pages/FacturasPage';
import { FacturaFormPage } from '@/features/facturas/pages/FacturaFormPage';
import { MovimientosCajaPage } from '@/features/movimientos-caja/pages/MovimientosCajaPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="clientes/nuevo" element={<ClienteFormPage />} />
        <Route path="clientes/editar/:id" element={<ClienteFormPage />} />
        <Route path="conductores" element={<ConductoresPage />} />
        <Route path="conductores/nuevo" element={<ConductorFormPageNew />} />
        <Route path="conductores/editar/:id" element={<ConductorFormPageNew />} />
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
        
      </Route>
    </Routes>
  );
};
