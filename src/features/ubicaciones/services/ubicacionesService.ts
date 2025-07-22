import { UbicacionesApi } from '@/api';
import { apiConfig } from '@/api/config';
import type { UbicacionDto, CreateUbicacionDto, UpdateUbicacionDto, UbicacionDtoPagedResult, ProvinciaDto, LocalidadDto, PaisDto } from '@/api';

const api = new UbicacionesApi(apiConfig);

export const ubicacionesService = {
  // Obtener todas las ubicaciones con paginación
  getAll: async (pageNumber: number = 1, pageSize: number = 10): Promise<UbicacionDtoPagedResult> => {
    try {
      const response = await api.apiUbicacionesGet({ pageNumber, pageSize });
      return response;
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      throw new Error('Error al cargar las ubicaciones');
    }
  },

  // Obtener todas las ubicaciones sin paginación (para compatibilidad)
  getAllUnpaginated: async (): Promise<UbicacionDto[]> => {
    try {
      const response = await api.apiUbicacionesGet({ pageNumber: 1, pageSize: 1000 });
      return response.items || [];
    } catch (error) {
      console.error('Error al obtener ubicaciones:', error);
      throw new Error('Error al cargar las ubicaciones');
    }
  },

  // Obtener una ubicación por ID
  getById: async (id: number): Promise<UbicacionDto> => {
    try {
      const response = await api.apiUbicacionesIdGet({ id });
      return response;
    } catch (error) {
      console.error('Error al obtener ubicación:', error);
      throw new Error('Error al cargar la ubicación');
    }
  },

  // Crear una nueva ubicación
  create: async (ubicacion: CreateUbicacionDto): Promise<void> => {
    try {
      await api.apiUbicacionesPost({
        createUbicacionDto: ubicacion
      });
    } catch (error) {
      console.error('Error al crear ubicación:', error);
      throw new Error('Error al crear la ubicación');
    }
  },

  // Actualizar una ubicación
  update: async (id: number, ubicacion: UpdateUbicacionDto): Promise<void> => {
    try {
      await api.apiUbicacionesIdPut({
        id,
        updateUbicacionDto: ubicacion
      });
    } catch (error) {
      console.error('Error al actualizar ubicación:', error);
      throw new Error('Error al actualizar la ubicación');
    }
  },

  // Eliminar una ubicación
  delete: async (id: number): Promise<void> => {
    try {
      await api.apiUbicacionesIdDelete({ id });
    } catch (error) {
      console.error('Error al eliminar ubicación:', error);
      throw new Error('Error al eliminar la ubicación');
    }
  },

  // Obtener provincias por país
  getProvinciasByPais: async (paisId: number): Promise<ProvinciaDto[]> => {
    try {
      const response = await api.apiUbicacionesPaisesPaisIdProvinciasGet({ paisId });
      return response || [];
    } catch (error) {
      console.error('Error al obtener provincias:', error);
      throw new Error('Error al cargar las provincias');
    }
  },

  // Obtener localidades por provincia
  getLocalidadesByProvincia: async (provinciaId: number): Promise<LocalidadDto[]> => {
    try {
      const response = await api.apiUbicacionesProvinciasProvinciaIdLocalidadesGet({ provinciaId });
      return response || [];
    } catch (error) {
      console.error('Error al obtener localidades:', error);
      throw new Error('Error al cargar las localidades');
    }
  },

  // Obtener paises
  getPaises: async (): Promise<PaisDto[]> => {
    try {
        const response = await api.apiUbicacionesPaisesGet();
        return response || [];
    } catch (error) {
      console.error('Error al obtener países:', error);
      throw new Error('Error al cargar los países');
    }
  }
};

// Funciones de conveniencia
export const fetchUbicaciones = () => ubicacionesService.getAll();
export const fetchUbicacionById = (id: number) => ubicacionesService.getById(id);
export const createUbicacion = (ubicacion: CreateUbicacionDto) => ubicacionesService.create(ubicacion);
export const updateUbicacion = (id: number, ubicacion: UpdateUbicacionDto) => ubicacionesService.update(id, ubicacion);
export const deleteUbicacion = (id: number) => ubicacionesService.delete(id);
export const fetchPaises = () => ubicacionesService.getPaises();
export const fetchProvinciasByPais = (paisId: number) => ubicacionesService.getProvinciasByPais(paisId);
export const fetchLocalidadesByProvincia = (provinciaId: number) => ubicacionesService.getLocalidadesByProvincia(provinciaId);
