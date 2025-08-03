import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { QrCode, User, Users, Clock, CheckCircle, XCircle, Search, UserPlus } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  type Visitor, 
  type AccessLog,
  type Employee
} from "@shared/schema";

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

  const { toast } = useToast();
  const queryClient = useQueryClient();

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
      const response = await apiRequest(`/api/access-control/visitors/search?cpf=${cpf}`);
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
          cpf: cpf,
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
      return await apiRequest("/api/access-control/visitors", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
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
    mutationFn: async (data: { qrCode: string; direction: "entry" | "exit" }) => {
      return await apiRequest("/api/access-control/qrcode", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" }
      });
    },
    onSuccess: (data) => {
      toast({
        title: "Acesso registrado",
        description: `${data.employee.fullName} - ${accessDirection === "entry" ? "Entrada" : "Saída"}`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/access-control/logs"] });
      setQrCodeValue("");
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "QR Code inválido ou funcionário não encontrado",
        variant: "destructive",
      });
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
      processQrCodeMutation.mutate({
        qrCode: qrCodeValue,
        direction: accessDirection,
      });
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
          <TabsTrigger value="qrcode">QR Code</TabsTrigger>
        </TabsList>

        <TabsContent value="visitors" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                      onChange={(e) => setVisitorCpf(e.target.value)}
                      placeholder="000.000.000-00"
                      maxLength={14}
                    />
                    <Button 
                      onClick={handleVisitorSearch}
                      disabled={searchVisitorMutation.isPending}
                    >
                      Buscar
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
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
                    onChange={(e) => setVisitorForm({ ...visitorForm, cpf: e.target.value })}
                    placeholder="000.000.000-00"
                    maxLength={14}
                  />
                </div>

                <div>
                  <Label htmlFor="visitorPhoto">Foto (Base64 ou URL)</Label>
                  <Input
                    id="visitorPhoto"
                    value={visitorForm.photo}
                    onChange={(e) => setVisitorForm({ ...visitorForm, photo: e.target.value })}
                    placeholder="URL da foto ou dados base64"
                  />
                </div>

                <Button 
                  onClick={handleVisitorRegister}
                  disabled={!visitorForm.name || !visitorForm.cpf || registerVisitorMutation.isPending}
                  className="w-full"
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
          <Card>
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
                <Label htmlFor="qrCodeValue">Código QR</Label>
                <div className="flex gap-2">
                  <Input
                    id="qrCodeValue"
                    value={qrCodeValue}
                    onChange={(e) => setQrCodeValue(e.target.value)}
                    placeholder="Cole ou digite o código QR aqui"
                  />
                  <Button 
                    onClick={handleQrCodeProcess}
                    disabled={!qrCodeValue || processQrCodeMutation.isPending}
                  >
                    Processar
                  </Button>
                </div>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600">
                  <strong>Instruções:</strong>
                  <br />
                  1. Selecione o tipo de acesso (Entrada ou Saída)
                  <br />
                  2. Escaneie o QR Code do funcionário ou cole o código
                  <br />
                  3. Clique em "Processar" para registrar o acesso
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
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}