import { useState, useEffect } from 'react';
import { tiposCargaService } from '../services/tiposCargaService';
import type { TipoCargaDto } from '@/api';

export interface UseTiposCargaReturn {
  tiposCarga: TipoCargaDto[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  createNewTipoCarga: (tipoCarga: { nombre: string }) => Promise<boolean>;
  updateExistingTipoCarga: (id: number, tipoCarga: { nombre: string }) => Promise<boolean>;
  removeTipoCarga: (id: number) => Promise<boolean>;
  setError: (error: string | null) => void;
}

export const useTiposCarga = (): UseTiposCargaReturn => {
  const [tiposCarga, setTiposCarga] = useState<TipoCargaDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTiposCarga = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await tiposCargaService.getAll();
      setTiposCarga(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al cargar los tipos de carga');
    } finally {
      setLoading(false);
    }
  };

  const refresh = async () => {
    await fetchTiposCarga();
  };

  const createNewTipoCarga = async (tipoCarga: { nombre: string }): Promise<boolean> => {
    try {
      setError(null);
      const newTipoCarga = await tiposCargaService.create(tipoCarga);
      setTiposCarga(prev => [...prev, newTipoCarga]);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear el tipo de carga');
      return false;
    }
  };

  const updateExistingTipoCarga = async (id: number, tipoCarga: { nombre: string }): Promise<boolean> => {
    try {
      setError(null);
      await tiposCargaService.update(id, tipoCarga);
      // Actualizar la lista local
      setTiposCarga(prev => prev.map(tc => 
        tc.idTipoCarga === id 
          ? { ...tc, nombre: tipoCarga.nombre }
          : tc
      ));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar el tipo de carga');
      return false;
    }
  };

  const removeTipoCarga = async (id: number): Promise<boolean> => {
    try {
      setError(null);
      await tiposCargaService.delete(id);
      setTiposCarga(prev => prev.filter(tc => tc.idTipoCarga !== id));
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar el tipo de carga');
      return false;
    }
  };

  useEffect(() => {
    fetchTiposCarga();
  }, []);

  return {
    tiposCarga,
    loading,
    error,
    refresh,
    createNewTipoCarga,
    updateExistingTipoCarga,
    removeTipoCarga,
    setError
  };
};
