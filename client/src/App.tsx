import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useState, useEffect } from "react";
import { authManager, type AuthState } from "@/lib/auth";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import Vehicles from "@/pages/vehicles";
import Drivers from "@/pages/drivers";
import Routes from "@/pages/routes";
import Bookings from "@/pages/bookings";
import Analytics from "@/pages/analytics";
import { EmployeesPage } from "@/pages/employees";
import { EmployeeNewPage } from "@/pages/employee-new";
import { EmployeeDetailsPage } from "@/pages/employee-details";
import { EmployeeEditPage } from "@/pages/employee-edit";
import { ExternalPersonsPage } from "@/pages/external-persons";
import { OccurrencesPage } from "@/pages/occurrences";
import DriverPortal from "@/pages/driver-portal";
import DriverLogin from "@/pages/driver-login";
import PranchaManagement from "@/pages/prancha-management";
import SinistrosPage from "@/pages/sinistros";
import ChecklistsPage from "@/pages/checklists";
import AccessControl from "@/pages/access-control";
import AccessControlAdmin from "@/pages/access-control-admin";
import SecurityGuardAccess from "@/pages/security-guard-access";
import Maintenance from "@/pages/maintenance";
import Warehouse from "@/pages/warehouse";
import Dashboards from "@/pages/dashboards";
import CargoScheduling from "@/pages/cargo-scheduling";
import VehiclesParked from "@/pages/VehiclesParked";
import PreventiveMaintenance from "@/pages/preventive-maintenance";
import DataImport from "@/pages/DataImport";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import VehicleEdit from "@/components/vehicles/vehicle-edit";
import { VehicleDetailsPage } from "@/pages/vehicle-details";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vehicles" component={Vehicles} />
      <Route path="/vehicles/:id" component={VehicleDetailsPage} />
      <Route path="/vehicles/edit/:id">
        {(params) => (
          <VehicleEdit 
            vehicleId={params.id} 
            onCancel={() => {}} 
          />
        )}
      </Route>
      <Route path="/drivers" component={Drivers} />
      <Route path="/employees" component={EmployeesPage} />
      <Route path="/employees/new" component={EmployeeNewPage} />
      <Route path="/employees/:id" component={EmployeeDetailsPage} />
      <Route path="/employees/edit/:id" component={EmployeeEditPage} />
      <Route path="/occurrences" component={OccurrencesPage} />
      <Route path="/driver-portal" component={DriverPortal} />
      <Route path="/driver-login" component={DriverLogin} />
      <Route path="/prancha-management" component={PranchaManagement} />
      <Route path="/sinistros" component={SinistrosPage} />
      <Route path="/checklists" component={ChecklistsPage} />
      <Route path="/access-control" component={AccessControl} />
      <Route path="/access-control-admin" component={AccessControlAdmin} />
      <Route path="/security-guard" component={SecurityGuardAccess} />
      <Route path="/maintenance" component={Maintenance} />
      <Route path="/warehouse" component={Warehouse} />
      <Route path="/dashboards" component={Dashboards} />
      <Route path="/cargo-scheduling" component={CargoScheduling} />
      <Route path="/external-persons" component={ExternalPersonsPage} />
      <Route path="/vehicles-parked" component={VehiclesParked} />
      <Route path="/preventive-maintenance" component={PreventiveMaintenance} />
      <Route path="/data-import" component={DataImport} />
      <Route path="/routes" component={Routes} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp({ sidebarOpen, setSidebarOpen }: { sidebarOpen: boolean; setSidebarOpen: (open: boolean) => void }) {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header onMenuClick={() => setSidebarOpen(true)} />
      <div className="flex">
        <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 lg:pl-64">
          <main className="p-4 sm:p-6 lg:p-8">
            <Router />
          </main>
        </div>
      </div>
    </div>
  );
}

function App() {
  const [authState, setAuthState] = useState<AuthState>(authManager.getState());
  const [sidebarOpen, setSidebarOpen] = useState(false);

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return () => {
      unsubscribe();
    };
  }, []);

  if (!authState.isAuthenticated) {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <Login />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Se o usuário é motorista, redirecionar apenas para o portal
  // Renderizar portal do motorista para drivers OU admins
  if (authState.user?.role === 'driver') {
    return (
      <QueryClientProvider client={queryClient}>
        <TooltipProvider>
          <DriverPortal />
          <Toaster />
        </TooltipProvider>
      </QueryClientProvider>
    );
  }

  // Usuários admin e user podem acessar a área administrativa
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthenticatedApp sidebarOpen={sidebarOpen} setSidebarOpen={setSidebarOpen} />
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
