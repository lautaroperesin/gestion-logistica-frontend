import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchConductores, createConductor, updateConductor, deleteConductor, fetchConductorById } from '../services/conductoresService';
import type { CreateConductorDto, UpdateConductorDto } from '@/api';

// Query keys para React Query
export const conductoresKeys = {
  all: ['conductores'] as const,
  lists: () => [...conductoresKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) => [...conductoresKeys.lists(), { page, pageSize }] as const,
  details: () => [...conductoresKeys.all, 'detail'] as const,
  detail: (id: number) => [...conductoresKeys.details(), id] as const,
};

// Hook para obtener conductores con paginación
export const useConductores = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: conductoresKeys.list(page, pageSize),
    queryFn: () => fetchConductores(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: (previousData) => previousData,
  });
};

// Hook para obtener un conductor específico
export const useConductor = (id: number) => {
  return useQuery({
    queryKey: conductoresKeys.detail(id),
    queryFn: () => fetchConductorById(id),
    enabled: id > 0,
  });
};

// Hook para crear conductor
export const useCreateConductor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (conductorData: CreateConductorDto) => createConductor(conductorData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conductoresKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating conductor:', error);
    },
  });
};

// Hook para actualizar conductor
export const useUpdateConductor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateConductorDto }) => 
      updateConductor(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: conductoresKeys.lists() });
      queryClient.invalidateQueries({ queryKey: conductoresKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error updating conductor:', error);
    },
  });
};

// Hook para eliminar conductor
export const useDeleteConductor = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteConductor(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: conductoresKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting conductor:', error);
    },
  });
};
