import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert } from '@/components/ui/alert';
import { ArrowLeft, Save, Package } from 'lucide-react';
import { useEnvio, useEnviosCrud } from '../hooks/useEnvios';
import { EstadoEnvioSelector } from '../components/EstadoEnvioSelector';
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
  }).positive('Debe seleccionar una ubicación de origen válida'),
  
  idDestino: z.number({
    message: 'La ubicación de destino es requerida',
  }).positive('Debe seleccionar una ubicación de destino válida'),
  
  numeroSeguimiento: z.string({
    message: 'El número de seguimiento es requerido',
  }).min(1, 'El número de seguimiento no puede estar vacío'),
  
  fechaSalidaProgramada: z.string({
    message: 'La fecha de salida programada es requerida',
  }).refine((date) => {
    const selectedDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selectedDate >= today;
  }, 'La fecha de salida debe ser hoy o en el futuro'),
  
  fechaEntregaEstimada: z.string({
    message: 'La fecha de entrega estimada es requerida',
  }),
  
  pesoKg: z.number({
    message: 'El peso es requerido',
  }).positive('El peso debe ser mayor a 0'),
  
  volumenM3: z.number({
    message: 'El volumen es requerido',
  }).positive('El volumen debe ser mayor a 0'),
  
  descripcion: z.string().optional(),
  
  idEstado: z.number({
    message: 'El estado del envío es requerido',
  }).positive('Debe seleccionar un estado válido'),
  
  costoTotal: z.number({
    message: 'El costo total es requerido',
  }).positive('El costo total debe ser mayor a 0'),
  
  idVehiculo: z.number({
    message: 'El vehículo es requerido',
  }).positive('Debe seleccionar un vehículo válido'),
  
  idConductor: z.number({
    message: 'El conductor es requerido',
  }).positive('Debe seleccionar un conductor válido'),
  
  idCliente: z.number({
    message: 'El cliente es requerido',
  }).positive('Debe seleccionar un cliente válido'),
  
  idTipoCarga: z.number({
    message: 'El tipo de carga es requerido',
  }).positive('Debe seleccionar un tipo de carga válido'),
}).refine((data) => {
  const fechaSalida = new Date(data.fechaSalidaProgramada);
  const fechaEntrega = new Date(data.fechaEntregaEstimada);
  return fechaEntrega >= fechaSalida;
}, {
  message: 'La fecha de entrega debe ser igual o posterior a la fecha de salida',
  path: ['fechaEntregaEstimada'],
}).refine((data) => {
  return data.idOrigen !== data.idDestino;
}, {
  message: 'La ubicación de origen y destino deben ser diferentes',
  path: ['idDestino'],
});

type EnvioFormData = z.infer<typeof envioSchema>;

export const EnvioFormPage: React.FC = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEditing = Boolean(id);
  
  const { envio, loading: loadingEnvio } = useEnvio(id ? parseInt(id) : undefined);
  const { createEnvio, updateEnvio, loading, error } = useEnviosCrud();
  
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors, isValid },
    reset,
  } = useForm<EnvioFormData>({
    resolver: zodResolver(envioSchema),
    mode: 'onChange',
  });

  // Watch para validaciones cruzadas
  const fechaSalidaProgramada = watch('fechaSalidaProgramada');

  // Efecto para cargar datos del envío en modo edición
  useEffect(() => {
    if (isEditing && envio) {
      const formatDate = (date?: Date | null) => {
        if (!date) return '';
        const d = date instanceof Date ? date : new Date(date);
        return d.toISOString().split('T')[0];
      };

      reset({
        idOrigen: envio.origen?.idUbicacion || 0,
        idDestino: envio.destino?.idUbicacion || 0,
        numeroSeguimiento: envio.numeroSeguimiento || '',
        fechaSalidaProgramada: formatDate(envio.fechaSalidaProgramada),
        fechaEntregaEstimada: formatDate(envio.fechaEntregaEstimada),
        pesoKg: envio.pesoKg || 0,
        volumenM3: envio.volumenM3 || 0,
        descripcion: envio.descripcion || '',
        idEstado: envio.estado?.idEstado || 1, // Default al primer estado
        costoTotal: envio.costoTotal || 0,
        idVehiculo: envio.vehiculo?.idVehiculo || 0,
        idConductor: envio.conductor?.idConductor || 0,
        idCliente: envio.cliente?.idCliente || 0,
        idTipoCarga: envio.tipoCarga?.idTipoCarga || 0,
      });
    } else if (!isEditing) {
      // Para nuevos envíos, establecer estado por defecto
      setValue('idEstado', 1, { shouldValidate: true });
    }
  }, [envio, isEditing, reset, setValue]);

  const onSubmit = async (data: EnvioFormData) => {
    try {
      setSubmitError(null);
      setSubmitSuccess(false);

      let success = false;
      if (isEditing && id) {
        const envioData: UpdateEnvioDto = {
          idEnvio: parseInt(id),
          ...data,
          fechaSalidaProgramada: new Date(data.fechaSalidaProgramada),
          fechaEntregaEstimada: new Date(data.fechaEntregaEstimada),
        };
        success = await updateEnvio(parseInt(id), envioData);
      } else {
        const envioData: CreateEnvioDto = {
          ...data,
          fechaSalidaProgramada: new Date(data.fechaSalidaProgramada),
          fechaEntregaEstimada: new Date(data.fechaEntregaEstimada),
        };
        success = await createEnvio(envioData);
      }

      if (success) {
        setSubmitSuccess(true);
        setTimeout(() => {
          navigate('/envios');
        }, 1500);
      }
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
    <div className="container mx-auto py-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleBack}
            className="text-black hover:bg-black/10"
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div className="flex items-center gap-2 text-black">
            <Package className="h-6 w-6" />
            <h1 className="text-2xl font-bold">
              {isEditing ? 'Editar Envío' : 'Nuevo Envío'}
            </h1>
          </div>
        </div>
      </div>

      {/* Alerts */}
      {submitSuccess && (
        <Alert className="bg-green-500/20 border-green-500/30 text-green-100">
          <div className="font-medium">
            {isEditing ? 'Envío actualizado exitosamente' : 'Envío creado exitosamente'}
          </div>
        </Alert>
      )}

      {(error || submitError) && (
        <Alert className="bg-red-500/20 border-red-500/30 text-red-100">
          <div className="font-medium">
            {error || submitError}
          </div>
        </Alert>
      )}

      {/* Form */}
      <Card>
        <CardHeader>
          <CardTitle className="text-black">
            Información del Envío
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Número de Seguimiento *
                </label>
                <input
                  {...register('numeroSeguimiento')}
                  className="w-full px-3 py-2 border border-black/20 rounded-md text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Ingrese el número de seguimiento"
                />
                {errors.numeroSeguimiento && (
                  <p className="text-red-300 text-sm">{errors.numeroSeguimiento.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Cliente *
                </label>
                <ClienteSelector
                  value={watch('idCliente')}
                  onValueChange={(value: number) => setValue('idCliente', value, { shouldValidate: true })}
                  error={errors.idCliente?.message}
                />
              </div>
            </div>

            {/* Ubicaciones */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Ubicación de Origen *
                </label>
                <UbicacionSelectorSimple
                  value={watch('idOrigen')}
                  onValueChange={(value: number) => setValue('idOrigen', value, { shouldValidate: true })}
                  error={errors.idOrigen?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Ubicación de Destino *
                </label>
                <UbicacionSelectorSimple
                  value={watch('idDestino')}
                  onValueChange={(value: number) => setValue('idDestino', value, { shouldValidate: true })}
                  error={errors.idDestino?.message}
                />
              </div>
            </div>

            {/* Fechas y Estado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Fecha de Salida Programada *
                </label>
                <input
                  {...register('fechaSalidaProgramada')}
                  type="date"
                  className="w-full px-3 py-2 bg-black/10 border border-black/20 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fechaSalidaProgramada && (
                  <p className="text-red-300 text-sm">{errors.fechaSalidaProgramada.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Fecha de Entrega Estimada *
                </label>
                <input
                  {...register('fechaEntregaEstimada')}
                  type="date"
                  min={fechaSalidaProgramada}
                  className="w-full px-3 py-2 bg-black/10 border border-black/20 rounded-md text-black focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                {errors.fechaEntregaEstimada && (
                  <p className="text-red-300 text-sm">{errors.fechaEntregaEstimada.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Estado del Envío *
                </label>
                <EstadoEnvioSelector
                  value={watch('idEstado')}
                  onValueChange={(value: number) => setValue('idEstado', value, { shouldValidate: true })}
                  error={errors.idEstado?.message}
                />
              </div>
            </div>

            {/* Recursos */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Conductor *
                </label>
                <ConductorSelector
                  value={watch('idConductor')}
                  onValueChange={(value: number) => setValue('idConductor', value, { shouldValidate: true })}
                  error={errors.idConductor?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Vehículo *
                </label>
                <VehiculoSelector
                  value={watch('idVehiculo')}
                  onValueChange={(value: number) => setValue('idVehiculo', value, { shouldValidate: true })}
                  error={errors.idVehiculo?.message}
                />
              </div>
            </div>

            {/* Detalles de carga */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Tipo de Carga *
                </label>
                <TipoCargaSelector
                  value={watch('idTipoCarga')}
                  onValueChange={(value: number) => setValue('idTipoCarga', value, { shouldValidate: true })}
                  error={errors.idTipoCarga?.message}
                />
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Peso (kg) *
                </label>
                <input
                  {...register('pesoKg', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-black/10 border border-black/20 rounded-md text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.pesoKg && (
                  <p className="text-red-300 text-sm">{errors.pesoKg.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Volumen (m³) *
                </label>
                <input
                  {...register('volumenM3', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-black/10 border border-black/20 rounded-md text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.volumenM3 && (
                  <p className="text-red-300 text-sm">{errors.volumenM3.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-black">
                  Costo Total *
                </label>
                <input
                  {...register('costoTotal', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="w-full px-3 py-2 bg-black/10 border border-black/20 rounded-md text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="0.00"
                />
                {errors.costoTotal && (
                  <p className="text-red-300 text-sm">{errors.costoTotal.message}</p>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-black">
                Descripción
              </label>
              <textarea
                {...register('descripcion')}
                rows={3}
                className="w-full px-3 py-2 bg-black/10 border border-black/20 rounded-md text-black placeholder-black/50 focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                placeholder="Descripción opcional del envío..."
              />
              {errors.descripcion && (
                <p className="text-red-300 text-sm">{errors.descripcion.message}</p>
              )}
            </div>

            {/* Botones */}
            <div className="flex justify-end gap-4 pt-6">
              <Button
                type="button"
                variant="ghost"
                onClick={handleBack}
                disabled={loading}
                className="text-black hover:bg-black/10"
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid || loading}
                className="bg-blue-600 hover:bg-blue-700 text-black"
              >
                {loading ? (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-black"></div>
                    {isEditing ? 'Actualizando...' : 'Guardando...'}
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <Save className="h-4 w-4" />
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
