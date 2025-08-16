import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Car, 
  Calendar as CalendarIcon,
  Filter,
  Search,
  CheckCircle,
  AlertTriangle,
  XCircle,
  MapPin,
  User,
  Plus
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { cn } from "@/lib/utils";

interface PreventiveMaintenanceVehicle {
  id: string;
  plate: string;
  vehicleType: string;
  classification: string;
  name?: string;
  brand?: string;
  model?: string;
  priority?: number;
  lastMaintenanceDate?: string;
  lastMaintenanceKm?: number;
  currentKm: number;
  kmToNextMaintenance: number;
  maintenanceInterval: number;
  status: 'em_dia' | 'programar_revisao' | 'em_revisao' | 'agendado';
  scheduledMaintenance?: any;
  lastOrdem?: number;
  lastCategoria?: string;
  nextOrdem?: number;
  nextCategoria?: string;
}

interface Employee {
  id: string;
  fullName: string;
  position: string;
}

interface ScheduleMaintenanceData {
  vehicleId: string;
  driverId: string;
  location: 'oficina_interna' | 'oficina_externa';
  scheduledDate: string;
}

export default function PreventiveMaintenance() {
  const [filters, setFilters] = useState({
    vehicle: "",
    vehicleType: "",
    status: ""
  });
  const [selectedVehicle, setSelectedVehicle] = useState<PreventiveMaintenanceVehicle | null>(null);
  const [selectedDriver, setSelectedDriver] = useState("");
  const [selectedLocation, setSelectedLocation] = useState("");
  const [selectedDate, setSelectedDate] = useState<Date>();
  const [driverSearch, setDriverSearch] = useState("");
  const [isScheduleModalOpen, setIsScheduleModalOpen] = useState(false);
  const [isViewScheduleModalOpen, setIsViewScheduleModalOpen] = useState(false);
  const [isCompleteMaintenanceModalOpen, setIsCompleteMaintenanceModalOpen] = useState(false);
  const [selectedScheduledVehicle, setSelectedScheduledVehicle] = useState<PreventiveMaintenanceVehicle | null>(null);
  const [completionData, setCompletionData] = useState({
    newKm: '',
    maintenanceDate: '',
    location: '',
    ordem: '',
    categoria: '',
    notes: ''
  });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar veículos para manutenção preventiva
  const { data: vehicles = [], isLoading, error } = useQuery<PreventiveMaintenanceVehicle[]>({
    queryKey: ['/api/preventive-maintenance/vehicles'],
    refetchInterval: 60000, // Atualizar a cada minuto
  });



  // Buscar funcionários/motoristas
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ['/api/employees'],
  });

  // Mutation para agendar manutenção
  const scheduleMaintenanceMutation = useMutation({
    mutationFn: async (data: ScheduleMaintenanceData) => {
      return apiRequest('/api/preventive-maintenance/schedule', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Agendamento realizado",
        description: "A manutenção preventiva foi agendada e o motorista foi notificado.",
        variant: "default",
      });
      setIsScheduleModalOpen(false);
      setSelectedVehicle(null);
      setSelectedDriver("");
      setSelectedLocation("");
      setSelectedDate(undefined);
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-maintenance/vehicles'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro no agendamento",
        description: error.message || "Não foi possível agendar a manutenção.",
        variant: "destructive",
      });
    },
  });

  // Mutation para registrar manutenção concluída
  const completeMaintenanceMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/preventive-maintenance/complete', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Manutenção registrada",
        description: "A manutenção foi registrada e o veículo voltou ao status 'Em dia'.",
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/preventive-maintenance/vehicles'] });
      setIsCompleteMaintenanceModalOpen(false);
      setSelectedScheduledVehicle(null);
      setCompletionData({ newKm: '', maintenanceDate: '', location: '', ordem: '', categoria: '', notes: '' });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao registrar",
        description: error.message || "Não foi possível registrar a manutenção.",
        variant: "destructive",
      });
    },
  });

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'agendado':
        return {
          icon: CalendarIcon,
          label: 'Agendado',
          color: 'bg-blue-100 text-blue-800',
          description: 'Manutenção preventiva agendada'
        };
      case 'em_revisao':
        return {
          icon: XCircle,
          label: 'Em revisão',
          color: 'bg-red-100 text-red-800',
          description: 'Manutenção vencida - Prioridade máxima'
        };
      case 'programar_revisao':
        return {
          icon: AlertTriangle,
          label: 'Programar revisão',
          color: 'bg-yellow-100 text-yellow-800',
          description: '2.000 a 3.000 km para próxima preventiva'
        };
      case 'em_dia':
        return {
          icon: CheckCircle,
          label: 'Em dia',
          color: 'bg-green-100 text-green-800',
          description: 'Mais de 3.000 km para próxima preventiva'
        };
      default:
        return {
          icon: CheckCircle,
          label: 'Normal',
          color: 'bg-gray-100 text-gray-800',
          description: ''
        };
    }
  };

  // Filtrar veículos
  const filteredVehicles = vehicles.filter(vehicle => {
    return (
      (!filters.vehicle || vehicle.plate.toLowerCase().includes(filters.vehicle.toLowerCase())) &&
      (!filters.vehicleType || filters.vehicleType === 'all' || vehicle.vehicleType === filters.vehicleType) &&
      (!filters.status || filters.status === 'all' || vehicle.status === filters.status)
    );
  });

  // Filtrar motoristas - mostrar apenas funcionários que são motoristas
  const filteredDrivers = employees.filter(emp => 
    emp.position.toLowerCase().includes('motorista') &&
    emp.fullName.toLowerCase().includes(driverSearch.toLowerCase())
  );

  const handleSchedule = (vehicle: PreventiveMaintenanceVehicle) => {
    setSelectedVehicle(vehicle);
    setSelectedDriver("");
    setDriverSearch("");
    setSelectedLocation("");
    setSelectedDate(undefined);
    setIsScheduleModalOpen(true);
  };

  const handleViewSchedule = (vehicle: PreventiveMaintenanceVehicle) => {
    setSelectedScheduledVehicle(vehicle);
    setIsViewScheduleModalOpen(true);
  };

  const handleCompleteMaintenance = (vehicle: PreventiveMaintenanceVehicle) => {
    setSelectedScheduledVehicle(vehicle);
    setCompletionData({
      newKm: '',
      maintenanceDate: format(new Date(), 'yyyy-MM-dd'),
      location: '',
      ordem: vehicle.nextOrdem?.toString() || '1',
      categoria: vehicle.nextCategoria || 'M1',
      notes: ''
    });
    setIsCompleteMaintenanceModalOpen(true);
  };

  const handleCompleteMaintenanceSubmit = () => {
    if (!selectedScheduledVehicle || !completionData.newKm || !completionData.maintenanceDate || !completionData.location || !completionData.ordem || !completionData.categoria) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios, incluindo ordem e categoria M.",
        variant: "destructive",
      });
      return;
    }

    completeMaintenanceMutation.mutate({
      vehicleId: selectedScheduledVehicle.id,
      newKm: parseInt(completionData.newKm),
      maintenanceDate: completionData.maintenanceDate,
      location: completionData.location,
      ordem: parseInt(completionData.ordem),
      categoria: completionData.categoria,
      notes: completionData.notes
    });
  };

  const handleScheduleSubmit = () => {
    if (!selectedVehicle || !selectedDriver || !selectedLocation || !selectedDate) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos para agendar a manutenção.",
        variant: "destructive",
      });
      return;
    }

    const dataToSend = {
      vehicleId: selectedVehicle.id,
      driverId: selectedDriver,
      location: selectedLocation as 'oficina_interna' | 'oficina_externa',
      scheduledDate: format(selectedDate, 'yyyy-MM-dd'),
    };
    
    console.log('Enviando dados para agendamento:', dataToSend);
    console.log('Veículo selecionado:', selectedVehicle);
    console.log('Motorista selecionado ID:', selectedDriver);

    scheduleMaintenanceMutation.mutate(dataToSend);
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Manutenção Preventiva</h1>
          <p className="text-gray-600">Controle e agendamento de manutenções preventivas</p>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="vehicle-filter">Veículo (Placa)</Label>
              <Input
                id="vehicle-filter"
                placeholder="Digite a placa..."
                value={filters.vehicle}
                onChange={(e) => setFilters(prev => ({ ...prev, vehicle: e.target.value }))}
              />
            </div>
            <div>
              <Label htmlFor="type-filter">Tipo de Veículo</Label>
              <Select value={filters.vehicleType} onValueChange={(value) => setFilters(prev => ({ ...prev, vehicleType: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="Caminhão">Caminhão</SelectItem>
                  <SelectItem value="Carreta">Carreta</SelectItem>
                  <SelectItem value="Bitrem">Bitrem</SelectItem>
                  <SelectItem value="Van">Van</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="status-filter">Status da Manutenção</Label>
              <Select value={filters.status} onValueChange={(value) => setFilters(prev => ({ ...prev, status: value }))}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="agendado">Agendado</SelectItem>
                  <SelectItem value="em_revisao">Em revisão</SelectItem>
                  <SelectItem value="programar_revisao">Programar revisão</SelectItem>
                  <SelectItem value="em_dia">Em dia</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Veículos */}
      <div className="space-y-4">
        {filteredVehicles.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center">
              <Car className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhum veículo encontrado
              </h3>
              <p className="text-gray-500">
                Ajuste os filtros para visualizar os veículos disponíveis
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredVehicles.map((vehicle) => {
            const statusInfo = getStatusInfo(vehicle.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card key={vehicle.id} className="hover:shadow-md transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-6">
                      {/* Placa e Info do Veículo */}
                      <div className="flex items-center space-x-3">
                        <div className="w-12 h-12 bg-[#0C29AB] rounded-lg flex items-center justify-center">
                          <Car className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <h3 className="text-lg font-bold text-gray-900">{vehicle.plate}</h3>
                          <p className="text-sm text-gray-600">{vehicle.vehicleType} • {vehicle.classification}</p>
                        </div>
                      </div>

                      {/* Dados de Manutenção */}
                      <div className="grid grid-cols-4 gap-6">
                        <div>
                          <p className="text-xs text-gray-500">Última Preventiva</p>
                          <p className="font-semibold">
                            {vehicle.lastMaintenanceDate 
                              ? format(new Date(vehicle.lastMaintenanceDate), "dd/MM/yyyy", { locale: ptBR })
                              : "N/A"
                            }
                          </p>
                          <p className="text-xs text-gray-600">
                            {vehicle.lastMaintenanceKm ? `${vehicle.lastMaintenanceKm.toLocaleString()} km` : "N/A"}
                          </p>
                          {vehicle.lastOrdem && vehicle.lastCategoria && (
                            <p className="text-xs text-blue-600 font-medium">
                              Ordem {vehicle.lastOrdem} • {vehicle.lastCategoria}
                            </p>
                          )}
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">KM Atual</p>
                          <p className="font-semibold">{vehicle.currentKm.toLocaleString()} km</p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">KM Restante</p>
                          <p className={`font-semibold ${vehicle.kmToNextMaintenance < 0 ? 'text-red-600' : vehicle.kmToNextMaintenance <= 1000 ? 'text-yellow-600' : 'text-green-600'}`}>
                            {vehicle.kmToNextMaintenance < 0 ? 'VENCIDO' : `${vehicle.kmToNextMaintenance.toLocaleString()} km`}
                          </p>
                        </div>
                        <div>
                          <p className="text-xs text-gray-500">Próxima Manutenção</p>
                          <p className="font-semibold text-[#0C29AB]">
                            Ordem {vehicle.nextOrdem || 1} • {vehicle.nextCategoria || 'M1'}
                          </p>
                          <p className="text-xs text-gray-600">Programada</p>
                        </div>
                      </div>
                    </div>

                    {/* Status e Ação */}
                    <div className="flex items-center space-x-4">
                      <div className="text-center">
                        <Badge className={statusInfo.color}>
                          <StatusIcon className="w-4 h-4 mr-1" />
                          {statusInfo.label}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">{statusInfo.description}</p>
                      </div>
                      
                      {vehicle.status === 'agendado' ? (
                        <div className="space-x-2">
                          <Button 
                            onClick={() => handleViewSchedule(vehicle)}
                            variant="outline"
                            size="sm"
                          >
                            <CalendarIcon className="w-4 h-4 mr-2" />
                            Ver Agendamento
                          </Button>
                          <Button 
                            onClick={() => handleCompleteMaintenance(vehicle)}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <CheckCircle className="w-4 h-4 mr-2" />
                            Registrar Conclusão
                          </Button>
                        </div>
                      ) : (
                        <Button 
                          onClick={() => handleSchedule(vehicle)}
                          className="bg-[#0C29AB] hover:bg-[#0C29AB]/90"
                        >
                          <CalendarIcon className="w-4 h-4 mr-2" />
                          Agendar
                        </Button>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Agendamento */}
      <Dialog open={isScheduleModalOpen} onOpenChange={setIsScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5" />
              Agendar Manutenção Preventiva
            </DialogTitle>
          </DialogHeader>
          
          {selectedVehicle && (
            <div className="space-y-4">
              {/* Info do Veículo */}
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="font-semibold text-gray-900">{selectedVehicle.plate}</p>
                <p className="text-sm text-gray-600">{selectedVehicle.vehicleType} • {selectedVehicle.classification}</p>
              </div>

              {/* Seleção do Motorista */}
              <div>
                <Label htmlFor="driver-search">Motorista</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    id="driver-search"
                    placeholder="Buscar motorista..."
                    value={driverSearch}
                    onChange={(e) => setDriverSearch(e.target.value)}
                    className="pl-10"
                  />
                </div>
                {driverSearch && !selectedDriver && (
                  <div className="mt-2 max-h-32 overflow-y-auto border rounded-md bg-white z-10">
                    {filteredDrivers.length > 0 ? (
                      filteredDrivers.map((driver) => (
                        <button
                          key={driver.id}
                          onClick={() => {
                            setSelectedDriver(driver.id);
                            setDriverSearch(driver.fullName);
                          }}
                          className="w-full text-left px-3 py-2 hover:bg-gray-100 flex items-center gap-2"
                        >
                          <User className="w-4 h-4" />
                          <div>
                            <p className="font-medium">{driver.fullName}</p>
                            <p className="text-xs text-gray-500">{driver.position}</p>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="px-3 py-2 text-gray-500 text-sm">
                        Nenhum motorista encontrado
                      </div>
                    )}
                  </div>
                )}
                {selectedDriver && (
                  <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded-md flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-green-600" />
                      <span className="text-sm font-medium text-green-800">{driverSearch}</span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setSelectedDriver("");
                        setDriverSearch("");
                      }}
                      className="h-6 w-6 p-0"
                    >
                      ×
                    </Button>
                  </div>
                )}
              </div>

              {/* Local da Manutenção */}
              <div>
                <Label htmlFor="location">Local da Manutenção</Label>
                <Select value={selectedLocation} onValueChange={setSelectedLocation}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o local" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="oficina_interna">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Oficina Interna
                      </div>
                    </SelectItem>
                    <SelectItem value="oficina_externa">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        Oficina Externa
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Data da Manutenção */}
              <div>
                <Label>Data da Manutenção</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button
                      variant="outline"
                      className={cn(
                        "w-full justify-start text-left font-normal",
                        !selectedDate && "text-muted-foreground"
                      )}
                    >
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {selectedDate ? format(selectedDate, "dd/MM/yyyy", { locale: ptBR }) : "Selecione a data"}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0">
                    <Calendar
                      mode="single"
                      selected={selectedDate}
                      onSelect={setSelectedDate}
                      initialFocus
                      disabled={(date) => date < new Date()}
                      locale={ptBR}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              {/* Botões */}
              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsScheduleModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleScheduleSubmit}
                  disabled={scheduleMaintenanceMutation.isPending}
                  className="flex-1 bg-[#0C29AB] hover:bg-[#0C29AB]/90"
                >
                  {scheduleMaintenanceMutation.isPending ? "Agendando..." : "Agendar"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Visualizar Agendamento */}
      <Dialog open={isViewScheduleModalOpen} onOpenChange={setIsViewScheduleModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-blue-600" />
              Agendamento de Manutenção
            </DialogTitle>
          </DialogHeader>
          
          {selectedScheduledVehicle && (
            <div className="space-y-4">
              <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                <h3 className="font-semibold text-blue-900">{selectedScheduledVehicle.plate}</h3>
                <p className="text-sm text-blue-700">{selectedScheduledVehicle.vehicleType} • {selectedScheduledVehicle.classification}</p>
              </div>

              {selectedScheduledVehicle.scheduledMaintenance && (
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Data Agendada</Label>
                    <p className="text-sm">{format(new Date(selectedScheduledVehicle.scheduledMaintenance.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Motorista</Label>
                    <p className="text-sm">{selectedScheduledVehicle.scheduledMaintenance.driverName}</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Local</Label>
                    <p className="text-sm">{selectedScheduledVehicle.scheduledMaintenance.location === 'oficina_interna' ? 'Oficina Interna' : 'Oficina Externa'}</p>
                  </div>
                </div>
              )}

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsViewScheduleModalOpen(false)}
                  className="flex-1"
                >
                  Fechar
                </Button>
                <Button 
                  onClick={() => {
                    setIsViewScheduleModalOpen(false);
                    handleCompleteMaintenance(selectedScheduledVehicle);
                  }}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  Registrar Conclusão
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal para Registrar Conclusão */}
      <Dialog open={isCompleteMaintenanceModalOpen} onOpenChange={setIsCompleteMaintenanceModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              Registrar Manutenção Concluída
            </DialogTitle>
          </DialogHeader>
          
          {selectedScheduledVehicle && (
            <div className="space-y-4">
              <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                <h3 className="font-semibold text-green-900">{selectedScheduledVehicle.plate}</h3>
                <p className="text-sm text-green-700">{selectedScheduledVehicle.vehicleType} • {selectedScheduledVehicle.classification}</p>
              </div>

              <div className="space-y-3">
                <div>
                  <Label htmlFor="new-km">Nova Quilometragem *</Label>
                  <Input
                    id="new-km"
                    type="number"
                    placeholder="Ex: 150000"
                    value={completionData.newKm}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, newKm: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="maintenance-date">Data da Manutenção *</Label>
                  <Input
                    id="maintenance-date"
                    type="date"
                    value={completionData.maintenanceDate}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, maintenanceDate: e.target.value }))}
                  />
                </div>

                <div>
                  <Label htmlFor="location">Local da Manutenção *</Label>
                  <Select value={completionData.location} onValueChange={(value) => setCompletionData(prev => ({ ...prev, location: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o local" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="oficina_interna">Oficina Interna</SelectItem>
                      <SelectItem value="oficina_externa">Oficina Externa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <Label htmlFor="ordem">Ordem *</Label>
                    <Select value={completionData.ordem} onValueChange={(value) => setCompletionData(prev => ({ ...prev, ordem: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Ordem" />
                      </SelectTrigger>
                      <SelectContent>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map(num => (
                          <SelectItem key={num} value={num.toString()}>{num}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="categoria">Categoria M *</Label>
                    <Select value={completionData.categoria} onValueChange={(value) => setCompletionData(prev => ({ ...prev, categoria: value }))}>
                      <SelectTrigger>
                        <SelectValue placeholder="Categoria" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="M1">M1</SelectItem>
                        <SelectItem value="M2">M2</SelectItem>
                        <SelectItem value="M3">M3</SelectItem>
                        <SelectItem value="M4">M4</SelectItem>
                        <SelectItem value="M5">M5</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div>
                  <Label htmlFor="notes">Observações</Label>
                  <Input
                    id="notes"
                    placeholder="Observações sobre a manutenção realizada..."
                    value={completionData.notes}
                    onChange={(e) => setCompletionData(prev => ({ ...prev, notes: e.target.value }))}
                  />
                </div>
              </div>

              <div className="flex gap-2 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => setIsCompleteMaintenanceModalOpen(false)}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button 
                  onClick={handleCompleteMaintenanceSubmit}
                  disabled={completeMaintenanceMutation.isPending}
                  className="flex-1 bg-green-600 hover:bg-green-700"
                >
                  {completeMaintenanceMutation.isPending ? "Registrando..." : "Registrar Conclusão"}
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}