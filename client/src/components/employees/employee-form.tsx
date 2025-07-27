import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast";
import { insertEmployeeSchema, type InsertEmployee, type Employee } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { CalendarIcon, Save, X, Plus, Trash2, User, GraduationCap, Briefcase, Users } from "lucide-react";

interface EmployeeFormProps {
  employee?: Employee;
  onSuccess?: () => void;
  onCancel?: () => void;
}

interface Dependent {
  id?: string;
  name: string;
  relationship: string;
  cpf: string;
  birthDate: string;
}

interface EducationRecord {
  id?: string;
  level: string;
  institution: string;
  course: string;
  completionYear: string;
  status: string;
}

interface MovementRecord {
  id?: string;
  type: string;
  description: string;
  date: string;
  previousValue?: string;
  newValue?: string;
}

export function EmployeeForm({ employee, onSuccess, onCancel }: EmployeeFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("personal");
  const [dependents, setDependents] = useState<Dependent[]>([]);
  const [educationRecords, setEducationRecords] = useState<EducationRecord[]>([]);
  const [movementHistory, setMovementHistory] = useState<MovementRecord[]>([]);

  const form = useForm({
    resolver: zodResolver(insertEmployeeSchema),
    defaultValues: {
      // Dados Pessoais
      fullName: employee?.fullName || "",
      cpf: employee?.cpf || "",
      rg: employee?.rg || "",
      birthDate: employee?.birthDate || "",
      gender: employee?.gender || "",
      maritalStatus: employee?.maritalStatus || "",
      phone: employee?.phone || "",
      personalEmail: employee?.personalEmail || "",
      address: employee?.address || "",
      city: employee?.city || "",
      state: employee?.state || "",
      zipCode: employee?.zipCode || "",
      
      // Dados Profissionais
      employeeNumber: employee?.employeeNumber || "",
      admissionDate: employee?.admissionDate || "",
      position: employee?.position || "",
      department: employee?.department || "",
      salary: employee?.salary || "",

      workLocation: employee?.workLocation || "",
      manager: employee?.manager || "",
      email: employee?.email || "",
      accessLevel: employee?.accessLevel || "employee",
      
      // Dados Escolares
      education: employee?.education || "",
      
      // Status
      status: employee?.status || "active",
      inactiveReason: employee?.inactiveReason || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: (data: any) => apiRequest("/api/employees", "POST", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      toast({ title: "Colaborador criado com sucesso!" });
      onSuccess?.();
    },
    onError: () => {
      toast({ title: "Erro ao criar colaborador", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: (data: any) => 
      apiRequest(`/api/employees/${employee?.id}`, "PATCH", data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      queryClient.invalidateQueries({ queryKey: ["/api/employees", employee?.id] });
      toast({ title: "Colaborador atualizado com sucesso!" });
      onSuccess?.();
    },
    onError: () => {
      toast({ title: "Erro ao atualizar colaborador", variant: "destructive" });
    },
  });

  const onSubmit = (data: any) => {
    // Adicionar dependentes e outros dados ao formulário
    const completeData = {
      ...data,
      dependents,
      educationRecords,
      movementHistory
    };
    
    if (employee) {
      updateMutation.mutate(completeData);
    } else {
      createMutation.mutate(completeData);
    }
  };

  // Funções para gerenciar dependentes
  const addDependent = () => {
    setDependents([...dependents, {
      name: "",
      relationship: "",
      cpf: "",
      birthDate: ""
    }]);
  };

  const removeDependent = (index: number) => {
    setDependents(dependents.filter((_, i) => i !== index));
  };

  const updateDependent = (index: number, field: keyof Dependent, value: string) => {
    const updated = [...dependents];
    updated[index] = { ...updated[index], [field]: value };
    setDependents(updated);
  };

  // Funções para gerenciar educação
  const addEducationRecord = () => {
    setEducationRecords([...educationRecords, {
      level: "",
      institution: "",
      course: "",
      completionYear: "",
      status: "completed"
    }]);
  };

  const removeEducationRecord = (index: number) => {
    setEducationRecords(educationRecords.filter((_, i) => i !== index));
  };

  const updateEducationRecord = (index: number, field: keyof EducationRecord, value: string) => {
    const updated = [...educationRecords];
    updated[index] = { ...updated[index], [field]: value };
    setEducationRecords(updated);
  };

  const isLoading = createMutation.isPending || updateMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">
          {employee ? "Editar Colaborador" : "Novo Colaborador"}
        </h1>
        <div className="flex gap-2">
          {onCancel && (
            <Button variant="outline" onClick={onCancel}>
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
          )}
          <Button 
            onClick={form.handleSubmit(onSubmit)}
            disabled={isLoading}
            className="bg-felka-blue hover:bg-felka-blue/90"
          >
            <Save className="h-4 w-4 mr-2" />
            {employee ? "Atualizar" : "Salvar"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid w-full grid-cols-6">
              <TabsTrigger value="personal" className="flex items-center gap-2">
                <User className="h-4 w-4" />
                Pessoais
              </TabsTrigger>
              <TabsTrigger value="professional" className="flex items-center gap-2">
                <Briefcase className="h-4 w-4" />
                Profissionais
              </TabsTrigger>
              <TabsTrigger value="education" className="flex items-center gap-2">
                <GraduationCap className="h-4 w-4" />
                Educação
              </TabsTrigger>
              <TabsTrigger value="dependents" className="flex items-center gap-2">
                <Users className="h-4 w-4" />
                Dependentes
              </TabsTrigger>
              <TabsTrigger value="permissions">Permissões</TabsTrigger>
              <TabsTrigger value="history">Histórico</TabsTrigger>
            </TabsList>

            <TabsContent value="personal" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Pessoais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="fullName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome completo do colaborador" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="cpf"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CPF *</FormLabel>
                          <FormControl>
                            <Input placeholder="000.000.000-00" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="rg"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>RG</FormLabel>
                          <FormControl>
                            <Input placeholder="RG do colaborador" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="birthDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Nascimento *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="gender"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gênero</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar gênero" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="M">Masculino</SelectItem>
                              <SelectItem value="F">Feminino</SelectItem>
                              <SelectItem value="Outro">Outro</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="maritalStatus"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado Civil</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar estado civil" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Solteiro">Solteiro(a)</SelectItem>
                              <SelectItem value="Casado">Casado(a)</SelectItem>
                              <SelectItem value="Divorciado">Divorciado(a)</SelectItem>
                              <SelectItem value="Viúvo">Viúvo(a)</SelectItem>
                              <SelectItem value="União Estável">União Estável</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="professional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Profissionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="employeeNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Número do Colaborador *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: 001, EMP-001" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="admissionDate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Data de Admissão *</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="position"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cargo *</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Motorista, Analista, Gerente" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="department"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Departamento *</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar departamento" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Operações">Operações</SelectItem>
                              <SelectItem value="Administrativo">Administrativo</SelectItem>
                              <SelectItem value="Financeiro">Financeiro</SelectItem>
                              <SelectItem value="Recursos Humanos">Recursos Humanos</SelectItem>
                              <SelectItem value="Manutenção">Manutenção</SelectItem>
                              <SelectItem value="Comercial">Comercial</SelectItem>
                              <SelectItem value="Tecnologia">Tecnologia</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="manager"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Gestor Direto</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do gestor direto" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="workLocation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Local de Trabalho</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Matriz, Filial SP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="salary"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Salário</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              step="0.01" 
                              placeholder="0.00"
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Status do colaborador" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="active">Ativo</SelectItem>
                              <SelectItem value="inactive">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="contact" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações de Contato</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Telefone *</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail Corporativo</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="colaborador@felka.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="personalEmail"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>E-mail Pessoal</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="email@pessoal.com" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, Avenida..." {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="city"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Cidade</FormLabel>
                          <FormControl>
                            <Input placeholder="São Paulo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="state"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Estado</FormLabel>
                          <FormControl>
                            <Input placeholder="SP" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="additional" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Informações Adicionais</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="education"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Escolaridade</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecionar escolaridade" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="Fundamental">Ensino Fundamental</SelectItem>
                              <SelectItem value="Médio">Ensino Médio</SelectItem>
                              <SelectItem value="Superior">Ensino Superior</SelectItem>
                              <SelectItem value="Pós-graduação">Pós-graduação</SelectItem>
                              <SelectItem value="Mestrado">Mestrado</SelectItem>
                              <SelectItem value="Doutorado">Doutorado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driverLicense"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CNH</FormLabel>
                          <FormControl>
                            <Input placeholder="Número da CNH" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driverLicenseCategory"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Categoria da CNH</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Categoria" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="A">A</SelectItem>
                              <SelectItem value="B">B</SelectItem>
                              <SelectItem value="C">C</SelectItem>
                              <SelectItem value="D">D</SelectItem>
                              <SelectItem value="E">E</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="driverLicenseExpiry"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Vencimento da CNH</FormLabel>
                          <FormControl>
                            <Input type="date" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Dependentes */}
            <TabsContent value="dependents" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>Dependentes</span>
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={addDependent}
                      className="gap-2"
                    >
                      <Plus className="h-4 w-4" />
                      Adicionar Dependente
                    </Button>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {dependents.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <Users className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum dependente cadastrado</p>
                      <p className="text-sm">Clique em "Adicionar Dependente" para começar</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dependents.map((dependent, index) => (
                        <Card key={index} className="p-4">
                          <div className="flex justify-between items-start mb-3">
                            <Badge variant="outline">Dependente {index + 1}</Badge>
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              onClick={() => removeDependent(index)}
                              className="text-red-600 hover:text-red-800"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                            <div>
                              <label className="text-sm font-medium">Nome Completo</label>
                              <Input
                                value={dependent.name}
                                onChange={(e) => updateDependent(index, 'name', e.target.value)}
                                placeholder="Nome completo do dependente"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Parentesco</label>
                              <Select 
                                value={dependent.relationship} 
                                onValueChange={(value) => updateDependent(index, 'relationship', value)}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecionar parentesco" />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="Cônjuge">Cônjuge</SelectItem>
                                  <SelectItem value="Filho(a)">Filho(a)</SelectItem>
                                  <SelectItem value="Enteado(a)">Enteado(a)</SelectItem>
                                  <SelectItem value="Pai">Pai</SelectItem>
                                  <SelectItem value="Mãe">Mãe</SelectItem>
                                  <SelectItem value="Irmão(ã)">Irmão(ã)</SelectItem>
                                  <SelectItem value="Outros">Outros</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                            <div>
                              <label className="text-sm font-medium">CPF</label>
                              <Input
                                value={dependent.cpf}
                                onChange={(e) => updateDependent(index, 'cpf', e.target.value)}
                                placeholder="000.000.000-00"
                              />
                            </div>
                            <div>
                              <label className="text-sm font-medium">Data de Nascimento</label>
                              <Input
                                type="date"
                                value={dependent.birthDate}
                                onChange={(e) => updateDependent(index, 'birthDate', e.target.value)}
                              />
                            </div>
                          </div>
                        </Card>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Permissões */}
            <TabsContent value="permissions" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Sistema de Permissões</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <FormField
                    control={form.control}
                    name="accessLevel"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nível de Acesso</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value || "employee"}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecionar nível de acesso" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="employee">Funcionário</SelectItem>
                            <SelectItem value="supervisor">Supervisor</SelectItem>
                            <SelectItem value="manager">Gerente</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <label className="text-sm font-medium">Módulos Permitidos</label>
                      <div className="space-y-2">
                        {['Dashboard', 'Veículos', 'Motoristas', 'Rotas', 'Reservas', 'Análises', 'RH'].map((module) => (
                          <div key={module} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`module-${module}`}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`module-${module}`} className="text-sm">
                              {module}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <label className="text-sm font-medium">Permissões Especiais</label>
                      <div className="space-y-2">
                        {['Criar registros', 'Editar registros', 'Excluir registros', 'Visualizar relatórios', 'Exportar dados'].map((permission) => (
                          <div key={permission} className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id={`permission-${permission}`}
                              className="rounded border-gray-300"
                            />
                            <label htmlFor={`permission-${permission}`} className="text-sm">
                              {permission}
                            </label>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            {/* Aba de Histórico */}
            <TabsContent value="history" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Histórico de Movimentações</CardTitle>
                </CardHeader>
                <CardContent>
                  {movementHistory.length === 0 ? (
                    <div className="text-center py-8 text-gray-500">
                      <div className="h-12 w-12 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
                        <CalendarIcon className="h-6 w-6 text-gray-400" />
                      </div>
                      <p>Nenhuma movimentação registrada</p>
                      <p className="text-sm">O histórico será gerado automaticamente conforme as alterações</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {movementHistory.map((movement, index) => (
                        <div key={index} className="border-l-4 border-felka-blue pl-4 py-2">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="font-medium">{movement.type}</h4>
                              <p className="text-sm text-gray-600">{movement.description}</p>
                              {movement.previousValue && movement.newValue && (
                                <p className="text-xs text-gray-500 mt-1">
                                  De: {movement.previousValue} → Para: {movement.newValue}
                                </p>
                              )}
                            </div>
                            <span className="text-sm text-gray-500">
                              {new Date(movement.date).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            {form.watch("status") === "inactive" && (
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <FormField
                    control={form.control}
                    name="inactiveReason"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="text-red-800">Motivo da Inativação</FormLabel>
                        <FormControl>
                          <Textarea 
                            placeholder="Descreva o motivo da inativação..."
                            {...field} 
                            value={field.value || ""}
                            className="border-red-300 focus:border-red-500"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </CardContent>
              </Card>
            )}
          </Tabs>
        </form>
      </Form>
    </div>
  );
}