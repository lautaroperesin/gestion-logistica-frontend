import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Label } from '../../../components/ui/label';
import { Alert, AlertDescription } from '../../../components/ui/alert';
import { CheckCircle, AlertCircle, Info } from 'lucide-react';
import { MetodoPagoSelector } from '../../metodos-pago/components/MetodoPagoSelector';
import { useCreateMovimiento } from '../hooks/useMovimientosCaja';
import type { FacturaDto } from '../../../api';

const pagoSchema = z.object({
  monto: z.number().min(0.01, 'El monto debe ser mayor a 0'),
  idMetodoPago: z.number().min(1, 'Debe seleccionar un método de pago'),
  observaciones: z.string().optional(),
});

type PagoFormData = z.infer<typeof pagoSchema>;

interface RegistrarPagoModalProps {
  factura: FacturaDto;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export const RegistrarPagoModal = ({ 
  factura, 
  isOpen, 
  onOpenChange, 
  onSuccess 
}: RegistrarPagoModalProps) => {
  const createMovimiento = useCreateMovimiento();
  
  // Obtener totales
  const totalFactura = factura.total || 0;
  const totalPagado = factura.totalPagado || 0;
  const saldoPendiente = factura.saldoPendiente || 0;
  const movimientosPrevios = factura.movimientosCaja || [];
  const estaCompletamentePagada = factura.estaPagada || false;

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors, isSubmitting }
  } = useForm<PagoFormData>({
    resolver: zodResolver(pagoSchema),
    defaultValues: {
      monto: saldoPendiente,
      observaciones: '',
    }
  });

  const montoActual = watch('monto');
  const metodoPagoSeleccionado = watch('idMetodoPago');

  const onSubmit = async (data: PagoFormData) => {
    try {
      await createMovimiento.mutateAsync({
        idFactura: factura.idFactura,
        fechaPago: new Date(),
        monto: data.monto,
        idMetodoPago: data.idMetodoPago,
        observaciones: data.observaciones || null,
      });
      
      reset();
      onSuccess();
      onOpenChange(false);
    } catch (error) {
      console.error('Error al registrar pago:', error);
    }
  };

  const handleMontoCompleto = () => {
    setValue('monto', saldoPendiente);
  };

  const handleMontoParcial = (porcentaje: number) => {
    const montoParcial = saldoPendiente * (porcentaje / 100);
    setValue('monto', Math.round(montoParcial * 100) / 100);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registra un pago para la factura N° {factura.numeroFactura}
            {estaCompletamentePagada && (              
              <span className="block text-green-600 font-medium mt-1">
                <CheckCircle className="inline-block h-4 w-4 mr-1" />
                Esta factura ya está completamente pagada
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información de la factura */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-3">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <span className="font-medium text-gray-600">Cliente:</span>
                <p className="text-gray-900">{factura.cliente?.nombre || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium text-gray-600">Fecha Emisión:</span>
                <p className="text-gray-900">
                  {factura.fechaEmision 
                    ? format(new Date(factura.fechaEmision), "dd/MM/yyyy", { locale: es })
                    : 'N/A'
                  }
                </p>
              </div>
            </div>
            
            {/* Información de montos */}
            <div className="border-t pt-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Total Factura:</span>
                <span className="text-lg font-bold text-blue-600">
                  ${totalFactura.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
              
              {totalPagado > 0 && (
                <div className="flex justify-between items-center">
                  <span className="font-medium text-gray-600">Total Pagado:</span>
                  <span className="text-lg font-bold text-green-600">
                    ${totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              )}
              
              <div className="flex justify-between items-center">
                <span className="font-medium text-gray-600">Saldo Pendiente:</span>
                <span className={`text-lg font-bold ${saldoPendiente <= 0 ? 'text-green-600' : 'text-orange-600'}`}>
                  ${saldoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {estaCompletamentePagada && (
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <AlertDescription className="text-green-800">
                  Esta factura está completamente pagada. No es necesario registrar más pagos.
                </AlertDescription>
              </Alert>
            )}
          </div>

          {/* Historial de pagos previos */}
          {movimientosPrevios.length > 0 && (
            <div className="bg-blue-50 p-4 rounded-lg space-y-3">
              <h4 className="font-medium text-blue-900">Pagos Anteriores ({movimientosPrevios.length})</h4>
              <div className="space-y-2 max-h-32 overflow-y-auto">
                {movimientosPrevios.map((movimiento, index) => (
                  <div key={movimiento.idMovimiento || index} className="flex justify-between items-center text-sm bg-white p-2 rounded">
                    <div>
                      <span className="font-medium">
                        ${movimiento.monto?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </span>
                      {movimiento.fechaPago && (
                        <span className="text-gray-500 ml-2">
                          {format(new Date(movimiento.fechaPago), "dd/MM/yyyy", { locale: es })}
                        </span>
                      )}
                    </div>
                    <span className="text-gray-600 text-xs">
                      {movimiento.metodoPago?.nombre || 'N/A'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Monto del pago */}
          <div className="space-y-3">
            <Label htmlFor="monto">Monto del Pago</Label>
            
            {/* Botones de ayuda para montos comunes */}
            <div className="flex gap-2 text-xs">
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleMontoCompleto}
                className="text-xs"
              >
                Pago Total
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleMontoParcial(50)}
                className="text-xs"
              >
                50%
              </Button>
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={() => handleMontoParcial(25)}
                className="text-xs"
              >
                25%
              </Button>
            </div>
            
            <div className="space-y-2">
              <input
                {...register('monto', { valueAsNumber: true })}
                type="number"
                step="0.01"
                min="0"
                max={saldoPendiente}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                placeholder="0.00"
              />
              {errors.monto && (
                <p className="text-sm text-red-500">{errors.monto.message}</p>
              )}
              
              {/* Información del monto ingresado */}
              {montoActual > 0 && (
                <div className="text-sm space-y-1">
                  {montoActual > saldoPendiente ? (
                    <p className="text-amber-600 flex items-center gap-1">
                      <AlertCircle className="h-4 w-4" />
                      El monto supera el saldo pendiente (${saldoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })})
                    </p>
                  ) : montoActual === saldoPendiente ? (
                    <p className="text-green-600 flex items-center gap-1">
                      <CheckCircle className="h-4 w-4" />
                      Pago completo - La factura quedará totalmente pagada
                    </p>
                  ) : (
                    <p className="text-blue-600 flex items-center gap-1">
                      <Info className="h-4 w-4" />
                      Pago parcial - Quedará un saldo de ${(saldoPendiente - montoActual).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="metodoPago">Método de Pago</Label>
            <MetodoPagoSelector
              value={metodoPagoSeleccionado}
              onValueChange={(value) => setValue('idMetodoPago', value, { shouldValidate: true })}
              error={errors.idMetodoPago?.message}
            />
          </div>

          {/* Observaciones */}
          <div className="space-y-2">
            <Label htmlFor="observaciones">Observaciones (Opcional)</Label>
            <textarea
              {...register('observaciones')}
              className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              placeholder="Detalles adicionales sobre el pago..."
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isSubmitting}
            >
              Cancelar
            </Button>
            <Button 
              type="submit" 
              disabled={isSubmitting || !metodoPagoSeleccionado || estaCompletamentePagada}
            >
              {isSubmitting ? 'Registrando...' : estaCompletamentePagada ? 'Factura ya pagada' : 'Registrar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
