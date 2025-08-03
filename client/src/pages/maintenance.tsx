import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { 
  Wrench, 
  FileText, 
  Package, 
  Circle, 
  AlertCircle,
  Truck,
  Calendar,
  DollarSign,
  BarChart3,
  Plus,
  Search,
  Filter,
  Eye,
  ArrowRight,
  ArrowLeft,
  X,
  Check,
  Printer,
  Paperclip,
  Download,
  Settings,
  Clock,
  CheckCircle
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import type { MaintenanceRequest, Vehicle, Driver } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";

// Schema de validação para nova solicitação de manutenção
const newMaintenanceRequestSchema = z.object({
  vehicleId: z.string().min(1, "Placa é obrigatória"),
  driverName: z.string().min(1, "Nome do motorista é obrigatório"),
  requestType: z.enum(["corrective", "preventive"], {
    required_error: "Tipo de manutenção é obrigatório"
  }),
  description: z.string().optional(),
  preventiveOrder: z.string().optional(),
  preventiveLevel: z.string().optional(),
});

// Schema para lançamento de custos seguindo PRD
const costEntrySchema = z.object({
  invoiceNumber: z.string().min(1, "Número da nota fiscal é obrigatório"),
  invoiceDate: z.string().min(1, "Data da nota é obrigatória"),
  supplier: z.string().min(1, "Nome do fornecedor é obrigatório"),
  vehiclePlate: z.string().optional(),
  maintenanceType: z.enum(["preventive", "corrective"]),
  description: z.string().min(1, "Descrição é obrigatória"),
  classification: z.string().min(1, "Classificação é obrigatória"),
  quantity: z.number().min(0.01, "Quantidade deve ser maior que 0"),
  unitPrice: z.number().min(0.01, "Valor unitário deve ser maior que 0"),
  totalValue: z.number().min(0.01, "Valor total deve ser maior que 0"),
});

// Classificações pré-definidas conforme PRD
const maintenanceClassifications = [
  "Mecânica",
  "Elétrica", 
  "Estrutural",
  "Acessórios",
  "Pintura",
  "Freio",
  "Ar-condicionado",
  "Lanternagem"
];

type NewMaintenanceRequestForm = z.infer<typeof newMaintenanceRequestSchema>;
type CostEntryForm = z.infer<typeof costEntrySchema>;

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState("requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const [showNewRequestModal, setShowNewRequestModal] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<MaintenanceRequest | null>(null);
  const [showAdvanceModal, setShowAdvanceModal] = useState(false);
  const [showFinishModal, setShowFinishModal] = useState(false);
  const [showCloseModal, setShowCloseModal] = useState(false);
  const [showCostModal, setShowCostModal] = useState(false);
  const { toast } = useToast();

  // Buscar requisições de manutenção
  const { data: maintenanceRequests = [], isLoading: isLoadingRequests } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/requests"],
  });

  // Buscar veículos em manutenção
  const { data: vehiclesInMaintenance = [], isLoading: isLoadingVehicles } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/vehicles-in-maintenance"],
  });

  // Buscar veículos disponíveis
  const { data: vehicles = [] } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Buscar motoristas
  const { data: drivers = [] } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  // Formulário para nova solicitação
  const form = useForm<NewMaintenanceRequestForm>({
    resolver: zodResolver(newMaintenanceRequestSchema),
    defaultValues: {
      vehicleId: "",
      driverName: "",
      requestType: "corrective",
      description: "",
      preventiveOrder: "",
      preventiveLevel: "",
    },
  });

  // Formulário para lançamento de custos
  const costForm = useForm<CostEntryForm>({
    resolver: zodResolver(costEntrySchema),
    defaultValues: {
      invoiceNumber: "",
      invoiceDate: "",
      supplier: "",
      vehiclePlate: "",
      maintenanceType: "corrective",
      description: "",
      classification: "",
      quantity: 0,
      unitPrice: 0,
      totalValue: 0,
    },
  });

  // Mutation para criar nova solicitação
  const createMaintenanceRequestMutation = useMutation({
    mutationFn: async (data: NewMaintenanceRequestForm) => {
      const response = await fetch("/api/maintenance/requests", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        throw new Error("Erro ao criar solicitação de manutenção");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Solicitação de manutenção criada com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/maintenance/requests"] });
      form.reset();
      setShowNewRequestModal(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar solicitação de manutenção",
        variant: "destructive",
      });
    },
  });

  // Função para submeter nova solicitação
  const onSubmitNewRequest = (data: NewMaintenanceRequestForm) => {
    // Validações específicas baseadas no tipo
    if (data.requestType === "corrective" && !data.description) {
      form.setError("description", {
        type: "manual",
        message: "Descrição é obrigatória para manutenção corretiva"
      });
      return;
    }

    if (data.requestType === "preventive") {
      if (!data.preventiveOrder) {
        form.setError("preventiveOrder", {
          type: "manual",
          message: "Ordem é obrigatória para manutenção preventiva"
        });
        return;
      }
      if (!data.preventiveLevel) {
        form.setError("preventiveLevel", {
          type: "manual",
          message: "Nível é obrigatório para manutenção preventiva"
        });
        return;
      }
    }

    createMaintenanceRequestMutation.mutate(data);
  };

  // Funções para manipular o fluxo do Kanban
  const handleAdvanceRequest = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowAdvanceModal(true);
  };

  const handleFinishMaintenance = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowFinishModal(true);
  };

  const handleCloseMaintenance = (request: MaintenanceRequest) => {
    setSelectedRequest(request);
    setShowCloseModal(true);
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (confirm("Tem certeza que deseja excluir esta solicitação?")) {
      try {
        await apiRequest(`/api/maintenance/requests/${requestId}`, {
          method: "DELETE",
        });
        toast({
          title: "Sucesso!",
          description: "Solicitação excluída com sucesso.",
        });
        queryClient.invalidateQueries({ queryKey: ["/api/maintenance/requests"] });
      } catch (error) {
        toast({
          title: "Erro",
          description: "Erro ao excluir solicitação.",
          variant: "destructive",
        });
      }
    }
  };

  // Função para calcular valor total automaticamente
  const calculateTotalValue = () => {
    const quantity = costForm.watch("quantity");
    const unitPrice = costForm.watch("unitPrice");
    const totalValue = quantity * unitPrice;
    costForm.setValue("totalValue", totalValue);
  };

  // Função para submeter lançamento de custos
  const onSubmitCostEntry = (data: CostEntryForm) => {
    console.log("Lançamento de custos:", data);
    toast({
      title: "Sucesso",
      description: "Custo lançado com sucesso!",
    });
    costForm.reset();
    setShowCostModal(false);
  };

  // Estatísticas
  const stats = {
    openRequests: maintenanceRequests.filter(r => r.status === 'open').length,
    inProgress: maintenanceRequests.filter(r => r.status === 'in_progress').length,
    completed: maintenanceRequests.filter(r => r.status === 'completed').length,
    totalCost: 0, // TODO: Calcular custo total
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      open: { label: "Aberta", className: "bg-blue-100 text-blue-800" },
      scheduled: { label: "Agendada", className: "bg-yellow-100 text-yellow-800" },
      in_progress: { label: "Em Andamento", className: "bg-orange-100 text-orange-800" },
      completed: { label: "Concluída", className: "bg-green-100 text-green-800" },
      closed: { label: "Fechada", className: "bg-gray-100 text-gray-800" },
    };

    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.open;
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getTypeIcon = (type: string) => {
    return type === 'preventive' ? <Calendar className="h-4 w-4" /> : <AlertCircle className="h-4 w-4" />;
  };

  const filteredRequests = maintenanceRequests.filter(request => {
    const matchesSearch = request.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         request.vehicleId.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === "all" || request.status === statusFilter;
    const matchesType = typeFilter === "all" || request.requestType === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[#0C29AB]">Manutenção</h1>
          <p className="text-muted-foreground">Sistema integrado de manutenção e controle</p>
        </div>
        <Dialog open={showNewRequestModal} onOpenChange={setShowNewRequestModal}>
          <DialogTrigger asChild>
            <Button className="bg-[#0C29AB] hover:bg-[#0C29AB]/90">
              <Plus className="mr-2 h-4 w-4" />
              Nova Solicitação
            </Button>
          </DialogTrigger>
        </Dialog>
      </div>

      {/* Estatísticas */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">OS Abertas</CardTitle>
            <FileText className="h-4 w-4 text-[#0C29AB]" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.openRequests}</div>
            <p className="text-xs text-muted-foreground">Aguardando início</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Andamento</CardTitle>
            <Wrench className="h-4 w-4 text-orange-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.inProgress}</div>
            <p className="text-xs text-muted-foreground">{vehiclesInMaintenance.length} veículos</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <BarChart3 className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.completed}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Custo Total</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">R$ {stats.totalCost.toFixed(2)}</div>
            <p className="text-xs text-muted-foreground">Este mês</p>
          </CardContent>
        </Card>
      </div>

      {/* Tabs de navegação */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="requests">
            <FileText className="mr-2 h-4 w-4" />
            Kanban de Processos
          </TabsTrigger>
          <TabsTrigger value="costs">
            <DollarSign className="mr-2 h-4 w-4" />
            Lançamento de Custos
          </TabsTrigger>
          <TabsTrigger value="tires">
            <Circle className="mr-2 h-4 w-4" />
            Controle de Pneus
          </TabsTrigger>
          <TabsTrigger value="control">
            <BarChart3 className="mr-2 h-4 w-4" />
            Controle por Veículo
          </TabsTrigger>
          <TabsTrigger value="reports">
            <FileText className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo da aba de Ordens de Serviço - Layout Kanban */}
        <TabsContent value="requests" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#0C29AB]">Fluxo de Manutenção - Kanban</h2>
            <Button 
              onClick={() => setShowNewRequestModal(true)}
              className="bg-[#0C29AB] hover:bg-[#0C29AB]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Nova Solicitação
            </Button>
          </div>

          {/* Layout Kanban com 4 colunas */}
          <div className="grid grid-cols-4 gap-4 min-h-[600px]">
            
            {/* Coluna 1: Solicitações */}
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Solicitações</h3>
                <Badge className="bg-blue-100 text-blue-800">
                  {maintenanceRequests.filter(r => r.status === 'open').length}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {maintenanceRequests.filter(r => r.status === 'open').map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-blue-500">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="text-xs bg-blue-100 text-blue-800">
                          {request.orderNumber}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="ghost" className="h-6 w-6 p-0" title="Visualizar">
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0" 
                            title="Avançar para manutenção"
                            onClick={() => handleAdvanceRequest(request)}
                          >
                            <ArrowRight className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 text-red-600 hover:text-red-700" 
                            title="Excluir"
                            onClick={() => handleDeleteRequest(request.id)}
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        📅 {format(new Date(request.createdAt || new Date()), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      
                      <div className="text-xs text-gray-800">
                        🚛 {request.vehicleId}
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        👤 {request.reportedBy}
                      </div>
                      
                      <div className="flex items-center space-x-1 text-xs">
                        {getTypeIcon(request.requestType)}
                        <span className="text-gray-600">
                          {request.requestType === 'preventive' ? 'Preventiva' : 'Corretiva'}
                        </span>
                      </div>
                      
                      {request.description && (
                        <div className="text-xs text-gray-600 bg-gray-50 p-2 rounded">
                          📝 {request.description.length > 50 ? 
                            `${request.description.substring(0, 50)}...` : 
                            request.description}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {maintenanceRequests.filter(r => r.status === 'open').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Wrench className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma solicitação</p>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 2: Veículos em Manutenção */}
            <div className="bg-red-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Em Manutenção</h3>
                <Badge className="bg-red-100 text-red-800">
                  {maintenanceRequests.filter(r => r.status === 'in_progress').length}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {maintenanceRequests.filter(r => r.status === 'in_progress').map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-red-500">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="text-xs bg-red-100 text-red-800">
                          {request.orderNumber}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0" 
                            title="Voltar para solicitações"
                          >
                            <ArrowLeft className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0" 
                            title="Imprimir O.S."
                          >
                            <Printer className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 text-green-600 hover:text-green-700" 
                            title="Finalizar manutenção"
                            onClick={() => handleFinishMaintenance(request)}
                          >
                            <Check className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        📅 {format(new Date(request.startDate || new Date()), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      
                      <div className="text-xs text-gray-800">
                        🚛 {request.vehicleId}
                      </div>
                      
                      {request.mechanic && (
                        <div className="text-xs text-gray-600">
                          🔧 {request.mechanic}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1 text-xs">
                        {getTypeIcon(request.requestType)}
                        <span className="text-gray-600">
                          {request.requestType === 'preventive' ? 'Preventiva' : 'Corretiva'}
                        </span>
                      </div>
                      
                      {(request.daysStoped || 0) > 0 && (
                        <div className="text-xs bg-orange-100 text-orange-800 px-2 py-1 rounded">
                          ⏱️ {request.daysStoped} dias parado
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {maintenanceRequests.filter(r => r.status === 'in_progress').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Settings className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhum veículo em manutenção</p>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 3: Finalizado - Aguardando Fechamento */}
            <div className="bg-yellow-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Aguardando Fechamento</h3>
                <Badge className="bg-yellow-100 text-yellow-800">
                  {maintenanceRequests.filter(r => r.status === 'completed').length}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {maintenanceRequests.filter(r => r.status === 'completed').map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-yellow-500">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="text-xs bg-yellow-100 text-yellow-800">
                          {request.orderNumber}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0" 
                            title="Visualizar detalhes"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0" 
                            title="Anexar documentos"
                          >
                            <Paperclip className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0 text-blue-600 hover:text-blue-700" 
                            title="Encerrar definitivamente"
                            onClick={() => handleCloseMaintenance(request)}
                          >
                            <CheckCircle className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        📅 {format(new Date(request.endDate || new Date()), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      
                      <div className="text-xs text-gray-800">
                        🚛 {request.vehicleId}
                      </div>
                      
                      {request.mechanic && (
                        <div className="text-xs text-gray-600">
                          🔧 {request.mechanic}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1 text-xs">
                        {getTypeIcon(request.requestType)}
                        <span className="text-gray-600">
                          {request.requestType === 'preventive' ? 'Preventiva' : 'Corretiva'}
                        </span>
                      </div>
                      
                      {request.actualCost && (
                        <div className="text-xs text-green-600">
                          💰 R$ {request.actualCost.toFixed(2)}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
                
                {maintenanceRequests.filter(r => r.status === 'completed').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <Clock className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma manutenção finalizada</p>
                  </div>
                )}
              </div>
            </div>

            {/* Coluna 4: Concluído */}
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-semibold text-gray-800">Concluído</h3>
                <Badge className="bg-green-100 text-green-800">
                  {maintenanceRequests.filter(r => r.status === 'closed').length}
                </Badge>
              </div>
              
              <div className="space-y-3 max-h-[500px] overflow-y-auto">
                {maintenanceRequests.filter(r => r.status === 'closed').map((request) => (
                  <div key={request.id} className="bg-white rounded-lg p-3 shadow-sm border-l-4 border-green-500">
                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Badge className="text-xs bg-green-100 text-green-800">
                          {request.orderNumber}
                        </Badge>
                        <div className="flex space-x-1">
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0" 
                            title="Visualizar histórico completo"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-6 w-6 p-0" 
                            title="Download de documentos"
                          >
                            <Download className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                      
                      <div className="text-xs text-gray-600">
                        📅 {format(new Date(request.endDate || new Date()), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                      
                      <div className="text-xs text-gray-800">
                        🚛 {request.vehicleId}
                      </div>
                      
                      {request.mechanic && (
                        <div className="text-xs text-gray-600">
                          🔧 {request.mechanic}
                        </div>
                      )}
                      
                      <div className="flex items-center space-x-1 text-xs">
                        {getTypeIcon(request.requestType)}
                        <span className="text-gray-600">
                          {request.requestType === 'preventive' ? 'Preventiva' : 'Corretiva'}
                        </span>
                      </div>
                      
                      {request.actualCost && (
                        <div className="text-xs text-green-600">
                          💰 R$ {request.actualCost.toFixed(2)}
                        </div>
                      )}

                      <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded text-center">
                        ✅ Concluído
                      </div>
                    </div>
                  </div>
                ))}
                
                {maintenanceRequests.filter(r => r.status === 'closed').length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <CheckCircle className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Nenhuma manutenção concluída</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </TabsContent>



        {/* Aba de Lançamento de Custos */}
        <TabsContent value="costs" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#0C29AB]">💰 Lançamento de Custos</h2>
            <Button 
              onClick={() => setShowCostModal(true)}
              className="bg-[#0C29AB] hover:bg-[#0C29AB]/90"
            >
              <Plus className="h-4 w-4 mr-2" />
              Novo Lançamento
            </Button>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Custos Registrados</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <DollarSign className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Nenhum custo lançado ainda</p>
                <p className="text-sm">Clique em "Novo Lançamento" para registrar custos</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba de Controle de Pneus */}
        <TabsContent value="tires" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#0C29AB]">🛞 Controle de Pneus</h2>
            <div className="flex space-x-2">
              <Button 
                variant="outline"
                className="border-[#0C29AB] text-[#0C29AB] hover:bg-[#0C29AB] hover:text-white"
              >
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
              <Button 
                className="bg-[#0C29AB] hover:bg-[#0C29AB]/90"
              >
                <Plus className="h-4 w-4 mr-2" />
                Novo Pneu
              </Button>
            </div>
          </div>

          {/* Dashboard de Indicadores */}
          <div className="grid gap-4 md:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total de Pneus</CardTitle>
                <Circle className="h-4 w-4 text-[#0C29AB]" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">248</div>
                <p className="text-xs text-muted-foreground">Cadastrados no sistema</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Uso</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">186</div>
                <p className="text-xs text-muted-foreground">Instalados nos veículos</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Em Recapagem</CardTitle>
                <Settings className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">24</div>
                <p className="text-xs text-muted-foreground">Processo de reforma</p>
              </CardContent>
            </Card>
            
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Alertas Ativos</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">12</div>
                <p className="text-xs text-muted-foreground">Necessitam atenção</p>
              </CardContent>
            </Card>
          </div>

          {/* Tabs internas do módulo de pneus */}
          <Tabs defaultValue="dashboard" className="space-y-4">
            <TabsList>
              <TabsTrigger value="dashboard">Dashboard</TabsTrigger>
              <TabsTrigger value="cadastro">Cadastro</TabsTrigger>
              <TabsTrigger value="movimentacoes">Movimentações</TabsTrigger>
              <TabsTrigger value="rodizios">Rodízios</TabsTrigger>
              <TabsTrigger value="recapagens">Recapagens</TabsTrigger>
              <TabsTrigger value="alertas">Alertas</TabsTrigger>
            </TabsList>

            {/* Dashboard */}
            <TabsContent value="dashboard" className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <Card>
                  <CardHeader>
                    <CardTitle>Status dos Pneus</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-green-500"></div>
                          <span className="text-sm">Ativo</span>
                        </div>
                        <span className="text-sm font-medium">186</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                          <span className="text-sm">Em Uso</span>
                        </div>
                        <span className="text-sm font-medium">38</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <div className="w-3 h-3 rounded-full bg-orange-500"></div>
                          <span className="text-sm">Recapagem</span>
                        </div>
                        <span className="text-sm font-medium">24</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle>Por Tipo</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Direcional</span>
                        <span className="text-sm font-medium">62</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Tração</span>
                        <span className="text-sm font-medium">124</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Arrasto</span>
                        <span className="text-sm font-medium">48</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm">Misto</span>
                        <span className="text-sm font-medium">14</span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Últimas Movimentações</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Circle className="h-4 w-4 text-[#0C29AB]" />
                        <div>
                          <p className="text-sm font-medium">Pneu #F2024001</p>
                          <p className="text-xs text-gray-600">Instalação - DEF-1234 - Eixo 2 Direito</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Hoje</div>
                        <div className="text-xs text-gray-600">14:30</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <Settings className="h-4 w-4 text-orange-600" />
                        <div>
                          <p className="text-sm font-medium">Pneu #F2024002</p>
                          <p className="text-xs text-gray-600">Recapagem - Officina Silva</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">Ontem</div>
                        <div className="text-xs text-gray-600">16:45</div>
                      </div>
                    </div>
                    
                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center space-x-3">
                        <ArrowRight className="h-4 w-4 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium">Pneu #F2024003</p>
                          <p className="text-xs text-gray-600">Rodízio - ABC-9876 - Eixo 1→2</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-sm">02/01</div>
                        <div className="text-xs text-gray-600">09:15</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Cadastro */}
            <TabsContent value="cadastro" className="space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Lista de Pneus Cadastrados</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {/* Filtros */}
                    <div className="flex space-x-4">
                      <div className="flex-1">
                        <Input 
                          placeholder="Buscar por número do fogo, marca, modelo..." 
                          className="w-full"
                        />
                      </div>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os status</SelectItem>
                          <SelectItem value="ativo">Ativo</SelectItem>
                          <SelectItem value="em_uso">Em uso</SelectItem>
                          <SelectItem value="recapagem">Recapagem</SelectItem>
                          <SelectItem value="descartado">Descartado</SelectItem>
                        </SelectContent>
                      </Select>
                      <Select defaultValue="all">
                        <SelectTrigger className="w-48">
                          <SelectValue placeholder="Tipo" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="all">Todos os tipos</SelectItem>
                          <SelectItem value="direcional">Direcional</SelectItem>
                          <SelectItem value="tracao">Tração</SelectItem>
                          <SelectItem value="arrasto">Arrasto</SelectItem>
                          <SelectItem value="misto">Misto</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    {/* Tabela */}
                    <div className="border rounded-lg overflow-hidden">
                      <table className="w-full">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="text-left p-3 text-sm font-medium">Nº Fogo</th>
                            <th className="text-left p-3 text-sm font-medium">Marca/Modelo</th>
                            <th className="text-left p-3 text-sm font-medium">Medida</th>
                            <th className="text-left p-3 text-sm font-medium">Tipo</th>
                            <th className="text-left p-3 text-sm font-medium">Vida</th>
                            <th className="text-left p-3 text-sm font-medium">Status</th>
                            <th className="text-left p-3 text-sm font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody>
                          <tr className="border-t">
                            <td className="p-3 text-sm font-mono">F2024001</td>
                            <td className="p-3 text-sm">Michelin XDA2</td>
                            <td className="p-3 text-sm">295/80R22.5</td>
                            <td className="p-3 text-sm">
                              <Badge variant="outline">Tração</Badge>
                            </td>
                            <td className="p-3 text-sm">2ª</td>
                            <td className="p-3 text-sm">
                              <Badge className="bg-green-100 text-green-800">Em uso</Badge>
                            </td>
                            <td className="p-3 text-sm">
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                          
                          <tr className="border-t">
                            <td className="p-3 text-sm font-mono">F2024002</td>
                            <td className="p-3 text-sm">Bridgestone R268</td>
                            <td className="p-3 text-sm">275/80R22.5</td>
                            <td className="p-3 text-sm">
                              <Badge variant="outline">Direcional</Badge>
                            </td>
                            <td className="p-3 text-sm">1ª</td>
                            <td className="p-3 text-sm">
                              <Badge className="bg-orange-100 text-orange-800">Recapagem</Badge>
                            </td>
                            <td className="p-3 text-sm">
                              <div className="flex space-x-1">
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <Eye className="h-3 w-3" />
                                </Button>
                                <Button size="sm" variant="ghost" className="h-6 w-6 p-0">
                                  <ArrowRight className="h-3 w-3" />
                                </Button>
                              </div>
                            </td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Movimentações */}
            <TabsContent value="movimentacoes" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Movimentações de Pneus</h3>
                <Button className="bg-[#0C29AB] hover:bg-[#0C29AB]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Movimentação
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Registros de Movimentação</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <ArrowRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma movimentação registrada ainda</p>
                    <p className="text-sm">Clique em "Nova Movimentação" para registrar</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Rodízios */}
            <TabsContent value="rodizios" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Controle de Rodízios</h3>
                <Button className="bg-[#0C29AB] hover:bg-[#0C29AB]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Novo Rodízio
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Rodízios</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-center py-8 text-muted-foreground">
                    <Settings className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhum rodízio registrado ainda</p>
                    <p className="text-sm">Clique em "Novo Rodízio" para registrar</p>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Recapagens */}
            <TabsContent value="recapagens" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Gestão de Recapagens</h3>
                <Button className="bg-[#0C29AB] hover:bg-[#0C29AB]/90">
                  <Plus className="h-4 w-4 mr-2" />
                  Nova Recapagem
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle>Pneus em Recapagem</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border rounded-lg p-4">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium">Pneu #F2024002</h4>
                          <p className="text-sm text-gray-600">Bridgestone R268 - 275/80R22.5</p>
                          <p className="text-sm text-gray-600">Empresa: Officina Silva</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">Em andamento</Badge>
                      </div>
                      <div className="mt-3 flex justify-between text-sm">
                        <span>Vida: 1ª → 2ª</span>
                        <span>Entrada: 02/01/2025</span>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Alertas */}
            <TabsContent value="alertas" className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-semibold">Sistema de Alertas</h3>
                <Button variant="outline" className="border-[#0C29AB] text-[#0C29AB]">
                  <Settings className="h-4 w-4 mr-2" />
                  Configurações
                </Button>
              </div>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-600" />
                    <span>Alertas Ativos</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="border-l-4 border-red-500 bg-red-50 p-4 rounded-r-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-red-800">Rodízio Necessário</h4>
                          <p className="text-sm text-red-700">Pneu #F2024005 - ABC-1234</p>
                          <p className="text-sm text-red-600">KM atual: 85.000 | Limite: 80.000</p>
                        </div>
                        <Badge variant="destructive">Alta</Badge>
                      </div>
                    </div>
                    
                    <div className="border-l-4 border-orange-500 bg-orange-50 p-4 rounded-r-lg">
                      <div className="flex justify-between items-start">
                        <div>
                          <h4 className="font-medium text-orange-800">Recapagem Recomendada</h4>
                          <p className="text-sm text-orange-700">Pneu #F2024007 - DEF-5678</p>
                          <p className="text-sm text-orange-600">Vida atual: 3ª | TWI: 1.5mm</p>
                        </div>
                        <Badge className="bg-orange-100 text-orange-800">Média</Badge>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </TabsContent>

        {/* Aba de Controle por Veículo */}
        <TabsContent value="control" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-[#0C29AB]">📈 Controle de Custo por Veículo</h2>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Análise por Placa</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <BarChart3 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                <p>Controle de custos por veículo</p>
                <p className="text-sm">Em desenvolvimento</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="reports">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                Relatórios - Em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal Nova Solicitação */}
      <Dialog open={showNewRequestModal} onOpenChange={setShowNewRequestModal}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-[#0C29AB]">Nova Solicitação de Manutenção</DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmitNewRequest)} className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                {/* Campo Placa/Veículo */}
                <FormField
                  control={form.control}
                  name="vehicleId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa do Veículo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a placa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.plate}>
                              {vehicle.plate} - {vehicle.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Campo Nome do Motorista */}
                <FormField
                  control={form.control}
                  name="driverName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Motorista *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o motorista" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {drivers.map((driver) => (
                            <SelectItem key={driver.id} value={driver.name}>
                              {driver.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Campo Tipo de Manutenção */}
              <FormField
                control={form.control}
                name="requestType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Manutenção *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="corrective">Corretiva</SelectItem>
                        <SelectItem value="preventive">Preventiva</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Campos específicos para Manutenção Corretiva */}
              {form.watch("requestType") === "corrective" && (
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição do Problema *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva detalhadamente o problema encontrado..."
                          className="min-h-[100px]"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}

              {/* Campos específicos para Manutenção Preventiva */}
              {form.watch("requestType") === "preventive" && (
                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="preventiveOrder"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Ordem (1 a 12) *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a ordem" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {Array.from({ length: 12 }, (_, i) => (
                              <SelectItem key={i + 1} value={String(i + 1)}>
                                {i + 1}º
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="preventiveLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível (M1 a M5) *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o nível" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="M1">M1</SelectItem>
                            <SelectItem value="M2">M2</SelectItem>
                            <SelectItem value="M3">M3</SelectItem>
                            <SelectItem value="M4">M4</SelectItem>
                            <SelectItem value="M5">M5</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowNewRequestModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#0C29AB] hover:bg-[#0C29AB]/90"
                  disabled={createMaintenanceRequestMutation.isPending}
                >
                  {createMaintenanceRequestMutation.isPending ? "Criando..." : "Criar Solicitação"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal Lançamento de Custos */}
      <Dialog open={showCostModal} onOpenChange={setShowCostModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-[#0C29AB]">💰 Lançamento de Custos</DialogTitle>
          </DialogHeader>
          
          <Form {...costForm}>
            <form onSubmit={costForm.handleSubmit(onSubmitCostEntry)} className="space-y-6">
              <div className="grid grid-cols-3 gap-4">
                {/* Número da Nota Fiscal */}
                <FormField
                  control={costForm.control}
                  name="invoiceNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº da Nota Fiscal *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Data da Nota */}
                <FormField
                  control={costForm.control}
                  name="invoiceDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Nota *</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Nome do Fornecedor */}
                <FormField
                  control={costForm.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Fornecedor *</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: Oficina Silva" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Placa (opcional) */}
                <FormField
                  control={costForm.control}
                  name="vehiclePlate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Placa (opcional)</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a placa" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {vehicles.map((vehicle) => (
                            <SelectItem key={vehicle.id} value={vehicle.plate}>
                              {vehicle.plate} - {vehicle.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Tipo */}
                <FormField
                  control={costForm.control}
                  name="maintenanceType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo *</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="preventive">Preventiva</SelectItem>
                          <SelectItem value="corrective">Corretiva</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {/* Classificação */}
                <FormField
                  control={costForm.control}
                  name="classification"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Classificação *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione a classificação" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {maintenanceClassifications.map((classification) => (
                            <SelectItem key={classification} value={classification}>
                              {classification}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Descrição */}
              <FormField
                control={costForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição do Serviço ou Material *</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: Troca de óleo e filtros" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Valores */}
              <div className="grid grid-cols-3 gap-4">
                <FormField
                  control={costForm.control}
                  name="quantity"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Quantidade *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            setTimeout(calculateTotalValue, 100);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={costForm.control}
                  name="unitPrice"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Unitário *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => {
                            field.onChange(parseFloat(e.target.value) || 0);
                            setTimeout(calculateTotalValue, 100);
                          }}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={costForm.control}
                  name="totalValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Valor Total *</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          step="0.01"
                          placeholder="0.00"
                          {...field}
                          onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                          className="bg-gray-50"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="flex justify-end space-x-4 pt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowCostModal(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-[#0C29AB] hover:bg-[#0C29AB]/90"
                >
                  Lançar Custo
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}