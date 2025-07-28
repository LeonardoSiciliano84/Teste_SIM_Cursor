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
import { OccurrencesPage } from "@/pages/occurrences";
import DriverPortal from "@/pages/driver-portal";
import DriverLogin from "@/pages/driver-login";
import PranchaManagement from "@/pages/prancha-management";
import Sidebar from "@/components/layout/sidebar";
import Header from "@/components/layout/header";
import VehicleEdit from "@/components/vehicles/vehicle-edit";
import NotFound from "@/pages/not-found";

function Router() {
  return (
    <Switch>
      <Route path="/" component={Dashboard} />
      <Route path="/vehicles" component={Vehicles} />
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
      <Route path="/routes" component={Routes} />
      <Route path="/bookings" component={Bookings} />
      <Route path="/analytics" component={Analytics} />
      <Route component={NotFound} />
    </Switch>
  );
}

function AuthenticatedApp() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="flex">
        <Sidebar />
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

  useEffect(() => {
    const unsubscribe = authManager.subscribe(setAuthState);
    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        {authState.isAuthenticated ? <AuthenticatedApp /> : <Login />}
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
