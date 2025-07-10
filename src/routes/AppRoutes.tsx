import { Routes, Route } from 'react-router-dom';
import { ClientesPage } from '../features/clientes/pages/ClientesListPage';
import { ClienteFormPage } from '../features/clientes/pages/ClienteFormPage';
import { DashboardPage } from '../features/dashboard/pages/DashboardPage';
import { MainLayout } from '@/layouts/MainLayout';
import { EnviosPage } from '../features/envios/pages/EnviosPage';

export const AppRoutes = () => {
  return (
    <Routes>
      <Route path="/" element={<MainLayout />}>
        <Route index element={<DashboardPage />} />
        <Route path="clientes" element={<ClientesPage />} />
        <Route path="clientes/nuevo" element={<ClienteFormPage />} />
        <Route path="clientes/editar/:id" element={<ClienteFormPage />} />
        <Route path="envios" element={<EnviosPage />} />
      </Route>
    </Routes>
  );
};
