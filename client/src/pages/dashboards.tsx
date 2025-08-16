import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery } from "@tanstack/react-query";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from "recharts";
import { 
  Truck, 
  Wrench, 
  Warehouse, 
  AlertTriangle, 
  DollarSign, 
  Users, 
  TrendingUp, 
  Clock, 
  AlertCircle,
  CheckCircle,
  XCircle,
  TrendingDown,
  Calendar,
  Target,
  MapPin
} from "lucide-react";

const COLORS = ['#0C29AB', '#1E40AF', '#3B82F6', '#60A5FA', '#93C5FD', '#DBEAFE'];

export default function Dashboards() {
  const [selectedPeriod, setSelectedPeriod] = useState("mes");
  const [selectedYear, setSelectedYear] = useState("2025");

  // Queries para dados dos dashboards
  const { data: maintenanceData } = useQuery({
    queryKey: ['/api/dashboard/maintenance', selectedPeriod, selectedYear]
  });

  const { data: warehouseData } = useQuery({
    queryKey: ['/api/dashboard/warehouse', selectedPeriod, selectedYear]
  });

  const { data: accidentsData } = useQuery({
    queryKey: ['/api/dashboard/accidents', selectedPeriod, selectedYear]
  });

  const { data: financialData } = useQuery({
    queryKey: ['/api/dashboard/financial', selectedPeriod, selectedYear]
  });

  const { data: vehiclesData } = useQuery({
    queryKey: ['/api/dashboard/vehicles']
  });

  const { data: hrData } = useQuery({
    queryKey: ['/api/dashboard/hr', selectedPeriod, selectedYear]
  });

  return (
    <div className="container mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboards FELKA</h1>
          <p className="text-gray-600 mt-2">Indicadores e métricas da operação</p>
        </div>
        <div className="flex gap-2">
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-32" data-testid="select-period">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="mes">Mês</SelectItem>
              <SelectItem value="trimestre">Trimestre</SelectItem>
              <SelectItem value="semestre">Semestre</SelectItem>
              <SelectItem value="ano">Ano</SelectItem>
            </SelectContent>
          </Select>
          <Select value={selectedYear} onValueChange={setSelectedYear}>
            <SelectTrigger className="w-24" data-testid="select-year">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="2024">2024</SelectItem>
              <SelectItem value="2025">2025</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <Tabs defaultValue="maintenance" className="w-full">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="maintenance" className="flex items-center gap-2">
            <Wrench className="w-4 h-4" />
            Manutenção
          </TabsTrigger>
          <TabsTrigger value="warehouse" className="flex items-center gap-2">
            <Warehouse className="w-4 h-4" />
            Almoxarifado
          </TabsTrigger>
          <TabsTrigger value="accidents" className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4" />
            Sinistros
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="vehicles" className="flex items-center gap-2">
            <Truck className="w-4 h-4" />
            Veículos
          </TabsTrigger>
          <TabsTrigger value="hr" className="flex items-center gap-2">
            <Users className="w-4 h-4" />
            RH
          </TabsTrigger>
        </TabsList>

        {/* Dashboard de Manutenção */}
        <TabsContent value="maintenance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Veículos Parados</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-vehicles-stopped">
                  {maintenanceData?.vehiclesStopped || 8}
                </div>
                <p className="text-xs text-muted-foreground">
                  de {maintenanceData?.totalVehicles || 45} veículos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Total Mês</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-cost">
                  R$ {maintenanceData?.totalCost?.toLocaleString() || '125.430'}
                </div>
                <p className="text-xs text-muted-foreground">
                  +12% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPK Médio</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-average-cpk">
                  R$ {maintenanceData?.averageCPK || '0,45'}/km
                </div>
                <p className="text-xs text-muted-foreground">
                  -5% vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio Parada</CardTitle>
                <Clock className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-average-downtime">
                  {maintenanceData?.averageDowntime || '2,3'} dias
                </div>
                <p className="text-xs text-muted-foreground">
                  Meta: 1,5 dias
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Manutenções: Corretiva vs Preventiva</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={maintenanceData?.maintenanceTypes || [
                    { month: 'Jan', corretiva: 45, preventiva: 65 },
                    { month: 'Fev', corretiva: 38, preventiva: 72 },
                    { month: 'Mar', corretiva: 52, preventiva: 58 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="corretiva" fill="#EF4444" name="Corretiva" />
                    <Bar dataKey="preventiva" fill="#10B981" name="Preventiva" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Top 5 Veículos - Maior Custo</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(maintenanceData?.topCostVehicles || [
                    { plate: 'ABC-1234', cost: 8500, vehicle: 'Scania R450' },
                    { plate: 'DEF-5678', cost: 7200, vehicle: 'Volvo FH460' },
                    { plate: 'GHI-9012', cost: 6800, vehicle: 'Mercedes Actros' },
                    { plate: 'JKL-3456', cost: 5900, vehicle: 'Iveco Stralis' },
                    { plate: 'MNO-7890', cost: 5200, vehicle: 'DAF XF' }
                  ]).map((vehicle, index) => (
                    <div key={vehicle.plate} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}º</Badge>
                        <div>
                          <div className="font-medium">{vehicle.plate}</div>
                          <div className="text-sm text-gray-500">{vehicle.vehicle}</div>
                        </div>
                      </div>
                      <div className="font-bold text-red-600">
                        R$ {vehicle.cost.toLocaleString()}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Checklists Não Realizados
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-orange-600 mb-2" data-testid="text-pending-checklists">
                {maintenanceData?.pendingChecklists || 23}
              </div>
              <p className="text-sm text-gray-600">checklists pendentes de realização</p>
              <Button variant="outline" className="mt-3" data-testid="button-view-checklists">
                Ver Checklists Pendentes
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard de Almoxarifado */}
        <TabsContent value="warehouse" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total Estoque</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-total-stock-value">
                  R$ {warehouseData?.totalStockValue?.toLocaleString() || '425.680'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Atualizado hoje
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-low-stock-items">
                  {warehouseData?.lowStockItems || 15}
                </div>
                <p className="text-xs text-muted-foreground">
                  itens abaixo do mínimo
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rupturas Críticas</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-critical-shortages">
                  {warehouseData?.criticalShortages || 3}
                </div>
                <p className="text-xs text-muted-foreground">
                  itens em falta crítica
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Vencimento Próximo</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600" data-testid="text-expiring-items">
                  {warehouseData?.expiringItems || 7}
                </div>
                <p className="text-xs text-muted-foreground">
                  próximos 30 dias
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Top 10 Itens Mais Consumidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {(warehouseData?.topConsumedItems || [
                    { item: 'Óleo Motor 15W40', quantity: 85, unit: 'L' },
                    { item: 'Filtro de Ar', quantity: 42, unit: 'UN' },
                    { item: 'Pastilha de Freio', quantity: 38, unit: 'JG' },
                    { item: 'Filtro de Óleo', quantity: 35, unit: 'UN' },
                    { item: 'Lâmpada H7', quantity: 28, unit: 'UN' }
                  ]).slice(0, 5).map((item, index) => (
                    <div key={item.item} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}º</Badge>
                        <div className="font-medium">{item.item}</div>
                      </div>
                      <div className="font-bold">
                        {item.quantity} {item.unit}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Entradas vs Saídas</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={warehouseData?.movementData || [
                    { month: 'Jan', entradas: 125, saidas: 118 },
                    { month: 'Fev', entradas: 135, saidas: 128 },
                    { month: 'Mar', entradas: 142, saidas: 135 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line type="monotone" dataKey="entradas" stroke="#10B981" name="Entradas" />
                    <Line type="monotone" dataKey="saidas" stroke="#EF4444" name="Saídas" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Valor em Estoque por Setor</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={warehouseData?.stockBySector || [
                      { name: 'Manutenção', value: 180500, color: '#0C29AB' },
                      { name: 'Peças Gerais', value: 125300, color: '#1E40AF' },
                      { name: 'Consumíveis', value: 89200, color: '#3B82F6' },
                      { name: 'Emergência', value: 30680, color: '#60A5FA' }
                    ]}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {(warehouseData?.stockBySector || []).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard de Sinistros e Ocorrências */}
        <TabsContent value="accidents" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Sinistros Mês</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-total-accidents">
                  {accidentsData?.totalAccidents || 12}
                </div>
                <p className="text-xs text-muted-foreground">
                  +2 vs mês anterior
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Médio</CardTitle>
                <DollarSign className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-average-accident-cost">
                  R$ {accidentsData?.averageCost?.toLocaleString() || '8.500'}
                </div>
                <p className="text-xs text-muted-foreground">
                  por sinistro
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Resolução</CardTitle>
                <Clock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-resolution-time">
                  {accidentsData?.averageResolutionTime || '5,2'} dias
                </div>
                <p className="text-xs text-muted-foreground">
                  média de resolução
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Reincidências</CardTitle>
                <XCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-recurring-accidents">
                  3
                </div>
                <p className="text-xs text-muted-foreground">
                  veículos reincidentes
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Classificação dos Sinistros</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={accidentsData?.classification || [
                        { type: 'Leve', count: 7, color: '#10B981' },
                        { type: 'Médio', count: 3, color: '#F59E0B' },
                        { type: 'Grave', count: 2, color: '#EF4444' }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ type, count }) => `${type}: ${count}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="count"
                    >
                      {(accidentsData?.classification || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Responsáveis Recorrentes</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {[
                    { name: 'João Silva', incidents: 3, type: 'Motorista' },
                    { name: 'Carlos Santos', incidents: 2, type: 'Motorista' },
                    { name: 'BR-101 KM 85', incidents: 4, type: 'Trecho' },
                    { name: 'Base SP', incidents: 3, type: 'Base' }
                  ].map((responsible, index) => (
                    <div key={responsible.name} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{responsible.type}</Badge>
                        <div className="font-medium">{responsible.name}</div>
                      </div>
                      <div className="font-bold text-red-600">
                        {responsible.incidents} casos
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dashboard Financeiro */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Custo Mensal Total</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-monthly-cost">
                  R$ {financialData?.totalMonthlyCost?.toLocaleString() || '285.000'}
                </div>
                <p className="text-xs text-muted-foreground">
                  frota completa
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">CPK Médio Geral</CardTitle>
                <Target className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-general-cpk">
                  R$ {financialData?.averageCPK || '0,45'}/km
                </div>
                <p className="text-xs text-muted-foreground">
                  custo por quilômetro
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Desvio Orçamento</CardTitle>
                <TrendingUp className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600" data-testid="text-budget-variance">
                  +{financialData?.budgetVariance || 12,5}%
                </div>
                <p className="text-xs text-muted-foreground">
                  vs orçado
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Veículos Fora Orçamento</CardTitle>
                <AlertCircle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-off-budget-vehicles">
                  18%
                </div>
                <p className="text-xs text-muted-foreground">
                  da frota
                </p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Breakdown de Custos</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={financialData?.costBreakdown || [
                  { category: 'Combustível', value: 125000 },
                  { category: 'Manutenção', value: 85000 },
                  { category: 'Pedágios', value: 45000 },
                  { category: 'Outros', value: 30000 }
                ]}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="category" />
                  <YAxis />
                  <Tooltip formatter={(value) => `R$ ${Number(value).toLocaleString()}`} />
                  <Bar dataKey="value" fill="#0C29AB" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Dashboard de Veículos */}
        <TabsContent value="vehicles" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Frota Ativa</CardTitle>
                <Truck className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-fleet">
                  {vehiclesData?.totalActiveVehicles || 45}
                </div>
                <p className="text-xs text-muted-foreground">
                  veículos operacionais
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Valor Total Frota</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-fleet-value">
                  R$ {vehiclesData?.totalFleetValue?.toLocaleString() || '12.600.000'}
                </div>
                <p className="text-xs text-muted-foreground">
                  valor atualizado FIPE
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Idade Média</CardTitle>
                <Calendar className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-average-age">
                  {vehiclesData?.averageAge || '6,8'} anos
                </div>
                <p className="text-xs text-muted-foreground">
                  idade da frota
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Renovação Urgente</CardTitle>
                <AlertTriangle className="h-4 w-4 text-red-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600" data-testid="text-urgent-renewal">
                  8
                </div>
                <p className="text-xs text-muted-foreground">
                  veículos +10 anos
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Classificação</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={vehiclesData?.classificationData || [
                        { name: 'Cavalo', value: 18 },
                        { name: 'Carreta', value: 15 },
                        { name: 'Truck', value: 8 },
                        { name: 'Munck', value: 4 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(vehiclesData?.classificationData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição da Idade</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={vehiclesData?.ageDistribution || [
                    { range: '0-3 anos', count: 12 },
                    { range: '4-6 anos', count: 18 },
                    { range: '7-9 anos', count: 15 },
                    { range: '10+ anos', count: 8 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="range" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="#0C29AB" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        {/* Dashboard de RH */}
        <TabsContent value="hr" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Colaboradores Ativos</CardTitle>
                <Users className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-active-employees">
                  {hrData?.totalActiveEmployees || 120}
                </div>
                <p className="text-xs text-muted-foreground">
                  funcionários ativos
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Afastados</CardTitle>
                <AlertCircle className="h-4 w-4 text-orange-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600" data-testid="text-on-leave">
                  {hrData?.onLeave || 5}
                </div>
                <p className="text-xs text-muted-foreground">
                  colaboradores afastados
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Turnover</CardTitle>
                <TrendingDown className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-turnover">
                  {hrData?.turnover || 8.5}%
                </div>
                <p className="text-xs text-muted-foreground">
                  nos últimos 12 meses
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Tempo Médio Casa</CardTitle>
                <Clock className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold" data-testid="text-average-tenure">
                  {hrData?.averageTenure || '3,2'} anos
                </div>
                <p className="text-xs text-muted-foreground">
                  tempo médio empresa
                </p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Distribuição por Cargo</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={hrData?.positionData || [
                        { name: 'Motorista', value: 45 },
                        { name: 'Administrativo', value: 25 },
                        { name: 'Mecânico', value: 15 },
                        { name: 'Ajudante', value: 20 },
                        { name: 'Outros', value: 15 }
                      ]}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {(hrData?.positionData || []).map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Contratações vs Desligamentos</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={hrData?.hiringData || [
                    { month: 'Jan', contratados: 8, desligados: 3 },
                    { month: 'Fev', contratados: 5, desligados: 7 },
                    { month: 'Mar', contratados: 12, desligados: 2 }
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="contratados" fill="#10B981" name="Contratados" />
                    <Bar dataKey="desligados" fill="#EF4444" name="Desligados" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-500" />
                Vagas em Aberto
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold text-blue-600 mb-2" data-testid="text-open-positions">
                {hrData?.openPositions || 5}
              </div>
              <p className="text-sm text-gray-600">posições para preenchimento</p>
              <Button variant="outline" className="mt-3" data-testid="button-view-positions">
                Ver Vagas Abertas
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}