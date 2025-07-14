import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import UbicacionSelector from '../components/UbicacionSelector';
import { useUbicaciones, useUbicacion } from '../hooks/useUbicaciones';
import type { PaisDto, ProvinciaDto, LocalidadDto } from '@/api';

// Schema de validación
const ubicacionSchema = z.object({
  direccion: z.string().min(1, 'La dirección es requerida'),
  descripcion: z.string().optional(),
  paisId: z.number().min(1, 'El país es requerido'),
  provinciaId: z.number().min(1, 'La provincia es requerida'),
  localidadId: z.number().min(1, 'La localidad es requerida'),
});

type UbicacionFormData = z.infer<typeof ubicacionSchema>;

export default function UbicacionFormPage() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = !!id;
  
  const { createUbicacion, updateUbicacion } = useUbicaciones();
  const { ubicacion, loading: loadingUbicacion } = useUbicacion(id ? parseInt(id) : 0);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isSubmitting }
  } = useForm<UbicacionFormData>({
    resolver: zodResolver(ubicacionSchema),
    defaultValues: {
      direccion: '',
      descripcion: '',
      paisId: 0,
      provinciaId: 0,
      localidadId: 0,
    }
  });

  const paisId = watch('paisId');
  const provinciaId = watch('provinciaId');
  const localidadId = watch('localidadId');

  // Cargar datos si estamos editando
  useEffect(() => {
    if (isEditing && ubicacion) {
      setValue('direccion', ubicacion.direccion || '');
      setValue('descripcion', ubicacion.descripcion || '');
      if (ubicacion.localidad?.provincia?.pais?.idPais) {
        setValue('paisId', ubicacion.localidad.provincia.pais.idPais);
      }
      if (ubicacion.localidad?.provincia?.idProvincia) {
        setValue('provinciaId', ubicacion.localidad.provincia.idProvincia);
      }
      if (ubicacion.localidad?.idLocalidad) {
        setValue('localidadId', ubicacion.localidad.idLocalidad);
      }
    }
  }, [ubicacion, isEditing, setValue]);

  const onSubmit = async (data: UbicacionFormData) => {
    try {
      if (isEditing && id) {
        await updateUbicacion(parseInt(id), {
            idUbicacion: parseInt(id),
            direccion: data.direccion,
            descripcion: data.descripcion
        });
      } else {
        await createUbicacion({
          direccion: data.direccion,
          descripcion: data.descripcion,
          idLocalidad: data.localidadId,
        });
      }
      navigate('/ubicaciones');
    } catch (error) {
      console.error('Error al guardar ubicación:', error);
    }
  };

  const handlePaisChange = (pais: PaisDto | null) => {
    setValue('paisId', pais?.idPais || 0);
    setValue('provinciaId', 0);
    setValue('localidadId', 0);
  };

  const handleProvinciaChange = (provincia: ProvinciaDto | null) => {
    setValue('provinciaId', provincia?.idProvincia || 0);
    setValue('localidadId', 0);
  };

  const handleLocalidadChange = (localidad: LocalidadDto | null) => {
    setValue('localidadId', localidad?.idLocalidad || 0);
  };

  if (isEditing && loadingUbicacion) {
    return (
      <div className="p-6">
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          <span className="ml-2 text-gray-600">Cargando ubicación...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4 mb-6">
        <Button
          variant="outline"
          size="sm"
          onClick={() => navigate('/ubicaciones')}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Volver
        </Button>
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
            <MapPin className="h-8 w-8 text-blue-600" />
            {isEditing ? 'Editar Ubicación' : 'Nueva Ubicación'}
          </h1>
          <p className="text-gray-600 mt-1">
            {isEditing 
              ? 'Modifica los datos de la ubicación' 
              : 'Completa la información para crear una nueva ubicación'
            }
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardHeader>
            <CardTitle>Información de la Ubicación</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Selector de ubicación jerárquico */}
            <UbicacionSelector
              selectedPaisId={paisId || undefined}
              selectedProvinciaId={provinciaId || undefined}
              selectedLocalidadId={localidadId || undefined}
              onPaisChange={handlePaisChange}
              onProvinciaChange={handleProvinciaChange}
              onLocalidadChange={handleLocalidadChange}
              disabled={isSubmitting || isEditing}
            />

            {isEditing && (
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                <p className="text-amber-800 text-sm">
                  ⚠️ En modo edición, solo se puede modificar la dirección. La localidad no puede ser cambiada.
                </p>
              </div>
            )}

            {errors.paisId && (
              <p className="text-red-600 text-sm mt-1">{errors.paisId.message}</p>
            )}
            {errors.provinciaId && (
              <p className="text-red-600 text-sm mt-1">{errors.provinciaId.message}</p>
            )}
            {errors.localidadId && (
              <p className="text-red-600 text-sm mt-1">{errors.localidadId.message}</p>
            )}

            {/* Dirección */}
            <div>
              <Label htmlFor="direccion">Dirección *</Label>
              <input
                {...register('direccion')}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ingresa la dirección específica"
                disabled={isSubmitting}
              />
              {errors.direccion && (
                <p className="text-red-600 text-sm mt-1">{errors.direccion.message}</p>
              )}
            </div>

            {/* Descripcion */}
            <div>
              <Label htmlFor="descripcion">Descripción</Label>
              <input
                {...register('descripcion')}
                type="text"
                className="mt-1 block w-full rounded-md border border-gray-300 px-3 py-2 shadow-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Ingresa una descripción opcional"
                disabled={isSubmitting}
              />
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-3 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate('/ubicaciones')}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={isSubmitting}
                className="bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white"
              >
                {isSubmitting ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    Guardando...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
                    {isEditing ? 'Actualizar' : 'Crear'} Ubicación
                  </div>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </form>
    </div>
  );
}
