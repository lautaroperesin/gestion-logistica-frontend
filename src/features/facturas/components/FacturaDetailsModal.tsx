import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  FileText, 
  User, 
  Package,
  Phone,
  Mail,
  Calendar, 
  DollarSign, 
  MapPin,
  Truck
} from 'lucide-react';
import type { FacturaDto } from '@/api';

interface FacturaDetailsModalProps {
  factura: FacturaDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const FacturaDetailsModal: React.FC<FacturaDetailsModalProps> = ({
  factura,
  open,
  onOpenChange,
}) => {
  if (!factura) return null;

  const formatDate = (dateValue?: Date | string | null) => {
    if (!dateValue) return 'No especificada';
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString('es-ES', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch {
      return 'Fecha inválida';
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount && amount !== 0) return 'No especificado';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  // Función para obtener el nombre del estado
  const getEstadoNombre = (estado: number | undefined): string => {
    if (estado === undefined) return 'Desconocido';
    const estados = {
        0: 'Borrador',
        1: 'Emitida',
        2: 'Parcialmente Pagada',
        3: 'Pagada',
        4: 'Vencida',
        5: 'Anulada'
    };
    return estados[estado as keyof typeof estados] || 'Desconocido';
  };

// Función para obtener el color del badge según el estado
 const getEstadoColor = (estado: number | undefined): string => {
    if (estado === undefined) return 'bg-gray-100 text-gray-800';
    const colores = {
        0: 'bg-gray-100 text-gray-800',
        1: 'bg-yellow-100 text-yellow-800',
        2: 'bg-blue-100 text-blue-800',
        3: 'bg-green-100 text-green-800',
        4: 'bg-red-100 text-red-800',
        5: 'bg-gray-100 text-gray-600'
    };
    return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800';
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <FileText className="h-6 w-6 text-blue-600" />
            Detalles de la Factura N° {factura.numeroFactura}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Estado y Número */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Estado de la Factura</h3>
                    <p className="text-sm text-gray-600">Número de factura: {factura.numeroFactura}</p>
                  </div>
                </div>
                <Badge className={`px-3 py-1 ${getEstadoColor(factura.estado)}`}>
                  {getEstadoNombre(factura.estado)}
                </Badge>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Cliente */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-green-100 rounded-full flex items-center justify-center">
                    <User className="h-5 w-5 text-green-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Cliente</h3>
                </div>
                <div className="space-y-2">
                  <p className="font-medium">{factura.cliente?.nombre || 'No especificado'}</p>
                  {factura.cliente?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-600" />
                      <p className="text-sm text-gray-600">{factura.cliente.email}</p>
                    </div>
                  )}
                  {factura.cliente?.telefono && (
                    <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-600" />
                      <p className="text-sm text-gray-600">{factura.cliente.telefono}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Envío Asociado */}
            {factura.envio && (
              <Card>
                <CardContent className="pt-6">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                      <Package className="h-5 w-5 text-orange-600" />
                    </div>
                    <h3 className="font-semibold text-lg">Envío Asociado</h3>
                  </div>
                  <div className="space-y-2">
                    <div>
                      <p className="font-medium text-sm text-gray-600">Número de Seguimiento</p>
                      <p className="font-medium">{factura.envio.numeroSeguimiento || 'No especificado'}</p>
                    </div>
                    {factura.envio.conductor && (
                      <div>
                        <p className="font-medium text-sm text-gray-600 flex items-center gap-1">
                          <Truck className="h-3 w-3" />
                          Conductor
                        </p>
                        <p className="text-sm">{factura.envio.conductor.nombre}</p>
                      </div>
                    )}
                    {(factura.envio.origen || factura.envio.destino) && (
                      <div>
                        <p className="font-medium text-sm text-gray-600 flex items-center gap-1">
                          <MapPin className="h-3 w-3" />
                          Ruta
                        </p>
                        <p className="text-sm">
                          {factura.envio.origen?.localidad?.nombre || 'N/A'} → {factura.envio.destino?.localidad?.nombre || 'N/A'}
                        </p>
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Fechas */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                  <Calendar className="h-5 w-5 text-indigo-600" />
                </div>
                <h3 className="font-semibold text-lg">Fechas</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <p className="font-medium text-sm text-gray-600">Fecha de Emisión</p>
                  <p className="text-sm">{formatDate(factura.fechaEmision)}</p>
                </div>
                <div>
                  <p className="font-medium text-sm text-gray-600">Fecha de Vencimiento</p>
                  {factura.fechaVencimiento ? (
                    <p className="text-sm">{formatDate(factura.fechaVencimiento)}</p>
                  ) : (
                    <p className="text-sm text-gray-400 italic">No especificada</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Montos */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                  <DollarSign className="h-5 w-5 text-emerald-600" />
                </div>
                <h3 className="font-semibold text-lg">Desglose de Montos</h3>
              </div>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm text-gray-600">Subtotal</p>
                    <p className="text-lg font-bold">{formatCurrency(factura.subtotal)}</p>
                  </div>
                  <div className="p-4 bg-gray-50 rounded-lg">
                    <p className="font-medium text-sm text-gray-600">IVA</p>
                    <p className="text-lg font-bold">{formatCurrency(factura.iva)}</p>
                  </div>
                </div>
                <div className="p-4 bg-green-50 rounded-lg border border-green-200">
                  <p className="font-medium text-sm text-gray-600">Total</p>
                  <p className="text-2xl font-bold text-green-600">{formatCurrency(factura.total)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </DialogContent>
    </Dialog>
  );
};
