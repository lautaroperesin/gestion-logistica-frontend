import { useState, useEffect, useCallback, useMemo } from 'react';
import { facturasService } from '../services/facturasService';
import type { FacturaDto, CreateFacturaDto, UpdateFacturaDto } from '@/api';

// Hook para obtener todas las facturas
export const useFacturas = () => {
  const [data, setData] = useState<FacturaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFacturas = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const facturas = await facturasService.getAll();
      setData(facturas);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchFacturas();
  }, [fetchFacturas]);

  return {
    data,
    loading,
    error,
    refetch: fetchFacturas
  };
};

// Hook para obtener una factura por ID
export const useFactura = (id: number) => {
  const [data, setData] = useState<FacturaDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchFactura = useCallback(async () => {
    if (!id) return;
    
    try {
      setLoading(true);
      setError(null);
      const factura = await facturasService.getById(id);
      setData(factura);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchFactura();
  }, [fetchFactura]);

  return {
    data,
    loading,
    error,
    refetch: fetchFactura
  };
};

// Hook para crear factura
export const useCreateFactura = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createFactura = async (newFactura: CreateFacturaDto) => {
    try {
      setLoading(true);
      setError(null);
      await facturasService.create(newFactura);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    createFactura,
    loading,
    error
  };
};

// Hook para actualizar factura
export const useUpdateFactura = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const updateFactura = async (id: number, data: UpdateFacturaDto) => {
    try {
      setLoading(true);
      setError(null);
      await facturasService.update(id, data);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    updateFactura,
    loading,
    error
  };
};

// Hook para eliminar factura
export const useDeleteFactura = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const deleteFactura = async (id: number) => {
    try {
      setLoading(true);
      setError(null);
      await facturasService.delete(id);
      return { success: true };
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      setLoading(false);
    }
  };

  return {
    deleteFactura,
    loading,
    error
  };
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
    const facturasPagadas = facturas.filter(f => f.estado === 2).length;
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
