import { useEffect, useState } from 'react';
import { Label } from '@/components/ui/label';
import { Combobox } from '@/components/ui/combobox';
import { usePaises, useProvinciasByPais, useLocalidadesByProvincia } from '../hooks/useUbicaciones';
import type { PaisDto, ProvinciaDto, LocalidadDto } from '@/api';

interface UbicacionSelectorProps {
  selectedPaisId?: number;
  selectedProvinciaId?: number;
  selectedLocalidadId?: number;
  onPaisChange?: (pais: PaisDto | null) => void;
  onProvinciaChange?: (provincia: ProvinciaDto | null) => void;
  onLocalidadChange?: (localidad: LocalidadDto | null) => void;
  disabled?: boolean;
}

export default function UbicacionSelector({
  selectedPaisId,
  selectedProvinciaId,
  selectedLocalidadId,
  onPaisChange,
  onProvinciaChange,
  onLocalidadChange,
  disabled = false
}: UbicacionSelectorProps) {
  const [paisValue, setPaisValue] = useState<string>('');
  const [provinciaValue, setProvinciaValue] = useState<string>('');
  const [localidadValue, setLocalidadValue] = useState<string>('');

  // Destructuring para React Query
  const { data: paises = [], isLoading: paisesLoading } = usePaises();
  const { data: provincias = [], isLoading: provinciasLoading } = useProvinciasByPais(selectedPaisId);
  const { data: localidades = [], isLoading: localidadesLoading } = useLocalidadesByProvincia(selectedProvinciaId);

  // Actualizar valores cuando cambien las props
  useEffect(() => {
    setPaisValue(selectedPaisId ? selectedPaisId.toString() : '');
  }, [selectedPaisId]);

  useEffect(() => {
    setProvinciaValue(selectedProvinciaId ? selectedProvinciaId.toString() : '');
  }, [selectedProvinciaId]);

  useEffect(() => {
    setLocalidadValue(selectedLocalidadId ? selectedLocalidadId.toString() : '');
  }, [selectedLocalidadId]);

  const handlePaisChange = (value: string) => {
    console.log('País seleccionado:', value); // Debug
    setPaisValue(value);
    setProvinciaValue('');
    setLocalidadValue('');
    
    const pais = paises.find(p => p.idPais?.toString() === value) || null;
    console.log('País encontrado:', pais); // Debug
    onPaisChange?.(pais);
    onProvinciaChange?.(null);
    onLocalidadChange?.(null);
  };

  const handleProvinciaChange = (value: string) => {
    setProvinciaValue(value);
    setLocalidadValue('');
    
    const provincia = provincias.find(p => p.idProvincia?.toString() === value) || null;
    onProvinciaChange?.(provincia);
    onLocalidadChange?.(null);
  };

  const handleLocalidadChange = (value: string) => {
    setLocalidadValue(value);
    
    const localidad = localidades.find(l => l.idLocalidad?.toString() === value) || null;
    onLocalidadChange?.(localidad);
  };

  const paisOptions = paises
    .filter(pais => pais.idPais && pais.nombre) // Filtrar países válidos
    .map(pais => ({
      value: pais.idPais!.toString(),
      label: pais.nombre!
    }));

  const provinciaOptions = provincias
    .filter(provincia => provincia.idProvincia && provincia.nombre) // Filtrar provincias válidas
    .map(provincia => ({
      value: provincia.idProvincia!.toString(),
      label: provincia.nombre!
    }));

  const localidadOptions = localidades
    .filter(localidad => localidad.idLocalidad && localidad.nombre) // Filtrar localidades válidas
    .map(localidad => ({
      value: localidad.idLocalidad!.toString(),
      label: localidad.nombre!
    }));

  return (
    <div className="space-y-4">
      {/* País */}
      <div>
        <Label htmlFor="pais">País *</Label>
        <Combobox
          value={paisValue}
          onValueChange={handlePaisChange}
          options={paisOptions}
          placeholder={paisesLoading ? "Cargando países..." : "Seleccionar país"}
          searchPlaceholder="Buscar país..."
          emptyText="No se encontraron países."
          disabled={disabled || paisesLoading}
          className="mt-1"
        />
      </div>

      {/* Provincia */}
      <div>
        <Label htmlFor="provincia">Provincia *</Label>
        <Combobox
          value={provinciaValue}
          onValueChange={handleProvinciaChange}
          options={provinciaOptions}
          placeholder={
            !paisValue 
              ? "Primero selecciona un país" 
              : provinciasLoading 
                ? "Cargando provincias..." 
                : "Seleccionar provincia"
          }
          searchPlaceholder="Buscar provincia..."
          emptyText="No se encontraron provincias."
          disabled={disabled || !paisValue || provinciasLoading}
          className="mt-1"
        />
      </div>

      {/* Localidad */}
      <div>
        <Label htmlFor="localidad">Localidad *</Label>
        <Combobox
          value={localidadValue}
          onValueChange={handleLocalidadChange}
          options={localidadOptions}
          placeholder={
            !provinciaValue 
              ? "Primero selecciona una provincia" 
              : localidadesLoading 
                ? "Cargando localidades..." 
                : "Seleccionar localidad"
          }
          searchPlaceholder="Buscar localidad..."
          emptyText="No se encontraron localidades."
          disabled={disabled || !provinciaValue || localidadesLoading}
          className="mt-1"
        />
      </div>
    </div>
  );
}
