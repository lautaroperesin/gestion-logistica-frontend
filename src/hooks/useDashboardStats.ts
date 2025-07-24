import { useQuery } from '@tanstack/react-query';

export interface DashboardStats {
  // Envíos
  totalEnvios: number;
  enviosEnTransito: number;
  enviosEntregados: number;
  enviosPendientes: number;
  enviosEsteMes: number;
  
  // Ingresos
  ingresosEsteMes: number;
  ingresosMesAnterior: number;
  facturacionPendiente: number;
  
  // Clientes
  totalClientes: number;
  clientesNuevosEsteMes: number;
  
  // Vehículos
  totalVehiculos: number;
  vehiculosActivos: number;
  vehiculosEnMantenimiento: number;
  
  // Eficiencia
  porcentajeEntregasATiempo: number;
  tiempoPromedioEntrega: number;
}

export interface EnvioReciente {
  id: number;
  numeroEnvio: string;
  cliente: string;
  destino: string;
  estado: string;
  fechaCreacion: Date;
}

export interface FacturaVencida {
  id: number;
  numeroFactura: string;
  cliente: string;
  monto: number;
  fechaVencimiento: Date;
  diasVencida: number;
}

export const useDashboardStats = () => {
  return useQuery<DashboardStats>({
    queryKey: ['dashboard-stats'],
    queryFn: async () => {
      // TODO: Implementar llamada real a la API cuando esté disponible
      // Por ahora retornamos datos mock
      return {
        totalEnvios: 248,
        enviosEnTransito: 12,
        enviosEntregados: 201,
        enviosPendientes: 35,
        enviosEsteMes: 45,
        
        ingresosEsteMes: 125000,
        ingresosMesAnterior: 98000,
        facturacionPendiente: 45000,
        
        totalClientes: 89,
        clientesNuevosEsteMes: 8,
        
        totalVehiculos: 15,
        vehiculosActivos: 12,
        vehiculosEnMantenimiento: 3,
        
        porcentajeEntregasATiempo: 94.5,
        tiempoPromedioEntrega: 2.3,
      };
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

export const useEnviosRecientes = () => {
  return useQuery<EnvioReciente[]>({
    queryKey: ['envios-recientes'],
    queryFn: async () => {
      // TODO: Implementar llamada real a la API
      return [
        {
          id: 1,
          numeroEnvio: 'ENV-2025-001',
          cliente: 'Empresa ABC',
          destino: 'Buenos Aires',
          estado: 'En tránsito',
          fechaCreacion: new Date('2025-01-23'),
        },
        {
          id: 2,
          numeroEnvio: 'ENV-2025-002',
          cliente: 'Comercial XYZ',
          destino: 'Córdoba',
          estado: 'Pendiente',
          fechaCreacion: new Date('2025-01-23'),
        },
        {
          id: 3,
          numeroEnvio: 'ENV-2025-003',
          cliente: 'Distribuidora 123',
          destino: 'Rosario',
          estado: 'Preparando',
          fechaCreacion: new Date('2025-01-22'),
        },
      ];
    },
    staleTime: 2 * 60 * 1000, // 2 minutos
  });
};

export const useFacturasVencidas = () => {
  return useQuery<FacturaVencida[]>({
    queryKey: ['facturas-vencidas'],
    queryFn: async () => {
      // TODO: Implementar llamada real a la API
      return [
        {
          id: 1,
          numeroFactura: 'FAC-001',
          cliente: 'Empresa ABC',
          monto: 15000,
          fechaVencimiento: new Date('2025-01-15'),
          diasVencida: 9,
        },
        {
          id: 2,
          numeroFactura: 'FAC-008',
          cliente: 'Comercial XYZ',
          monto: 8500,
          fechaVencimiento: new Date('2025-01-20'),
          diasVencida: 4,
        },
      ];
    },
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};
