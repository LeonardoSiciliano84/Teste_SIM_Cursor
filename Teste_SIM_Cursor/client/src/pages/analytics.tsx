import { useQuery } from "@tanstack/react-query";
import { Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import StatsCard from "@/components/dashboard/stats-card";
import AnalyticsCharts from "@/components/analytics/analytics-charts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DollarSign, CheckCircle, Fuel, Heart, Star } from "lucide-react";

export default function Analytics() {
  const { data: dashboardStats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Mock analytics data - in real app would come from API
  const analyticsStats = {
    totalRevenue: 128400,
    completedTrips: 245,
    fuelEfficiency: 8.2,
    customerSatisfaction: 4.8,
  };

  const driverPerformance = [
    {
      id: "1",
      name: "Carlos Silva",
      initials: "CS",
      trips: 45,
      revenue: 28500,
      efficiency: 95,
      rating: 4.9,
      status: "Excelente",
      color: "bg-primary-100 text-primary-600",
    },
    {
      id: "2",
      name: "Maria Santos",
      initials: "MS",
      trips: 38,
      revenue: 22100,
      efficiency: 88,
      rating: 4.7,
      status: "Muito Bom",
      color: "bg-secondary-100 text-secondary-600",
    },
    {
      id: "3",
      name: "José Oliveira",
      initials: "JO",
      trips: 32,
      revenue: 19800,
      efficiency: 75,
      rating: 4.3,
      status: "Bom",
      color: "bg-warning-100 text-warning-600",
    },
  ];

  const getEfficiencyColor = (efficiency: number) => {
    if (efficiency >= 90) return "bg-success-500";
    if (efficiency >= 75) return "bg-warning-500";
    return "bg-error-500";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Excelente":
        return "default";
      case "Muito Bom":
        return "secondary";
      default:
        return "outline";
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Análises e Relatórios</h2>
        <div className="flex space-x-3">
          <Select defaultValue="30days">
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="30days">Últimos 30 dias</SelectItem>
              <SelectItem value="3months">Últimos 3 meses</SelectItem>
              <SelectItem value="year">Este ano</SelectItem>
            </SelectContent>
          </Select>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Download className="w-4 h-4 mr-2" />
            Exportar
          </Button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatsCard
          title="Receita Total"
          value={`R$ ${(analyticsStats.totalRevenue / 1000).toFixed(1)}k`}
          change="+18.2% vs período anterior"
          icon={DollarSign}
          iconColor="bg-success-100 text-success-600"
          trend="up"
        />
        <StatsCard
          title="Viagens Completadas"
          value={analyticsStats.completedTrips}
          change="+12.5% vs período anterior"
          icon={CheckCircle}
          iconColor="bg-primary-100 text-primary-600"
          trend="up"
        />
        <StatsCard
          title="Eficiência de Combustível"
          value={`${analyticsStats.fuelEfficiency}L`}
          change="-5.3% consumo médio/100km"
          icon={Fuel}
          iconColor="bg-secondary-100 text-secondary-600"
          trend="up"
        />
        <StatsCard
          title="Satisfação do Cliente"
          value={`${analyticsStats.customerSatisfaction}/5`}
          change="95% avaliações positivas"
          icon={Heart}
          iconColor="bg-warning-100 text-warning-600"
          trend="up"
        />
      </div>

      {/* Charts */}
      <AnalyticsCharts />

      {/* Performance Table */}
      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle>Performance por Motorista</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motorista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Viagens
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Receita
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Eficiência
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Avaliação
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {driverPerformance.map((driver) => (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${driver.color}`}>
                          <span className="text-sm font-medium">{driver.initials}</span>
                        </div>
                        <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {driver.trips}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      R$ {(driver.revenue / 1000).toFixed(1)}k
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                          <div 
                            className={`h-2 rounded-full ${getEfficiencyColor(driver.efficiency)}`}
                            style={{ width: `${driver.efficiency}%` }}
                          ></div>
                        </div>
                        <span className="text-sm text-gray-600">{driver.efficiency}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <span className="text-sm text-gray-900 mr-1">{driver.rating}</span>
                        <Star className="w-4 h-4 text-yellow-400 fill-current" />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <Badge variant={getStatusColor(driver.status)}>
                        {driver.status}
                      </Badge>
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
