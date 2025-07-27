import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Route, Vehicle, Driver } from "@shared/schema";

export default function ActiveRoutesTable() {
  const { data: routes, isLoading } = useQuery<Route[]>({
    queryKey: ["/api/routes/active"],
  });

  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const getVehicleName = (vehicleId: string | null) => {
    if (!vehicleId || !vehicles) return "Sem veículo";
    const vehicle = vehicles.find(v => v.id === vehicleId);
    return vehicle ? `${vehicle.name}` : "Veículo não encontrado";
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId || !drivers) return "Sem motorista";
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name || "Motorista não encontrado";
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "planned":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Em Trânsito";
      case "planned":
        return "Aguardando";
      default:
        return "Concluída";
    }
  };

  // Mock progress data - in real app would be calculated from actual route progress
  const mockRoutes = [
    {
      id: "1",
      origin: "São Paulo",
      destination: "Rio de Janeiro",
      distance: "429",
      vehicleId: null,
      driverId: null,
      status: "active",
      progress: 65,
      eta: "14:30",
    },
    {
      id: "2",
      origin: "Belo Horizonte",
      destination: "Brasília",
      distance: "716",
      vehicleId: null,
      driverId: null,
      status: "planned",
      progress: 0,
      eta: "--:--",
    },
  ];

  if (isLoading) {
    return (
      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle>Rotas Ativas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-4">
            {[1, 2].map((i) => (
              <div key={i} className="h-16 bg-gray-200 rounded"></div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-100">
      <CardHeader>
        <CardTitle>Rotas Ativas</CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Rota
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Veículo
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motorista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Progresso
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  ETA
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {mockRoutes.map((route) => (
                <tr key={route.id}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">
                      {route.origin} → {route.destination}
                    </div>
                    <div className="text-sm text-gray-500">{route.distance} km</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getVehicleName(route.vehicleId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {getDriverName(route.driverId)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <Badge variant={getStatusColor(route.status)}>
                      {getStatusText(route.status)}
                    </Badge>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="w-full">
                      <Progress value={route.progress} className="w-full" />
                      <span className="text-xs text-gray-500 mt-1">
                        {route.progress}% completo
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {route.eta}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium space-x-3">
                    <Button variant="ghost" size="sm" className="text-primary-600 hover:text-primary-900">
                      {route.status === "planned" ? "Iniciar" : "Rastrear"}
                    </Button>
                    <Button variant="ghost" size="sm" className="text-gray-600 hover:text-gray-900">
                      Editar
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
