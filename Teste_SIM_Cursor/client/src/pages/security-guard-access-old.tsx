import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Users, 
  User, 
  LogIn, 
  LogOut, 
  QrCode, 
  Search,
  Shield,
  Clock,
  CheckCircle,
  XCircle,
  UserCheck,
  UserX,
  Car,
  Truck,
  ArrowRight,
  ArrowLeft,
  MapPin,
  Camera
} from "lucide-react";
import type { Employee, Visitor, AccessLog, Vehicle, Driver } from "@shared/schema";
import QrScanner from "qr-scanner";

export default function SecurityGuardAccess() {
  const [activeTab, setActiveTab] = useState("employee-access");
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  const [visitorCpf, setVisitorCpf] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [selectedVisitor, setSelectedVisitor] = useState<Visitor | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  
  // Estados para scanner de câmera
  const [showCameraScanner, setShowCameraScanner] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const cameraRef = useRef<HTMLVideoElement>(null);
  const [qrScanner, setQrScanner] = useState<any>(null);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Queries
  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: visitors = [] } = useQuery<Visitor[]>({
    queryKey: ["/api/access-control/visitors"],
  });

  const { data: recentLogs = [] } = useQuery<AccessLog[]>({
    queryKey: ["/api/access-control/logs"],
  });

  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const { data: vehicleStatus = [] } = useQuery({
    queryKey: ["/api/vehicles/status"],
  });

  // QR Code Processing Mutation
  const processQrCodeMutation = useMutation({
    mutationFn: async (qrData: string) => {
      const response = await apiRequest("/api/access-control/qrcode", "POST", { qrData });
      return response;
    },
    onSuccess: (data) => {
      setIsProcessing(false);
      setQrCodeValue("");
      
      const icon = data.direction === "entry" ? "🟢" : "🔴";
      const action = data.direction === "entry" ? "ENTRADA" : "SAÍDA";
      
      toast({
        title: `${icon} ${action} REGISTRADA`,
        description: `${data.employeeName} - ${new Date().toLocaleTimeString("pt-BR")}`,
        variant: "default",
      });
      
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
    },
    onError: (error) => {
      setIsProcessing(false);
      setQrCodeValue("");
      
      toast({
        title: "❌ ACESSO NEGADO",
        description: "QR Code inválido ou funcionário não encontrado",
        variant: "destructive",
      });
    },
  });

  // Manual Employee Access Mutation
  const employeeAccessMutation = useMutation({
    mutationFn: async ({ employeeId, direction }: { employeeId: string; direction: "entry" | "exit" }) => {
      const response = await apiRequest("/api/access-control/employee-manual", "POST", { employeeId, direction });
      return response;
    },
    onSuccess: (data) => {
      const icon = data.direction === "entry" ? "🟢" : "🔴";
      const action = data.direction === "entry" ? "ENTRADA" : "SAÍDA";
      
      toast({
        title: `${icon} ${action} REGISTRADA`,
        description: `${data.employeeName} - Manual`,
        variant: "default",
      });
      
      setSelectedEmployee(null);
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
    },
    onError: () => {
      toast({
        title: "❌ ERRO",
        description: "Não foi possível registrar o acesso",
        variant: "destructive",
      });
    },
  });

  // Visitor Access Mutation
  const visitorAccessMutation = useMutation({
    mutationFn: async ({ visitorId, direction }: { visitorId: string; direction: "entry" | "exit" }) => {
      const response = await apiRequest("/api/access-control/visitor-access", "POST", { visitorId, direction });
      return response;
    },
    onSuccess: (data) => {
      const icon = data.direction === "entry" ? "🟢" : "🔴";
      const action = data.direction === "entry" ? "ENTRADA" : "SAÍDA";
      
      toast({
        title: `${icon} ${action} REGISTRADA`,
        description: `${data.visitorName} - Visitante`,
        variant: "default",
      });
      
      setSelectedVisitor(null);
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/visitors"] });
    },
    onError: () => {
      toast({
        title: "❌ ERRO",
        description: "Não foi possível registrar o acesso do visitante",
        variant: "destructive",
      });
    },
  });

  // Vehicle Exit Mutation
  const vehicleExitMutation = useMutation({
    mutationFn: async ({ vehicleId, driverId, destination }: { vehicleId: string; driverId: string; destination: string }) => {
      const response = await apiRequest("/api/vehicles/exit", "POST", { vehicleId, driverId, destination });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "🚛 SAÍDA REGISTRADA",
        description: `Veículo ${data.vehiclePlate} - ${data.driverName}`,
        variant: "default",
      });
      
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
    },
    onError: () => {
      toast({
        title: "❌ ERRO",
        description: "Não foi possível registrar a saída do veículo",
        variant: "destructive",
      });
    },
  });

  // Vehicle Return Mutation
  const vehicleReturnMutation = useMutation({
    mutationFn: async ({ vehicleId, driverId, originBase }: { vehicleId: string; driverId: string; originBase: string }) => {
      const response = await apiRequest("/api/vehicles/return", "POST", { vehicleId, driverId, originBase });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "🏠 RETORNO REGISTRADO",
        description: `Veículo ${data.vehiclePlate} - ${data.driverName}`,
        variant: "default",
      });
      
      setSelectedVehicle(null);
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/status"] });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
    },
    onError: () => {
      toast({
        title: "❌ ERRO",
        description: "Não foi possível registrar o retorno do veículo",
        variant: "destructive",
      });
    },
  });

  // Formatação de CPF
  const formatCpf = (value: string) => {
    const numbers = value.replace(/\D/g, "");
    return numbers.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, "$1.$2.$3-$4");
  };

  const handleCpfChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatCpf(e.target.value);
    if (formatted.length <= 14) {
      setVisitorCpf(formatted);
    }
  };

  // Filtros
  const filteredEmployees = employees.filter(emp => 
    emp.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.employeeNumber.includes(searchTerm) ||
    emp.cpf.includes(searchTerm.replace(/\D/g, ""))
  );

  const filteredVisitors = visitors.filter(visitor => 
    visitor.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    visitor.cpf.includes(searchTerm.replace(/\D/g, ""))
  );

  const filteredVehicles = vehicles.filter(vehicle => 
    vehicle.plate.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
    vehicle.model.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
    vehicle.brand.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
  );

  // Filtrar veículos prontos para saída (com checklist aprovado)
  const vehiclesReadyForExit = vehicleStatus.filter(status => status.checklistStatus === 'approved' && status.status === 'available');
  
  // Filtrar veículos em trânsito (para retorno)
  const vehiclesInTransit = vehicleStatus.filter(status => status.status === 'in_transit');

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      {/* Header Mobile */}
      <div className="mb-6 text-center">
        <div className="flex items-center justify-center gap-2 mb-2">
          <Shield className="h-8 w-8 text-[#0C29AB]" />
          <h1 className="text-2xl font-bold text-[#0C29AB]">PORTARIA</h1>
        </div>
        <p className="text-gray-600 text-sm">Sistema de Controle de Acesso</p>
        <div className="text-xs text-gray-500 mt-1">
          {new Date().toLocaleDateString("pt-BR", { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
          })}
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4 mb-6">
          <TabsTrigger 
            value="employee-access" 
            className="text-xs data-[state=active]:bg-[#0C29AB] data-[state=active]:text-white"
          >
            <User className="h-4 w-4 mr-1" />
            Funcionários
          </TabsTrigger>
          <TabsTrigger 
            value="visitor-access"
            className="text-xs data-[state=active]:bg-[#0C29AB] data-[state=active]:text-white"
          >
            <Users className="h-4 w-4 mr-1" />
            Visitantes
          </TabsTrigger>
          <TabsTrigger 
            value="vehicle-control"
            className="text-xs data-[state=active]:bg-[#0C29AB] data-[state=active]:text-white"
          >
            <Truck className="h-4 w-4 mr-1" />
            Veículos
          </TabsTrigger>
          <TabsTrigger 
            value="recent-logs"
            className="text-xs data-[state=active]:bg-[#0C29AB] data-[state=active]:text-white"
          >
            <Clock className="h-4 w-4 mr-1" />
            Logs
          </TabsTrigger>
        </TabsList>

        {/* Tab: Acesso de Funcionários */}
        <TabsContent value="employee-access" className="space-y-4">
          {/* QR Code Scanner */}
          <Card className="border-2 border-[#0C29AB]">
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-[#0C29AB] text-lg">
                <QrCode className="h-5 w-5" />
                Scanner QR Code
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="qrInput" className="text-sm font-medium">
                  Escaneie ou digite o código QR
                </Label>
                <div className="flex gap-2 mt-1">
                  <Input
                    id="qrInput"
                    value={qrCodeValue}
                    onChange={(e) => setQrCodeValue(e.target.value)}
                    placeholder="FELKA_EMP_..."
                    className="flex-1 text-base"
                    autoComplete="off"
                  />
                  <Button 
                    onClick={() => processQrCodeMutation.mutate(qrCodeValue)}
                    disabled={!qrCodeValue || isProcessing}
                    className="bg-[#0C29AB] hover:bg-[#0C29AB]/90 px-6"
                  >
                    {isProcessing ? "..." : "OK"}
                  </Button>
                </div>
              </div>
              
              <div className="pt-2 border-t">
                <Button
                  onClick={() => setShowCameraScanner(true)}
                  variant="outline"
                  className="w-full border-[#0C29AB] text-[#0C29AB] hover:bg-[#0C29AB]/10"
                  size="lg"
                >
                  <Camera className="h-5 w-5 mr-2" />
                  Abrir Câmera para Scanear QR Code
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Busca Manual de Funcionários */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-700 text-lg">
                <Search className="h-5 w-5" />
                Acesso Manual
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="searchEmployee" className="text-sm font-medium">
                  Buscar funcionário
                </Label>
                <Input
                  id="searchEmployee"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome, matrícula ou CPF..."
                  className="mt-1 text-base"
                />
              </div>

              {selectedEmployee && (
                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <div className="flex items-center gap-3 mb-3">
                    {selectedEmployee.profilePhoto && (
                      <img
                        src={selectedEmployee.profilePhoto}
                        alt={selectedEmployee.fullName}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedEmployee.fullName}</p>
                      <p className="text-sm text-gray-600">
                        Mat: {selectedEmployee.employeeNumber} • {selectedEmployee.department}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => employeeAccessMutation.mutate({ 
                        employeeId: selectedEmployee.id, 
                        direction: "entry" 
                      })}
                      disabled={employeeAccessMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <LogIn className="h-4 w-4 mr-1" />
                      ENTRADA
                    </Button>
                    <Button
                      onClick={() => employeeAccessMutation.mutate({ 
                        employeeId: selectedEmployee.id, 
                        direction: "exit" 
                      })}
                      disabled={employeeAccessMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      SAÍDA
                    </Button>
                  </div>
                </div>
              )}

              {searchTerm && !selectedEmployee && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredEmployees.slice(0, 5).map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      {employee.profilePhoto && (
                        <img
                          src={employee.profilePhoto}
                          alt={employee.fullName}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{employee.fullName}</p>
                        <p className="text-xs text-gray-500">
                          {employee.employeeNumber} • {employee.department}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredEmployees.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum funcionário encontrado
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Acesso de Visitantes */}
        <TabsContent value="visitor-access" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-700 text-lg">
                <Users className="h-5 w-5" />
                Controle de Visitantes
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="searchVisitor" className="text-sm font-medium">
                  Buscar visitante
                </Label>
                <Input
                  id="searchVisitor"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Nome ou CPF do visitante..."
                  className="mt-1 text-base"
                />
              </div>

              {selectedVisitor && (
                <div className="bg-green-50 p-4 rounded-lg border border-green-200">
                  <div className="flex items-center gap-3 mb-3">
                    {selectedVisitor.photo && (
                      <img
                        src={selectedVisitor.photo}
                        alt={selectedVisitor.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    )}
                    <div>
                      <p className="font-medium text-gray-900">{selectedVisitor.name}</p>
                      <p className="text-sm text-gray-600">CPF: {selectedVisitor.cpf}</p>
                      <p className="text-xs text-gray-500">
                        {selectedVisitor.totalVisits} visitas anteriores
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => visitorAccessMutation.mutate({ 
                        visitorId: selectedVisitor.id, 
                        direction: "entry" 
                      })}
                      disabled={visitorAccessMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <UserCheck className="h-4 w-4 mr-1" />
                      ENTRADA
                    </Button>
                    <Button
                      onClick={() => visitorAccessMutation.mutate({ 
                        visitorId: selectedVisitor.id, 
                        direction: "exit" 
                      })}
                      disabled={visitorAccessMutation.isPending}
                      className="bg-red-600 hover:bg-red-700 text-white"
                    >
                      <UserX className="h-4 w-4 mr-1" />
                      SAÍDA
                    </Button>
                  </div>
                </div>
              )}

              {searchTerm && !selectedVisitor && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredVisitors.slice(0, 5).map((visitor) => (
                    <div
                      key={visitor.id}
                      onClick={() => setSelectedVisitor(visitor)}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      {visitor.photo && (
                        <img
                          src={visitor.photo}
                          alt={visitor.name}
                          className="w-10 h-10 rounded-full object-cover"
                        />
                      )}
                      <div className="flex-1">
                        <p className="font-medium text-sm">{visitor.name}</p>
                        <p className="text-xs text-gray-500">
                          CPF: {visitor.cpf} • {visitor.totalVisits} visitas
                        </p>
                      </div>
                      <Badge variant={visitor.isActive ? "default" : "secondary"} className="text-xs">
                        {visitor.isActive ? "Ativo" : "Inativo"}
                      </Badge>
                    </div>
                  ))}
                  {filteredVisitors.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum visitante encontrado
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Controle de Veículos */}
        <TabsContent value="vehicle-control" className="space-y-4">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* Saída de Veículos */}
            <Card className="border-2 border-green-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-green-700 text-lg">
                  <ArrowRight className="h-5 w-5" />
                  Saída de Veículos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-3">
                  Veículos com checklist criado pelo motorista
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {vehiclesReadyForExit.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum veículo liberado para saída
                    </p>
                  ) : (
                    vehiclesReadyForExit.map((vehicleStatus) => {
                      const vehicle = vehicles.find(v => v.id === vehicleStatus.vehicleId);
                      const driver = drivers.find(d => d.id === vehicleStatus.driverId);
                      
                      if (!vehicle || !driver) return null;
                      
                      return (
                        <div key={vehicle.id} className="border rounded-lg p-3 bg-green-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{vehicle.plate}</p>
                              <p className="text-xs text-gray-600">
                                {vehicle.brand} {vehicle.model}
                              </p>
                              <p className="text-xs text-green-600">
                                Motorista: {driver.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Checklist: {new Date(vehicleStatus.checklistDate).toLocaleTimeString("pt-BR")}
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                const destination = prompt("Destino:");
                                if (destination) {
                                  vehicleExitMutation.mutate({
                                    vehicleId: vehicle.id,
                                    driverId: driver.id,
                                    destination,
                                    checklistId: vehicleStatus.checklistId
                                  });
                                }
                              }}
                              disabled={vehicleExitMutation.isPending}
                              className="bg-green-600 hover:bg-green-700 text-white text-xs px-3 py-1"
                            >
                              <ArrowRight className="h-3 w-3 mr-1" />
                              Dar Saída
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Retorno de Veículos */}
            <Card className="border-2 border-blue-500">
              <CardHeader className="pb-3">
                <CardTitle className="flex items-center gap-2 text-blue-700 text-lg">
                  <ArrowLeft className="h-5 w-5" />
                  Retorno de Veículos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-gray-600 mb-3">
                  Veículos em trânsito
                </div>
                
                <div className="space-y-2 max-h-80 overflow-y-auto">
                  {vehiclesInTransit.length === 0 ? (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum veículo em trânsito
                    </p>
                  ) : (
                    vehiclesInTransit.map((vehicleStatus) => {
                      const vehicle = vehicles.find(v => v.id === vehicleStatus.vehicleId);
                      const driver = drivers.find(d => d.id === vehicleStatus.driverId);
                      
                      if (!vehicle || !driver) return null;
                      
                      return (
                        <div key={vehicle.id} className="border rounded-lg p-3 bg-blue-50">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-sm">{vehicle.plate}</p>
                              <p className="text-xs text-gray-600">
                                {vehicle.brand} {vehicle.model}
                              </p>
                              <p className="text-xs text-blue-600">
                                Motorista: {driver.name}
                              </p>
                              <p className="text-xs text-gray-500">
                                Saída: {new Date(vehicleStatus.exitTime).toLocaleString("pt-BR")}
                              </p>
                              <p className="text-xs text-gray-500">
                                Destino: {vehicleStatus.destination}
                              </p>
                            </div>
                            <Button
                              onClick={() => {
                                const originBase = prompt("Base de origem:");
                                if (originBase) {
                                  vehicleReturnMutation.mutate({
                                    vehicleId: vehicle.id,
                                    driverId: driver.id,
                                    originBase
                                  });
                                }
                              }}
                              disabled={vehicleReturnMutation.isPending}
                              className="bg-blue-600 hover:bg-blue-700 text-white text-xs px-3 py-1"
                            >
                              <ArrowLeft className="h-3 w-3 mr-1" />
                              Retorno
                            </Button>
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Busca Manual de Veículos */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-700 text-lg">
                <Search className="h-5 w-5" />
                Busca Manual de Veículos
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="searchVehicle" className="text-sm font-medium">
                  Buscar por placa, modelo ou marca
                </Label>
                <Input
                  id="searchVehicle"
                  value={vehicleSearchTerm}
                  onChange={(e) => setVehicleSearchTerm(e.target.value)}
                  placeholder="ABC-1234, Scania, Mercedes..."
                  className="mt-1 text-base"
                />
              </div>

              {selectedVehicle && (
                <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                  <div className="flex items-center gap-3 mb-3">
                    <Car className="h-8 w-8 text-gray-600" />
                    <div>
                      <p className="font-medium text-gray-900">{selectedVehicle.plate}</p>
                      <p className="text-sm text-gray-600">
                        {selectedVehicle.brand} {selectedVehicle.model} • {selectedVehicle.year}
                      </p>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        const driverId = prompt("ID do Motorista:");
                        const destination = prompt("Destino:");
                        if (driverId && destination) {
                          vehicleExitMutation.mutate({
                            vehicleId: selectedVehicle.id,
                            driverId,
                            destination
                          });
                        }
                      }}
                      disabled={vehicleExitMutation.isPending}
                      className="bg-green-600 hover:bg-green-700 text-white"
                    >
                      <ArrowRight className="h-4 w-4 mr-1" />
                      SAÍDA
                    </Button>
                    <Button
                      onClick={() => {
                        const driverId = prompt("ID do Motorista:");
                        const originBase = prompt("Base de origem:");
                        if (driverId && originBase) {
                          vehicleReturnMutation.mutate({
                            vehicleId: selectedVehicle.id,
                            driverId,
                            originBase
                          });
                        }
                      }}
                      disabled={vehicleReturnMutation.isPending}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      <ArrowLeft className="h-4 w-4 mr-1" />
                      RETORNO
                    </Button>
                  </div>
                </div>
              )}

              {vehicleSearchTerm && !selectedVehicle && (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {filteredVehicles.slice(0, 5).map((vehicle) => (
                    <div
                      key={vehicle.id}
                      onClick={() => setSelectedVehicle(vehicle)}
                      className="flex items-center gap-3 p-3 border rounded-lg cursor-pointer hover:bg-gray-50"
                    >
                      <Car className="h-8 w-8 text-gray-600" />
                      <div className="flex-1">
                        <p className="font-medium text-sm">{vehicle.plate}</p>
                        <p className="text-xs text-gray-500">
                          {vehicle.brand} {vehicle.model} • {vehicle.year}
                        </p>
                      </div>
                    </div>
                  ))}
                  {filteredVehicles.length === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum veículo encontrado
                    </p>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tab: Logs Recentes */}
        <TabsContent value="recent-logs" className="space-y-4">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="flex items-center gap-2 text-gray-700 text-lg">
                <Clock className="h-5 w-5" />
                Acessos Recentes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3 max-h-96 overflow-y-auto">
                {recentLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        log.direction === "entry" 
                          ? "bg-green-100 text-green-600" 
                          : "bg-red-100 text-red-600"
                      }`}>
                        {log.direction === "entry" ? 
                          <CheckCircle className="h-4 w-4" /> : 
                          <XCircle className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">{log.personName}</p>
                        <p className="text-xs text-gray-500">
                          {log.personType === "visitor" ? "Visitante" : "Funcionário"}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={log.direction === "entry" ? "default" : "secondary"}
                        className="text-xs mb-1"
                      >
                        {log.direction === "entry" ? "Entrada" : "Saída"}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                      </p>
                    </div>
                  </div>
                ))}
                {recentLogs.length === 0 && (
                  <p className="text-center text-gray-500 py-8">
                    Nenhum log de acesso encontrado
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}