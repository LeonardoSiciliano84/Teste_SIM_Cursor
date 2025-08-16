import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { 
  CheckSquare, 
  Search, 
  Filter, 
  Download, 
  Eye, 
  FileText,
  Calendar,
  User,
  Truck,
  MapPin,
  Clock,
  Camera
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { useToast } from "@/hooks/use-toast";
import type { VehicleChecklist } from "@shared/schema";

interface ChecklistFilters {
  vehiclePlate: string;
  driverName: string;
  startDate: string;
  endDate: string;
  status: string;
  verificationStatus: string;
  baseOrigin: string;
}

export default function ChecklistsPage() {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [filters, setFilters] = useState<ChecklistFilters>({
    vehiclePlate: "",
    driverName: "",
    startDate: "",
    endDate: "",
    status: "todos",
    verificationStatus: "todos",
    baseOrigin: "",
  });
  const [showDetails, setShowDetails] = useState(false);
  const [selectedChecklist, setSelectedChecklist] = useState<VehicleChecklist | null>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationNotes, setVerificationNotes] = useState("");

  // Query para buscar checklists
  const { data: checklists = [], isLoading } = useQuery<VehicleChecklist[]>({
    queryKey: ['/api/checklists', filters],
    queryFn: () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== 'todos') searchParams.append(key, value);
      });
      return apiRequest(`/api/checklists?${searchParams.toString()}`);
    },
  });

  // Mutation para verificar checklist
  const verifyMutation = useMutation({
    mutationFn: async (data: { id: string; verifiedBy: string; verifiedByName: string; notes?: string }) => {
      const response = await fetch(`/api/checklists/${data.id}/verify`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          verifiedBy: data.verifiedBy,
          verifiedByName: data.verifiedByName,
          notes: data.notes,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Erro ao verificar checklist');
      }
      
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/checklists'] });
      setShowVerifyModal(false);
      setVerificationNotes("");
    },
  });

  const handleFilterChange = (key: keyof ChecklistFilters, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const clearFilters = () => {
    setFilters({
      vehiclePlate: "",
      driverName: "",
      startDate: "",
      endDate: "",
      status: "todos",
      verificationStatus: "todos",
      baseOrigin: "",
    });
  };

  const handleViewDetails = (checklist: VehicleChecklist) => {
    setSelectedChecklist(checklist);
    setShowDetails(true);
  };

  const handleVerifyChecklist = (checklist: VehicleChecklist) => {
    setSelectedChecklist(checklist);
    setShowVerifyModal(true);
  };

  const submitVerification = () => {
    if (!selectedChecklist) return;
    
    verifyMutation.mutate({
      id: selectedChecklist.id,
      verifiedBy: "user123", // Em produção, usar o ID do usuário logado
      verifiedByName: "Usuario Verificador", // Em produção, usar o nome do usuário logado
      notes: verificationNotes,
    });
  };

  const handleDownloadPDF = (checklistId: string) => {
    window.open(`/api/checklists/${checklistId}/pdf`, '_blank');
  };

  const handleExportExcel = () => {
    const searchParams = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value && value !== 'todos') searchParams.append(key, value);
    });
    window.open(`/api/checklists/export/xlsx?${searchParams.toString()}`, '_blank');
  };

  const getStatusBadge = (status: string) => {
    const statusMap = {
      'saida_registrada': { label: 'Saída Registrada', variant: 'secondary' as const },
    };
    
    const config = statusMap[status as keyof typeof statusMap] || { label: status, variant: 'secondary' as const };
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  const getVerificationBadge = (status: string) => {
    return status === 'verificado' ? 
      <Badge variant="default">Verificado</Badge> : 
      <Badge variant="destructive">Não Verificado</Badge>;
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gestão de Checklists</h1>
          <p className="text-muted-foreground">
            Visualize e gerencie todos os checklists de veículos registrados pelos motoristas
          </p>
        </div>
        <Button onClick={handleExportExcel} className="bg-green-600 hover:bg-green-700">
          <Download className="mr-2 h-4 w-4" />
          Exportar Excel
        </Button>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filtros de Busca</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-sm font-medium">Placa do Veículo</label>
              <Input
                placeholder="Digite a placa..."
                value={filters.vehiclePlate}
                onChange={(e) => handleFilterChange('vehiclePlate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Nome do Motorista</label>
              <Input
                placeholder="Digite o nome..."
                value={filters.driverName}
                onChange={(e) => handleFilterChange('driverName', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Inicial</label>
              <Input
                type="date"
                value={filters.startDate}
                onChange={(e) => handleFilterChange('startDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Data Final</label>
              <Input
                type="date"
                value={filters.endDate}
                onChange={(e) => handleFilterChange('endDate', e.target.value)}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Status</label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange('status', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos os status</SelectItem>
                  <SelectItem value="saida_registrada">Saída Registrada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Verificação</label>
              <Select value={filters.verificationStatus} onValueChange={(value) => handleFilterChange('verificationStatus', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  <SelectItem value="verificado">Verificado</SelectItem>
                  <SelectItem value="nao_verificado">Não Verificado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium">Base de Origem</label>
              <Input
                placeholder="Digite a base..."
                value={filters.baseOrigin}
                onChange={(e) => handleFilterChange('baseOrigin', e.target.value)}
              />
            </div>
            <div className="flex items-end">
              <Button variant="outline" onClick={clearFilters} className="w-full">
                Limpar Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Checklists */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Checklists ({checklists.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="text-center py-8">Carregando checklists...</div>
          ) : (
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Motorista</TableHead>
                    <TableHead>Saída</TableHead>
                    <TableHead>Base</TableHead>
                    <TableHead>Verificação</TableHead>
                    <TableHead>Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {checklists.map((checklist: VehicleChecklist) => (
                    <TableRow key={checklist.id}>
                      <TableCell>
                        <div>
                          <div className="font-medium">{checklist.vehiclePlate}</div>
                          <div className="text-sm text-muted-foreground">{checklist.vehicleName}</div>
                          {checklist.implementPlate && (
                            <div className="text-xs text-muted-foreground">
                              Impl: {checklist.implementPlate}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-2">
                          <User className="h-4 w-4 text-muted-foreground" />
                          <span>{checklist.driverName}</span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="flex items-center space-x-1 text-sm">
                            <Calendar className="h-3 w-3" />
                            <span>{checklist.exitDate}</span>
                          </div>
                          <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <span>{checklist.exitTime}</span>
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center space-x-1 text-sm">
                          <MapPin className="h-3 w-3" />
                          <span>{checklist.baseOrigin}</span>
                        </div>
                        {checklist.baseDestination && (
                          <div className="text-xs text-muted-foreground">
                            → {checklist.baseDestination}
                          </div>
                        )}
                      </TableCell>
                      <TableCell>{getVerificationBadge(checklist.verificationStatus)}</TableCell>
                      <TableCell>
                        <div className="flex space-x-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleViewDetails(checklist)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          {checklist.verificationStatus === 'nao_verificado' && (
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleVerifyChecklist(checklist)}
                            >
                              <CheckSquare className="h-4 w-4" />
                            </Button>
                          )}
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => handleDownloadPDF(checklist.id)}
                          >
                            <FileText className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      <Dialog open={showDetails} onOpenChange={setShowDetails}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Checklist</DialogTitle>
          </DialogHeader>
          {selectedChecklist && (
            <div className="space-y-6">
              {/* Informações básicas */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold mb-2">Informações do Veículo</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Veículo:</strong> {selectedChecklist.vehicleName}</p>
                    <p><strong>Placa:</strong> {selectedChecklist.vehiclePlate}</p>
                    {selectedChecklist.implementPlate && (
                      <>
                        <p><strong>Implemento:</strong> {selectedChecklist.implementName}</p>
                        <p><strong>Placa Implemento:</strong> {selectedChecklist.implementPlate}</p>
                      </>
                    )}
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold mb-2">Informações da Viagem</h3>
                  <div className="space-y-1 text-sm">
                    <p><strong>Motorista:</strong> {selectedChecklist.driverName}</p>
                    <p><strong>Base Origem:</strong> {selectedChecklist.baseOrigin}</p>
                    {selectedChecklist.baseDestination && (
                      <p><strong>Base Destino:</strong> {selectedChecklist.baseDestination}</p>
                    )}
                    <p><strong>Saída:</strong> {selectedChecklist.exitDate} às {selectedChecklist.exitTime}</p>
                    <p><strong>KM Saída:</strong> {selectedChecklist.exitKm}</p>
                    {selectedChecklist.returnDate && (
                      <>
                        <p><strong>Retorno:</strong> {selectedChecklist.returnDate} às {selectedChecklist.returnTime}</p>
                        <p><strong>KM Retorno:</strong> {selectedChecklist.returnKm}</p>
                      </>
                    )}
                  </div>
                </div>
              </div>

              {/* Checklist de saída */}
              <div>
                <h3 className="font-semibold mb-2">Checklist de Saída</h3>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  {Object.entries(selectedChecklist.exitChecklist as Record<string, boolean>).map(([item, checked]) => (
                    <div key={item} className="flex items-center space-x-2">
                      <span className={checked ? 'text-green-600' : 'text-red-600'}>
                        {checked ? '✓' : '✗'}
                      </span>
                      <span>{item}</span>
                    </div>
                  ))}
                </div>
                {selectedChecklist.exitObservations && (
                  <div className="mt-3">
                    <strong>Observações:</strong>
                    <p className="mt-1 text-sm text-muted-foreground">{selectedChecklist.exitObservations}</p>
                  </div>
                )}
              </div>

              {/* Checklist de retorno (se houver) */}
              {selectedChecklist.returnChecklist && (
                <div>
                  <h3 className="font-semibold mb-2">Checklist de Retorno</h3>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {Object.entries(selectedChecklist.returnChecklist as Record<string, boolean>).map(([item, checked]) => (
                      <div key={item} className="flex items-center space-x-2">
                        <span className={checked ? 'text-green-600' : 'text-red-600'}>
                          {checked ? '✓' : '✗'}
                        </span>
                        <span>{item}</span>
                      </div>
                    ))}
                  </div>
                  {selectedChecklist.returnObservations && (
                    <div className="mt-3">
                      <strong>Observações:</strong>
                      <p className="mt-1 text-sm text-muted-foreground">{selectedChecklist.returnObservations}</p>
                    </div>
                  )}
                </div>
              )}

              {/* Foto do checklist */}
              {selectedChecklist.attachmentPath && (
                <div>
                  <h3 className="font-semibold mb-2">Foto do Checklist</h3>
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <Camera className="h-5 w-5 text-blue-600" />
                        <span className="text-sm font-medium">Foto anexada</span>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          // Simular visualização da foto
                          toast({
                            title: "Visualizando foto",
                            description: `Arquivo: ${selectedChecklist.attachmentPath}`,
                          });
                        }}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Foto
                      </Button>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Arquivo: {selectedChecklist.attachmentPath}
                    </p>
                  </div>
                </div>
              )}

              {/* Status de verificação */}
              <div>
                <h3 className="font-semibold mb-2">Status de Verificação</h3>
                <div className="space-y-2">
                  <div>{getVerificationBadge(selectedChecklist.verificationStatus)}</div>
                  {selectedChecklist.verifiedByName && (
                    <div className="text-sm">
                      <p><strong>Verificado por:</strong> {selectedChecklist.verifiedByName}</p>
                      <p><strong>Data:</strong> {selectedChecklist.verificationDate ? 
                        format(new Date(selectedChecklist.verificationDate), 'dd/MM/yyyy HH:mm', { locale: ptBR }) : 
                        'N/A'}</p>
                      {selectedChecklist.verificationNotes && (
                        <p><strong>Notas:</strong> {selectedChecklist.verificationNotes}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Verificação */}
      <Dialog open={showVerifyModal} onOpenChange={setShowVerifyModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Verificar Checklist</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>
              Confirme a verificação do checklist do veículo{' '}
              <strong>{selectedChecklist?.vehiclePlate}</strong> do motorista{' '}
              <strong>{selectedChecklist?.driverName}</strong>.
            </p>
            <div>
              <label className="text-sm font-medium">Notas de Verificação (opcional)</label>
              <Textarea
                placeholder="Adicione observações sobre a verificação..."
                value={verificationNotes}
                onChange={(e) => setVerificationNotes(e.target.value)}
                rows={3}
              />
            </div>
            <div className="flex space-x-2 justify-end">
              <Button variant="outline" onClick={() => setShowVerifyModal(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={submitVerification}
                disabled={verifyMutation.isPending}
              >
                {verifyMutation.isPending ? 'Verificando...' : 'Confirmar Verificação'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}