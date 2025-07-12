import { Link, Outlet, useLocation } from "react-router-dom";
import { Users, Package, BarChart3, UserCheck, Truck } from "lucide-react";

export const MainLayout = () => {
  const location = useLocation();
  
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
    { path: "/tipos-carga", label: "Tipos de Carga", icon: Package },
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

            {/* Mobile/Tablet menu button */}
            <div className="lg:hidden">
              <button className="p-2 rounded-md text-gray-600 hover:text-gray-900 hover:bg-gray-100 transition-colors">
                <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
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
