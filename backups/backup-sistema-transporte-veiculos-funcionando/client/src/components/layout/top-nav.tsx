import { useState, useEffect } from "react";
import { Menu, Bell } from "lucide-react";
import { authManager, type AuthState } from "@/lib/auth";
import { Button } from "@/components/ui/button";

const pageTitles: Record<string, string> = {
  "/": "Dashboard",
  "/vehicles": "Gestão de Veículos",
  "/drivers": "Gestão de Motoristas",
  "/routes": "Planejamento de Rotas",
  "/bookings": "Gestão de Reservas",
  "/analytics": "Análises e Relatórios",
};

export default function TopNav() {
  const [authState, setAuthState] = useState<AuthState>(authManager.getState());
  const [currentPath, setCurrentPath] = useState(window.location.pathname);

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return () => {
      unsubscribe();
    };
  }, []);

  useEffect(() => {
    const handleLocationChange = () => {
      setCurrentPath(window.location.pathname);
    };

    window.addEventListener("popstate", handleLocationChange);
    return () => window.removeEventListener("popstate", handleLocationChange);
  }, []);

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <header className="bg-white border-b border-gray-200 px-4 sm:px-6 lg:px-8">
      <div className="flex items-center justify-between h-16">
        <div className="flex items-center">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden p-2 rounded-md text-gray-400 hover:text-gray-500 hover:bg-gray-100"
          >
            <Menu className="w-6 h-6" />
          </Button>
          <h1 className="ml-4 text-2xl font-semibold text-gray-900">
            {pageTitles[currentPath] || "Dashboard"}
          </h1>
        </div>

        <div className="flex items-center space-x-4">
          <Button
            variant="ghost"
            size="icon"
            className="relative p-2 text-gray-400 hover:text-gray-500"
          >
            <Bell className="w-6 h-6" />
            <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-red-400 text-xs text-white flex items-center justify-center">
              3
            </span>
          </Button>

          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-sm font-medium text-primary-600">
                {authState.user ? getInitials(authState.user.name) : "U"}
              </span>
            </div>
            <span className="text-sm font-medium text-gray-900">
              {authState.user?.name || "Usuário"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
