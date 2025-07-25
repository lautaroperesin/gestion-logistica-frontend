import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { MapPin, Save, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { showCreateSuccessToast, showUpdateSuccessToast, showErrorToast } from '@/lib/toast-utils';
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
        
        // Toast de actualización exitosa
        showUpdateSuccessToast(data.direccion);
      } else {
        const createData: CreateUbicacionDto = {
          direccion: data.direccion.trim(),
          descripcion: data.descripcion?.trim() || "",
          idLocalidad: data.localidadId,
        };
        
        await createUbicacionMutation.mutateAsync(createData);
        
        // Toast de creación exitosa
        showCreateSuccessToast(data.direccion);
      }
      
      setTimeout(() => {
        navigate('/ubicaciones');
      }, 1500);
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      
      // Toast de error
      showErrorToast(
        errorMessage,
        isEditing ? 'Error al actualizar ubicación' : 'Error al crear ubicación'
      );
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
      <div className="container min-h-screen">
        <Card className="max-w-4xl mx-auto shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center text-black">Cargando ubicación...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container min-h-screen">
      <Card className="max-w-4xl mx-auto shadow-xl border-0">
        <CardHeader className="text-black rounded-t-lg py-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/ubicaciones")}
                className="text-black hover:bg-blue-100 border-black/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <MapPin className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {isEditing ? "Editar Ubicación" : "Nueva Ubicación"}
                  </CardTitle>
                  <p className="text-gray-500 text-sm">
                    {isEditing ? "Modifica los datos de la ubicación" : "Complete la información de la nueva ubicación"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Ubicación Geográfica */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Ubicación Geográfica
              </h3>
              <div className="space-y-4">
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
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.paisId.message}
                  </p>
                )}
                {errors.provinciaId && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.provinciaId.message}
                  </p>
                )}
                {errors.localidadId && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.localidadId.message}
                  </p>
                )}
              </div>
            </div>

            {/* Información Específica */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Información Específica
              </h3>
              <div className="grid grid-cols-1 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Dirección *
                  </label>
                  <Input
                    {...register('direccion')}
                    type="text"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Ingrese la dirección específica (ej: Av. Corrientes 1234)"
                    disabled={isSubmitting}
                  />
                  {errors.direccion && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.direccion.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Descripción
                  </label>
                  <Input
                    {...register('descripcion')}
                    type="text"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Descripción adicional (opcional)"
                    disabled={isSubmitting}
                  />
                  {errors.descripcion && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.descripcion.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => navigate("/ubicaciones")}
                  disabled={isSubmitting}
                  className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isValid || isSubmitting}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="font-medium">
                        {isEditing ? 'Actualizando...' : 'Creando...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      <span className="font-medium">
                        {isEditing ? "Actualizar Ubicación" : "Crear Ubicación"}
                      </span>
                    </div>
                  )}
                </Button>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
