import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogDescription 
} from "@/components/ui/dialog";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { 
  Package, 
  CheckCircle, 
  XCircle, 
  Edit, 
  Eye, 
  FileText, 
  Download,
  Filter,
  Search,
  Clock,
  User,
  Truck
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface PranchaService {
  id: string;
  vehicleId: string;
  vehiclePlate: string;
  vehicleName: string;
  implementId: string;
  implementPlate: string;
  implementName: string;
  driverId: string;
  driverName: string;
  driverRegistration: string;
  ocNumber: string;
  startDate: string;
  endDate?: string | null;
  serviceDays: number;
  status: 'aguardando' | 'confirmado' | 'negado' | 'aditado';
  hrStatus: 'nao_verificado' | 'verificado';
  createdAt: Date;
  updatedAt?: Date | null;
  observations?: string | null;
  logs: ServiceLog[];
}

interface ServiceLog {
  id: string;
  serviceId: string;
  action: string;
  userName: string;
  userRole: string;
  justification?: string | null;
  createdAt: Date;
}

export default function PranchaManagement() {
  const [selectedService, setSelectedService] = useState<PranchaService | null>(null);
  const [showConfirmDialog, setShowConfirmDialog] = useState(false);
  const [showDenyDialog, setShowDenyDialog] = useState(false);
  const [showEditDialog, setShowEditDialog] = useState(false);
  const [showLogsDialog, setShowLogsDialog] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>("all");
  const [filterHrStatus, setFilterHrStatus] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFilter, setDateFilter] = useState({ start: "", end: "" });
  const [actionJustification, setActionJustification] = useState("");
  const [editDates, setEditDates] = useState({ startDate: "", endDate: "" });
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Obter dados dos serviços de prancha
  const { data: services = [], isLoading } = useQuery<PranchaService[]>({
    queryKey: ["/api/prancha-services"],
  });

  // Obter dados do usuário atual para verificar permissões
  const { data: currentUser } = useQuery({
    queryKey: ["/api/auth/user"],
  });

  // Mutations para ações do gestor
  const confirmServiceMutation = useMutation({
    mutationFn: async ({ serviceId, justification }: { serviceId: string, justification: string }) => {
      return apiRequest(`/api/prancha-services/${serviceId}/confirm`, "PATCH", { justification });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prancha-services"] });
      toast({ title: "Serviço confirmado com sucesso!" });
      setShowConfirmDialog(false);
      setActionJustification("");
    }
  });

  const denyServiceMutation = useMutation({
    mutationFn: async ({ serviceId, justification }: { serviceId: string, justification: string }) => {
      return apiRequest(`/api/prancha-services/${serviceId}/deny`, "PATCH", { justification });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prancha-services"] });
      toast({ title: "Serviço negado com sucesso!" });
      setShowDenyDialog(false);
      setActionJustification("");
    }
  });

  const editServiceMutation = useMutation({
    mutationFn: async ({ serviceId, dates, justification }: { 
      serviceId: string, 
      dates: { startDate: string, endDate: string },
      justification: string 
    }) => {
      return apiRequest(`/api/prancha-services/${serviceId}/edit-dates`, "PATCH", { ...dates, justification });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prancha-services"] });
      toast({ title: "Datas atualizadas com sucesso!" });
      setShowEditDialog(false);
      setActionJustification("");
      setEditDates({ startDate: "", endDate: "" });
    }
  });

  const updateHrStatusMutation = useMutation({
    mutationFn: async ({ serviceId, status }: { serviceId: string, status: string }) => {
      return apiRequest(`/api/prancha-services/${serviceId}/hr-status`, "PATCH", { hrStatus: status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/prancha-services"] });
      toast({ title: "Status RH atualizado com sucesso!" });
    }
  });

  // Filtrar serviços baseado nos filtros aplicados
  const filteredServices = services.filter(service => {
    const matchesStatus = filterStatus === "all" || service.status === filterStatus;
    const matchesHrStatus = filterHrStatus === "all" || service.hrStatus === filterHrStatus;
    const matchesSearch = searchTerm === "" || 
      service.ocNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.driverName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.vehiclePlate.toLowerCase().includes(searchTerm.toLowerCase()) ||
      service.implementPlate.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesDate = (!dateFilter.start || service.startDate >= dateFilter.start) &&
                       (!dateFilter.end || service.startDate <= dateFilter.end);

    return matchesStatus && matchesHrStatus && matchesSearch && matchesDate;
  });

  const getStatusBadge = (status: string) => {
    const statusMap = {
      aguardando: { label: "Aguardando", className: "bg-yellow-100 text-yellow-800" },
      confirmado: { label: "Confirmado", className: "bg-green-100 text-green-800" },
      negado: { label: "Negado", className: "bg-red-100 text-red-800" },
      aditado: { label: "Aditado", className: "bg-blue-100 text-blue-800" }
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const getHrStatusBadge = (status: string) => {
    const statusMap = {
      nao_verificado: { label: "Não Verificado", className: "bg-gray-100 text-gray-800" },
      verificado: { label: "Verificado", className: "bg-green-100 text-green-800" }
    };
    const config = statusMap[status as keyof typeof statusMap];
    return <Badge className={config.className}>{config.label}</Badge>;
  };

  const canEditServices = (currentUser as any)?.role === 'admin' || (currentUser as any)?.position === 'Gestor da Logística';
  const canUpdateHrStatus = (currentUser as any)?.role === 'admin' || (currentUser as any)?.department === 'RH';

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Package className="h-6 w-6 text-purple-600" />
              <span>Gestão de Serviços com Prancha</span>
            </CardTitle>
          </CardHeader>
        </Card>

        {/* Filtros */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Filter className="h-5 w-5" />
              <span>Filtros</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Busca */}
              <div>
                <Label>Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="O.C., motorista, placa..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>

              {/* Status do Serviço */}
              <div>
                <Label>Status do Serviço</Label>
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="aguardando">Aguardando</SelectItem>
                    <SelectItem value="confirmado">Confirmado</SelectItem>
                    <SelectItem value="negado">Negado</SelectItem>
                    <SelectItem value="aditado">Aditado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Status RH */}
              <div>
                <Label>Status RH</Label>
                <Select value={filterHrStatus} onValueChange={setFilterHrStatus}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="nao_verificado">Não Verificado</SelectItem>
                    <SelectItem value="verificado">Verificado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Período */}
              <div>
                <Label>Período</Label>
                <div className="flex space-x-2">
                  <Input
                    type="date"
                    value={dateFilter.start}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, start: e.target.value }))}
                  />
                  <Input
                    type="date"
                    value={dateFilter.end}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, end: e.target.value }))}
                  />
                </div>
              </div>
            </div>

            {/* Ações */}
            <div className="flex justify-between items-center mt-4">
              <div className="flex space-x-2">
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar PDF
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Exportar Excel
                </Button>
              </div>
              <div className="text-sm text-gray-600">
                {filteredServices.length} serviços encontrados
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Tabela de Serviços */}
        <Card>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Veículo</TableHead>
                  <TableHead>Implemento</TableHead>
                  <TableHead>Motorista</TableHead>
                  <TableHead>N° O.C.</TableHead>
                  <TableHead>Início</TableHead>
                  <TableHead>Fim</TableHead>
                  <TableHead>Dias</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Status RH</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredServices.map((service) => (
                  <TableRow key={service.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.vehiclePlate}</p>
                        <p className="text-sm text-gray-600">{service.vehicleName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.implementPlate}</p>
                        <p className="text-sm text-gray-600">{service.implementName}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div>
                        <p className="font-medium">{service.driverName}</p>
                        <p className="text-sm text-gray-600">Mat: {service.driverRegistration}</p>
                      </div>
                    </TableCell>
                    <TableCell className="font-mono">{service.ocNumber}</TableCell>
                    <TableCell>{service.startDate}</TableCell>
                    <TableCell>
                      {service.endDate ? service.endDate : '-'}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center space-x-1">
                        <Clock className="h-4 w-4 text-gray-400" />
                        <span className="font-bold">{service.serviceDays}</span>
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(service.status)}</TableCell>
                    <TableCell>{getHrStatusBadge(service.hrStatus)}</TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        {/* Ações do Gestor */}
                        {canEditServices && service.status === 'aguardando' && (
                          <>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedService(service);
                                setShowConfirmDialog(true);
                              }}
                              className="text-green-600 hover:text-green-700"
                            >
                              <CheckCircle className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => {
                                setSelectedService(service);
                                setShowDenyDialog(true);
                              }}
                              className="text-red-600 hover:text-red-700"
                            >
                              <XCircle className="h-4 w-4" />
                            </Button>
                          </>
                        )}
                        
                        {canEditServices && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              setSelectedService(service);
                              setEditDates({
                                startDate: service.startDate,
                                endDate: service.endDate || ""
                              });
                              setShowEditDialog(true);
                            }}
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                        )}

                        {/* Ações do RH */}
                        {canUpdateHrStatus && (
                          <Select
                            value={service.hrStatus}
                            onValueChange={(value) => {
                              updateHrStatusMutation.mutate({
                                serviceId: service.id,
                                status: value
                              });
                            }}
                          >
                            <SelectTrigger className="w-32 h-8">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="nao_verificado">Não Verificado</SelectItem>
                              <SelectItem value="verificado">Verificado</SelectItem>
                            </SelectContent>
                          </Select>
                        )}

                        {/* Ver logs */}
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedService(service);
                            setShowLogsDialog(true);
                          }}
                        >
                          <Eye className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Modal de Confirmação */}
        <Dialog open={showConfirmDialog} onOpenChange={setShowConfirmDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CheckCircle className="h-5 w-5 text-green-600" />
                <span>Confirmar Serviço</span>
              </DialogTitle>
              <DialogDescription>
                Confirme o serviço de prancha - O.C. {selectedService?.ocNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Observações *</Label>
                <Textarea
                  placeholder="Digite suas observações sobre a confirmação..."
                  value={actionJustification}
                  onChange={(e) => setActionJustification(e.target.value)}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!actionJustification.trim()) {
                      toast({
                        title: "Observação obrigatória",
                        description: "Digite uma observação para confirmar o serviço",
                        variant: "destructive"
                      });
                      return;
                    }
                    confirmServiceMutation.mutate({
                      serviceId: selectedService!.id,
                      justification: actionJustification
                    });
                  }}
                  disabled={confirmServiceMutation.isPending}
                >
                  Confirmar Serviço
                </Button>
                <Button variant="outline" onClick={() => setShowConfirmDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Negação */}
        <Dialog open={showDenyDialog} onOpenChange={setShowDenyDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <XCircle className="h-5 w-5 text-red-600" />
                <span>Negar Serviço</span>
              </DialogTitle>
              <DialogDescription>
                Negue o serviço de prancha - O.C. {selectedService?.ocNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div>
                <Label>Justificativa *</Label>
                <Textarea
                  placeholder="Digite a justificativa para negar o serviço..."
                  value={actionJustification}
                  onChange={(e) => setActionJustification(e.target.value)}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="destructive"
                  className="flex-1"
                  onClick={() => {
                    if (!actionJustification.trim()) {
                      toast({
                        title: "Justificativa obrigatória",
                        description: "Digite uma justificativa para negar o serviço",
                        variant: "destructive"
                      });
                      return;
                    }
                    denyServiceMutation.mutate({
                      serviceId: selectedService!.id,
                      justification: actionJustification
                    });
                  }}
                  disabled={denyServiceMutation.isPending}
                >
                  Negar Serviço
                </Button>
                <Button variant="outline" onClick={() => setShowDenyDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição de Datas */}
        <Dialog open={showEditDialog} onOpenChange={setShowEditDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Edit className="h-5 w-5 text-blue-600" />
                <span>Editar Datas do Serviço</span>
              </DialogTitle>
              <DialogDescription>
                Adite as datas do serviço - O.C. {selectedService?.ocNumber}
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Data de Início</Label>
                  <Input
                    type="date"
                    value={editDates.startDate}
                    onChange={(e) => setEditDates(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <Label>Data de Fim</Label>
                  <Input
                    type="date"
                    value={editDates.endDate}
                    onChange={(e) => setEditDates(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
              </div>

              <div>
                <Label>Motivo do Ajuste *</Label>
                <Textarea
                  placeholder="Digite o motivo para o ajuste das datas..."
                  value={actionJustification}
                  onChange={(e) => setActionJustification(e.target.value)}
                  required
                />
              </div>

              <div className="flex space-x-2">
                <Button
                  className="flex-1"
                  onClick={() => {
                    if (!actionJustification.trim()) {
                      toast({
                        title: "Motivo obrigatório",
                        description: "Digite o motivo para o ajuste das datas",
                        variant: "destructive"
                      });
                      return;
                    }
                    editServiceMutation.mutate({
                      serviceId: selectedService!.id,
                      dates: editDates,
                      justification: actionJustification
                    });
                  }}
                  disabled={editServiceMutation.isPending}
                >
                  Salvar Alterações
                </Button>
                <Button variant="outline" onClick={() => setShowEditDialog(false)}>
                  Cancelar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Logs */}
        <Dialog open={showLogsDialog} onOpenChange={setShowLogsDialog}>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-gray-600" />
                <span>Histórico de Ações - O.C. {selectedService?.ocNumber}</span>
              </DialogTitle>
            </DialogHeader>
            
            <div className="space-y-4">
              {selectedService?.logs && selectedService.logs.length > 0 ? (
                <div className="space-y-3">
                  {selectedService.logs.map((log) => (
                    <div key={log.id} className="border rounded-lg p-4 bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="font-medium">{log.action}</p>
                          <p className="text-sm text-gray-600">
                            {log.userName} ({log.userRole})
                          </p>
                        </div>
                        <p className="text-sm text-gray-500">
                          {new Date(log.createdAt).toLocaleString('pt-BR')}
                        </p>
                      </div>
                      {log.justification && (
                        <div className="mt-2 p-2 bg-white rounded border">
                          <p className="text-sm">{log.justification}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-center text-gray-500">Nenhuma ação registrada ainda</p>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}