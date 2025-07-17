import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Edit, Eye, Package, User, MapPin, RotateCcw, Calendar } from 'lucide-react';
import type { EnvioDto } from '@/api';

interface EnviosTableProps {
  envios: EnvioDto[];
  loading: boolean;
  onEdit: (envio: EnvioDto) => void;
  onDelete: (id: number) => void;
  onView: (envio: EnvioDto) => void;
  onChangeStatus?: (envio: EnvioDto) => void;
  onUpdateDates?: (envio: EnvioDto) => void;
}

export const EnviosTable: React.FC<EnviosTableProps> = ({
  envios,
  loading,
  onEdit,
  onDelete,
  onView,
  onChangeStatus,
  onUpdateDates,
}) => {
  const formatDate = (dateValue?: Date | string | null) => {
    if (!dateValue) return '-';
    try {
      const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
      return date.toLocaleDateString('es-ES');
    } catch {
      return '-';
    }
  };

  const formatCurrency = (amount?: number | null) => {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-AR', {
      style: 'currency',
      currency: 'ARS'
    }).format(amount);
  };

  const getEstadoBadgeColor = (estado?: string | null) => {
    switch (estado?.toLowerCase()) {
      case 'pendiente':
        return 'bg-yellow-100 text-yellow-800';
      case 'en transito':
      case 'en tránsito':
        return 'bg-blue-100 text-blue-800';
      case 'entregado':
        return 'bg-green-100 text-green-800';
      case 'cancelado':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <Card className="bg-black/10 backdrop-blur-md border-black/20">
        <CardHeader>
          <CardTitle className="text-black">Envíos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[...Array(5)].map((_, index) => (
              <Skeleton key={index} className="h-20 w-full bg-black/10" />
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (envios.length === 0) {
    return (
      <Card className="bg-black/10 backdrop-blur-md border-black/20">
        <CardHeader>
          <CardTitle className="text-black">Envíos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Package className="mx-auto h-12 w-12 text-black/50 mb-4" />
            <p className="text-black/70">No hay envíos registrados</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Envíos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-black/20">
                <th className="text-left py-3 px-4 text-black font-medium">Nro. Seguimiento</th>
                <th className="text-left py-3 px-4 text-black font-medium">Cliente</th>
                <th className="text-left py-3 px-4 text-black font-medium">Origen</th>
                <th className="text-left py-3 px-4 text-black font-medium">Destino</th>
                <th className="text-left py-3 px-4 text-black font-medium">Estado</th>
                <th className="text-left py-3 px-4 text-black font-medium">Conductor</th>
                <th className="text-left py-3 px-4 text-black font-medium">Vehículo</th>
                <th className="text-left py-3 px-4 text-black font-medium">Salida</th>
                <th className="text-left py-3 px-4 text-black font-medium">Costo</th>
                <th className="text-left py-3 px-4 text-black font-medium">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {envios.map((envio) => (
                <tr
                  key={envio.idEnvio}
                  className="border-b border-black/10 hover:bg-black/5 transition-colors"
                >
                  <td className="py-3 px-4 text-black font-mono text-sm">
                    {envio.numeroSeguimiento}
                  </td>
                  <td className="py-3 px-4 text-black">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-black/60" />
                      <span>{envio.cliente?.nombre || '-'}</span>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-black/60" />
                      <div className="text-sm">
                        <div>{envio.origen?.localidad?.nombre || '-'}</div>
                        <div className="text-black/60 text-xs">
                          {envio.origen?.localidad?.provincia?.nombre || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">
                    <div className="flex items-center gap-2">
                      <MapPin className="h-4 w-4 text-black/60" />
                      <div className="text-sm">
                        <div>{envio.destino?.localidad?.nombre || '-'}</div>
                        <div className="text-black/60 text-xs">
                          {envio.destino?.localidad?.provincia?.nombre || '-'}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <button
                      onClick={() => onChangeStatus?.(envio)}
                      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium transition-colors hover:opacity-80 cursor-pointer ${getEstadoBadgeColor(
                        envio.estado?.nombre
                      )}`}
                      title="Hacer clic para cambiar estado"
                    >
                      {envio.estado?.nombre || 'Sin estado'}
                    </button>
                  </td>
                  <td className="py-3 px-4 text-black">                 
                      <div className="text-sm">
                        <div>{envio.conductor?.nombre || '-'}</div>
                      </div>
                  </td>
                  <td className="py-3 px-4 text-black">
                    <div className="text-sm">
                      <div>{envio.vehiculo?.marca || '-'} {envio.vehiculo?.modelo || ''}</div>
                      <div className="text-black/60 text-xs">
                        {envio.vehiculo?.patente || '-'}
                      </div>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">
                    <div className="text-sm">
                      <div className="flex items-center gap-2">
                        <span>{formatDate(envio.fechaSalidaProgramada)}</span>
                        {envio.fechaSalidaReal && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                            Real
                          </span>
                        )}
                      </div>
                      {envio.fechaEntregaReal && (
                        <div className="text-xs text-gray-600 flex items-center gap-1 mt-1">
                          <span>Entregado:</span>
                          <span className="text-green-600 font-medium">{formatDate(envio.fechaEntregaReal)}</span>
                        </div>
                      )}
                    </div>
                  </td>
                  <td className="py-3 px-4 text-black">
                    <div className="text-sm">
                      <div className="font-medium">
                        {formatCurrency(envio.costoTotal)}
                        </div>
                    </div>
                  </td>
                  <td className="py-3 px-4">
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onView(envio)}
                        className="h-8 w-8 p-0 text-black/70 hover:text-black hover:bg-black/10"
                        title="Ver detalles"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onChangeStatus?.(envio)}
                        className="h-8 w-8 p-0 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        title="Cambiar estado"
                      >
                        <RotateCcw className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onUpdateDates?.(envio)}
                        className="h-8 w-8 p-0 text-green-600 hover:text-green-700 hover:bg-green-50"
                        title="Actualizar fechas"
                      >
                        <Calendar className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => onEdit(envio)}
                        className="h-8 w-8 p-0 text-black/70 hover:text-black hover:bg-black/10"
                        title="Editar envío"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => envio.idEnvio && onDelete(envio.idEnvio)}
                        className="h-8 w-8 p-0 text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        title="Eliminar envío"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
};
