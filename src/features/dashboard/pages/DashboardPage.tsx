import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  Users, 
  Package, 
  TrendingUp, 
  Clock, 
  Truck, 
  DollarSign,
  FileText,
  Target,
  Zap
} from "lucide-react";
import { StatsCard } from "../components/StatsCard";
import { QuickActions } from "../components/QuickActions";
import { RecentActivity } from "../components/RecentActivity";
import { PendingAlerts } from "../components/PendingAlerts";
import { useDashboardStats } from "@/hooks/useDashboardStats";

export const DashboardPage = () => {
  const { data: stats, isLoading } = useDashboardStats();

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
            <p className="text-gray-600">Resumen de tu gestión logística</p>
          </div>
        </div>
        
        {/* Loading skeleton */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="space-y-0 pb-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-full"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  // Calcular tendencias
  const ingresosChange = stats ? ((stats.ingresosEsteMes - stats.ingresosMesAnterior) / stats.ingresosMesAnterior * 100) : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Resumen de tu gestión logística</p>
        </div>
      </div>

      {/* KPIs Principales */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Total Envíos"
          value={stats?.totalEnvios || 0}
          icon={<Package />}
          description={`${stats?.enviosEsteMes || 0} este mes`}
        />
        
        <StatsCard
          title="En Tránsito"
          value={stats?.enviosEnTransito || 0}
          icon={<Truck />}
          description="Envíos activos"
          className="border-blue-200"
        />
        
        <StatsCard
          title="Ingresos del Mes"
          value={`$${(stats?.ingresosEsteMes || 0).toLocaleString()}`}
          icon={<TrendingUp />}
          trend={{
            value: Math.round(ingresosChange),
            label: "vs mes anterior",
            isPositive: ingresosChange > 0
          }}
        />
        
        <StatsCard
          title="Clientes Activos"
          value={stats?.totalClientes || 0}
          icon={<Users />}
          description={`+${stats?.clientesNuevosEsteMes || 0} nuevos este mes`}
        />
      </div>

      {/* KPIs Secundarios */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatsCard
          title="Entregados"
          value={stats?.enviosEntregados || 0}
          icon={<Target />}
          description="Envíos completados"
          className="border-green-200"
        />
        
        <StatsCard
          title="Pendientes"
          value={stats?.enviosPendientes || 0}
          icon={<Clock />}
          description="Por procesar"
          className="border-yellow-200"
        />
        
        <StatsCard
          title="Flota Activa"
          value={`${stats?.vehiculosActivos || 0}/${stats?.totalVehiculos || 0}`}
          icon={<Truck />}
          description={`${stats?.vehiculosEnMantenimiento || 0} en mantenimiento`}
        />
        
        <StatsCard
          title="Eficiencia"
          value={`${stats?.porcentajeEntregasATiempo || 0}%`}
          icon={<Zap />}
          description="Entregas a tiempo"
          className="border-purple-200"
        />
      </div>

      {/* Sección de Alertas y Datos Financieros */}
      <div className="grid gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <PendingAlerts />
        </div>
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Resumen Financiero
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center p-3 bg-green-50 rounded-lg border border-green-200">
              <div>
                <p className="text-sm text-green-700">Ingresos Este Mes</p>
                <p className="text-lg font-bold text-green-800">
                  ${(stats?.ingresosEsteMes || 0).toLocaleString()}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
            
            <div className="flex justify-between items-center p-3 bg-yellow-50 rounded-lg border border-yellow-200">
              <div>
                <p className="text-sm text-yellow-700">Facturación Pendiente</p>
                <p className="text-lg font-bold text-yellow-800">
                  ${(stats?.facturacionPendiente || 0).toLocaleString()}
                </p>
              </div>
              <FileText className="h-8 w-8 text-yellow-600" />
            </div>
            
            <div className="text-center pt-2">
              <p className="text-xs text-gray-500">
                Tiempo promedio de entrega: {stats?.tiempoPromedioEntrega || 0} días
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Acciones Rápidas y Actividad */}
      <div className="grid gap-6 lg:grid-cols-2">
        <QuickActions />
        <RecentActivity />
      </div>
    </div>
  );
};