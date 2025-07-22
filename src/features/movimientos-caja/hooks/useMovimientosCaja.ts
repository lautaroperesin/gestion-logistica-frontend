import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientosCajaService } from '../services/movimientosCajaService';
import type { 
  MovimientoCajaDto, 
  CreateMovimientoCajaDto
} from '../../../api';

// Query keys
export const movimientosKeys = {
  all: ['movimientos'] as const,
  lists: () => [...movimientosKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) => [...movimientosKeys.lists(), page, pageSize] as const,
  details: () => [...movimientosKeys.all, 'detail'] as const,
  detail: (id: number) => [...movimientosKeys.details(), id] as const,
  byFactura: (facturaId: number) => [...movimientosKeys.all, 'factura', facturaId] as const,
};

// Hook para obtener movimientos con paginación
export const useMovimientos = (currentPage: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: movimientosKeys.list(currentPage, pageSize),
    queryFn: () => movimientosCajaService.getAll(currentPage, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener todos los movimientos sin paginación (para compatibilidad)
export const useAllMovimientos = () => {
  return useQuery({
    queryKey: movimientosKeys.lists(),
    queryFn: () => movimientosCajaService.getAllUnpaginated(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un movimiento por ID
export const useMovimiento = (id: number) => {
  return useQuery({
    queryKey: movimientosKeys.detail(id),
    queryFn: () => movimientosCajaService.getById(id),
    enabled: id > 0,
  });
};

// Hook para obtener movimientos por factura
export const useMovimientosByFactura = (facturaId: number) => {
  return useQuery({
    queryKey: movimientosKeys.byFactura(facturaId),
    queryFn: () => movimientosCajaService.getByFactura(facturaId),
    enabled: facturaId > 0,
  });
};

// Hook para crear un movimiento
export const useCreateMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMovimientoCajaDto) => 
      movimientosCajaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movimientosKeys.all });
      // También invalidar facturas ya que el estado de pago puede cambiar
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });
};

// Hook para eliminar un movimiento
export const useDeleteMovimiento = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => movimientosCajaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: movimientosKeys.all });
      queryClient.invalidateQueries({ queryKey: ['facturas'] });
    },
  });
};

// Hook para estadísticas de movimientos
export const useMovimientosStats = (movimientos?: MovimientoCajaDto[]) => {
  if (!movimientos) {
    return {
      totalMovimientos: 0,
      montoTotal: 0,
      porMetodo: {} as Record<string, { cantidad: number; monto: number }>,
    };
  }

  const totalMovimientos = movimientos.length;
  const montoTotal = movimientos.reduce((sum, mov) => sum + (mov.monto || 0), 0);

  // Estadísticas por método de pago
  const porMetodo = movimientos.reduce((acc, mov) => {
    const metodoPago = mov.metodoPago?.nombre || 'Sin método';
    if (!acc[metodoPago]) {
      acc[metodoPago] = { cantidad: 0, monto: 0 };
    }
    acc[metodoPago].cantidad += 1;
    acc[metodoPago].monto += mov.monto || 0;
    return acc;
  }, {} as Record<string, { cantidad: number; monto: number }>);

  return {
    totalMovimientos,
    montoTotal,
    porMetodo,
  };
};
