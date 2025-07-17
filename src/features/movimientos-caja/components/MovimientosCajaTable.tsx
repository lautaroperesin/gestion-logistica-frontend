import { useState } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Eye, Trash2, ChevronUp, ChevronDown } from 'lucide-react';
import { Card } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import type { MovimientoCajaDto } from '../../../api';

interface MovimientosCajaTableProps {
  movimientos: MovimientoCajaDto[];
  loading: boolean;
  onView: (movimiento: MovimientoCajaDto) => void;
  onDelete: (id: number) => void;
}

type SortField = 'fechaPago' | 'monto';
type SortDirection = 'asc' | 'desc';

export const MovimientosCajaTable = ({
  movimientos,
  loading,
  onView,
  onDelete
}: MovimientosCajaTableProps) => {
  const [sortField, setSortField] = useState<SortField>('fechaPago');
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('desc');
    }
  };

  const sortedMovimientos = [...movimientos].sort((a, b) => {
    const direction = sortDirection === 'asc' ? 1 : -1;
    
    switch (sortField) {
      case 'fechaPago':
        const dateA = a.fechaPago ? new Date(a.fechaPago).getTime() : 0;
        const dateB = b.fechaPago ? new Date(b.fechaPago).getTime() : 0;
        return (dateA - dateB) * direction;
      
      case 'monto':
        return ((a.monto || 0) - (b.monto || 0)) * direction;
      
      default:
        return 0;
    }
  });

  const SortIcon = ({ field }: { field: SortField }) => {
    if (sortField !== field) return null;
    return sortDirection === 'asc' ? 
      <ChevronUp className="w-4 h-4" /> : 
      <ChevronDown className="w-4 h-4" />;
  };

  if (loading) {
    return (
      <Card className="p-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Cargando movimientos...</p>
          </div>
        </div>
      </Card>
    );
  }

  if (movimientos.length === 0) {
    return (
      <Card className="p-8 text-center">
        <h3 className="text-lg font-semibold mb-2">No hay movimientos de caja</h3>
        <p className="text-gray-600">Los pagos registrados aparecerán aquí</p>
      </Card>
    );
  }

  return (
    <Card className="overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50">
            <tr>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('fechaPago')}
              >
                <div className="flex items-center space-x-1">
                  <span>Fecha</span>
                  <SortIcon field="fechaPago" />
                </div>
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                <div className="flex items-center space-x-1">
                  <span>Factura</span>
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Cliente
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Método de Pago
              </th>
              <th 
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('monto')}
              >
                <div className="flex items-center space-x-1">
                  <span>Monto</span>
                  <SortIcon field="monto" />
                </div>
              </th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                Observaciones
              </th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                Acciones
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {sortedMovimientos.map((movimiento) => (
              <tr key={movimiento.idMovimiento} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movimiento.fechaPago ? 
                    format(new Date(movimiento.fechaPago), "dd/MM/yyyy", { locale: es }) :
                    'N/A'
                  }
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600">
                  N° {movimiento.factura?.numeroFactura || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  {movimiento.factura?.cliente?.nombre || 'N/A'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                  <span className="px-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">
                    {movimiento.metodoPago?.nombre || 'N/A'}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-green-600">
                  ${movimiento.monto?.toLocaleString('es-AR', { minimumFractionDigits: 2 }) || '0.00'}
                </td>
                <td className="px-6 py-4 text-sm text-gray-900 max-w-xs truncate">
                  {movimiento.observaciones || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onView(movimiento)}
                      className="p-2"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => movimiento.idMovimiento && onDelete(movimiento.idMovimiento)}
                      className="p-2 text-red-600 hover:text-red-700 hover:bg-red-50"
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
    </Card>
  );
};
