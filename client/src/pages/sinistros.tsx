import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { AlertTriangle, Eye, FileText, Search, Filter, Calendar, User, MapPin } from "lucide-react";
import { SinistroForm } from "@/components/sinistros/sinistro-form";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Sinistro {
  id: string;
  tipo: string;
  placa?: string;
  nomeEnvolvido: string;
  cargoEnvolvido?: string;
  dataOcorrido: string;
  local: string;
  descricao: string;
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

  const { data: sinistros = [], isLoading } = useQuery({
    queryKey: ["/api/sinistros"],
  });

  const filteredSinistros = sinistros.filter((sinistro: Sinistro) => {
    const matchesSearch = 
      sinistro.nomeEnvolvido.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.local.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.placa?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      sinistro.descricao.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || sinistro.status === statusFilter;
    const matchesTipo = tipoFilter === "all" || sinistro.tipo === tipoFilter;
    
    return matchesSearch && matchesStatus && matchesTipo;
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
        <SinistroForm 
          userInfo={{ id: "admin-1", name: "Administrador", role: "admin" }}
        />
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
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
                  <TableHead>Envolvido</TableHead>
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
                      <div className="flex flex-col">
                        <span className="font-medium">{getTipoLabel(sinistro.tipo)}</span>
                        {sinistro.placa && (
                          <span className="text-sm text-gray-500">{sinistro.placa}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium">{sinistro.nomeEnvolvido}</span>
                        {sinistro.cargoEnvolvido && (
                          <span className="text-sm text-gray-500">{sinistro.cargoEnvolvido}</span>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        {sinistro.local}
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
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button size="sm" variant="outline">
                          <FileText className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}