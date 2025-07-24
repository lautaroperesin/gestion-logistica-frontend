import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { Clock, ArrowRight, Package } from "lucide-react";
import { useEnviosRecientes } from "@/hooks/useDashboardStats";
import { format } from "date-fns";
import { es } from "date-fns/locale";

const getEstadoColor = (estado: string) => {
  switch (estado.toLowerCase()) {
    case 'en tránsito':
      return 'bg-blue-100 text-blue-800 border-blue-200';
    case 'entregado':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'pendiente':
      return 'bg-yellow-100 text-yellow-800 border-yellow-200';
    case 'preparando':
      return 'bg-orange-100 text-orange-800 border-orange-200';
    default:
      return 'bg-gray-100 text-gray-800 border-gray-200';
  }
};

export const RecentActivity = () => {
  const { data: enviosRecientes, isLoading } = useEnviosRecientes();

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5" />
            Actividad Reciente
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0">
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-5 w-5" />
          Actividad Reciente
        </CardTitle>
        <Button asChild variant="ghost" size="sm">
          <Link to="/envios" className="text-blue-600 hover:text-blue-700">
            Ver todos
            <ArrowRight className="h-4 w-4 ml-1" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        {!enviosRecientes || enviosRecientes.length === 0 ? (
          <div className="text-center py-8">
            <Package className="h-12 w-12 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500">No hay actividad reciente</p>
          </div>
        ) : (
          <div className="space-y-4">
            {enviosRecientes.map((envio) => (
              <div 
                key={envio.id} 
                className="flex items-center justify-between p-3 rounded-lg border bg-gray-50/50 hover:bg-gray-100/50 transition-colors"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-sm">{envio.numeroEnvio}</span>
                    <Badge 
                      variant="outline" 
                      className={getEstadoColor(envio.estado)}
                    >
                      {envio.estado}
                    </Badge>
                  </div>
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">{envio.cliente}</span>
                    <span className="text-gray-400 mx-2">→</span>
                    <span>{envio.destino}</span>
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {format(envio.fechaCreacion, "d 'de' MMMM, yyyy", { locale: es })}
                  </div>
                </div>
                <Button asChild variant="ghost" size="sm" className="shrink-0">
                  <Link to={`/envios/${envio.id}`}>
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
};
