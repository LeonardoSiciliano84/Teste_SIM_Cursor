import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, User, Users, Eye, Clock, CheckCircle, XCircle, AlertTriangle, Settings } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { CameraDiagnostic } from "@/components/camera/CameraDiagnostic";

interface Visitor {
  id: string;
  name: string;
  cpf: string;
  company?: string;
  purpose?: string;
  vehiclePlate?: string;
  totalVisits: number;
  lastVisit?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AccessLog {
  id: string;
  personType: string;
  personId: string;
  personName: string;
  direction: "entry" | "exit";
  accessMethod: "facial" | "badge" | "manual";
  timestamp: string;
  recognitionConfidence?: number;
  location: string;
}

interface FacialRecognitionResult {
  recognized: boolean;
  person?: any;
  confidence?: number;
  accessLog?: AccessLog;
  message?: string;
}

export default function FacialRecognition() {
  const [activeTab, setActiveTab] = useState("registration");
  const [isCapturing, setIsCapturing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [videoError, setVideoError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [visitorForm, setVisitorForm] = useState({
    name: "",
    cpf: "",
    company: "",
    purpose: "",
    vehiclePlate: "",
  });

  const [employeeForm, setEmployeeForm] = useState({
    employeeId: "",
    name: "",
    department: "",
  });

  // Queries
  const { data: visitors = [] } = useQuery<Visitor[]>({
    queryKey: ["/api/access-control/visitors"],
  });

  const { data: accessLogs = [] } = useQuery<AccessLog[]>({
    queryKey: ["/api/access-control/logs"],
  });

  // Mutations
  const createVisitorMutation = useMutation({
    mutationFn: async (visitorData: any) => {
      return apiRequest("/api/access-control/visitors", "POST", visitorData);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Visitante cadastrado com sucesso!",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/visitors"] });
      setVisitorForm({
        name: "",
        cpf: "",
        company: "",
        purpose: "",
        vehiclePlate: "",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar visitante",
        variant: "destructive",
      });
    },
  });

  const enrollFaceMutation = useMutation({
    mutationFn: async ({ personId, personType, imageData }: { personId: string; personType: string; imageData: string }) => {
      return apiRequest("/api/access-control/facial-recognition/enroll", "POST", {
        personId,
        personType,
        imageData,
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Reconhecimento facial cadastrado com sucesso!",
      });
      setCapturedImage(null);
      stopCamera();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao cadastrar reconhecimento facial",
        variant: "destructive",
      });
    },
  });

  const recognizeFaceMutation = useMutation({
    mutationFn: async (imageData: string) => {
      return apiRequest("/api/access-control/facial-recognition/recognize", "POST", { imageData }) as Promise<FacialRecognitionResult>;
    },
    onSuccess: (result) => {
      if (result.recognized) {
        toast({
          title: "Pessoa Reconhecida",
          description: `Acesso liberado com ${Math.round((result.confidence || 0) * 100)}% de confiança`,
        });
        queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
      } else {
        toast({
          title: "Pessoa Não Reconhecida",
          description: "Acesso negado - pessoa não identificada",
          variant: "destructive",
        });
      }
      setCapturedImage(null);
      stopCamera();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro no reconhecimento facial",
        variant: "destructive",
      });
    },
  });

  // Camera functions - implementação robusta com fallbacks
  const startCamera = useCallback(async () => {
    try {
      console.log("[CAMERA] Iniciando câmera...");
      
      // Verificar se já existe um stream ativo
      if (streamRef.current) {
        console.log("[CAMERA] Parando stream anterior");
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      // Verificar elemento de vídeo
      if (!videoRef.current) {
        throw new Error("Elemento de vídeo não encontrado");
      }

      console.log("[CAMERA] Solicitando acesso à câmera...");
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { 
          width: { ideal: 640 },
          height: { ideal: 480 },
          frameRate: { ideal: 30 }
        },
        audio: false
      });
      
      console.log("[CAMERA] Stream obtido:", stream);
      console.log("[CAMERA] Tracks do stream:", stream.getTracks().map(t => ({ 
        kind: t.kind, 
        enabled: t.enabled, 
        readyState: t.readyState 
      })));

      const videoTrack = stream.getVideoTracks()[0];
      if (!videoTrack) {
        throw new Error("Nenhuma track de vídeo encontrada");
      }

      console.log("[CAMERA] Settings da track:", videoTrack.getSettings());

      // Definir srcObject
      videoRef.current.srcObject = stream;
      streamRef.current = stream;
      console.log("[CAMERA] Stream definido no elemento de vídeo");

      // Aguardar carregamento e reprodução
      console.log("[CAMERA] Aguardando carregamento do vídeo...");
      await new Promise<void>((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Elemento de vídeo perdido"));
          return;
        }

        const video = videoRef.current;
        let resolved = false;

        const timeout = setTimeout(() => {
          if (!resolved) {
            console.log("[CAMERA] Timeout - forçando resolução");
            resolved = true;
            resolve(); // Resolver mesmo assim
          }
        }, 3000);

        const onLoadedMetadata = () => {
          if (!resolved) {
            console.log("[CAMERA] Metadata carregada");
            clearTimeout(timeout);
            resolved = true;
            
            video.play()
              .then(() => {
                console.log("[CAMERA] Vídeo reproduzindo");
                resolve();
              })
              .catch((playError) => {
                console.warn("[CAMERA] Erro no play:", playError);
                // Resolver mesmo assim - o usuário pode clicar em play
                resolve();
              });
          }
        };

        const onError = (e: Event) => {
          if (!resolved) {
            console.error("[CAMERA] Erro no vídeo:", e);
            clearTimeout(timeout);
            resolved = true;
            reject(new Error("Erro no elemento de vídeo"));
          }
        };

        video.addEventListener('loadedmetadata', onLoadedMetadata, { once: true });
        video.addEventListener('error', onError, { once: true });

        // Se já tem metadados, chamar imediatamente
        if (video.readyState >= 1) {
          console.log("[CAMERA] Metadados já disponíveis");
          onLoadedMetadata();
        }
      });

      console.log("[CAMERA] Câmera iniciada com sucesso!");
      setIsCapturing(true);
      setVideoError(null);
      
    } catch (error) {
      console.error("[CAMERA] Erro completo:", error);
      let errorMessage = "Erro ao acessar a câmera";
      
      if (error instanceof Error) {
        console.error("[CAMERA] Tipo do erro:", error.name);
        console.error("[CAMERA] Mensagem:", error.message);
        
        switch (error.name) {
          case "NotAllowedError":
            errorMessage = "Acesso negado. Clique no ícone da câmera na barra do navegador e permita o acesso.";
            break;
          case "NotFoundError":
            errorMessage = "Nenhuma câmera encontrada. Verifique se há uma câmera conectada.";
            break;
          case "NotReadableError":
            errorMessage = "Câmera ocupada. Feche outros aplicativos que podem estar usando a câmera.";
            break;
          case "OverconstrainedError":
            errorMessage = "Configurações não suportadas. Tentando configuração mais simples...";
            // Tentar novamente com configurações mais simples
            setTimeout(() => startCameraSimple(), 1000);
            return;
          default:
            if (error.message.includes("não encontrado") || error.message.includes("perdido")) {
              errorMessage = "Erro interno do sistema. Recarregue a página.";
            } else {
              errorMessage = `Erro: ${error.message}`;
            }
        }
      }
      
      setVideoError(errorMessage);
      setIsCapturing(false);
      toast({
        title: "Erro na Câmera",
        description: errorMessage,
        variant: "destructive",
      });
    }
  }, [toast]);

  // Função de fallback com configurações mínimas
  const startCameraSimple = useCallback(async () => {
    try {
      console.log("[CAMERA] Tentativa com configurações simples...");
      
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      if (videoRef.current && stream) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
        setIsCapturing(true);
        setVideoError(null);
        console.log("[CAMERA] Configuração simples funcionou!");
      }
    } catch (error) {
      console.error("[CAMERA] Erro na configuração simples:", error);
      setVideoError("Não foi possível iniciar a câmera com nenhuma configuração");
    }
  }, []);

  const testCamera = useCallback(async () => {
    console.log("Testing camera capabilities...");
    try {
      // Listar dispositivos de mídia disponíveis
      const devices = await navigator.mediaDevices.enumerateDevices();
      console.log("Available devices:", devices);
      
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      console.log("Video devices:", videoDevices);
      
      if (videoDevices.length === 0) {
        throw new Error("Nenhuma câmera encontrada");
      }
      
      // Testar configurações básicas
      const constraints = {
        video: {
          deviceId: videoDevices[0].deviceId,
          width: { min: 320, ideal: 640, max: 1920 },
          height: { min: 240, ideal: 480, max: 1080 }
        }
      };
      
      console.log("Testing with constraints:", constraints);
      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log("Test stream obtained:", stream);
      
      // Parar o stream de teste
      stream.getTracks().forEach(track => track.stop());
      
      toast({
        title: "Teste de Câmera",
        description: `✓ Câmera funcionando! Encontradas ${videoDevices.length} câmera(s)`,
      });
      
    } catch (error) {
      console.error("Camera test error:", error);
      toast({
        title: "Erro no Teste",
        description: error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    }
  }, [toast]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCapturing(false);
  }, []);

  const captureImage = useCallback(() => {
    if (!videoRef.current || !canvasRef.current) return null;

    const canvas = canvasRef.current;
    const video = videoRef.current;
    
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    
    const ctx = canvas.getContext("2d");
    if (!ctx) return null;
    
    ctx.drawImage(video, 0, 0);
    const imageData = canvas.toDataURL("image/jpeg", 0.8);
    setCapturedImage(imageData);
    stopCamera();
    
    return imageData;
  }, [stopCamera]);

  const handleVisitorSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    createVisitorMutation.mutate(visitorForm);
  };

  const handleFacialEnrollment = (personType: "visitor" | "employee") => {
    if (!capturedImage) {
      toast({
        title: "Erro",
        description: "Capture uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }

    let personId = "";
    if (personType === "visitor" && visitorForm.cpf) {
      personId = visitorForm.cpf;
    } else if (personType === "employee" && employeeForm.employeeId) {
      personId = employeeForm.employeeId;
    } else {
      toast({
        title: "Erro",
        description: "Preencha os dados da pessoa primeiro",
        variant: "destructive",
      });
      return;
    }

    enrollFaceMutation.mutate({
      personId,
      personType,
      imageData: capturedImage,
    });
  };

  const handleFacialRecognition = () => {
    if (!capturedImage) {
      toast({
        title: "Erro",
        description: "Capture uma imagem primeiro",
        variant: "destructive",
      });
      return;
    }

    recognizeFaceMutation.mutate(capturedImage);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-2">
        <Eye className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Controle de Acesso - Reconhecimento Facial</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="registration">Cadastro</TabsTrigger>
          <TabsTrigger value="recognition">Reconhecimento</TabsTrigger>
          <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
          <TabsTrigger value="visitors">Visitantes</TabsTrigger>
          <TabsTrigger value="diagnostic">Diagnóstico</TabsTrigger>
        </TabsList>

        <TabsContent value="registration" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Camera Section */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Camera className="h-5 w-5" />
                  Captura de Imagem
                </CardTitle>
                <CardDescription>
                  Capture uma foto para cadastro no sistema de reconhecimento facial
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="relative aspect-video bg-gray-900 rounded-lg overflow-hidden min-h-[300px] flex items-center justify-center">
                  {isCapturing ? (
                    <>
                      <video
                        ref={videoRef}
                        className="w-full h-full object-cover"
                        playsInline
                        muted
                        style={{ transform: 'scaleX(-1)' }}
                      />
                      {/* Indicador LIVE */}
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        ● LIVE
                      </div>
                      {/* Aviso de erro */}
                      {videoError && (
                        <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 text-white px-3 py-2 rounded text-sm font-medium">
                          ⚠️ {videoError}
                        </div>
                      )}
                    </>
                  ) : capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <canvas ref={canvasRef} className="hidden" width="640" height="480" />
                
                <div className="flex gap-2">
                  {!isCapturing && !capturedImage && (
                    <>
                      <Button onClick={startCamera} className="flex-1">
                        <Camera className="h-4 w-4 mr-2" />
                        Iniciar Câmera
                      </Button>
                      <Button onClick={startCameraSimple} variant="outline" size="sm">
                        Modo Simples
                      </Button>
                      <Button onClick={testCamera} variant="outline" size="sm">
                        Teste
                      </Button>
                    </>
                  )}
                  
                  {isCapturing && (
                    <>
                      <Button onClick={captureImage} className="flex-1">
                        Capturar Foto
                      </Button>
                      <Button 
                        onClick={() => {
                          if (videoRef.current) {
                            videoRef.current.play().catch(console.error);
                          }
                        }} 
                        variant="secondary" 
                        size="sm"
                      >
                        ▶ Play
                      </Button>
                      <Button onClick={stopCamera} variant="outline">
                        Parar
                      </Button>
                    </>
                  )}
                  
                  {capturedImage && (
                    <Button onClick={() => setCapturedImage(null)} variant="outline" className="flex-1">
                      Nova Foto
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Registration Forms */}
            <div className="space-y-6">
              {/* Visitor Registration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Cadastro de Visitante
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <form onSubmit={handleVisitorSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="name">Nome Completo *</Label>
                        <Input
                          id="name"
                          value={visitorForm.name}
                          onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                          required
                          placeholder="Nome completo do visitante"
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF *</Label>
                        <Input
                          id="cpf"
                          value={visitorForm.cpf}
                          onChange={(e) => setVisitorForm({ ...visitorForm, cpf: e.target.value })}
                          required
                          placeholder="000.000.000-00"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Empresa (opcional)</Label>
                      <Input
                        id="company"
                        value={visitorForm.company}
                        onChange={(e) => setVisitorForm({ ...visitorForm, company: e.target.value })}
                        placeholder="Nome da empresa"
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="purpose">Motivo da Visita (opcional)</Label>
                      <Input
                        id="purpose"
                        value={visitorForm.purpose}
                        onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                        placeholder="Reunião, entrega, etc."
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="vehiclePlate">Placa do Veículo (opcional)</Label>
                      <Input
                        id="vehiclePlate"
                        value={visitorForm.vehiclePlate}
                        onChange={(e) => setVisitorForm({ ...visitorForm, vehiclePlate: e.target.value })}
                        placeholder="ABC-1234"
                      />
                    </div>
                    
                    <div className="space-y-3">
                      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3">
                        <p className="text-sm text-yellow-800">
                          <strong>Obrigatório:</strong> Capture uma foto antes de finalizar o cadastro para habilitar o reconhecimento facial.
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button 
                          type="submit" 
                          disabled={createVisitorMutation.isPending || !capturedImage}
                          className="flex-1"
                        >
                          {!capturedImage ? "Capture uma foto primeiro" : "Cadastrar Visitante"}
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => handleFacialEnrollment("visitor")}
                          disabled={!capturedImage || enrollFaceMutation.isPending || !visitorForm.name || !visitorForm.cpf}
                        >
                          Cadastrar Face
                        </Button>
                      </div>
                    </div>
                  </form>
                </CardContent>
              </Card>

              {/* Employee Registration */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Cadastro de Funcionário
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="employeeId">ID do Funcionário</Label>
                        <Input
                          id="employeeId"
                          value={employeeForm.employeeId}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, employeeId: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="employeeName">Nome</Label>
                        <Input
                          id="employeeName"
                          value={employeeForm.name}
                          onChange={(e) => setEmployeeForm({ ...employeeForm, name: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="department">Departamento</Label>
                      <Input
                        id="department"
                        value={employeeForm.department}
                        onChange={(e) => setEmployeeForm({ ...employeeForm, department: e.target.value })}
                      />
                    </div>
                    
                    <Button
                      onClick={() => handleFacialEnrollment("employee")}
                      disabled={!capturedImage || enrollFaceMutation.isPending}
                      className="w-full"
                    >
                      Cadastrar Face do Funcionário
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="recognition" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="h-5 w-5" />
                Reconhecimento Facial
              </CardTitle>
              <CardDescription>
                Use esta seção para reconhecer pessoas e liberar acesso
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="relative aspect-video bg-gray-100 rounded-lg overflow-hidden">
                  {isCapturing ? (
                    <video
                      ref={videoRef}
                      className="w-full h-full object-cover"
                      autoPlay
                      muted
                    />
                  ) : capturedImage ? (
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full">
                      <Camera className="h-16 w-16 text-gray-400" />
                    </div>
                  )}
                </div>
                
                <div className="space-y-4">
                  <div className="flex gap-2">
                    {!isCapturing && !capturedImage && (
                      <Button onClick={startCamera} className="flex-1">
                        <Camera className="h-4 w-4 mr-2" />
                        Iniciar Câmera
                      </Button>
                    )}
                    
                    {isCapturing && (
                      <>
                        <Button onClick={captureImage} className="flex-1">
                          Capturar Foto
                        </Button>
                        <Button onClick={stopCamera} variant="outline">
                          Parar
                        </Button>
                      </>
                    )}
                    
                    {capturedImage && (
                      <Button onClick={() => setCapturedImage(null)} variant="outline" className="flex-1">
                        Nova Foto
                      </Button>
                    )}
                  </div>
                  
                  {capturedImage && (
                    <Button
                      onClick={handleFacialRecognition}
                      disabled={recognizeFaceMutation.isPending}
                      className="w-full"
                      size="lg"
                    >
                      <Eye className="h-4 w-4 mr-2" />
                      Reconhecer Pessoa
                    </Button>
                  )}
                </div>
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
              <div className="space-y-4">
                {accessLogs.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum log de acesso encontrado
                  </div>
                ) : (
                  <div className="space-y-3">
                    {accessLogs.slice(0, 20).map((log) => (
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
                              {log.personType === "visitor" ? "Visitante" : "Funcionário"} • {log.location}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="flex items-center gap-2">
                            <Badge variant={log.accessMethod === "facial" ? "default" : "outline"}>
                              {log.accessMethod === "facial" ? "Facial" : 
                               log.accessMethod === "badge" ? "Crachá" : "Manual"}
                            </Badge>
                            {log.recognitionConfidence && (
                              <Badge variant="secondary">
                                {Math.round(log.recognitionConfidence * 100)}%
                              </Badge>
                            )}
                          </div>
                          <p className="text-sm text-gray-500 mt-1">
                            {new Date(log.timestamp).toLocaleString("pt-BR")}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="visitors" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Visitantes Cadastrados
              </CardTitle>
              <CardDescription>
                Lista de todos os visitantes cadastrados no sistema
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {visitors.length === 0 ? (
                  <div className="text-center py-8 text-gray-500">
                    Nenhum visitante cadastrado
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {visitors.map((visitor) => (
                      <div key={visitor.id} className="p-4 border rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <h3 className="font-medium">{visitor.name}</h3>
                          <Badge variant={visitor.isActive ? "default" : "secondary"}>
                            {visitor.isActive ? "Ativo" : "Inativo"}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">CPF: {visitor.cpf}</p>
                        {visitor.company && (
                          <p className="text-sm text-gray-600">Empresa: {visitor.company}</p>
                        )}
                        {visitor.purpose && (
                          <p className="text-sm text-gray-600">Motivo: {visitor.purpose}</p>
                        )}
                        {visitor.vehiclePlate && (
                          <p className="text-sm text-gray-600">Veículo: {visitor.vehiclePlate}</p>
                        )}
                        <div className="flex items-center gap-2 pt-2">
                          <Badge variant="outline">
                            {visitor.totalVisits} visitas
                          </Badge>
                          {visitor.lastVisit && (
                            <span className="text-xs text-gray-500">
                              Última: {new Date(visitor.lastVisit).toLocaleDateString("pt-BR")}
                            </span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="diagnostic" className="space-y-6">
          <CameraDiagnostic />
        </TabsContent>
      </Tabs>
    </div>
  );
}