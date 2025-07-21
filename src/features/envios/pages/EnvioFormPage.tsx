import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useEnvio, useCreateEnvio, useUpdateEnvio } from '../hooks/useEnvios';
import { UbicacionSelectorSimple } from '@/features/ubicaciones/components/UbicacionSelectorSimple';
import { ClienteSelector } from '@/features/clientes/components/ClienteSelector';
import { ConductorSelector } from '@/features/conductores/components/ConductorSelector';
import { VehiculoSelector } from '@/features/vehiculos/components/VehiculoSelector';
import { TipoCargaSelector } from '@/features/tiposCarga/components/TipoCargaSelector';
import type { CreateEnvioDto, UpdateEnvioDto } from '@/api';

// Schema de validación con Zod
const envioSchema = z.object({
  idOrigen: z.number({
    message: 'La ubicación de origen es requerida',
  }).refine(val => val > 0, 'Debe seleccionar una ubicación de origen válida'),
  
  idDestino: z.number({
    message: 'La ubicación de destino es requerida',
  }).refine(val => val > 0, 'Debe seleccionar una ubicación de destino válida'),
  
  numeroSeguimiento: z.string({
    message: 'El número de seguimiento es requerido',
  }).min(1, 'El número de seguimiento es requerido'),

  fechaSalida: z.string({
    message: 'La fecha de salida es requerida',
  }).min(1, 'La fecha de salida es requerida'),
  
  idEstado: z.number({
    message: 'El estado es requerido',
  }).refine(val => val > 0, 'Debe seleccionar un estado válido'),
  
  pesoKg: z.number({
    message: 'El peso es requerido',
  }).refine(val => val > 0, 'El peso debe ser mayor a 0'),
  
  volumenM3: z.number({
    message: 'El volumen es requerido',
  }).refine(val => val > 0, 'El volumen debe ser mayor a 0'),
  
  descripcion: z.string().optional(),
  
  costoTotal: z.number({
    message: 'El costo total es requerido',
  }).min(0, 'El costo total debe ser mayor o igual a 0'),
  
  idCliente: z.number({
    message: 'El cliente es requerido',
  }).refine(val => val > 0, 'Debe seleccionar un cliente válido'),
  
  idConductor: z.number({
    message: 'El conductor es requerido',
  }).refine(val => val > 0, 'Debe seleccionar un conductor válido'),
  
  idVehiculo: z.number({
    message: 'El vehículo es requerido',
  }).refine(val => val > 0, 'Debe seleccionar un vehículo válido'),
  
  idTipoCarga: z.number({
    message: 'El tipo de carga es requerido',
  }).refine(val => val > 0, 'Debe seleccionar un tipo de carga válido'),
});

type EnvioFormData = z.infer<typeof envioSchema>;

export const EnvioFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const { data: envio, isLoading: loadingEnvio } = useEnvio(id ? parseInt(id) : 0);
  const createEnvioMutation = useCreateEnvio();
  const updateEnvioMutation = useUpdateEnvio();
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isValid },
  } = useForm<EnvioFormData>({
    resolver: zodResolver(envioSchema),
    mode: 'onBlur',
    defaultValues: {
      idOrigen: 0,
      idDestino: 0,
      numeroSeguimiento: '',
      fechaSalida: '',
      idEstado: 0,
      pesoKg: 0,
      volumenM3: 0,
      descripcion: '',
      costoTotal: 0,
      idCliente: 0,
      idConductor: 0,
      idVehiculo: 0,
      idTipoCarga: 0,
    }
  });

  const loading = createEnvioMutation.isPending || updateEnvioMutation.isPending;

  // Pre-llenar el formulario cuando se está editando
  useEffect(() => {
    if (isEditing && envio) {
      reset({
        idOrigen: envio.origen?.idUbicacion || 0,
        idDestino: envio.destino?.idUbicacion || 0,
        numeroSeguimiento: envio.numeroSeguimiento || '',
        fechaSalida: envio.fechaSalida
          ? new Date(envio.fechaSalida).toISOString().slice(0, 16)
          : '',
        idEstado: envio.estado?.idEstado || 0,
        pesoKg: envio.pesoKg || 0,
        volumenM3: envio.volumenM3 || 0,
        descripcion: envio.descripcion || '',
        costoTotal: envio.costoTotal || 0,
        idCliente: envio.cliente?.idCliente || 0,
        idConductor: envio.conductor?.idConductor || 0,
        idVehiculo: envio.vehiculo?.idVehiculo || 0,
        idTipoCarga: envio.tipoCarga?.idTipoCarga || 0,
      });
    }
  }, [envio, isEditing, reset]);

  const onSubmit = async (data: EnvioFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      if (isEditing && id) {
        const envioData: UpdateEnvioDto = {
          idEnvio: parseInt(id),
          ...data,
          fechaSalida: new Date(data.fechaSalida)
        };
        await updateEnvioMutation.mutateAsync({ id: parseInt(id), data: envioData });
      } else {
        const envioData: CreateEnvioDto = {
          ...data,
          fechaSalida: new Date(data.fechaSalida)
        };
        await createEnvioMutation.mutateAsync(envioData);
      }

      setSubmitSuccess(true);
      setTimeout(() => {
        navigate('/envios');
      }, 1500);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Error inesperado');
    }
  };

  const handleBack = () => {
    navigate('/envios');
  };

  if (isEditing && loadingEnvio) {
    return (
      <div className="container mx-auto py-8">
        <Card>
          <CardContent className="p-8">
            <div className="text-center text-black">Cargando envío...</div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleBack}
              className="text-black hover:bg-gray-100"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver
            </Button>
            <div className="flex items-center gap-2">
              <Package className="w-6 h-6 text-blue-600" />
              <CardTitle className="text-black">
                {isEditing ? 'Editar Envío' : 'Nuevo Envío'}
              </CardTitle>
            </div>
          </div>
        </CardHeader>

        <CardContent>
          {submitSuccess && (
            <Alert className="mb-6 bg-green-500/20 border-green-500/30 text-green-800">
              <div className="font-medium">
                ¡Envío {isEditing ? 'actualizado' : 'creado'} exitosamente!
              </div>
            </Alert>
          )}

          {submitError && (
            <Alert className="mb-6 bg-red-500/20 border-red-500/30 text-red-100">
              <div className="font-medium">
                {submitError}
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información Básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Número de Seguimiento *
                </label>
                <input
                  {...register('numeroSeguimiento')}
                  type="text"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="Ingrese número de seguimiento"
                />
                {errors.numeroSeguimiento && (
                  <p className="text-red-500 text-sm mt-1">{errors.numeroSeguimiento.message}</p>
                )}
              </div>

               {/* Fecha de salida */}
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Fecha de Salida Programada *
                </label>
                <input
                  {...register('fechaSalida')}
                  type="datetime-local"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                />
                {errors.fechaSalida && (
                  <p className="text-red-500 text-sm mt-1">{errors.fechaSalida.message}</p>
                )}
              </div>
            </div>

            {/* Ubicaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Ubicación de Origen *
                </label>
                <UbicacionSelectorSimple
                  value={watch('idOrigen')}
                  onValueChange={(value: number) => setValue('idOrigen', value, { shouldValidate: true })}
                  error={errors.idOrigen?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Ubicación de Destino *
                </label>
                <UbicacionSelectorSimple
                  value={watch('idDestino')}
                  onValueChange={(value: number) => setValue('idDestino', value, { shouldValidate: true })}
                  error={errors.idDestino?.message}
                />
              </div>
            </div>

            {/* Detalles del Envío */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Peso (Kg) *
                </label>
                <input
                  {...register('pesoKg', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="0.00"
                />
                {errors.pesoKg && (
                  <p className="text-red-500 text-sm mt-1">{errors.pesoKg.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Volumen (m³) *
                </label>
                <input
                  {...register('volumenM3', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="0.00"
                />
                {errors.volumenM3 && (
                  <p className="text-red-500 text-sm mt-1">{errors.volumenM3.message}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Costo Total *
                </label>
                <input
                  {...register('costoTotal', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                  placeholder="0.00"
                />
                {errors.costoTotal && (
                  <p className="text-red-500 text-sm mt-1">{errors.costoTotal.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div>
              <label className="block text-sm font-medium text-black mb-2">
                Descripción
              </label>
              <textarea
                {...register('descripcion')}
                rows={3}
                className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                placeholder="Descripción adicional del envío (opcional)"
              />
              {errors.descripcion && (
                <p className="text-red-500 text-sm mt-1">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Selecciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Cliente *
                </label>
                <ClienteSelector
                  value={watch('idCliente')}
                  onValueChange={(value: number) => setValue('idCliente', value, { shouldValidate: true })}
                  error={errors.idCliente?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Tipo de Carga *
                </label>
                <TipoCargaSelector
                  value={watch('idTipoCarga')}
                  onValueChange={(value: number) => setValue('idTipoCarga', value, { shouldValidate: true })}
                  error={errors.idTipoCarga?.message}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Conductor *
                </label>
                <ConductorSelector
                  value={watch('idConductor')}
                  onValueChange={(value: number) => setValue('idConductor', value, { shouldValidate: true })}
                  error={errors.idConductor?.message}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-black mb-2">
                  Vehículo *
                </label>
                <VehiculoSelector
                  value={watch('idVehiculo')}
                  onValueChange={(value: number) => setValue('idVehiculo', value, { shouldValidate: true })}
                  error={errors.idVehiculo?.message}
                />
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleBack}
                disabled={loading}
                className="text-black border-gray-300 hover:bg-gray-50"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid || loading}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    {isEditing ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="w-4 h-4" />
                    {isEditing ? 'Actualizar Envío' : 'Crear Envío'}
                  </div>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};
