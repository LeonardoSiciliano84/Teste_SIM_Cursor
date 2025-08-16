import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const sinistroEditSchema = z.object({
  tipo: z.string().min(1, "Tipo é obrigatório"),
  dataOcorrido: z.string().min(1, "Data é obrigatória"),
  horaOcorrido: z.string().min(1, "Hora é obrigatória"),
  localEndereco: z.string().min(1, "Local e endereço são obrigatórios"),
  nomeEnvolvido: z.string().min(1, "Nome do envolvido é obrigatório"),
  cargoEnvolvido: z.string().optional(),
  vitimas: z.boolean().default(false),
  descricaoVitimas: z.string().optional(),
  observacoes: z.string().min(1, "Observações são obrigatórias"),
  // Campos específicos para sinistros veiculares
  placaTracao: z.string().optional(),
  tipoColisao: z.string().optional(),
  condicoesTrajeto: z.string().optional(),
  percepcaoGravidade: z.string().optional(),
  quemSofreuAvaria: z.string().optional(),
});

type SinistroEditData = z.infer<typeof sinistroEditSchema>;

interface SinistroEditFormProps {
  sinistro: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function SinistroEditForm({ sinistro, open, onOpenChange }: SinistroEditFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<SinistroEditData>({
    resolver: zodResolver(sinistroEditSchema),
    defaultValues: {
      tipo: sinistro?.tipo || "",
      dataOcorrido: sinistro?.dataOcorrido || "",
      horaOcorrido: sinistro?.horaOcorrido || "",
      localEndereco: sinistro?.localEndereco || "",
      nomeEnvolvido: sinistro?.nomeEnvolvido || "",
      cargoEnvolvido: sinistro?.cargoEnvolvido || "",
      vitimas: sinistro?.vitimas || false,
      descricaoVitimas: sinistro?.descricaoVitimas || "",
      observacoes: sinistro?.observacoes || "",
      placaTracao: sinistro?.placaTracao || "",
      tipoColisao: sinistro?.tipoColisao || "",
      condicoesTrajeto: sinistro?.condicoesTrajeto || "",
      percepcaoGravidade: sinistro?.percepcaoGravidade || "",
      quemSofreuAvaria: sinistro?.quemSofreuAvaria || "",
    },
  });

  // Reset form when sinistro changes
  useEffect(() => {
    if (sinistro) {
      form.reset({
        tipo: sinistro.tipo || "",
        dataOcorrido: sinistro.dataOcorrido || "",
        horaOcorrido: sinistro.horaOcorrido || "",
        localEndereco: sinistro.localEndereco || "",
        nomeEnvolvido: sinistro.nomeEnvolvido || "",
        cargoEnvolvido: sinistro.cargoEnvolvido || "",
        vitimas: sinistro.vitimas || false,
        descricaoVitimas: sinistro.descricaoVitimas || "",
        observacoes: sinistro.observacoes || "",
        placaTracao: sinistro.placaTracao || "",
        tipoColisao: sinistro.tipoColisao || "",
        condicoesTrajeto: sinistro.condicoesTrajeto || "",
        percepcaoGravidade: sinistro.percepcaoGravidade || "",
        quemSofreuAvaria: sinistro.quemSofreuAvaria || "",
      });
    }
  }, [sinistro, form]);

  const updateSinistroMutation = useMutation({
    mutationFn: async (data: SinistroEditData) => {
      return apiRequest(`/api/sinistros/${sinistro.id}`, "PATCH", {
        ...data,
        updatedBy: "admin-1",
        updatedByName: "Administrador QSMS"
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso",
        description: "Sinistro atualizado com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/sinistros"] });
      onOpenChange(false);
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar sinistro",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: SinistroEditData) => {
    updateSinistroMutation.mutate(data);
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

  const watchTipo = form.watch("tipo");
  const watchVitimas = form.watch("vitimas");

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Sinistro</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          {/* Informações Básicas */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Informações Básicas</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="tipo">Tipo de Sinistro *</Label>
                <Select
                  value={form.watch("tipo")}
                  onValueChange={(value) => form.setValue("tipo", value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    {tiposSinistro.map((tipo) => (
                      <SelectItem key={tipo.value} value={tipo.value}>
                        {tipo.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                {form.formState.errors.tipo && (
                  <p className="text-red-500 text-sm">{form.formState.errors.tipo.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="dataOcorrido">Data do Ocorrido *</Label>
                <Input
                  type="date"
                  {...form.register("dataOcorrido")}
                />
                {form.formState.errors.dataOcorrido && (
                  <p className="text-red-500 text-sm">{form.formState.errors.dataOcorrido.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="horaOcorrido">Hora do Ocorrido *</Label>
                <Input
                  type="time"
                  {...form.register("horaOcorrido")}
                />
                {form.formState.errors.horaOcorrido && (
                  <p className="text-red-500 text-sm">{form.formState.errors.horaOcorrido.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="localEndereco">Local/Endereço *</Label>
                <Input
                  {...form.register("localEndereco")}
                  placeholder="Descreva o local do ocorrido"
                />
                {form.formState.errors.localEndereco && (
                  <p className="text-red-500 text-sm">{form.formState.errors.localEndereco.message}</p>
                )}
              </div>
            </div>
          </div>

          {/* Informações do Envolvido */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Dados do Envolvido</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="nomeEnvolvido">Nome do Envolvido *</Label>
                <Input
                  {...form.register("nomeEnvolvido")}
                  placeholder="Nome completo"
                />
                {form.formState.errors.nomeEnvolvido && (
                  <p className="text-red-500 text-sm">{form.formState.errors.nomeEnvolvido.message}</p>
                )}
              </div>

              <div>
                <Label htmlFor="cargoEnvolvido">Cargo/Função</Label>
                <Input
                  {...form.register("cargoEnvolvido")}
                  placeholder="Cargo ou função"
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="vitimas"
                  checked={watchVitimas}
                  onCheckedChange={(checked) => form.setValue("vitimas", checked as boolean)}
                />
                <Label htmlFor="vitimas">Houve vítimas?</Label>
              </div>

              {watchVitimas && (
                <div className="md:col-span-2">
                  <Label htmlFor="descricaoVitimas">Descrição das Vítimas</Label>
                  <Textarea
                    {...form.register("descricaoVitimas")}
                    placeholder="Descreva as vítimas e ferimentos"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Campos específicos para sinistros veiculares */}
          {watchTipo === "veicular" && (
            <div>
              <h3 className="text-lg font-semibold mb-4">Informações Veiculares</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="placaTracao">Placa da Tração</Label>
                  <Input
                    {...form.register("placaTracao")}
                    placeholder="ABC-1234"
                  />
                </div>

                <div>
                  <Label htmlFor="tipoColisao">Tipo de Colisão</Label>
                  <Select
                    value={form.watch("tipoColisao") || ""}
                    onValueChange={(value) => form.setValue("tipoColisao", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="frontal">Frontal</SelectItem>
                      <SelectItem value="traseira">Traseira</SelectItem>
                      <SelectItem value="lateral">Lateral</SelectItem>
                      <SelectItem value="capotamento">Capotamento</SelectItem>
                      <SelectItem value="saida_pista">Saída de Pista</SelectItem>
                      <SelectItem value="choque_objeto">Choque com Objeto</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="condicoesTrajeto">Condições do Trajeto</Label>
                  <Select
                    value={form.watch("condicoesTrajeto") || ""}
                    onValueChange={(value) => form.setValue("condicoesTrajeto", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="tempo_bom">Tempo Bom</SelectItem>
                      <SelectItem value="chuva">Chuva</SelectItem>
                      <SelectItem value="neblina">Neblina</SelectItem>
                      <SelectItem value="noite">Noite</SelectItem>
                      <SelectItem value="via_ruim">Via em Más Condições</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="percepcaoGravidade">Percepção de Gravidade</Label>
                  <Select
                    value={form.watch("percepcaoGravidade") || ""}
                    onValueChange={(value) => form.setValue("percepcaoGravidade", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="baixa">Baixa</SelectItem>
                      <SelectItem value="media">Média</SelectItem>
                      <SelectItem value="alta">Alta</SelectItem>
                      <SelectItem value="critica">Crítica</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="md:col-span-2">
                  <Label htmlFor="quemSofreuAvaria">Quem Sofreu Avaria</Label>
                  <Input
                    {...form.register("quemSofreuAvaria")}
                    placeholder="Descreva quem ou o que sofreu avaria"
                  />
                </div>
              </div>
            </div>
          )}

          {/* Observações */}
          <div>
            <Label htmlFor="observacoes">Observações *</Label>
            <Textarea
              {...form.register("observacoes")}
              placeholder="Descreva detalhadamente o ocorrido..."
              rows={4}
            />
            {form.formState.errors.observacoes && (
              <p className="text-red-500 text-sm">{form.formState.errors.observacoes.message}</p>
            )}
          </div>

          {/* Botões */}
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={updateSinistroMutation.isPending}
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={updateSinistroMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {updateSinistroMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}