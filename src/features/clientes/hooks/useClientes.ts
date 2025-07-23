import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { fetchClientes, createCliente, updateCliente, deleteCliente, fetchClienteById, fetchAllClientes } from '../services/clientesService';
import type { CreateClienteDto, UpdateClienteDto } from '@/api';

// Query keys para React Query
export const clientesKeys = {
  all: ['clientes'] as const,
  lists: () => [...clientesKeys.all, 'list'] as const,
  list: (page: number, pageSize: number) => [...clientesKeys.lists(), { page, pageSize }] as const,
  details: () => [...clientesKeys.all, 'detail'] as const,
  detail: (id: number) => [...clientesKeys.details(), id] as const,
};

// Hook para obtener clientes con paginación
export const useClientes = (page: number = 1, pageSize: number = 10) => {
  return useQuery({
    queryKey: clientesKeys.list(page, pageSize),
    queryFn: () => fetchClientes(page, pageSize),
    staleTime: 5 * 60 * 1000, // 5 minutos
    placeholderData: (previousData) => previousData, // Mantener datos anteriores mientras carga
  });
};

// Hook para obtener todos los clientes sin paginación para mostrar en selectores
export const useAllClientes = () => {
  return useQuery({
    queryKey: clientesKeys.lists(),
    queryFn: () => fetchAllClientes(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener un cliente específico
export const useCliente = (id: number) => {
  return useQuery({
    queryKey: clientesKeys.detail(id),
    queryFn: () => fetchClienteById(id),
    enabled: id > 0, // Solo ejecutar si el ID es válido
  });
};

// Hook para crear cliente
export const useCreateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (clienteData: CreateClienteDto) => createCliente(clienteData),
    onSuccess: () => {
      // Invalidar todas las listas de clientes para refrescar los datos
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating cliente:', error);
    },
  });
};

// Hook para actualizar cliente
export const useUpdateCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateClienteDto }) => 
      updateCliente(id, data),
    onSuccess: (_, { id }) => {
      // Invalidar las listas y el detalle específico
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
      queryClient.invalidateQueries({ queryKey: clientesKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error updating cliente:', error);
    },
  });
};

// Hook para eliminar cliente
export const useDeleteCliente = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => deleteCliente(id),
    onSuccess: () => {
      // Invalidar todas las listas de clientes
      queryClient.invalidateQueries({ queryKey: clientesKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting cliente:', error);
    },
  });
};
