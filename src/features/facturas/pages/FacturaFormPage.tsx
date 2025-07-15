import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { ArrowLeft, Save } from 'lucide-react';
import { useCreateFactura, useUpdateFactura, useFactura } from '../hooks/useFacturas';
import { useClientes } from '@/features/clientes/hooks/useClientes';
import { useEnvios } from '@/features/envios/hooks/useEnvios';
import type { CreateFacturaDto, UpdateFacturaDto } from '@/api';

// Schema de validación
const facturaSchema = z.object({
  idEnvio: z.number().min(1, 'Debes seleccionar un envío'),
  idCliente: z.number().min(1, 'Debes seleccionar un cliente'),
  numeroFactura: z.string().min(1, 'El número de factura es requerido'),
  fechaEmision: z.string().min(1, 'La fecha de emisión es requerida'),
  fechaVencimiento: z.string().optional(),
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
  const { data: factura, loading: facturaLoading } = useFactura(facturaId || 0);
  const { createFactura, loading: creating } = useCreateFactura();
  const { updateFactura, loading: updating } = useUpdateFactura();
  const { clientes, loading: clientesLoading } = useClientes();
  const { envios, loading: enviosLoading } = useEnvios();

  // Configuración del formulario
  const form = useForm<FacturaFormData>({
    resolver: zodResolver(facturaSchema),
    defaultValues: {
      idEnvio: 0,
      idCliente: 0,
      numeroFactura: '',
      fechaEmision: new Date().toISOString().split('T')[0],
      fechaVencimiento: '',
      estado: 0, // Borrador por defecto
      subtotal: 0,
      iva: 0,
      total: 0,
    },
  });

  const { register, handleSubmit, watch, setValue, formState: { errors, isValid } } = form;
  const watchedValues = watch();

  // Cargar datos del envío seleccionado
  useEffect(() => {
    if (watchedValues.idEnvio > 0) {
      const envioSeleccionado = envios.find(e => e.idEnvio === watchedValues.idEnvio);
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
      setValue('fechaEmision', factura.fechaEmision ? new Date(factura.fechaEmision).toISOString().split('T')[0] : '');
      setValue('fechaVencimiento', factura.fechaVencimiento ? new Date(factura.fechaVencimiento).toISOString().split('T')[0] : '');
      setValue('estado', factura.estado || 0);
      setValue('subtotal', factura.subtotal || 0);
      setValue('iva', factura.iva || 0);
      setValue('total', factura.total || 0);
    }
  }, [isEdit, factura, facturaLoading, setValue]);

  const onSubmit = async (data: FacturaFormData) => {
    try {
      const facturaData = {
        ...data,
        fechaEmision: new Date(data.fechaEmision),
        fechaVencimiento: data.fechaVencimiento ? new Date(data.fechaVencimiento) : undefined,
        estado: data.estado as any, // Convertir a EstadoFactura
      };

      if (isEdit && facturaId) {
        const updateData: UpdateFacturaDto = facturaData;
        const result = await updateFactura(facturaId, updateData);
        if (result.success) {
          navigate('/facturas');
        }
      } else {
        const createData: CreateFacturaDto = facturaData as CreateFacturaDto;
        const result = await createFactura(createData);
        if (result.success) {
          navigate('/facturas');
        }
      }
    } catch (error) {
      console.error('Error al procesar factura:', error);
    }
  };

  const handleCancel = () => {
    navigate('/facturas');
  };

  const isLoading = creating || updating;
  const dataLoading = clientesLoading || enviosLoading;

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={handleCancel}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Volver
          </Button>
          <div>
            <h1 className="text-3xl font-bold">
              {isEdit ? 'Editar Factura' : 'Nueva Factura'}
            </h1>
            <p className="text-gray-600">
              {isEdit ? 'Modifica los datos de la factura' : 'Crea una nueva factura en el sistema'}
            </p>
          </div>
        </div>

        {/* Formulario */}
        <Card className="p-6">
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
            {/* Información básica */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="numeroFactura">Número de Factura *</Label>
                <input
                  id="numeroFactura"
                  type="text"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Ej: FAC-001"
                  {...register('numeroFactura')}
                />
                {errors.numeroFactura && (
                  <span className="text-red-500 text-sm">{errors.numeroFactura.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="estado">Estado</Label>
                <select
                  id="estado"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register('estado', { valueAsNumber: true })}
                >
                  <option value={0}>Borrador</option>
                  <option value={1}>Emitida</option>
                  <option value={2}>Pagada</option>
                  <option value={3}>Vencida</option>
                  <option value={4}>Cancelada</option>
                  <option value={5}>Anulada</option>
                </select>
              </div>
            </div>

            {/* Envío y Cliente */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="idEnvio">Envío *</Label>
                <select
                  id="idEnvio"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={dataLoading}
                  {...register('idEnvio', { valueAsNumber: true })}
                >
                  <option value={0}>Seleccionar envío...</option>
                  {envios.map((envio) => (
                    <option key={envio.idEnvio} value={envio.idEnvio}>
                      {envio.numeroSeguimiento} - {envio.cliente?.nombre}
                    </option>
                  ))}
                </select>
                {errors.idEnvio && (
                  <span className="text-red-500 text-sm">{errors.idEnvio.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="idCliente">Cliente *</Label>
                <select
                  id="idCliente"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={dataLoading}
                  {...register('idCliente', { valueAsNumber: true })}
                >
                  <option value={0}>Seleccionar cliente...</option>
                  {clientes.map((cliente) => (
                    <option key={cliente.idCliente} value={cliente.idCliente}>
                      {cliente.nombre}
                    </option>
                  ))}
                </select>
                {errors.idCliente && (
                  <span className="text-red-500 text-sm">{errors.idCliente.message}</span>
                )}
              </div>
            </div>

            {/* Fechas */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <Label htmlFor="fechaEmision">Fecha de Emisión *</Label>
                <input
                  id="fechaEmision"
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register('fechaEmision')}
                />
                {errors.fechaEmision && (
                  <span className="text-red-500 text-sm">{errors.fechaEmision.message}</span>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="fechaVencimiento">Fecha de Vencimiento</Label>
                <input
                  id="fechaVencimiento"
                  type="date"
                  className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  {...register('fechaVencimiento')}
                />
              </div>
            </div>

            {/* Montos */}
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-semibold">Información Financiera</h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="subtotal">Subtotal *</Label>
                  <input
                    id="subtotal"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    {...register('subtotal', { valueAsNumber: true })}
                  />
                  {errors.subtotal && (
                    <span className="text-red-500 text-sm">{errors.subtotal.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="iva">IVA *</Label>
                  <input
                    id="iva"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    placeholder="0.00"
                    {...register('iva', { valueAsNumber: true })}
                  />
                  {errors.iva && (
                    <span className="text-red-500 text-sm">{errors.iva.message}</span>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="total">Total *</Label>
                  <input
                    id="total"
                    type="number"
                    step="0.01"
                    min="0"
                    className="w-full p-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-gray-50"
                    placeholder="0.00"
                    {...register('total', { valueAsNumber: true })}
                  />
                  {errors.total && (
                    <span className="text-red-500 text-sm">{errors.total.message}</span>
                  )}
                </div>
              </div>
            </div>

            {/* Botones */}
            <div className="flex gap-4 pt-6">
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={!isValid}
                className="bg-blue-600 hover:bg-blue-700"
              >
                {isLoading ? (
                  <div className="flex items-center">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                    {isEdit ? 'Actualizando...' : 'Creando...'}
                  </div>
                ) : (
                  <>
                    <Save className="h-4 w-4 mr-2" />
                    {isEdit ? 'Actualizar Factura' : 'Crear Factura'}
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
};
