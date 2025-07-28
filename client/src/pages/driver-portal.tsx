import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue 
} from "@/components/ui/select";
import { Search, User, Mail, Shield, Car, FileText, Download, AlertTriangle, CheckSquare, Wrench, Phone, Camera, MapPin, Clock, Truck, Fuel, Settings, Package, MessageSquare, Calendar, LogOut, Lock, UserCircle, ChevronDown } from "lucide-react";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { SinistroForm } from "@/components/sinistros/sinistro-form";

interface DriverInfo {
  id: string;
  fullName: string;
  email: string;
  employeeNumber: string;
  profilePhoto?: string;
  position: string;
  department: string;
  driverLicense: string;
  driverLicenseCategory: string;
  driverLicenseExpiry: string;
  phone: string;
}

export default function DriverPortal() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [implementSearchTerm, setImplementSearchTerm] = useState("");
  const [selectedImplement, setSelectedImplement] = useState<string>("");
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedDocumentVehicle, setSelectedDocumentVehicle] = useState<any>(null);
  const [showPreChecklistWarning, setShowPreChecklistWarning] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showMaintenanceRequest, setShowMaintenanceRequest] = useState(false);
  const [showMaintenanceCommunication, setShowMaintenanceCommunication] = useState(false);
  const [showTravelMaintenance, setShowTravelMaintenance] = useState(false);
  const [activeTab, setActiveTab] = useState("dados-iniciais");
  const [selectedOC, setSelectedOC] = useState<string | null>(null);
  const [showPranchaOC, setShowPranchaOC] = useState(false);
  const [pranchaService, setPranchaService] = useState<{
    ocNumber: string;
    startDate: string;
    isActive: boolean;
    startTime?: string;
  } | null>(null);
  const [activeService, setActiveService] = useState<any>(null);
  const [showFinalizationModal, setShowFinalizationModal] = useState(false);
  const [finalizationNotes, setFinalizationNotes] = useState('');
  const [finalizationFile, setFinalizationFile] = useState<File | null>(null);
  const [showUserProfile, setShowUserProfile] = useState(false);
  const [showSecuritySettings, setShowSecuritySettings] = useState(false);
  const [selectedBase, setSelectedBase] = useState<string>("");
  const { toast } = useToast();

  // Dados mock para Ordens de Coleta
  const ordensColeta = [
    {
      id: "OC001",
      cliente: "Empresa ABC Ltda",
      origem: "São Paulo - SP",
      destino: "Rio de Janeiro - RJ", 
      descricao: "Carga geral - Produtos eletrônicos",
      status: "Pendente",
      dataColeta: "2025-01-28",
      prazo: "2025-01-30",
      peso: "2.5 toneladas",
      valor: "R$ 1.850,00",
      observacoes: "Carga frágil, manuseio cuidadoso"
    },
    {
      id: "OC002", 
      cliente: "Transportadora XYZ",
      origem: "Campinas - SP",
      destino: "Belo Horizonte - MG",
      descricao: "Produtos farmacêuticos",
      status: "Em Andamento",
      dataColeta: "2025-01-27",
      prazo: "2025-01-29",
      peso: "1.8 toneladas", 
      valor: "R$ 2.200,00",
      observacoes: "Temperatura controlada necessária"
    },
    {
      id: "OC003",
      cliente: "Indústria 123",
      origem: "Santos - SP", 
      destino: "Salvador - BA",
      descricao: "Peças automotivas",
      status: "Nova",
      dataColeta: "2025-01-29",
      prazo: "2025-02-01",
      peso: "3.2 toneladas",
      valor: "R$ 3.100,00", 
      observacoes: "Carga pesada, verificar distribuição"
    }
  ];
  
  // Obter informações do motorista logado
  const { data: driverInfo, isLoading: driverLoading } = useQuery<DriverInfo>({
    queryKey: ["/api/driver/profile"],
    retry: false,
  });

  // Verificar serviço ativo do motorista ao carregar
  const { data: activeServiceData, refetch: refetchActiveService } = useQuery({
    queryKey: [`/api/driver/${driverInfo?.id}/active-service`],
    enabled: !!driverInfo?.id,
    retry: false,
  });

  // Função para calcular dias de serviço ativo
  const getActiveDays = () => {
    if (!activeService?.startDate) return 0;
    
    try {
      const startDate = new Date(activeService.startDate);
      const currentDate = new Date();
      
      // Calcular diferença em milissegundos
      const diffTime = currentDate.getTime() - startDate.getTime();
      
      // Converter para dias (incluindo o dia atual)
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      
      return Math.max(1, diffDays); // Mínimo 1 dia
    } catch (error) {
      console.error('Erro ao calcular dias:', error);
      return 1;
    }
  };

  useEffect(() => {
    if (activeServiceData && typeof activeServiceData === 'object') {
      setActiveService(activeServiceData);
      setPranchaService({
        ocNumber: (activeServiceData as any).ocNumber || '',
        startDate: (activeServiceData as any).startDate || '',
        isActive: true,
        startTime: (activeServiceData as any).createdAt ? new Date((activeServiceData as any).createdAt).toLocaleTimeString('pt-BR') : ''
      });
      
      // Definir os veículos selecionados automaticamente
      setSelectedVehicle((activeServiceData as any).vehicleId || '');
      setSelectedImplement((activeServiceData as any).implementId || '');
    }
  }, [activeServiceData]);

  // Obter veículos disponíveis
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
    select: (data: any[]) => data.filter(v => v.status === 'active')
  });

  // Filtrar veículos por busca
  const filteredVehicles = vehicles.filter((vehicle: any) => 
    vehicle.plate.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
    vehicle.name.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
  );

  // Filtrar implementos por busca
  const filteredImplements = vehicles.filter((vehicle: any) => 
    vehicle.vehicleType === 'Semirreboque' &&
    (vehicle.plate.toLowerCase().includes(implementSearchTerm.toLowerCase()) ||
     vehicle.name.toLowerCase().includes(implementSearchTerm.toLowerCase()))
  );

  // Obter dados do veículo selecionado
  const selectedVehicleData = vehicles.find((v: any) => v.id === selectedVehicle);
  const selectedImplementData = vehicles.find((v: any) => v.id === selectedImplement);

  // Verificar se o implemento selecionado é uma prancha
  const isPranchaImplement = selectedImplementData && 
    selectedImplementData.name.toLowerCase().includes('prancha');



  // Função para visualizar documentos
  const handleViewDocuments = (vehicleId: string) => {
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    setSelectedDocumentVehicle(vehicle);
    setShowDocuments(true);
  };

  // Função para download de documento
  const handleDownloadDocument = (docType: string) => {
    toast({
      title: "Download iniciado",
      description: `Baixando documento: ${docType}`,
    });
    // Em produção, aqui faria o download real do documento
  };

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!driverInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Este portal é exclusivo para motoristas autorizados.
            </p>
            <Button 
              className="w-full mt-4" 
              onClick={() => authManager.logout()}
            >
              Fazer Login Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const handleLogout = () => {
    authManager.logout();
    toast({
      title: "Sessão encerrada",
      description: "Você foi desconectado com sucesso.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header com informações do motorista */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={driverInfo.profilePhoto} />
                <AvatarFallback className="bg-blue-500 text-white text-lg">
                  {driverInfo.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{driverInfo.fullName}</h1>
                <div className="flex items-center space-x-1 text-blue-100">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{driverInfo.email}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-100 mt-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Mat: {driverInfo.employeeNumber}</span>
                </div>
              </div>
              
              {/* Menu do usuário */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="text-white hover:bg-blue-600">
                    <Settings className="h-4 w-4 mr-2" />
                    <ChevronDown className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuLabel>Opções da Conta</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setShowUserProfile(true)}>
                    <UserCircle className="mr-2 h-4 w-4" />
                    <span>Meus Dados</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowSecuritySettings(true)}>
                    <Lock className="mr-2 h-4 w-4" />
                    <span>Segurança</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Encerrar Sessão</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">CNH</Label>
                <p className="font-semibold">{driverInfo.driverLicense}</p>
              </div>
              <div>
                <Label className="text-gray-600">Categoria</Label>
                <p className="font-semibold">{driverInfo.driverLicenseCategory}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-600">Validade CNH</Label>
                <p className="font-semibold text-blue-600">
                  {new Date(driverInfo.driverLicenseExpiry).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistema de Abas */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="dados-iniciais">Dados Iniciais</TabsTrigger>
            <TabsTrigger value="dados-veiculos">Dados dos Veículos</TabsTrigger>
            <TabsTrigger value="registros-oc" className="relative">
              Registros de O.C.
              <Badge className="ml-2 bg-red-500 text-white text-xs">
                {ordensColeta.filter(oc => oc.status === "Nova").length}
              </Badge>
            </TabsTrigger>
          </TabsList>

          {/* Aba Dados Iniciais */}
          <TabsContent value="dados-iniciais" className="space-y-4">
            {/* Seleção de Veículo de Tração */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Car className="h-5 w-5 text-blue-600" />
              <span>Selecionar Veículo de Tração</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vehicle-search">Buscar por Placa ou Nome</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="vehicle-search"
                  placeholder="Digite a placa ou nome do veículo..."
                  value={vehicleSearchTerm}
                  onChange={(e) => setVehicleSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {vehicleSearchTerm && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle: any) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicle(vehicle.id);
                        setVehicleSearchTerm("");
                      }}
                      className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{vehicle.plate}</p>
                          <p className="text-sm text-gray-600">{vehicle.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{vehicle.brand}</p>
                          <p className="text-sm text-gray-500">{vehicle.model}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum veículo encontrado
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do veículo selecionado */}
        {selectedVehicleData && (
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">
                Veículo Selecionado: {selectedVehicleData.plate}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Marca/Modelo</Label>
                  <p className="font-semibold">{selectedVehicleData.brand} {selectedVehicleData.model}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Ano</Label>
                  <p className="font-semibold">{selectedVehicleData.modelYear}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Capacidade Carga</Label>
                  <p className="font-semibold">{selectedVehicleData.loadCapacity || 'N/A'} kg</p>
                </div>
                <div>
                  <Label className="text-gray-600">Tanque</Label>
                  <p className="font-semibold">{selectedVehicleData.fuelTankCapacity || 'N/A'} L</p>
                </div>
                <div>
                  <Label className="text-gray-600">Consumo Médio</Label>
                  <p className="font-semibold">{selectedVehicleData.fuelConsumption || 'N/A'} km/L</p>
                </div>
                <div>
                  <Label className="text-gray-600">Localização</Label>
                  <p className="font-semibold">{selectedVehicleData.currentLocation || 'N/A'}</p>
                </div>
              </div>

              {/* Informações de manutenção */}
              <div className="pt-3 border-t">
                <h4 className="font-semibold text-gray-800 mb-2">Próximas Manutenções</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revisão Preventiva:</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {selectedVehicleData.preventiveMaintenanceKm || 10000} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rodízio de Pneus:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {selectedVehicleData.tireRotationKm || 10000} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão para documentos */}
              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleViewDocuments(selectedVehicleData.id)}
              >
                Ver Documentos do Veículo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Seleção de Implemento (opcional) */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Car className="h-5 w-5 text-orange-600" />
              <span>Implemento (Opcional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="implement-search">Buscar Implemento</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="implement-search"
                  placeholder="Digite a placa do implemento..."
                  value={implementSearchTerm}
                  onChange={(e) => setImplementSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {implementSearchTerm && (
              <div className="max-h-32 overflow-y-auto space-y-2">
                {filteredImplements.length > 0 ? (
                  filteredImplements.map((implement: any) => (
                    <button
                      key={implement.id}
                      onClick={() => {
                        setSelectedImplement(implement.id);
                        setImplementSearchTerm("");
                      }}
                      className="w-full text-left p-2 border rounded hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">{implement.plate}</span>
                        <span className="text-sm text-gray-600">{implement.name}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-2">
                    Nenhum implemento encontrado
                  </p>
                )}
              </div>
            )}

            {selectedImplementData && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="font-semibold text-orange-800">
                  Implemento: {selectedImplementData.plate}
                </p>
                <p className="text-sm text-orange-600">
                  {selectedImplementData.name}
                </p>
                {/* Botão para documentos do implemento */}
                <Button 
                  className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleViewDocuments(selectedImplementData.id)}
                >
                  Ver Documentos do Implemento
                </Button>
                
                {/* Botão para Registrar O.C. de Prancha */}
                {isPranchaImplement && !pranchaService?.isActive && (
                  <Button 
                    className="w-full mt-2 bg-purple-600 hover:bg-purple-700"
                    onClick={() => setShowPranchaOC(true)}
                  >
                    Registrar O.C. de Prancha
                  </Button>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Acesso Rápido - Sempre visíveis */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800 text-center">
            Acesso Rápido
          </h3>
          
          <div className="grid grid-cols-2 gap-3">
            {/* Botão 1: Checklist */}
            <Button 
              className="h-20 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white"
              onClick={() => {
                if (!selectedVehicle) {
                  toast({ 
                    title: "Aviso", 
                    description: "Selecione um veículo primeiro",
                    variant: "destructive"
                  });
                  return;
                }
                setShowPreChecklistWarning(true);
              }}
            >
              <CheckSquare className="h-6 w-6 mb-1" />
              <span className="text-xs text-center">Checklist</span>
            </Button>

            {/* Botão 2: Solicitar Manutenção */}
            <Button 
              className="h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
              onClick={() => setShowMaintenanceRequest(true)}
            >
              <Wrench className="h-6 w-6 mb-1" />
              <span className="text-xs text-center">Solicitar Manutenção</span>
            </Button>

            {/* Botão 3: Comunicar Sinistro */}
            <SinistroForm 
              userInfo={{
                id: driverInfo.id,
                name: driverInfo.fullName,
                role: "driver"
              }}
              isDriverPortal={true}
              trigger={
                <Button 
                  className="h-20 flex flex-col items-center justify-center bg-red-600 hover:bg-red-700 text-white"
                >
                  <AlertTriangle className="h-6 w-6 mb-1" />
                  <span className="text-xs text-center">Comunicar Sinistro</span>
                </Button>
              }
            />

            {/* Botão 4: Registrar Manutenção em Viagem */}
            <Button 
              className="h-20 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
              onClick={() => {
                if (!selectedVehicle) {
                  toast({ 
                    title: "Aviso", 
                    description: "Selecione um veículo primeiro",
                    variant: "destructive"
                  });
                  return;
                }
                setShowTravelMaintenance(true);
              }}
            >
              <Wrench className="h-6 w-6 mb-1" />
              <span className="text-xs text-center">Manutenção Viagem</span>
            </Button>
          </div>

          {/* Botão para continuar para próxima etapa */}
          {selectedVehicle && (
            <Button className="w-full bg-gray-600 hover:bg-gray-700 text-lg py-3 mt-4">
              Continuar para Próxima Etapa
            </Button>
          )}
        </div>

        {/* Serviço Ativo de Prancha */}
        {pranchaService?.isActive && (
          <Card className="border-purple-200 bg-purple-50 shadow-lg mt-4">
            <CardHeader>
              <CardTitle className="flex items-center space-x-2 text-purple-800">
                <Package className="h-5 w-5" />
                <span>Serviço de Prancha Ativo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-purple-600">O.C. Número</Label>
                  <p className="font-bold text-purple-800">{pranchaService.ocNumber}</p>
                </div>
                <div>
                  <Label className="text-purple-600">Data de Início</Label>
                  <p className="font-bold text-purple-800">{pranchaService.startDate}</p>
                </div>
                <div>
                  <Label className="text-purple-600">Veículo Tração</Label>
                  <p className="font-bold text-purple-800">
                    {activeService?.vehiclePlate} - {activeService?.vehicleName}
                  </p>
                </div>
                <div>
                  <Label className="text-purple-600">Implemento</Label>
                  <p className="font-bold text-purple-800">
                    {activeService?.implementPlate} - {activeService?.implementName}
                  </p>
                </div>
                <div className="col-span-2">
                  <Label className="text-purple-600">Dias de Serviço</Label>
                  <p className="font-bold text-green-600 text-xl">{getActiveDays()} dias</p>
                </div>
              </div>
              <Button 
                className="w-full bg-red-600 hover:bg-red-700 mt-4"
                onClick={() => setShowFinalizationModal(true)}
              >
                Finalizar Serviço
              </Button>
            </CardContent>
          </Card>
        )}
          </TabsContent>

          {/* Aba Dados dos Veículos */}
          <TabsContent value="dados-veiculos" className="space-y-4">
            {selectedVehicleData ? (
              <Card className="border-blue-200 shadow-lg">
                <CardHeader className="bg-blue-50">
                  <CardTitle className="flex items-center space-x-2 text-blue-800">
                    <Truck className="h-5 w-5" />
                    <span>Especificações - {selectedVehicleData.plate}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4 space-y-4">
                  {/* Informações Técnicas */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Truck className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">Capacidade de Carga</span>
                      </div>
                      <p className="text-xl font-bold text-blue-600">
                        {selectedVehicleData.loadCapacity || '15.000'} kg
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Fuel className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">Tanque de Combustível</span>
                      </div>
                      <p className="text-xl font-bold text-green-600">
                        {selectedVehicleData.fuelTankCapacity || '300'} L
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Settings className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">Consumo Médio</span>
                      </div>
                      <p className="text-xl font-bold text-orange-600">
                        {selectedVehicleData.fuelConsumption || '3.2'} km/L
                      </p>
                    </div>
                    
                    <div className="bg-gray-50 p-3 rounded-lg">
                      <div className="flex items-center space-x-2 mb-2">
                        <Calendar className="h-4 w-4 text-gray-600" />
                        <span className="text-sm font-semibold text-gray-700">Próxima Preventiva</span>
                      </div>
                      <p className="text-xl font-bold text-red-600">
                        {selectedVehicleData.preventiveMaintenanceKm || '10.000'} km
                      </p>
                    </div>
                  </div>

                  {/* Manutenções Programadas */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Manutenções Programadas</span>
                    </h4>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                        <span className="text-sm">Rodízio de Pneus</span>
                        <Badge variant="outline" className="text-yellow-700">
                          {selectedVehicleData.tireRotationKm || '10.000'} km
                        </Badge>
                      </div>
                      <div className="flex justify-between items-center p-2 bg-red-50 rounded">
                        <span className="text-sm">Revisão Preventiva</span>
                        <Badge variant="outline" className="text-red-700">
                          {selectedVehicleData.preventiveMaintenanceKm || '10.000'} km
                        </Badge>
                      </div>

                    </div>
                  </div>

                  {/* Histórico de Manutenção */}
                  <div className="border-t pt-4">
                    <h4 className="font-semibold text-gray-800 mb-3 flex items-center space-x-2">
                      <Settings className="h-4 w-4" />
                      <span>Histórico de Manutenção</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-3 text-center">
                      <div className="bg-green-50 p-3 rounded">
                        <p className="text-xs text-green-600">Última Revisão</p>
                        <p className="font-bold text-green-800">15 dias atrás</p>
                        <p className="text-xs text-gray-500">12/01/2025</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded">
                        <p className="text-xs text-blue-600">Último Rodízio de Pneus</p>
                        <p className="font-bold text-blue-800">45 dias atrás</p>
                        <p className="text-xs text-gray-500">13/12/2024</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card className="border-gray-200">
                <CardContent className="p-8 text-center">
                  <Truck className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                  <p className="text-gray-600">Selecione um veículo na aba "Dados Iniciais" para ver as especificações</p>
                </CardContent>
              </Card>
            )}

            {/* Dados do Implemento se selecionado */}
            {selectedImplementData && (
              <Card className="border-orange-200 shadow-lg">
                <CardHeader className="bg-orange-50">
                  <CardTitle className="flex items-center space-x-2 text-orange-800">
                    <Package className="h-5 w-5" />
                    <span>Implemento - {selectedImplementData.plate}</span>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-gray-600">Tipo</Label>
                      <p className="font-semibold">{selectedImplementData.name}</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Capacidade</Label>
                      <p className="font-semibold">{selectedImplementData.loadCapacity || 'N/A'} kg</p>
                    </div>
                    <div>
                      <Label className="text-gray-600">Status</Label>
                      <Badge className="bg-green-100 text-green-800">
                        {selectedImplementData.status || 'Ativo'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="text-gray-600">Último Check</Label>
                      <p className="font-semibold">5 dias atrás</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          {/* Aba Registros de O.C. */}
          <TabsContent value="registros-oc" className="space-y-4">
            <Card className="border-gray-200 shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2 text-gray-800">
                  <MessageSquare className="h-5 w-5" />
                  <span>Ordens de Coleta</span>
                  <Badge className="bg-red-500 text-white">
                    {ordensColeta.filter(oc => oc.status === "Nova").length} novas
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {ordensColeta.map((oc) => (
                  <div key={oc.id} className="border rounded-lg p-3 hover:bg-gray-50 transition-colors">
                    <div className="flex justify-between items-start mb-2">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-800">{oc.id}</h4>
                          <Badge 
                            className={
                              oc.status === "Nova" ? "bg-red-100 text-red-800" :
                              oc.status === "Em Andamento" ? "bg-blue-100 text-blue-800" :
                              "bg-gray-100 text-gray-800"
                            }
                          >
                            {oc.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-1">{oc.cliente}</p>
                        <p className="text-sm text-gray-500">{oc.descricao}</p>
                        <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                          <span>📍 {oc.origem} → {oc.destino}</span>
                          <span>📅 {oc.dataColeta}</span>
                          <span>⚖️ {oc.peso}</span>
                        </div>
                      </div>
                    </div>
                    
                    {selectedOC === oc.id && (
                      <div className="mt-3 pt-3 border-t bg-blue-50 rounded p-3">
                        <h5 className="font-semibold text-blue-800 mb-2">Detalhes Completos da O.C.</h5>
                        <div className="grid grid-cols-2 gap-3 text-sm">
                          <div>
                            <Label className="text-blue-600">Valor da Carga</Label>
                            <p className="font-semibold">{oc.valor}</p>
                          </div>
                          <div>
                            <Label className="text-blue-600">Prazo de Entrega</Label>
                            <p className="font-semibold">{oc.prazo}</p>
                          </div>
                          <div className="col-span-2">
                            <Label className="text-blue-600">Observações</Label>
                            <p className="text-gray-700">{oc.observacoes}</p>
                          </div>
                        </div>
                        <div className="flex space-x-2 mt-3">
                          <Button size="sm" className="bg-green-600 hover:bg-green-700">
                            Aceitar O.C.
                          </Button>
                          <Button size="sm" variant="outline">
                            Solicitar Alteração
                          </Button>
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => setSelectedOC(null)}
                          >
                            Fechar
                          </Button>
                        </div>
                      </div>
                    )}
                    
                    {selectedOC !== oc.id && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="w-full mt-2"
                        onClick={() => setSelectedOC(oc.id)}
                      >
                        Ver Detalhes Completos
                      </Button>
                    )}
                  </div>
                ))}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Modal de Registro de O.C. de Prancha */}
        <Dialog open={showPranchaOC} onOpenChange={setShowPranchaOC}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-purple-600" />
                <span>Registrar O.C. de Prancha</span>
              </DialogTitle>
              <DialogDescription>
                Confirme o início do serviço com implemento prancha
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Detecção automática do implemento */}
              <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                <p className="text-sm font-medium text-purple-800">
                  ✓ Implemento do tipo prancha detectado automaticamente
                </p>
                <p className="text-sm text-purple-600">
                  {selectedImplementData?.plate} - {selectedImplementData?.name}
                </p>
              </div>

              {/* Campo: Número da O.C. */}
              <div>
                <Label>Número da Ordem de Coleta (O.C.) *</Label>
                <Input 
                  placeholder="Ex: OC-2025-001"
                  id="oc-number"
                />
              </div>

              {/* Campo: Data de início */}
              <div>
                <Label>Data de Início do Serviço *</Label>
                <Input 
                  type="date"
                  defaultValue={new Date().toISOString().split('T')[0]}
                  id="start-date"
                />
              </div>

              <Button 
                className="w-full bg-purple-600 hover:bg-purple-700"
                onClick={async () => {
                  const ocNumber = (document.getElementById('oc-number') as HTMLInputElement)?.value;
                  const startDate = (document.getElementById('start-date') as HTMLInputElement)?.value;
                  
                  if (!ocNumber || !startDate) {
                    toast({
                      title: "Campos obrigatórios",
                      description: "Preencha o número da O.C. e a data de início",
                      variant: "destructive"
                    });
                    return;
                  }

                  if (!selectedVehicleData || !selectedImplementData || !driverInfo) {
                    toast({
                      title: "Dados incompletos",
                      description: "Selecione um veículo e implemento antes de registrar o serviço",
                      variant: "destructive"
                    });
                    return;
                  }

                  try {
                    const startTime = new Date().toTimeString().slice(0,5);
                    
                    // Criar serviço no backend
                    const response = await fetch('/api/prancha-services', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify({
                        vehicleId: selectedVehicleData.id,
                        vehiclePlate: selectedVehicleData.plate,
                        vehicleName: selectedVehicleData.name,
                        implementId: selectedImplementData.id,
                        implementPlate: selectedImplementData.plate,
                        implementName: selectedImplementData.name,
                        driverId: driverInfo.id,
                        driverName: driverInfo.fullName,
                        driverRegistration: driverInfo.employeeNumber,
                        ocNumber,
                        startDate,
                        observations: `Serviço iniciado em ${startDate} às ${startTime}`
                      }),
                    });

                    if (response.ok) {
                      const newService = await response.json();
                      setActiveService(newService);
                      setPranchaService({
                        ocNumber,
                        startDate: new Date(startDate).toLocaleDateString('pt-BR'),
                        isActive: true,
                        startTime
                      });
                      
                      // Revalidar dados do serviço ativo
                      refetchActiveService();
                      
                      setShowPranchaOC(false);
                      
                      toast({
                        title: "O.C. de Prancha Registrada!",
                        description: `Serviço iniciado em ${new Date(startDate).toLocaleDateString('pt-BR')} às ${startTime}`,
                      });
                    } else {
                      throw new Error('Falha ao criar serviço');
                    }
                  } catch (error) {
                    console.error('Erro ao criar serviço:', error);
                    toast({
                      title: "Erro",
                      description: "Falha ao registrar o serviço. Tente novamente.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Confirmar Serviço
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Documentos */}
        <Dialog open={showDocuments} onOpenChange={setShowDocuments}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Documentos do Veículo</span>
              </DialogTitle>
              <DialogDescription>
                Acesse e baixe os documentos do veículo selecionado
              </DialogDescription>
            </DialogHeader>
            
            {selectedDocumentVehicle && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold text-blue-800">
                    {selectedDocumentVehicle.plate} - {selectedDocumentVehicle.name}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "CRLV", type: "crlv", description: "Certificado de Registro e Licenciamento" },
                    { name: "ANTT", type: "antt", description: "Registro na ANTT" },
                    { name: "Seguro", type: "seguro", description: "Apólice de Seguro" },
                    { name: "Tacógrafo", type: "tacogorafo", description: "Certificado do Tacógrafo" }
                  ].map((doc) => (
                    <div 
                      key={doc.type}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(doc.name)}
                        className="ml-3"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowDocuments(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Aviso Pré-Checklist */}
        <Dialog open={showPreChecklistWarning} onOpenChange={setShowPreChecklistWarning}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Aviso de Segurança</span>
              </DialogTitle>
              <DialogDescription>
                Leia atentamente antes de prosseguir
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ ATENÇÃO: Se detectar vazamentos ou falhas, NÃO inicie a operação. 
                  Comunique imediatamente a manutenção.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Declaro que sou responsável pelo preenchimento correto de todas as informações do checklist e pela verificação completa do veículo.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPreChecklistWarning(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowPreChecklistWarning(false);
                    setShowChecklist(true);
                  }}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Checklist de Saída */}
        <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
          <DialogContent className="max-w-md max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <span>Checklist de Saída</span>
              </DialogTitle>
              <DialogDescription>
                Preencha todos os itens obrigatórios
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Data e hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input type="time" defaultValue={new Date().toTimeString().slice(0,5)} />
                </div>
              </div>

              {/* Base de saída */}
              <div>
                <Label>Base de Saída *</Label>
                <Select value={selectedBase} onValueChange={setSelectedBase}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a base de saída" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="matriz">Matriz</SelectItem>
                    <SelectItem value="base2">Base 2</SelectItem>
                    <SelectItem value="base3">Base 3</SelectItem>
                    <SelectItem value="base4">Base 4</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Placas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Placa Tração</Label>
                  <Input value={selectedVehicleData?.plate || ""} readOnly />
                </div>
                <div>
                  <Label>Placa Implemento</Label>
                  <Input value={selectedImplementData?.plate || ""} readOnly />
                </div>
              </div>

              {/* KM atual */}
              <div>
                <Label>KM Atual</Label>
                <Input type="number" placeholder="Ex: 125000" />
              </div>

              {/* Lista de verificação */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Lista de Verificação</Label>
                {[
                  "Documentos válidos",
                  "Cartão de abastecimento",
                  "Níveis de óleo e água",
                  "Elétrica, faróis, buzina, retrovisores",
                  "Pneus e calibragem",
                  "Equipamentos obrigatórios (extintor, triângulo)",
                  "Cintas, catracas, lonas"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* Observações */}
              <div>
                <Label>Observações</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>

              {/* Upload de foto */}
              <div>
                <Label>Foto Obrigatória *</Label>
                <input
                  type="file"
                  accept="image/*"
                  capture="environment"
                  className="hidden"
                  id="checklist-photo"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      toast({
                        title: "Foto capturada!",
                        description: `Arquivo: ${e.target.files[0].name}`,
                      });
                    }
                  }}
                />
                <label
                  htmlFor="checklist-photo"
                  className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center block cursor-pointer hover:border-gray-400 transition-colors"
                >
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Toque para adicionar foto</p>
                </label>
              </div>

              <Button 
                className="w-full bg-green-600 hover:bg-green-700"
                onClick={async () => {
                  if (!selectedVehicleData || !driverInfo) {
                    toast({
                      title: "Dados incompletos",
                      description: "Selecione um veículo antes de enviar o checklist",
                      variant: "destructive"
                    });
                    return;
                  }

                  try {
                    // Coletar dados do formulário
                    const formData = new FormData();
                    const photoInput = document.getElementById('checklist-photo') as HTMLInputElement;
                    const kmInput = document.querySelector('input[type="number"]') as HTMLInputElement;
                    const observationsTextarea = document.querySelector('textarea') as HTMLTextAreaElement;
                    
                    // Verificar campos obrigatórios
                    if (!selectedBase) {
                      toast({
                        title: "Campo obrigatório",
                        description: "Selecione a base de saída",
                        variant: "destructive"
                      });
                      return;
                    }

                    if (!photoInput?.files?.[0]) {
                      toast({
                        title: "Foto obrigatória",
                        description: "Adicione uma foto antes de enviar",
                        variant: "destructive"
                      });
                      return;
                    }

                    // Coletar checklist marcado
                    const checkboxes = document.querySelectorAll('input[type="checkbox"]');
                    const checklistItems: Record<string, boolean> = {};
                    checkboxes.forEach((checkbox, index) => {
                      const labels = [
                        "Documentos válidos",
                        "Cartão de abastecimento", 
                        "Níveis de óleo e água",
                        "Elétrica, faróis, buzina, retrovisores",
                        "Pneus e calibragem",
                        "Equipamentos obrigatórios (extintor, triângulo)",
                        "Cintas, catracas, lonas"
                      ];
                      checklistItems[labels[index]] = (checkbox as HTMLInputElement).checked;
                    });

                    // Criar dados do checklist
                    const checklistData = {
                      vehicleId: selectedVehicleData.id,
                      vehiclePlate: selectedVehicleData.plate,
                      vehicleName: selectedVehicleData.name,
                      implementId: selectedImplementData?.id,
                      implementPlate: selectedImplementData?.plate,
                      implementName: selectedImplementData?.name,
                      driverId: driverInfo.id,
                      driverName: driverInfo.fullName,
                      driverRegistration: driverInfo.employeeNumber,
                      exitDate: new Date().toISOString().split('T')[0],
                      exitTime: new Date().toTimeString().slice(0,5),
                      baseOrigin: selectedBase,
                      currentKm: parseInt(kmInput?.value || '0'),
                      exitChecklist: checklistItems,
                      exitObservations: observationsTextarea?.value || '',
                      attachmentPath: photoInput.files[0].name
                    };

                    const response = await fetch('/api/checklists', {
                      method: 'POST',
                      headers: {
                        'Content-Type': 'application/json',
                      },
                      body: JSON.stringify(checklistData),
                    });

                    if (response.ok) {
                      setShowChecklist(false);
                      toast({
                        title: "Checklist enviado!",
                        description: "Checklist de saída registrado com sucesso",
                      });
                    } else {
                      throw new Error('Falha ao enviar checklist');
                    }
                  } catch (error) {
                    console.error('Erro ao enviar checklist:', error);
                    toast({
                      title: "Erro",
                      description: "Falha ao enviar checklist. Tente novamente.",
                      variant: "destructive"
                    });
                  }
                }}
              >
                Enviar Checklist
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Solicitação de Manutenção */}
        <Dialog open={showMaintenanceRequest} onOpenChange={setShowMaintenanceRequest}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                <span>Solicitação de Manutenção</span>
              </DialogTitle>
              <DialogDescription>
                Solicite manutenção para veículo ou implemento
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Placa do Veículo */}
              <div>
                <Label>Placa do Veículo</Label>
                <select className="w-full p-2 border rounded-md">
                  {selectedVehicleData && (
                    <option value={selectedVehicleData.plate}>
                      {selectedVehicleData.plate} - Tração
                    </option>
                  )}
                  {selectedImplementData && (
                    <option value={selectedImplementData.plate}>
                      {selectedImplementData.plate} - Implemento
                    </option>
                  )}
                </select>
              </div>

              {/* Descrição da solicitação */}
              <div>
                <Label>Descrição da Solicitação *</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={4}
                  placeholder="Descreva o que precisa de manutenção..."
                  required
                />
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Enviar Solicitação
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Comunicação de Sinistro */}
        <Dialog open={showMaintenanceCommunication} onOpenChange={setShowMaintenanceCommunication}>
          <DialogContent className="max-w-md max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-red-600" />
                <span>Comunicação de Sinistro</span>
              </DialogTitle>
              <DialogDescription>
                Registre acidentes e ocorrências
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Data e hora do sinistro */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data do Sinistro</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label>Hora do Sinistro</Label>
                  <Input type="time" defaultValue={new Date().toTimeString().slice(0,5)} />
                </div>
              </div>

              {/* Placa da tração */}
              <div>
                <Label>Placa da Tração</Label>
                <Input value={selectedVehicleData?.plate || ""} readOnly />
              </div>

              {/* Local e endereço */}
              <div>
                <Label>Local e Endereço *</Label>
                <div className="space-y-2">
                  <Input placeholder="Nome do local (ex: BR-101, km 150)" />
                  <div className="flex space-x-2">
                    <Input placeholder="Endereço completo" className="flex-1" />
                    <Button variant="outline" size="sm">
                      <MapPin className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Tipo de colisão */}
              <div>
                <Label>Tipo de Colisão</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Selecione o tipo</option>
                  <option value="frontal">Frontal</option>
                  <option value="traseira">Traseira</option>
                  <option value="lateral">Lateral</option>
                  <option value="capotamento">Capotamento</option>
                  <option value="tombamento">Tombamento</option>
                  <option value="abalroamento">Abalroamento</option>
                  <option value="outros">Outros</option>
                </select>
              </div>

              {/* Houve vítima */}
              <div>
                <Label>Houve Vítima?</Label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="vitima" value="sim" />
                    <span>Sim</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input type="radio" name="vitima" value="nao" />
                    <span>Não</span>
                  </label>
                </div>
              </div>

              {/* Condições de trajeto e carga */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Condições do Trajeto</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Selecione</option>
                    <option value="seco">Pista Seca</option>
                    <option value="molhada">Pista Molhada</option>
                    <option value="obras">Em Obras</option>
                    <option value="buracos">Com Buracos</option>
                  </select>
                </div>
                <div>
                  <Label>Situação da Carga</Label>
                  <select className="w-full p-2 border rounded-md">
                    <option value="">Selecione</option>
                    <option value="carregado">Carregado</option>
                    <option value="vazio">Vazio</option>
                    <option value="parcial">Carga Parcial</option>
                  </select>
                </div>
              </div>

              {/* Quem sofreu a avaria */}
              <div>
                <Label>Quem Sofreu a Avaria</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Selecione</option>
                  <option value="apenas-nosso">Apenas nosso veículo</option>
                  <option value="terceiros">Veículo de terceiros</option>
                  <option value="ambos">Ambos os veículos</option>
                  <option value="propriedade">Propriedade pública/privada</option>
                </select>
              </div>

              {/* Percepção de gravidade */}
              <div>
                <Label>Percepção de Gravidade</Label>
                <select className="w-full p-2 border rounded-md">
                  <option value="">Selecione</option>
                  <option value="leve">Leve - Apenas danos materiais menores</option>
                  <option value="moderada">Moderada - Danos materiais significativos</option>
                  <option value="grave">Grave - Danos severos ou ferimentos</option>
                  <option value="muito-grave">Muito Grave - Risco de vida</option>
                </select>
              </div>

              {/* Campo de observações */}
              <div>
                <Label>Observações</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={3}
                  placeholder="Descreva detalhadamente o que aconteceu..."
                />
              </div>

              {/* Upload de imagens */}
              <div>
                <Label>Fotos do Sinistro (1 a 6 fotos) *</Label>
                <p className="text-xs text-gray-600 mb-2">Mínimo 1 foto obrigatória</p>
                <div className="grid grid-cols-2 gap-2">
                  {[1, 2, 3, 4, 5, 6].map((num) => (
                    <div key={num}>
                      <input
                        type="file"
                        accept="image/*"
                        capture="environment"
                        className="hidden"
                        id={`sinistro-photo-${num}`}
                        onChange={(e) => {
                          if (e.target.files && e.target.files[0]) {
                            toast({
                              title: `Foto ${num} capturada!`,
                              description: e.target.files[0].name,
                            });
                          }
                        }}
                      />
                      <label
                        htmlFor={`sinistro-photo-${num}`}
                        className="border-2 border-dashed border-gray-300 rounded-lg p-2 text-center block cursor-pointer hover:border-gray-400 transition-colors"
                      >
                        <Camera className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                        <p className="text-xs text-gray-600">Foto {num}</p>
                      </label>
                    </div>
                  ))}
                </div>
              </div>

              <div className="flex space-x-3">
                <Button className="flex-1 bg-red-600 hover:bg-red-700">
                  Registrar Sinistro
                </Button>
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => {
                    // Simular abertura do WhatsApp
                    window.open('https://wa.me/5511999999999?text=Emergência%20-%20Sinistro%20reportado', '_blank');
                  }}
                >
                  WhatsApp Segurança
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Registro de Manutenção em Viagem */}
        <Dialog open={showTravelMaintenance} onOpenChange={setShowTravelMaintenance}>
          <DialogContent className="max-w-md max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-purple-600" />
                <span>Manutenção em Viagem</span>
              </DialogTitle>
              <DialogDescription>
                Registre manutenção feita fora da base
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Placa do veículo */}
              <div>
                <Label>Placa do Veículo</Label>
                <Input value={selectedVehicleData?.plate || ""} readOnly />
              </div>

              {/* Data do serviço */}
              <div>
                <Label>Data do Serviço</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Nome do fornecedor */}
              <div>
                <Label>Nome do Fornecedor *</Label>
                <Input placeholder="Ex: Oficina São José" required />
              </div>

              {/* Valor do serviço */}
              <div>
                <Label>Valor do Serviço (R$)</Label>
                <Input type="number" step="0.01" placeholder="0,00" />
              </div>

              {/* Tipo de manutenção */}
              <div>
                <Label>Tipo de Manutenção</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Preventiva</option>
                  <option>Corretiva</option>
                  <option>Emergencial</option>
                  <option>Troca de peças</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <Label>Observações</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={3}
                  placeholder="Descreva o serviço realizado..."
                />
              </div>

              {/* Upload de fotos */}
              <div className="space-y-3">
                <Label>Fotos</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <Camera className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">Foto do Serviço</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <FileText className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">Nota Fiscal</p>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Registrar Manutenção
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Finalização de Serviço */}
        <Dialog open={showFinalizationModal} onOpenChange={setShowFinalizationModal}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Package className="h-5 w-5 text-red-600" />
                <span>Finalizar Serviço de Prancha</span>
              </DialogTitle>
              <DialogDescription>
                Confirme a finalização do serviço e adicione observações
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Informações do serviço */}
              <div className="bg-purple-50 p-3 rounded-lg">
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="font-medium text-purple-600">O.C.:</span>
                    <p>{activeService?.ocNumber}</p>
                  </div>
                  <div>
                    <span className="font-medium text-purple-600">Dias de Serviço:</span>
                    <p className="font-bold text-green-600">{getActiveDays()} dias</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-purple-600">Veículo:</span>
                    <p>{activeService?.vehiclePlate} - {activeService?.vehicleName}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="font-medium text-purple-600">Implemento:</span>
                    <p>{activeService?.implementPlate} - {activeService?.implementName}</p>
                  </div>
                </div>
              </div>

              {/* Notas de finalização */}
              <div>
                <Label>Observações de Finalização *</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={4}
                  placeholder="Descreva como foi o serviço, problemas encontrados, etc..."
                  value={finalizationNotes}
                  onChange={(e) => setFinalizationNotes(e.target.value)}
                />
              </div>

              {/* Upload de anexo */}
              <div>
                <Label>Anexar Documento (Opcional)</Label>
                <input
                  type="file"
                  accept=".pdf,.jpg,.jpeg,.png"
                  className="w-full p-2 border rounded-md"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setFinalizationFile(e.target.files[0]);
                    }
                  }}
                />
                <p className="text-xs text-gray-500 mt-1">
                  Formatos aceitos: PDF, JPG, PNG
                </p>
                {finalizationFile && (
                  <p className="text-xs text-green-600 mt-1">
                    ✓ Arquivo selecionado: {finalizationFile.name}
                  </p>
                )}
              </div>

              <div className="flex space-x-2">
                <Button 
                  className="flex-1 bg-gray-500 hover:bg-gray-600"
                  onClick={() => setShowFinalizationModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-red-600 hover:bg-red-700"
                  onClick={async () => {
                    if (!finalizationNotes.trim()) {
                      toast({
                        title: "Campo obrigatório",
                        description: "Preencha as observações de finalização",
                        variant: "destructive",
                      });
                      return;
                    }

                    if (!activeService) return;

                    try {
                      const formData = new FormData();
                      formData.append('notes', finalizationNotes);
                      if (finalizationFile) {
                        formData.append('attachment', finalizationFile);
                      }

                      const response = await fetch(`/api/prancha-services/${activeService.id}/finalize`, {
                        method: 'PATCH',
                        body: formData
                      });

                      if (response.ok) {
                        setActiveService(null);
                        setPranchaService(null);
                        setShowFinalizationModal(false);
                        setFinalizationNotes('');
                        setFinalizationFile(null);
                        
                        toast({
                          title: "Serviço Finalizado",
                          description: "Serviço de prancha finalizado com sucesso",
                          variant: "default",
                        });
                      } else {
                        throw new Error('Falha ao finalizar serviço');
                      }
                    } catch (error) {
                      toast({
                        title: "Erro",
                        description: "Falha ao finalizar serviço",
                        variant: "destructive",
                      });
                    }
                  }}
                >
                  Finalizar Serviço
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Dados do Usuário */}
        <Dialog open={showUserProfile} onOpenChange={setShowUserProfile}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Meus Dados Pessoais</DialogTitle>
              <DialogDescription>
                Visualize suas informações pessoais e profissionais
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center space-x-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage src={driverInfo.profilePhoto} />
                  <AvatarFallback className="bg-blue-500 text-white text-lg">
                    {driverInfo.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 className="font-semibold text-lg">{driverInfo.fullName}</h3>
                  <p className="text-sm text-gray-600">{driverInfo.position}</p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Email</Label>
                  <p className="font-medium">{driverInfo.email}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Matrícula</Label>
                  <p className="font-medium">{driverInfo.employeeNumber}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Telefone</Label>
                  <p className="font-medium">{driverInfo.phone}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Departamento</Label>
                  <p className="font-medium">{driverInfo.department}</p>
                </div>
                <div>
                  <Label className="text-gray-600">CNH</Label>
                  <p className="font-medium">{driverInfo.driverLicense}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Categoria</Label>
                  <p className="font-medium">{driverInfo.driverLicenseCategory}</p>
                </div>
                <div className="col-span-2">
                  <Label className="text-gray-600">Validade da CNH</Label>
                  <p className="font-medium text-blue-600">
                    {new Date(driverInfo.driverLicenseExpiry).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Configurações de Segurança */}
        <Dialog open={showSecuritySettings} onOpenChange={setShowSecuritySettings}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Configurações de Segurança</DialogTitle>
              <DialogDescription>
                Gerencie suas configurações de segurança e acesso
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Lock className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="font-medium">Alterar Senha</p>
                    <p className="text-sm text-gray-600">Altere sua senha de acesso</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Alterar
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <Shield className="h-5 w-5 text-green-600" />
                  <div>
                    <p className="font-medium">Sessões Ativas</p>
                    <p className="text-sm text-gray-600">Visualizar dispositivos conectados</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Visualizar
                </Button>
              </div>
              
              <div className="flex items-center justify-between p-4 border rounded-lg">
                <div className="flex items-center space-x-3">
                  <UserCircle className="h-5 w-5 text-purple-600" />
                  <div>
                    <p className="font-medium">Histórico de Acesso</p>
                    <p className="text-sm text-gray-600">Últimos acessos ao sistema</p>
                  </div>
                </div>
                <Button variant="outline" size="sm">
                  Ver Histórico
                </Button>
              </div>
              
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                  <AlertTriangle className="h-5 w-5 text-yellow-600 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-800">Dica de Segurança</p>
                    <p className="text-sm text-yellow-700">
                      Sempre faça logout ao usar dispositivos compartilhados
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}