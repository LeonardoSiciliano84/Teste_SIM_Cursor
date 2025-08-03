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
  Truck,
  FileText,
  Smartphone,
  AlertTriangle,
  CheckSquare,
  Shield,
  ShieldCheck,
  Wrench,
  Warehouse,
  TrendingUp
} from "lucide-react";
import { authManager } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { name: "Dashboard", href: "/", icon: LayoutDashboard },
  { name: "Veículos", href: "/vehicles", icon: Car },
  { name: "Motoristas", href: "/drivers", icon: Users },
  { name: "Colaboradores", href: "/employees", icon: Users },
  { name: "Ocorrências", href: "/occurrences", icon: FileText },
  { name: "Sinistros", href: "/sinistros", icon: AlertTriangle },
  { name: "Checklists", href: "/checklists", icon: CheckSquare },
  { name: "Manutenção", href: "/maintenance", icon: Wrench },
  { name: "Almoxarifado", href: "/warehouse", icon: Warehouse },
  { name: "Dashboards", href: "/dashboards", icon: TrendingUp },
  { name: "Controle de Acesso", href: "/access-control", icon: Shield },
  { name: "Admin - Logs de Acesso", href: "/access-control-admin", icon: BarChart3 },
  { name: "Portaria", href: "/security-guard", icon: ShieldCheck },
  { name: "Portal Motorista", href: "/driver-portal", icon: Smartphone },
  { name: "Gestão de Prancha", href: "/prancha-management", icon: Package },
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
      <div className="flex items-center justify-center px-6 py-6 border-b bg-white">
        <img 
          src="/src/assets/felka-logo.svg" 
          alt="Felka Transportes" 
          className="h-16 w-auto"
        />
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
