import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import VehicleFilters from "@/components/vehicles/vehicle-filters";
import VehicleCard from "@/components/vehicles/vehicle-card";
import type { Vehicle, Driver } from "@shared/schema";

export default function Vehicles() {
  const [filters, setFilters] = useState({
    type: "all",
    status: "all",
    search: "",
  });

  const { data: vehicles, isLoading: vehiclesLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const filteredVehicles = vehicles?.filter(vehicle => {
    const matchesType = filters.type === "all" || vehicle.type === filters.type;
    const matchesStatus = filters.status === "all" || vehicle.status === filters.status;
    const matchesSearch = !filters.search || 
      vehicle.plate.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.name.toLowerCase().includes(filters.search.toLowerCase()) ||
      vehicle.model.toLowerCase().includes(filters.search.toLowerCase());
    
    return matchesType && matchesStatus && matchesSearch;
  });

  const getDriverForVehicle = (driverId: string | null) => {
    if (!driverId || !drivers) return undefined;
    return drivers.find(driver => driver.id === driverId);
  };

  const handleEdit = (vehicle: Vehicle) => {
    // TODO: Implement edit functionality
    console.log("Edit vehicle:", vehicle);
  };

  const handleViewDetails = (vehicle: Vehicle) => {
    // TODO: Implement view details functionality
    console.log("View details:", vehicle);
  };

  if (vehiclesLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold text-gray-900">Gestão de Veículos</h2>
          <Button disabled>
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Veículo
          </Button>
        </div>
        
        <div className="animate-pulse bg-white rounded-xl p-6 border border-gray-100">
          <div className="h-20"></div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="animate-pulse bg-white rounded-xl border border-gray-100 overflow-hidden">
              <div className="h-48 bg-gray-200"></div>
              <div className="p-6">
                <div className="h-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Veículos</h2>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Veículo
        </Button>
      </div>

      <VehicleFilters filters={filters} onFilterChange={handleFilterChange} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredVehicles?.map((vehicle) => (
          <VehicleCard
            key={vehicle.id}
            vehicle={vehicle}
            driver={getDriverForVehicle(vehicle.driverId)}
            onEdit={handleEdit}
            onViewDetails={handleViewDetails}
          />
        ))}
      </div>

      {filteredVehicles?.length === 0 && (
        <div className="text-center py-12">
          <div className="text-gray-500 mb-4">Nenhum veículo encontrado</div>
          <Button className="bg-primary-600 hover:bg-primary-700">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Primeiro Veículo
          </Button>
        </div>
      )}
    </div>
  );
}
