import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  UserPlus, 
  Search, 
  Filter, 
  Edit, 
  UserX, 
  CheckCircle,
  Mail,
  Building,
  Phone,
  User,
  Shield,
  Calendar
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { ExternalPersonForm } from "@/components/employees/external-person-form";
import type { ExternalPerson } from "../types/mock";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

export function ExternalPersonsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterType, setFilterType] = useState("todos");
  const [filterStatus, setFilterStatus] = useState("todos");
  const [showNewExternalForm, setShowNewExternalForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedExternal, setSelectedExternal] = useState<ExternalPerson | null>(null);
  const [showStatusDialog, setShowStatusDialog] = useState(false);
  const [statusAction, setStatusAction] = useState<"activate" | "deactivate">("deactivate");
  const [deactivationReason, setDeactivationReason] = useState("");
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar terceiros
  const { data: externalPersons = [], isLoading } = useQuery({
    queryKey: ["/api/external-persons"],
  });

  // Filtrar terceiros
  const filteredExternals = (externalPersons as ExternalPerson[]).filter((external: ExternalPerson) => {
    const matchesSearch = 
      external.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      external.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      external.email.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = filterType === "todos" || external.personType === filterType;
    const matchesStatus = filterStatus === "todos" || external.status === filterStatus;
    
    return matchesSearch && matchesType && matchesStatus;
  });

  // Mutation para alterar status
  const statusMutation = useMutation({
    mutationFn: async ({ id, status, reason }: { id: string; status: string; reason?: string }) => {
      return apiRequest(`/api/external-persons/${id}/status`, 'PATCH', { 
        status, 
        inactiveReason: reason 
      });
    },
    onSuccess: (_, { status }) => {
      toast({
        title: `Terceiro ${status === 'ativo' ? 'reativado' : 'desativado'}`,
        description: `O status foi alterado com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/external-persons"] });
      setShowStatusDialog(false);
      setSelectedExternal(null);
      setDeactivationReason("");
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao alterar status",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  // Mutation para reenviar dados de acesso
  const resendAccessMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/external-persons/${id}/resend-access`, 'POST');
    },
    onSuccess: () => {
      toast({
        title: "Dados de acesso enviados",
        description: "Os dados de acesso foram reenviados por e-mail.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao reenviar dados",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (external: ExternalPerson) => {
    setSelectedExternal(external);
    setShowEditForm(true);
  };

  const handleStatusChange = (external: ExternalPerson, action: "activate" | "deactivate") => {
    setSelectedExternal(external);
    setStatusAction(action);
    setShowStatusDialog(true);
  };

  const confirmStatusChange = () => {
    if (!selectedExternal) return;
    
    const newStatus = statusAction === "activate" ? "ativo" : "inativo";
    statusMutation.mutate({
      id: selectedExternal.id,
      status: newStatus,
      reason: statusAction === "deactivate" ? deactivationReason : undefined
    });
  };

  const handleResendAccess = (external: ExternalPerson) => {
    resendAccessMutation.mutate(external.id);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "inativo":
        return <Badge className="bg-red-100 text-red-800">Inativo</Badge>;
      case "bloqueado":
        return <Badge className="bg-orange-100 text-orange-800">Bloqueado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getTypeBadge = (type: string) => {
    switch (type) {
      case "cliente":
        return <Badge className="bg-blue-100 text-blue-800">Cliente</Badge>;
      case "porteiro":
        return <Badge className="bg-purple-100 text-purple-800">Porteiro</Badge>;
      default:
        return <Badge variant="secondary">{type}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Controle de Terceiros</h1>
          <p className="text-gray-600">Gerencie clientes e porteiros de empresas terceirizadas</p>
        </div>
        <Button 
          onClick={() => setShowNewExternalForm(true)}
          className="bg-[#0C29AB] hover:bg-[#0A2299]"
          data-testid="button-new-external"
        >
          <UserPlus className="h-4 w-4 mr-2" />
          + Novo Externo
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="search">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  id="search"
                  placeholder="Nome, empresa ou e-mail..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search"
                />
              </div>
            </div>
            
            <div>
              <Label htmlFor="filterType">Tipo de Permissão</Label>
              <Select value={filterType} onValueChange={setFilterType}>
                <SelectTrigger data-testid="select-filter-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os tipos</SelectItem>
                  <SelectItem value="cliente">Cliente</SelectItem>
                  <SelectItem value="porteiro">Porteiro</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="filterStatus">Status</Label>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger data-testid="select-filter-status">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="ativo">Ativo</SelectItem>
                  <SelectItem value="inativo">Inativo</SelectItem>
                  <SelectItem value="bloqueado">Bloqueado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button 
                variant="outline" 
                onClick={() => {
                  setSearchTerm("");
                  setFilterType("todos");
                  setFilterStatus("todos");
                }}
                data-testid="button-clear-filters"
              >
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Terceiros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Terceiros Cadastrados ({filteredExternals.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Empresa</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Cadastrado em</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredExternals.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                      Nenhum terceiro encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredExternals.map((external: ExternalPerson) => (
                    <TableRow key={external.id}>
                      <TableCell>
                        <div className="flex items-center gap-3">
                          {external.photo ? (
                            <img 
                              src={external.photo} 
                              alt={external.fullName}
                              className="w-8 h-8 rounded-full object-cover"
                            />
                          ) : (
                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center">
                              <User className="h-4 w-4 text-gray-500" />
                            </div>
                          )}
                          <div>
                            <div className="font-medium">{external.fullName}</div>
                            {external.position && (
                              <div className="text-sm text-gray-500">{external.position}</div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Building className="h-4 w-4 text-gray-400" />
                          {external.companyName}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 text-sm">
                            <Mail className="h-3 w-3 text-gray-400" />
                            {external.email}
                          </div>
                          <div className="flex items-center gap-2 text-sm">
                            <Phone className="h-3 w-3 text-gray-400" />
                            {external.phone}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>{getTypeBadge(external.personType)}</TableCell>
                      <TableCell>{getStatusBadge(external.status)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 text-sm text-gray-500">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(external.createdAt), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(external)}
                            data-testid={`button-edit-${external.id}`}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          
                          {external.status === "ativo" ? (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(external, "deactivate")}
                              data-testid={`button-deactivate-${external.id}`}
                            >
                              <UserX className="h-3 w-3" />
                            </Button>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleStatusChange(external, "activate")}
                              data-testid={`button-activate-${external.id}`}
                            >
                              <CheckCircle className="h-3 w-3" />
                            </Button>
                          )}

                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleResendAccess(external)}
                            disabled={resendAccessMutation.isPending}
                            data-testid={`button-resend-${external.id}`}
                          >
                            <Mail className="h-3 w-3" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Modal de Cadastro/Edição */}
      <ExternalPersonForm
        isOpen={showNewExternalForm}
        onClose={() => setShowNewExternalForm(false)}
      />

      <ExternalPersonForm
        isOpen={showEditForm}
        onClose={() => {
          setShowEditForm(false);
          setSelectedExternal(null);
        }}
        externalPerson={selectedExternal}
        isEditing={true}
      />

      {/* Dialog de Alteração de Status */}
      <Dialog open={showStatusDialog} onOpenChange={setShowStatusDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {statusAction === "activate" ? "Reativar Terceiro" : "Desativar Terceiro"}
            </DialogTitle>
            <DialogDescription>
              {statusAction === "activate" 
                ? `Tem certeza que deseja reativar ${selectedExternal?.fullName}?`
                : `Tem certeza que deseja desativar ${selectedExternal?.fullName}?`
              }
            </DialogDescription>
          </DialogHeader>

          {statusAction === "deactivate" && (
            <div className="space-y-2">
              <Label htmlFor="reason">Motivo da Desativação</Label>
              <Input
                id="reason"
                placeholder="Digite o motivo da desativação..."
                value={deactivationReason}
                onChange={(e) => setDeactivationReason(e.target.value)}
                data-testid="input-deactivation-reason"
              />
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowStatusDialog(false)}>
              Cancelar
            </Button>
            <Button
              onClick={confirmStatusChange}
              disabled={statusMutation.isPending || (statusAction === "deactivate" && !deactivationReason.trim())}
              className={statusAction === "activate" ? "bg-green-600 hover:bg-green-700" : "bg-red-600 hover:bg-red-700"}
              data-testid="button-confirm-status"
            >
              {statusMutation.isPending ? "Processando..." : 
                statusAction === "activate" ? "Reativar" : "Desativar"
              }
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}