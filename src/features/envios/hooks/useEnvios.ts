import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { enviosService, type EnviosFilters } from '../services/enviosService';
import type { EnvioDto, CreateEnvioDto, UpdateEnvioDto } from '@/api';

// Query keys para React Query
export const enviosKeys = {
  all: ['envios'] as const,
  lists: () => [...enviosKeys.all, 'list'] as const,
  list: (page: number, pageSize: number, filters: EnviosFilters) => 
    [...enviosKeys.lists(), { page, pageSize, filters }] as const,
  details: () => [...enviosKeys.all, 'detail'] as const,
  detail: (id: number) => [...enviosKeys.details(), id] as const,
};

// Hook para obtener envíos con filtros y paginación
export const useEnvios = (
  page: number = 1, 
  pageSize: number = 10, 
  filters: EnviosFilters = {}
) => {
  return useQuery({
    queryKey: enviosKeys.list(page, pageSize, filters),
    queryFn: () => enviosService.getAll(page, pageSize, filters),
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: (previousData) => previousData,
  });
};

// Hook para obtener un envío específico
export const useEnvio = (id: number) => {
  return useQuery({
    queryKey: enviosKeys.detail(id),
    queryFn: () => enviosService.getById(id),
    enabled: id > 0,
  });
};

// Hook para crear envío
export const useCreateEnvio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (envioData: CreateEnvioDto) => enviosService.create(envioData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enviosKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating envio:', error);
    },
  });
};

// Hook para actualizar envío
export const useUpdateEnvio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateEnvioDto }) => 
      enviosService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: enviosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: enviosKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error updating envio:', error);
    },
  });
};

// Hook para eliminar envío
export const useDeleteEnvio = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => enviosService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: enviosKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting envio:', error);
    },
  });
};

// Hook para obtener envíos por estado
export const useEnviosByEstado = (estadoId: number) => {
  return useQuery({
    queryKey: [...enviosKeys.all, 'estado', estadoId],
    queryFn: () => enviosService.getByEstado(estadoId),
    enabled: estadoId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para actualizar estado de un envío
export const useUpdateEnvioEstado = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ idEnvio, newEstadoId }: { idEnvio: number; newEstadoId: number }) => {
      if (!idEnvio) throw new Error('ID de envío requerido');

      return enviosService.updateEstado(idEnvio, newEstadoId);
    },
    onSuccess: (_, { idEnvio }) => {
      queryClient.invalidateQueries({ queryKey: enviosKeys.lists() });
      if (idEnvio) {
        queryClient.invalidateQueries({ queryKey: enviosKeys.detail(idEnvio) });
      }
    },
    onError: (error) => {
      console.error('Error updating envio status:', error);
    },
  });
};

// Hook para obtener envíos por cliente
export const useEnviosByCliente = (clienteId: number) => {
  return useQuery({
    queryKey: [...enviosKeys.all, 'cliente', clienteId],
    queryFn: () => enviosService.getByCliente(clienteId),
    enabled: clienteId > 0,
    staleTime: 5 * 60 * 1000,
  });
};

// Hook para estadísticas de envíos
export const useEnviosStats = () => {
  const { data: enviosData } = useEnvios(1, 1000);
  const envios = enviosData?.items || [];
  
  return {
    totalEnvios: enviosData?.totalItems || 0,
    enviosPendientes: envios.filter((e: EnvioDto) => e.estado?.idEstado === 1).length,
    enviosEntregados: envios.filter((e: EnvioDto) => e.estado?.idEstado === 2).length,
    loading: !enviosData,
  };
};
