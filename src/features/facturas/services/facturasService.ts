import { FacturasApi } from '@/api';
import { apiConfig } from '@/api/config';
import type { FacturaDto, CreateFacturaDto, UpdateFacturaDto, FacturaDtoPagedResult } from '@/api';

const api = new FacturasApi(apiConfig);

export const facturasService = {
  // Obtener todas las facturas con paginación
  getAll: async (pageNumber: number = 1, pageSize: number = 10): Promise<FacturaDtoPagedResult> => {
    try {
      const response = await api.apiFacturasGet({ pageNumber, pageSize });
      return response;
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw new Error('Error al cargar las facturas');
    }
  },

  // Obtener todas las facturas sin paginación (para compatibilidad)
  getAllUnpaginated: async (): Promise<FacturaDto[]> => {
    try {
      const response = await api.apiFacturasGet({ pageNumber: 1, pageSize: 1000 });
      return response.items || [];
    } catch (error) {
      console.error('Error al obtener facturas:', error);
      throw new Error('Error al cargar las facturas');
    }
  },

  // Obtener una factura por ID
  getById: async (id: number): Promise<FacturaDto> => {
    try {
      const response = await api.apiFacturasIdGet({ id });
      return response;
    } catch (error) {
      console.error('Error al obtener factura:', error);
      throw new Error('Error al cargar la factura');
    }
  },

  // Crear una nueva factura
  create: async (factura: CreateFacturaDto): Promise<void> => {
    try {
      await api.apiFacturasPost({
        createFacturaDto: factura
      });
    } catch (error) {
      console.error('Error al crear factura:', error);
      throw new Error('Error al crear la factura');
    }
  },

  // Actualizar una factura
  update: async (id: number, factura: UpdateFacturaDto): Promise<void> => {
    try {
      await api.apiFacturasIdPut({
        id,
        updateFacturaDto: factura
      });
    } catch (error: any) {
        let errorMessage = "Error al actualizar la factura";

      if (error.response && error.response.json) {
        const errorBody = await error.response.json();
        errorMessage = errorBody?.message || JSON.stringify(errorBody);
      }

      console.error("Error al actualizar factura:", error);
      throw new Error(errorMessage);
    }
  },

  // Eliminar una factura
  delete: async (id: number): Promise<void> => {
    try {
      await api.apiFacturasIdDelete({ id });
    } catch (error) {
      console.error('Error al eliminar factura:', error);
      throw new Error('Error al eliminar la factura');
    }
  },

  // Obtener facturas por estado
/*   getByEstado: async (estado: number): Promise<FacturaDto[]> => {
    try {
      const allFacturas = await facturasService.getAllUnpaginated();
      return allFacturas.filter(factura => factura.estado === estado);
    } catch (error) {
      console.error('Error al obtener facturas por estado:', error);
      throw new Error('Error al cargar las facturas por estado');
    }
  }, */

  // Obtener facturas por cliente
/*   getByCliente: async (clienteId: number): Promise<FacturaDto[]> => {
    try {
      const allFacturas = await facturasService.getAllUnpaginated();
      return allFacturas.filter(factura => factura.cliente?.idCliente === clienteId);
    } catch (error) {
      console.error('Error al obtener facturas por cliente:', error);
      throw new Error('Error al cargar las facturas del cliente');
    }
  } */
};

// Funciones de conveniencia
export const fetchFacturas = (pageNumber?: number, pageSize?: number) => 
  pageNumber && pageSize ? facturasService.getAll(pageNumber, pageSize) : facturasService.getAllUnpaginated();
export const fetchFacturaById = (id: number) => facturasService.getById(id);
export const createFactura = (factura: CreateFacturaDto) => facturasService.create(factura);
export const updateFactura = (id: number, factura: UpdateFacturaDto) => facturasService.update(id, factura);
export const deleteFactura = (id: number) => facturasService.delete(id);
