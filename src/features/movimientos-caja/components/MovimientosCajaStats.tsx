import { CreditCard, TrendingUp, DollarSign, Activity } from 'lucide-react';
import { Card } from '../../../components/ui/card';

interface MovimientosStats {
  totalMovimientos: number;
  montoTotal: number;
  promedioMonto: number;
  porMetodo: Record<string, { cantidad: number; monto: number }>;
}

interface MovimientosCajaStatsProps {
  stats: MovimientosStats;
}

export const MovimientosCajaStats = ({ stats }: MovimientosCajaStatsProps) => {
  const { totalMovimientos, montoTotal, promedioMonto, porMetodo } = stats;

  const metodoMasUsado = Object.entries(porMetodo).reduce(
    (acc, [metodo, data]) => {
      if (data.cantidad > acc.cantidad) {
        return { metodo, cantidad: data.cantidad };
      }
      return acc;
    },
    { metodo: 'Ninguno', cantidad: 0 }
  );

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {/* Total de Movimientos */}
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-blue-100 mr-4">
            <Activity className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Total Movimientos</p>
            <p className="text-2xl font-bold text-gray-900">{totalMovimientos}</p>
          </div>
        </div>
      </Card>

      {/* Monto Total */}
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-green-100 mr-4">
            <DollarSign className="h-6 w-6 text-green-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Monto Total</p>
            <p className="text-2xl font-bold text-green-600">
              ${montoTotal.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>

      {/* Promedio por Movimiento */}
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-purple-100 mr-4">
            <TrendingUp className="h-6 w-6 text-purple-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Promedio</p>
            <p className="text-2xl font-bold text-purple-600">
              ${promedioMonto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </p>
          </div>
        </div>
      </Card>

      {/* Método Más Usado */}
      <Card className="p-6">
        <div className="flex items-center">
          <div className="p-3 rounded-full bg-orange-100 mr-4">
            <CreditCard className="h-6 w-6 text-orange-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-gray-600">Método Más Usado</p>
            <p className="text-2xl font-bold text-orange-600">
              Método {metodoMasUsado.metodo}
            </p>
            <p className="text-sm text-gray-500">
              {metodoMasUsado.cantidad} {metodoMasUsado.cantidad === 1 ? 'vez' : 'veces'}
            </p>
          </div>
        </div>
      </Card>

      {/* Desglose por Método de Pago */}
      {Object.keys(porMetodo).length > 0 && (
        <Card className="p-6 md:col-span-2 lg:col-span-4">
          <h3 className="text-lg font-semibold mb-4">Desglose por Método de Pago</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {Object.entries(porMetodo).map(([metodo, data]) => (
              <div key={metodo} className="bg-gray-50 p-4 rounded-lg">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium">Método {metodo}</span>
                  <span className="text-sm text-gray-600">{data.cantidad} movimientos</span>
                </div>
                <div className="text-lg font-bold text-green-600">
                  ${data.monto.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
                <div className="text-sm text-gray-500">
                  Promedio: ${(data.monto / data.cantidad).toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
};
