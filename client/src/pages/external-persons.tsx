import { useState } from "react";
import { Plus, Users, Building2, UserCheck, Search, Edit, Trash2 } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";

const externalPersonSchema = z.object({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email deve ser válido"),
  personType: z.enum(["cliente", "terceirizado", "prestador"]),
  companyName: z.string().optional(),
  externalCompany: z.string().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  position: z.string().optional(),
  hasSystemAccess: z.boolean().default(false),
  allowedModules: z.array(z.string()).default([]),
  accessLevel: z.string().default("basic"),
  status: z.string().default("ativo"),
});

type ExternalPersonForm = z.infer<typeof externalPersonSchema>;

interface ExternalPerson {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  document?: string;
  companyName?: string;
  externalCompany?: string;
  position?: string;
  personType: string;
  hasSystemAccess: boolean;
  allowedModules: string[];
  accessLevel: string;
  status: string;
  createdAt: string;
}

const availableModules = [
  { id: 'cargo-scheduling', name: 'Agendamento de Carreamento' },
  { id: 'access-control', name: 'Controle de Acesso' },
  { id: 'warehouse', name: 'Almoxarifado' },
  { id: 'reports', name: 'Relatórios' },
];

export default function ExternalPersons() {
  const [showModal, setShowModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<ExternalPerson | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [selectedModules, setSelectedModules] = useState<string[]>([]);

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<ExternalPersonForm>({
    resolver: zodResolver(externalPersonSchema),
    defaultValues: {
      fullName: '',
      email: '',
      personType: 'cliente',
      companyName: '',
      externalCompany: '',
      phone: '',
      document: '',
      position: '',
      hasSystemAccess: false,
      allowedModules: [],
      accessLevel: 'basic',
      status: 'ativo',
    },
  });

  // Buscar pessoas externas
  const { data: externalPersons = [], isLoading } = useQuery({
    queryKey: ['/api/external-persons'],
  });

  // Mutação para criar/editar pessoa externa
  const savePersonMutation = useMutation({
    mutationFn: async (data: ExternalPersonForm) => {
      const url = editingPerson 
        ? `/api/external-persons/${editingPerson.id}`
        : '/api/external-persons';
      
      return apiRequest(url, {
        method: editingPerson ? 'PUT' : 'POST',
        body: JSON.stringify({ ...data, allowedModules: selectedModules }),
      });
    },
    onSuccess: () => {
      toast({
        title: editingPerson ? "Pessoa externa atualizada!" : "Pessoa externa cadastrada!",
        description: "Os dados foram salvos com sucesso.",
      });
      setShowModal(false);
      setEditingPerson(null);
      form.reset();
      setSelectedModules([]);
      queryClient.invalidateQueries({ queryKey: ['/api/external-persons'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  // Mutação para excluir pessoa externa
  const deletePersonMutation = useMutation({
    mutationFn: async (id: string) => {
      return apiRequest(`/api/external-persons/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: "Pessoa externa excluída",
        description: "O cadastro foi removido com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/external-persons'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao excluir",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  const handleEdit = (person: ExternalPerson) => {
    setEditingPerson(person);
    setSelectedModules(person.allowedModules || []);
    form.reset({
      fullName: person.fullName,
      email: person.email,
      personType: person.personType as any,
      companyName: person.companyName || '',
      externalCompany: person.externalCompany || '',
      phone: person.phone || '',
      document: person.document || '',
      position: person.position || '',
      hasSystemAccess: person.hasSystemAccess,
      allowedModules: person.allowedModules || [],
      accessLevel: person.accessLevel,
      status: person.status,
    });
    setShowModal(true);
  };

  const handleAdd = () => {
    setEditingPerson(null);
    setSelectedModules([]);
    form.reset();
    setShowModal(true);
  };

  const onSubmit = (data: ExternalPersonForm) => {
    savePersonMutation.mutate(data);
  };

  const filteredPersons = externalPersons.filter((person: ExternalPerson) => {
    const matchesSearch = person.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         person.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (person.companyName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesFilter = filterType === 'all' || person.personType === filterType;
    
    return matchesSearch && matchesFilter;
  });

  const personTypeLabel = (type: string) => {
    switch (type) {
      case 'cliente': return 'Cliente';
      case 'terceirizado': return 'Terceirizado';
      case 'prestador': return 'Prestador';
      default: return type;
    }
  };

  const renderPersonCard = (person: ExternalPerson) => (
    <Card key={person.id} className="hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <h3 className="font-semibold text-lg">{person.fullName}</h3>
              <Badge variant={
                person.personType === 'cliente' ? 'default' :
                person.personType === 'terceirizado' ? 'secondary' :
                'outline'
              }>
                {personTypeLabel(person.personType)}
              </Badge>
              {person.hasSystemAccess && (
                <Badge variant="outline" className="text-green-600 border-green-600">
                  <UserCheck className="w-3 h-3 mr-1" />
                  Acesso Sistema
                </Badge>
              )}
            </div>
            
            <div className="space-y-1 text-sm text-gray-600">
              <p><strong>Email:</strong> {person.email}</p>
              {person.phone && <p><strong>Telefone:</strong> {person.phone}</p>}
              {person.document && <p><strong>Documento:</strong> {person.document}</p>}
              {person.companyName && <p><strong>Empresa:</strong> {person.companyName}</p>}
              {person.externalCompany && <p><strong>Empresa Externa:</strong> {person.externalCompany}</p>}
              {person.position && <p><strong>Cargo:</strong> {person.position}</p>}
            </div>

            {person.hasSystemAccess && person.allowedModules.length > 0 && (
              <div className="mt-3">
                <p className="text-sm font-medium text-gray-700 mb-1">Módulos Permitidos:</p>
                <div className="flex flex-wrap gap-1">
                  {person.allowedModules.map(moduleId => {
                    const module = availableModules.find(m => m.id === moduleId);
                    return module ? (
                      <Badge key={moduleId} variant="outline" className="text-xs">
                        {module.name}
                      </Badge>
                    ) : null;
                  })}
                </div>
              </div>
            )}
          </div>
          
          <div className="flex gap-2 ml-4">
            <Button
              size="sm"
              variant="outline"
              onClick={() => handleEdit(person)}
              data-testid={`button-edit-${person.id}`}
            >
              <Edit className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => deletePersonMutation.mutate(person.id)}
              className="text-red-600 hover:text-red-700"
              data-testid={`button-delete-${person.id}`}
            >
              <Trash2 className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Pessoas Externas
        </h1>
        <p className="text-gray-600">
          Cadastro de clientes, terceirizados e prestadores de serviço
        </p>
      </div>

      {/* Controles */}
      <div className="mb-6 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar por nome, email ou empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
            </div>
          </div>
          
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Filtrar por tipo" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os tipos</SelectItem>
              <SelectItem value="cliente">Clientes</SelectItem>
              <SelectItem value="terceirizado">Terceirizados</SelectItem>
              <SelectItem value="prestador">Prestadores</SelectItem>
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleAdd}
            className="bg-[#0C29AB] hover:bg-blue-800"
            data-testid="button-add-person"
          >
            <Plus className="w-4 h-4 mr-2" />
            Nova Pessoa
          </Button>
        </div>
      </div>

      {/* Lista de Pessoas */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="text-center py-8">
            <p className="text-gray-500">Carregando...</p>
          </div>
        ) : filteredPersons.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                Nenhuma pessoa encontrada
              </h3>
              <p className="text-gray-500 mb-4">
                {searchTerm || filterType !== 'all' 
                  ? 'Tente ajustar os filtros de busca.'
                  : 'Comece cadastrando uma nova pessoa externa.'
                }
              </p>
              {!searchTerm && filterType === 'all' && (
                <Button
                  onClick={handleAdd}
                  className="bg-[#0C29AB] hover:bg-blue-800"
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Cadastrar Primeira Pessoa
                </Button>
              )}
            </CardContent>
          </Card>
        ) : (
          filteredPersons.map(renderPersonCard)
        )}
      </div>

      {/* Modal de Cadastro/Edição */}
      <Dialog open={showModal} onOpenChange={setShowModal}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>
              {editingPerson ? 'Editar Pessoa Externa' : 'Nova Pessoa Externa'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Dados Básicos */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Dados Básicos</h3>
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo *</FormLabel>
                      <FormControl>
                        <Input {...field} placeholder="Nome completo da pessoa" />
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
                      <FormLabel>E-mail *</FormLabel>
                      <FormControl>
                        <Input {...field} type="email" placeholder="email@empresa.com" />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="(11) 99999-9999" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="000.000.000-00" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              </div>

              {/* Tipo e Empresa */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Classificação</h3>
                
                <FormField
                  control={form.control}
                  name="personType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Tipo de Pessoa *</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o tipo" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="cliente">Cliente</SelectItem>
                          <SelectItem value="terceirizado">Terceirizado</SelectItem>
                          <SelectItem value="prestador">Prestador de Serviço</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {form.watch('personType') === 'cliente' && (
                  <FormField
                    control={form.control}
                    name="companyName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome da Empresa</FormLabel>
                        <FormControl>
                          <Input {...field} placeholder="Nome da empresa cliente" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                )}

                {(form.watch('personType') === 'terceirizado' || form.watch('personType') === 'prestador') && (
                  <>
                    <FormField
                      control={form.control}
                      name="externalCompany"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Empresa Terceirizada</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Nome da empresa terceirizada" />
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
                          <FormLabel>Cargo/Função</FormLabel>
                          <FormControl>
                            <Input {...field} placeholder="Cargo ou função exercida" />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              {/* Acesso ao Sistema */}
              <div className="space-y-4">
                <h3 className="font-semibold text-lg border-b pb-2">Acesso ao Sistema</h3>
                
                <FormField
                  control={form.control}
                  name="hasSystemAccess"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Permitir acesso ao sistema
                        </FormLabel>
                        <p className="text-sm text-muted-foreground">
                          Esta pessoa poderá fazer login no sistema
                        </p>
                      </div>
                    </FormItem>
                  )}
                />

                {form.watch('hasSystemAccess') && (
                  <>
                    <div>
                      <Label>Módulos Permitidos</Label>
                      <div className="mt-2 space-y-2">
                        {availableModules.map(module => {
                          // Permissões automáticas por tipo
                          const isAutoAllowed = 
                            (module.id === 'cargo-scheduling' && form.watch('personType') === 'cliente') ||
                            (module.id === 'access-control' && (form.watch('personType') === 'terceirizado' || form.watch('personType') === 'prestador'));
                          
                          return (
                            <div key={module.id} className="flex items-center space-x-2">
                              <Checkbox
                                id={module.id}
                                checked={selectedModules.includes(module.id) || isAutoAllowed}
                                disabled={isAutoAllowed}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedModules(prev => [...prev, module.id]);
                                  } else {
                                    setSelectedModules(prev => prev.filter(id => id !== module.id));
                                  }
                                }}
                              />
                              <Label htmlFor={module.id} className="text-sm">
                                {module.name}
                                {isAutoAllowed && (
                                  <Badge variant="outline" className="ml-2 text-xs">
                                    Automático
                                  </Badge>
                                )}
                              </Label>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <FormField
                      control={form.control}
                      name="accessLevel"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nível de Acesso</FormLabel>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="basic">Básico</SelectItem>
                              <SelectItem value="advanced">Avançado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>

              <DialogFooter>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowModal(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  className="bg-[#0C29AB] hover:bg-blue-800"
                  disabled={savePersonMutation.isPending}
                  data-testid="button-save-person"
                >
                  {savePersonMutation.isPending 
                    ? 'Salvando...' 
                    : editingPerson ? 'Atualizar' : 'Cadastrar'
                  }
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </div>
  );
}