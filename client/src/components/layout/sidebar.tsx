import { Link, useLocation } from "wouter";
import { useState } from "react";
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
  TrendingUp,
  Calendar,
  UserPlus,
  ChevronDown,
  ChevronRight,
  DollarSign,
  Circle
} from "lucide-react";
import { authManager } from "@/lib/auth";
import { cn } from "@/lib/utils";

const navigation = [
  { 
    name: "Dashboard", 
    href: "/", 
    icon: LayoutDashboard,
    children: [
      { name: "Indicadores da Frota", href: "/dashboards", icon: TrendingUp },
      { name: "Análises", href: "/analytics", icon: BarChart3 }
    ]
  },
  {
    name: "Frota",
    icon: Car,
    children: [
      { name: "Veículos", href: "/vehicles", icon: Car },
      { name: "Sinistros", href: "/sinistros", icon: AlertTriangle },
      { name: "Checklists", href: "/checklists", icon: CheckSquare }
    ]
  },
  {
    name: "Colaboradores",
    icon: Users,
    children: [
      { name: "Funcionários", href: "/employees", icon: Users },
      { name: "Motoristas", href: "/drivers", icon: Truck },
      { name: "Ocorrências", href: "/occurrences", icon: FileText },
      { name: "Pessoas Externas", href: "/external-persons", icon: UserPlus },
      { name: "Gestão de Prancha", href: "/prancha-management", icon: Package }
    ]
  },
  {
    name: "Manutenção",
    href: "/maintenance",
    icon: Wrench,
    children: [
      { name: "Lançamento de Custos", href: "/maintenance/costs", icon: DollarSign },
      { name: "Controle de Pneus", href: "/maintenance/tires", icon: Circle },
      { name: "Controle por Veículo", href: "/maintenance/vehicles", icon: Car }
    ]
  },
  {
    name: "Almoxarifado",
    href: "/warehouse",
    icon: Warehouse,
    children: [
      { name: "Agendamento", href: "/cargo-scheduling", icon: Calendar }
    ]
  },
  {
    name: "Controle de Acesso",
    href: "/access-control",
    icon: Shield,
    children: [
      { name: "Admin - Logs de Acesso", href: "/access-control-admin", icon: BarChart3 },
      { name: "Portaria", href: "/security-guard", icon: ShieldCheck }
    ]
  },
  { name: "Portal Motorista", href: "/driver-portal", icon: Smartphone },
  { name: "Rotas", href: "/routes", icon: Map },
  { name: "Reservas", href: "/bookings", icon: Package }
];

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export default function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  const [location] = useLocation();
  const [expandedItems, setExpandedItems] = useState<string[]>([]);

  const handleLogout = () => {
    authManager.logout();
  };

  const toggleExpanded = (itemName: string) => {
    setExpandedItems(prev => 
      prev.includes(itemName) 
        ? prev.filter(name => name !== itemName)
        : [...prev, itemName]
    );
  };

  const isItemActive = (item: any): boolean => {
    if (item.href && location === item.href) return true;
    if (item.children) {
      return item.children.some((child: any) => location === child.href);
    }
    return false;
  };

  const renderMenuItem = (item: any) => {
    const hasChildren = item.children && item.children.length > 0;
    const isExpanded = expandedItems.includes(item.name);
    const isActive = isItemActive(item);

    if (!hasChildren) {
      return (
        <Link
          key={item.name}
          href={item.href}
          className={cn(
            "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <item.icon className="w-5 h-5 mr-3" />
          {item.name}
        </Link>
      );
    }

    return (
      <div key={item.name} className="space-y-1">
        <button
          onClick={() => toggleExpanded(item.name)}
          className={cn(
            "flex items-center w-full px-3 py-2 text-sm font-medium rounded-lg transition-colors",
            isActive
              ? "bg-blue-50 text-blue-700 border-l-4 border-blue-600"
              : "text-gray-600 hover:text-gray-900 hover:bg-gray-100"
          )}
        >
          <item.icon className="w-5 h-5 mr-3" />
          <span className="flex-1 text-left">{item.name}</span>
          {isExpanded ? (
            <ChevronDown className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button>
        
        {/* Parent item direct link if it has href */}
        {item.href && isExpanded && (
          <Link
            href={item.href}
            className={cn(
              "flex items-center px-3 py-2 ml-6 text-xs font-medium rounded-lg transition-colors",
              location === item.href
                ? "bg-blue-100 text-blue-800"
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
            )}
          >
            <item.icon className="w-4 h-4 mr-2" />
            {item.name}
          </Link>
        )}

        {/* Submenu items */}
        {isExpanded && (
          <div className="ml-6 space-y-1">
            {item.children.map((child: any) => (
              <Link
                key={child.name}
                href={child.href}
                className={cn(
                  "flex items-center px-3 py-2 text-xs font-medium rounded-lg transition-colors",
                  location === child.href
                    ? "bg-blue-100 text-blue-800"
                    : "text-gray-500 hover:text-gray-700 hover:bg-gray-50"
                )}
              >
                <child.icon className="w-4 h-4 mr-2" />
                {child.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-40 lg:hidden" 
          onClick={onClose}
        />
      )}
      
      <aside className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-white border-r border-gray-200 transform transition-transform duration-200 ease-in-out",
        isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0"
      )}>
      <div className="flex items-center justify-center px-6 py-6 border-b bg-white">
        <img 
          src="/src/assets/felka-logo.svg" 
          alt="Felka Transportes" 
          className="h-16 w-auto"
        />
      </div>

      <nav className="mt-6 px-3 overflow-y-auto max-h-[calc(100vh-200px)]">
        <div className="space-y-1">
          {navigation.map(renderMenuItem)}
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
    </>
  );
}
