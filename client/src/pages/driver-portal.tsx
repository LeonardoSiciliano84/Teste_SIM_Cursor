import { useState, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Search, User, Mail, Shield, Car, FileText, Download, AlertTriangle, CheckSquare, Wrench, Phone, Camera, MapPin, Clock } from "lucide-react";
import { authManager } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";

interface DriverInfo {
  id: string;
  fullName: string;
  email: string;
  employeeNumber: string;
  profilePhoto?: string;
  position: string;
  department: string;
  driverLicense: string;
  driverLicenseCategory: string;
  driverLicenseExpiry: string;
  phone: string;
}

export default function DriverPortal() {
  const [selectedVehicle, setSelectedVehicle] = useState<string>("");
  const [vehicleSearchTerm, setVehicleSearchTerm] = useState("");
  const [implementSearchTerm, setImplementSearchTerm] = useState("");
  const [selectedImplement, setSelectedImplement] = useState<string>("");
  const [showDocuments, setShowDocuments] = useState(false);
  const [selectedDocumentVehicle, setSelectedDocumentVehicle] = useState<any>(null);
  const [showPreChecklistWarning, setShowPreChecklistWarning] = useState(false);
  const [showChecklist, setShowChecklist] = useState(false);
  const [showMaintenanceRequest, setShowMaintenanceRequest] = useState(false);
  const [showMaintenanceCommunication, setShowMaintenanceCommunication] = useState(false);
  const [showTravelMaintenance, setShowTravelMaintenance] = useState(false);
  const { toast } = useToast();
  
  // Obter informações do motorista logado
  const { data: driverInfo, isLoading: driverLoading } = useQuery<DriverInfo>({
    queryKey: ["/api/driver/profile"],
    retry: false,
  });

  // Obter veículos disponíveis
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
    select: (data: any[]) => data.filter(v => v.status === 'active')
  });

  // Filtrar veículos por busca
  const filteredVehicles = vehicles.filter((vehicle: any) => 
    vehicle.plate.toLowerCase().includes(vehicleSearchTerm.toLowerCase()) ||
    vehicle.name.toLowerCase().includes(vehicleSearchTerm.toLowerCase())
  );

  // Filtrar implementos por busca
  const filteredImplements = vehicles.filter((vehicle: any) => 
    vehicle.vehicleType === 'Semirreboque' &&
    (vehicle.plate.toLowerCase().includes(implementSearchTerm.toLowerCase()) ||
     vehicle.name.toLowerCase().includes(implementSearchTerm.toLowerCase()))
  );

  // Obter dados do veículo selecionado
  const selectedVehicleData = vehicles.find((v: any) => v.id === selectedVehicle);
  const selectedImplementData = vehicles.find((v: any) => v.id === selectedImplement);

  // Função para visualizar documentos
  const handleViewDocuments = (vehicleId: string) => {
    const vehicle = vehicles.find((v: any) => v.id === vehicleId);
    setSelectedDocumentVehicle(vehicle);
    setShowDocuments(true);
  };

  // Função para download de documento
  const handleDownloadDocument = (docType: string) => {
    toast({
      title: "Download iniciado",
      description: `Baixando documento: ${docType}`,
    });
    // Em produção, aqui faria o download real do documento
  };

  if (driverLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!driverInfo) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-red-600">Acesso Negado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-center text-gray-600">
              Este portal é exclusivo para motoristas autorizados.
            </p>
            <Button 
              className="w-full mt-4" 
              onClick={() => authManager.logout()}
            >
              Fazer Login Novamente
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-blue-100 p-4">
      <div className="max-w-md mx-auto space-y-6">
        
        {/* Header com informações do motorista */}
        <Card className="border-blue-200 shadow-lg">
          <CardHeader className="bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-t-lg">
            <div className="flex items-center space-x-4">
              <Avatar className="h-16 w-16 border-2 border-white">
                <AvatarImage src={driverInfo.profilePhoto} />
                <AvatarFallback className="bg-blue-500 text-white text-lg">
                  {driverInfo.fullName.split(' ').map(n => n[0]).join('').slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1">
                <h1 className="text-xl font-bold">{driverInfo.fullName}</h1>
                <div className="flex items-center space-x-1 text-blue-100">
                  <Mail className="h-4 w-4" />
                  <span className="text-sm">{driverInfo.email}</span>
                </div>
                <div className="flex items-center space-x-1 text-blue-100 mt-1">
                  <Shield className="h-4 w-4" />
                  <span className="text-sm">Mat: {driverInfo.employeeNumber}</span>
                </div>
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-4">
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <Label className="text-gray-600">CNH</Label>
                <p className="font-semibold">{driverInfo.driverLicense}</p>
              </div>
              <div>
                <Label className="text-gray-600">Categoria</Label>
                <p className="font-semibold">{driverInfo.driverLicenseCategory}</p>
              </div>
              <div className="col-span-2">
                <Label className="text-gray-600">Validade CNH</Label>
                <p className="font-semibold text-blue-600">
                  {new Date(driverInfo.driverLicenseExpiry).toLocaleDateString('pt-BR')}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Seleção de Veículo de Tração */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Car className="h-5 w-5 text-blue-600" />
              <span>Selecionar Veículo de Tração</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="vehicle-search">Buscar por Placa ou Nome</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="vehicle-search"
                  placeholder="Digite a placa ou nome do veículo..."
                  value={vehicleSearchTerm}
                  onChange={(e) => setVehicleSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {vehicleSearchTerm && (
              <div className="max-h-40 overflow-y-auto space-y-2">
                {filteredVehicles.length > 0 ? (
                  filteredVehicles.map((vehicle: any) => (
                    <button
                      key={vehicle.id}
                      onClick={() => {
                        setSelectedVehicle(vehicle.id);
                        setVehicleSearchTerm("");
                      }}
                      className="w-full text-left p-3 border rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors"
                    >
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="font-semibold text-gray-800">{vehicle.plate}</p>
                          <p className="text-sm text-gray-600">{vehicle.name}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-gray-500">{vehicle.brand}</p>
                          <p className="text-sm text-gray-500">{vehicle.model}</p>
                        </div>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-4">
                    Nenhum veículo encontrado
                  </p>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dados do veículo selecionado */}
        {selectedVehicleData && (
          <Card className="border-green-200 shadow-lg">
            <CardHeader className="bg-green-50">
              <CardTitle className="text-green-800">
                Veículo Selecionado: {selectedVehicleData.plate}
              </CardTitle>
            </CardHeader>
            <CardContent className="p-4 space-y-3">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <Label className="text-gray-600">Marca/Modelo</Label>
                  <p className="font-semibold">{selectedVehicleData.brand} {selectedVehicleData.model}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Ano</Label>
                  <p className="font-semibold">{selectedVehicleData.modelYear}</p>
                </div>
                <div>
                  <Label className="text-gray-600">Capacidade Carga</Label>
                  <p className="font-semibold">{selectedVehicleData.loadCapacity || 'N/A'} kg</p>
                </div>
                <div>
                  <Label className="text-gray-600">Tanque</Label>
                  <p className="font-semibold">{selectedVehicleData.fuelTankCapacity || 'N/A'} L</p>
                </div>
                <div>
                  <Label className="text-gray-600">Consumo Médio</Label>
                  <p className="font-semibold">{selectedVehicleData.fuelConsumption || 'N/A'} km/L</p>
                </div>
                <div>
                  <Label className="text-gray-600">Localização</Label>
                  <p className="font-semibold">{selectedVehicleData.currentLocation || 'N/A'}</p>
                </div>
              </div>

              {/* Informações de manutenção */}
              <div className="pt-3 border-t">
                <h4 className="font-semibold text-gray-800 mb-2">Próximas Manutenções</h4>
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Revisão Preventiva:</span>
                    <span className="text-sm font-semibold text-orange-600">
                      {selectedVehicleData.preventiveMaintenanceKm || 10000} km
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-sm text-gray-600">Rodízio de Pneus:</span>
                    <span className="text-sm font-semibold text-blue-600">
                      {selectedVehicleData.tireRotationKm || 10000} km
                    </span>
                  </div>
                </div>
              </div>

              {/* Botão para documentos */}
              <Button 
                className="w-full mt-4 bg-blue-600 hover:bg-blue-700"
                onClick={() => handleViewDocuments(selectedVehicleData.id)}
              >
                Ver Documentos do Veículo
              </Button>
            </CardContent>
          </Card>
        )}

        {/* Seleção de Implemento (opcional) */}
        <Card className="border-gray-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2 text-gray-800">
              <Car className="h-5 w-5 text-orange-600" />
              <span>Implemento (Opcional)</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label htmlFor="implement-search">Buscar Implemento</Label>
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                <Input
                  id="implement-search"
                  placeholder="Digite a placa do implemento..."
                  value={implementSearchTerm}
                  onChange={(e) => setImplementSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            {implementSearchTerm && (
              <div className="max-h-32 overflow-y-auto space-y-2">
                {filteredImplements.length > 0 ? (
                  filteredImplements.map((implement: any) => (
                    <button
                      key={implement.id}
                      onClick={() => {
                        setSelectedImplement(implement.id);
                        setImplementSearchTerm("");
                      }}
                      className="w-full text-left p-2 border rounded hover:bg-orange-50 hover:border-orange-300 transition-colors"
                    >
                      <div className="flex justify-between">
                        <span className="font-semibold">{implement.plate}</span>
                        <span className="text-sm text-gray-600">{implement.name}</span>
                      </div>
                    </button>
                  ))
                ) : (
                  <p className="text-center text-gray-500 py-2">
                    Nenhum implemento encontrado
                  </p>
                )}
              </div>
            )}

            {selectedImplementData && (
              <div className="bg-orange-50 p-3 rounded-lg">
                <p className="font-semibold text-orange-800">
                  Implemento: {selectedImplementData.plate}
                </p>
                <p className="text-sm text-orange-600">
                  {selectedImplementData.name}
                </p>
                {/* Botão para documentos do implemento */}
                <Button 
                  className="w-full mt-3 bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleViewDocuments(selectedImplementData.id)}
                >
                  Ver Documentos do Implemento
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Botões de Acesso Rápido */}
        {selectedVehicle && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800 text-center">
              Acesso Rápido
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Botão 1: Checklist */}
              <Button 
                className="h-20 flex flex-col items-center justify-center bg-green-600 hover:bg-green-700 text-white"
                onClick={() => setShowPreChecklistWarning(true)}
              >
                <CheckSquare className="h-6 w-6 mb-1" />
                <span className="text-xs text-center">Checklist</span>
              </Button>

              {/* Botão 2: Solicitar Manutenção */}
              <Button 
                className="h-20 flex flex-col items-center justify-center bg-blue-600 hover:bg-blue-700 text-white"
                onClick={() => setShowMaintenanceRequest(true)}
              >
                <Wrench className="h-6 w-6 mb-1" />
                <span className="text-xs text-center">Solicitar Manutenção</span>
              </Button>

              {/* Botão 3: Comunicar Manutenção */}
              <Button 
                className="h-20 flex flex-col items-center justify-center bg-orange-600 hover:bg-orange-700 text-white"
                onClick={() => setShowMaintenanceCommunication(true)}
              >
                <Phone className="h-6 w-6 mb-1" />
                <span className="text-xs text-center">Comunicar Manutenção</span>
              </Button>

              {/* Botão 4: Registrar Manutenção em Viagem */}
              <Button 
                className="h-20 flex flex-col items-center justify-center bg-purple-600 hover:bg-purple-700 text-white"
                onClick={() => setShowTravelMaintenance(true)}
              >
                <Wrench className="h-6 w-6 mb-1" />
                <span className="text-xs text-center">Manutenção Viagem</span>
              </Button>
            </div>

            {/* Botão para continuar para próxima etapa */}
            <Button className="w-full bg-gray-600 hover:bg-gray-700 text-lg py-3 mt-4">
              Continuar para Próxima Etapa
            </Button>
          </div>
        )}

        {/* Modal de Documentos */}
        <Dialog open={showDocuments} onOpenChange={setShowDocuments}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <FileText className="h-5 w-5 text-blue-600" />
                <span>Documentos do Veículo</span>
              </DialogTitle>
              <DialogDescription>
                Acesse e baixe os documentos do veículo selecionado
              </DialogDescription>
            </DialogHeader>
            
            {selectedDocumentVehicle && (
              <div className="space-y-4">
                <div className="bg-blue-50 p-3 rounded-lg">
                  <p className="font-semibold text-blue-800">
                    {selectedDocumentVehicle.plate} - {selectedDocumentVehicle.name}
                  </p>
                </div>

                <div className="space-y-3">
                  {[
                    { name: "CRLV", type: "crlv", description: "Certificado de Registro e Licenciamento" },
                    { name: "ANTT", type: "antt", description: "Registro na ANTT" },
                    { name: "Seguro", type: "seguro", description: "Apólice de Seguro" },
                    { name: "Tacógrafo", type: "tacogorafo", description: "Certificado do Tacógrafo" }
                  ].map((doc) => (
                    <div 
                      key={doc.type}
                      className="flex items-center justify-between p-3 border rounded-lg hover:bg-gray-50"
                    >
                      <div className="flex-1">
                        <p className="font-medium text-gray-800">{doc.name}</p>
                        <p className="text-sm text-gray-600">{doc.description}</p>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleDownloadDocument(doc.name)}
                        className="ml-3"
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Baixar
                      </Button>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={() => setShowDocuments(false)}
                  >
                    Fechar
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>

        {/* Modal de Aviso Pré-Checklist */}
        <Dialog open={showPreChecklistWarning} onOpenChange={setShowPreChecklistWarning}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-yellow-600">
                <AlertTriangle className="h-5 w-5" />
                <span>Aviso de Segurança</span>
              </DialogTitle>
              <DialogDescription>
                Leia atentamente antes de prosseguir
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
                <p className="text-sm font-medium text-yellow-800">
                  ⚠️ ATENÇÃO: Se detectar vazamentos ou falhas, NÃO inicie a operação. 
                  Comunique imediatamente a manutenção.
                </p>
              </div>
              
              <div className="bg-gray-50 p-4 rounded-lg">
                <p className="text-sm text-gray-700">
                  Declaro que sou responsável pelo preenchimento correto de todas as informações do checklist e pela verificação completa do veículo.
                </p>
              </div>

              <div className="flex space-x-3">
                <Button 
                  variant="outline" 
                  className="flex-1"
                  onClick={() => setShowPreChecklistWarning(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  className="flex-1 bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    setShowPreChecklistWarning(false);
                    setShowChecklist(true);
                  }}
                >
                  Continuar
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Checklist de Saída */}
        <Dialog open={showChecklist} onOpenChange={setShowChecklist}>
          <DialogContent className="max-w-md max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <CheckSquare className="h-5 w-5 text-green-600" />
                <span>Checklist de Saída</span>
              </DialogTitle>
              <DialogDescription>
                Preencha todos os itens obrigatórios
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Data e hora */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data</Label>
                  <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
                </div>
                <div>
                  <Label>Hora</Label>
                  <Input type="time" defaultValue={new Date().toTimeString().slice(0,5)} />
                </div>
              </div>

              {/* Base de saída */}
              <div>
                <Label>Base de Saída</Label>
                <Input placeholder="Ex: Terminal São Paulo" />
              </div>

              {/* Placas */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Placa Tração</Label>
                  <Input value={selectedVehicleData?.plate || ""} readOnly />
                </div>
                <div>
                  <Label>Placa Implemento</Label>
                  <Input value={selectedImplementData?.plate || ""} readOnly />
                </div>
              </div>

              {/* KM atual */}
              <div>
                <Label>KM Atual</Label>
                <Input type="number" placeholder="Ex: 125000" />
              </div>

              {/* Lista de verificação */}
              <div className="space-y-3">
                <Label className="text-base font-medium">Lista de Verificação</Label>
                {[
                  "Documentos válidos",
                  "Cartão de abastecimento",
                  "Níveis de óleo e água",
                  "Elétrica, faróis, buzina, retrovisores",
                  "Pneus e calibragem",
                  "Equipamentos obrigatórios (extintor, triângulo)",
                  "Cintas, catracas, lonas"
                ].map((item, index) => (
                  <div key={index} className="flex items-center space-x-3">
                    <input type="checkbox" className="rounded" />
                    <span className="text-sm">{item}</span>
                  </div>
                ))}
              </div>

              {/* Observações */}
              <div>
                <Label>Observações</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={3}
                  placeholder="Observações adicionais..."
                />
              </div>

              {/* Upload de foto */}
              <div>
                <Label>Foto Obrigatória *</Label>
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                  <Camera className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                  <p className="text-sm text-gray-600">Toque para adicionar foto</p>
                </div>
              </div>

              <Button className="w-full bg-green-600 hover:bg-green-700">
                Enviar Checklist
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Solicitação de Manutenção */}
        <Dialog open={showMaintenanceRequest} onOpenChange={setShowMaintenanceRequest}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-blue-600" />
                <span>Solicitação de Manutenção</span>
              </DialogTitle>
              <DialogDescription>
                Descreva o problema encontrado
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Veículo afetado */}
              <div>
                <Label>Veículo Afetado</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Tração</option>
                  <option>Implemento</option>
                  <option>Ambos</option>
                </select>
              </div>

              {/* Descrição do problema */}
              <div>
                <Label>Descrição do Problema *</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={4}
                  placeholder="Descreva detalhadamente o problema encontrado..."
                  required
                />
              </div>

              {/* Data e motorista (preenchidos automaticamente) */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label>Data</Label>
                  <Input value={new Date().toLocaleDateString('pt-BR')} readOnly />
                </div>
                <div>
                  <Label>Motorista</Label>
                  <Input value={driverInfo?.fullName || ""} readOnly />
                </div>
              </div>

              <Button className="w-full bg-blue-600 hover:bg-blue-700">
                Enviar Solicitação
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Comunicação de Manutenção */}
        <Dialog open={showMaintenanceCommunication} onOpenChange={setShowMaintenanceCommunication}>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Phone className="h-5 w-5 text-orange-600" />
                <span>Comunicação de Manutenção</span>
              </DialogTitle>
              <DialogDescription>
                Comunique problemas urgentes
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              <div className="bg-orange-50 p-4 rounded-lg border border-orange-200">
                <p className="text-sm font-medium text-orange-800">
                  Para problemas que impedem a continuidade da viagem
                </p>
              </div>

              {/* Placa do veículo */}
              <div>
                <Label>Placa do Veículo</Label>
                <Input value={selectedVehicleData?.plate || ""} readOnly />
              </div>

              {/* Localização atual */}
              <div>
                <Label>Localização Atual</Label>
                <div className="flex space-x-2">
                  <Input placeholder="Endereço ou coordenadas" className="flex-1" />
                  <Button variant="outline" size="sm">
                    <MapPin className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Descrição do problema */}
              <div>
                <Label>Descrição do Problema *</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={3}
                  placeholder="Descreva o problema..."
                  required
                />
              </div>

              <div className="flex space-x-3">
                <Button className="flex-1 bg-orange-600 hover:bg-orange-700">
                  Enviar Comunicação
                </Button>
                <Button variant="outline" className="flex-1">
                  WhatsApp Emergência
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Registro de Manutenção em Viagem */}
        <Dialog open={showTravelMaintenance} onOpenChange={setShowTravelMaintenance}>
          <DialogContent className="max-w-md max-h-screen overflow-y-auto">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2">
                <Wrench className="h-5 w-5 text-purple-600" />
                <span>Manutenção em Viagem</span>
              </DialogTitle>
              <DialogDescription>
                Registre manutenção feita fora da base
              </DialogDescription>
            </DialogHeader>
            
            <div className="space-y-4">
              {/* Placa do veículo */}
              <div>
                <Label>Placa do Veículo</Label>
                <Input value={selectedVehicleData?.plate || ""} readOnly />
              </div>

              {/* Data do serviço */}
              <div>
                <Label>Data do Serviço</Label>
                <Input type="date" defaultValue={new Date().toISOString().split('T')[0]} />
              </div>

              {/* Nome do fornecedor */}
              <div>
                <Label>Nome do Fornecedor *</Label>
                <Input placeholder="Ex: Oficina São José" required />
              </div>

              {/* Valor do serviço */}
              <div>
                <Label>Valor do Serviço (R$)</Label>
                <Input type="number" step="0.01" placeholder="0,00" />
              </div>

              {/* Tipo de manutenção */}
              <div>
                <Label>Tipo de Manutenção</Label>
                <select className="w-full p-2 border rounded-md">
                  <option>Preventiva</option>
                  <option>Corretiva</option>
                  <option>Emergencial</option>
                  <option>Troca de peças</option>
                </select>
              </div>

              {/* Observações */}
              <div>
                <Label>Observações</Label>
                <textarea 
                  className="w-full p-2 border rounded-md resize-none" 
                  rows={3}
                  placeholder="Descreva o serviço realizado..."
                />
              </div>

              {/* Upload de fotos */}
              <div className="space-y-3">
                <Label>Fotos</Label>
                <div className="grid grid-cols-2 gap-3">
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <Camera className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">Foto do Serviço</p>
                  </div>
                  <div className="border-2 border-dashed border-gray-300 rounded-lg p-3 text-center">
                    <FileText className="h-6 w-6 mx-auto text-gray-400 mb-1" />
                    <p className="text-xs text-gray-600">Nota Fiscal</p>
                  </div>
                </div>
              </div>

              <Button className="w-full bg-purple-600 hover:bg-purple-700">
                Registrar Manutenção
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}