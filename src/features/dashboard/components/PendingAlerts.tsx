import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { AlertTriangle, ArrowRight, DollarSign } from "lucide-react";
import { useFacturasVencidas } from "@/hooks/useDashboardStats";
import { format } from "date-fns";
import { es } from "date-fns/locale";

export const PendingAlerts = () => {
  const { data: facturasVencidas, isLoading } = useFacturasVencidas();

  if (isLoading) {
    return (
      <Card className="border-red-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-red-700">
            <AlertTriangle className="h-5 w-5" />
            Alertas Pendientes
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            {[1, 2].map((i) => (
              <div key={i}>
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const totalFacturasVencidas = facturasVencidas?.length || 0;
  const montoTotalVencido = facturasVencidas?.reduce((sum, factura) => sum + factura.monto, 0) || 0;

  return (
    <Card className="border-red-200">
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2 text-red-700">
          <AlertTriangle className="h-5 w-5" />
          Alertas Pendientes
        </CardTitle>
        {totalFacturasVencidas > 0 && (
          <Badge variant="destructive">
            {totalFacturasVencidas}
          </Badge>
        )}
      </CardHeader>
      <CardContent>
        {totalFacturasVencidas === 0 ? (
          <div className="text-center py-6">
            <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-3">
              <DollarSign className="h-6 w-6 text-green-600" />
            </div>
            <p className="text-green-600 font-medium">¡Todo al día!</p>
            <p className="text-sm text-gray-500">No hay facturas vencidas</p>
          </div>
        ) : (
          <div className="space-y-4">
            {/* Resumen */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-red-800">
                    {totalFacturasVencidas} factura{totalFacturasVencidas > 1 ? 's' : ''} vencida{totalFacturasVencidas > 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-red-600">
                    Total: ${montoTotalVencido.toLocaleString()}
                  </p>
                </div>
                <Button asChild size="sm" variant="destructive">
                  <Link to="/facturas?estado=4">
                    Ver todas
                  </Link>
                </Button>
              </div>
            </div>

            {/* Lista de facturas vencidas */}
            <div className="space-y-3">
              {facturasVencidas?.slice(0, 3).map((factura) => (
                <div 
                  key={factura.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-red-100 bg-red-50/50"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-medium text-sm">{factura.numeroFactura}</span>
                      <Badge variant="destructive" className="text-xs">
                        {factura.diasVencida} día{factura.diasVencida > 1 ? 's' : ''}
                      </Badge>
                    </div>
                    <div className="text-sm text-gray-600">
                      <span className="font-medium">{factura.cliente}</span>
                      <span className="text-gray-400 mx-2">•</span>
                      <span className="font-medium">${factura.monto.toLocaleString()}</span>
                    </div>
                    <div className="text-xs text-red-600 mt-1">
                      Vencida: {format(factura.fechaVencimiento, "d 'de' MMMM, yyyy", { locale: es })}
                    </div>
                  </div>
                  <Button asChild variant="ghost" size="sm" className="shrink-0">
                    <Link to={`/facturas/${factura.id}`}>
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
};
