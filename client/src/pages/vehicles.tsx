import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Plus, 
  Search, 
  Download, 
  AlertTriangle,
  Truck,
  FileText,
  Calendar,
  Settings,
  Eye,
  Printer,
  Wrench
} from "lucide-react";
import { type Vehicle } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

export default function Vehicles() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedFilter, setSelectedFilter] = useState("all");
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const { data: vehicles = [], isLoading } = useQuery<Vehicle[]>({
    queryKey: ["/api/vehicles"],
  });

  // Função para gerar PDF do veículo
  const generateVehiclePDF = async (vehicle: Vehicle) => {
    try {
      const response = await fetch(`/api/vehicles/${vehicle.id}/pdf`, {
        method: 'GET',
        headers: {
          'Accept': 'application/pdf',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ficha-veiculo-${vehicle.plate.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      } else {
        console.error('Erro ao gerar PDF');
        toast({
          title: "Erro",
          description: "Erro ao gerar PDF do veículo",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      toast({
        title: "Erro",
        description: "Erro ao gerar PDF do veículo",
        variant: "destructive",
      });
    }
  };

  // Função para exportar dados para XLSX
  const exportVehiclesToXLSX = async () => {
    try {
      const response = await fetch('/api/vehicles/export', {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        },
      });
      
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-veiculos-${new Date().toISOString().split('T')[0]}.xlsx`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
        
        toast({
          title: "Exportação concluída",
          description: "Relatório de veículos exportado com sucesso",
        });
      }
    } catch (error) {
      console.error('Erro ao exportar:', error);
      toast({
        title: "Erro",
        description: "Erro ao exportar dados dos veículos",
        variant: "destructive",
      });
    }
  };

  // Filtros
  const filteredVehicles = vehicles.filter((vehicle) => {
    const matchesSearch = vehicle.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.plate.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.brand?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         vehicle.model?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (selectedFilter === "all") return matchesSearch;
    if (selectedFilter === "active") return matchesSearch && vehicle.status === "ativo";
    if (selectedFilter === "maintenance") return matchesSearch && vehicle.status === "manutenção";
    if (selectedFilter === "inactive") return matchesSearch && vehicle.status === "inativo";
    
    return matchesSearch;
  });

  // Estatísticas
  const activeVehicles = vehicles.filter(v => v.status === "ativo").length;
  const maintenanceVehicles = vehicles.filter(v => v.status === "manutenção").length;
  const inactiveVehicles = vehicles.filter(v => v.status === "inativo").length;

  // Estatísticas por classificação
  const classificationStats = vehicles.reduce((acc, vehicle) => {
    const classification = vehicle.classification || "Sem Classificação";
    acc[classification] = (acc[classification] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Helper functions
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
      case "manutenção":
        return <Badge className="bg-yellow-100 text-yellow-800">Manutenção</Badge>;
      case "inativo":
        return <Badge className="bg-gray-100 text-gray-800">Inativo</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getClassificationColor = (classification: string) => {
    switch (classification?.toLowerCase()) {
      case "leve":
        return "text-green-600";
      case "médio":
      case "medio":
        return "text-yellow-600";
      case "pesado":
        return "text-red-600";
      default:
        return "text-blue-600";
    }
  };

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="h-8 bg-gray-200 rounded animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map(i => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-gray-200 rounded animate-pulse mb-2" />
                <div className="h-8 bg-gray-200 rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Gestão de Veículos</h1>
          <p className="text-gray-600">Cadastro e gerenciamento completo da frota</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={exportVehiclesToXLSX} variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Exportar XLSX
          </Button>
          <Link href="/vehicles/new">
            <Button className="gap-2" style={{ backgroundColor: '#0C29AB', color: 'white' }}>
              <Plus className="h-4 w-4" />
              Novo Veículo
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-green-600" />
              <span className="text-sm font-medium text-gray-600">Veículos Ativos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{activeVehicles}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Wrench className="h-5 w-5 text-yellow-600" />
              <span className="text-sm font-medium text-gray-600">Em Manutenção</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{maintenanceVehicles}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <Truck className="h-5 w-5 text-gray-600" />
              <span className="text-sm font-medium text-gray-600">Veículos Inativos</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{inactiveVehicles}</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="text-sm font-medium text-gray-600">Classificações</span>
            </div>
            <p className="text-2xl font-bold text-gray-900 mt-1">{Object.keys(classificationStats).length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <Input
                  placeholder="Buscar por nome, placa, marca ou modelo..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button
                variant={selectedFilter === "all" ? "default" : "outline"}
                onClick={() => setSelectedFilter("all")}
                size="sm"
              >
                Todos ({vehicles.length})
              </Button>
              <Button
                variant={selectedFilter === "active" ? "default" : "outline"}
                onClick={() => setSelectedFilter("active")}
                size="sm"
              >
                Ativos ({activeVehicles})
              </Button>
              <Button
                variant={selectedFilter === "maintenance" ? "default" : "outline"}
                onClick={() => setSelectedFilter("maintenance")}
                size="sm"
              >
                Manutenção ({maintenanceVehicles})
              </Button>
              <Button
                variant={selectedFilter === "inactive" ? "default" : "outline"}
                onClick={() => setSelectedFilter("inactive")}
                size="sm"
              >
                Inativos ({inactiveVehicles})
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="grid" className="space-y-6">
        <TabsList>
          <TabsTrigger value="grid">Visualização em Grade</TabsTrigger>
          <TabsTrigger value="table">Visualização em Lista</TabsTrigger>
          <TabsTrigger value="classification">Por Classificação</TabsTrigger>
        </TabsList>

        <TabsContent value="grid" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredVehicles.map((vehicle) => (
              <Card key={vehicle.id} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-felka-blue/10 rounded-full flex items-center justify-center">
                        <Truck className="h-6 w-6 text-felka-blue" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">{vehicle.name}</h3>
                        <p className="text-sm text-gray-600 font-mono">{vehicle.plate}</p>
                      </div>
                    </div>
                    {getStatusBadge(vehicle.status)}
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Marca:</span>
                      <span className="font-medium">{vehicle.brand}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Modelo:</span>
                      <span className="font-medium">{vehicle.model}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Ano:</span>
                      <span className="font-medium">{vehicle.modelYear}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Classificação:</span>
                      <span className={`font-medium ${getClassificationColor(vehicle.classification)}`}>
                        {vehicle.classification || 'N/A'}
                      </span>
                    </div>
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Link href={`/vehicles/${vehicle.id}`} className="flex-1">
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        Ver Detalhes
                      </Button>
                    </Link>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateVehiclePDF(vehicle)}
                      title="Imprimir Ficha"
                    >
                      <Printer className="w-4 h-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

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
                            <div className="w-10 h-10 bg-felka-blue/10 rounded-full flex items-center justify-center mr-3">
                              <Truck className="h-5 w-5 text-felka-blue" />
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
                          <span className={`text-sm font-medium ${getClassificationColor(vehicle.classification)}`}>
                            {vehicle.classification || 'N/A'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(vehicle.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex space-x-2">
                            <Link href={`/vehicles/${vehicle.id}`}>
                              <Button 
                                variant="outline" 
                                size="sm"
                                title="Ver Detalhes"
                              >
                                <Eye className="w-4 h-4" />
                              </Button>
                            </Link>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => generateVehiclePDF(vehicle)}
                              title="Imprimir Ficha"
                            >
                              <Printer className="w-4 h-4" />
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

        <TabsContent value="classification" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Object.entries(classificationStats).map(([classification, count]) => (
              <Card key={classification}>
                <CardHeader>
                  <CardTitle className={`text-lg ${getClassificationColor(classification)}`}>
                    {classification}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-felka-blue mb-2">{count}</div>
                  <p className="text-sm text-gray-600">veículos cadastrados</p>
                  
                  {/* Lista dos veículos desta classificação */}
                  <div className="mt-4 space-y-2">
                    {vehicles
                      .filter(v => (v.classification || "Sem Classificação") === classification)
                      .slice(0, 3)
                      .map(vehicle => (
                        <div key={vehicle.id} className="flex items-center justify-between text-sm">
                          <span className="text-gray-700">{vehicle.plate}</span>
                          <span className="text-gray-500">{vehicle.brand}</span>
                        </div>
                      ))
                    }
                    {vehicles.filter(v => (v.classification || "Sem Classificação") === classification).length > 3 && (
                      <div className="text-xs text-gray-500">
                        +{vehicles.filter(v => (v.classification || "Sem Classificação") === classification).length - 3} mais
                      </div>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {filteredVehicles.length === 0 && searchTerm && (
        <Card>
          <CardContent className="p-12 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhum veículo encontrado</h3>
            <p className="text-gray-600 mb-4">
              Não foi possível encontrar veículos com os filtros aplicados.
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setSelectedFilter("all");
              }}
            >
              Limpar Filtros
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
