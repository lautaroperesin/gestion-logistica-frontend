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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../../../components/ui/select';
import { useCreateMovimiento, useMetodosPago } from '../hooks/useMovimientosCaja';
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
  const { data: metodosPago = [], isLoading: loadingMetodos } = useMetodosPago();
  const createMovimiento = useCreateMovimiento();

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
      monto: factura.total || 0,
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
    setValue('monto', factura.total || 0);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Registrar Pago</DialogTitle>
          <DialogDescription>
            Registra un pago para la factura N° {factura.numeroFactura}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {/* Información de la factura */}
          <div className="bg-gray-50 p-4 rounded-lg space-y-2">
            <div className="grid grid-cols-2 gap-2 text-sm">
              <div>
                <span className="font-medium">Cliente:</span>
                <p>{factura.cliente?.nombre || 'N/A'}</p>
              </div>
              <div>
                <span className="font-medium">Total Factura:</span>
                <p className="text-lg font-bold text-green-600">
                  ${factura.total?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
            </div>
            <div>
              <span className="font-medium text-sm">Fecha:</span>
              <p className="text-sm">
                {factura.fechaEmision 
                  ? format(new Date(factura.fechaEmision), "dd 'de' MMMM 'de' yyyy", { locale: es })
                  : 'N/A'
                }
              </p>
            </div>
          </div>

          {/* Monto del pago */}
          <div className="space-y-2">
            <Label htmlFor="monto">Monto del Pago</Label>
            <div className="flex gap-2">
              <div className="flex-1">
                <input
                  {...register('monto', { valueAsNumber: true })}
                  type="number"
                  step="0.01"
                  min="0"
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                />
                {errors.monto && (
                  <p className="text-sm text-red-500 mt-1">{errors.monto.message}</p>
                )}
              </div>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleMontoCompleto}
                className="shrink-0"
              >
                Total
              </Button>
            </div>
            {montoActual !== factura.total && (
              <p className="text-sm text-amber-600">
                ⚠️ El monto difiere del total de la factura
              </p>
            )}
          </div>

          {/* Método de pago */}
          <div className="space-y-2">
            <Label htmlFor="metodoPago">Método de Pago</Label>
            <Select 
              onValueChange={(value) => setValue('idMetodoPago', parseInt(value))}
              disabled={loadingMetodos}
            >
              <SelectTrigger>
                <SelectValue placeholder="Seleccionar método de pago" />
              </SelectTrigger>
              <SelectContent>
                {metodosPago.map((metodo) => (
                  <SelectItem key={metodo.id} value={metodo.id?.toString() || ''}>
                    {metodo.nombre}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.idMetodoPago && (
              <p className="text-sm text-red-500">{errors.idMetodoPago.message}</p>
            )}
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
              disabled={isSubmitting || !metodoPagoSeleccionado}
            >
              {isSubmitting ? 'Registrando...' : 'Registrar Pago'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
