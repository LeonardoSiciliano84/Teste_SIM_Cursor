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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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

  // Funções do scanner de câmera
  const startCamera = async () => {
    try {
      if (!cameraRef.current) return;
      
      const scanner = new QrScanner(cameraRef.current, (result) => {
        if (result.data) {
          setQrCodeValue(result.data);
          processQrCodeMutation.mutate(result.data);
          stopCamera();
        }
      }, {
        highlightScanRegion: true,
        highlightCodeOutline: true,
      });
      
      await scanner.start();
      setQrScanner(scanner);
      setIsCameraActive(true);
      
      toast({
        title: "Câmera ativada",
        description: "Posicione o QR Code na frente da câmera",
      });
    } catch (error) {
      console.error("Erro ao iniciar câmera:", error);
      toast({
        title: "Erro na câmera",
        description: "Não foi possível ativar a câmera",
        variant: "destructive",
      });
    }
  };

  const stopCamera = () => {
    if (qrScanner) {
      qrScanner.stop();
      qrScanner.destroy();
      setQrScanner(null);
    }
    setIsCameraActive(false);
    setShowCameraScanner(false);
  };

  // QR Code Processing Mutation
  const processQrCodeMutation = useMutation({
    mutationFn: async (qrData: string) => {
      const response = await apiRequest("/api/access-control/qrcode", "POST", { qrData });
      return response;
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Acesso Liberado",
        description: `${data.employee.fullName} - Acesso registrado com sucesso`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
      setQrCodeValue("");
      setIsProcessing(false);
    },
    onError: (error) => {
      toast({
        title: "❌ Acesso Negado",
        description: "QR Code inválido ou funcionário não encontrado",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  // Employee Access Mutation
  const employeeAccessMutation = useMutation({
    mutationFn: async (data: { employeeId: string; direction: "entry" | "exit" }) => {
      return await apiRequest("/api/access-control/employee-access", "POST", data);
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Acesso Registrado",
        description: `${data.employee.fullName} - ${data.direction === "entry" ? "Entrada" : "Saída"} registrada`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
      setSelectedEmployee(null);
    },
  });

  // Vehicle Exit Mutation
  const vehicleExitMutation = useMutation({
    mutationFn: async (data: { vehicleId: string; driverId: string }) => {
      return await apiRequest("/api/vehicles/authorize-exit", "POST", data);
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Saída Autorizada",
        description: `Veículo ${data.vehiclePlate} autorizado para saída`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/status"] });
      setSelectedVehicle(null);
    },
  });

  // Vehicle Return Mutation
  const vehicleReturnMutation = useMutation({
    mutationFn: async (data: { vehicleId: string; driverId: string; originBase: string }) => {
      return await apiRequest("/api/vehicles/register-return", "POST", data);
    },
    onSuccess: (data) => {
      toast({
        title: "✅ Retorno Registrado",
        description: `Retorno do veículo ${data.vehiclePlate} registrado`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles/status"] });
      setSelectedVehicle(null);
    },
  });

  // Handle camera dialog close
  const handleCameraClose = () => {
    stopCamera();
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

          {/* Manual Employee Search */}
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
                  <div className="flex gap-2">
                    <Button
                      onClick={() => employeeAccessMutation.mutate({ employeeId: selectedEmployee.id, direction: "entry" })}
                      className="flex-1 bg-green-600 hover:bg-green-700"
                      size="sm"
                    >
                      <LogIn className="h-4 w-4 mr-1" />
                      Entrada
                    </Button>
                    <Button
                      onClick={() => employeeAccessMutation.mutate({ employeeId: selectedEmployee.id, direction: "exit" })}
                      className="flex-1 bg-red-600 hover:bg-red-700"
                      size="sm"
                    >
                      <LogOut className="h-4 w-4 mr-1" />
                      Saída
                    </Button>
                  </div>
                </div>
              )}

              {/* Employee List */}
              {searchTerm && !selectedEmployee && (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {filteredEmployees.slice(0, 5).map((employee) => (
                    <div
                      key={employee.id}
                      onClick={() => setSelectedEmployee(employee)}
                      className="p-3 border rounded-lg cursor-pointer hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        {employee.profilePhoto && (
                          <img
                            src={employee.profilePhoto}
                            alt={employee.fullName}
                            className="w-10 h-10 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium text-sm">{employee.fullName}</p>
                          <p className="text-xs text-gray-600">
                            {employee.employeeNumber} • {employee.department}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Visitor Access Tab */}
        <TabsContent value="visitor-access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-[#0C29AB]">
                <Users className="h-5 w-5" />
                Controle de Visitantes
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-center text-gray-500 py-8">
                Funcionalidade em desenvolvimento
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Vehicle Control Tab */}
        <TabsContent value="vehicle-control" className="space-y-4">
          {/* Vehicles Ready for Exit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-600">
                <ArrowRight className="h-5 w-5" />
                Veículos Prontos para Saída
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehiclesReadyForExit.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum veículo pronto para saída</p>
              ) : (
                <div className="space-y-3">
                  {vehiclesReadyForExit.map((status) => {
                    const vehicle = vehicles.find(v => v.id === status.vehicleId);
                    const driver = drivers.find(d => d.id === status.driverId);
                    return (
                      <div key={status.vehicleId} className="p-4 border rounded-lg bg-green-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{vehicle?.plate} - {vehicle?.model}</p>
                            <p className="text-sm text-gray-600">
                              Motorista: {driver?.name}
                            </p>
                            <Badge className="mt-1 bg-green-100 text-green-800">
                              Checklist Aprovado
                            </Badge>
                          </div>
                          <Button
                            onClick={() => vehicleExitMutation.mutate({ 
                              vehicleId: status.vehicleId, 
                              driverId: status.driverId 
                            })}
                            className="bg-green-600 hover:bg-green-700"
                            size="sm"
                          >
                            <ArrowRight className="h-4 w-4 mr-1" />
                            Autorizar Saída
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Vehicles in Transit */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-blue-600">
                <ArrowLeft className="h-5 w-5" />
                Veículos em Trânsito
              </CardTitle>
            </CardHeader>
            <CardContent>
              {vehiclesInTransit.length === 0 ? (
                <p className="text-gray-500 text-center py-4">Nenhum veículo em trânsito</p>
              ) : (
                <div className="space-y-3">
                  {vehiclesInTransit.map((status) => {
                    const vehicle = vehicles.find(v => v.id === status.vehicleId);
                    const driver = drivers.find(d => d.id === status.driverId);
                    return (
                      <div key={status.vehicleId} className="p-4 border rounded-lg bg-blue-50">
                        <div className="flex justify-between items-center">
                          <div>
                            <p className="font-medium">{vehicle?.plate} - {vehicle?.model}</p>
                            <p className="text-sm text-gray-600">
                              Motorista: {driver?.name}
                            </p>
                            <Badge className="mt-1 bg-blue-100 text-blue-800">
                              Em Trânsito
                            </Badge>
                          </div>
                          <Button
                            onClick={() => vehicleReturnMutation.mutate({ 
                              vehicleId: status.vehicleId, 
                              driverId: status.driverId,
                              originBase: "Base Principal"
                            })}
                            className="bg-blue-600 hover:bg-blue-700"
                            size="sm"
                          >
                            <ArrowLeft className="h-4 w-4 mr-1" />
                            Registrar Retorno
                          </Button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Recent Logs Tab */}
        <TabsContent value="recent-logs" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-gray-700">
                <Clock className="h-5 w-5" />
                Logs Recentes de Acesso
              </CardTitle>
            </CardHeader>
            <CardContent>
              {recentLogs.length === 0 ? (
                <p className="text-gray-500 text-center py-8">Nenhum log encontrado</p>
              ) : (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {recentLogs.slice(0, 20).map((log) => (
                    <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          log.direction === "entry" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                        }`}>
                          {log.direction === "entry" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                        </div>
                        <div>
                          <p className="font-medium text-sm">{log.personName}</p>
                          <p className="text-xs text-gray-500">
                            {log.personType === "employee" ? "Funcionário" : "Visitante"}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={log.direction === "entry" ? "default" : "secondary"}>
                          {log.direction === "entry" ? "Entrada" : "Saída"}
                        </Badge>
                        <p className="text-xs text-gray-500 mt-1">
                          {new Date(log.timestamp).toLocaleTimeString("pt-BR")}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Camera Scanner Modal */}
      <Dialog open={showCameraScanner} onOpenChange={setShowCameraScanner}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Camera className="h-5 w-5" />
              Scanner de QR Code
            </DialogTitle>
          </DialogHeader>
          
          <div className="space-y-4">
            <div className="relative bg-black rounded-lg overflow-hidden">
              <video
                ref={cameraRef}
                className="w-full h-64 object-cover"
                autoPlay
                playsInline
                muted
              />
              {!isCameraActive && (
                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                  <div className="text-center text-white">
                    <Camera className="h-12 w-12 mx-auto mb-2" />
                    <p>Pressione "Iniciar Scanner" para começar</p>
                  </div>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {!isCameraActive ? (
                <Button 
                  onClick={startCamera}
                  className="flex-1 bg-[#0C29AB] hover:bg-[#0C29AB]/90"
                >
                  <Camera className="h-4 w-4 mr-2" />
                  Iniciar Scanner
                </Button>
              ) : (
                <Button 
                  onClick={stopCamera}
                  className="flex-1 bg-red-600 hover:bg-red-700"
                >
                  Parar Scanner
                </Button>
              )}
              
              <Button 
                onClick={handleCameraClose}
                variant="outline"
              >
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}