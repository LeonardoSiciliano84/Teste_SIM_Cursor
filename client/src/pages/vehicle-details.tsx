import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { 
  ArrowLeft, 
  Calendar, 
  DollarSign, 
  Fuel, 
  Gauge, 
  Info, 
  MapPin, 
  FileText, 
  Printer,
  Edit,
  CheckCircle,
  AlertTriangle,
  Clock,
  Truck,
  Wrench
} from "lucide-react";
import { type Vehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

export function VehicleDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");
  const { toast } = useToast();

  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", id],
    enabled: !!id,
  });

  const handleEdit = () => {
    setLocation(`/vehicles/edit/${id}`);
  };

  const handleBack = () => {
    setLocation("/vehicles");
  };

  const generatePDF = async () => {
    try {
      const response = await fetch(`/api/vehicles/${id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ficha-veiculo-${vehicle?.plate.replace(/[^a-zA-Z0-9]/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ativo":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case "manutenção":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Manutenção</Badge>;
      case "inativo":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Inativo</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (value: string | number | null | undefined) => {
    if (!value) return "N/A";
    return `R$ ${parseFloat(value.toString()).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculatePaymentProgress = () => {
    if (!vehicle?.purchaseDate || !vehicle?.installmentCount || !vehicle?.installmentValue) {
      return { progress: 0, paidAmount: 0, remainingAmount: 0, paidInstallments: 0 };
    }

    const purchaseDate = new Date(vehicle.purchaseDate);
    const currentDate = new Date();
    const monthsPassed = Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const paidInstallments = Math.min(monthsPassed, vehicle.installmentCount);
    const progress = Math.round((paidInstallments / vehicle.installmentCount) * 100);
    const paidAmount = paidInstallments * parseFloat(vehicle.installmentValue?.toString() || "0");
    const totalAmount = vehicle.installmentCount * parseFloat(vehicle.installmentValue?.toString() || "0");
    const remainingAmount = totalAmount - paidAmount;

    return { progress, paidAmount, remainingAmount, paidInstallments };
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-felka-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do veículo...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <Truck className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">Veículo não encontrado</h3>
            <p className="text-gray-600 mb-4">O veículo solicitado não foi encontrado no sistema.</p>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="w-4 h-4 mr-2" />
              Voltar aos Veículos
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  const paymentInfo = calculatePaymentProgress();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Button 
            variant="ghost" 
            onClick={handleBack}
            className="p-2"
          >
            <ArrowLeft className="h-4 w-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{vehicle.name}</h1>
            <p className="text-gray-600">Detalhes completos do veículo</p>
          </div>
        </div>
        <div className="flex space-x-2">
          <Button onClick={generatePDF} variant="outline" size="sm">
            <Printer className="w-4 h-4 mr-2" />
            Imprimir Ficha
          </Button>
          <Button onClick={handleEdit} size="sm" style={{ backgroundColor: '#0C29AB', color: 'white' }}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      {/* Vehicle Header Card */}
      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-felka-blue/10 rounded-full flex items-center justify-center">
                <Truck className="h-8 w-8 text-felka-blue" />
              </div>
              <div>
                <h2 className="text-2xl font-bold text-gray-900">{vehicle.name}</h2>
                <p className="text-lg font-mono text-gray-600">{vehicle.plate}</p>
                <p className="text-gray-500">{vehicle.brand} {vehicle.model} - {vehicle.modelYear}</p>
              </div>
            </div>
            <div className="text-right">
              {getStatusBadge(vehicle.status)}
              <p className="text-sm text-gray-500 mt-2">ID: {vehicle.id}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="technical">Técnico</TabsTrigger>
          <TabsTrigger value="documents">Documentação</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Info className="h-4 w-4" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Marca:</span>
                  <span className="font-medium">{vehicle.brand}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Modelo:</span>
                  <span className="font-medium">{vehicle.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ano Fabricação:</span>
                  <span className="font-medium">{vehicle.manufactureYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Ano Modelo:</span>
                  <span className="font-medium">{vehicle.modelYear}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Classificação:</span>
                  <span className="font-medium">{vehicle.classification || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tipo:</span>
                  <span className="font-medium">{vehicle.vehicleType || 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <Gauge className="h-4 w-4" />
                  Especificações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Chassi:</span>
                  <span className="font-medium font-mono text-sm">{vehicle.chassis || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">RENAVAM:</span>
                  <span className="font-medium">{vehicle.renavam || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cap. de Carga:</span>
                  <span className="font-medium">{vehicle.loadCapacity ? `${vehicle.loadCapacity} kg` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Cap. Tanque:</span>
                  <span className="font-medium">{vehicle.fuelTankCapacity ? `${vehicle.fuelTankCapacity} L` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Consumo:</span>
                  <span className="font-medium">{vehicle.fuelConsumption ? `${vehicle.fuelConsumption} km/L` : 'N/A'}</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="h-4 w-4" />
                  Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Localização Atual:</span>
                  <span className="font-medium">{vehicle.currentLocation || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <div>{getStatusBadge(vehicle.status)}</div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="h-5 w-5" />
                  Informações Financeiras
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor de Compra:</span>
                  <span className="font-medium">{formatCurrency(vehicle.purchaseValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Data de Compra:</span>
                  <span className="font-medium">{formatDate(vehicle.purchaseDate)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor FIPE:</span>
                  <span className="font-medium">{formatCurrency(vehicle.fipeValue)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Valor do Seguro:</span>
                  <span className="font-medium">{formatCurrency(vehicle.insuranceValue)}</span>
                </div>
              </CardContent>
            </Card>

            {vehicle.installmentCount && vehicle.installmentValue && (
              <Card>
                <CardHeader>
                  <CardTitle>Progresso de Pagamento</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Parcelas Pagas</span>
                      <span>{paymentInfo.paidInstallments} de {vehicle.installmentCount}</span>
                    </div>
                    <Progress value={paymentInfo.progress} className="h-2" />
                    <div className="text-center text-sm text-gray-600">
                      {paymentInfo.progress}% concluído
                    </div>
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor da Parcela:</span>
                      <span className="font-medium">{formatCurrency(vehicle.installmentValue)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Pago:</span>
                      <span className="font-medium">{formatCurrency(paymentInfo.paidAmount)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Valor Restante:</span>
                      <span className="font-medium">{formatCurrency(paymentInfo.remainingAmount)}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>

        <TabsContent value="technical" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Wrench className="h-5 w-5" />
                  Manutenção Preventiva
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Intervalo de KM:</span>
                  <span className="font-medium">{vehicle.preventiveMaintenanceKm ? `${vehicle.preventiveMaintenanceKm.toLocaleString()} km` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Última Revisão:</span>
                  <span className="font-medium">N/A</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Próxima Revisão:</span>
                  <span className="font-medium">N/A</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Fuel className="h-5 w-5" />
                  Consumo e Performance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Consumo Médio:</span>
                  <span className="font-medium">{vehicle.fuelConsumption ? `${vehicle.fuelConsumption} km/L` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Capacidade do Tanque:</span>
                  <span className="font-medium">{vehicle.fuelTankCapacity ? `${vehicle.fuelTankCapacity} L` : 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Autonomia Estimada:</span>
                  <span className="font-medium">
                    {vehicle.fuelConsumption && vehicle.fuelTankCapacity 
                      ? `${(vehicle.fuelConsumption * vehicle.fuelTankCapacity).toFixed(0)} km` 
                      : 'N/A'}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Documentação do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Documentos em Desenvolvimento</h3>
                <p className="text-gray-600">
                  A gestão de documentos do veículo será implementada em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}