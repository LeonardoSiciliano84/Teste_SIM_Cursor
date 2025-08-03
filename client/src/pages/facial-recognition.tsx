import { useState, useRef, useCallback, useEffect } from "react";
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
import * as faceapi from 'face-api.js';

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
  const [isFaceDetectionActive, setIsFaceDetectionActive] = useState(false);
  const [faceDetected, setFaceDetected] = useState(false);
  const [facePosition, setFacePosition] = useState<{ x: number; y: number; width: number; height: number } | null>(null);
  const [modelsLoaded, setModelsLoaded] = useState(false);
  const [autoCapture, setAutoCapture] = useState(false);
  const [captureCountdown, setCaptureCountdown] = useState(0);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const overlayCanvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const detectionIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Load face-api.js models
  const loadModels = useCallback(async () => {
    try {
      console.log('[FACE-API] Carregando modelos...');
      console.log('[FACE-API] Tentando carregar do diretório /models');
      
      // Carregar apenas os modelos essenciais primeiro
      await faceapi.nets.tinyFaceDetector.loadFromUri('/models');
      console.log('[FACE-API] TinyFaceDetector carregado');
      
      await faceapi.nets.faceLandmark68Net.loadFromUri('/models');
      console.log('[FACE-API] FaceLandmark68Net carregado');
      
      console.log('[FACE-API] Modelos essenciais carregados com sucesso');
      setModelsLoaded(true);
      
      toast({
        title: "Sucesso",
        description: "Sistema de detecção facial ativado!",
        variant: "default",
      });
    } catch (error) {
      console.error('[FACE-API] Erro ao carregar modelos:', error);
      console.error('[FACE-API] Detalhes do erro:', error instanceof Error ? error.message : 'Erro desconhecido');
      
      // Tentar alternativa sem face-api.js
      console.log('[FACE-API] Tentando modo fallback sem face-api.js');
      setModelsLoaded(false);
      
      toast({
        title: "Aviso",
        description: "Detectores de face não disponíveis. Use modo manual para captura.",
        variant: "default",
      });
    }
  }, [toast]);

  // Face detection function
  const detectFaces = useCallback(async () => {
    if (!videoRef.current || !overlayCanvasRef.current || !modelsLoaded || !isFaceDetectionActive) {
      return;
    }

    const video = videoRef.current;
    const canvas = overlayCanvasRef.current;
    
    if (video.readyState !== 4) {
      return; // Video not ready
    }

    try {
      // Detect faces with landmarks
      const detections = await faceapi
        .detectAllFaces(video, new faceapi.TinyFaceDetectorOptions({ inputSize: 416, scoreThreshold: 0.5 }))
        .withFaceLandmarks();

      // Clear previous drawings
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      if (detections.length > 0) {
        const detection = detections[0]; // Use first detected face
        const box = detection.detection.box;
        
        // Update face position
        setFacePosition({
          x: box.x,
          y: box.y,
          width: box.width,
          height: box.height,
        });

        // Check if face is well positioned (centered and appropriate size)
        const videoWidth = video.videoWidth;
        const videoHeight = video.videoHeight;
        const faceArea = box.width * box.height;
        const videoArea = videoWidth * videoHeight;
        const faceRatio = faceArea / videoArea;
        
        const centerX = box.x + box.width / 2;
        const centerY = box.y + box.height / 2;
        const videoCenterX = videoWidth / 2;
        const videoCenterY = videoHeight / 2;
        
        const distanceFromCenter = Math.sqrt(
          Math.pow(centerX - videoCenterX, 2) + Math.pow(centerY - videoCenterY, 2)
        );
        const maxDistance = Math.min(videoWidth, videoHeight) * 0.2;
        
        const isWellPositioned = 
          faceRatio > 0.1 && faceRatio < 0.4 && // Face size between 10% and 40% of video
          distanceFromCenter < maxDistance; // Face is centered
        
        setFaceDetected(isWellPositioned);

        // Draw face detection box
        ctx.strokeStyle = isWellPositioned ? '#22c55e' : '#ef4444'; // Green if well positioned, red otherwise
        ctx.lineWidth = 3;
        ctx.strokeRect(box.x, box.y, box.width, box.height);

        // Draw face landmarks
        if (detection.landmarks) {
          ctx.fillStyle = isWellPositioned ? '#22c55e' : '#ef4444';
          detection.landmarks.positions.forEach((point) => {
            ctx.beginPath();
            ctx.arc(point.x, point.y, 2, 0, 2 * Math.PI);
            ctx.fill();
          });
        }

        // Auto capture if face is well positioned and auto capture is enabled
        if (isWellPositioned && autoCapture && !capturedImage) {
          if (captureCountdown === 0) {
            setCaptureCountdown(3);
          }
        } else if (!isWellPositioned) {
          setCaptureCountdown(0);
        }
      } else {
        setFaceDetected(false);
        setFacePosition(null);
        setCaptureCountdown(0);
      }

      // Draw guide overlay (face guide circle)
      drawFaceGuide(ctx, canvas.width, canvas.height);

    } catch (error) {
      console.error('[FACE-API] Erro na detecção:', error);
    }
  }, [modelsLoaded, isFaceDetectionActive, autoCapture, capturedImage, captureCountdown]);

  // Draw face guide overlay (sempre desenhar quando no modo auto)
  const drawFaceGuide = useCallback((ctx: CanvasRenderingContext2D, width: number, height: number) => {
    if (!autoCapture) return; // Só desenhar no modo automático
    
    console.log('[OVERLAY] Desenhando aro:', { width, height, autoCapture });
    
    const centerX = width / 2;
    const centerY = height / 2;
    const radius = Math.min(width, height) * 0.25;

    // Limpar área
    ctx.clearRect(0, 0, width, height);

    // Fundo semi-transparente para destacar o aro
    ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    ctx.fillRect(0, 0, width, height);
    
    // Cortar círculo no meio (área transparente)
    ctx.globalCompositeOperation = 'destination-out';
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius + 5, 0, 2 * Math.PI);
    ctx.fill();
    
    // Voltar ao modo normal
    ctx.globalCompositeOperation = 'source-over';

    // Draw guide circle principal
    ctx.strokeStyle = faceDetected ? '#22c55e' : '#0C29AB'; // Azul FELKA quando não detectado
    ctx.lineWidth = 4;
    ctx.setLineDash([15, 8]);
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw inner circle
    ctx.strokeStyle = faceDetected ? '#16a34a' : '#1d4ed8';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(centerX, centerY, radius - 10, 0, 2 * Math.PI);
    ctx.stroke();

    // Draw crosshairs no centro
    ctx.strokeStyle = faceDetected ? '#22c55e' : '#0C29AB';
    ctx.lineWidth = 2;
    ctx.beginPath();
    // Horizontal line
    ctx.moveTo(centerX - 30, centerY);
    ctx.lineTo(centerX + 30, centerY);
    // Vertical line
    ctx.moveTo(centerX, centerY - 30);
    ctx.lineTo(centerX, centerY + 30);
    ctx.stroke();

    // Draw instruction text
    ctx.fillStyle = '#ffffff';
    ctx.font = 'bold 16px Arial';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    
    const message = modelsLoaded 
      ? (faceDetected ? 'Rosto detectado! Mantenha a posição' : 'Posicione seu rosto no círculo')
      : 'Posicione seu rosto no círculo';
    
    // Outline do texto
    ctx.strokeText(message, centerX, centerY + radius + 50);
    ctx.fillText(message, centerX, centerY + radius + 50);

    // Draw countdown if active
    if (captureCountdown > 0) {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#000000';
      ctx.font = 'bold 64px Arial';
      ctx.lineWidth = 4;
      ctx.strokeText(captureCountdown.toString(), centerX, centerY - 40);
      ctx.fillText(captureCountdown.toString(), centerX, centerY - 40);
    }
  }, [faceDetected, autoCapture, modelsLoaded, captureCountdown]);

  const stopCamera = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    // Parar detecção facial
    setIsFaceDetectionActive(false);
    setFaceDetected(false);
    setFacePosition(null);
    setCaptureCountdown(0);
    
    // Limpar canvas overlay
    if (overlayCanvasRef.current) {
      const ctx = overlayCanvasRef.current.getContext('2d');
      if (ctx) {
        ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
      }
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

  // Auto capture countdown effect
  useEffect(() => {
    if (captureCountdown > 0) {
      const timer = setTimeout(() => {
        setCaptureCountdown(prev => {
          if (prev === 1) {
            // Capture the image
            captureImage();
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
      
      return () => clearTimeout(timer);
    }
  }, [captureCountdown, captureImage]);

  // Simple auto-capture system quando face-api.js não está disponível
  useEffect(() => {
    if (autoCapture && !modelsLoaded && isCapturing && !capturedImage && captureCountdown === 0) {
      // No modo básico, esperar 2 segundos depois que usuário ativar auto
      const timer = setTimeout(() => {
        console.log('[AUTO-CAPTURE] Iniciando captura automática (modo básico)');
        setCaptureCountdown(3);
      }, 2000);
      
      return () => clearTimeout(timer);
    }
  }, [autoCapture, modelsLoaded, isCapturing, capturedImage, captureCountdown]);

  // Ajustar tamanho do canvas overlay quando vídeo carregar
  useEffect(() => {
    const adjustOverlaySize = () => {
      if (overlayCanvasRef.current && videoRef.current) {
        const video = videoRef.current;
        const overlay = overlayCanvasRef.current;
        
        // Aguardar o vídeo carregar
        if (video.videoWidth > 0 && video.videoHeight > 0) {
          overlay.width = video.clientWidth;
          overlay.height = video.clientHeight;
          console.log('[OVERLAY] Canvas ajustado:', { width: overlay.width, height: overlay.height });
        }
      }
    };

    if (isCapturing && videoRef.current) {
      videoRef.current.addEventListener('loadedmetadata', adjustOverlaySize);
      videoRef.current.addEventListener('resize', adjustOverlaySize);
      
      // Tentar ajustar imediatamente
      adjustOverlaySize();
      
      return () => {
        if (videoRef.current) {
          videoRef.current.removeEventListener('loadedmetadata', adjustOverlaySize);
          videoRef.current.removeEventListener('resize', adjustOverlaySize);
        }
      };
    }
  }, [isCapturing]);

  // Face detection interval e desenho do overlay
  useEffect(() => {
    if (isCapturing && overlayCanvasRef.current && autoCapture) {
      console.log('[OVERLAY] Iniciando loop de desenho do aro');
      
      // Função para desenhar continuamente
      const drawLoop = () => {
        if (overlayCanvasRef.current && videoRef.current && autoCapture) {
          const ctx = overlayCanvasRef.current.getContext('2d');
          const overlay = overlayCanvasRef.current;
          
          if (ctx) {
            // Ajustar tamanho do canvas para corresponder ao vídeo
            const videoRect = videoRef.current.getBoundingClientRect();
            if (overlay.width !== videoRect.width || overlay.height !== videoRect.height) {
              overlay.width = videoRect.width;
              overlay.height = videoRect.height;
              overlay.style.width = `${videoRect.width}px`;
              overlay.style.height = `${videoRect.height}px`;
              console.log('[OVERLAY] Canvas redimensionado:', { width: overlay.width, height: overlay.height });
            }
            
            // Sempre desenhar o guia quando no modo auto
            drawFaceGuide(ctx, overlay.width, overlay.height);
            
            // Executar detecção facial se modelos estão carregados
            if (modelsLoaded && isFaceDetectionActive) {
              detectFaces();
            }
          }
        }
      };
      
      // Desenhar imediatamente
      drawLoop();
      
      // Configurar intervalo
      detectionIntervalRef.current = setInterval(drawLoop, 100); // Atualizar a cada 100ms
      
      return () => {
        if (detectionIntervalRef.current) {
          clearInterval(detectionIntervalRef.current);
        }
        // Limpar canvas quando desmontar
        if (overlayCanvasRef.current) {
          const ctx = overlayCanvasRef.current.getContext('2d');
          if (ctx) {
            ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
          }
        }
      };
    }
  }, [isCapturing, autoCapture, modelsLoaded, isFaceDetectionActive, detectFaces, drawFaceGuide]);

  // Load models on component mount
  useEffect(() => {
    loadModels();
  }, [loadModels]);

  // Form states - apenas campos obrigatórios
  const [visitorForm, setVisitorForm] = useState({
    name: "",
    cpf: "",
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
      
      // Parar stream anterior
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
        streamRef.current = null;
      }

      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false
      });
      
      console.log("[CAMERA] Stream simples obtido:", stream);
      
      if (!videoRef.current) {
        throw new Error("Elemento de vídeo não encontrado");
      }

      // Definir propriedades do vídeo antes de definir o stream
      const video = videoRef.current;
      video.srcObject = stream;
      streamRef.current = stream;
      
      // Forçar reprodução imediata
      setIsCapturing(true);
      setVideoError(null);
      
      // Aguardar um pouco e tentar reproduzir
      setTimeout(async () => {
        if (video && video.srcObject) {
          try {
            await video.play();
            console.log("[CAMERA] Vídeo reproduzindo em modo simples");
            
            // Ativar detecção facial se modelos estão carregados
            if (modelsLoaded) {
              setIsFaceDetectionActive(true);
              console.log("[FACE-API] Detecção facial ativada");
            }
          } catch (playError) {
            console.warn("[CAMERA] Erro no autoplay:", playError);
            setVideoError("Clique no botão Play para iniciar o vídeo");
          }
        }
      }, 200);
      
      console.log("[CAMERA] Configuração simples funcionou!");
    } catch (error) {
      console.error("[CAMERA] Erro na configuração simples:", error);
      setVideoError(`Erro no modo simples: ${error instanceof Error ? error.message : 'Desconhecido'}`);
      setIsCapturing(false);
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

  const forcePlay = useCallback(async () => {
    if (videoRef.current) {
      try {
        console.log("[CAMERA] Forçando reprodução do vídeo...");
        console.log("[CAMERA] Video element:", videoRef.current);
        console.log("[CAMERA] Video src:", videoRef.current.srcObject);
        console.log("[CAMERA] Video paused:", videoRef.current.paused);
        console.log("[CAMERA] Video ready state:", videoRef.current.readyState);
        
        await videoRef.current.play();
        console.log("[CAMERA] Vídeo forçado a reproduzir com sucesso");
        setVideoError(null);
      } catch (error) {
        console.error("[CAMERA] Erro ao forçar reprodução:", error);
        setVideoError(`Erro na reprodução: ${error instanceof Error ? error.message : 'Desconhecido'}`);
      }
    } else {
      console.error("[CAMERA] Elemento de vídeo não encontrado para forçar reprodução");
      setVideoError("Elemento de vídeo não encontrado");
    }
  }, []);

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
                  {/* Sempre renderizar o vídeo, mas escondê-lo quando não estiver capturando */}
                  <video
                    ref={videoRef}
                    className={`w-full h-full object-cover ${!isCapturing ? 'hidden' : ''}`}
                    playsInline
                    muted
                    style={{ transform: 'scaleX(-1)' }}
                  />
                  
                  {/* Canvas overlay para detecção facial */}
                  {isCapturing && (
                    <canvas
                      ref={overlayCanvasRef}
                      className="absolute inset-0 w-full h-full pointer-events-none z-10"
                      style={{ 
                        transform: 'scaleX(-1)',
                        background: 'transparent'
                      }}
                      width="640"
                      height="480"
                    />
                  )}
                  
                  {/* Overlay com SVG para o aro */}
                  {isCapturing && autoCapture && (
                    <div className="absolute inset-0 w-full h-full pointer-events-none z-20 flex items-center justify-center" style={{ transform: 'scaleX(-1)' }}>
                      {/* Fundo escurecido com corte transparente */}
                      <svg className="absolute inset-0 w-full h-full">
                        <defs>
                          <mask id="circleMask">
                            <rect width="100%" height="100%" fill="white" />
                            <circle cx="50%" cy="50%" r="112" fill="black" />
                          </mask>
                        </defs>
                        <rect width="100%" height="100%" fill="rgba(0, 0, 0, 0.4)" mask="url(#circleMask)" />
                      </svg>
                      
                      {/* Aro principal */}
                      <div className="relative">
                        <svg width="240" height="240" className="relative">
                          {/* Círculo externo tracejado */}
                          <circle
                            cx="120"
                            cy="120"
                            r="110"
                            fill="none"
                            stroke={faceDetected ? '#22c55e' : '#0C29AB'}
                            strokeWidth="4"
                            strokeDasharray="15,8"
                            className="animate-spin"
                            style={{ transformOrigin: 'center', animationDuration: '20s' }}
                          />
                          
                          {/* Círculo interno */}
                          <circle
                            cx="120"
                            cy="120"
                            r="100"
                            fill="none"
                            stroke={faceDetected ? '#16a34a' : '#1d4ed8'}
                            strokeWidth="2"
                          />
                          
                          {/* Mira central - horizontal */}
                          <line
                            x1="90"
                            y1="120"
                            x2="150"
                            y2="120"
                            stroke={faceDetected ? '#22c55e' : '#0C29AB'}
                            strokeWidth="2"
                          />
                          
                          {/* Mira central - vertical */}
                          <line
                            x1="120"
                            y1="90"
                            x2="120"
                            y2="150"
                            stroke={faceDetected ? '#22c55e' : '#0C29AB'}
                            strokeWidth="2"
                          />
                        </svg>
                        
                        {/* Countdown no centro */}
                        {captureCountdown > 0 && (
                          <div className="absolute inset-0 flex items-center justify-center">
                            <span className="text-6xl font-bold text-white drop-shadow-lg">
                              {captureCountdown}
                            </span>
                          </div>
                        )}
                      </div>
                      
                      {/* Texto de instrução */}
                      <div className="absolute bottom-32 text-center">
                        <p className="text-white font-bold text-lg drop-shadow-lg whitespace-nowrap px-4 py-2 bg-black/50 rounded">
                          {modelsLoaded 
                            ? (faceDetected ? 'Rosto detectado! Mantenha a posição' : 'Posicione seu rosto no círculo')
                            : 'Posicione seu rosto no círculo'}
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {isCapturing && (
                    <>
                      {/* Indicador LIVE */}
                      <div className="absolute top-2 left-2 bg-red-500 text-white px-2 py-1 rounded text-xs font-bold">
                        ● LIVE
                      </div>
                      
                      {/* Status da detecção facial */}
                      <div className="absolute top-2 right-2 space-y-1">
                        {modelsLoaded && (
                          <div className="bg-green-500 text-white px-2 py-1 rounded text-xs">
                            ✓ Face-API
                          </div>
                        )}
                        {isFaceDetectionActive && (
                          <div className={`px-2 py-1 rounded text-xs ${
                            faceDetected ? 'bg-green-500 text-white' : 'bg-yellow-500 text-black'
                          }`}>
                            {faceDetected ? '✓ Rosto OK' : '⚠ Posicione'}
                          </div>
                        )}
                        {captureCountdown > 0 && (
                          <div className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-bold">
                            📸 {captureCountdown}s
                          </div>
                        )}
                      </div>
                      
                      {/* Aviso de erro */}
                      {videoError && (
                        <div className="absolute bottom-2 left-2 right-2 bg-red-500/90 text-white px-3 py-2 rounded text-sm font-medium">
                          ⚠️ {videoError}
                        </div>
                      )}
                    </>
                  )}
                  
                  {!isCapturing && capturedImage && (
                    <img
                      src={capturedImage}
                      alt="Captured"
                      className="w-full h-full object-cover absolute inset-0"
                    />
                  )}
                  
                  {!isCapturing && !capturedImage && (
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
                      <Button 
                        onClick={captureImage} 
                        className="flex-1"
                        disabled={autoCapture && !faceDetected}
                      >
                        {autoCapture ? (faceDetected ? 'Capturando...' : 'Posicione o rosto') : 'Capturar Foto'}
                      </Button>
                      <Button 
                        onClick={() => {
                          const newAutoCapture = !autoCapture;
                          setAutoCapture(newAutoCapture);
                          if (newAutoCapture) {
                            console.log('[AUTO-CAPTURE] Modo automático ativado');
                            // Ativar detecção facial se disponível
                            if (modelsLoaded) {
                              setIsFaceDetectionActive(true);
                            }
                            
                            // Forçar desenho imediato do overlay
                            if (overlayCanvasRef.current) {
                              const ctx = overlayCanvasRef.current.getContext('2d');
                              if (ctx) {
                                console.log('[AUTO-CAPTURE] Forçando desenho inicial do aro');
                                drawFaceGuide(ctx, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
                              }
                            }
                          } else {
                            console.log('[AUTO-CAPTURE] Modo manual ativado');
                            setIsFaceDetectionActive(false);
                            setCaptureCountdown(0);
                            
                            // Limpar overlay
                            if (overlayCanvasRef.current) {
                              const ctx = overlayCanvasRef.current.getContext('2d');
                              if (ctx) {
                                ctx.clearRect(0, 0, overlayCanvasRef.current.width, overlayCanvasRef.current.height);
                              }
                            }
                          }
                        }}
                        variant={autoCapture ? "default" : "outline"}
                        size="sm"
                      >
                        {autoCapture ? '🤖 Auto' : '👤 Manual'}
                      </Button>
                      <Button 
                        onClick={forcePlay} 
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