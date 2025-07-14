import { EnviosApi } from '@/api';
import { apiConfig } from '@/api/config';
import type { EnvioDto, CreateEnvioDto, UpdateEnvioDto } from '@/api';

const api = new EnviosApi(apiConfig);

export const enviosService = {
  // Obtener todos los envíos
  getAll: async (): Promise<EnvioDto[]> => {
    try {
      const response = await api.apiEnviosGet({ pageNumber: 1, pageSize: 1000 });
      return response.items || [];
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

  // Obtener envíos por estado
  getByEstado: async (estadoId: number): Promise<EnvioDto[]> => {
    try {
      const allEnvios = await enviosService.getAll();
      return allEnvios.filter(envio => envio.estado?.idEstado === estadoId);
    } catch (error) {
      console.error('Error al obtener envíos por estado:', error);
      throw new Error('Error al cargar los envíos por estado');
    }
  },

  // Obtener envíos por cliente
  getByCliente: async (clienteId: number): Promise<EnvioDto[]> => {
    try {
      const allEnvios = await enviosService.getAll();
      return allEnvios.filter(envio => envio.cliente?.idCliente === clienteId);
    } catch (error) {
      console.error('Error al obtener envíos por cliente:', error);
      throw new Error('Error al cargar los envíos del cliente');
    }
  }
};

// Funciones de conveniencia
export const fetchEnvios = () => enviosService.getAll();
export const fetchEnvioById = (id: number) => enviosService.getById(id);
export const createEnvio = (envio: CreateEnvioDto) => enviosService.create(envio);
export const updateEnvio = (id: number, envio: UpdateEnvioDto) => enviosService.update(id, envio);
export const deleteEnvio = (id: number) => enviosService.delete(id);
