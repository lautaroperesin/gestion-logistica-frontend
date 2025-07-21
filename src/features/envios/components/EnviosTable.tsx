import React from 'react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Trash2, Edit, Eye, Package, User, MapPin } from 'lucide-react';
import type { EnvioDto } from '@/api';
import { EstadoBadge } from './EstadoBadge';

interface EnviosTableProps {
  envios: EnvioDto[];
  loading: boolean;
  onEdit: (envio: EnvioDto) => void;
  onDelete: (id: number) => void;
  onView: (envio: EnvioDto) => void;
  onChangeStatus?: (envio: EnvioDto) => void;
}

export const EnviosTable: React.FC<EnviosTableProps> = ({
  envios,
  loading,
  onEdit,
  onDelete,
  onView,
  onChangeStatus,
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

  if (loading) {
    return (
      <div className="p-6">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <Skeleton key={index} className="h-20 w-full" />
          ))}
        </div>
      </div>
    );
  }

  if (envios.length === 0) {
    return (
      <div className="p-6">
        <div className="text-center py-8">
          <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No hay envíos registrados</p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b bg-gray-50">
            <th className="text-left py-3 px-4 font-medium text-gray-900">Nro. Seguimiento</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Cliente</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Origen</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Destino</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Estado</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Conductor</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Vehículo</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Salida</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Costo</th>
            <th className="text-left py-3 px-4 font-medium text-gray-900">Acciones</th>
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
                  <EstadoBadge 
                    envio={envio}
                    interactive={true}
                    onClick={onChangeStatus}
                    size="sm"
                  />
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
                      <div>{formatDate(envio.fechaSalida)}</div>
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
  );
};
