import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Calendar, 
  MapPin, 
  DollarSign, 
  FileText, 
  Settings, 
  AlertTriangle,
  CheckCircle,
  Clock,
  Truck,
  Edit,
  Download,
  Camera
} from "lucide-react";
import { type Vehicle } from "@shared/schema";
import { useLocation } from "wouter";
import { useToast } from "@/hooks/use-toast";

interface VehicleDetailsProps {
  vehicle: Vehicle;
  onBack: () => void;
}

export default function VehicleDetails({ vehicle, onBack }: VehicleDetailsProps) {
  const [activeTab, setActiveTab] = useState("overview");
  const [, setLocation] = useLocation();
  const { toast } = useToast();

  const calculatePaymentProgress = () => {
    if (!vehicle.purchaseDate || !vehicle.installmentCount || !vehicle.installmentValue) {
      return { progress: 0, paidAmount: 0, remainingAmount: 0, paidInstallments: 0 };
    }

    const purchaseDate = new Date(vehicle.purchaseDate);
    const currentDate = new Date();
    const monthsPassed = Math.floor((currentDate.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const paidInstallments = Math.min(monthsPassed, vehicle.installmentCount);
    const progress = Math.round((paidInstallments / vehicle.installmentCount) * 100);
    const paidAmount = paidInstallments * parseFloat(vehicle.installmentValue || "0");
    const totalAmount = vehicle.installmentCount * parseFloat(vehicle.installmentValue || "0");
    const remainingAmount = totalAmount - paidAmount;

    return { progress, paidAmount, remainingAmount, paidInstallments };
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "active":
        return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Ativo</Badge>;
      case "maintenance":
        return <Badge className="bg-yellow-100 text-yellow-800"><AlertTriangle className="w-3 h-3 mr-1" />Manutenção</Badge>;
      case "inactive":
        return <Badge className="bg-gray-100 text-gray-800"><Clock className="w-3 h-3 mr-1" />Inativo</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const formatCurrency = (value: string | null | undefined) => {
    if (!value) return "N/A";
    return `R$ ${parseFloat(value).toLocaleString('pt-BR')}`;
  };

  const formatDate = (date: Date | string | null | undefined) => {
    if (!date) return "N/A";
    return new Date(date).toLocaleDateString('pt-BR');
  };

  const calculateDepreciation = () => {
    const purchaseValue = parseFloat(vehicle.purchaseValue || "0");
    const fipeValue = parseFloat(vehicle.fipeValue || "0");
    
    if (purchaseValue > 0 && fipeValue > 0) {
      const depreciation = ((purchaseValue - fipeValue) / purchaseValue) * 100;
      return depreciation.toFixed(1);
    }
    return "N/A";
  };

  const paymentInfo = calculatePaymentProgress();

  const generatePDF = async () => {
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

  const handleEdit = () => {
    setLocation(`/vehicles/edit/${vehicle.id}`);
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={onBack}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{vehicle.name}</h1>
            <p className="text-gray-600">{vehicle.brand} {vehicle.model} - {vehicle.plate}</p>
          </div>
          {getStatusBadge(vehicle.status)}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generatePDF}>
            <Download className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          <Button onClick={handleEdit}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="financial">Financeiro</TabsTrigger>
          <TabsTrigger value="documents">Documentação</TabsTrigger>
          <TabsTrigger value="technical">Técnico</TabsTrigger>
        </TabsList>

        {/* Aba Visão Geral */}
        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <Card className="lg:col-span-2">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="w-5 h-5" />
                  Informações do Veículo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Placa</p>
                    <p className="font-semibold">{vehicle.plate}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Marca</p>
                    <p className="font-semibold">{vehicle.brand}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Modelo</p>
                    <p className="font-semibold">{vehicle.model}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ano Modelo</p>
                    <p className="font-semibold">{vehicle.modelYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Ano Fabricação</p>
                    <p className="font-semibold">{vehicle.manufactureYear}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">RENAVAM</p>
                    <p className="font-semibold">{vehicle.renavam || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Chassi</p>
                    <p className="font-semibold">{vehicle.chassis || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo</p>
                    <p className="font-semibold">{vehicle.vehicleType}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Classificação</p>
                    <p className="font-semibold">{vehicle.classification}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Localização e Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="w-5 h-5" />
                  Status e Localização
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-gray-600">Status Atual</p>
                  <div className="mt-1">
                    {getStatusBadge(vehicle.status)}
                  </div>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Localização</p>
                  <p className="font-semibold">{vehicle.currentLocation || "N/A"}</p>
                </div>
                {vehicle.inactiveReason && (
                  <div>
                    <p className="text-sm text-gray-600">Motivo Inativação</p>
                    <p className="font-semibold text-red-600">{vehicle.inactiveReason}</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Manutenção */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Configurações de Manutenção
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Intervalo Revisão Preventiva</p>
                  <p className="font-semibold">{vehicle.preventiveMaintenanceKm?.toLocaleString('pt-BR')} km</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Intervalo Rodízio de Pneus</p>
                  <p className="font-semibold">{vehicle.tireRotationKm?.toLocaleString('pt-BR')} km</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Financeiro */}
        <TabsContent value="financial" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Informações de Compra */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Dados da Compra
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="text-sm text-gray-600">Data da Compra</p>
                    <p className="font-semibold">{formatDate(vehicle.purchaseDate)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor da Compra</p>
                    <p className="font-semibold">{formatCurrency(vehicle.purchaseValue)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Banco</p>
                    <p className="font-semibold">{vehicle.financialInstitution || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Tipo Contrato</p>
                    <p className="font-semibold">{vehicle.contractType || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Nº Contrato</p>
                    <p className="font-semibold">{vehicle.contractNumber || "N/A"}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Valor Parcela</p>
                    <p className="font-semibold">{formatCurrency(vehicle.installmentValue)}</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Progresso de Pagamento */}
            <Card>
              <CardHeader>
                <CardTitle>Progresso do Financiamento</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Progresso do Pagamento</span>
                    <span className="font-semibold">{paymentInfo.progress}%</span>
                  </div>
                  <Progress value={paymentInfo.progress} className="h-3" />
                </div>
                
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Parcelas Pagas</p>
                    <p className="font-semibold">
                      {paymentInfo.paidInstallments} / {vehicle.installmentCount || 0}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor Pago</p>
                    <p className="font-semibold">{formatCurrency(paymentInfo.paidAmount.toString())}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Valor Restante</p>
                    <p className="font-semibold">{formatCurrency(paymentInfo.remainingAmount.toString())}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Juros Pagos</p>
                    <p className="font-semibold text-red-600">
                      {vehicle.purchaseValue && vehicle.installmentValue && vehicle.installmentCount
                        ? formatCurrency(((parseFloat(vehicle.installmentValue) * vehicle.installmentCount) - parseFloat(vehicle.purchaseValue)).toString())
                        : "N/A"}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Valor FIPE */}
          <Card>
            <CardHeader>
              <CardTitle>Avaliação FIPE</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Código FIPE</p>
                  <p className="font-semibold">{vehicle.fipeCode || "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Valor FIPE Atual</p>
                  <p className="font-semibold text-blue-600">{formatCurrency(vehicle.fipeValue)}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Depreciação</p>
                  <p className="font-semibold text-red-600">{calculateDepreciation()}%</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Última Atualização</p>
                  <p className="font-semibold">{formatDate(vehicle.fipeLastUpdate)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Documentação */}
        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="w-5 h-5" />
                Documentos do Veículo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">CRLV</h4>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Vencimento: {formatDate(vehicle.crlvExpiry)}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Certificação Tacógrafo</h4>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Vencimento: {formatDate(vehicle.tachographExpiry)}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Registro ANTT</h4>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Vencimento: {formatDate(vehicle.anttExpiry)}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>

                  <div className="p-4 border rounded-lg">
                    <div className="flex justify-between items-start mb-2">
                      <h4 className="font-semibold">Apólice de Seguro</h4>
                      <Badge variant="outline">PDF</Badge>
                    </div>
                    <p className="text-sm text-gray-600">Vencimento: {formatDate(vehicle.insuranceExpiry)}</p>
                    <p className="text-sm text-gray-600">Valor: {formatCurrency(vehicle.insuranceValue)}</p>
                    <Button variant="outline" size="sm" className="mt-2">
                      <Download className="w-4 h-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Aba Técnico */}
        <TabsContent value="technical" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Especificações Técnicas</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div>
                  <p className="text-sm text-gray-600">Largura da Carroceria</p>
                  <p className="font-semibold">{vehicle.bodyWidth ? `${vehicle.bodyWidth}m` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Altura Chão-Assoalho</p>
                  <p className="font-semibold">{vehicle.floorHeight ? `${vehicle.floorHeight}m` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Comprimento</p>
                  <p className="font-semibold">{vehicle.bodyLength ? `${vehicle.bodyLength}m` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Capacidade de Carga</p>
                  <p className="font-semibold">{vehicle.loadCapacity ? `${parseFloat(vehicle.loadCapacity).toLocaleString('pt-BR')} kg` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Tanque de Combustível</p>
                  <p className="font-semibold">{vehicle.fuelTankCapacity ? `${vehicle.fuelTankCapacity}L` : "N/A"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-600">Consumo Médio</p>
                  <p className="font-semibold">{vehicle.fuelConsumption ? `${vehicle.fuelConsumption} km/L` : "N/A"}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Fotos do Veículo */}
          <Card>
            <CardHeader>
              <CardTitle>Fotos do Veículo</CardTitle>
            </CardHeader>
            <CardContent>
              {vehicle.photos && vehicle.photos.length > 0 ? (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                  {vehicle.photos.map((photo, index) => (
                    <div key={index} className="aspect-square bg-gray-100 rounded-lg flex items-center justify-center">
                      <img 
                        src={photo} 
                        alt={`Foto ${index + 1}`}
                        className="w-full h-full object-cover rounded-lg"
                      />
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Camera className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  <p>Nenhuma foto cadastrada</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}