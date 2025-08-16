import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { 
  Maximize2, 
  Minimize2, 
  Car, 
  Clock, 
  Calendar,
  AlertTriangle,
  Wrench,
  RefreshCw
} from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";

interface ParkedVehicle {
  id: string;
  plate: string;
  classification: string;
  maintenanceType: string;
  stoppedDate: string;
  expectedReleaseDate?: string;
  daysParked: number;
  status: 'Em Manutenção';
}

export default function VehiclesParked() {
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  // Atualizar horário a cada minuto
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000);

    return () => clearInterval(timer);
  }, []);

  // Query para buscar veículos em manutenção
  const { data: parkedVehicles = [], isLoading, refetch } = useQuery<ParkedVehicle[]>({
    queryKey: ['/api/vehicles/parked'],
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  const toggleFullscreen = () => {
    if (!isFullscreen) {
      document.documentElement.requestFullscreen?.();
    } else {
      document.exitFullscreen?.();
    }
    setIsFullscreen(!isFullscreen);
  };

  const getMaintenanceTypeColor = (type: string) => {
    const types: Record<string, string> = {
      'Preventiva': 'bg-blue-100 text-blue-800',
      'Corretiva': 'bg-red-100 text-red-800',
      'Emergencial': 'bg-orange-100 text-orange-800',
      'Revisão': 'bg-green-100 text-green-800'
    };
    return types[type] || 'bg-gray-100 text-gray-800';
  };

  const getDaysParkedColor = (days: number) => {
    if (days <= 2) return 'text-green-600';
    if (days <= 5) return 'text-yellow-600';
    if (days <= 10) return 'text-orange-600';
    return 'text-red-600';
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <RefreshCw className="w-12 h-12 animate-spin text-blue-600 mx-auto mb-4" />
          <p className="text-xl text-gray-600">Carregando veículos parados...</p>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen bg-gradient-to-br from-blue-50 to-slate-100 ${isFullscreen ? 'fixed inset-0 z-50' : ''}`}>
      {/* Header */}
      <div className="bg-white border-b border-gray-200 shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-12 h-12 bg-[#0C29AB] rounded-lg flex items-center justify-center">
                  <Car className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl lg:text-3xl font-bold text-gray-900">
                    Veículos Parados - Logística
                  </h1>
                  <p className="text-sm text-gray-600">
                    Monitoramento em tempo real • Atualizado em {format(currentTime, "HH:mm", { locale: ptBR })}
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <p className="text-lg font-semibold text-gray-900">
                  {format(currentTime, "EEEE, dd/MM/yyyy", { locale: ptBR })}
                </p>
                <p className="text-2xl font-bold text-[#0C29AB]">
                  {format(currentTime, "HH:mm", { locale: ptBR })}
                </p>
              </div>
              
              <Button
                onClick={toggleFullscreen}
                variant="outline"
                size="lg"
                className="border-[#0C29AB] text-[#0C29AB] hover:bg-[#0C29AB] hover:text-white"
              >
                {isFullscreen ? (
                  <>
                    <Minimize2 className="w-5 h-5 mr-2" />
                    Sair Tela Cheia
                  </>
                ) : (
                  <>
                    <Maximize2 className="w-5 h-5 mr-2" />
                    Tela Cheia
                  </>
                )}
              </Button>
              
              <Button
                onClick={() => refetch()}
                size="lg"
                className="bg-[#0C29AB] hover:bg-[#0C29AB]/90 text-white"
              >
                <RefreshCw className="w-5 h-5 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="px-6 py-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="p-6 bg-gradient-to-r from-red-500 to-red-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-red-100 text-sm font-medium">Total Parados</p>
                <p className="text-3xl font-bold">{parkedVehicles.length}</p>
              </div>
              <AlertTriangle className="w-10 h-10 text-red-200" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-orange-500 to-orange-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm font-medium">Mais de 5 Dias</p>
                <p className="text-3xl font-bold">
                  {parkedVehicles.filter(v => v.daysParked > 5).length}
                </p>
              </div>
              <Clock className="w-10 h-10 text-orange-200" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-blue-500 to-blue-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm font-medium">Em Manutenção</p>
                <p className="text-3xl font-bold">
                  {parkedVehicles.filter(v => v.status === 'Em Manutenção').length}
                </p>
              </div>
              <Wrench className="w-10 h-10 text-blue-200" />
            </div>
          </Card>
          
          <Card className="p-6 bg-gradient-to-r from-purple-500 to-purple-600 text-white">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm font-medium">Média Dias</p>
                <p className="text-3xl font-bold">
                  {parkedVehicles.length > 0 
                    ? Math.round(parkedVehicles.reduce((acc, v) => acc + v.daysParked, 0) / parkedVehicles.length)
                    : 0
                  }
                </p>
              </div>
              <Calendar className="w-10 h-10 text-purple-200" />
            </div>
          </Card>
        </div>

        {/* Vehicles Grid */}
        {parkedVehicles.length === 0 ? (
          <Card className="p-12 text-center">
            <Car className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-600 mb-2">
              Nenhum veículo parado
            </h3>
            <p className="text-gray-500">
              Todos os veículos estão operacionais no momento
            </p>
          </Card>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {parkedVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="p-6 hover:shadow-lg transition-shadow duration-200 border-l-4 border-l-red-500">
                <div className="space-y-4">
                  {/* Header */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                        <Car className="w-5 h-5 text-gray-600" />
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{vehicle.plate}</h3>
                        <p className="text-sm text-gray-600">{vehicle.classification}</p>
                      </div>
                    </div>
                    <Badge variant="destructive" className="bg-red-100 text-red-800">
                      PARADO
                    </Badge>
                  </div>

                  {/* Maintenance Type */}
                  <div>
                    <Badge className={getMaintenanceTypeColor(vehicle.maintenanceType)}>
                      {vehicle.maintenanceType}
                    </Badge>
                  </div>

                  {/* Days Parked */}
                  <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Dias parado:</span>
                      <span className={`text-2xl font-bold ${getDaysParkedColor(vehicle.daysParked)}`}>
                        {vehicle.daysParked}
                      </span>
                    </div>
                  </div>

                  {/* Dates */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Data parada:</span>
                      <span className="font-medium">
                        {format(new Date(vehicle.stoppedDate), "dd/MM/yyyy", { locale: ptBR })}
                      </span>
                    </div>
                    
                    {vehicle.expectedReleaseDate && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-gray-600">Previsão liberação:</span>
                        <span className="font-medium text-green-600">
                          {format(new Date(vehicle.expectedReleaseDate), "dd/MM/yyyy", { locale: ptBR })}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}