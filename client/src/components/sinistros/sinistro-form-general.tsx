import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { AlertTriangle, Camera, Upload, Check, ChevronsUpDown, Car } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

// Componente para seleção de colaboradores
function EmployeeSelect({ onValueChange, value }: { onValueChange: (value: string) => void; value: string }) {
  const { data: employees = [] } = useQuery({
    queryKey: ["/api/employees"],
  });

  return (
    <Select onValueChange={onValueChange} value={value}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Selecione o colaborador" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {(employees as any[]).map((employee: any) => (
          <SelectItem key={employee.id} value={employee.fullName}>
            {employee.fullName} - {employee.position || "Sem cargo"}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

// Componente para seleção de veículos
function VehicleSelect({ onValueChange, value }: { onValueChange: (value: string) => void; value: string }) {
  const [open, setOpen] = useState(false);
  const [manualInput, setManualInput] = useState(false);
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  const selectedVehicle = (vehicles as any[]).find((vehicle: any) => vehicle.plate === value);

  return (
    <div className="space-y-2">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <FormControl>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {value ? (
                <div className="flex items-center">
                  <Car className="mr-2 h-4 w-4" />
                  {selectedVehicle ? (
                    <span>{selectedVehicle.plate} - {selectedVehicle.brand} {selectedVehicle.model}</span>
                  ) : (
                    <span>{value}</span>
                  )}
                </div>
              ) : (
                <span className="text-muted-foreground">Selecione um veículo...</span>
              )}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </FormControl>
        </PopoverTrigger>
        <PopoverContent className="w-full p-0">
          <Command>
            <CommandInput placeholder="Buscar veículo por placa..." />
            <CommandList>
              <CommandEmpty>Nenhum veículo encontrado.</CommandEmpty>
              <CommandGroup>
                {(vehicles as any[]).map((vehicle: any) => (
                  <CommandItem
                    key={vehicle.id}
                    value={vehicle.plate}
                    onSelect={() => {
                      onValueChange(vehicle.plate);
                      setOpen(false);
                      setManualInput(false);
                    }}
                  >
                    <Check
                      className={cn(
                        "mr-2 h-4 w-4",
                        value === vehicle.plate ? "opacity-100" : "opacity-0"
                      )}
                    />
                    <div className="flex items-center">
                      <Car className="mr-2 h-4 w-4" />
                      <span className="font-mono">{vehicle.plate}</span>
                      <span className="ml-2 text-muted-foreground">
                        - {vehicle.brand} {vehicle.model}
                      </span>
                    </div>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      
      <div className="flex items-center space-x-2">
        <Button
          type="button"
          variant="ghost"
          size="sm"
          onClick={() => setManualInput(!manualInput)}
          className="text-xs"
        >
          {manualInput ? "Usar busca" : "Inserir manualmente"}
        </Button>
      </div>
      
      {manualInput && (
        <Input
          placeholder="Digite a placa (ex: ABC-1234)"
          value={value}
          onChange={(e) => onValueChange(e.target.value)}
          className="mt-2"
        />
      )}
    </div>
  );
}

const sinistroFormSchema = z.object({
  tipo: z.string().min(1, "Tipo é obrigatório"),
  classificacao: z.string().optional(),
  placaTracao: z.string().optional(),
  nomeEnvolvido: z.string().min(1, "Nome do envolvido é obrigatório"),
  cargoEnvolvido: z.string().optional(),
  dataOcorrido: z.string().min(1, "Data é obrigatória"),
  horaOcorrido: z.string().min(1, "Hora é obrigatória"),
  localEndereco: z.string().min(1, "Local é obrigatório"),
  observacoes: z.string().min(1, "Descrição é obrigatória"),
  vitimas: z.boolean().default(false),
  descricaoVitimas: z.string().optional(),
  testemunhas: z.string().optional(),
  condicoesTempo: z.string().optional(),
  condicoesPista: z.string().optional(),
  registradoPor: z.string(),
  nomeRegistrador: z.string(),
  cargoRegistrador: z.string(),
});

type SinistroFormData = z.infer<typeof sinistroFormSchema>;

interface SinistroFormGeneralProps {
  userInfo?: {
    id: string;
    name: string;
    role: string;
  };
  trigger?: React.ReactNode;
}

export function SinistroFormGeneral({ userInfo, trigger }: SinistroFormGeneralProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SinistroFormData>({
    resolver: zodResolver(sinistroFormSchema),
    defaultValues: {
      vitimas: false,
      registradoPor: userInfo?.id || "",
      nomeRegistrador: userInfo?.name || "",
      cargoRegistrador: userInfo?.role === "driver" ? "Motorista" : "Administrador",
    },
  });

  const createSinistroMutation = useMutation({
    mutationFn: async (data: SinistroFormData) => {
      return apiRequest("/api/sinistros", "POST", data);
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Sinistro registrado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sinistros"] });
      setOpen(false);
      form.reset();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao registrar sinistro",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SinistroFormData) => {
    createSinistroMutation.mutate(data);
  };

  const tiposSinistro = [
    { value: "veicular", label: "Veicular (acidente, colisão, avaria)" },
    { value: "trabalhista_cat", label: "Trabalhista / CAT" },
    { value: "interno_base", label: "Interno na Base" },
    { value: "externo_cliente", label: "Externo com Cliente" },
    { value: "ambiental", label: "Ambiental" },
    { value: "falha_epi", label: "Falha de EPI / Segurança" },
    { value: "quase_acidente", label: "Quase Acidente (Near Miss)" },
  ];

  const classificacoes = [
    { value: "erro_humano", label: "Erro Humano" },
    { value: "falha_tecnica", label: "Falha Técnica" },
    { value: "omissao_epi", label: "Omissão de EPI" },
    { value: "condicoes_adversas", label: "Condições Adversas" },
    { value: "outros", label: "Outros" },
  ];

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button className="bg-red-600 hover:bg-red-700 text-white">
            <AlertTriangle className="w-4 h-4 mr-2" />
            Registrar Sinistro
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center text-red-600">
            <AlertTriangle className="w-5 h-5 mr-2" />
            Registro de Sinistro / Acidente
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="tipo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Sinistro *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {tiposSinistro.map((tipo) => (
                          <SelectItem key={tipo.value} value={tipo.value}>
                            {tipo.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="classificacao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Classificação da Causa</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a classificação" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {classificacoes.map((classe) => (
                          <SelectItem key={classe.value} value={classe.value}>
                            {classe.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="placaTracao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa do Veículo (se aplicável)</FormLabel>
                    <VehicleSelect onValueChange={field.onChange} value={field.value} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="nomeEnvolvido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Envolvido *</FormLabel>
                    <EmployeeSelect onValueChange={field.onChange} value={field.value} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="cargoEnvolvido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo/Função do Envolvido</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Motorista, Operador" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="localEndereco"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Local do Ocorrido *</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="Ex: Base, Cliente, Rodovia BR-101" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="dataOcorrido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Ocorrido *</FormLabel>
                    <FormControl>
                      <Input {...field} type="date" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="horaOcorrido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hora do Ocorrido *</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condicoesTempo"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condições do Tempo</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="sol">Sol</SelectItem>
                        <SelectItem value="chuva">Chuva</SelectItem>
                        <SelectItem value="garoa">Garoa</SelectItem>
                        <SelectItem value="nublado">Nublado</SelectItem>
                        <SelectItem value="neblina">Neblina</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="condicoesPista"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Condições da Pista</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="seca">Seca</SelectItem>
                        <SelectItem value="molhada">Molhada</SelectItem>
                        <SelectItem value="escorregadia">Escorregadia</SelectItem>
                        <SelectItem value="em_obras">Em Obras</SelectItem>
                        <SelectItem value="buracos">Com Buracos</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição Detalhada do Ocorrido *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva detalhadamente como o acidente/sinistro ocorreu..."
                      className="min-h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="vitimas"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel className="text-red-600 font-medium">
                      Houve vítimas?
                    </FormLabel>
                  </div>
                </FormItem>
              )}
            />

            {form.watch("vitimas") && (
              <FormField
                control={form.control}
                name="descricaoVitimas"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Descrição das Vítimas</FormLabel>
                    <FormControl>
                      <Textarea
                        {...field}
                        placeholder="Descreva as vítimas, ferimentos, atendimento prestado..."
                        className="min-h-20"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="testemunhas"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Testemunhas</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Nome, telefone e relato das testemunhas..."
                      className="min-h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Upload de Imagens */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Camera className="w-5 h-5 text-red-600" />
                <h4 className="font-semibold text-gray-800">Upload de Imagens</h4>
                <span className="text-sm text-red-600">(Máximo 6)</span>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {[1, 2, 3, 4, 5, 6].map((index) => (
                  <div key={index} className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center">
                    <Camera className="w-8 h-8 mx-auto mb-2 text-gray-400" />
                    <p className="text-sm text-gray-500">Imagem {index}</p>
                    <Input type="file" accept="image/*" className="mt-2" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Formatos suportados: JPG, PNG. Máximo 5MB por imagem.
              </p>
            </div>

            {/* Upload de Documentos */}
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Upload className="w-5 h-5 text-blue-600" />
                <h4 className="font-semibold text-gray-800">Anexar Documentos</h4>
                <span className="text-sm text-gray-600">(Relatórios, laudos, etc.)</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((index) => (
                  <div key={index} className="border-2 border-dashed border-blue-300 rounded-lg p-4 text-center">
                    <Upload className="w-8 h-8 mx-auto mb-2 text-blue-400" />
                    <p className="text-sm text-gray-500">Documento {index}</p>
                    <Input type="file" accept=".pdf,.doc,.docx,.txt" className="mt-2" />
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Formatos suportados: PDF, DOC, DOCX, TXT. Máximo 10MB por arquivo.
              </p>
            </div>

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
                disabled={createSinistroMutation.isPending}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                disabled={createSinistroMutation.isPending}
                className="bg-red-600 hover:bg-red-700"
              >
                {createSinistroMutation.isPending ? "Registrando..." : "Registrar Sinistro"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}