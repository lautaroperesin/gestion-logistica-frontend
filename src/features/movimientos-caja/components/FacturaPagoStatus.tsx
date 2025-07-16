import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { CreditCard, CheckCircle, Clock } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { useMovimientosByFactura } from '../hooks/useMovimientosCaja';
import type { FacturaDto } from '@/api';

interface FacturaPagoStatusProps {
  factura: FacturaDto;
  showDetails?: boolean;
}

export const FacturaPagoStatus = ({ factura, showDetails = false }: FacturaPagoStatusProps) => {
  const { data: movimientos = [] } = useMovimientosByFactura(factura.idFactura || 0);
  
  const totalFactura = factura.total || 0;
  const totalPagado = movimientos.reduce((sum, mov) => sum + (mov.monto || 0), 0);
  const saldoPendiente = totalFactura - totalPagado;
  const estaCompletamentePagada = saldoPendiente <= 0;
  
  const getStatusBadge = () => {
    if (estaCompletamentePagada) {
      return (
        <Badge variant="outline" className="border-green-500 text-green-700 bg-green-50">
          <CheckCircle className="h-3 w-3 mr-1" />
          Pagada
        </Badge>
      );
    } else if (totalPagado > 0) {
      return (
        <Badge variant="outline" className="border-yellow-500 text-yellow-700 bg-yellow-50">
          <Clock className="h-3 w-3 mr-1" />
          Parcial
        </Badge>
      );
    } else {
      return (
        <Badge variant="outline" className="border-red-500 text-red-700 bg-red-50">
          <Clock className="h-3 w-3 mr-1" />
          Pendiente
        </Badge>
      );
    }
  };

  if (!showDetails) {
    return getStatusBadge();
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-sm font-medium">Estado de Pago:</span>
        {getStatusBadge()}
      </div>
      
      <div className="text-sm space-y-1">
        <div className="flex justify-between">
          <span>Total:</span>
          <span className="font-medium">${totalFactura.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
        </div>
        
        {totalPagado > 0 && (
          <div className="flex justify-between text-green-600">
            <span>Pagado:</span>
            <span className="font-medium">${totalPagado.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
        
        {saldoPendiente > 0 && (
          <div className="flex justify-between text-orange-600">
            <span>Pendiente:</span>
            <span className="font-medium">${saldoPendiente.toLocaleString('es-AR', { minimumFractionDigits: 2 })}</span>
          </div>
        )}
      </div>

      {movimientos.length > 0 && (
        <div className="mt-3 pt-3 border-t">
          <h5 className="text-sm font-medium mb-2 flex items-center gap-1">
            <CreditCard className="h-4 w-4" />
            Pagos Registrados ({movimientos.length})
          </h5>
          <div className="space-y-1 max-h-24 overflow-y-auto">
            {movimientos.map((movimiento, index) => (
              <div key={movimiento.idMovimiento || index} className="flex justify-between text-xs bg-gray-50 p-2 rounded">
                <div>
                  <span className="font-medium">
                    ${movimiento.monto?.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                  </span>
                  {movimiento.fechaPago && (
                    <span className="text-gray-500 ml-2">
                      {format(new Date(movimiento.fechaPago), "dd/MM/yy", { locale: es })}
                    </span>
                  )}
                </div>
                <span className="text-gray-600">
                  ID: {movimiento.metodoPago?.id || 'N/A'}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
