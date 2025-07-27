import { Link, useLocation } from "wouter";
import { 
  LayoutDashboard, 
  Car, 
  Users, 
  Map, 
  Package, 
  BarChart3, 
  Settings, 
  LogOut, 
  Truck 
} from "lucide-react";
import { authManager } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Veículos", href: "/vehicles", icon: Car },
  { name: "Motoristas", href: "/drivers", icon: Users },
  { name: "Rotas", href: "/routes", icon: Map },
  { name: "Reservas", href: "/bookings", icon: Package },
  { name: "Análises", href: "/analytics", icon: BarChart3 },
];

export default function Sidebar() {
  const [location] = useLocation();

  const handleLogout = () => {
    authManager.logout();
  };

  return (
    <aside className="fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out lg:translate-x-0">
      <div className="flex items-center px-6 py-4 border-b">
        <Truck className="w-8 h-8 text-primary-600 mr-3" />
        <h2 className="text-xl font-bold text-gray-900">Felka Transport</h2>
      </div>

      <nav className="mt-6 px-3">
        <div className="space-y-1">
          {navigation.map((item) => {
            const isActive = location === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={cn(
                  "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
                  isActive
                    ? "bg-primary-50 text-primary-700"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
                )}
              >
                <item.icon className="w-5 h-5 mr-3" />
                {item.name}
              </Link>
            );
          })}
        </div>

        <div className="mt-8 pt-6 border-t">
          <div className="px-3 mb-2">
            <p className="text-xs font-medium text-gray-500 uppercase tracking-wider">
              Configurações
            </p>
          </div>
          <button className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg">
            <Settings className="w-5 h-5 mr-3" />
            Configurações
          </button>
          <button 
            onClick={handleLogout}
            className="flex items-center w-full px-3 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg"
          >
            <LogOut className="w-5 h-5 mr-3" />
            Sair
          </button>
        </div>
      </nav>
    </aside>
  );
}
