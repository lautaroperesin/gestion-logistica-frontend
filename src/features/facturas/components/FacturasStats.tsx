import { Card } from '@/components/ui/card';
import { FileText, DollarSign, Clock, CheckCircle } from 'lucide-react';
import { useFacturaCalculations } from '../hooks/useFacturas';
import type { FacturaDto } from '@/api';

export const FacturasStats = ({ facturas }: { facturas: FacturaDto[] }) => {
  const calculations = useFacturaCalculations(facturas);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <FileText className="h-5 w-5 text-blue-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Facturas</p>
            <p className="text-2xl font-bold">{calculations.totalFacturas}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <DollarSign className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Total Facturado</p>
            <p className="text-lg font-bold text-green-600">
              ${calculations.totalGeneral.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-yellow-100 rounded-lg">
            <Clock className="h-5 w-5 text-yellow-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pendientes</p>
            <p className="text-2xl font-bold text-yellow-600">{calculations.facturasPendientes}</p>
          </div>
        </div>
      </Card>

      <Card className="p-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-green-100 rounded-lg">
            <CheckCircle className="h-5 w-5 text-green-600" />
          </div>
          <div>
            <p className="text-sm text-gray-600">Pagadas</p>
            <p className="text-2xl font-bold text-green-600">{calculations.facturasPagadas}</p>
          </div>
        </div>
      </Card>
    </div>
  );
};