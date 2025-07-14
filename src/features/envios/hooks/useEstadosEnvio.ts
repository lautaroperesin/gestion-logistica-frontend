import { useState, useEffect } from 'react';
import { EstadosEnvioApi } from '@/api';
import { apiConfig } from '@/api/config';
import type { EstadoEnvioDto } from '@/api';

const api = new EstadosEnvioApi(apiConfig);

export const useEstadosEnvio = () => {
  const [estados, setEstados] = useState<EstadoEnvioDto[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEstados = async () => {
      try {
        setLoading(true);
        setError(null);
        const response = await api.apiEstadosEnvioGet();
        setEstados(response || []);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Error desconocido');
      } finally {
        setLoading(false);
      }
    };

    fetchEstados();
  }, []);

  return {
    estados,
    loading,
    error,
  };
};
