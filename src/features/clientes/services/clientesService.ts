import { ClientesApi } from '@/api/apis/ClientesApi';
import { apiConfig } from '@/api/config';
import type { ClienteDto, CreateClienteDto, UpdateClienteDto, ClienteDtoPagedResult } from '@/api/models';

// Instancia del API de clientes
const clientesApi = new ClientesApi(apiConfig);

// Servicio para obtener todos los clientes con paginación
export const fetchClientes = async (pageNumber: number = 1, pageSize: number = 10): Promise<ClienteDtoPagedResult> => {
  try {
    console.log('Making API call to fetch clientes...', { pageNumber, pageSize });
    const result = await clientesApi.apiClientesGet({
      pageNumber,
      pageSize,
    });
    console.log('API response received:', result);
    return result;
  } catch (error) {
    console.error('Error fetching clientes:', error);
    throw new Error('Error al cargar los clientes');
  }
};

// Servicio para obtener un cliente por ID
export const fetchClienteById = async (id: number): Promise<ClienteDto> => {
  try {
    const result = await clientesApi.apiClientesIdGet({ id });
    return result;
  } catch (error) {
    console.error('Error fetching cliente by id:', error);
    throw new Error('Error al cargar el cliente');
  }
};

// Servicio para crear un nuevo cliente
export const createCliente = async (clienteData: CreateClienteDto): Promise<ClienteDto> => {
  try {
    const result = await clientesApi.apiClientesPost({
      createClienteDto: clienteData,
    });
    return result;
  } catch (error) {
    console.error('Error creating cliente:', error);
    throw new Error('Error al crear el cliente');
  }
};

// Servicio para actualizar un cliente
export const updateCliente = async (id: number, clienteData: UpdateClienteDto): Promise<void> => {
  try {
    await clientesApi.apiClientesIdPut({
      id,
      updateClienteDto: clienteData,
    });
  } catch (error) {
    console.error('Error updating cliente:', error);
    throw new Error('Error al actualizar el cliente');
  }
};

// Servicio para eliminar un cliente
export const deleteCliente = async (id: number): Promise<void> => {
  try {
    await clientesApi.apiClientesIdDelete({ id });
  } catch (error) {
    console.error('Error deleting cliente:', error);
    throw new Error('Error al eliminar el cliente');
  }
};
