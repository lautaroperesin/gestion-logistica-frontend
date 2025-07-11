import { useState, useEffect } from 'react';
import { fetchConductores, createConductor, updateConductor, deleteConductor } from '../services/conductoresService';
import type { ConductorDto, CreateConductorDto, UpdateConductorDto, ConductorDtoPagedResult } from '@/api';

export const useConductores = (initialPageSize: number = 10) => {
  const [conductores, setConductores] = useState<ConductorDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [totalCount, setTotalCount] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);

  const loadConductores = async (page: number = currentPage, size: number = pageSize) => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching conductores...', { page, size });
      const result: ConductorDtoPagedResult = await fetchConductores(page, size);
      console.log('Conductores response:', result);
      
      setConductores(result.items || []);
      setTotalCount(result.totalItems || 0);
      setCurrentPage(page);
      setPageSize(size);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error loading conductores:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createNewConductor = async (conductorData: CreateConductorDto) => {
    try {
      await createConductor(conductorData);
      // Recargar la lista después de crear
      await loadConductores();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear conductor';
      setError(errorMessage);
      return false;
    }
  };

  const updateExistingConductor = async (id: number, conductorData: UpdateConductorDto) => {
    try {
      await updateConductor(id, conductorData);
      // Recargar la lista después de actualizar
      await loadConductores();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar conductor';
      setError(errorMessage);
      return false;
    }
  };

  const removeConductor = async (id: number) => {
    try {
      await deleteConductor(id);
      // Recargar la lista después de eliminar
      await loadConductores();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar conductor';
      setError(errorMessage);
      return false;
    }
  };

  const refresh = () => {
    loadConductores();
  };

  useEffect(() => {
    loadConductores();
  }, []);

  return {
    conductores,
    loading,
    error,
    totalCount,
    currentPage,
    pageSize,
    loadConductores,
    createNewConductor,
    updateExistingConductor,
    removeConductor,
    refresh,
    setError, // Para limpiar errores manualmente
  };
};
