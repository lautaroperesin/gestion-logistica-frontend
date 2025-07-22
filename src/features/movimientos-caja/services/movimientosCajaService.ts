import { MovimientosCajaApi } from '@/api';
import { apiConfig } from '@/api/config';
import type { MovimientoCajaDto, CreateMovimientoCajaDto, MovimientoCajaDtoPagedResult } from '@/api';

const movimientosApi = new MovimientosCajaApi(apiConfig);

export const movimientosCajaService = {
  // Obtener todos los movimientos con paginación
  getAll: async (pageNumber: number = 1, pageSize: number = 10): Promise<MovimientoCajaDtoPagedResult> => {
    try {
      const response = await movimientosApi.apiMovimientosCajaGet({ pageNumber, pageSize });
      return response;
    } catch (error) {
      console.error('Error al obtener movimientos de caja:', error);
      throw new Error('Error al cargar los movimientos de caja');
    }
  },

  // Obtener todos los movimientos sin paginación (para compatibilidad)
  getAllUnpaginated: async (): Promise<MovimientoCajaDto[]> => {
    try {
      const response = await movimientosApi.apiMovimientosCajaGet({ pageNumber: 1, pageSize: 1000 });
      return response.items || [];
    } catch (error) {
      console.error('Error al obtener movimientos de caja:', error);
      throw new Error('Error al cargar los movimientos de caja');
    }
  },

  // Obtener un movimiento por ID
  getById: async (id: number): Promise<MovimientoCajaDto> => {
    try {
      const response = await movimientosApi.apiMovimientosCajaIdGet({ id });
      return response;
    } catch (error) {
      console.error('Error al obtener movimiento de caja:', error);
      throw new Error('Error al cargar el movimiento de caja');
    }
  },

  // Crear un nuevo movimiento (pago)
  create: async (movimiento: CreateMovimientoCajaDto): Promise<void> => {
    try {
      await movimientosApi.apiMovimientosCajaPost({
        createMovimientoCajaDto: movimiento
      });
    } catch (error) {
      console.error('Error al crear movimiento de caja:', error);
      throw new Error('Error al registrar el pago');
    }
  },

  // Eliminar un movimiento
  delete: async (id: number): Promise<void> => {
    try {
      await movimientosApi.apiMovimientosCajaIdDelete({ id });
    } catch (error) {
      console.error('Error al eliminar movimiento de caja:', error);
      throw new Error('Error al eliminar el movimiento de caja');
    }
  },

  // Obtener movimientos por factura
  getByFactura: async (facturaId: number): Promise<MovimientoCajaDto[]> => {
    try {
      const response = await movimientosApi.apiMovimientosCajaFacturaIdFacturaGet({ idFactura: facturaId });
      return response || [];
    } catch (error) {
      console.error('Error al obtener movimientos por factura:', error);
      throw new Error('Error al cargar los pagos de la factura');
    }
  }
};
