import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Filter, 
  Download, 
  FileText, 
  Truck, 
  Calendar,
  MapPin,
  DollarSign,
  Settings,
  Eye,
  Grid3X3,
  List,
  BarChart3
} from "lucide-react";
import { type Vehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import VehicleForm from "./vehicle-form";
import VehicleDetails from "./vehicle-details";

interface VehicleListProps {
  onCreateVehicle?: () => void;
}

export default function VehicleList({ onCreateVehicle }: VehicleListProps) {
  const [showForm, setShowForm] = useState(false);
  const [selectedVehicle, setSelectedVehicle] = useState<Vehicle | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [typeFilter, setTypeFilter] = useState("all");
  const { toast } = useToast();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  const filteredVehicles = vehicles.filter((vehicle: Vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = statusFilter === "all" || vehicle.status === statusFilter;
    const matchesType = typeFilter === "all" || vehicle.classification === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const calculatePaymentProgress = (vehicle: Vehicle) => {
    if (!vehicle.purchaseDate || !vehicle.installmentCount || !vehicle.installmentValue) {
      return 0;
    }

    const purchaseDate = new Date(vehicle.purchaseDate);
    const currentDate = new Date();
    const monthsPassed = Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const paidInstallments = Math.min(monthsPassed, vehicle.installmentCount);
    
    return Math.round((paidInstallments / vehicle.installmentCount) * 100);
  };

  const generateVehiclePDF = async (vehicle: Vehicle) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/pdf`);
      
      if (!response.ok) {
        throw new Error('Erro ao gerar PDF');
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `ficha_${vehicle.plate}_${vehicle.name.replace(/\s+/g, '_')}.pdf`;
      a.click();
      window.URL.revokeObjectURL(url);

      toast({
        title: "PDF Gerado",
        description: `Ficha técnica do veículo ${vehicle.name} foi gerada com sucesso!`,
      });
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF do veículo",
        variant: "destructive",
      });
    }
  };

  const exportToExcel = () => {
    // Simulação da exportação
    const csvContent = [
      ["Nome", "Placa", "Marca", "Modelo", "Ano", "Status", "Classificação"].join(","),
      ...filteredVehicles.map((vehicle: Vehicle) => [
        vehicle.name,
        vehicle.plate,
        vehicle.brand || "",
        vehicle.model,
        vehicle.modelYear || "",
        vehicle.status,
        vehicle.classification || ""
      ].join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "veiculos_felka.csv";
    a.click();
    window.URL.revokeObjectURL(url);
  };

  if (showForm) {
    return (
      <VehicleForm
        onSuccess={() => {
          setShowForm(false);
          onCreateVehicle?.();
        }}
        onCancel={() => setShowForm(false)}
      />
    );
  }

  if (selectedVehicle) {
    return (
      <VehicleDetails
        vehicle={selectedVehicle}
        onBack={() => setSelectedVehicle(null)}
      />
    );
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg text-gray-600">Carregando veículos...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Veículos</h1>
          <p className="text-gray-600">Gerencie toda a frota da FELKA Transportes</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportToExcel}>
            <Download className="w-4 h-4 mr-2" />
            Exportar Excel
          </Button>
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Veículo
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros e Busca
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, placa, marca..."
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
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="maintenance">Manutenção</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>

            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Classificação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Classificações</SelectItem>
                <SelectItem value="Truck">Truck</SelectItem>
                <SelectItem value="Van">Van</SelectItem>
                <SelectItem value="Cavalo Mecânico Truck">Cavalo Mecânico</SelectItem>
                <SelectItem value="Carreta 14m">Carreta 14m</SelectItem>
                <SelectItem value="VUC">VUC</SelectItem>
              </SelectContent>
            </Select>

            <div className="text-sm text-gray-600 flex items-center">
              Total: {filteredVehicles.length} veículos
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Visualizações com Abas */}
      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="grid" className="flex items-center gap-2">
            <Grid3X3 className="w-4 h-4" />
            Visualização em Grade
          </TabsTrigger>
          <TabsTrigger value="table" className="flex items-center gap-2">
            <List className="w-4 h-4" />
            Visualização em Lista
          </TabsTrigger>
          <TabsTrigger value="classification" className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4" />
            Por Classificação
          </TabsTrigger>
        </TabsList>

        {/* Grade View */}
        <TabsContent value="grid" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle: Vehicle) => {
              const paymentProgress = calculatePaymentProgress(vehicle);
              
              return (
                <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="space-y-2">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-lg">{vehicle.name}</CardTitle>
                        <p className="text-sm text-gray-600">
                          {vehicle.brand} {vehicle.model}
                        </p>
                      </div>
                      {getStatusBadge(vehicle.status)}
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-gray-600">
                      <div className="flex items-center gap-1">
                        <Truck className="w-4 h-4" />
                        {vehicle.plate}
                      </div>
                      <div className="flex items-center gap-1">
                        <Calendar className="w-4 h-4" />
                        {vehicle.modelYear}
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-gray-600">Classificação</p>
                        <p className="font-medium">{vehicle.classification}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Tipo</p>
                        <p className="font-medium">{vehicle.vehicleType}</p>
                      </div>
                    </div>

                    {vehicle.currentLocation && (
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        <MapPin className="w-4 h-4" />
                        {vehicle.currentLocation}
                      </div>
                    )}

                    {/* Barra de Progresso de Pagamento */}
                    {vehicle.purchaseValue && vehicle.installmentCount && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Progresso Pagamento</span>
                          <span className="font-medium">{paymentProgress}%</span>
                        </div>
                        <Progress value={paymentProgress} className="h-2" />
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <DollarSign className="w-3 h-3" />
                          Valor: R$ {vehicle.purchaseValue ? parseFloat(vehicle.purchaseValue).toLocaleString('pt-BR') : 'N/A'}
                        </div>
                      </div>
                    )}

                    {/* Informações FIPE */}
                    {vehicle.fipeValue && (
                      <div className="p-3 bg-blue-50 rounded-lg">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600">Valor FIPE</span>
                          <span className="font-medium text-blue-600">
                            R$ {parseFloat(vehicle.fipeValue).toLocaleString('pt-BR')}
                          </span>
                        </div>
                      </div>
                    )}

                    <div className="flex gap-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setSelectedVehicle(vehicle)}
                        className="flex-1"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          generateVehiclePDF(vehicle);
                        }}
                      >
                        <FileText className="w-4 h-4" />
                      </Button>
                      <Link href={`/vehicles/edit/${vehicle.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                        >
                          <Settings className="w-4 h-4" />
                        </Button>
                      </Link>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>

        {/* Table View */}
        <TabsContent value="table" className="space-y-6">
          <Card>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Veículo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Placa
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Marca/Modelo
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ano
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Classificação
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredVehicles.map((vehicle) => (
                      <tr key={vehicle.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                              <Truck className="h-5 w-5 text-blue-600" />
                            </div>
                            <div>
                              <div className="text-sm font-medium text-gray-900">{vehicle.name}</div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-mono text-gray-900">{vehicle.plate}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{vehicle.brand} {vehicle.model}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm text-gray-900">{vehicle.modelYear}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span className="text-sm font-medium text-blue-600">
                            {vehicle.classification || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(vehicle.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => setSelectedVehicle(vehicle)}
                              title="Ver Detalhes"
                            >
                              <Eye className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generateVehiclePDF(vehicle)}
                              title="Imprimir Ficha"
                            >
                              <FileText className="w-4 h-4" />
                            </Button>
                            <Link href={`/vehicles/edit/${vehicle.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                title="Editar Veículo"
                              >
                                <Settings className="w-4 h-4" />
                              </Button>
                            </Link>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Classification View */}
        <TabsContent value="classification" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from(new Set(vehicles.map(v => v.classification || 'Sem Classificação'))).map((classification) => {
              const classificationVehicles = vehicles.filter(v => (v.classification || 'Sem Classificação') === classification);
              const filteredClassificationVehicles = filteredVehicles.filter(v => (v.classification || 'Sem Classificação') === classification);
              
              return (
                <Card key={classification}>
                  <CardHeader>
                    <CardTitle className="text-lg text-blue-600">
                      {classification}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-3xl font-bold text-blue-800 mb-2">{classificationVehicles.length}</div>
                    <p className="text-sm text-gray-600 mb-4">veículos cadastrados</p>
                    
                    {/* Lista dos veículos desta classificação */}
                    <div className="space-y-2">
                      {filteredClassificationVehicles
                        .slice(0, 3)
                        .map(vehicle => (
                          <div key={vehicle.id} className="flex items-center justify-between text-sm p-2 bg-gray-50 rounded">
                            <span className="text-gray-700 font-mono">{vehicle.plate}</span>
                            <span className="text-gray-500">{vehicle.brand}</span>
                          </div>
                        ))
                      }
                      {filteredClassificationVehicles.length > 3 && (
                        <div className="text-xs text-gray-500 text-center">
                          +{filteredClassificationVehicles.length - 3} mais
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </TabsContent>
      </Tabs>

      {filteredVehicles.length === 0 && (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Nenhum veículo encontrado
          </h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== "all" || typeFilter !== "all"
              ? "Tente ajustar os filtros de busca"
              : "Cadastre o primeiro veículo da frota"}
          </p>
          {!searchTerm && statusFilter === "all" && typeFilter === "all" && (
            <Button onClick={() => setShowForm(true)}>
              <Plus className="w-4 h-4 mr-2" />
              Cadastrar Primeiro Veículo
            </Button>
          )}
        </div>
      )}
    </div>
  );
}