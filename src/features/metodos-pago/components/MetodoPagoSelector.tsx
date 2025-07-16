import React from 'react';
import { useMetodosPago } from '../hooks/useMetodosPago';
import { Combobox } from '@/components/ui/combobox';
import type { MetodoPagoDto } from '@/api';

interface MetodoPagoSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export const MetodoPagoSelector: React.FC<MetodoPagoSelectorProps> = ({
  value,
  onValueChange,
  error,
  disabled
}) => {
  const { data: metodosPago = [], isLoading: loading } = useMetodosPago();

  const options = metodosPago.map((metodoPago: MetodoPagoDto) => ({
    value: metodoPago.id?.toString() || '',
    label: metodoPago.nombre || 'Sin nombre',
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
        Cargando métodos de pago...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Combobox
        options={options}
        value={value && value > 0 ? value.toString() : ''}
        onValueChange={handleValueChange}
        placeholder="Seleccionar método de pago..."
        searchPlaceholder="Buscar método de pago..."
        emptyText="No se encontraron métodos de pago"
        disabled={disabled}
        className="bg-white/10 border-white/20 text-black"
      />
      {error && (
        <p className="text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};
