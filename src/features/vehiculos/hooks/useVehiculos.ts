import { useState, useEffect } from 'react';
import { fetchVehiculos, createVehiculo, updateVehiculo, deleteVehiculo } from '../services//vehiculosService';
import type { VehiculoDto, CreateVehiculoDto, UpdateVehiculoDto } from '@/api';

export const useVehiculos = () => {
  const [vehiculos, setVehiculos] = useState<VehiculoDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadVehiculos = async () => {
    try {
      setLoading(true);
      setError(null);
      
      console.log('Fetching vehiculos...');
      const result = await fetchVehiculos();
      console.log('Vehiculos response:', result);
      
      setVehiculos(result);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
      console.error('Error loading vehiculos:', err);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const createNewVehiculo = async (vehiculoData: CreateVehiculoDto) => {
    try {
      await createVehiculo(vehiculoData);
      // Recargar la lista después de crear
      await loadVehiculos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al crear vehiculo';
      setError(errorMessage);
      return false;
    }
  };

  const updateExistingVehiculo = async (id: number, vehiculoData: UpdateVehiculoDto) => {
    try {
      await updateVehiculo(id, vehiculoData);
      // Recargar la lista después de actualizar
      await loadVehiculos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al actualizar vehiculo';
      setError(errorMessage);
      return false;
    }
  };

  const removeVehiculo = async (id: number) => {
    try {
      await deleteVehiculo(id);
      // Recargar la lista después de eliminar
      await loadVehiculos();
      return true;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Error al eliminar vehiculo';
      setError(errorMessage);
      return false;
    }
  };

  const refresh = () => {
    loadVehiculos();
  };

  useEffect(() => {
    loadVehiculos();
  }, []);

  return {
    vehiculos,
    loading,
    error,
    loadVehiculos,
    createNewVehiculo,
    updateExistingVehiculo,
    removeVehiculo,
    refresh,
    setError, // Para limpiar errores manualmente
  };
};
