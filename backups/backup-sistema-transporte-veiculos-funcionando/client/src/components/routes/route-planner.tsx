import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useQuery } from "@tanstack/react-query";
import { insertRouteSchema } from "@shared/schema";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { Vehicle, Driver, InsertRoute } from "@shared/schema";

export default function RoutePlanner() {
  const { data: vehicles } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const form = useForm<InsertRoute>({
    resolver: zodResolver(insertRouteSchema),
    defaultValues: {
      origin: "",
      destination: "",
      vehicleId: null,
      driverId: null,
      status: "planned",
      scheduledAt: null,
    },
  });

  const onSubmit = (data: InsertRoute) => {
    console.log("Route data:", data);
    // TODO: Implement route creation
  };

  const availableVehicles = vehicles?.filter(v => v.status === "active") || [];
  const availableDrivers = drivers?.filter(d => d.status === "available") || [];

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Route Form */}
      <div className="lg:col-span-1">
        <Card className="border border-gray-100">
          <CardHeader>
            <CardTitle>Criar Nova Rota</CardTitle>
          </CardHeader>
          <CardContent>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div>
                <Label htmlFor="origin">Origem</Label>
                <Input
                  id="origin"
                  placeholder="Endereço de origem..."
                  {...form.register("origin")}
                />
              </div>
              
              <div>
                <Label htmlFor="destination">Destino</Label>
                <Input
                  id="destination"
                  placeholder="Endereço de destino..."
                  {...form.register("destination")}
                />
              </div>
              
              <div>
                <Label>Veículo</Label>
                <Select onValueChange={(value) => form.setValue("vehicleId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar veículo..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableVehicles.map((vehicle) => (
                      <SelectItem key={vehicle.id} value={vehicle.id}>
                        {vehicle.name} - {vehicle.plate}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label>Motorista</Label>
                <Select onValueChange={(value) => form.setValue("driverId", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar motorista..." />
                  </SelectTrigger>
                  <SelectContent>
                    {availableDrivers.map((driver) => (
                      <SelectItem key={driver.id} value={driver.id}>
                        {driver.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="date">Data</Label>
                  <Input
                    id="date"
                    type="date"
                    onChange={(e) => {
                      const date = e.target.value;
                      if (date) {
                        form.setValue("scheduledAt", new Date(date));
                      }
                    }}
                  />
                </div>
                <div>
                  <Label htmlFor="time">Horário</Label>
                  <Input id="time" type="time" />
                </div>
              </div>
              
              <Button type="submit" className="w-full bg-primary-600 hover:bg-primary-700">
                Calcular Rota
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>

      {/* Map Placeholder */}
      <div className="lg:col-span-2">
        <Card className="border border-gray-100 h-96">
          <CardContent className="h-full flex items-center justify-center">
            <div className="text-center">
              <div className="w-16 h-16 bg-gray-200 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg
                  className="w-8 h-8 text-gray-400"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"
                  />
                </svg>
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-2">Mapa de Rotas</h3>
              <p className="text-gray-600">Selecione origem e destino para visualizar a rota</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
