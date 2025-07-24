import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { 
  Users, 
  Package, 
  BarChart3, 
  UserCheck, 
  Truck, 
  MapPin, 
  FileText, 
  CreditCard, 
  LogOut, 
  User,
  Menu,
  X,
  ChevronLeft,
  ChevronRight
} from "lucide-react";
import { useAuthStatus, useLogout } from "@/hooks/useAuth";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuthStatus();
  const { mutate: logout } = useLogout();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    return location.pathname.startsWith(path) && path !== "/";
  };

  const navItems = [
    { path: "/", label: "Dashboard", icon: BarChart3 },
    { path: "/clientes", label: "Clientes", icon: Users },
    { path: "/conductores", label: "Conductores", icon: UserCheck },
    { path: "/vehiculos", label: "Vehículos", icon: Truck },
    { path: "/envios", label: "Envíos", icon: Package },
    { path: "/facturas", label: "Facturas", icon: FileText },
    { path: "/movimientos-caja", label: "Movimientos de Caja", icon: CreditCard },
    { path: "/tipos-carga", label: "Tipos de Carga", icon: Package },
    { path: "/ubicaciones", label: "Ubicaciones", icon: MapPin },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex">
      {/* Mobile menu overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 z-40 lg:hidden"
          onClick={() => setMobileMenuOpen(false)}
        >
          <div className="fixed inset-0 bg-black bg-opacity-50" />
        </div>
      )}

      {/* Sidebar */}
      <div className={cn(
        "fixed top-0 left-0 z-50 h-full bg-white border-r border-gray-200 transition-all duration-300 ease-in-out lg:relative lg:translate-x-0",
        sidebarOpen ? "w-64" : "w-20",
        mobileMenuOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
        <div className="flex flex-col h-full">
          {/* Header del sidebar */}
          <div className="flex items-center justify-between p-4 border-b border-gray-200">
            <div className={cn(
              "flex items-center gap-3 transition-all duration-300",
              !sidebarOpen && "justify-center"
            )}>
              <div className="w-8 h-8 bg-green-600 rounded-lg flex items-center justify-center">
                <Package className="h-5 w-5 text-white" />
              </div>
              {sidebarOpen && (
                <div className="overflow-hidden">
                  <h1 className="text-lg font-bold text-gray-900 whitespace-nowrap">
                    Gestión Logística
                  </h1>
                </div>
              )}
            </div>
            
            {/* Toggle button - desktop */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="hidden lg:flex h-8 w-8 p-0"
            >
              {sidebarOpen ? (
                <ChevronLeft className="h-4 w-4" />
              ) : (
                <ChevronRight className="h-4 w-4" />
              )}
            </Button>

            {/* Close button - mobile */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(false)}
              className="lg:hidden h-8 w-8 p-0"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Navigation */}
          <nav className="flex-1 p-4 space-y-2 overflow-y-auto">
            {navItems.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setMobileMenuOpen(false)}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 hover:bg-gray-100",
                  isActive(path)
                    ? "bg-green-50 text-green-700 border border-green-200"
                    : "text-gray-700 hover:text-gray-900",
                  !sidebarOpen && "justify-center px-2"
                )}
                title={!sidebarOpen ? label : undefined}
              >
                <Icon className="h-5 w-5 shrink-0" />
                {sidebarOpen && (
                  <span className="truncate">{label}</span>
                )}
              </Link>
            ))}
          </nav>

          {/* User section */}
          <div className="p-4 border-t border-gray-200">
            <div className={cn(
              "flex items-center gap-3 mb-3",
              !sidebarOpen && "justify-center"
            )}>
              <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center">
                <User className="h-4 w-4 text-gray-600" />
              </div>
              {sidebarOpen && (
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {user?.nombre || 'Usuario'}
                  </p>
                  <p className="text-xs text-gray-500 truncate">
                    {user?.email || 'usuario@email.com'}
                  </p>
                </div>
              )}
            </div>
            
            <Button
              variant="ghost"
              size="sm"
              onClick={() => logout()}
              className={cn(
                "w-full justify-start text-gray-600 hover:text-red-600 hover:bg-red-50",
                !sidebarOpen && "justify-center px-2"
              )}
              title={!sidebarOpen ? "Cerrar Sesión" : undefined}
            >
              <LogOut className="h-4 w-4 shrink-0" />
              {sidebarOpen && <span className="ml-2">Cerrar Sesión</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top bar para móvil */}
        <header className="lg:hidden bg-white border-b border-gray-200 px-4 py-3">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setMobileMenuOpen(true)}
              className="h-8 w-8 p-0"
            >
              <Menu className="h-5 w-5" />
            </Button>
            
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 bg-green-600 rounded-md flex items-center justify-center">
                <Package className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-lg font-bold text-gray-900">
                Gestión Logística
              </h1>
            </div>
            
            <div className="w-8 h-8" /> {/* Spacer */}
          </div>
        </header>

        {/* Main content area */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="max-w-full">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};
