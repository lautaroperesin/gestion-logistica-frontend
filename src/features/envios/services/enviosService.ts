import { EnviosApi } from '@/api';
import { apiConfig } from '@/api/config';
import type { EnvioDto, CreateEnvioDto, UpdateEnvioDto, EnvioDtoPagedResult } from '@/api';

const api = new EnviosApi(apiConfig);

export interface EnviosFilters {
  idConductor?: number;
  idCliente?: number;
  idVehiculo?: number;
  fechaSalidaDesde?: Date;
  fechaSalidaHasta?: Date;
  estadoEnvio?: number;
  numeroSeguimiento?: string;
  origen?: string;
  destino?: string;
}

export const enviosService = {
  // Obtener envíos con filtros y paginación
  getAll: async (
    page: number = 1, 
    pageSize: number = 10, 
    filters: EnviosFilters = {}
  ): Promise<EnvioDtoPagedResult> => {
    try {
      const response = await api.apiEnviosGet({
        pageNumber: page,
        pageSize: pageSize,
        idConductor: filters.idConductor,
        idCliente: filters.idCliente,
        idVehiculo: filters.idVehiculo,
        fechaSalidaDesde: filters.fechaSalidaDesde,
        fechaSalidaHasta: filters.fechaSalidaHasta,
        estadoEnvio: filters.estadoEnvio,
        numeroSeguimiento: filters.numeroSeguimiento,
        origen: filters.origen,
        destino: filters.destino,
      });
      return response;
    } catch (error) {
      console.error('Error al obtener envíos:', error);
      throw new Error('Error al cargar los envíos');
    }
  },

  // Obtener un envío por ID
  getById: async (id: number): Promise<EnvioDto> => {
    try {
      const response = await api.apiEnviosIdGet({ id });
      return response;
    } catch (error) {
      console.error('Error al obtener envío:', error);
      throw new Error('Error al cargar el envío');
    }
  },

  // Crear un nuevo envío
  create: async (envio: CreateEnvioDto): Promise<void> => {
    try {
      await api.apiEnviosPost({
        createEnvioDto: envio
      });
    } catch (error) {
      console.error('Error al crear envío:', error);
      throw new Error('Error al crear el envío');
    }
  },

  // Actualizar un envío
  update: async (id: number, envio: UpdateEnvioDto): Promise<void> => {
    try {
      await api.apiEnviosIdPut({
        id,
        updateEnvioDto: envio
      });
    } catch (error) {
      console.error('Error al actualizar envío:', error);
      throw new Error('Error al actualizar el envío');
    }
  },

  // Eliminar un envío
  delete: async (id: number): Promise<void> => {
    try {
      await api.apiEnviosIdDelete({ id });
    } catch (error) {
      console.error('Error al eliminar envío:', error);
      throw new Error('Error al eliminar el envío');
    }
  },

  // Actualizar estado de un envío
  updateEstado: async (id: number, estadoId: number): Promise<void> =>
  {
    try {
      await api.apiEnviosIdEstadoPatch({
        id,
        estadoEnvioDto: { idEstado: estadoId }
      });
    } catch (error) {
      console.error('Error al actualizar estado de envío:', error);
      throw new Error('Error al actualizar el estado del envío');
    }
  },

  // Obtener envíos por estado
  getByEstado: async (estadoId: number): Promise<EnvioDto[]> => {
    try {
      const response = await enviosService.getAll(1, 1000, { estadoEnvio: estadoId });
      return response.items || [];
    } catch (error) {
      console.error('Error al obtener envíos por estado:', error);
      throw new Error('Error al cargar los envíos por estado');
    }
  },

  // Obtener envíos por cliente
  getByCliente: async (clienteId: number): Promise<EnvioDto[]> => {
    try {
      const response = await enviosService.getAll(1, 1000, { idCliente: clienteId });
      return response.items || [];
    } catch (error) {
      console.error('Error al obtener envíos por cliente:', error);
      throw new Error('Error al cargar los envíos del cliente');
    }
  }
};

// Funciones de conveniencia actualizadas
export const fetchEnvios = (page: number = 1, pageSize: number = 10, filters: EnviosFilters = {}) => 
  enviosService.getAll(page, pageSize, filters);
export const fetchEnvioById = (id: number) => enviosService.getById(id);
export const createEnvio = (envio: CreateEnvioDto) => enviosService.create(envio);
export const updateEnvio = (id: number, envio: UpdateEnvioDto) => enviosService.update(id, envio);
export const deleteEnvio = (id: number) => enviosService.delete(id);
