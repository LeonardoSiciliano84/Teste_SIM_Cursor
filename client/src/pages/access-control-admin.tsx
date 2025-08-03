import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { 
  Users, 
  UserCheck, 
  Car, 
  Clock, 
  Search,
  Filter,
  Download,
  Eye,
  Calendar,
  BarChart3,
  TrendingUp,
  UserX,
  ArrowRight,
  ArrowLeft,
  Shield,
  AlertCircle
} from "lucide-react";
import * as XLSX from 'xlsx';

interface AccessLog {
  id: string;
  personType: 'employee' | 'visitor' | 'vehicle';
  personId: string;
  personName: string;
  personCpf?: string;
  direction: 'entry' | 'exit';
  accessMethod: 'qr_code' | 'manual' | 'facial_recognition';
  location: string;
  timestamp: Date;
  verifiedBy?: string;
  notes?: string;
}

interface AccessStats {
  totalEntriesToday: number;
  totalExitsToday: number;
  employeesInside: number;
  visitorsInside: number;
  vehiclesInside: number;
  averageStayTime: number;
  peakHour: string;
}

export default function AccessControlAdmin() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para filtros
  const [dateFilter, setDateFilter] = useState({
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date().toISOString().split('T')[0]
  });
  const [personTypeFilter, setPersonTypeFilter] = useState<string>('todos');
  const [directionFilter, setDirectionFilter] = useState<string>('todos');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedTab, setSelectedTab] = useState('overview');

  // Buscar dados
  const { data: accessLogs = [], isLoading: logsLoading } = useQuery<AccessLog[]>({
    queryKey: ['/api/access-control/logs', dateFilter, personTypeFilter, directionFilter, searchTerm],
    queryFn: () => {
      const params = new URLSearchParams({
        startDate: dateFilter.startDate,
        endDate: dateFilter.endDate,
        ...(personTypeFilter !== 'todos' && { personType: personTypeFilter }),
        ...(directionFilter !== 'todos' && { direction: directionFilter }),
        ...(searchTerm && { search: searchTerm })
      });
      return apiRequest(`/api/access-control/logs?${params.toString()}`);
    }
  });

  const { data: accessStats } = useQuery<AccessStats>({
    queryKey: ['/api/access-control/stats', dateFilter.startDate],
    queryFn: () => apiRequest(`/api/access-control/stats?date=${dateFilter.startDate}`)
  });

  const { data: employees = [] } = useQuery<any[]>({
    queryKey: ['/api/employees'],
    queryFn: () => apiRequest('/api/employees')
  });

  const { data: visitors = [] } = useQuery<any[]>({
    queryKey: ['/api/access-control/visitors'],
    queryFn: () => apiRequest('/api/access-control/visitors')
  });

  const { data: vehicles = [] } = useQuery<any[]>({
    queryKey: ['/api/vehicles'],
    queryFn: () => apiRequest('/api/vehicles')
  });

  // Função para exportar dados
  const handleExportLogs = () => {
    const exportData = accessLogs.map(log => ({
      'Data/Hora': new Date(log.timestamp).toLocaleString('pt-BR'),
      'Tipo': log.personType === 'employee' ? 'Funcionário' : 
             log.personType === 'visitor' ? 'Visitante' : 'Veículo',
      'Nome': log.personName,
      'CPF': log.personCpf || '-',
      'Direção': log.direction === 'entry' ? 'Entrada' : 'Saída',
      'Método': log.accessMethod === 'qr_code' ? 'QR Code' : 
               log.accessMethod === 'manual' ? 'Manual' : 'Reconhecimento Facial',
      'Local': log.location,
      'Verificado por': log.verifiedBy || 'Sistema',
      'Observações': log.notes || '-'
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Logs de Acesso');
    
    const fileName = `logs_acesso_${dateFilter.startDate}_${dateFilter.endDate}.xlsx`;
    XLSX.writeFile(workbook, fileName);
    
    toast({
      title: "Exportação concluída",
      description: `Arquivo ${fileName} foi baixado com sucesso.`
    });
  };

  // Filtrar logs em tempo real
  const filteredLogs = accessLogs.filter(log => {
    const matchesSearch = !searchTerm || 
      log.personName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (log.personCpf && log.personCpf.includes(searchTerm));
    
    return matchesSearch;
  });

  // Estatísticas calculadas
  const todaysLogs = accessLogs.filter(log => 
    new Date(log.timestamp).toDateString() === new Date().toDateString()
  );

  const employeesInsideCount = todaysLogs
    .filter(log => log.personType === 'employee')
    .reduce((acc, log) => {
      return log.direction === 'entry' ? acc + 1 : acc - 1;
    }, 0);

  const visitorsInsideCount = todaysLogs
    .filter(log => log.personType === 'visitor')
    .reduce((acc, log) => {
      return log.direction === 'entry' ? acc + 1 : acc - 1;
    }, 0);

  const vehiclesInsideCount = todaysLogs
    .filter(log => log.personType === 'vehicle')
    .reduce((acc, log) => {
      return log.direction === 'entry' ? acc + 1 : acc - 1;
    }, 0);

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="h-8 w-8 text-[#0C29AB]" />
              Controle de Acesso - Administração
            </h1>
            <p className="text-gray-600 mt-2">
              Gestão completa de entradas e saídas de funcionários, visitantes e veículos
            </p>
          </div>
          <div className="flex gap-3">
            <Button onClick={handleExportLogs} className="bg-[#0C29AB] hover:bg-blue-700">
              <Download className="h-4 w-4 mr-2" />
              Exportar Logs
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            Visão Geral
          </TabsTrigger>
          <TabsTrigger value="logs" className="flex items-center gap-2">
            <Clock className="h-4 w-4" />
            Logs Detalhados
          </TabsTrigger>
          <TabsTrigger value="people-inside" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            Pessoas no Local
          </TabsTrigger>
          <TabsTrigger value="reports" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            Relatórios
          </TabsTrigger>
        </TabsList>

        {/* Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          {/* Cards de estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-l-4 border-l-green-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Entradas Hoje</p>
                    <p className="text-3xl font-bold text-green-600">
                      {todaysLogs.filter(log => log.direction === 'entry').length}
                    </p>
                  </div>
                  <ArrowRight className="h-8 w-8 text-green-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-red-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Saídas Hoje</p>
                    <p className="text-3xl font-bold text-red-600">
                      {todaysLogs.filter(log => log.direction === 'exit').length}
                    </p>
                  </div>
                  <ArrowLeft className="h-8 w-8 text-red-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-blue-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Funcionários Dentro</p>
                    <p className="text-3xl font-bold text-blue-600">{Math.max(0, employeesInsideCount)}</p>
                  </div>
                  <Users className="h-8 w-8 text-blue-500" />
                </div>
              </CardContent>
            </Card>

            <Card className="border-l-4 border-l-purple-500">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-600">Visitantes Dentro</p>
                    <p className="text-3xl font-bold text-purple-600">{Math.max(0, visitorsInsideCount)}</p>
                  </div>
                  <UserCheck className="h-8 w-8 text-purple-500" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Atividade Recente */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Atividade Recente (Últimas 10)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {accessLogs.slice(0, 10).map((log) => (
                  <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-full ${
                        log.direction === 'entry' 
                          ? 'bg-green-100 text-green-600' 
                          : 'bg-red-100 text-red-600'
                      }`}>
                        {log.direction === 'entry' ? 
                          <ArrowRight className="h-4 w-4" /> : 
                          <ArrowLeft className="h-4 w-4" />
                        }
                      </div>
                      <div>
                        <p className="font-medium text-sm">{log.personName}</p>
                        <p className="text-xs text-gray-500">
                          {log.personType === 'employee' ? 'Funcionário' : 
                           log.personType === 'visitor' ? 'Visitante' : 'Veículo'}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <Badge 
                        variant={log.direction === 'entry' ? 'default' : 'secondary'}
                        className="text-xs mb-1"
                      >
                        {log.direction === 'entry' ? 'Entrada' : 'Saída'}
                      </Badge>
                      <p className="text-xs text-gray-500">
                        {new Date(log.timestamp).toLocaleTimeString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Detalhados */}
        <TabsContent value="logs" className="space-y-6">
          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros de Busca
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Data Início
                  </label>
                  <Input
                    type="date"
                    value={dateFilter.startDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Data Fim
                  </label>
                  <Input
                    type="date"
                    value={dateFilter.endDate}
                    onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Tipo de Pessoa
                  </label>
                  <Select value={personTypeFilter} onValueChange={setPersonTypeFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="employee">Funcionários</SelectItem>
                      <SelectItem value="visitor">Visitantes</SelectItem>
                      <SelectItem value="vehicle">Veículos</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium text-gray-700 mb-2 block">
                    Direção
                  </label>
                  <Select value={directionFilter} onValueChange={setDirectionFilter}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="todos">Todos</SelectItem>
                      <SelectItem value="entry">Entradas</SelectItem>
                      <SelectItem value="exit">Saídas</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="mt-4">
                <label className="text-sm font-medium text-gray-700 mb-2 block">
                  Buscar por Nome ou CPF
                </label>
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                  <Input
                    placeholder="Digite nome ou CPF..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Tabela de Logs */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Logs de Acesso ({filteredLogs.length} registros)</CardTitle>
              <Button onClick={handleExportLogs} size="sm">
                <Download className="h-4 w-4 mr-2" />
                Exportar
              </Button>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Nome</TableHead>
                      <TableHead>CPF</TableHead>
                      <TableHead>Direção</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Local</TableHead>
                      <TableHead>Verificado por</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {logsLoading ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4">
                          Carregando logs...
                        </TableCell>
                      </TableRow>
                    ) : filteredLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={8} className="text-center py-4 text-gray-500">
                          Nenhum log encontrado para os filtros selecionados
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="font-mono text-sm">
                            {new Date(log.timestamp).toLocaleString('pt-BR')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">
                              {log.personType === 'employee' ? 'Funcionário' : 
                               log.personType === 'visitor' ? 'Visitante' : 'Veículo'}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-medium">{log.personName}</TableCell>
                          <TableCell className="font-mono">{log.personCpf || '-'}</TableCell>
                          <TableCell>
                            <Badge 
                              variant={log.direction === 'entry' ? 'default' : 'secondary'}
                              className={log.direction === 'entry' ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}
                            >
                              {log.direction === 'entry' ? 'Entrada' : 'Saída'}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            {log.accessMethod === 'qr_code' ? 'QR Code' : 
                             log.accessMethod === 'manual' ? 'Manual' : 'Reconhecimento Facial'}
                          </TableCell>
                          <TableCell>{log.location}</TableCell>
                          <TableCell>{log.verifiedBy || 'Sistema'}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Pessoas no Local */}
        <TabsContent value="people-inside" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Funcionários Dentro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-blue-700">
                  <Users className="h-5 w-5" />
                  Funcionários no Local ({Math.max(0, employeesInsideCount)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {employees
                    .filter((employee: any) => {
                      const employeeLogs = todaysLogs.filter(log => 
                        log.personType === 'employee' && log.personId === employee.id
                      );
                      const lastLog = employeeLogs[employeeLogs.length - 1];
                      return lastLog && lastLog.direction === 'entry';
                    })
                    .map((employee: any) => {
                      const lastEntry = todaysLogs
                        .filter(log => log.personType === 'employee' && log.personId === employee.id)
                        .find(log => log.direction === 'entry');
                      
                      return (
                        <div key={employee.id} className="flex items-center justify-between p-3 border rounded-lg bg-blue-50">
                          <div>
                            <p className="font-medium text-sm">{employee.fullName}</p>
                            <p className="text-xs text-gray-600">{employee.department}</p>
                            <p className="text-xs text-blue-600">
                              Entrada: {lastEntry ? new Date(lastEntry.timestamp).toLocaleTimeString('pt-BR') : '-'}
                            </p>
                          </div>
                          <Badge className="bg-blue-100 text-blue-800">Dentro</Badge>
                        </div>
                      );
                    })}
                  {Math.max(0, employeesInsideCount) === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum funcionário no local
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Visitantes Dentro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-purple-700">
                  <UserCheck className="h-5 w-5" />
                  Visitantes no Local ({Math.max(0, visitorsInsideCount)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {visitors
                    .filter((visitor: any) => {
                      const visitorLogs = todaysLogs.filter(log => 
                        log.personType === 'visitor' && log.personId === visitor.id
                      );
                      const lastLog = visitorLogs[visitorLogs.length - 1];
                      return lastLog && lastLog.direction === 'entry';
                    })
                    .map((visitor: any) => {
                      const lastEntry = todaysLogs
                        .filter(log => log.personType === 'visitor' && log.personId === visitor.id)
                        .find(log => log.direction === 'entry');
                      
                      return (
                        <div key={visitor.id} className="flex items-center justify-between p-3 border rounded-lg bg-purple-50">
                          <div>
                            <p className="font-medium text-sm">{visitor.name}</p>
                            <p className="text-xs text-gray-600">CPF: {visitor.cpf}</p>
                            <p className="text-xs text-purple-600">
                              Entrada: {lastEntry ? new Date(lastEntry.timestamp).toLocaleTimeString('pt-BR') : '-'}
                            </p>
                          </div>
                          <Badge className="bg-purple-100 text-purple-800">Dentro</Badge>
                        </div>
                      );
                    })}
                  {Math.max(0, visitorsInsideCount) === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum visitante no local
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Veículos Dentro */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <Car className="h-5 w-5" />
                  Veículos no Local ({Math.max(0, vehiclesInsideCount)})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {vehicles
                    .filter((vehicle: any) => {
                      const vehicleLogs = todaysLogs.filter(log => 
                        log.personType === 'vehicle' && log.personId === vehicle.id
                      );
                      const lastLog = vehicleLogs[vehicleLogs.length - 1];
                      return lastLog && lastLog.direction === 'entry';
                    })
                    .map((vehicle: any) => {
                      const lastEntry = todaysLogs
                        .filter(log => log.personType === 'vehicle' && log.personId === vehicle.id)
                        .find(log => log.direction === 'entry');
                      
                      return (
                        <div key={vehicle.id} className="flex items-center justify-between p-3 border rounded-lg bg-orange-50">
                          <div>
                            <p className="font-medium text-sm">{vehicle.plate}</p>
                            <p className="text-xs text-gray-600">{vehicle.brand} {vehicle.model}</p>
                            <p className="text-xs text-orange-600">
                              Entrada: {lastEntry ? new Date(lastEntry.timestamp).toLocaleTimeString('pt-BR') : '-'}
                            </p>
                          </div>
                          <Badge className="bg-orange-100 text-orange-800">Dentro</Badge>
                        </div>
                      );
                    })}
                  {Math.max(0, vehiclesInsideCount) === 0 && (
                    <p className="text-center text-gray-500 py-4">
                      Nenhum veículo no local
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Relatórios */}
        <TabsContent value="reports" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Relatório por Período */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="h-5 w-5" />
                  Relatório por Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Data Início
                      </label>
                      <Input
                        type="date"
                        value={dateFilter.startDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, startDate: e.target.value }))}
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 mb-2 block">
                        Data Fim
                      </label>
                      <Input
                        type="date"
                        value={dateFilter.endDate}
                        onChange={(e) => setDateFilter(prev => ({ ...prev, endDate: e.target.value }))}
                      />
                    </div>
                  </div>
                  
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <h4 className="font-medium mb-3">Resumo do Período</h4>
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Total de Entradas:</p>
                        <p className="font-bold text-green-600">
                          {accessLogs.filter(log => log.direction === 'entry').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Total de Saídas:</p>
                        <p className="font-bold text-red-600">
                          {accessLogs.filter(log => log.direction === 'exit').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Funcionários:</p>
                        <p className="font-bold text-blue-600">
                          {accessLogs.filter(log => log.personType === 'employee').length}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-600">Visitantes:</p>
                        <p className="font-bold text-purple-600">
                          {accessLogs.filter(log => log.personType === 'visitor').length}
                        </p>
                      </div>
                    </div>
                  </div>

                  <Button onClick={handleExportLogs} className="w-full">
                    <Download className="h-4 w-4 mr-2" />
                    Exportar Relatório Completo
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Estatísticas Rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Estatísticas de Hoje
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Pico de Movimentação</span>
                      <Clock className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-bold">08:00 - 09:00</p>
                    <p className="text-xs text-gray-500">Horário com mais acessos</p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Método Mais Usado</span>
                      <Shield className="h-4 w-4 text-gray-400" />
                    </div>
                    <p className="text-lg font-bold">QR Code</p>
                    <p className="text-xs text-gray-500">
                      {Math.round((todaysLogs.filter(log => log.accessMethod === 'qr_code').length / Math.max(1, todaysLogs.length)) * 100)}% dos acessos
                    </p>
                  </div>

                  <div className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm text-gray-600">Status Geral</span>
                      <AlertCircle className="h-4 w-4 text-green-500" />
                    </div>
                    <p className="text-lg font-bold text-green-600">Normal</p>
                    <p className="text-xs text-gray-500">Sistema funcionando perfeitamente</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}