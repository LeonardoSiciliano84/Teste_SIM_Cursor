import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ArrowLeft, 
  Edit, 
  Download, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  FileText,
  User,
  Building,
  CreditCard
} from "lucide-react";
import { type Employee } from "@shared/schema";

export function EmployeeDetailsPage() {
  const { id } = useParams();
  const [, setLocation] = useLocation();
  const [activeTab, setActiveTab] = useState("overview");

  const { data: employee, isLoading } = useQuery<Employee>({
    queryKey: ["/api/employees", id],
    enabled: !!id,
  });

  const handleEdit = () => {
    setLocation(`/employees/edit/${id}`);
  };

  const generatePDF = async () => {
    try {
      const response = await fetch(`/api/employees/${id}/pdf`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ficha-${employee?.fullName.replace(/\s+/g, '-')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-felka-blue mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando dados do colaborador...</p>
        </div>
      </div>
    );
  }

  if (!employee) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900">Colaborador não encontrado</h2>
          <p className="text-gray-600 mt-2">O colaborador solicitado não existe ou foi removido.</p>
          <Button onClick={() => setLocation("/employees")} className="mt-4">
            Voltar para Lista
          </Button>
        </div>
      </div>
    );
  }

  const getStatusBadge = (status: string) => {
    if (status === "active") {
      return <Badge className="bg-green-100 text-green-800">Ativo</Badge>;
    }
    return <Badge variant="secondary">Inativo</Badge>;
  };

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button variant="ghost" onClick={() => setLocation("/employees")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{employee.fullName}</h1>
            <p className="text-gray-600">{employee.position} - {employee.department}</p>
          </div>
          {getStatusBadge(employee.status)}
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={generatePDF}>
            <Download className="w-4 h-4 mr-2" />
            Gerar PDF
          </Button>
          <Button onClick={handleEdit} style={{ backgroundColor: '#0C29AB', color: 'white' }}>
            <Edit className="w-4 h-4 mr-2" />
            Editar
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="personal">Dados Pessoais</TabsTrigger>
          <TabsTrigger value="professional">Profissionais</TabsTrigger>
          <TabsTrigger value="documents">Documentos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Informações Básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <User className="w-5 h-5" />
                  Informações Básicas
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Nome Completo</span>
                  <p className="font-medium">{employee.fullName}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">CPF</span>
                  <p className="font-medium">{employee.cpf}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Matrícula</span>
                  <p className="font-medium">#{employee.employeeNumber}</p>
                </div>
                {employee.birthDate && (
                  <div>
                    <span className="text-sm text-gray-600">Data de Nascimento</span>
                    <p className="font-medium">{new Date(employee.birthDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Telefone</span>
                  <p className="font-medium">{employee.phone}</p>
                </div>
                {employee.email && (
                  <div>
                    <span className="text-sm text-gray-600">E-mail Corporativo</span>
                    <p className="font-medium">{employee.email}</p>
                  </div>
                )}
                {employee.personalEmail && (
                  <div>
                    <span className="text-sm text-gray-600">E-mail Pessoal</span>
                    <p className="font-medium">{employee.personalEmail}</p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Informações Profissionais */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building className="w-5 h-5" />
                  Profissional
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <span className="text-sm text-gray-600">Cargo</span>
                  <p className="font-medium">{employee.position}</p>
                </div>
                <div>
                  <span className="text-sm text-gray-600">Departamento</span>
                  <p className="font-medium">{employee.department}</p>
                </div>
                {employee.admissionDate && (
                  <div>
                    <span className="text-sm text-gray-600">Data de Admissão</span>
                    <p className="font-medium">{new Date(employee.admissionDate).toLocaleDateString('pt-BR')}</p>
                  </div>
                )}
                {employee.salary && (
                  <div>
                    <span className="text-sm text-gray-600">Salário</span>
                    <p className="font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(Number(employee.salary))}
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="personal" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Dados Pessoais Completos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Nome Completo</label>
                    <p className="text-sm mt-1">{employee.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">CPF</label>
                    <p className="text-sm mt-1">{employee.cpf}</p>
                  </div>
                  {employee.rg && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">RG</label>
                      <p className="text-sm mt-1">{employee.rg}</p>
                    </div>
                  )}
                  {employee.birthDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Nascimento</label>
                      <p className="text-sm mt-1">{new Date(employee.birthDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                  {employee.gender && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gênero</label>
                      <p className="text-sm mt-1">{employee.gender}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {employee.maritalStatus && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Estado Civil</label>
                      <p className="text-sm mt-1">{employee.maritalStatus}</p>
                    </div>
                  )}
                  {employee.address && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Endereço</label>
                      <p className="text-sm mt-1">{employee.address}</p>
                    </div>
                  )}
                  {employee.city && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Cidade</label>
                      <p className="text-sm mt-1">{employee.city} - {employee.state}</p>
                    </div>
                  )}
                  {employee.zipCode && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">CEP</label>
                      <p className="text-sm mt-1">{employee.zipCode}</p>
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="professional" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Informações Profissionais</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Matrícula</label>
                    <p className="text-sm mt-1">#{employee.employeeNumber}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Cargo</label>
                    <p className="text-sm mt-1">{employee.position}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Departamento</label>
                    <p className="text-sm mt-1">{employee.department}</p>
                  </div>
                  {employee.admissionDate && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Data de Admissão</label>
                      <p className="text-sm mt-1">{new Date(employee.admissionDate).toLocaleDateString('pt-BR')}</p>
                    </div>
                  )}
                </div>
                <div className="space-y-4">
                  {employee.manager && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Gestor</label>
                      <p className="text-sm mt-1">{employee.manager}</p>
                    </div>
                  )}
                  {employee.workSchedule && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Horário de Trabalho</label>
                      <p className="text-sm mt-1">{employee.workSchedule}</p>
                    </div>
                  )}
                  {employee.salary && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Salário</label>
                      <p className="text-sm mt-1">
                        {new Intl.NumberFormat('pt-BR', {
                          style: 'currency',
                          currency: 'BRL'
                        }).format(Number(employee.salary))}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Status</label>
                    <p className="text-sm mt-1">{getStatusBadge(employee.status)}</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Documentos e Arquivos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-gray-500">
                <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                <p>Nenhum documento anexado</p>
                <p className="text-sm">Os documentos do colaborador aparecerão aqui</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}