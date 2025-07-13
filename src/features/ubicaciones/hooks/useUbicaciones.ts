import { useState, useEffect } from 'react';
import { ubicacionesService } from '../services/ubicacionesService';
import type { UbicacionDto, CreateUbicacionDto, UpdateUbicacionDto, ProvinciaDto, LocalidadDto, PaisDto } from '@/api';

export function useUbicaciones() {
  const [ubicaciones, setUbicaciones] = useState<UbicacionDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchUbicaciones = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await ubicacionesService.getAll();
      setUbicaciones(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error desconocido');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUbicaciones();
  }, []);

  const createUbicacion = async (ubicacion: CreateUbicacionDto) => {
    try {
      setError(null);
      await ubicacionesService.create(ubicacion);
      await fetchUbicaciones(); // Refrescar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al crear ubicación');
      throw err;
    }
  };

  const updateUbicacion = async (id: number, ubicacion: UpdateUbicacionDto) => {
    try {
      setError(null);
      await ubicacionesService.update(id, ubicacion);
      await fetchUbicaciones(); // Refrescar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al actualizar ubicación');
      throw err;
    }
  };

  const deleteUbicacion = async (id: number) => {
    try {
      setError(null);
      await ubicacionesService.delete(id);
      await fetchUbicaciones(); // Refrescar la lista
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error al eliminar ubicación');
      throw err;
    }
  };

  return {
    ubicaciones,
    loading,
    error,
    createUbicacion,
    updateUbicacion,
    deleteUbicacion,
    refetch: fetchUbicaciones,
  };
}

export function useUbicacion(id: number) {
  const [ubicacion, setUbicacion] = useState<UbicacionDto | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUbicacion = async () => {
      if (!id) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await ubicacionesService.getById(id);
        setUbicacion(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchUbicacion();
  }, [id]);

  return { ubicacion, loading, error };
}

// Hooks para datos jerárquicos
export function usePaises() {
  const [paises, setPaises] = useState<PaisDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPaises = async () => {
      try {
        setLoading(true);
        setError(null);
        const data = await ubicacionesService.getPaises();
        setPaises(data);
        console.log('Países obtenidos:', data); // Debug
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar países');
      } finally {
        setLoading(false);
      }
    };

    fetchPaises();
  }, []);

  return { paises, loading, error };
}

export function useProvinciasByPais(paisId: number | undefined) {
  const [provincias, setProvincias] = useState<ProvinciaDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchProvincias = async () => {
      if (!paisId) {
        setProvincias([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ubicacionesService.getProvinciasByPais(paisId);
        setProvincias(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar provincias');
      } finally {
        setLoading(false);
      }
    };

    fetchProvincias();
  }, [paisId]);

  return { provincias, loading, error };
}

export function useLocalidadesByProvincia(provinciaId: number | undefined) {
  const [localidades, setLocalidades] = useState<LocalidadDto[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchLocalidades = async () => {
      if (!provinciaId) {
        setLocalidades([]);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const data = await ubicacionesService.getLocalidadesByProvincia(provinciaId);
        setLocalidades(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error al cargar localidades');
      } finally {
        setLoading(false);
      }
    };

    fetchLocalidades();
  }, [provinciaId]);

  return { localidades, loading, error };
}
