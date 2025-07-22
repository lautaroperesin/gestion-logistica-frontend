import React from 'react';
import { useUbicaciones } from '../hooks/useUbicaciones';
import { Combobox } from '@/components/ui/combobox';
import type { UbicacionDto } from '@/api';

interface UbicacionSelectorSimpleProps {
  value?: number;
  onValueChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export const UbicacionSelectorSimple: React.FC<UbicacionSelectorSimpleProps> = ({
  value,
  onValueChange,
  error,
  disabled
}) => {
  // Corregir destructuring para React Query
  const { data: ubicaciones = [], isLoading: loading } = useUbicaciones();

  const options = ubicaciones.map((ubicacion: UbicacionDto) => ({
    value: ubicacion.idUbicacion?.toString() || '',
    label: ubicacion.direccionCompleta || ubicacion.direccion || 'Sin dirección',
  }));

  const handleValueChange = (stringValue: string) => {
    const numericValue = parseInt(stringValue);
    if (!isNaN(numericValue)) {
      onValueChange(numericValue);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-3 py-2 bg-white/10 border border-white/20 rounded-md text-black/50">
        Cargando ubicaciones...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Combobox
        options={options}
        value={value && value > 0 ? value.toString() : ''}
        onValueChange={handleValueChange}
        placeholder="Seleccionar ubicación..."
        searchPlaceholder="Buscar ubicación..."
        emptyText="No se encontraron ubicaciones"
        disabled={disabled}
        className="bg-white/10 border-gray-300 text-black"
      />
      {error && (
        <p className="text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};
