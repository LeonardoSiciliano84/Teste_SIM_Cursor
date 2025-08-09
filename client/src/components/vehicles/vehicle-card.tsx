import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Hash, Calendar, User, MapPin } from "lucide-react";
import type { Vehicle, Driver } from "../../types/mock";

interface VehicleCardProps {
  vehicle: Vehicle;
  driver?: Driver;
  onEdit: (vehicle: Vehicle) => void;
  onViewDetails: (vehicle: Vehicle) => void;
}

export default function VehicleCard({ vehicle, driver, onEdit, onViewDetails }: VehicleCardProps) {
  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "default";
      case "maintenance":
        return "secondary";
      default:
        return "outline";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "active":
        return "Ativo";
      case "maintenance":
        return "Manutenção";
      default:
        return "Inativo";
    }
  };

  const getVehicleImage = (type: string) => {
    switch (type) {
      case "truck":
        return "https://images.unsplash.com/photo-1601584115197-04ecc0da31d7?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200";
      case "van":
        return "https://images.unsplash.com/photo-1586861203927-800a5acdcc4d?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200";
      default:
        return "https://images.unsplash.com/photo-1580674285054-bed31e145f59?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=200";
    }
  };

  return (
    <Card className="border border-gray-100 overflow-hidden">
      <img 
        src={getVehicleImage(vehicle.type)} 
        alt={`${vehicle.name}`}
        className="w-full h-48 object-cover"
      />
      
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900">{vehicle.name}</h3>
          <Badge variant={getStatusColor(vehicle.status)}>
            {getStatusText(vehicle.status)}
          </Badge>
        </div>
        
        <div className="space-y-2 mb-4">
          <div className="flex items-center text-sm text-gray-600">
            <Hash className="w-4 h-4 mr-2" />
            <span>{vehicle.plate}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <Calendar className="w-4 h-4 mr-2" />
            <span>{vehicle.year}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <User className="w-4 h-4 mr-2" />
            <span>{driver?.name || "Sem motorista"}</span>
          </div>
          <div className="flex items-center text-sm text-gray-600">
            <MapPin className="w-4 h-4 mr-2" />
            <span>{vehicle.currentLocation || "Localização não definida"}</span>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            className="flex-1 text-primary-600 border-primary-600 hover:bg-primary-50"
            onClick={() => onEdit(vehicle)}
          >
            Editar
          </Button>
          <Button 
            className="flex-1 bg-primary-600 hover:bg-primary-700"
            onClick={() => onViewDetails(vehicle)}
          >
            Ver Detalhes
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
