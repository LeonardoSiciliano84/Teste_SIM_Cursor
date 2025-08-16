import { useQuery } from "@tanstack/react-query";
import { Car, Users, MapPin, DollarSign, TrendingUp } from "lucide-react";
import StatsCard from "@/components/dashboard/stats-card";
import RevenueChart from "@/components/dashboard/revenue-chart";
import VehicleStatus from "@/components/dashboard/vehicle-status";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

type DashboardStats = {
  activeVehicles: number;
  totalDrivers: number;
  todayTrips: number;
  monthlyRevenue: number;
};

export default function Dashboard() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const dashboardStats: DashboardStats = (stats as DashboardStats) || {
    activeVehicles: 0,
    totalDrivers: 0,
    todayTrips: 0,
    monthlyRevenue: 0
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl p-6 border border-gray-100">
              <div className="h-20"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  const recentTrips = [
    {
      id: "1",
      origin: "São Paulo, SP",
      destination: "Rio de Janeiro, RJ",
      driver: "Carlos Silva",
      status: "Entregue",
      value: "R$ 2.450,00",
    },
    {
      id: "2",
      origin: "Belo Horizonte, MG",
      destination: "Brasília, DF",
      driver: "Maria Santos",
      status: "Em Trânsito",
      value: "R$ 1.850,00",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Veículos Ativos"
          value={dashboardStats.activeVehicles}
          change="+2.5% vs mês anterior"
          icon={Car}
          iconColor="bg-primary-100 text-primary-600"
          trend="up"
        />
        <StatsCard
          title="Motoristas"
          value={dashboardStats.totalDrivers}
          change="+1 novo esta semana"
          icon={Users}
          iconColor="bg-secondary-100 text-secondary-600"
          trend="up"
        />
        <StatsCard
          title="Viagens Hoje"
          value={dashboardStats.todayTrips}
          change="3 em andamento"
          icon={MapPin}
          iconColor="bg-warning-100 text-warning-600"
          trend="neutral"
        />
        <StatsCard
          title="Receita Mensal"
          value={`R$ ${((dashboardStats.monthlyRevenue) / 1000).toFixed(1)}k`}
          change="+12.3% vs mês anterior"
          icon={DollarSign}
          iconColor="bg-success-100 text-success-600"
          trend="up"
        />
      </div>

      {/* Charts and Vehicle Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        <RevenueChart />
        <VehicleStatus />
      </div>

      {/* Recent Trips */}
      <Card className="border border-gray-100">
        <CardHeader className="border-b border-gray-200">
          <div className="flex items-center justify-between">
            <CardTitle>Viagens Recentes</CardTitle>
            <Button variant="ghost" className="text-primary-600 hover:text-primary-700">
              Ver todas
            </Button>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Origem
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Destino
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motorista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Valor
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {recentTrips.map((trip) => (
                  <tr key={trip.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trip.origin}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{trip.destination}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {trip.driver}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                        trip.status === "Entregue" 
                          ? "bg-success-100 text-success-800"
                          : "bg-warning-100 text-warning-800"
                      }`}>
                        {trip.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      {trip.value}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
