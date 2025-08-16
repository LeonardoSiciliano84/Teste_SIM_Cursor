import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { 
  Plus, 
  FileText, 
  Calendar, 
  User, 
  AlertTriangle, 
  Clock, 
  Download,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { EmployeeOccurrence } from "@shared/schema";

const occurrenceTypes = [
  { value: "verbal_warning", label: "Advertência Verbal", color: "yellow" },
  { value: "written_warning", label: "Advertência Escrita", color: "orange" },
  { value: "suspension", label: "Suspensão", color: "red" },
  { value: "absence_record", label: "Registro de Faltas", color: "blue" },
  { value: "medical_certificate", label: "Entrega de Atestado", color: "green" },
  { value: "disciplinary_action", label: "Ação Disciplinar", color: "purple" },
  { value: "performance_evaluation", label: "Avaliação de Desempenho", color: "gray" }
];

const occurrenceFormSchema = z.object({
  title: z.string().min(1, "Título é obrigatório"),
  occurrenceType: z.string().min(1, "Tipo de ocorrência é obrigatório"),
  description: z.string().min(10, "Descrição deve ter pelo menos 10 caracteres"),
  occurrenceDate: z.string().min(1, "Data da ocorrência é obrigatória"),
  requestedById: z.string().min(1, "Gestor solicitante é obrigatório"),
  severity: z.enum(["low", "medium", "high"]).optional(),
  actionRequired: z.string().optional(),
  followUpDate: z.string().optional(),
  witnesses: z.string().optional(),
  attachments: z.string().optional(),
});

type OccurrenceFormData = z.infer<typeof occurrenceFormSchema>;

interface OccurrenceManagementProps {
  employeeId: string;
  employeeName: string;
}

export function OccurrenceManagement({ employeeId, employeeName }: OccurrenceManagementProps) {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [selectedOccurrence, setSelectedOccurrence] = useState<EmployeeOccurrence | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<OccurrenceFormData>({
    resolver: zodResolver(occurrenceFormSchema),
    defaultValues: {
      title: "",
      occurrenceType: "",
      description: "",
      occurrenceDate: format(new Date(), "yyyy-MM-dd"),
      requestedById: "",
      severity: "medium",
      actionRequired: "",
      followUpDate: "",
      witnesses: "",
      attachments: "",
    },
  });

  // Buscar ocorrências do colaborador
  const { data: occurrences = [], isLoading } = useQuery({
    queryKey: ["/api/employees", employeeId, "occurrences"],
    enabled: !!employeeId,
  });

  // Buscar lista de gestores/usuários para o campo solicitante
  const { data: managers = [] } = useQuery({
    queryKey: ["/api/users", "managers"],
  });

  // Mutation para criar nova ocorrência
  const createOccurrenceMutation = useMutation({
    mutationFn: async (data: OccurrenceFormData) => {
      const response = await fetch(`/api/employees/${employeeId}/occurrences`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...data,
          employeeId,
          status: "active",
        }),
      });
      if (!response.ok) {
        throw new Error("Erro ao criar ocorrência");
      }
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Ocorrência registrada com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "occurrences"] });
      setIsDialogOpen(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao registrar ocorrência",
        variant: "destructive",
      });
    },
  });

  // Função para gerar documento da ocorrência
  const generateDocument = async (occurrenceId: string) => {
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
        
        toast({
          title: "Sucesso",
          description: "Documento gerado com sucesso",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro ao gerar documento",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: OccurrenceFormData) => {
    createOccurrenceMutation.mutate(data);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header com botão de nova ocorrência */}
      <div className="flex justify-between items-center">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Ocorrências</h3>
          <p className="text-sm text-gray-600">Gestão de ocorrências e documentos do colaborador</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-blue-600 hover:bg-blue-700">
              <Plus className="h-4 w-4 mr-2" />
              Nova Ocorrência
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>Registrar Nova Ocorrência</DialogTitle>
              <p className="text-sm text-gray-600">Colaborador: {employeeName}</p>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Título da Ocorrência</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Advertência por atraso" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="occurrenceType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Ocorrência</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {occurrenceTypes.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                {type.label}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="occurrenceDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data da Ocorrência</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="requestedById"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gestor Solicitante</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome do gestor" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição Detalhada</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva detalhadamente a ocorrência..."
                          className="min-h-[100px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="severity"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Gravidade</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a gravidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="low">Baixa</SelectItem>
                            <SelectItem value="medium">Média</SelectItem>
                            <SelectItem value="high">Alta</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="followUpDate"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Data de Acompanhamento</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="actionRequired"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Ação Requerida</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva a ação ou medida a ser tomada..."
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="witnesses"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Testemunhas</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome das testemunhas (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex justify-end space-x-2 pt-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsDialogOpen(false)}
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={createOccurrenceMutation.isPending}
                    className="bg-blue-600 hover:bg-blue-700"
                  >
                    {createOccurrenceMutation.isPending ? "Salvando..." : "Registrar Ocorrência"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Lista de ocorrências */}
      <div className="space-y-4">
        {occurrences.length === 0 ? (
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12">
              <FileText className="h-12 w-12 text-gray-400 mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Nenhuma ocorrência registrada</h3>
              <p className="text-gray-600 text-center mb-4">
                Este colaborador ainda não possui ocorrências registradas.
              </p>
              <Button 
                onClick={() => setIsDialogOpen(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <Plus className="h-4 w-4 mr-2" />
                Registrar Primeira Ocorrência
              </Button>
            </CardContent>
          </Card>
        ) : (
          (occurrences as EmployeeOccurrence[]).map((occurrence: EmployeeOccurrence) => {
            const typeInfo = getOccurrenceTypeInfo(occurrence.occurrenceType);
            return (
              <Card key={occurrence.id} className="border border-gray-200">
                <CardHeader className="pb-3">
                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <CardTitle className="text-lg">{occurrence.title}</CardTitle>
                      <div className="flex items-center space-x-4 text-sm text-gray-600">
                        <div className="flex items-center">
                          <Calendar className="h-4 w-4 mr-1" />
                          {format(new Date(occurrence.occurrenceDate), "dd/MM/yyyy", { locale: ptBR })}
                        </div>
                        <div className="flex items-center">
                          <User className="h-4 w-4 mr-1" />
                          {occurrence.requestedById}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Badge variant={getSeverityColor((occurrence as any).severity || "medium")}>
                        {(occurrence as any).severity === "high" ? "Alta" : 
                         (occurrence as any).severity === "low" ? "Baixa" : "Média"}
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

                  {(occurrence as any).followUpDate && (
                    <div className="flex items-center text-sm text-gray-600 mb-4">
                      <Clock className="h-4 w-4 mr-1" />
                      Acompanhamento em: {format(new Date((occurrence as any).followUpDate), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                  )}

                  <div className="flex justify-end space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => generateDocument(occurrence.id)}
                    >
                      <Download className="h-4 w-4 mr-1" />
                      Gerar Documento
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedOccurrence(occurrence);
                        setViewDialogOpen(true);
                      }}
                    >
                      <Eye className="h-4 w-4 mr-1" />
                      Visualizar
                    </Button>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => {
                        setSelectedOccurrence(occurrence);
                        setEditDialogOpen(true);
                      }}
                    >
                      <Edit className="h-4 w-4 mr-1" />
                      Editar
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>

      {/* Modal de Visualização */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Ocorrência</DialogTitle>
          </DialogHeader>
          {selectedOccurrence && (
            <div className="space-y-6">
              {/* Header com tipo e data */}
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-lg font-semibold">{selectedOccurrence.title}</h3>
                  <div className="flex items-center space-x-4 text-sm text-gray-600 mt-2">
                    <div className="flex items-center">
                      <Calendar className="h-4 w-4 mr-1" />
                      {format(new Date(selectedOccurrence.occurrenceDate), "dd/MM/yyyy", { locale: ptBR })}
                    </div>
                    <div className="flex items-center">
                      <User className="h-4 w-4 mr-1" />
                      {selectedOccurrence.requestedById}
                    </div>
                  </div>
                </div>
                <div className="flex flex-col items-end space-y-2">
                  <Badge variant={getSeverityColor((selectedOccurrence as any).severity || "medium")}>
                    {(selectedOccurrence as any).severity === "high" ? "Alta" : 
                     (selectedOccurrence as any).severity === "low" ? "Baixa" : "Média"}
                  </Badge>
                  <Badge variant="outline" className={`border-${getOccurrenceTypeInfo(selectedOccurrence.occurrenceType).color}-500`}>
                    {getOccurrenceTypeInfo(selectedOccurrence.occurrenceType).label}
                  </Badge>
                </div>
              </div>

              {/* Descrição */}
              <div>
                <h4 className="font-medium text-gray-900 mb-2">Descrição</h4>
                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">{selectedOccurrence.description}</p>
              </div>

              {/* Ação Requerida */}
              {(selectedOccurrence as any).actionRequired && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Ação Requerida</h4>
                  <div className="bg-yellow-50 p-3 rounded-lg border border-yellow-200">
                    <p className="text-yellow-800">{(selectedOccurrence as any).actionRequired}</p>
                  </div>
                </div>
              )}

              {/* Data de Acompanhamento */}
              {(selectedOccurrence as any).followUpDate && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Data de Acompanhamento</h4>
                  <div className="flex items-center text-gray-600">
                    <Clock className="h-4 w-4 mr-2" />
                    {format(new Date((selectedOccurrence as any).followUpDate), "dd/MM/yyyy", { locale: ptBR })}
                  </div>
                </div>
              )}

              {/* Testemunhas */}
              {(selectedOccurrence as any).witnesses && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Testemunhas</h4>
                  <p className="text-gray-700">{(selectedOccurrence as any).witnesses}</p>
                </div>
              )}

              {/* Status e Assinaturas */}
              <div className="border-t pt-4">
                <h4 className="font-medium text-gray-900 mb-3">Status e Assinaturas</h4>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      selectedOccurrence.employeeSignature ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <User className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Colaborador</p>
                    <p className="text-xs text-gray-600">
                      {selectedOccurrence.employeeSignature ? 'Assinado' : 'Pendente'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      selectedOccurrence.managerSignature ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <User className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">Gestor</p>
                    <p className="text-xs text-gray-600">
                      {selectedOccurrence.managerSignature ? 'Assinado' : 'Pendente'}
                    </p>
                  </div>
                  <div className="text-center">
                    <div className={`w-12 h-12 mx-auto rounded-full flex items-center justify-center mb-2 ${
                      selectedOccurrence.hrSignature ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'
                    }`}>
                      <User className="h-6 w-6" />
                    </div>
                    <p className="text-sm font-medium">RH</p>
                    <p className="text-xs text-gray-600">
                      {selectedOccurrence.hrSignature ? 'Assinado' : 'Pendente'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Botões de ação */}
              <div className="flex justify-end space-x-2 pt-4 border-t">
                <Button
                  variant="outline"
                  onClick={() => generateDocument(selectedOccurrence.id)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Gerar PDF
                </Button>
                <Button
                  onClick={() => {
                    setViewDialogOpen(false);
                    setEditDialogOpen(true);
                  }}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={editDialogOpen} onOpenChange={setEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Ocorrência</DialogTitle>
          </DialogHeader>
          {selectedOccurrence && (
            <EditOccurrenceForm 
              occurrence={selectedOccurrence}
              employeeId={employeeId}
              onSuccess={() => {
                setEditDialogOpen(false);
                queryClient.invalidateQueries({ queryKey: ["/api/employees", employeeId, "occurrences"] });
                toast({
                  title: "Sucesso",
                  description: "Ocorrência atualizada com sucesso",
                });
              }}
              onCancel={() => setEditDialogOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Componente para editar ocorrência
interface EditOccurrenceFormProps {
  occurrence: EmployeeOccurrence;
  employeeId: string;
  onSuccess: () => void;
  onCancel: () => void;
}

function EditOccurrenceForm({ occurrence, employeeId, onSuccess, onCancel }: EditOccurrenceFormProps) {
  const { toast } = useToast();
  
  const editForm = useForm<OccurrenceFormData>({
    resolver: zodResolver(occurrenceFormSchema),
    defaultValues: {
      title: occurrence.title,
      occurrenceType: occurrence.occurrenceType,
      description: occurrence.description,
      occurrenceDate: occurrence.occurrenceDate,
      requestedById: occurrence.requestedById,
      severity: (occurrence as any).severity || "medium",
      actionRequired: (occurrence as any).actionRequired || "",
      followUpDate: (occurrence as any).followUpDate || "",
      witnesses: (occurrence as any).witnesses || "",
      attachments: (occurrence as any).attachments || "",
    },
  });

  // Buscar lista de gestores/usuários para o campo solicitante
  const { data: managers = [] } = useQuery({
    queryKey: ["/api/users", "managers"],
  });

  // Mutation para atualizar ocorrência
  const updateOccurrenceMutation = useMutation({
    mutationFn: async (data: OccurrenceFormData) => {
      const response = await fetch(`/api/employees/${employeeId}/occurrences/${occurrence.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
      });
      if (!response.ok) {
        throw new Error("Erro ao atualizar ocorrência");
      }
      return response.json();
    },
    onSuccess: () => {
      onSuccess();
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: "Erro ao atualizar ocorrência",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: OccurrenceFormData) => {
    updateOccurrenceMutation.mutate(data);
  };

  return (
    <Form {...editForm}>
      <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-4">
        <FormField
          control={editForm.control}
          name="title"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Título da Ocorrência</FormLabel>
              <FormControl>
                <Input placeholder="Ex: Advertência por atraso" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={editForm.control}
            name="occurrenceType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tipo de Ocorrência</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {occurrenceTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={editForm.control}
            name="occurrenceDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data da Ocorrência</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={editForm.control}
          name="requestedById"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Gestor Solicitante</FormLabel>
              <FormControl>
                <Input placeholder="Nome do gestor que solicitou a ocorrência" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={editForm.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Descrição Detalhada</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva detalhadamente a ocorrência..."
                  className="min-h-[100px]"
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={editForm.control}
            name="severity"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gravidade</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a gravidade" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="low">Baixa</SelectItem>
                    <SelectItem value="medium">Média</SelectItem>
                    <SelectItem value="high">Alta</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={editForm.control}
            name="followUpDate"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Data de Acompanhamento</FormLabel>
                <FormControl>
                  <Input type="date" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={editForm.control}
          name="actionRequired"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Ação Requerida</FormLabel>
              <FormControl>
                <Textarea 
                  placeholder="Descreva a ação ou medida a ser tomada..."
                  {...field} 
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={editForm.control}
          name="witnesses"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Testemunhas</FormLabel>
              <FormControl>
                <Input placeholder="Nome das testemunhas (opcional)" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-end space-x-2 pt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onCancel}
          >
            Cancelar
          </Button>
          <Button 
            type="submit" 
            disabled={updateOccurrenceMutation.isPending}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {updateOccurrenceMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </Form>
  );
}