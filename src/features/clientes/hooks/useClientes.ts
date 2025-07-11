import { useState, useEffect } from 'react';
import { fetchClientes, createCliente, updateCliente, deleteCliente } from '../services/clientesService';
import type { ClienteDto, CreateClienteDto, UpdateClienteDto, ClienteDtoPagedResult } from '@/api';

export const useClientes = (initialPageSize: number = 10) => {
  const [clientes, setClientes] = useState<ClienteDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const loadClientes = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching clientes...', { page, size });
      const result: ClienteDtoPagedResult = await fetchClientes(page, size);
      console.log('Clientes response:', result);
      
      setClientes(result.items || []);
      setTotalCount(result.totalItems || 0);
      setCurrentPage(page);
      setPageSize(size);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error loading clientes:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createNewCliente = async (clienteData: CreateClienteDto) => {
    try {
      await createCliente(clienteData);
      // Recargar la lista después de crear
      await loadClientes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear cliente';
      setError(errorMessage);
      return false;
    }
  };

  const updateExistingCliente = async (id: number, clienteData: UpdateClienteDto) => {
    try {
      await updateCliente(id, clienteData);
      // Recargar la lista después de actualizar
      await loadClientes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar cliente';
      setError(errorMessage);
      return false;
    }
  };

  const removeCliente = async (id: number) => {
    try {
      await deleteCliente(id);
      // Recargar la lista después de eliminar
      await loadClientes();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar cliente';
      setError(errorMessage);
      return false;
    }
  };

  const refresh = () => {
    loadClientes();
  };

  useEffect(() => {
    loadClientes();
  }, []);

  return {
    clientes,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    loadClientes,
    createNewCliente,
    updateExistingCliente,
    removeCliente,
    refresh,
    setError, // Para limpiar errores manualmente
  };
};
