import { useState, useRef, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { QrCode, User, Users, Clock, CheckCircle, XCircle, Search, UserPlus, Camera, X } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  type Visitor, 
  type AccessLog,
  type Employee
} from "@shared/schema";
import QrScanner from "qr-scanner";

// Interfaces removidas - usando tipos do schema

export default function AccessControl() {
  const [activeTab, setActiveTab] = useState("visitors");
  const [visitorCpf, setVisitorCpf] = useState("");
  const [visitorForm, setVisitorForm] = useState({
    name: "",
    cpf: "",
    photo: ""
  });
  const [qrCodeValue, setQrCodeValue] = useState("");
  const [accessDirection, setAccessDirection] = useState<"entry" | "exit">("entry");
  const [isQrScannerOpen, setIsQrScannerOpen] = useState(false);
  const [isScanning, setIsScanning] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const qrScannerRef = useRef<QrScanner | null>(null);
  
  // Camera states for visitor photo
  const [isCameraOpen, setIsCameraOpen] = useState(false);
  const [isCameraActive, setIsCameraActive] = useState(false);
  const visitorCameraRef = useRef<HTMLVideoElement>(null);
  const visitorStreamRef = useRef<MediaStream | null>(null);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Cleanup QR Scanner and Camera on unmount
  useEffect(() => {
    return () => {
      if (qrScannerRef.current) {
        qrScannerRef.current.stop();
        qrScannerRef.current.destroy();
      }
      if (visitorStreamRef.current) {
        visitorStreamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  // Start QR Scanner
  const startQrScanner = async () => {
    if (!videoRef.current) return;

    try {
      setIsScanning(true);
      
      const qrScanner = new QrScanner(videoRef.current, (result) => {
        // Evitar processamento múltiplo
        if (isProcessing) return;
        
        setIsProcessing(true);
        setQrCodeValue(result);
        
        console.log("QR Code detectado pelo scanner:", result);
        
        toast({
          title: "QR Code detectado",
          description: `Processando acesso para ${accessDirection === "entry" ? "Entrada" : "Saída"}...`,
        });
        
        // Parar scanner imediatamente após detecção
        qrScanner.stop();
        setIsScanning(false);
        
        // Processar QR Code após breve delay
        setTimeout(() => {
          processQrCode(result);
          setIsQrScannerOpen(false);
          setIsProcessing(false);
          setQrCodeValue("");
        }, 1500);
      });

      qrScannerRef.current = qrScanner;
      await qrScanner.start();
      
      toast({
        title: "Scanner ativo",
        description: "Aponte a câmera para o QR Code",
      });
    } catch (error) {
      console.error('Erro ao iniciar scanner:', error);
      setIsScanning(false);
      toast({
        title: "Erro na câmera",
        description: "Não foi possível acessar a câmera. Verifique as permissões.",
        variant: "destructive",
      });
    }
  };

  // Stop QR Scanner
  const stopQrScanner = () => {
    if (qrScannerRef.current) {
      qrScannerRef.current.destroy();
      qrScannerRef.current = null;
    }
    setIsScanning(false);
  };

  // Handle scanner dialog close
  const handleScannerClose = () => {
    stopQrScanner();
    setIsQrScannerOpen(false);
    setIsProcessing(false);
    setQrCodeValue("");
  };

  // Process QR Code (existing logic)
  const processQrCode = (qrData: string) => {
    console.log("Processando QR Code com direção:", accessDirection);
    console.log("QR Code data:", qrData);
    processQrCodeMutation.mutate({
      qrCodeData: qrData,
      accessType: accessDirection
    });
  };

  // Start visitor camera
  const startVisitorCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { facingMode: 'user' } 
      });
      
      if (visitorCameraRef.current) {
        visitorCameraRef.current.srcObject = stream;
        visitorStreamRef.current = stream;
        setIsCameraActive(true);
      }
    } catch (error) {
      console.error("Erro ao acessar câmera:", error);
      toast({
        title: "Erro",
        description: "Não foi possível acessar a câmera",
        variant: "destructive",
      });
    }
  };

  // Stop visitor camera
  const stopVisitorCamera = () => {
    if (visitorStreamRef.current) {
      visitorStreamRef.current.getTracks().forEach(track => track.stop());
      visitorStreamRef.current = null;
    }
    if (visitorCameraRef.current) {
      visitorCameraRef.current.srcObject = null;
    }
    setIsCameraActive(false);
  };

  // Capture visitor photo
  const captureVisitorPhoto = () => {
    if (!visitorCameraRef.current) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    
    canvas.width = visitorCameraRef.current.videoWidth;
    canvas.height = visitorCameraRef.current.videoHeight;
    
    if (context) {
      context.drawImage(visitorCameraRef.current, 0, 0);
      const base64Photo = canvas.toDataURL('image/jpeg', 0.8);
      
      setVisitorForm({ ...visitorForm, photo: base64Photo });
      setIsCameraOpen(false);
      stopVisitorCamera();
      
      toast({
        title: "Foto capturada",
        description: "Foto do visitante capturada com sucesso",
      });
    }
  };

  // Handle camera dialog close
  const handleCameraClose = () => {
    stopVisitorCamera();
    setIsCameraOpen(false);
  };

  // Queries
  const { data: visitors = [] } = useQuery<Visitor[]>({
    queryKey: ["/api/access-control/visitors"],
  });

  const { data: employees = [] } = useQuery<Employee[]>({
    queryKey: ["/api/employees"],
  });

  const { data: accessLogs = [] } = useQuery<AccessLog[]>({
    queryKey: ["/api/access-control/logs"],
  });

  // Mutations
  const searchVisitorMutation = useMutation({
    mutationFn: async (cpf: string) => {
      const response = await apiRequest(`/api/access-control/visitors/search?cpf=${encodeURIComponent(cpf)}`);
      return response;
    },
    onSuccess: (data) => {
      if (data.visitor) {
        setVisitorForm({
          name: data.visitor.name,
          cpf: data.visitor.cpf,
          photo: data.visitor.photo || ""
        });
        toast({
          title: "Visitante encontrado",
          description: `${data.visitor.name} - ${data.visitor.totalVisits} visitas`,
        });
      } else {
        setVisitorForm({
          name: "",
          cpf: visitorCpf,
          photo: ""
        });
        toast({
          title: "Visitante não encontrado",
          description: "Preencha os dados para novo cadastro",
        });
      }
    },
  });

  const registerVisitorMutation = useMutation({
    mutationFn: async (data: any) => {
      return await apiRequest("/api/access-control/visitors", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Visitante cadastrado",
        description: "Visitante registrado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/visitors"] });
      setVisitorForm({ name: "", cpf: "", photo: "" });
      setVisitorCpf("");
    },
  });

  const processQrCodeMutation = useMutation({
    mutationFn: async (data: { qrCodeData: string; accessType: "entry" | "exit" }) => {
      console.log("Enviando dados para API:", data);
      return await apiRequest("/api/access-control/qrcode", "POST", data);
    },
    onSuccess: (data) => {
      console.log("Resposta da API:", data);
      toast({
        title: "✅ Acesso Liberado",
        description: `${data.employee.fullName} - ${accessDirection === "entry" ? "Entrada" : "Saída"} registrada com sucesso`,
        variant: "default",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
      setIsProcessing(false);
    },
    onError: (error) => {
      console.error("Erro na API:", error);
      toast({
        title: "❌ Acesso Negado",
        description: "QR Code inválido ou funcionário não encontrado",
        variant: "destructive",
      });
      setIsProcessing(false);
    },
  });

  const handleVisitorSearch = () => {
    if (visitorCpf.length >= 11) {
      searchVisitorMutation.mutate(visitorCpf);
    }
  };

  const handleVisitorRegister = () => {
    if (visitorForm.name && visitorForm.cpf) {
      registerVisitorMutation.mutate(visitorForm);
    }
  };

  const handleQrCodeProcess = () => {
    if (qrCodeValue) {
      processQrCode(qrCodeValue);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Controle de Acesso</h1>
        <p className="text-gray-600">Sistema de controle de acesso para visitantes e funcionários</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="visitors">Visitantes</TabsTrigger>
          <TabsTrigger value="employees">Funcionários</TabsTrigger>
          <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
          <TabsTrigger 
            value="qrcode" 
            className="data-[state=active]:border-4 data-[state=active]:border-[#0C29AB] data-[state=active]:bg-[#0C29AB]/10"
          >
            QR Code
          </TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="border-2" style={{borderColor: '#0C29AB'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#0C29AB'}}>
                  <Search className="h-5 w-5" />
                  Buscar Visitante
                </CardTitle>
                <CardDescription>
                  Digite o CPF para buscar visitante cadastrado
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="visitorCpf">CPF do Visitante</Label>
                  <div className="flex gap-2">
                    <Input
                      id="visitorCpf"
                      value={visitorCpf}
                      onChange={(e) => {
                        const value = e.target.value.replace(/\D/g, '');
                        const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                          .replace(/(\d{3})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
                          .replace(/(\d{3})(\d{3})(\d{2})/, '$1.$2.$3')
                          .replace(/(\d{3})(\d{2})/, '$1.$2');
                        setVisitorCpf(formatted);
                      }}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    <Button 
                      onClick={handleVisitorSearch}
                      disabled={searchVisitorMutation.isPending}
                      style={{backgroundColor: '#0C29AB', borderColor: '#0C29AB'}}
                      className="hover:bg-[#0A237D]"
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className="border-2" style={{borderColor: '#0C29AB'}}>
              <CardHeader>
                <CardTitle className="flex items-center gap-2" style={{color: '#0C29AB'}}>
                  <UserPlus className="h-5 w-5" />
                  Cadastro de Visitante
                </CardTitle>
                <CardDescription>
                  Dados do visitante (novo ou existente)
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label htmlFor="visitorName">Nome Completo</Label>
                  <Input
                    id="visitorName"
                    value={visitorForm.name}
                    onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                    placeholder="Nome completo do visitante"
                  />
                </div>
                
                <div>
                  <Label htmlFor="visitorCpfForm">CPF</Label>
                  <Input
                    id="visitorCpfForm"
                    value={visitorForm.cpf}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '');
                      const formatted = value.replace(/(\d{3})(\d{3})(\d{3})(\d{2})/, '$1.$2.$3-$4')
                        .replace(/(\d{3})(\d{3})(\d{3})(\d{1})/, '$1.$2.$3-$4')
                        .replace(/(\d{3})(\d{3})(\d{2})/, '$1.$2.$3')
                        .replace(/(\d{3})(\d{2})/, '$1.$2');
                      setVisitorForm({ ...visitorForm, cpf: formatted });
                    }}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div>
                  <Label htmlFor="visitorPhoto">Foto (Base64 ou URL)</Label>
                  <div className="space-y-2">
                    <Input
                      id="visitorPhoto"
                      value={visitorForm.photo}
                      onChange={(e) => setVisitorForm({ ...visitorForm, photo: e.target.value })}
                      placeholder="URL da foto ou dados base64"
                    />
                    <div className="flex gap-2">
                      <Dialog open={isCameraOpen} onOpenChange={setIsCameraOpen}>
                        <DialogTrigger asChild>
                          <Button 
                            type="button"
                            variant="outline"
                            onClick={() => setIsCameraOpen(true)}
                            className="flex-1"
                          >
                            <Camera className="h-4 w-4 mr-2" />
                            Tirar Foto
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-md">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              <Camera className="h-5 w-5" />
                              Capturar Foto do Visitante
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="space-y-4">
                            <div className="relative bg-black rounded-lg overflow-hidden">
                              <video
                                ref={visitorCameraRef}
                                className="w-full h-64 object-cover"
                                autoPlay
                                playsInline
                                muted
                              />
                              {!isCameraActive && (
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                                  <div className="text-center text-white">
                                    <Camera className="h-12 w-12 mx-auto mb-2" />
                                    <p>Pressione "Iniciar Câmera" para começar</p>
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            <div className="flex gap-2">
                              {!isCameraActive ? (
                                <Button 
                                  onClick={startVisitorCamera}
                                  className="flex-1 bg-green-600 hover:bg-green-700"
                                >
                                  <Camera className="h-4 w-4 mr-2" />
                                  Iniciar Câmera
                                </Button>
                              ) : (
                                <Button 
                                  onClick={captureVisitorPhoto}
                                  className="flex-1 bg-blue-600 hover:bg-blue-700"
                                >
                                  <Camera className="h-4 w-4 mr-2" />
                                  Capturar Foto
                                </Button>
                              )}
                              
                              <Button 
                                onClick={handleCameraClose}
                                variant="outline"
                              >
                                Fechar
                              </Button>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>
                    
                    {visitorForm.photo && (
                      <div className="mt-2">
                        <img 
                          src={visitorForm.photo} 
                          alt="Preview" 
                          className="w-20 h-20 rounded-lg object-cover border"
                        />
                        <p className="text-xs text-gray-500 mt-1">Foto capturada</p>
                      </div>
                    )}
                  </div>
                </div>

                <Button 
                  onClick={handleVisitorRegister}
                  disabled={!visitorForm.name || !visitorForm.cpf || registerVisitorMutation.isPending}
                  className="w-full hover:bg-[#0A237D]"
                  style={{backgroundColor: '#0C29AB', borderColor: '#0C29AB'}}
                >
                  Cadastrar/Atualizar Visitante
                </Button>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Visitantes Cadastrados
              </CardTitle>
            </CardHeader>
            <CardContent>
              {visitors.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum visitante cadastrado
                </div>
              ) : (
                <div className="space-y-3">
                  {visitors.map((visitor) => (
                    <div key={visitor.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {visitor.photo && (
                          <img
                            src={visitor.photo}
                            alt={visitor.name}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{visitor.name}</p>
                          <p className="text-sm text-gray-500">CPF: {visitor.cpf}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <Badge variant={visitor.isActive ? "default" : "secondary"}>
                          {visitor.totalVisits} visitas
                        </Badge>
                        {visitor.lastVisit && (
                          <p className="text-sm text-gray-500 mt-1">
                            Última: {new Date(visitor.lastVisit).toLocaleString("pt-BR")}
                          </p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="employees" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Funcionários Cadastrados
              </CardTitle>
              <CardDescription>
                Lista de funcionários com acesso por QR Code
              </CardDescription>
            </CardHeader>
            <CardContent>
              {employees.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum funcionário cadastrado
                </div>
              ) : (
                <div className="space-y-3">
                  {employees.map((employee) => (
                    <div key={employee.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center gap-3">
                        {employee.profilePhoto && (
                          <img
                            src={employee.profilePhoto}
                            alt={employee.fullName}
                            className="w-12 h-12 rounded-full object-cover"
                          />
                        )}
                        <div>
                          <p className="font-medium">{employee.fullName}</p>
                          <p className="text-sm text-gray-500">
                            {employee.employeeNumber} • {employee.department} • {employee.position}
                          </p>
                          <p className="text-xs text-gray-400">CPF: {employee.cpf}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline">
                          {employee.accessLevel}
                        </Badge>
                        <Button size="sm" variant="outline">
                          <QrCode className="h-4 w-4 mr-1" />
                          QR Code
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="qrcode" className="space-y-6">
          <Card 
            className="border-4 shadow-lg bg-gradient-to-r from-blue-50 to-blue-100" 
            style={{
              borderColor: '#0C29AB',
              boxShadow: '0 0 20px rgba(12, 41, 171, 0.3)'
            }}
          >
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <QrCode className="h-5 w-5" />
                Leitura de QR Code
              </CardTitle>
              <CardDescription>
                Scanner de QR Code para controle de entrada e saída
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="accessDirection">Tipo de Acesso</Label>
                <Select value={accessDirection} onValueChange={(value: "entry" | "exit") => setAccessDirection(value)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="entry">Entrada</SelectItem>
                    <SelectItem value="exit">Saída</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div>
                <Label>Scanner de QR Code</Label>
                <div className="flex gap-2">
                  <Dialog open={isQrScannerOpen} onOpenChange={setIsQrScannerOpen}>
                    <DialogTrigger asChild>
                      <Button 
                        onClick={() => setIsQrScannerOpen(true)}
                        className="flex-1 hover:bg-[#0A237D]"
                        style={{backgroundColor: '#0C29AB', borderColor: '#0C29AB'}}
                        size="lg"
                      >
                        <Camera className="h-5 w-5 mr-2" />
                        Abrir Câmera para Scanear QR Code
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="max-w-md">
                      <DialogHeader>
                        <DialogTitle className="flex items-center gap-2">
                          <QrCode className="h-5 w-5" />
                          Scanner de QR Code
                        </DialogTitle>
                      </DialogHeader>
                      
                      <div className="space-y-4">
                        <div className="relative bg-black rounded-lg overflow-hidden">
                          <video
                            ref={videoRef}
                            className="w-full h-64 object-cover"
                            autoPlay
                            playsInline
                            muted
                          />
                          {!isScanning && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/50">
                              <div className="text-center text-white">
                                <Camera className="h-12 w-12 mx-auto mb-2" />
                                <p>Pressione "Iniciar Scanner" para começar</p>
                              </div>
                            </div>
                          )}
                        </div>
                        
                        <div className="flex gap-2">
                          {!isScanning && !isProcessing ? (
                            <Button 
                              onClick={startQrScanner}
                              className="flex-1 bg-green-600 hover:bg-green-700"
                            >
                              <Camera className="h-4 w-4 mr-2" />
                              Iniciar Scanner
                            </Button>
                          ) : isProcessing ? (
                            <Button 
                              disabled
                              className="flex-1 bg-blue-600"
                            >
                              <Clock className="h-4 w-4 mr-2 animate-spin" />
                              Processando...
                            </Button>
                          ) : (
                            <Button 
                              onClick={stopQrScanner}
                              variant="destructive"
                              className="flex-1"
                            >
                              <X className="h-4 w-4 mr-2" />
                              Parar Scanner
                            </Button>
                          )}
                          
                          <Button 
                            onClick={handleScannerClose}
                            variant="outline"
                            disabled={isProcessing}
                          >
                            Fechar
                          </Button>
                        </div>
                        
                        {qrCodeValue && !isProcessing && (
                          <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                            <p className="text-sm text-green-700">
                              <strong>QR Code detectado:</strong> {qrCodeValue.substring(0, 30)}...
                            </p>
                          </div>
                        )}
                        
                        {isProcessing && (
                          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg">
                            <p className="text-sm text-blue-700">
                              <strong>Processando acesso...</strong>
                            </p>
                            <p className="text-xs text-blue-600 mt-1">
                              Aguarde a confirmação
                            </p>
                          </div>
                        )}
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>

              <div className="p-4 bg-blue-50 rounded-lg border-2" style={{borderColor: '#0C29AB'}}>
                <p className="text-sm text-gray-700">
                  <strong style={{color: '#0C29AB'}}>Instruções:</strong>
                  <br />
                  1. Selecione o tipo de acesso (Entrada ou Saída)
                  <br />
                  2. Clique em "Abrir Câmera para Scanear QR Code"
                  <br />
                  3. Posicione o QR Code na frente da câmera
                  <br />
                  4. O acesso será registrado automaticamente após a detecção
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="h-5 w-5" />
                Logs de Acesso
              </CardTitle>
              <CardDescription>
                Histórico de acessos registrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              {accessLogs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum log de acesso encontrado
                </div>
              ) : (
                <div className="space-y-3">
                  {accessLogs.slice(0, 20).map((log) => {
                    console.log("Log direction:", log.direction, "Type:", typeof log.direction);
                    return (
                      <div key={log.id} className="flex items-center justify-between p-4 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${
                            log.direction === "entry" ? "bg-green-100 text-green-600" : "bg-red-100 text-red-600"
                          }`}>
                            {log.direction === "entry" ? <CheckCircle className="h-4 w-4" /> : <XCircle className="h-4 w-4" />}
                          </div>
                          <div>
                            <p className="font-medium">{log.personName}</p>
                            <p className="text-sm text-gray-500">
                              {log.personType === "visitor" ? "Visitante" : "Funcionário"} • CPF: {log.personCpf}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge variant={log.accessMethod === "qrcode" ? "default" : "outline"}>
                              {log.accessMethod === "qrcode" ? "QR Code" : "Manual"}
                            </Badge>
                            <Badge variant={log.direction === "entry" ? "default" : "secondary"}>
                              {log.direction === "entry" ? "Entrada" : "Saída"}
                            </Badge>
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(log.timestamp).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}