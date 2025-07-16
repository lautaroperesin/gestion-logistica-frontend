import React from 'react';
import { useClientes } from '../hooks/useClientes';
import { Combobox } from '@/components/ui/combobox';
import type { ClienteDto } from '@/api';

interface ClienteSelectorProps {
  value?: number;
  onValueChange: (value: number) => void;
  error?: string;
  disabled?: boolean;
}

export const ClienteSelector: React.FC<ClienteSelectorProps> = ({
  value,
  onValueChange,
  error,
  disabled
}) => {
  // Corregir destructuring para React Query
  const { data: result, isLoading: loading } = useClientes();
  
  // Extraer clientes del resultado paginado
  const clientes = result?.items || [];

  const options = clientes.map((cliente: ClienteDto) => ({
    value: cliente.idCliente?.toString() || '',
    label: cliente.nombre || 'Sin nombre',
  }));

  const handleValueChange = (stringValue: string) => {
    const numericValue = parseInt(stringValue);
    if (!isNaN(numericValue)) {
      onValueChange(numericValue);
    }
  };

  if (loading) {
    return (
      <div className="w-full px-3 py-2 border border-black/20 rounded-md">
        Cargando clientes...
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <Combobox
        options={options}
        value={value && value > 0 ? value.toString() : ''}
        onValueChange={handleValueChange}
        placeholder="Seleccionar cliente..."
        searchPlaceholder="Buscar cliente..."
        emptyText="No se encontraron clientes"
        disabled={disabled}
        className="bg-white/10 border-white/20 text-black"
      />
      {error && (
        <p className="text-red-300 text-sm">{error}</p>
      )}
    </div>
  );
};
