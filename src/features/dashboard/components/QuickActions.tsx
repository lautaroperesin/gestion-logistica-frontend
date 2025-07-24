import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "react-router-dom";
import { 
  Plus, 
  Package, 
  Users, 
  FileText, 
  DollarSign, 
  Truck,
  MapPin
} from "lucide-react";

export const QuickActions = () => {
  const actions = [
    {
      title: "Nuevo Envío",
      description: "Crear un envío rápidamente",
      icon: <Package className="h-4 w-4" />,
      href: "/envios/nuevo",
      variant: "default" as const,
    },
    {
      title: "Nueva Factura",
      description: "Generar factura",
      icon: <FileText className="h-4 w-4" />,
      href: "/facturas/nueva",
      variant: "outline" as const,
    },
    {
      title: "Agregar Cliente",
      description: "Registrar nuevo cliente",
      icon: <Users className="h-4 w-4" />,
      href: "/clientes/nuevo",
      variant: "outline" as const,
    },
    {
      title: "Movimiento Caja",
      description: "Registrar ingreso/egreso",
      icon: <DollarSign className="h-4 w-4" />,
      href: "/movimientos-caja/nuevo",
      variant: "outline" as const,
    },
    {
      title: "Registrar Vehículo",
      description: "Agregar vehículo a la flota",
      icon: <Truck className="h-4 w-4" />,
      href: "/vehiculos/nuevo",
      variant: "outline" as const,
    },
    {
      title: "Nueva Ubicación",
      description: "Agregar punto de entrega",
      icon: <MapPin className="h-4 w-4" />,
      href: "/ubicaciones/nueva",
      variant: "outline" as const,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Plus className="h-5 w-5" />
          Acciones Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid gap-3 md:grid-cols-2">
          {actions.map((action, index) => (
            <Button 
              key={index}
              asChild 
              variant={action.variant}
              className="h-auto p-4 justify-start"
            >
              <Link to={action.href}>
                <div className="flex items-start gap-3 w-full">
                  <div className="mt-0.5">
                    {action.icon}
                  </div>
                  <div className="text-left">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-muted-foreground mt-1">
                      {action.description}
                    </div>
                  </div>
                </div>
              </Link>
            </Button>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
