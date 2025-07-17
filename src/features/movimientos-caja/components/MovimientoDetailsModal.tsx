import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '../../../components/ui/dialog';
import { Button } from '../../../components/ui/button';
import { Card } from '../../../components/ui/card';
import type { MovimientoCajaDto } from '../../../api';

interface MovimientoDetailsModalProps {
  movimiento: MovimientoCajaDto;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export const MovimientoDetailsModal = ({
  movimiento,
  isOpen,
  onOpenChange
}: MovimientoDetailsModalProps) => {
  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>Detalles del Movimiento de Caja</DialogTitle>
          <DialogDescription>
            Información completa del movimiento N° {movimiento.idMovimiento}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Información del Movimiento */}
          <Card className="p-4">
            <h3 className="font-semibold mb-3">Información del Pago</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <span className="text-sm font-medium text-gray-600">ID Movimiento:</span>
                <p className="text-sm">{movimiento.idMovimiento}</p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Fecha de Pago:</span>
                <p className="text-sm">
                  {movimiento.fechaPago ? 
                    format(new Date(movimiento.fechaPago), "dd 'de' MMMM 'de' yyyy 'a las' HH:mm", { locale: es }) :
                    'N/A'
                  }
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Monto:</span>
                <p className="text-lg font-bold text-green-600">
                  ${movimiento.monto?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium text-gray-600">Método de Pago:</span>
                <p className="text-sm">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {movimiento.metodoPago?.nombre || 'N/A'}
                  </span>
                </p>
              </div>
            </div>
            
            {movimiento.observaciones && (
              <div className="mt-4">
                <span className="text-sm font-medium text-gray-600">Observaciones:</span>
                <p className="text-sm bg-gray-50 p-3 rounded-lg mt-1">
                  {movimiento.observaciones}
                </p>
              </div>
            )}
          </Card>

          {/* Información de la Factura */}
          {movimiento.factura && (
            <Card className="p-4">
              <h3 className="font-semibold mb-3">Información de la Factura</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Número de Factura:</span>
                  <p className="text-sm font-medium">N° {movimiento.factura.numeroFactura}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Fecha de Emisión:</span>
                  <p className="text-sm">
                    {movimiento.factura.fechaEmision ? 
                      format(new Date(movimiento.factura.fechaEmision), "dd/MM/yyyy", { locale: es }) :
                      'N/A'
                    }
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Total de Factura:</span>
                  <p className="text-sm font-bold">
                    ${movimiento.factura.total?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}
                  </p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Estado:</span>
                  <p className="text-sm">
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                      movimiento.factura.estado === 2 ? 'bg-blue-100 text-blue-800' :
                      movimiento.factura.estado === 3 ? 'bg-green-100 text-green-800' :
                      movimiento.factura.estado === 4 ? 'bg-red-100 text-red-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {movimiento.factura.estado === 2 ? 'Parcialmente Pagada' :
                       movimiento.factura.estado === 3 ? 'Pagada' :
                       movimiento.factura.estado === 4 ? 'Vencida' :
                       'Desconocido'}
                    </span>
                  </p>
                </div>
              </div>
            </Card>
          )}

          {/* Información del Cliente */}
          {movimiento.factura?.cliente && (
            <Card className="p-4">
              <h3 className="font-semibold">Información del Cliente</h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-medium text-gray-600">Nombre:</span>
                  <p className="text-sm">{movimiento.factura.cliente.nombre}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Email:</span>
                  <p className="text-sm">{movimiento.factura.cliente.email || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-medium text-gray-600">Teléfono:</span>
                  <p className="text-sm">{movimiento.factura.cliente.telefono || 'N/A'}</p>
                </div>
              </div>
            </Card>
          )}
        </div>

        <div className="flex justify-end pt-4">
          <Button onClick={() => onOpenChange(false)}>
            Cerrar
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};
