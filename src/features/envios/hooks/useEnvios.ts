import { useState, useEffect } from 'react';
import { enviosService } from '../services/enviosService';
import type { EnvioDto, CreateEnvioDto, UpdateEnvioDto } from '@/api';

// Hook para obtener todos los envíos
export const useEnvios = () => {
  const [envios, setEnvios] = useState<EnvioDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchEnvios = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await enviosService.getAll();
      setEnvios(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEnvios();
  }, []);

  return {
    envios,
    loading,
    error,
    refetch: fetchEnvios,
  };
};

// Hook para obtener un envío específico
export const useEnvio = (id?: number) => {
  const [envio, setEnvio] = useState<EnvioDto | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    const fetchEnvio = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await enviosService.getById(id);
        setEnvio(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvio();
  }, [id]);

  return {
    envio,
    loading,
    error,
  };
};

// Hook para operaciones CRUD
export const useEnviosCrud = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const createEnvio = async (envio: CreateEnvioDto): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await enviosService.create(envio);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear envío');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateEnvio = async (id: number, envio: UpdateEnvioDto): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await enviosService.update(id, envio);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar envío');
      return false;
    } finally {
      setLoading(false);
    }
  };

  const deleteEnvio = async (id: number): Promise<boolean> => {
    try {
      setLoading(true);
      setError(null);
      await enviosService.delete(id);
      return true;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar envío');
      return false;
    } finally {
      setLoading(false);
    }
  };

  return {
    createEnvio,
    updateEnvio,
    deleteEnvio,
    loading,
    error,
  };
};

// Hook para obtener envíos por estado
export const useEnviosByEstado = (estadoId?: number) => {
  const [envios, setEnvios] = useState<EnvioDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!estadoId) return;

    const fetchEnvios = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await enviosService.getByEstado(estadoId);
        setEnvios(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvios();
  }, [estadoId]);

  return {
    envios,
    loading,
    error,
  };
};

// Hook para obtener envíos por cliente
export const useEnviosByCliente = (clienteId?: number) => {
  const [envios, setEnvios] = useState<EnvioDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!clienteId) return;

    const fetchEnvios = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await enviosService.getByCliente(clienteId);
        setEnvios(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEnvios();
  }, [clienteId]);

  return {
    envios,
    loading,
    error,
  };
};
