import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { MetodosPagoApi } from '@/api';
import type { MetodoPagoDto } from '@/api';
import { apiConfig } from '@/api/config';

const metodosPagoApi = new MetodosPagoApi(apiConfig);

// Hook para obtener todos los métodos de pago
export const useMetodosPago = () => {
  return useQuery<MetodoPagoDto[]>({
    queryKey: ['metodos-pago'],
    queryFn: async () => {
      const response = await metodosPagoApi.apiMetodosPagoGet();
      return response || [];
    },
  });
};

// Hook para obtener un método de pago por ID
export const useMetodoPago = (id: number) => {
  return useQuery<MetodoPagoDto>({
    queryKey: ['metodos-pago', id],
    queryFn: async () => {
      const response = await metodosPagoApi.apiMetodosPagoIdGet({ id });
      return response;
    },
    enabled: id > 0,
  });
};

// Hook para crear método de pago
export const useCreateMetodoPago = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: MetodoPagoDto) => {
      return await metodosPagoApi.apiMetodosPagoPost({ metodoPagoDto: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos-pago'] });
    },
  });
};

// Hook para actualizar método de pago
export const useUpdateMetodoPago = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: number; data: MetodoPagoDto }) => {
      return await metodosPagoApi.apiMetodosPagoIdPut({ id, metodoPagoDto: data });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos-pago'] });
    },
  });
};

// Hook para eliminar método de pago
export const useDeleteMetodoPago = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: number) => {
      return await metodosPagoApi.apiMetodosPagoIdDelete({ id });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['metodos-pago'] });
    },
  });
};
