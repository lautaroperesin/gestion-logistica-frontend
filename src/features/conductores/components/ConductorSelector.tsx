import React from 'react';
import { useConductores } from '../hooks/useConductores';
import { Combobox } from '@/components/ui/combobox';
import type { ConductorDto } from '@/api';

interface ConductorSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export const ConductorSelector: React.FC<ConductorSelectorProps> = ({
  value,
  onValueChange,
  error,
  disabled
}) => {
  // Corregir destructuring para React Query
  const { data: result, isLoading: loading } = useConductores();

  // Extraer conductores del resultado paginado
  const conductores = result?.items || [];
  
  const options = conductores.map((conductor: ConductorDto) => ({
    value: conductor.idConductor?.toString() || '',
    label: conductor.nombre || 'Sin nombre',
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
        Cargando conductores...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Combobox
        options={options}
        value={value && value > 0 ? value.toString() : ''}
        onValueChange={handleValueChange}
        placeholder="Seleccionar conductor..."
        searchPlaceholder="Buscar conductor..."
        emptyText="No se encontraron conductores"
        disabled={disabled}
        className="bg-white/10 border-gray-300 text-black"
      />
      {error && (
        <p className="text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};
