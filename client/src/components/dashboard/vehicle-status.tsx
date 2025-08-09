import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { Vehicle, Driver } from "../../types/mock";

export default function VehicleStatus() {
  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers, isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  if (vehiclesLoading || driversLoading) {
    return (
      <Card className="border border-gray-100">
        <CardHeader>
          <CardTitle>Status dos Veículos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="animate-pulse flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center">
                  <div className="w-3 h-3 bg-gray-300 rounded-full mr-3"></div>
                  <div>
                    <div className="h-4 bg-gray-300 rounded w-32 mb-1"></div>
                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                  </div>
                </div>
                <div className="h-5 bg-gray-300 rounded w-16"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-success-500";
      case "maintenance":
        return "bg-warning-500";
      default:
        return "bg-gray-400";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Em Rota";
      case "maintenance":
        return "Manutenção";
      default:
        return "Parado";
    }
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "maintenance":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getDriverName = (driverId: string | null) => {
    if (!driverId || !drivers) return "Sem motorista";
    const driver = drivers.find(d => d.id === driverId);
    return driver?.name || "Motorista não encontrado";
  };

  return (
    <Card className="border border-gray-100">
      <CardHeader>
        <CardTitle>Status dos Veículos</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {vehicles?.slice(0, 3).map((vehicle) => (
            <div key={vehicle.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center">
                <div className={`w-3 h-3 rounded-full mr-3 ${getStatusColor(vehicle.status)}`}></div>
                <div>
                  <p className="font-medium text-gray-900">
                    {vehicle.name} - {vehicle.plate}
                  </p>
                  <p className="text-sm text-gray-600">{getDriverName(vehicle.driverId)}</p>
                </div>
              </div>
              <Badge variant={getStatusVariant(vehicle.status)}>
                {getStatusText(vehicle.status)}
              </Badge>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
