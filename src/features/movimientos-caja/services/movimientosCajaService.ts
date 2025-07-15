import { MovimientosCajaApi, MetodosPagoApi } from '@/api';
import { apiConfig } from '@/api/config';
import type { MovimientoCajaDto, CreateMovimientoCajaDto, MetodoPagoDto } from '@/api';

const movimientosApi = new MovimientosCajaApi(apiConfig);
const metodosApi = new MetodosPagoApi(apiConfig);

export const movimientosCajaService = {
  // Obtener todos los movimientos
  getAll: async (): Promise<MovimientoCajaDto[]> => {
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
      const allMovimientos = await movimientosCajaService.getAll();
      return allMovimientos.filter(mov => mov.factura?.idFactura === facturaId);
    } catch (error) {
      console.error('Error al obtener movimientos por factura:', error);
      throw new Error('Error al cargar los pagos de la factura');
    }
  },

  // Obtener métodos de pago disponibles
  getMetodosPago: async (): Promise<MetodoPagoDto[]> => {
    try {
      const response = await metodosApi.apiMetodosPagoGet();
      return response || [];
    } catch (error) {
      console.error('Error al obtener métodos de pago:', error);
      throw new Error('Error al cargar los métodos de pago');
    }
  }
};

// Funciones de conveniencia
export const fetchMovimientosCaja = () => movimientosCajaService.getAll();
export const fetchMovimientoCajaById = (id: number) => movimientosCajaService.getById(id);
export const createMovimientoCaja = (movimiento: CreateMovimientoCajaDto) => movimientosCajaService.create(movimiento);
export const deleteMovimientoCaja = (id: number) => movimientosCajaService.delete(id);
export const fetchMetodosPago = () => movimientosCajaService.getMetodosPago();
