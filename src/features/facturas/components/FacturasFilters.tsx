import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { ClienteSelector } from '@/features/clientes/components/ClienteSelector';

export interface FacturasFiltersData {
  idCliente?: number;
  numeroFactura?: string;
  fechaEmisionDesde?: Date;
  fechaEmisionHasta?: Date;
  fechaVencimientoDesde?: Date;
  fechaVencimientoHasta?: Date;
  estado?: number;
  montoMinimo?: number;
  montoMaximo?: number;
}

interface FacturasFiltersProps {
  filters: FacturasFiltersData;
  onFiltersChange: (filters: FacturasFiltersData) => void;
  onClearFilters: () => void;
}

export const FacturasFilters = ({ filters, onFiltersChange, onClearFilters }: FacturasFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<FacturasFiltersData>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof FacturasFiltersData, value: any) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
  };

  const clearFilters = () => {
    setLocalFilters({});
    onClearFilters();
  };

  const hasActiveFilters = Object.values(filters).some(value => value !== undefined && value !== null && value !== '');

  const estadosFactura = [
    { value: 0, label: 'Borrador' },
    { value: 1, label: 'Pendiente' },
    { value: 2, label: 'Emitida' },
    { value: 3, label: 'Pagada' },
    { value: 4, label: 'Vencida' },
    { value: 5, label: 'Cancelada' },
  ];

  return (
    <Card className="border-gray-200 shadow-sm">
      <div className="p-4 border-b bg-gray-50/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-8 h-8 bg-blue-100 rounded-lg">
              <Filter className="h-4 w-4 text-blue-600" />
            </div>
            <h3 className="font-semibold text-gray-900">Filtros de Búsqueda</h3>
            {hasActiveFilters && (
              <div className="flex items-center gap-1 bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded-full">
                <div className="w-2 h-2 bg-blue-600 rounded-full"></div>
                Filtros activos
              </div>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          >
            {isExpanded ? (
              <>
                <ChevronUp className="h-4 w-4 mr-2" />
                Ocultar
              </>
            ) : (
              <>
                <ChevronDown className="h-4 w-4 mr-2" />
                Mostrar filtros
              </>
            )}
          </Button>
        </div>
      </div>

      {isExpanded && (
        <div className="p-6 space-y-6">
          {/* Filtros de texto */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Search className="h-4 w-4" />
              Búsqueda por texto
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroFactura" className="text-sm font-medium text-gray-700">
                  Número de Factura
                </Label>
                <Input
                  id="numeroFactura"
                  value={localFilters.numeroFactura || ''}
                  onChange={(e) => handleFilterChange('numeroFactura', e.target.value)}
                  placeholder="Ej: FAC001"
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Cliente</Label>
                <ClienteSelector
                  value={localFilters.idCliente}
                  onValueChange={(value) => handleFilterChange('idCliente', value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Filtros de estado y montos */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Estado
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Estado de Factura</Label>
                <select
                  value={localFilters.estado ?? ''}
                  onChange={(e) => handleFilterChange('estado', e.target.value ? Number(e.target.value) : undefined)}
                  className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background transition-all placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-gra-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 [&>span]:line-clamp-1"
                >
                  <option value="">Todos los estados</option>
                  {estadosFactura.map((estado) => (
                    <option key={estado.value} value={estado.value}>
                      {estado.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Filtros de fecha de emisión */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Rango de fechas de emisión
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha desde</Label>
                <DatePicker
                  date={localFilters.fechaEmisionDesde}
                  onDateChange={(date) => handleFilterChange('fechaEmisionDesde', date)}
                  placeholder="Selecciona fecha inicial"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha hasta</Label>
                <DatePicker
                  date={localFilters.fechaEmisionHasta}
                  onDateChange={(date) => handleFilterChange('fechaEmisionHasta', date)}
                  placeholder="Selecciona fecha final"
                />
              </div>
            </div>
          </div>

          {/* Filtros de fecha de vencimiento */}
         {/*  <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Rango de fechas de vencimiento
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha desde</Label>
                <DatePicker
                  date={localFilters.fechaVencimientoDesde}
                  onDateChange={(date) => handleFilterChange('fechaVencimientoDesde', date)}
                  placeholder="Selecciona fecha inicial"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha hasta</Label>
                <DatePicker
                  date={localFilters.fechaVencimientoHasta}
                  onDateChange={(date) => handleFilterChange('fechaVencimientoHasta', date)}
                  placeholder="Selecciona fecha final"
                />
              </div>
            </div>
          </div> */}

          {/* Botones de acción */}
          <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t">
            <Button 
              onClick={applyFilters} 
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-sm"
            >
              <Search className="h-4 w-4 mr-2" />
              Aplicar Filtros
            </Button>
            <Button 
              variant="outline" 
              onClick={clearFilters}
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              <X className="h-4 w-4 mr-2" />
              Limpiar Filtros
            </Button>
          </div>
        </div>
      )}
    </Card>
  );
};
