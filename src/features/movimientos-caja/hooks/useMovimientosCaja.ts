import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { movimientosCajaService } from '../services/movimientosCajaService';
import type { CreateMovimientoCajaDto } from '../../../api';

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

// Hook para obtener un movimiento por ID
export const useMovimiento = (id: number) => {
  return useQuery({
    queryKey: movimientosKeys.detail(id),
    queryFn: () => movimientosCajaService.getById(id),
    enabled: id > 0,
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