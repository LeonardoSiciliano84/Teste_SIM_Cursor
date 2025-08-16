import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  FileText, 
  Calendar, 
  User, 
  Filter,
  Download,
  Eye,
  Search,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useLocation } from "wouter";

const occurrenceTypes = [
  { value: "verbal_warning", label: "Advertência Verbal", color: "yellow" },
  { value: "written_warning", label: "Advertência Escrita", color: "orange" },
  { value: "suspension", label: "Suspensão", color: "red" },
  { value: "absence_record", label: "Registro de Faltas", color: "blue" },
  { value: "medical_certificate", label: "Entrega de Atestado", color: "green" },
  { value: "disciplinary_action", label: "Ação Disciplinar", color: "purple" },
  { value: "performance_evaluation", label: "Avaliação de Desempenho", color: "gray" }
];

export function OccurrencesPage() {
  const [, setLocation] = useLocation();
  const [searchTerm, setSearchTerm] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [severityFilter, setSeverityFilter] = useState("all");

  // Buscar todas as ocorrências
  const { data: allOccurrences = [], isLoading } = useQuery({
    queryKey: ["/api/occurrences/all"],
  });

  // Buscar lista de colaboradores para mapear nomes
  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  const getEmployeeName = (employeeId: string) => {
    const employee = employees.find((emp: any) => emp.id === employeeId);
    return employee ? employee.fullName : "Colaborador não encontrado";
  };

  const getOccurrenceTypeInfo = (type: string) => {
    return occurrenceTypes.find(t => t.value === type) || { label: type, color: "gray" };
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "high": return "destructive";
      case "medium": return "default";
      case "low": return "secondary";
      default: return "default";
    }
  };

  const getSeverityLabel = (severity: string) => {
    switch (severity) {
      case "high": return "Alta";
      case "medium": return "Média";
      case "low": return "Baixa";
      default: return "Média";
    }
  };

  // Filtrar ocorrências
  const filteredOccurrences = allOccurrences.filter((occurrence: any) => {
    const employeeName = getEmployeeName(occurrence.employeeId).toLowerCase();
    const matchesSearch = searchTerm === "" || 
      employeeName.includes(searchTerm.toLowerCase()) ||
      occurrence.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      occurrence.description.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesType = typeFilter === "all" || occurrence.occurrenceType === typeFilter;
    const matchesSeverity = severityFilter === "all" || (occurrence as any).severity === severityFilter;
    
    return matchesSearch && matchesType && matchesSeverity;
  });

  const generateFullReport = async () => {
    try {
      const response = await fetch('/api/occurrences/report');
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `relatorio-ocorrencias-${format(new Date(), 'yyyy-MM-dd')}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
    }
  };

  const generateOccurrenceDocument = async (employeeId: string, occurrenceId: string) => {
    try {
      const response = await fetch(`/api/employees/${employeeId}/occurrences/${occurrenceId}/document`);
      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `ocorrencia_${occurrenceId}.pdf`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }
    } catch (error) {
      console.error('Erro ao gerar documento:', error);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Carregando ocorrências...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestão de Ocorrências</h1>
          <p className="text-gray-600">Histórico completo de ocorrências dos colaboradores</p>
        </div>
        <div className="flex gap-3">
          <Button
            variant="outline"
            onClick={generateFullReport}
          >
            <Download className="w-4 h-4 mr-2" />
            Relatório Completo
          </Button>
          <Button 
            onClick={() => setLocation("/employees")}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <User className="w-4 h-4 mr-2" />
            Gerenciar Colaboradores
          </Button>
        </div>
      </div>

      {/* Filtros */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="w-5 h-5" />
            Filtros
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por colaborador, título ou descrição..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Tipo de Ocorrência" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Tipos</SelectItem>
                {occurrenceTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={severityFilter} onValueChange={setSeverityFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Gravidade" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas as Gravidades</SelectItem>
                <SelectItem value="high">Alta</SelectItem>
                <SelectItem value="medium">Média</SelectItem>
                <SelectItem value="low">Baixa</SelectItem>
              </SelectContent>
            </Select>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchTerm("");
                setTypeFilter("all");
                setSeverityFilter("all");
              }}
            >
              Limpar Filtros
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Ocorrências</p>
                <p className="text-2xl font-bold text-gray-900">{allOccurrences.length}</p>
              </div>
              <FileText className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Alta Gravidade</p>
                <p className="text-2xl font-bold text-red-600">
                  {allOccurrences.filter((o: any) => (o as any).severity === "high").length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Este Mês</p>
                <p className="text-2xl font-bold text-gray-900">
                  {allOccurrences.filter((o: any) => {
                    const occurrenceDate = new Date(o.occurrenceDate);
                    const now = new Date();
                    return occurrenceDate.getMonth() === now.getMonth() && 
                           occurrenceDate.getFullYear() === now.getFullYear();
                  }).length}
                </p>
              </div>
              <Calendar className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Colaboradores Afetados</p>
                <p className="text-2xl font-bold text-gray-900">
                  {new Set(allOccurrences.map((o: any) => o.employeeId)).size}
                </p>
              </div>
              <User className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista de Ocorrências */}
      <div className="space-y-4">
        {filteredOccurrences.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchTerm || typeFilter !== "all" || severityFilter !== "all" 
                  ? "Nenhuma ocorrência encontrada" 
                  : "Nenhuma ocorrência registrada"
                }
              </h3>
              <p className="text-gray-600 text-center">
                {searchTerm || typeFilter !== "all" || severityFilter !== "all"
                  ? "Tente ajustar os filtros para encontrar ocorrências."
                  : "Ainda não há ocorrências registradas no sistema."
                }
              </p>
            </CardContent>
          </Card>
        ) : (
          filteredOccurrences.map((occurrence: any) => {
            const typeInfo = getOccurrenceTypeInfo(occurrence.occurrenceType);
            const employeeName = getEmployeeName(occurrence.employeeId);
            
            return (
              <Card key={occurrence.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{occurrence.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {employeeName}
                        </div>
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(occurrence.occurrenceDate), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          Solicitante: {occurrence.requestedById}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor((occurrence as any).severity || "medium")}>
                        {getSeverityLabel((occurrence as any).severity || "medium")}
                      </Badge>
                      <Badge variant="outline" className={`border-${typeInfo.color}-500 text-${typeInfo.color}-700`}>
                        {typeInfo.label}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-700 mb-4">{occurrence.description}</p>
                  
                  {(occurrence as any).actionRequired && (
                    <div className="bg-yellow-50 p-3 rounded-lg mb-4">
                      <div className="flex items-start">
                        <AlertTriangle className="h-4 w-4 text-yellow-600 mr-2 mt-0.5" />
                        <div>
                          <p className="text-sm font-medium text-yellow-800">Ação Requerida:</p>
                          <p className="text-sm text-yellow-700">{(occurrence as any).actionRequired}</p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="flex justify-between items-center">
                    <div className="text-sm text-gray-600">
                      Registrado em: {format(new Date(occurrence.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generateOccurrenceDocument(occurrence.employeeId, occurrence.id)}
                      >
                        <Download className="h-4 w-4 mr-1" />
                        Documento
                      </Button>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => setLocation(`/employees/${occurrence.employeeId}`)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver Colaborador
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}