import { ConductoresApi } from '@/api/apis/ConductoresApi';
import { apiConfig } from '@/api/config';
import type { ConductorDto, CreateConductorDto, UpdateConductorDto, ConductorDtoPagedResult } from '@/api/models';

// Instancia del API de conductores
const conductoresApi = new ConductoresApi(apiConfig);

// Servicio para obtener todos los conductores con paginación
export const fetchConductores = async (pageNumber: number = 1, pageSize: number = 10): Promise<ConductorDtoPagedResult> => {
  try {
    console.log('Making API call to fetch conductores...', { pageNumber, pageSize });
    const result = await conductoresApi.apiConductoresGet({
      pageNumber,
      pageSize,
    });
    console.log('API response received:', result);
    return result;
  } catch (error) {
    console.error('Error fetching conductores:', error);
    throw new Error('Error al cargar los conductores');
  }
};

// Servicio para obtener un conductor por ID
export const fetchConductorById = async (id: number): Promise<ConductorDto> => {
  try {
    const result = await conductoresApi.apiConductoresIdGet({ id });
    return result;
  } catch (error) {
    console.error('Error fetching conductor by id:', error);
    throw new Error('Error al cargar el conductor');
  }
};

// Servicio para crear un nuevo conductor
export const createConductor = async (conductorData: CreateConductorDto): Promise<ConductorDto> => {
  try {
    const result = await conductoresApi.apiConductoresPost({
      createConductorDto: conductorData,
    });
    return result;
  } catch (error) {
    console.error('Error creating conductor:', error);
    throw new Error('Error al crear el conductor');
  }
};

// Servicio para actualizar un conductor
export const updateConductor = async (id: number, conductorData: UpdateConductorDto): Promise<void> => {
  try {
    await conductoresApi.apiConductoresIdPut({
      id,
      updateConductorDto: conductorData,
    });
  } catch (error) {
    console.error('Error updating conductor:', error);
    throw new Error('Error al actualizar el conductor');
  }
};

// Servicio para eliminar un conductor
export const deleteConductor = async (id: number): Promise<void> => {
  try {
    await conductoresApi.apiConductoresIdDelete({ id });
  } catch (error) {
    console.error('Error deleting conductor:', error);
    throw new Error('Error al eliminar el conductor');
  }
};
