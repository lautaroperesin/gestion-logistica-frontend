import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DatePicker } from '@/components/ui/date-picker';
import { ArrowLeft, Save, FileText } from 'lucide-react';
import { useCreateFactura, useUpdateFactura, useFactura } from '../hooks/useFacturas';
import { useEnvios } from '@/features/envios/hooks/useEnvios';
import { ClienteSelector } from '@/features/clientes/components/ClienteSelector';
import { showCreateSuccessToast, showUpdateSuccessToast, showErrorToast } from '@/lib/toast-utils';
import type { CreateFacturaDto, UpdateFacturaDto } from '@/api';

// Schema de validación
const facturaSchema = z.object({
  idEnvio: z.number().min(1, 'Debes seleccionar un envío'),
  idCliente: z.number().min(1, 'Debes seleccionar un cliente'),
  numeroFactura: z.string().min(1, 'El número de factura es requerido'),
  fechaEmision: z.date({
    message: "La fecha de emisión es requerida"
  }),
  fechaVencimiento: z.date().optional(),
  estado: z.number().optional(),
  subtotal: z.number().min(0, 'El subtotal debe ser mayor o igual a 0'),
  iva: z.number().min(0, 'El IVA debe ser mayor o igual a 0'),
  total: z.number().min(0, 'El total debe ser mayor a 0'),
});

type FacturaFormData = z.infer<typeof facturaSchema>;

export const FacturaFormPage = () => {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  const isEdit = Boolean(id);
  const facturaId = id ? parseInt(id) : undefined;

  // Hooks para datos
  const { data: factura, isLoading: facturaLoading } = useFactura(facturaId || 0);
  const createFacturaMutation = useCreateFactura();
  const updateFacturaMutation = useUpdateFactura();
  const { data: enviosResult, isLoading: enviosLoading } = useEnvios();
  
  const envios = enviosResult?.items || [];

  // Configuración del formulario
  const form = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      idEnvio: 0,
      idCliente: 0,
      numeroFactura: '',
      fechaEmision: new Date(),
      fechaVencimiento: undefined,
      estado: 1, // Emitida por defecto
      subtotal: 0,
      iva: 0,
      total: 0,
    },
  });

  const { register, handleSubmit, watch, setValue, control, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Cargar datos del envío seleccionado
  useEffect(() => {
    if (watchedValues.idEnvio > 0 && envios.length > 0) {
      const envioSeleccionado = envios.find((e: any) => e.idEnvio === watchedValues.idEnvio);
      if (envioSeleccionado && envioSeleccionado.cliente?.idCliente) {
        setValue('idCliente', envioSeleccionado.cliente.idCliente);
      }
    }
  }, [watchedValues.idEnvio, envios, setValue]);

  // Calcular total automáticamente
  useEffect(() => {
      const subtotal = watchedValues.subtotal || 0;
      const iva = watchedValues.iva || 0;
      const total = subtotal + iva;
      setValue('total', total);
  }, [watchedValues.subtotal, watchedValues.iva, setValue]);

  // Cargar datos para edición
  useEffect(() => {
    if (isEdit && factura && !facturaLoading) {
      setValue('idEnvio', factura.envio?.idEnvio || 0);
      setValue('idCliente', factura.cliente?.idCliente || 0);
      setValue('numeroFactura', factura.numeroFactura || '');
      setValue('fechaEmision', factura.fechaEmision ? new Date(factura.fechaEmision) : new Date());
      setValue('fechaVencimiento', factura.fechaVencimiento ? new Date(factura.fechaVencimiento) : undefined);
      setValue('estado', factura.estado || 0);
      setValue('subtotal', factura.subtotal || 0);
      setValue('iva', factura.iva || 0);
      setValue('total', factura.total || 0);
    }
  }, [isEdit, factura, facturaLoading, setValue]);

  const onSubmit = async (data: FacturaFormData) => {
    try {
      if (isEdit && facturaId) {
        const updateData: UpdateFacturaDto = {
          idFactura: facturaId,
          ...data,
          fechaEmision: data.fechaEmision,
          fechaVencimiento: data.fechaVencimiento,
          estado: data.estado as any,
        };
        await updateFacturaMutation.mutateAsync({ id: facturaId, data: updateData });
        
        // Toast de actualización exitosa
        showUpdateSuccessToast(`Factura #${data.numeroFactura}`);
        
        setTimeout(() => {
          navigate('/facturas');
        }, 1500);
      } else {
        const createData: CreateFacturaDto = {
          ...data,
          fechaEmision: data.fechaEmision,
          fechaVencimiento: data.fechaVencimiento,
          estado: data.estado as any,
        };
        await createFacturaMutation.mutateAsync(createData);
        
        // Toast de creación exitosa
        showCreateSuccessToast(`Factura #${data.numeroFactura}`);
        
        setTimeout(() => {
          navigate('/facturas');
        }, 1500);
      }
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Error inesperado';
      
      // Toast de error
      showErrorToast(
        errorMessage,
        isEdit ? 'Error al actualizar factura' : 'Error al crear factura'
      );
    }
  };

  const handleCancel = () => {
    navigate('/facturas');
  };

  const isLoading = createFacturaMutation.isPending || updateFacturaMutation.isPending;
  const dataLoading = enviosLoading;

  if (facturaLoading) {
    return (
      <div className="container min-h-screen">
        <Card className="max-w-6xl mx-auto shadow-xl border-0">
          <CardContent className="p-8">
            <div className="text-center text-black">Cargando factura...</div>
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
                onClick={handleCancel}
                className="text-black hover:bg-blue-100 border-black/20"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Volver
              </Button>
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg">
                  <FileText className="w-8 h-8" />
                </div>
                <div>
                  <CardTitle className="text-2xl font-bold">
                    {isEdit ? "Editar Factura" : "Nueva Factura"}
                  </CardTitle>
                  <p className="text-gray-500 text-sm">
                    {isEdit ? "Modifica los datos de la factura" : "Complete la información de la nueva factura"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-4">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            {/* Información Básica */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                Información Básica
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Número de Factura *
                  </label>
                  <Input
                    {...register('numeroFactura')}
                    type="text"
                    className="w-full p-3 pl-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                    placeholder="Ej: FAC-001"
                  />
                  {errors.numeroFactura && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.numeroFactura.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Estado
                  </label>
                  <Select value={watchedValues.estado?.toString()} onValueChange={(value) => setValue('estado', parseInt(value))}>
                    <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400">
                      <SelectValue placeholder="Seleccionar estado" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Borrador</SelectItem>
                      <SelectItem value="1">Emitida</SelectItem>
                      <SelectItem value="2">Parcialmente Pagada</SelectItem>
                      <SelectItem value="3">Pagada</SelectItem>
                      <SelectItem value="4">Vencida</SelectItem>
                      <SelectItem value="5">Anulada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>

            {/* Envío y Cliente */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                Envío y Cliente
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Envío *
                  </label>
                  <Select 
                    value={watchedValues.idEnvio?.toString()} 
                    onValueChange={(value) => setValue('idEnvio', parseInt(value))}
                    disabled={dataLoading}
                  >
                    <SelectTrigger className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400">
                      <SelectValue placeholder="Seleccionar envío..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="0">Seleccionar envío...</SelectItem>
                      {envios.map((envio: any) => (
                        <SelectItem key={envio.idEnvio} value={envio.idEnvio.toString()}>
                          {envio.numeroSeguimiento} - {envio.cliente?.nombre}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {errors.idEnvio && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.idEnvio.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Cliente *
                  </label>
                  <ClienteSelector
                    value={watchedValues.idCliente}
                    onValueChange={(value) => setValue('idCliente', value)}
                    error={errors.idCliente?.message}
                    disabled={dataLoading}
                  />
                </div>
              </div>
            </div>

            {/* Fechas */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-amber-500 rounded-full"></div>
                Fechas
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Emisión *
                  </label>
                  <Controller
                    name="fechaEmision"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecciona una fecha"
                        className="w-full"
                      />
                    )}
                  />
                  {errors.fechaEmision && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.fechaEmision.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Fecha de Vencimiento
                  </label>
                  <Controller
                    name="fechaVencimiento"
                    control={control}
                    render={({ field }) => (
                      <DatePicker
                        date={field.value}
                        onDateChange={field.onChange}
                        placeholder="Selecciona una fecha"
                        className="w-full"
                      />
                    )}
                  />
                </div>
              </div>
            </div>

            {/* Información Financiera */}
            <div className="rounded-xl p-6 border border-gray-300 shadow-sm">
              <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 bg-emerald-500 rounded-full"></div>
                Información Financiera
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Subtotal *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">$</span>
                    <Input
                      {...register('subtotal', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.subtotal && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.subtotal.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    IVA *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">$</span>
                    <Input
                      {...register('iva', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-white shadow-sm transition-all duration-200 hover:border-gray-400"
                      placeholder="0.00"
                    />
                  </div>
                  {errors.iva && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.iva.message}
                    </p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Total *
                  </label>
                  <div className="relative">
                    <span className="absolute left-3 top-3 text-gray-500 text-sm">$</span>
                    <Input
                      {...register('total', { valueAsNumber: true })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-full p-3 pl-8 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 bg-gray-50 shadow-sm transition-all duration-200"
                      placeholder="0.00"
                      readOnly
                    />
                  </div>
                  {errors.total && (
                    <p className="text-red-500 text-sm mt-2 flex items-center gap-1">
                      <span className="w-1 h-1 bg-red-500 rounded-full"></span>
                      {errors.total.message}
                    </p>
                  )}
                  <p className="text-sm text-gray-500 mt-2">
                    Total calculado automáticamente (Subtotal + IVA)
                  </p>
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="p-6">
              <div className="flex flex-col sm:flex-row gap-4 justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleCancel}
                  disabled={isLoading}
                  className="px-8 py-3 text-gray-700 border-gray-300 hover:bg-gray-50 hover:border-gray-400 transition-all duration-200 shadow-sm"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={!isValid || isLoading}
                  className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium shadow-lg hover:shadow-xl transition-all duration-200 transform"
                >
                  {isLoading ? (
                    <div className="flex items-center gap-2">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                      <span className="font-medium">
                        {isEdit ? 'Actualizando...' : 'Creando...'}
                      </span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Save className="w-5 h-5" />
                      <span className="font-medium">
                        {isEdit ? "Actualizar Factura" : "Crear Factura"}
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
