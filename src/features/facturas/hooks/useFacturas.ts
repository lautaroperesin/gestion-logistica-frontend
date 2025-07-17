import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useMemo } from 'react';
import { facturasService } from '../services/facturasService';
import type { FacturaDto, CreateFacturaDto, UpdateFacturaDto } from '@/api';

// Query keys para React Query
export const facturasKeys = {
  all: ['facturas'] as const,
  lists: () => [...facturasKeys.all, 'list'] as const,
  details: () => [...facturasKeys.all, 'detail'] as const,
  detail: (id: number) => [...facturasKeys.details(), id] as const,
};

// Hook para obtener todas las facturas
export const useFacturas = () => {
  return useQuery({
    queryKey: facturasKeys.lists(),
    queryFn: () => facturasService.getAll(),
    staleTime: 5 * 60 * 1000, // 5 minutos
  });
};

// Hook para obtener una factura por ID
export const useFactura = (id: number) => {
  return useQuery({
    queryKey: facturasKeys.detail(id),
    queryFn: () => facturasService.getById(id),
    enabled: id > 0,
  });
};

// Hook para crear factura
export const useCreateFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateFacturaDto) => facturasService.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facturasKeys.lists() });
    },
    onError: (error) => {
      console.error('Error creating factura:', error);
    },
  });
};

// Hook para actualizar factura
export const useUpdateFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: UpdateFacturaDto }) => 
      facturasService.update(id, data),
    onSuccess: (_, { id }) => {
      queryClient.invalidateQueries({ queryKey: facturasKeys.lists() });
      queryClient.invalidateQueries({ queryKey: facturasKeys.detail(id) });
    },
    onError: (error) => {
      console.error('Error updating factura:', error);
    },
  });
};

// Hook para eliminar factura
export const useDeleteFactura = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => facturasService.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: facturasKeys.lists() });
    },
    onError: (error) => {
      console.error('Error deleting factura:', error);
    },
  });
};

// Hook para calcular totales de facturas
export const useFacturaCalculations = (facturas?: FacturaDto[]) => {
  const calculations = useMemo(() => {
    if (!facturas || facturas.length === 0) {
      return {
        totalFacturas: 0,
        totalSubtotal: 0,
        totalIva: 0,
        totalGeneral: 0,
        facturasPendientes: 0,
        facturasPagadas: 0,
        facturasCanceladas: 0,
      };
    }

    const totalSubtotal = facturas.reduce((sum, factura) => sum + (factura.subtotal || 0), 0);
    const totalIva = facturas.reduce((sum, factura) => sum + (factura.iva || 0), 0);
    const totalGeneral = facturas.reduce((sum, factura) => sum + (factura.total || 0), 0);

    const facturasPendientes = facturas.filter(f => f.estado === 0 || f.estado === 1).length;
    const facturasPagadas = facturas.filter(f => f.estado === 3).length;
    const facturasCanceladas = facturas.filter(f => f.estado === 4 || f.estado === 5).length;

    return {
      totalFacturas: facturas.length,
      totalSubtotal,
      totalIva,
      totalGeneral,
      facturasPendientes,
      facturasPagadas,
      facturasCanceladas,
    };
  }, [facturas]);

  return calculations;
};

// Hook para estadísticas de facturas usando React Query
export const useFacturasStats = () => {
  const { data: facturas = [] } = useFacturas();
  return useFacturaCalculations(facturas);
};
