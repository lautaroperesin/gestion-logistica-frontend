import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { 
  Package, 
  User, 
  MapPin, 
  Truck,
  Phone,
  Mail,
  Calendar, 
  DollarSign, 
  Weight, 
  Box,
  FileText,
  Route
} from 'lucide-react';
import type { EnvioDto } from '@/api';

interface EnvioDetailsModalProps {
  envio: EnvioDto | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export const EnvioDetailsModal: React.FC<EnvioDetailsModalProps> = ({
  envio,
  open,
  onOpenChange,
}) => {
  if (!envio) return null;

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
    if (!amount) return 'No especificado';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getEstadoBadgeVariant = (estado?: string | null) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'en transito':
      case 'en tránsito':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'entregado':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'cancelado':
        return 'bg-red-100 text-red-800 border-red-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-xl">
            <Package className="h-6 w-6 text-blue-600" />
            Detalles del Envío {envio.numeroSeguimiento}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 mt-2">
          {/* Estado y Seguimiento */}
          <Card>
            <CardContent className="pt-4">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                    <Route className="h-5 w-5 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-lg">Estado del Envío</h3>
                    <p className="text-sm text-gray-600">Número de seguimiento: {envio.numeroSeguimiento}</p>
                  </div>
                </div>
                <Badge className={`px-3 py-1 ${getEstadoBadgeVariant(envio.estado?.nombre)}`}>
                  {envio.estado?.nombre || 'Sin estado'}
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
                  <p className="font-medium">{envio.cliente?.nombre || 'No especificado'}</p>
                  {envio.cliente?.email && (
                    <div className="flex items-center gap-2">
                      <Mail className="h-3 w-3 text-gray-600" />
                    <p className="text-sm text-gray-600">{envio.cliente.email}</p>
                    </div>
                  )}
                  {envio.cliente?.telefono && (
                      <div className="flex items-center gap-2">
                      <Phone className="h-3 w-3 text-gray-600" />
                    <p className="text-sm text-gray-600">{envio.cliente.telefono}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Conductor y Vehículo */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center">
                    <Truck className="h-5 w-5 text-orange-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Conductor & Vehículo</h3>
                </div>
                <div className="space-y-2 mb-2">
                  <div>
                    <p className="font-medium text-sm text-gray-600">Conductor</p>
                    <p className="font-medium">{envio.conductor?.nombre || 'No asignado'}</p>
                    {envio.conductor?.claseLicencia && (
                      <p className="text-sm text-gray-600">Licencia: {envio.conductor.claseLicencia}</p>
                    )}
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div>
                    <p className="font-medium text-sm text-gray-600">Vehículo</p>
                    <p className="font-medium">
                      {envio.vehiculo?.marca} {envio.vehiculo?.modelo || 'No especificado'}
                    </p>
                    {envio.vehiculo?.patente && (
                      <p className="text-sm text-gray-600">Patente: {envio.vehiculo.patente}</p>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Ubicaciones */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3 mb-4">
                <div className="h-10 w-10 bg-purple-100 rounded-full flex items-center justify-center">
                  <MapPin className="h-5 w-5 text-purple-600" />
                </div>
                <h3 className="font-semibold text-lg">Ruta de Envío</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                    <div className="flex items-center gap-2">
                        <MapPin className="h-5 w-5 text-green-600" /> 
                        <p className="font-medium text-sm text-gray-600">Origen</p>
                    </div>
                  <div className="p-3 rounded-lg border border-green-200">
                    <p className="font-medium">{envio.origen?.localidad?.nombre || 'No especificado'}</p>
                    <p className="text-sm text-gray-600">
                      {envio.origen?.localidad?.provincia?.nombre || ''}, {envio.origen?.localidad?.provincia?.pais?.nombre || ''}
                    </p>
                    {envio.origen?.direccion && (
                      <p className="text-sm text-gray-600 mt-1">{envio.origen.direccion}</p>
                    )}
                  </div>
                </div>
                <div className="space-y-2">
                <div className="flex items-center gap-2">
                    <MapPin className="h-5 w-5 text-red-600" /> 
                    <p className="font-medium text-sm text-gray-600">Destino</p>
                </div>
                  <div className="p-3 rounded-lg border border-red-200">
                    <p className="font-medium">{envio.destino?.localidad?.nombre || 'No especificado'}</p>
                    <p className="text-sm text-gray-600">
                      {envio.destino?.localidad?.provincia?.nombre || ''}, {envio.destino?.localidad?.provincia?.pais?.nombre || ''}
                    </p>
                    {envio.destino?.direccion && (
                      <p className="text-sm text-gray-600 mt-1">{envio.destino.direccion}</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Fechas */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-indigo-100 rounded-full flex items-center justify-center">
                    <Calendar className="h-5 w-5 text-indigo-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Cronograma</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm text-gray-600">Fecha de Creación</p>
                    <p className="text-sm">{formatDate(envio.fechaCreacionEnvio)}</p>
                  </div>
                  <div>
                    <p className="font-medium text-sm text-gray-600">Salida Programada</p>
                    <p className="text-sm">{formatDate(envio.fechaSalidaProgramada)}</p>
                  </div>
                  {envio.fechaSalidaReal && (
                    <div>
                      <p className="font-medium text-sm text-gray-600">Salida Real</p>
                      <p className="text-sm text-green-600">{formatDate(envio.fechaSalidaReal)}</p>
                    </div>
                  )}
                  <div>
                    <p className="font-medium text-sm text-gray-600">Entrega Estimada</p>
                    <p className="text-sm">{formatDate(envio.fechaEntregaEstimada)}</p>
                  </div>
                  {envio.fechaEntregaReal && (
                    <div>
                      <p className="font-medium text-sm text-gray-600">Entrega Real</p>
                      <p className="text-sm text-green-600">{formatDate(envio.fechaEntregaReal)}</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Detalles de Carga y Costos */}
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-emerald-100 rounded-full flex items-center justify-center">
                    <DollarSign className="h-5 w-5 text-emerald-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Detalles & Costos</h3>
                </div>
                <div className="space-y-3">
                  <div>
                    <p className="font-medium text-sm text-gray-600 flex items-center gap-1">
                    <Box className="h-3 w-3" />
                    Tipo de Carga
                    </p>
                    <p className="text-sm">{envio.tipoCarga?.nombre || 'No especificado'}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="font-medium text-sm text-gray-600 flex items-center gap-1">
                        <Weight className="h-3 w-3" />
                        Peso
                      </p>
                      <p className="text-sm">{envio.pesoKg ? `${envio.pesoKg} kg` : 'No especificado'}</p>
                    </div>
                    <div>
                      <p className="font-medium text-sm text-gray-600 flex items-center gap-1">
                        <Box className="h-3 w-3" />
                        Volumen
                      </p>
                      <p className="text-sm">{envio.volumenM3 ? `${envio.volumenM3} m³` : 'No especificado'}</p>
                    </div>
                  </div>
                  <div className="border-t border-gray-200 my-2"></div>
                  <div>
                    <p className="font-medium text-sm text-gray-600">Costo Total</p>
                    <p className="text-lg font-bold text-green-600">{formatCurrency(envio.costoTotal)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Descripción */}
          {envio.descripcion && (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 bg-gray-100 rounded-full flex items-center justify-center">
                    <FileText className="h-5 w-5 text-gray-600" />
                  </div>
                  <h3 className="font-semibold text-lg">Descripción</h3>
                </div>
                <div className="p-4 bg-gray-50 rounded-lg">
                  <p className="text-sm text-gray-700 whitespace-pre-wrap">{envio.descripcion}</p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};
