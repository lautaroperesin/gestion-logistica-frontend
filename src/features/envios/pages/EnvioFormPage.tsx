import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useEnvio, useCreateEnvio, useUpdateEnvio } from '../hooks/useEnvios';
import { UbicacionSelectorSimple } from '@/features/ubicaciones/components/UbicacionSelectorSimple';
import { ClienteSelector } from '@/features/clientes/components/ClienteSelector';
import { ConductorSelector } from '@/features/conductores/components/ConductorSelector';
import { VehiculoSelector } from '@/features/vehiculos/components/VehiculoSelector';
import { TipoCargaSelector } from '@/features/tiposCarga/components/TipoCargaSelector';
import type { CreateEnvioDto, UpdateEnvioDto } from '@/api';
import { Input } from '@/components/ui/input';

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

  fechaSalida: z.date({
    message: 'La fecha de salida es requerida',
  }),
  
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
      fechaSalida: new Date(),
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
        fechaSalida: envio.fechaSalida ? new Date(envio.fechaSalida) : new Date(),
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

      if (isEditing && id) {
        const envioData: UpdateEnvioDto = {
          idEnvio: parseInt(id),
          ...data,
          fechaSalida: data.fechaSalida
        };
        await updateEnvioMutation.mutateAsync({ id: parseInt(id), data: envioData });
      } else {
        const envioData: CreateEnvioDto = {
          ...data,
          fechaSalida: data.fechaSalida
        };
        await createEnvioMutation.mutateAsync(envioData);
      }

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
    <div className="container min-h-screen">
        <Card className="max-w-6xl mx-auto shadow-xl border-0">
          <CardHeader className="text-black rounded-t-lg py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleBack}
                  className="text-black hover:bg-green-300 border-black/20"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Volver
                </Button>
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg">
                    <Package className="w-8 h-8" />
                  </div>
                  <div>
                    <CardTitle className="text-2xl font-bold">
                      {isEditing ? 'Editar Envío' : 'Nuevo Envío'}
                    </CardTitle>
                    <p className="text-gray-500 text-sm">
                      {isEditing ? 'Modifica la información del envío' : 'Complete los datos para crear un nuevo envío'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </CardHeader>

        <CardContent className="p-4">
          {submitError && (
            <Alert className="mb-8 bg-gradient-to-r from-red-50 to-rose-50 border-red-200 text-red-800 shadow-sm">
              <div className="flex items-center gap-2">
                <div className="w-5 h-5 rounded-full bg-red-500 flex items-center justify-center">
                  <div className="w-2 h-2 bg-white rounded-full"></div>
                </div>
                <div className="font-medium">
                  {submitError}
                </div>
              </div>
            </Alert>
          )}

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Información Básica */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Seguimiento *
                  </label>
                  <div className="relative">
                    <Input
                      {...register('numeroSeguimiento')}
                      type="text"
                      className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="Ingrese número de seguimiento"
                    />
                  </div>
                  {errors.numeroSeguimiento && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.numeroSeguimiento.message}
                    </p>
                  )}
                </div>

                {/* Fecha de salida */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Salida Programada *
                  </label>
                  <DatePicker
                    date={watch('fechaSalida')}
                    onDateChange={(date) => setValue('fechaSalida', date || new Date(), { shouldValidate: true })}
                    placeholder="Selecciona la fecha de salida"
                  />
                  {errors.fechaSalida && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.fechaSalida.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Ubicaciones */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Ubicaciones
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación de Origen *
                  </label>
                  <UbicacionSelectorSimple
                    value={watch('idOrigen')}
                    onValueChange={(value: number) => setValue('idOrigen', value, { shouldValidate: true })}
                    error={errors.idOrigen?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Ubicación de Destino *
                  </label>
                  <UbicacionSelectorSimple
                    value={watch('idDestino')}
                    onValueChange={(value: number) => setValue('idDestino', value, { shouldValidate: true })}
                    error={errors.idDestino?.message}
                  />
                </div>
              </div>
            </div>

            {/* Selecciones - Primera fila */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-cyan-500 rounded-full"></div>
                Cliente y Tipo de Carga
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <ClienteSelector
                    value={watch('idCliente')}
                    onValueChange={(value: number) => setValue('idCliente', value, { shouldValidate: true })}
                    error={errors.idCliente?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Tipo de Carga *
                  </label>
                  <TipoCargaSelector
                    value={watch('idTipoCarga')}
                    onValueChange={(value: number) => setValue('idTipoCarga', value, { shouldValidate: true })}
                    error={errors.idTipoCarga?.message}
                  />
                </div>
              </div>
            </div>

            {/* Selecciones - Segunda fila */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-rose-500 rounded-full"></div>
                Conductor y Vehículo
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Conductor *
                  </label>
                  <ConductorSelector
                    value={watch('idConductor')}
                    onValueChange={(value: number) => setValue('idConductor', value, { shouldValidate: true })}
                    error={errors.idConductor?.message}
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Vehículo *
                  </label>
                  <VehiculoSelector
                    value={watch('idVehiculo')}
                    onValueChange={(value: number) => setValue('idVehiculo', value, { shouldValidate: true })}
                    error={errors.idVehiculo?.message}
                  />
                </div>
              </div>
            </div>

             {/* Detalles del Envío */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Detalles del Envío
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Peso (Kg) *
                  </label>
                  <div className="relative">
                    <input
                      {...register('pesoKg', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-3 text-gray-500 text-sm">kg</span>
                  </div>
                  {errors.pesoKg && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.pesoKg.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Volumen (m³) *
                  </label>
                  <div className="relative">
                    <input
                      {...register('volumenM3', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                    />
                    <span className="absolute right-3 top-3 text-gray-500 text-sm">m³</span>
                  </div>
                  {errors.volumenM3 && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.volumenM3.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Costo Total *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">$</span>
                    <input
                      {...register('costoTotal', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.costoTotal && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.costoTotal.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Descripción */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                Descripción Adicional
              </h3>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Descripción (Opcional)
                </label>
                <textarea
                  {...register('descripcion')}
                  rows={4}
                  className="w-full p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400 resize-none"
                  placeholder="Descripción adicional del envío, instrucciones especiales, etc."
                />
                {errors.descripcion && (
                  <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                    <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                    {errors.descripcion.message}
                  </p>
                )}
              </div>
            </div>

            {/* Botones */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBack}
                  disabled={loading}
                  className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={!isValid || loading}
                  className="px-8 py-3 hover:bg-green-300 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform"
                >
                  {loading ? (
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
                        {isEditing ? 'Actualizar Envío' : 'Crear Envío'}
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
};
