import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Eye, FileText, Search, Filter, Calendar, User, MapPin, Download, Edit, CheckCircle, Printer } from "lucide-react";
import { SinistroFormGeneral } from "@/components/sinistros/sinistro-form-general";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sinistro {
  id: string;
  tipo: string;
  placaTracao?: string;
  dataOcorrido: string;
  localEndereco: string;
  observacoes: string;
  status: string;
  vitimas: boolean;
  nomeRegistrador: string;
  cargoRegistrador: string;
  createdAt: string;
}

export default function SinistrosPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [tipoFilter, setTipoFilter] = useState("all");
  const [monthFilter, setMonthFilter] = useState("all");
  const [yearFilter, setYearFilter] = useState("all");
  const [selectedSinistro, setSelectedSinistro] = useState<Sinistro | null>(null);
  const [viewModalOpen, setViewModalOpen] = useState(false);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Função para visualizar sinistro
  const handleView = (sinistro: Sinistro) => {
    setSelectedSinistro(sinistro);
    setViewModalOpen(true);
  };

  // Função para editar sinistro
  const handleEdit = (sinistro: Sinistro) => {
    setSelectedSinistro(sinistro);
    setEditModalOpen(true);
  };

  // Função para finalizar sinistro
  const finalizarSinistroMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/sinistros/${id}/finalizar`, "PATCH", {
        finalizadoPor: "admin-1",
        nomeFinalizador: "Administrador QSMS"
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Sinistro finalizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sinistros"] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao finalizar sinistro",
        variant: "destructive",
      });
    },
  });

  // Função para imprimir sinistro
  const handlePrint = async (sinistro: Sinistro) => {
    try {
      const response = await fetch(`/api/sinistros/${sinistro.id}/pdf`);
      if (!response.ok) throw new Error("Erro ao gerar PDF");
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sinistro_${sinistro.id}_${sinistro.tipo}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF do sinistro",
        variant: "destructive",
      });
    }
  };

  // Função para exportar dados para Excel
  const exportToExcel = () => {
    // Preparar dados para exportação
    const exportData = filteredSinistros.map((sinistro: Sinistro) => ({
      'ID': sinistro.id,
      'Tipo': sinistro.tipo,
      'Status': sinistro.status,
      'Data Ocorrido': sinistro.dataOcorrido,
      'Hora': sinistro.horaOcorrido,
      'Local/Endereço': sinistro.localEndereco,
      'Nome Envolvido': sinistro.nomeEnvolvido,
      'Cargo Envolvido': sinistro.cargoEnvolvido || 'N/A',
      'Placa Tração': sinistro.placaTracao || 'N/A',
      'Tipo Colisão': sinistro.tipoColisao || 'N/A',
      'Condições Trajeto': sinistro.condicoesTrajeto || 'N/A',
      'Gravidade': sinistro.percepcaoGravidade || 'N/A',
      'Avaria': sinistro.quemSofreuAvaria || 'N/A',
      'Vítimas': sinistro.vitimas ? 'Sim' : 'Não',
      'Descrição Vítimas': sinistro.descricaoVitimas || 'N/A',
      'Observações': sinistro.observacoes,
      'Registrado Por': sinistro.nomeRegistrador,
      'Cargo Registrador': sinistro.cargoRegistrador,
      'Data Criação': format(new Date(sinistro.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })
    }));

    // Criar workbook e worksheet
    const XLSX = require('xlsx');
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Sinistros');

    // Definir larguras das colunas
    const colWidths = [
      { wch: 15 }, // ID
      { wch: 20 }, // Tipo
      { wch: 15 }, // Status
      { wch: 12 }, // Data Ocorrido
      { wch: 8 },  // Hora
      { wch: 30 }, // Local/Endereço
      { wch: 25 }, // Nome Envolvido
      { wch: 20 }, // Cargo Envolvido
      { wch: 12 }, // Placa Tração
      { wch: 20 }, // Tipo Colisão
      { wch: 20 }, // Condições Trajeto
      { wch: 15 }, // Gravidade
      { wch: 20 }, // Avaria
      { wch: 8 },  // Vítimas
      { wch: 30 }, // Descrição Vítimas
      { wch: 40 }, // Observações
      { wch: 20 }, // Registrado Por
      { wch: 20 }, // Cargo Registrador
      { wch: 18 }  // Data Criação
    ];
    ws['!cols'] = colWidths;

    // Exportar arquivo
    const fileName = `sinistros_${format(new Date(), 'dd-MM-yyyy_HH-mm')}.xlsx`;
    XLSX.writeFile(wb, fileName);
  };

  const { data: sinistros = [], isLoading } = useQuery({
    queryKey: ["/api/sinistros"],
  });

  const filteredSinistros = sinistros.filter((sinistro: Sinistro) => {
    const matchesSearch = 
      sinistro.localEndereco.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.placaTracao?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.observacoes.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sinistro.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || sinistro.tipo === tipoFilter;
    
    // Filtros por data
    const sinistroDate = new Date(sinistro.dataOcorrido);
    const matchesMonth = monthFilter === "all" || (sinistroDate.getMonth() + 1).toString() === monthFilter;
    const matchesYear = yearFilter === "all" || sinistroDate.getFullYear().toString() === yearFilter;
    
    return matchesSearch && matchesStatus && matchesTipo && matchesMonth && matchesYear;
  });

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      aberto: { color: "bg-red-100 text-red-800", label: "Aberto" },
      em_andamento: { color: "bg-yellow-100 text-yellow-800", label: "Em Andamento" },
      finalizado: { color: "bg-green-100 text-green-800", label: "Finalizado" },
    };
    
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.aberto;
    return (
      <Badge className={config.color}>
        {config.label}
      </Badge>
    );
  };

  const getTipoLabel = (tipo: string) => {
    const tipos = {
      veicular: "Veicular",
      trabalhista_cat: "Trabalhista/CAT",
      interno_base: "Interno Base",
      externo_cliente: "Externo Cliente",
      ambiental: "Ambiental",
      falha_epi: "Falha EPI",
      quase_acidente: "Quase Acidente",
    };
    return tipos[tipo as keyof typeof tipos] || tipo;
  };

  const stats = {
    total: sinistros.length,
    abertos: sinistros.filter((s: Sinistro) => s.status === "aberto").length,
    emAndamento: sinistros.filter((s: Sinistro) => s.status === "em_andamento").length,
    finalizados: sinistros.filter((s: Sinistro) => s.status === "finalizado").length,
    comVitimas: sinistros.filter((s: Sinistro) => s.vitimas).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 flex items-center">
            <AlertTriangle className="w-8 h-8 mr-3 text-red-600" />
            Gestão de Sinistros
          </h1>
          <p className="text-gray-600 mt-1">
            Controle e gerenciamento de acidentes e incidentes - Módulo QSMS
          </p>
        </div>
        <div className="flex gap-2">
          <SinistroFormGeneral 
            userInfo={{ id: "admin-1", name: "Administrador", role: "admin" }}
          />
          <Button
            onClick={exportToExcel}
            className="bg-green-600 hover:bg-green-700 text-white"
          >
            <Download className="w-4 h-4 mr-2" />
            Exportar XLSX
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total</p>
                <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-gray-400" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Abertos</p>
                <p className="text-2xl font-bold text-red-600">{stats.abertos}</p>
              </div>
              <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-red-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Em Andamento</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.emAndamento}</p>
              </div>
              <div className="w-8 h-8 bg-yellow-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-yellow-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Finalizados</p>
                <p className="text-2xl font-bold text-green-600">{stats.finalizados}</p>
              </div>
              <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                <div className="w-3 h-3 bg-green-600 rounded-full"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Com Vítimas</p>
                <p className="text-2xl font-bold text-red-800">{stats.comVitimas}</p>
              </div>
              <User className="w-8 h-8 text-red-400" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center">
            <Filter className="w-5 h-5 mr-2" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, local, placa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="aberto">Aberto</SelectItem>
                <SelectItem value="em_andamento">Em Andamento</SelectItem>
                <SelectItem value="finalizado">Finalizado</SelectItem>
              </SelectContent>
            </Select>

            <Select value={tipoFilter} onValueChange={setTipoFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                <SelectItem value="veicular">Veicular</SelectItem>
                <SelectItem value="trabalhista_cat">Trabalhista/CAT</SelectItem>
                <SelectItem value="interno_base">Interno Base</SelectItem>
                <SelectItem value="externo_cliente">Externo Cliente</SelectItem>
                <SelectItem value="ambiental">Ambiental</SelectItem>
                <SelectItem value="falha_epi">Falha EPI</SelectItem>
                <SelectItem value="quase_acidente">Quase Acidente</SelectItem>
              </SelectContent>
            </Select>

            <Select value={monthFilter} onValueChange={setMonthFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Mês" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="1">Janeiro</SelectItem>
                <SelectItem value="2">Fevereiro</SelectItem>
                <SelectItem value="3">Março</SelectItem>
                <SelectItem value="4">Abril</SelectItem>
                <SelectItem value="5">Maio</SelectItem>
                <SelectItem value="6">Junho</SelectItem>
                <SelectItem value="7">Julho</SelectItem>
                <SelectItem value="8">Agosto</SelectItem>
                <SelectItem value="9">Setembro</SelectItem>
                <SelectItem value="10">Outubro</SelectItem>
                <SelectItem value="11">Novembro</SelectItem>
                <SelectItem value="12">Dezembro</SelectItem>
              </SelectContent>
            </Select>

            <Select value={yearFilter} onValueChange={setYearFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Ano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
                <SelectItem value="2026">2026</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Lista de Sinistros ({filteredSinistros.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          ) : filteredSinistros.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum sinistro encontrado</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Local</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Vítimas</TableHead>
                  <TableHead>Registrado por</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSinistros.map((sinistro: Sinistro) => (
                  <TableRow key={sinistro.id}>
                    <TableCell>
                      <span className="font-medium">{getTipoLabel(sinistro.tipo)}</span>
                    </TableCell>
                    <TableCell>
                      {sinistro.placaTracao || "-"}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {sinistro.localEndereco}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-1 text-gray-400" />
                        {format(new Date(sinistro.dataOcorrido), "dd/MM/yyyy", { locale: ptBR })}
                      </div>
                    </TableCell>
                    <TableCell>{getStatusBadge(sinistro.status)}</TableCell>
                    <TableCell>
                      {sinistro.vitimas ? (
                        <Badge className="bg-red-100 text-red-800">Sim</Badge>
                      ) : (
                        <Badge className="bg-gray-100 text-gray-800">Não</Badge>
                      )}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium">{sinistro.nomeRegistrador}</span>
                        <span className="text-xs text-gray-500">{sinistro.cargoRegistrador}</span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex space-x-1">
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleView(sinistro)}
                          title="Visualizar detalhes"
                        >
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handlePrint(sinistro)}
                          title="Imprimir PDF"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                        <Button 
                          size="sm" 
                          variant="outline"
                          onClick={() => handleEdit(sinistro)}
                          title="Editar sinistro"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        {sinistro.status !== "finalizado" && (
                          <Button 
                            size="sm" 
                            variant="outline"
                            onClick={() => finalizarSinistroMutation.mutate(sinistro.id)}
                            disabled={finalizarSinistroMutation.isPending}
                            title="Finalizar sinistro"
                            className="text-green-600 hover:text-green-700"
                          >
                            <CheckCircle className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Modal de Visualização */}
      <Dialog open={viewModalOpen} onOpenChange={setViewModalOpen}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes do Sinistro</DialogTitle>
          </DialogHeader>
          {selectedSinistro && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <h3 className="font-semibold text-lg mb-3">Informações Básicas</h3>
                  <div className="space-y-2">
                    <p><strong>Tipo:</strong> {selectedSinistro.tipo}</p>
                    <p><strong>Status:</strong> <Badge variant={selectedSinistro.status === 'finalizado' ? 'default' : selectedSinistro.status === 'aberto' ? 'destructive' : 'secondary'}>{selectedSinistro.status}</Badge></p>
                    <p><strong>Data:</strong> {selectedSinistro.dataOcorrido}</p>
                    <p><strong>Hora:</strong> {selectedSinistro.horaOcorrido}</p>
                    <p><strong>Local:</strong> {selectedSinistro.localEndereco}</p>
                  </div>
                </div>
                <div>
                  <h3 className="font-semibold text-lg mb-3">Envolvidos</h3>
                  <div className="space-y-2">
                    <p><strong>Nome:</strong> {selectedSinistro.nomeEnvolvido}</p>
                    <p><strong>Cargo:</strong> {selectedSinistro.cargoEnvolvido || 'N/A'}</p>
                    <p><strong>Vítimas:</strong> {selectedSinistro.vitimas ? 'Sim' : 'Não'}</p>
                    {selectedSinistro.descricaoVitimas && (
                      <p><strong>Descrição das Vítimas:</strong> {selectedSinistro.descricaoVitimas}</p>
                    )}
                  </div>
                </div>
              </div>

              {selectedSinistro.tipo === 'veicular' && (
                <div>
                  <h3 className="font-semibold text-lg mb-3">Informações Veiculares</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <p><strong>Placa Tração:</strong> {selectedSinistro.placaTracao || 'N/A'}</p>
                      <p><strong>Tipo de Colisão:</strong> {selectedSinistro.tipoColisao || 'N/A'}</p>
                      <p><strong>Condições do Trajeto:</strong> {selectedSinistro.condicoesTrajeto || 'N/A'}</p>
                    </div>
                    <div className="space-y-2">
                      <p><strong>Gravidade:</strong> {selectedSinistro.percepcaoGravidade || 'N/A'}</p>
                      <p><strong>Quem Sofreu Avaria:</strong> {selectedSinistro.quemSofreuAvaria || 'N/A'}</p>
                    </div>
                  </div>
                </div>
              )}

              <div>
                <h3 className="font-semibold text-lg mb-3">Observações</h3>
                <p className="bg-gray-50 p-3 rounded-md">{selectedSinistro.observacoes}</p>
              </div>

              <div>
                <h3 className="font-semibold text-lg mb-3">Registro</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <p><strong>Registrado por:</strong> {selectedSinistro.nomeRegistrador}</p>
                    <p><strong>Cargo:</strong> {selectedSinistro.cargoRegistrador}</p>
                  </div>
                  <div className="space-y-2">
                    <p><strong>Data de Criação:</strong> {format(new Date(selectedSinistro.createdAt), 'dd/MM/yyyy HH:mm', { locale: ptBR })}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Sinistro</DialogTitle>
          </DialogHeader>
          <div className="p-4">
            <p className="text-gray-600">Funcionalidade de edição será implementada em breve.</p>
            <Button 
              onClick={() => setEditModalOpen(false)}
              className="mt-4"
            >
              Fechar
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}