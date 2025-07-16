import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchVehiculos, createVehiculo, updateVehiculo, deleteVehiculo, fetchVehiculoById } from '../services//vehiculosService';
import type { CreateVehiculoDto, UpdateVehiculoDto } from '@/api';

// Query keys para React Query
export const vehiculosKeys = {
  all: ['vehiculos'] as const,
  lists: () => [...vehiculosKeys.all, 'list'] as const,
  details: () => [...vehiculosKeys.all, 'detail'] as const,
  detail: (id: number) => [...vehiculosKeys.details(), id] as const,
};

// Hook para obtener todos los vehículos
export const useVehiculos = () => {
  return useQuery({
    queryKey: vehiculosKeys.lists(),
    queryFn: () => fetchVehiculos(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un vehículo específico
export const useVehiculo = (id: number) => {
  return useQuery({
    queryKey: vehiculosKeys.detail(id),
    queryFn: () => fetchVehiculoById(id),
    enabled: id > 0,
  });
};

// Hook para crear vehículo
export const useCreateVehiculo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (vehiculoData: CreateVehiculoDto) => createVehiculo(vehiculoData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiculosKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating vehiculo:', error);
    },
  });
};

// Hook para actualizar vehículo
export const useUpdateVehiculo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateVehiculoDto }) => 
      updateVehiculo(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: vehiculosKeys.lists() });
      queryClient.invalidateQueries({ queryKey: vehiculosKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error updating vehiculo:', error);
    },
  });
};

// Hook para eliminar vehículo
export const useDeleteVehiculo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteVehiculo(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vehiculosKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting vehiculo:', error);
    },
  });
};

// Hook para estadísticas de vehículos
export const useVehiculosStats = () => {
  const { data: vehiculos = [] } = useVehiculos();
  
  return {
    totalVehiculos: vehiculos.length,
    vehiculosActivos: vehiculos.filter(v => v.estado === 1).length, // Asumiendo 1 = Activo
    vehiculosDisponibles: vehiculos.filter(v => v.estado === 1).length,
    loading: !vehiculos,
  };
};
