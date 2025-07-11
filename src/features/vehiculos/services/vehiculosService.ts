import { VehiculosApi } from '@/api/apis/VehiculosApi';
import { apiConfig } from '@/api/config';
import type { VehiculoDto, CreateVehiculoDto, UpdateVehiculoDto } from '@/api/models';

// Instancia del API de vehiculos
const vehiculosApi = new VehiculosApi(apiConfig);

// Servicio para obtener todos los vehiculos
export const fetchVehiculos = async (): Promise<VehiculoDto[]> => {
  try {
    console.log('Making API call to fetch vehiculos...');
    const result = await vehiculosApi.apiVehiculosGet();
    console.log('API response received:', result);
    
    return result || [];
  } catch (error) {
    console.error('Error fetching vehiculos:', error);
    throw new Error('Error al cargar los vehículos');
  }
};

// Servicio para obtener un vehiculo por ID
export const fetchVehiculoById = async (id: number): Promise<VehiculoDto> => {
  try {
    const result = await vehiculosApi.apiVehiculosIdGet({ id });
    return result;
  } catch (error) {
    console.error('Error fetching vehiculo by id:', error);
    throw new Error('Error al cargar el vehículo');
  }
};

// Servicio para crear un nuevo vehiculo
export const createVehiculo = async (vehiculoData: CreateVehiculoDto): Promise<VehiculoDto> => {
  try {
    const result = await vehiculosApi.apiVehiculosPost({
      createVehiculoDto: vehiculoData,
    });
    return result;
  } catch (error) {
    console.error('Error creating vehiculo:', error);
    throw new Error('Error al crear el vehículo');
  }
};

// Servicio para actualizar un vehiculo
export const updateVehiculo = async (id: number, vehiculoData: UpdateVehiculoDto): Promise<void> => {
  try {
    await vehiculosApi.apiVehiculosIdPut({
      id,
      updateVehiculoDto: vehiculoData,
    });
  } catch (error) {
    console.error('Error updating vehiculo:', error);
    throw new Error('Error al actualizar el vehículo');
  }
};

// Servicio para eliminar un vehiculo
export const deleteVehiculo = async (id: number): Promise<void> => {
  try {
    await vehiculosApi.apiVehiculosIdDelete({ id });
  } catch (error) {
    console.error('Error deleting vehiculo:', error);
    throw new Error('Error al eliminar el vehículo');
  }
};
