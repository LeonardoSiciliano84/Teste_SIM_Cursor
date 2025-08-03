import { useState, useCallback, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { 
  Camera, 
  CheckCircle, 
  XCircle, 
  AlertTriangle, 
  Info,
  Monitor,
  Smartphone,
  Globe
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface DiagnosticResult {
  test: string;
  status: 'success' | 'warning' | 'error' | 'pending';
  message: string;
  details?: string;
  value?: any;
}

interface DeviceInfo {
  deviceId: string;
  label: string;
  kind: string;
  groupId: string;
  capabilities?: MediaTrackCapabilities;
}

export function CameraDiagnostic() {
  const [isRunning, setIsRunning] = useState(false);
  const [progress, setProgress] = useState(0);
  const [results, setResults] = useState<DiagnosticResult[]>([]);
  const [deviceInfo, setDeviceInfo] = useState<DeviceInfo[]>([]);
  const [browserInfo, setBrowserInfo] = useState<any>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const { toast } = useToast();

  const addResult = useCallback((result: DiagnosticResult) => {
    setResults(prev => [...prev, result]);
  }, []);

  const updateProgress = useCallback((value: number) => {
    setProgress(value);
  }, []);

  const getBrowserInfo = () => {
    const userAgent = navigator.userAgent;
    const browserInfo = {
      userAgent,
      cookieEnabled: navigator.cookieEnabled,
      language: navigator.language,
      platform: navigator.platform,
      onLine: navigator.onLine,
      hardwareConcurrency: navigator.hardwareConcurrency,
      deviceMemory: (navigator as any).deviceMemory,
      connection: (navigator as any).connection?.effectiveType,
      touchSupport: 'ontouchstart' in window,
      screenResolution: `${screen.width}x${screen.height}`,
      colorDepth: screen.colorDepth,
      pixelRatio: window.devicePixelRatio,
    };

    // Detectar navegador
    let browserName = 'Unknown';
    let browserVersion = 'Unknown';
    
    if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
      browserName = 'Chrome';
      const match = userAgent.match(/Chrome\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Firefox')) {
      browserName = 'Firefox';
      const match = userAgent.match(/Firefox\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
      browserName = 'Safari';
      const match = userAgent.match(/Version\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    } else if (userAgent.includes('Edg')) {
      browserName = 'Edge';
      const match = userAgent.match(/Edg\/(\d+)/);
      browserVersion = match ? match[1] : 'Unknown';
    }

    return { ...browserInfo, browserName, browserVersion };
  };

  const testMediaDevicesSupport = async () => {
    addResult({
      test: "Suporte MediaDevices API",
      status: 'pending',
      message: "Verificando suporte à API MediaDevices..."
    });

    if (!navigator.mediaDevices) {
      addResult({
        test: "Suporte MediaDevices API",
        status: 'error',
        message: "MediaDevices API não suportada",
        details: "Navegador não suporte a API moderna de mídia"
      });
      return false;
    }

    if (!navigator.mediaDevices.getUserMedia) {
      addResult({
        test: "Suporte MediaDevices API",
        status: 'error',
        message: "getUserMedia não suportado",
        details: "Função getUserMedia não está disponível"
      });
      return false;
    }

    addResult({
      test: "Suporte MediaDevices API",
      status: 'success',
      message: "MediaDevices API totalmente suportada"
    });
    return true;
  };

  const testDeviceEnumeration = async () => {
    addResult({
      test: "Enumeração de Dispositivos",
      status: 'pending',
      message: "Listando dispositivos de mídia disponíveis..."
    });

    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter(device => device.kind === 'videoinput');
      const audioDevices = devices.filter(device => device.kind === 'audioinput');
      
      const deviceList: DeviceInfo[] = devices.map(device => ({
        deviceId: device.deviceId,
        label: device.label || `${device.kind} (${device.deviceId.slice(0, 8)}...)`,
        kind: device.kind,
        groupId: device.groupId
      }));

      setDeviceInfo(deviceList);

      if (videoDevices.length === 0) {
        addResult({
          test: "Enumeração de Dispositivos",
          status: 'error',
          message: "Nenhuma câmera encontrada",
          details: `Encontrados ${audioDevices.length} dispositivos de áudio, mas nenhuma câmera`
        });
        return false;
      }

      addResult({
        test: "Enumeração de Dispositivos",
        status: 'success',
        message: `${videoDevices.length} câmera(s) encontrada(s)`,
        details: `Total: ${devices.length} dispositivos (${videoDevices.length} câmeras, ${audioDevices.length} microfones)`,
        value: { videoDevices: videoDevices.length, audioDevices: audioDevices.length, total: devices.length }
      });
      return true;
    } catch (error) {
      addResult({
        test: "Enumeração de Dispositivos",
        status: 'error',
        message: "Erro ao listar dispositivos",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
      return false;
    }
  };

  const testCameraAccess = async () => {
    addResult({
      test: "Acesso à Câmera",
      status: 'pending',
      message: "Testando acesso básico à câmera..."
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: true,
        audio: false 
      });

      const videoTrack = stream.getVideoTracks()[0];
      const settings = videoTrack.getSettings();
      const capabilities = videoTrack.getCapabilities?.();

      addResult({
        test: "Acesso à Câmera",
        status: 'success',
        message: "Acesso à câmera concedido",
        details: `Resolução: ${settings.width}x${settings.height}, Frame rate: ${settings.frameRate}fps`,
        value: { settings, capabilities }
      });

      // Parar o stream
      stream.getTracks().forEach(track => track.stop());
      return true;
    } catch (error) {
      let status: 'error' | 'warning' = 'error';
      let message = "Erro ao acessar câmera";
      let details = "";

      if (error instanceof Error) {
        switch (error.name) {
          case 'NotAllowedError':
            message = "Permissão negada";
            details = "Usuário negou acesso à câmera ou política de segurança bloqueia acesso";
            status = 'warning';
            break;
          case 'NotFoundError':
            message = "Câmera não encontrada";
            details = "Nenhum dispositivo de vídeo disponível";
            break;
          case 'NotReadableError':
            message = "Câmera em uso";
            details = "Dispositivo já está sendo usado por outro aplicativo";
            status = 'warning';
            break;
          case 'OverconstrainedError':
            message = "Restrições não suportadas";
            details = "Configurações solicitadas não são suportadas pelo dispositivo";
            break;
          default:
            details = error.message;
        }
      }

      addResult({
        test: "Acesso à Câmera",
        status,
        message,
        details
      });
      return status === 'warning';
    }
  };

  const testVideoPlayback = async () => {
    addResult({
      test: "Reprodução de Vídeo",
      status: 'pending',
      message: "Testando reprodução de vídeo em tempo real..."
    });

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ 
        video: { width: 640, height: 480 },
        audio: false 
      });

      if (!videoRef.current) {
        throw new Error("Elemento de vídeo não disponível");
      }

      videoRef.current.srcObject = stream;
      
      await new Promise((resolve, reject) => {
        if (!videoRef.current) {
          reject(new Error("Elemento de vídeo perdido"));
          return;
        }

        const timeout = setTimeout(() => {
          reject(new Error("Timeout na reprodução"));
        }, 5000);

        videoRef.current.onloadedmetadata = () => {
          clearTimeout(timeout);
          if (videoRef.current) {
            videoRef.current.play().then(resolve).catch(reject);
          }
        };

        videoRef.current.onerror = (e) => {
          clearTimeout(timeout);
          reject(new Error("Erro no elemento de vídeo"));
        };
      });

      const videoElement = videoRef.current;
      const videoWidth = videoElement.videoWidth;
      const videoHeight = videoElement.videoHeight;

      addResult({
        test: "Reprodução de Vídeo",
        status: 'success',
        message: "Vídeo reproduzindo corretamente",
        details: `Dimensões do vídeo: ${videoWidth}x${videoHeight}`,
        value: { width: videoWidth, height: videoHeight }
      });

      // Parar o stream
      stream.getTracks().forEach(track => track.stop());
      videoElement.srcObject = null;
      return true;
    } catch (error) {
      addResult({
        test: "Reprodução de Vídeo",
        status: 'error',
        message: "Erro na reprodução de vídeo",
        details: error instanceof Error ? error.message : "Erro desconhecido"
      });
      return false;
    }
  };

  const testResolutionSupport = async () => {
    addResult({
      test: "Suporte a Resoluções",
      status: 'pending',
      message: "Testando diferentes resoluções de vídeo..."
    });

    const resolutions = [
      { name: "QVGA", width: 320, height: 240 },
      { name: "VGA", width: 640, height: 480 },
      { name: "HD", width: 1280, height: 720 },
      { name: "Full HD", width: 1920, height: 1080 }
    ];

    const supportedResolutions: any[] = [];
    
    for (const res of resolutions) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: {
            width: { exact: res.width },
            height: { exact: res.height }
          }
        });
        
        supportedResolutions.push(res);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        // Resolução não suportada
      }
    }

    if (supportedResolutions.length === 0) {
      addResult({
        test: "Suporte a Resoluções",
        status: 'warning',
        message: "Nenhuma resolução padrão suportada",
        details: "Dispositivo pode suportar apenas resoluções personalizadas"
      });
    } else {
      addResult({
        test: "Suporte a Resoluções",
        status: 'success',
        message: `${supportedResolutions.length} resoluções suportadas`,
        details: supportedResolutions.map(r => r.name).join(", "),
        value: supportedResolutions
      });
    }

    return supportedResolutions.length > 0;
  };

  const testConstraintsSupport = async () => {
    addResult({
      test: "Suporte a Restrições",
      status: 'pending',
      message: "Testando suporte a restrições avançadas..."
    });

    const constraints = [
      { name: "facingMode", constraint: { video: { facingMode: "user" } } },
      { name: "frameRate", constraint: { video: { frameRate: { min: 15 } } } },
      { name: "aspectRatio", constraint: { video: { aspectRatio: 16/9 } } }
    ];

    const supportedConstraints: string[] = [];
    
    for (const { name, constraint } of constraints) {
      try {
        const stream = await navigator.mediaDevices.getUserMedia(constraint);
        supportedConstraints.push(name);
        stream.getTracks().forEach(track => track.stop());
      } catch (error) {
        // Restrição não suportada
      }
    }

    addResult({
      test: "Suporte a Restrições",
      status: supportedConstraints.length > 0 ? 'success' : 'warning',
      message: `${supportedConstraints.length} restrições suportadas`,
      details: supportedConstraints.length > 0 ? supportedConstraints.join(", ") : "Apenas restrições básicas suportadas",
      value: supportedConstraints
    });

    return true;
  };

  const runDiagnostic = async () => {
    setIsRunning(true);
    setProgress(0);
    setResults([]);
    
    try {
      // Coletar informações do navegador
      setBrowserInfo(getBrowserInfo());
      
      const tests = [
        testMediaDevicesSupport,
        testDeviceEnumeration,
        testCameraAccess,
        testVideoPlayback,
        testResolutionSupport,
        testConstraintsSupport
      ];

      for (let i = 0; i < tests.length; i++) {
        await tests[i]();
        updateProgress(((i + 1) / tests.length) * 100);
        // Pequena pausa entre testes
        await new Promise(resolve => setTimeout(resolve, 500));
      }

      toast({
        title: "Diagnóstico Completo",
        description: "Todos os testes de compatibilidade foram executados"
      });

    } catch (error) {
      toast({
        title: "Erro no Diagnóstico",
        description: "Ocorreu um erro durante a execução dos testes",
        variant: "destructive"
      });
    } finally {
      setIsRunning(false);
      updateProgress(100);
    }
  };

  const getStatusIcon = (status: DiagnosticResult['status']) => {
    switch (status) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />;
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />;
      default:
        return <Info className="h-4 w-4 text-blue-500" />;
    }
  };

  const getStatusBadge = (status: DiagnosticResult['status']) => {
    const variants = {
      success: "default",
      warning: "secondary",
      error: "destructive",
      pending: "outline"
    } as const;

    return (
      <Badge variant={variants[status]} className="ml-2">
        {status === 'success' ? 'OK' : 
         status === 'warning' ? 'AVISO' : 
         status === 'error' ? 'ERRO' : 'TESTANDO'}
      </Badge>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Monitor className="h-5 w-5" />
            Diagnóstico de Compatibilidade da Câmera
          </CardTitle>
          <CardDescription>
            Ferramenta abrangente para testar compatibilidade da câmera entre diferentes navegadores e dispositivos
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              onClick={runDiagnostic} 
              disabled={isRunning}
              className="flex-1"
            >
              <Camera className="h-4 w-4 mr-2" />
              {isRunning ? "Executando Diagnóstico..." : "Iniciar Diagnóstico"}
            </Button>
          </div>

          {isRunning && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Progresso</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Elemento de vídeo oculto para testes */}
          <video 
            ref={videoRef} 
            className="hidden" 
            autoPlay 
            muted 
            playsInline 
          />
        </CardContent>
      </Card>

      {/* Informações do Navegador */}
      {browserInfo && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Informações do Navegador
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
              <div>
                <strong>Navegador:</strong> {browserInfo.browserName} {browserInfo.browserVersion}
              </div>
              <div>
                <strong>Plataforma:</strong> {browserInfo.platform}
              </div>
              <div>
                <strong>Resolução:</strong> {browserInfo.screenResolution}
              </div>
              <div>
                <strong>Pixel Ratio:</strong> {browserInfo.pixelRatio}
              </div>
              <div>
                <strong>Touch:</strong> {browserInfo.touchSupport ? 'Sim' : 'Não'}
              </div>
              <div>
                <strong>Conexão:</strong> {browserInfo.connection || 'Desconhecida'}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resultados dos Testes */}
      {results.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultados dos Testes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {results.map((result, index) => (
              <div key={index} className="border rounded-lg p-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {getStatusIcon(result.status)}
                    <span className="font-medium">{result.test}</span>
                    {getStatusBadge(result.status)}
                  </div>
                </div>
                <p className="text-sm text-gray-600 mt-1">{result.message}</p>
                {result.details && (
                  <p className="text-xs text-gray-500 mt-1">{result.details}</p>
                )}
                {result.value && (
                  <details className="text-xs text-gray-400 mt-2">
                    <summary className="cursor-pointer">Detalhes técnicos</summary>
                    <pre className="mt-1 p-2 bg-gray-50 rounded text-xs overflow-auto">
                      {JSON.stringify(result.value, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Dispositivos Encontrados */}
      {deviceInfo.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Smartphone className="h-5 w-5" />
              Dispositivos Detectados
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {deviceInfo.map((device, index) => (
                <div key={index} className="flex items-center justify-between p-2 border rounded">
                  <div>
                    <span className="font-medium">{device.label}</span>
                    <Badge variant="outline" className="ml-2">
                      {device.kind === 'videoinput' ? 'Câmera' : 
                       device.kind === 'audioinput' ? 'Microfone' : device.kind}
                    </Badge>
                  </div>
                  <code className="text-xs text-gray-500">
                    {device.deviceId.slice(0, 8)}...
                  </code>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Recomendações */}
      <Alert>
        <Info className="h-4 w-4" />
        <AlertDescription>
          <strong>Dicas:</strong> Para melhor compatibilidade, use Chrome ou Firefox atualizados. 
          Certifique-se de que as permissões de câmera estão habilitadas e que nenhum outro 
          aplicativo está usando a câmera.
        </AlertDescription>
      </Alert>
    </div>
  );
}