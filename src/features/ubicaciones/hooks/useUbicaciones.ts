import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ubicacionesService } from '../services/ubicacionesService';
import type { CreateUbicacionDto, UpdateUbicacionDto } from '@/api';

// Query keys para React Query
export const ubicacionesKeys = {
  all: ['ubicaciones'] as const,
  lists: () => [...ubicacionesKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) => [...ubicacionesKeys.lists(), page, pageSize] as const,
  details: () => [...ubicacionesKeys.all, 'detail'] as const,
  detail: (id: number) => [...ubicacionesKeys.details(), id] as const,
  paises: () => [...ubicacionesKeys.all, 'paises'] as const,
  provincias: (paisId: number) => [...ubicacionesKeys.all, 'provincias', paisId] as const,
  localidades: (provinciaId: number) => [...ubicacionesKeys.all, 'localidades', provinciaId] as const,
};

// Hook para obtener ubicaciones con paginación
export function useUbicaciones(currentPage: number = 1, pageSize: number = 10) {
  return useQuery({
    queryKey: ubicacionesKeys.list(currentPage, pageSize),
    queryFn: () => ubicacionesService.getAll(currentPage, pageSize),
    staleTime: 10 * 60 * 1000, // 10 minutos (datos geográficos más estáticos)
  });
}

// Hook para obtener todas las ubicaciones sin paginación (para compatibilidad)
export function useAllUbicaciones() {
  return useQuery({
    queryKey: ubicacionesKeys.lists(),
    queryFn: () => ubicacionesService.getAllUnpaginated(),
    staleTime: 10 * 60 * 1000, // 10 minutos
  });
}

// Hook para obtener una ubicación específica
export function useUbicacion(id: number) {
  return useQuery({
    queryKey: ubicacionesKeys.detail(id),
    queryFn: () => ubicacionesService.getById(id),
    enabled: id > 0,
  });
}

// Hook para crear ubicación
export const useCreateUbicacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUbicacionDto) => ubicacionesService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ubicacionesKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating ubicacion:', error);
    },
  });
};

// Hook para actualizar ubicación
export const useUpdateUbicacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateUbicacionDto }) => 
      ubicacionesService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: ubicacionesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: ubicacionesKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error updating ubicacion:', error);
    },
  });
};

// Hook para eliminar ubicación
export const useDeleteUbicacion = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => ubicacionesService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ubicacionesKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting ubicacion:', error);
    },
  });
};

// Hooks para datos jerárquicos
export function usePaises() {
  return useQuery({
    queryKey: ubicacionesKeys.paises(),
    queryFn: () => ubicacionesService.getPaises(),
    staleTime: 60 * 60 * 1000, // 1 hora (datos muy estáticos)
  });
}

export function useProvinciasByPais(paisId: number | undefined) {
  return useQuery({
    queryKey: ubicacionesKeys.provincias(paisId || 0),
    queryFn: () => ubicacionesService.getProvinciasByPais(paisId!),
    enabled: !!paisId && paisId > 0,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}

export function useLocalidadesByProvincia(provinciaId: number | undefined) {
  return useQuery({
    queryKey: ubicacionesKeys.localidades(provinciaId || 0),
    queryFn: () => ubicacionesService.getLocalidadesByProvincia(provinciaId!),
    enabled: !!provinciaId && provinciaId > 0,
    staleTime: 30 * 60 * 1000, // 30 minutos
  });
}
