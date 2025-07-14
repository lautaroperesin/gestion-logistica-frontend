import React from 'react';
import { useEstadosEnvio } from '../hooks/useEstadosEnvio';
import { Combobox } from '@/components/ui/combobox';
import type { EstadoEnvioDto } from '@/api';

interface EstadoEnvioSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export const EstadoEnvioSelector: React.FC<EstadoEnvioSelectorProps> = ({
  value,
  onValueChange,
  error,
  disabled
}) => {
  const { estados, loading } = useEstadosEnvio();

  const options = estados.map((estado: EstadoEnvioDto) => ({
    value: estado.idEstado?.toString() || '',
    label: estado.nombre || 'Sin nombre',
  }));

  const handleValueChange = (stringValue: string) => {
    const numericValue = parseInt(stringValue);
    if (!isNaN(numericValue)) {
      onValueChange(numericValue);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-3 py-2 bg-black/10 border border-black/20 rounded-md text-black/50">
        Cargando estados...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Combobox
        options={options}
        value={value?.toString() || ''}
        onValueChange={handleValueChange}
        placeholder="Seleccionar estado..."
        searchPlaceholder="Buscar estado..."
        emptyText="No se encontraron estados"
        disabled={disabled}
        className="bg-black/10 border-black/20 text-black"
      />
      {error && (
        <p className="text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};
