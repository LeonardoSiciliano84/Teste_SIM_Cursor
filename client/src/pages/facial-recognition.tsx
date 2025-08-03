import { useState, useRef, useCallback } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Camera, User, Users, Eye, Clock, CheckCircle, XCircle, AlertTriangle } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

interface Visitor {
  id: string;
  name: string;
  cpf: string;
  email?: string;
  phone?: string;
  company?: string;
  purpose: string;
  hostEmployee: string;
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Form states
  const [visitorForm, setVisitorForm] = useState({
    name: "",
    cpf: "",
    email: "",
    phone: "",
    company: "",
    purpose: "",
    hostEmployee: "",
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
        email: "",
        phone: "",
        company: "",
        purpose: "",
        hostEmployee: "",
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

  // Camera functions
  const startCamera = useCallback(async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 } 
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play();
      }
      
      streamRef.current = stream;
      setIsCapturing(true);
    } catch (error) {
      console.error("Error accessing camera:", error);
      toast({
        title: "Erro",
        description: "Erro ao acessar a câmera",
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
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="registration">Cadastro</TabsTrigger>
          <TabsTrigger value="recognition">Reconhecimento</TabsTrigger>
          <TabsTrigger value="logs">Logs de Acesso</TabsTrigger>
          <TabsTrigger value="visitors">Visitantes</TabsTrigger>
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
                
                <canvas ref={canvasRef} className="hidden" />
                
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
                        <Label htmlFor="name">Nome Completo</Label>
                        <Input
                          id="name"
                          value={visitorForm.name}
                          onChange={(e) => setVisitorForm({ ...visitorForm, name: e.target.value })}
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="cpf">CPF</Label>
                        <Input
                          id="cpf"
                          value={visitorForm.cpf}
                          onChange={(e) => setVisitorForm({ ...visitorForm, cpf: e.target.value })}
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          value={visitorForm.email}
                          onChange={(e) => setVisitorForm({ ...visitorForm, email: e.target.value })}
                        />
                      </div>
                      <div>
                        <Label htmlFor="phone">Telefone</Label>
                        <Input
                          id="phone"
                          value={visitorForm.phone}
                          onChange={(e) => setVisitorForm({ ...visitorForm, phone: e.target.value })}
                        />
                      </div>
                    </div>
                    
                    <div>
                      <Label htmlFor="company">Empresa</Label>
                      <Input
                        id="company"
                        value={visitorForm.company}
                        onChange={(e) => setVisitorForm({ ...visitorForm, company: e.target.value })}
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="purpose">Motivo da Visita</Label>
                      <Input
                        id="purpose"
                        value={visitorForm.purpose}
                        onChange={(e) => setVisitorForm({ ...visitorForm, purpose: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div>
                      <Label htmlFor="hostEmployee">Funcionário a ser Visitado</Label>
                      <Input
                        id="hostEmployee"
                        value={visitorForm.hostEmployee}
                        onChange={(e) => setVisitorForm({ ...visitorForm, hostEmployee: e.target.value })}
                        required
                      />
                    </div>
                    
                    <div className="flex gap-2">
                      <Button type="submit" disabled={createVisitorMutation.isPending}>
                        Cadastrar Visitante
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => handleFacialEnrollment("visitor")}
                        disabled={!capturedImage || enrollFaceMutation.isPending}
                      >
                        Cadastrar Face
                      </Button>
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
                        <p className="text-sm text-gray-600">Motivo: {visitor.purpose}</p>
                        <p className="text-sm text-gray-600">Visita: {visitor.hostEmployee}</p>
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
      </Tabs>
    </div>
  );
}