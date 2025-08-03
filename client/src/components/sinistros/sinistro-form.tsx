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
import { AlertTriangle, Plus, Camera } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

// Componente para seleção de veículos
function VehicleSelect({ onValueChange, value }: { onValueChange: (value: string) => void; value: string }) {
  const { data: vehicles = [] } = useQuery({
    queryKey: ["/api/vehicles"],
  });

  return (
    <Select onValueChange={onValueChange} value={value}>
      <FormControl>
        <SelectTrigger>
          <SelectValue placeholder="Selecione a placa" />
        </SelectTrigger>
      </FormControl>
      <SelectContent>
        {(vehicles as any[]).map((vehicle: any) => (
          <SelectItem key={vehicle.id} value={vehicle.plate || vehicle.licensePlate}>
            {vehicle.plate || vehicle.licensePlate} - {vehicle.name || vehicle.model}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}

const sinistroFormSchema = z.object({
  tipo: z.string().min(1, "Tipo é obrigatório"),
  classificacao: z.string().optional(),
  placaTracao: z.string().min(1, "Placa da tração é obrigatória"),
  dataOcorrido: z.string().min(1, "Data é obrigatória"),
  horaOcorrido: z.string().min(1, "Hora é obrigatória"),
  localEndereco: z.string().min(1, "Local e endereço são obrigatórios"),
  tipoColisao: z.string().min(1, "Tipo de colisão é obrigatório"),
  vitimas: z.boolean().default(false),
  condicoesTrajeto: z.string().min(1, "Condições de trajeto são obrigatórias"),
  quemSofreuAvaria: z.string().min(1, "Informar quem sofreu avaria é obrigatório"),
  percepcaoGravidade: z.string().min(1, "Percepção de gravidade é obrigatória"),
  observacoes: z.string().min(1, "Observações são obrigatórias"),
  nomeEnvolvido: z.string().min(1, "Nome do envolvido é obrigatório"),
  cargoEnvolvido: z.string().optional(),
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
  isDriverPortal?: boolean; // Para distinguir entre portal do motorista e página geral
}

export function SinistroForm({ userInfo, trigger, isDriverPortal = false }: SinistroFormProps) {
  const [open, setOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SinistroFormData>({
    resolver: zodResolver(sinistroFormSchema),
    defaultValues: {
      tipo: isDriverPortal ? "veicular" : "",
      vitimas: false,
      nomeEnvolvido: userInfo?.name || "",
      cargoEnvolvido: userInfo?.role === "driver" ? "Motorista" : "Administrador",
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
            {isDriverPortal ? "Comunicar Sinistro Veicular" : "Registro de Sinistro / Acidente"}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="dataOcorrido"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Data do Sinistro *</FormLabel>
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
                    <FormLabel>Hora do Sinistro *</FormLabel>
                    <FormControl>
                      <Input {...field} type="time" />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="placaTracao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa da Tração *</FormLabel>
                    <VehicleSelect onValueChange={field.onChange} value={field.value} />
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="tipoColisao"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Colisão *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="frontal">Frontal</SelectItem>
                        <SelectItem value="traseira">Traseira</SelectItem>
                        <SelectItem value="lateral">Lateral</SelectItem>
                        <SelectItem value="capotagem">Capotagem</SelectItem>
                        <SelectItem value="tombamento">Tombamento</SelectItem>
                        <SelectItem value="atropelamento">Atropelamento</SelectItem>
                        <SelectItem value="engavetamento">Engavetamento</SelectItem>
                        <SelectItem value="choque_objeto">Choque com Objeto</SelectItem>
                        <SelectItem value="saida_pista">Saída de Pista</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="percepcaoGravidade"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Percepção de Gravidade *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="baixa">Baixa - Danos materiais leves</SelectItem>
                        <SelectItem value="media">Média - Danos significativos</SelectItem>
                        <SelectItem value="alta">Alta - Danos graves ou vítimas</SelectItem>
                        <SelectItem value="critica">Crítica - Risco de vida</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="quemSofreuAvaria"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Quem Sofreu a Avaria *</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="veiculo_proprio">Veículo Próprio</SelectItem>
                        <SelectItem value="veiculo_terceiro">Veículo de Terceiro</SelectItem>
                        <SelectItem value="ambos">Ambos os Veículos</SelectItem>
                        <SelectItem value="carga">Carga</SelectItem>
                        <SelectItem value="propriedade_publica">Propriedade Pública</SelectItem>
                        <SelectItem value="propriedade_privada">Propriedade Privada</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="localEndereco"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Local e Endereço *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Informe o endereço completo, pontos de referência e detalhes da localização..."
                      className="min-h-20"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="condicoesTrajeto"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Condições de Trajeto e Carga *</FormLabel>
                  <Select onValueChange={field.onChange} value={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione as condições" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="normal_seco">Normal - Pista Seca</SelectItem>
                      <SelectItem value="normal_molhado">Normal - Pista Molhada</SelectItem>
                      <SelectItem value="carga_completa">Carga Completa</SelectItem>
                      <SelectItem value="carga_parcial">Carga Parcial</SelectItem>
                      <SelectItem value="vazio">Veículo Vazio</SelectItem>
                      <SelectItem value="chuva_intensa">Chuva Intensa</SelectItem>
                      <SelectItem value="neblina">Neblina/Baixa Visibilidade</SelectItem>
                      <SelectItem value="pista_obras">Pista em Obras</SelectItem>
                      <SelectItem value="transito_intenso">Trânsito Intenso</SelectItem>
                      <SelectItem value="carga_perigosa">Carga Perigosa</SelectItem>
                    </SelectContent>
                  </Select>
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

            <FormField
              control={form.control}
              name="observacoes"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações *</FormLabel>
                  <FormControl>
                    <Textarea
                      {...field}
                      placeholder="Descreva detalhadamente como o acidente ocorreu, medidas tomadas, contatos realizados..."
                      className="min-h-32"
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
                <span className="text-sm text-red-600">(Mínimo 1, Máximo 6)</span>
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
                * Pelo menos 1 imagem é obrigatória. Formatos suportados: JPG, PNG. Máximo 5MB por imagem.
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
                {createSinistroMutation.isPending ? "Comunicando..." : "Comunicar Sinistro"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}