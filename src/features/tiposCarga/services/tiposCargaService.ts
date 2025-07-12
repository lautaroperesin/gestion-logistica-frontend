import { TiposCargaApi } from '@/api';
import { apiConfig } from '@/api/config';
import type { TipoCargaDto } from '@/api';

const api = new TiposCargaApi(apiConfig);

export const tiposCargaService = {
  // Obtener todos los tipos de carga
  getAll: async (): Promise<TipoCargaDto[]> => {
    try {
      const response = await api.apiTiposCargaGet();
      return response || [];
    } catch (error) {
      console.error('Error al obtener tipos de carga:', error);
      throw new Error('Error al cargar los tipos de carga');
    }
  },

  // Obtener un tipo de carga por ID
  getById: async (id: number): Promise<TipoCargaDto> => {
    try {
      const response = await api.apiTiposCargaIdGet({ id });
      return response;
    } catch (error) {
      console.error('Error al obtener tipo de carga:', error);
      throw new Error('Error al cargar el tipo de carga');
    }
  },

  // Crear un nuevo tipo de carga
  create: async (tipoCarga: { nombre: string }): Promise<TipoCargaDto> => {
    try {
      const response = await api.apiTiposCargaPost({
        tipoCargaDto: {
          nombre: tipoCarga.nombre
        }
      });
      return response;
    } catch (error) {
      console.error('Error al crear tipo de carga:', error);
      throw new Error('Error al crear el tipo de carga');
    }
  },

  // Actualizar un tipo de carga
  update: async (id: number, tipoCarga: { nombre: string }): Promise<void> => {
    try {
      await api.apiTiposCargaIdPut({
        id,
        tipoCargaDto: {
          idTipoCarga: id,
          nombre: tipoCarga.nombre
        }
      });
    } catch (error) {
      console.error('Error al actualizar tipo de carga:', error);
      throw new Error('Error al actualizar el tipo de carga');
    }
  },

  // Eliminar un tipo de carga
  delete: async (id: number): Promise<void> => {
    try {
      await api.apiTiposCargaIdDelete({ id });
    } catch (error) {
      console.error('Error al eliminar tipo de carga:', error);
      throw new Error('Error al eliminar el tipo de carga');
    }
  }
};

// Funciones de conveniencia
export const fetchTiposCarga = () => tiposCargaService.getAll();
export const fetchTipoCargaById = (id: number) => tiposCargaService.getById(id);
export const createTipoCarga = (tipoCarga: { nombre: string }) => tiposCargaService.create(tipoCarga);
export const updateTipoCarga = (id: number, tipoCarga: { nombre: string }) => tiposCargaService.update(id, tipoCarga);
export const deleteTipoCarga = (id: number) => tiposCargaService.delete(id);
