import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import UbicacionSelector from '../components/UbicacionSelector';
import { useUbicacion, useCreateUbicacion, useUpdateUbicacion } from '../hooks/useUbicaciones';
import type { CreateUbicacionDto, UpdateUbicacionDto, PaisDto, ProvinciaDto, LocalidadDto } from '@/api';

// Schema de validación
const ubicacionSchema = z.object({
  direccion: z.string().min(1, 'La dirección es requerida').trim(),
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
  
  // React Query hooks
  const { data: ubicacion, isLoading: loadingUbicacion } = useUbicacion(id ? parseInt(id) : 0);
  const createUbicacionMutation = useCreateUbicacion();
  const updateUbicacionMutation = useUpdateUbicacion();

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting, isValid }
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
      reset({
        direccion: ubicacion.direccion || '',
        descripcion: ubicacion.descripcion || '',
        paisId: ubicacion.localidad?.provincia?.pais?.idPais || 0,
        provinciaId: ubicacion.localidad?.provincia?.idProvincia || 0,
        localidadId: ubicacion.localidad?.idLocalidad || 0,
      });
    }
  }, [ubicacion, isEditing, reset]);

  const onSubmit = async (data: UbicacionFormData) => {
    try {
      if (isEditing && id) {
        const updateData: UpdateUbicacionDto = {
          idUbicacion: parseInt(id),
          direccion: data.direccion.trim(),
          descripcion: data.descripcion?.trim() || ""
          };
        
        await updateUbicacionMutation.mutateAsync({
          id: parseInt(id),
          data: updateData
        });
      } else {
        const createData: CreateUbicacionDto = {
          direccion: data.direccion.trim(),
          descripcion: data.descripcion?.trim() || "",
          idLocalidad: data.localidadId,
        };
        
        await createUbicacionMutation.mutateAsync(createData);
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
      <div className="space-y-6">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => navigate("/ubicaciones")}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
        </div>
        <Card>
          <CardContent className="p-6">
            <div className="animate-pulse space-y-4">
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button variant="ghost" onClick={() => navigate("/ubicaciones")}>
          <ArrowLeft className="h-4 w-4 mr-2" />
          Volver a Ubicaciones
        </Button>
      </div>

      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-100 rounded-lg">
          <MapPin className="h-6 w-6 text-blue-600" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            {isEditing ? "Editar Ubicación" : "Nueva Ubicación"}
          </h1>
          <p className="text-gray-600">
            {isEditing ? "Modifica los datos de la ubicación" : "Completa la información para crear una nueva ubicación"}
          </p>
        </div>
      </div>

      {/* Error Alert de mutaciones */}
      {(createUbicacionMutation.error || updateUbicacionMutation.error) && (
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>
            {createUbicacionMutation.error?.message || updateUbicacionMutation.error?.message}
          </AlertDescription>
        </Alert>
      )}

      {/* Success Alert */}
      {(createUbicacionMutation.isSuccess || updateUbicacionMutation.isSuccess) && (
        <Alert className="border-green-200 bg-green-50">
          <AlertTitle className="text-green-800">¡Éxito!</AlertTitle>
          <AlertDescription className="text-green-700">
            Ubicación {isEditing ? 'actualizada' : 'creada'} correctamente.
          </AlertDescription>
        </Alert>
      )}

      {/* Form */}
      <Card className="backdrop-blur-sm bg-white/80 border-white/20 shadow-xl">
        <CardHeader className="text-black rounded-t-lg">
          <CardTitle className="flex items-center gap-2">
            <MapPin className="h-5 w-5" />
            Información de la Ubicación
          </CardTitle>
        </CardHeader>
        <CardContent className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
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

            {/* Errores de validación de ubicación */}
            {errors.paisId && (
              <p className="text-red-500 text-sm">{errors.paisId.message}</p>
            )}
            {errors.provinciaId && (
              <p className="text-red-500 text-sm">{errors.provinciaId.message}</p>
            )}
            {errors.localidadId && (
              <p className="text-red-500 text-sm">{errors.localidadId.message}</p>
            )}

            {isEditing && (
              <Alert className="border-amber-200 bg-amber-50">
                <AlertDescription className="text-amber-800">
                  ⚠️ En modo edición, solo puede cambiar la dirección y la descripción.
                </AlertDescription>
              </Alert>
            )}

            <div className="grid gap-6 md:grid-cols-1">
              {/* Dirección */}
              <div className="space-y-2">
                <Label htmlFor="direccion">
                  Dirección <span className="text-red-500">*</span>
                </Label>
                <Input
                  id="direccion"
                  {...register('direccion')}
                  placeholder="Ingrese la dirección específica (ej: Av. Corrientes 1234)"
                  className="bg-white/50 border-white/30"
                  disabled={isSubmitting}
                />
                {errors.direccion && (
                  <p className="text-red-500 text-sm">{errors.direccion.message}</p>
                )}
              </div>

              {/* Descripción */}
              <div className="space-y-2">
                <Label htmlFor="descripcion">Descripción</Label>
                <Input
                  id="descripcion"
                  {...register('descripcion')}
                  placeholder="Descripción adicional (opcional)"
                  className="bg-white/50 border-white/30"
                  disabled={isSubmitting}
                />
                {errors.descripcion && (
                  <p className="text-red-500 text-sm">{errors.descripcion.message}</p>
                )}
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-6 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => navigate("/ubicaciones")}
                disabled={isSubmitting}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={!isValid || isSubmitting}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
              >
                {isSubmitting ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEditing ? "Actualizar" : "Crear"} Ubicación
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
