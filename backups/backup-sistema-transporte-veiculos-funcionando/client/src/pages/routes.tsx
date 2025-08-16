import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import RoutePlanner from "@/components/routes/route-planner";
import ActiveRoutesTable from "@/components/routes/active-routes-table";

export default function Routes() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Planejamento de Rotas</h2>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Rota
        </Button>
      </div>

      {/* Route Planning Interface */}
      <RoutePlanner />

      {/* Active Routes */}
      <ActiveRoutesTable />
    </div>
  );
}
