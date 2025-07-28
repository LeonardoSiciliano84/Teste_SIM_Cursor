import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { AlertTriangle, Plus } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

const sinistroFormSchema = z.object({
  tipo: z.string().min(1, "Tipo é obrigatório"),
  classificacao: z.string().optional(),
  placa: z.string().optional(),
  nomeEnvolvido: z.string().min(1, "Nome do envolvido é obrigatório"),
  cargoEnvolvido: z.string().optional(),
  dataOcorrido: z.string().min(1, "Data é obrigatória"),
  horaOcorrido: z.string().min(1, "Hora é obrigatória"),
  local: z.string().min(1, "Local é obrigatório"),
  descricao: z.string().min(1, "Descrição é obrigatória"),
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

interface SinistroFormProps {
  userInfo?: {
    id: string;
    name: string;
    role: string;
  };
  trigger?: React.ReactNode;
}

export function SinistroForm({ userInfo, trigger }: SinistroFormProps) {
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
      return apiRequest("/api/sinistros", {
        method: "POST",
        body: JSON.stringify(data),
      });
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
                name="placa"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa do Veículo (se aplicável)</FormLabel>
                    <FormControl>
                      <Input {...field} placeholder="ABC-1234" />
                    </FormControl>
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
                    <FormControl>
                      <Input {...field} placeholder="Nome completo" />
                    </FormControl>
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
                name="local"
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
              name="descricao"
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

            <div className="flex justify-end space-x-2 pt-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => setOpen(false)}
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