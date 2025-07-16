import { Pencil, Trash2, CreditCard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import type { MetodoPagoDto } from '@/api';

interface MetodosPagoTableProps {
  metodosPago: MetodoPagoDto[];
  loading: boolean;
  onEdit: (metodoPago: MetodoPagoDto) => void;
  onDelete: (metodoPago: MetodoPagoDto) => void;
}

export const MetodosPagoTable = ({
  metodosPago,
  loading,
  onEdit,
  onDelete,
}: MetodosPagoTableProps) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[...Array(5)].map((_, i) => (
          <div key={i} className="animate-pulse">
            <div className="h-12 bg-gray-200 rounded"></div>
          </div>
        ))}
      </div>
    );
  }

  if (metodosPago.length === 0) {
    return (
      <div className="text-center py-8">
        <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          No hay métodos de pago registrados
        </h3>
        <p className="text-gray-600">
          Comienza agregando tu primer método de pago al sistema.
        </p>
      </div>
    );
  }

  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Nombre</TableHead>
          <TableHead className="text-right">Acciones</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {metodosPago.map((metodoPago) => (
          <TableRow key={metodoPago.id}>
            <TableCell className="font-medium">
              #{metodoPago.id}
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-green-600" />
                {metodoPago.nombre || 'Sin nombre'}
              </div>
            </TableCell>
            <TableCell className="text-right">
              <div className="flex items-center justify-end gap-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onEdit(metodoPago)}
                  className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                >
                  <Pencil className="h-4 w-4" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onDelete(metodoPago)}
                  className="text-red-600 hover:text-red-700 hover:bg-red-50"
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
};
