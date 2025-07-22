import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { DatePicker } from '@/components/ui/date-picker';
import { Search, X, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { ClienteSelector } from '@/features/clientes/components/ClienteSelector';
import { ConductorSelector } from '@/features/conductores/components/ConductorSelector';
import { VehiculoSelector } from '@/features/vehiculos/components/VehiculoSelector';
import { EstadoEnvioSelector } from '@/features/envios/components/EstadoEnvioSelector';

export interface EnviosFiltersData {
  idConductor?: number;
  idCliente?: number;
  idVehiculo?: number;
  fechaSalidaDesde?: Date;
  fechaSalidaHasta?: Date;
  estadoEnvio?: number;
  numeroSeguimiento?: string;
  origen?: string;
  destino?: string;
}

interface EnviosFiltersProps {
  filters: EnviosFiltersData;
  onFiltersChange: (filters: EnviosFiltersData) => void;
  onClearFilters: () => void;
}

export const EnviosFilters = ({ filters, onFiltersChange, onClearFilters }: EnviosFiltersProps) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [localFilters, setLocalFilters] = useState<EnviosFiltersData>(filters);

  useEffect(() => {
    setLocalFilters(filters);
  }, [filters]);

  const handleFilterChange = (key: keyof EnviosFiltersData, value: any) => {
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
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="numeroSeguimiento" className="text-sm font-medium text-gray-700">
                  Número de Seguimiento
                </Label>
                <Input
                  id="numeroSeguimiento"
                  value={localFilters.numeroSeguimiento || ''}
                  onChange={(e) => handleFilterChange('numeroSeguimiento', e.target.value)}
                  placeholder="Ej: ENV001"
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="origen" className="text-sm font-medium text-gray-700">
                  Localidad de Origen
                </Label>
                <Input
                  id="origen"
                  value={localFilters.origen || ''}
                  onChange={(e) => handleFilterChange('origen', e.target.value)}
                  placeholder="Ej: San Justo"
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="destino" className="text-sm font-medium text-gray-700">
                  Localidad de Destino
                </Label>
                <Input
                  id="destino"
                  value={localFilters.destino || ''}
                  onChange={(e) => handleFilterChange('destino', e.target.value)}
                  placeholder="Ej: Córdoba"
                  className="transition-all focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>

          {/* Filtros de selección */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Filtrar por categoría
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Cliente</Label>
                <ClienteSelector
                  value={localFilters.idCliente}
                  onValueChange={(value) => handleFilterChange('idCliente', value || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Conductor</Label>
                <ConductorSelector
                  value={localFilters.idConductor}
                  onValueChange={(value) => handleFilterChange('idConductor', value || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Vehículo</Label>
                <VehiculoSelector
                  value={localFilters.idVehiculo}
                  onValueChange={(value) => handleFilterChange('idVehiculo', value || undefined)}
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Estado de Envío</Label>
                <EstadoEnvioSelector
                  value={localFilters.estadoEnvio}
                  onValueChange={(value) => handleFilterChange('estadoEnvio', value || undefined)}
                />
              </div>
            </div>
          </div>

          {/* Filtros de fecha */}
          <div>
            <h4 className="text-sm font-medium text-gray-900 mb-3 flex items-center gap-2">
              <Filter className="h-4 w-4" />
              Rango de fechas de salida
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha desde</Label>
                <DatePicker
                  date={localFilters.fechaSalidaDesde}
                  onDateChange={(date) => handleFilterChange('fechaSalidaDesde', date)}
                  placeholder="Selecciona fecha inicial"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-sm font-medium text-gray-700">Fecha hasta</Label>
                <DatePicker
                  date={localFilters.fechaSalidaHasta}
                  onDateChange={(date) => handleFilterChange('fechaSalidaHasta', date)}
                  placeholder="Selecciona fecha final"
                />
              </div>
            </div>
          </div>

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
