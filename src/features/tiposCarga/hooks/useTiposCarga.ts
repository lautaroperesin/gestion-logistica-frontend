import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { tiposCargaService } from '../services/tiposCargaService';

// Query keys para React Query
export const tiposCargaKeys = {
  all: ['tiposCarga'] as const,
  lists: () => [...tiposCargaKeys.all, 'list'] as const,
  details: () => [...tiposCargaKeys.all, 'detail'] as const,
  detail: (id: number) => [...tiposCargaKeys.details(), id] as const,
};

// Hook para obtener todos los tipos de carga
export const useTiposCarga = () => {
  return useQuery({
    queryKey: tiposCargaKeys.lists(),
    queryFn: () => tiposCargaService.getAll(),
    staleTime: 10 * 60 * 1000, // 10 minutos (datos más estáticos)
  });
};

// Hook para obtener un tipo de carga específico
export const useTipoCarga = (id: number) => {
  return useQuery({
    queryKey: tiposCargaKeys.detail(id),
    queryFn: () => tiposCargaService.getById(id),
    enabled: id > 0,
  });
};

// Hook para crear tipo de carga
export const useCreateTipoCarga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: { nombre: string }) => tiposCargaService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposCargaKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating tipo carga:', error);
    },
  });
};

// Hook para actualizar tipo de carga
export const useUpdateTipoCarga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: { nombre: string } }) => 
      tiposCargaService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: tiposCargaKeys.lists() });
      queryClient.invalidateQueries({ queryKey: tiposCargaKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error updating tipo carga:', error);
    },
  });
};

// Hook para eliminar tipo de carga
export const useDeleteTipoCarga = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => tiposCargaService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: tiposCargaKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting tipo carga:', error);
    },
  });
};
