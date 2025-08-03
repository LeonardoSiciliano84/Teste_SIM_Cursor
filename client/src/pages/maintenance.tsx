import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
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
  Filter
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import type { MaintenanceRequest, Vehicle } from "@shared/schema";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export default function Maintenance() {
  const [activeTab, setActiveTab] = useState("requests");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");

  // Buscar requisições de manutenção
  const { data: maintenanceRequests = [], isLoading: isLoadingRequests } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/requests"],
  });

  // Buscar veículos em manutenção
  const { data: vehiclesInMaintenance = [], isLoading: isLoadingVehicles } = useQuery<MaintenanceRequest[]>({
    queryKey: ["/api/maintenance/vehicles-in-maintenance"],
  });

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
        <Button className="bg-[#0C29AB] hover:bg-[#0C29AB]/90">
          <Plus className="mr-2 h-4 w-4" />
          Nova Ordem de Serviço
        </Button>
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
            Ordens de Serviço
          </TabsTrigger>
          <TabsTrigger value="warehouse">
            <Package className="mr-2 h-4 w-4" />
            Almoxarifado
          </TabsTrigger>
          <TabsTrigger value="tires">
            <Circle className="mr-2 h-4 w-4" />
            Gestão de Pneus
          </TabsTrigger>
          <TabsTrigger value="costs">
            <DollarSign className="mr-2 h-4 w-4" />
            Custos
          </TabsTrigger>
          <TabsTrigger value="reports">
            <BarChart3 className="mr-2 h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Conteúdo da aba de Ordens de Serviço */}
        <TabsContent value="requests" className="space-y-4">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle>Filtros</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Buscar</label>
                  <div className="relative">
                    <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                    <Input
                      placeholder="OS, veículo..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-8"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Status</label>
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="open">Aberta</SelectItem>
                      <SelectItem value="scheduled">Agendada</SelectItem>
                      <SelectItem value="in_progress">Em Andamento</SelectItem>
                      <SelectItem value="completed">Concluída</SelectItem>
                      <SelectItem value="closed">Fechada</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <label className="text-sm font-medium">Tipo</label>
                  <Select value={typeFilter} onValueChange={setTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="preventive">Preventiva</SelectItem>
                      <SelectItem value="corrective">Corretiva</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="flex items-end">
                  <Button variant="outline" className="w-full">
                    <Filter className="mr-2 h-4 w-4" />
                    Limpar Filtros
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Lista de Ordens de Serviço */}
          <Card>
            <CardHeader>
              <CardTitle>Ordens de Serviço</CardTitle>
              <CardDescription>
                {filteredRequests.length} {filteredRequests.length === 1 ? 'ordem' : 'ordens'} encontrada{filteredRequests.length !== 1 ? 's' : ''}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoadingRequests ? (
                <div className="text-center py-8 text-muted-foreground">Carregando...</div>
              ) : filteredRequests.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  Nenhuma ordem de serviço encontrada
                </div>
              ) : (
                <div className="space-y-4">
                  {filteredRequests.map((request) => (
                    <div key={request.id} className="border rounded-lg p-4 hover:bg-gray-50 cursor-pointer">
                      <div className="flex items-start justify-between">
                        <div className="space-y-2">
                          <div className="flex items-center gap-3">
                            <span className="font-mono font-semibold text-[#0C29AB]">
                              {request.orderNumber}
                            </span>
                            {getStatusBadge(request.status)}
                            <div className="flex items-center gap-1 text-sm text-muted-foreground">
                              {getTypeIcon(request.requestType)}
                              <span>
                                {request.requestType === 'preventive' ? 'Preventiva' : 'Corretiva'}
                              </span>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-4 text-sm">
                            <div className="flex items-center gap-1">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>{request.vehicleId}</span>
                            </div>
                            {request.mechanic && (
                              <div className="flex items-center gap-1">
                                <Wrench className="h-4 w-4 text-muted-foreground" />
                                <span>{request.mechanic}</span>
                              </div>
                            )}
                          </div>
                          
                          {request.description && (
                            <p className="text-sm text-muted-foreground">{request.description}</p>
                          )}
                        </div>
                        
                        <div className="text-right space-y-1">
                          <p className="text-sm text-muted-foreground">
                            {format(new Date(request.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                          </p>
                          {request.daysStoped > 0 && (
                            <p className="text-xs text-orange-600">
                              {request.daysStoped} dias parado
                            </p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Outras abas - Implementar posteriormente */}
        <TabsContent value="warehouse">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                Módulo de Almoxarifado - Em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tires">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                Gestão de Pneus - Em desenvolvimento
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="costs">
          <Card>
            <CardContent className="py-12">
              <div className="text-center text-muted-foreground">
                Controle de Custos - Em desenvolvimento
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
    </div>
  );
}