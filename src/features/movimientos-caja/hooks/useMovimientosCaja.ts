import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientosCajaService } from '../services/movimientosCajaService';
import type { 
  MovimientoCajaDto, 
  CreateMovimientoCajaDto,
  MetodoPagoDto
} from '../../../api';

// Query keys
export const movimientosKeys = {
  all: ['movimientos'] as const,
  lists: () => [...movimientosKeys.all, 'list'] as const,
  list: (filters: string) => [...movimientosKeys.lists(), filters] as const,
  details: () => [...movimientosKeys.all, 'detail'] as const,
  detail: (id: number) => [...movimientosKeys.details(), id] as const,
  byFactura: (facturaId: number) => [...movimientosKeys.all, 'factura', facturaId] as const,
};

export const metodosKeys = {
  all: ['metodos-pago'] as const,
  lists: () => [...metodosKeys.all, 'list'] as const,
};

// Hook para obtener todos los movimientos
export const useMovimientos = (pageNumber?: number, pageSize?: number) => {
  return useQuery({
    queryKey: movimientosKeys.list(`page-${pageNumber}-size-${pageSize}`),
    queryFn: () => movimientosCajaService.getAll(),
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

// Hook para obtener métodos de pago
export const useMetodosPago = () => {
  return useQuery({
    queryKey: metodosKeys.lists(),
    queryFn: () => movimientosCajaService.getMetodosPago(),
    staleTime: 10 * 60 * 1000, // 10 minutos
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
      promedioMonto: 0,
      porMetodo: {} as Record<string, { cantidad: number; monto: number }>,
    };
  }

  const totalMovimientos = movimientos.length;
  const montoTotal = movimientos.reduce((sum, mov) => sum + (mov.monto || 0), 0);
  const promedioMonto = totalMovimientos > 0 ? montoTotal / totalMovimientos : 0;

  // Estadísticas por método de pago
  const porMetodo = movimientos.reduce((acc, mov) => {
    const metodoPago = mov.metodoPago?.id?.toString() || 'Sin método';
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
    promedioMonto,
    porMetodo,
  };
};
