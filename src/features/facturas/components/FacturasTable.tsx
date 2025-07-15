import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, Plus, CreditCard } from 'lucide-react';
import type { FacturaDto } from '@/api';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface FacturasTableProps {
  facturas: FacturaDto[];
  loading: boolean;
  onView: (factura: FacturaDto) => void;
  onEdit: (factura: FacturaDto) => void;
  onDelete: (id: number) => void;
  onAdd: () => void;
  onPagar?: (factura: FacturaDto) => void;
}

// Función para obtener el nombre del estado
const getEstadoNombre = (estado: number | undefined): string => {
  if (estado === undefined) return 'Desconocido';
  const estados = {
    0: 'Borrador',
    1: 'Emitida',
    2: 'Pagada',
    3: 'Vencida',
    4: 'Cancelada',
    5: 'Anulada'
  };
  return estados[estado as keyof typeof estados] || 'Desconocido';
};

// Función para obtener el color del badge según el estado
const getEstadoColor = (estado: number | undefined): string => {
  if (estado === undefined) return 'bg-gray-100 text-gray-800';
  const colores = {
    0: 'bg-gray-100 text-gray-800',
    1: 'bg-blue-100 text-blue-800',
    2: 'bg-green-100 text-green-800',
    3: 'bg-red-100 text-red-800',
    4: 'bg-yellow-100 text-yellow-800',
    5: 'bg-gray-100 text-gray-600'
  };
  return colores[estado as keyof typeof colores] || 'bg-gray-100 text-gray-800';
};

// Función para formatear fecha
const formatearFecha = (fecha: Date | string | null | undefined): string => {
  if (!fecha) return '-';
  try {
    const date = typeof fecha === 'string' ? new Date(fecha) : fecha;
    return format(date, 'dd/MM/yyyy', { locale: es });
  } catch {
    return '-';
  }
};

// Función para formatear moneda
const formatearMoneda = (monto: number | undefined): string => {
  if (!monto && monto !== 0) return '$0.00';
  return new Intl.NumberFormat('es-AR', {
    style: 'currency',
    currency: 'ARS',
    minimumFractionDigits: 2
  }).format(monto);
};

export const FacturasTable: React.FC<FacturasTableProps> = ({
  facturas,
  loading,
  onView,
  onEdit,
  onDelete,
  onAdd,
  onPagar
}) => {
  if (loading) {
    return (
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-2xl font-bold">Facturas</h2>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Factura
          </Button>
        </div>
        <div className="grid gap-4">
          {[...Array(5)].map((_, i) => (
            <Card key={i} className="p-6">
              <div className="animate-pulse space-y-3">
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/3"></div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Facturas</h2>
        <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
          <Plus className="h-4 w-4 mr-2" />
          Nueva Factura
        </Button>
      </div>

      {facturas.length === 0 ? (
        <Card className="p-8 text-center">
          <p className="text-gray-500 mb-4">No hay facturas registradas</p>
          <Button onClick={onAdd} className="bg-blue-600 hover:bg-blue-700">
            <Plus className="h-4 w-4 mr-2" />
            Crear Primera Factura
          </Button>
        </Card>
      ) : (
        <>
          {/* Lista de facturas */}
          <div className="grid gap-4">
            {facturas.map((factura) => (
              <Card key={factura.idFactura} className="p-6 hover:shadow-md transition-shadow">
                <div className="flex justify-between items-start">
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-4">
                      <h3 className="text-lg font-semibold">
                        Factura N° {factura.numeroFactura}
                      </h3>
                      <Badge className={getEstadoColor(factura.estado)}>
                        {getEstadoNombre(factura.estado)}
                      </Badge>
                    </div>

                    <div className="grid md:grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Cliente:</span>
                          <span className="font-medium">{factura.cliente?.nombre || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Envío:</span>
                          <span>{factura.envio?.numeroSeguimiento || '-'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fecha Emisión:</span>
                          <span>{formatearFecha(factura.fechaEmision)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Fecha Vencimiento:</span>
                          <span>{formatearFecha(factura.fechaVencimiento)}</span>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">Subtotal:</span>
                          <span>{formatearMoneda(factura.subtotal)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-sm text-gray-600">IVA:</span>
                          <span>{formatearMoneda(factura.iva)}</span>
                        </div>
                        <div className="flex justify-between font-semibold text-lg">
                          <span>Total:</span>
                          <span className="text-green-600">{formatearMoneda(factura.total)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onView(factura)}
                      title="Ver detalles"
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                    {onPagar && factura.estado !== 2 && factura.estado !== 5 && (
                      <Button
                        variant="outline"
                        size="icon"
                        onClick={() => onPagar(factura)}
                        title="Registrar Pago"
                        className="text-green-600 hover:text-green-700 hover:bg-green-50"
                      >
                        <CreditCard className="h-4 w-4" />
                      </Button>
                    )}
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onEdit(factura)}
                      title="Editar"
                      disabled={factura.estado === 5} // No editar anuladas
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="icon"
                      onClick={() => onDelete(factura.idFactura!)}
                      title="Eliminar"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      disabled={factura.estado === 2 || factura.estado === 5} // No eliminar pagadas o anuladas
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </>
      )}
    </div>
  );
};
