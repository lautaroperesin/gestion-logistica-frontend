import React from 'react';
import { useTiposCarga } from '../hooks/useTiposCarga';
import { Combobox } from '@/components/ui/combobox';
import type { TipoCargaDto } from '@/api';

interface TipoCargaSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export const TipoCargaSelector: React.FC<TipoCargaSelectorProps> = ({
  value,
  onValueChange,
  error,
  disabled
}) => {
  const { tiposCarga, loading } = useTiposCarga();

  const options = tiposCarga.map((tipoCarga: TipoCargaDto) => ({
    value: tipoCarga.idTipoCarga?.toString() || '',
    label: tipoCarga.nombre || 'Sin nombre',
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
        Cargando tipos de carga...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Combobox
        options={options}
        value={value?.toString() || ''}
        onValueChange={handleValueChange}
        placeholder="Seleccionar tipo de carga..."
        searchPlaceholder="Buscar tipo de carga..."
        emptyText="No se encontraron tipos de carga"
        disabled={disabled}
        className="bg-white/10 border-white/20 text-black"
      />
      {error && (
        <p className="text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};
