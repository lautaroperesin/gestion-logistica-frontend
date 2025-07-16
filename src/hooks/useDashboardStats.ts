import { useConductoresStats } from '@/features/conductores/hooks/useConductores';
import { useClientesStats } from '@/features/clientes/hooks/useClientes';
import { useVehiculosStats } from '@/features/vehiculos/hooks/useVehiculos';
import { useEnviosStats } from '@/features/envios/hooks/useEnvios';
import { useFacturasStats } from '@/features/facturas/hooks/useFacturas';
import { useUbicacionesStats } from '@/features/ubicaciones/hooks/useUbicaciones';
import { useTiposCargaStats } from '@/features/tiposCarga/hooks/useTiposCarga';

/**
 * Hook centralizado para obtener todas las estadísticas del dashboard
 * usando React Query para una gestión optimizada de datos
 */
export const useDashboardStats = () => {
  // Obtener estadísticas de todas las entidades
  const clientesStats = useClientesStats();
  const conductoresStats = useConductoresStats();
  const vehiculosStats = useVehiculosStats();
  const enviosStats = useEnviosStats();
  const facturasStats = useFacturasStats();
  const ubicacionesStats = useUbicacionesStats();
  const tiposCargaStats = useTiposCargaStats();

  // Verificar si algún query está cargando
  const isLoading = 
    clientesStats.loading ||
    conductoresStats.loading ||
    vehiculosStats.loading ||
    enviosStats.loading ||
    ubicacionesStats.loading ||
    tiposCargaStats.loading;

  return {
    // Datos consolidados del dashboard
    stats: {
      // Entidades principales
      clientes: {
        total: clientesStats.totalClientes,
        conEmail: clientesStats.clientesConEmail,
        conTelefono: clientesStats.clientesConTelefono,
      },
      conductores: {
        total: conductoresStats.totalConductores,
        activos: conductoresStats.conductoresActivos,
      },
      vehiculos: {
        total: vehiculosStats.totalVehiculos,
        disponibles: vehiculosStats.vehiculosDisponibles,
        activos: vehiculosStats.vehiculosActivos,
      },
      envios: {
        total: enviosStats.totalEnvios,
        pendientes: enviosStats.enviosPendientes,
        entregados: enviosStats.enviosEntregados,
      },
      facturas: {
        total: facturasStats.totalFacturas,
        pendientes: facturasStats.facturasPendientes,
        pagadas: facturasStats.facturasPagadas,
        canceladas: facturasStats.facturasCanceladas,
        totalSubtotal: facturasStats.totalSubtotal,
        totalIva: facturasStats.totalIva,
        totalGeneral: facturasStats.totalGeneral,
      },
      ubicaciones: {
        total: ubicacionesStats.totalUbicaciones,
      },
      tiposCarga: {
        total: tiposCargaStats.totalTipos,
      },
    },
    
    // Estado de carga
    isLoading,
    
    // Resumen para cards principales del dashboard
    summary: {
      totalEntidades: 
        clientesStats.totalClientes + 
        conductoresStats.totalConductores + 
        vehiculosStats.totalVehiculos,
      actividad: {
        enviosPendientes: enviosStats.enviosPendientes,
        vehiculosActivos: vehiculosStats.vehiculosActivos,
        facturasPendientes: facturasStats.facturasPendientes,
      },
      ingresos: {
        totalFacturas: facturasStats.totalGeneral,
        facturasPagadas: facturasStats.facturasPagadas,
      }
    }
  };
};

export default useDashboardStats;
