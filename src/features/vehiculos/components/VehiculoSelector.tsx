import React from 'react';
import { useVehiculos } from '../hooks/useVehiculos';
import { Combobox } from '@/components/ui/combobox';
import type { VehiculoDto } from '@/api';

interface VehiculoSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export const VehiculoSelector: React.FC<VehiculoSelectorProps> = ({
  value,
  onValueChange,
  error,
  disabled
}) => {
  const { data: vehiculos = [], isLoading: loading } = useVehiculos();

  const options = vehiculos.map((vehiculo: VehiculoDto) => ({
    value: vehiculo.idVehiculo?.toString() || '',
    label: `${vehiculo.marca || ''} ${vehiculo.modelo || ''} - ${vehiculo.patente || ''}`.trim(),
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
        Cargando vehículos...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Combobox
        options={options}
        value={value && value > 0 ? value.toString() : ''}
        onValueChange={handleValueChange}
        placeholder="Seleccionar vehículo..."
        searchPlaceholder="Buscar vehículo..."
        emptyText="No se encontraron vehículos"
        disabled={disabled}
        className="bg-white/10 border-white/20 text-black"
      />
      {error && (
        <p className="text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};
