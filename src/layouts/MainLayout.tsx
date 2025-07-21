import { Link, Outlet, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Users, Package, BarChart3, UserCheck, Truck, MapPin, FileText, CreditCard, LogOut, User } from "lucide-react";
import { useAuthStatus, useLogout } from "@/hooks/useAuth";

export const MainLayout = () => {
  const location = useLocation();
  const { user } = useAuthStatus();
  const { mutate: logout } = useLogout();
  
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
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Header */}
      <header className="bg-white shadow-lg border-b border-gray-200 sticky top-0 z-50">
        <div className="w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shadow-md">
                  <Package className="h-6 w-6 text-black" />
                </div>
                <h1 className="text-xl font-bold text-black">
                  Gestión Logística
                </h1>
              </div>
            </div>
            
            <nav className="hidden lg:flex space-x-2 xl:space-x-3">
              {navItems.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 hover:scale-105 ${
                    isActive(path)
                      ? "bg-green-100 text-green-600"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {label}
                </Link>
              ))}
            </nav>

            {/* User Profile & Logout */}
            <div className="flex items-center gap-3">
              <div className="hidden md:flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium">{user?.nombre || 'Usuario'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="flex items-center gap-2 text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Cerrar Sesión</span>
              </Button>
            </div>

            {/* Mobile/Tablet menu - would need a dropdown for navigation */}
            <div className="lg:hidden flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <User className="h-4 w-4" />
                <span className="font-medium hidden sm:inline">{user?.nombre || 'Usuario'}</span>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => logout()}
                className="flex items-center gap-1 text-gray-600 hover:text-red-600 hover:bg-red-50"
              >
                <LogOut className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 w-full px-4 sm:px-6 lg:px-8 xl:px-12 2xl:px-16 py-6 sm:py-8">
        <div className="w-full">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
