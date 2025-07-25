import { useQuery } from '@tanstack/react-query';
import { DashboardApi } from '@/api/apis/DashboardApi';
import type { DashboardStatsDto, EnvioRecienteDto, FacturaDto } from '@/api/models';
import { apiConfig } from '@/api/config';

export const useDashboardStats = () => {
  return useQuery<DashboardStatsDto>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      const dashboardApi = new DashboardApi(apiConfig);
      return await dashboardApi.apiDashboardEstadisticasGet();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useEnviosRecientes = () => {
  return useQuery<EnvioRecienteDto[]>({
    queryKey: ['envios-recientes'],
    queryFn: async () => {
      const dashboardApi = new DashboardApi(apiConfig);
      return await dashboardApi.apiDashboardEnviosRecientesGet();
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useFacturasVencidas = () => {
  return useQuery<FacturaDto[]>({
    queryKey: ['facturas-vencidas'],
    queryFn: async () => {
      const dashboardApi = new DashboardApi(apiConfig);
      return await dashboardApi.apiDashboardFacturasVencidasGet();
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
