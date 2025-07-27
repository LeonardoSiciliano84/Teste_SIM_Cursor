import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Upload, DollarSign, FileText, Settings } from "lucide-react";
import { insertVehicleSchema } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Constantes para os selects
const VEHICLE_TYPES = [
  { value: "Tração", label: "Tração" },
  { value: "Semirreboque", label: "Semirreboque" },
  { value: "Equipamento", label: "Equipamento" },
];

const CLASSIFICATIONS = [
  { value: "Passeio", label: "Passeio" },
  { value: "Moto", label: "Moto" },
  { value: "Empilhadeira", label: "Empilhadeira" },
  { value: "Utilitário", label: "Utilitário" },
  { value: "Guindaste", label: "Guindaste" },
  { value: "Toco", label: "Toco" },
  { value: "Truck", label: "Truck" },
  { value: "Truck Munck", label: "Truck Munck" },
  { value: "Cavalo Mecânico Truck", label: "Cavalo Mecânico Truck (CM Truck)" },
  { value: "Cavalo Mecânico Toco", label: "Cavalo Mecânico Toco (CM Toco)" },
  { value: "VUC", label: "VUC" },
  { value: "Carreta 14m", label: "Carreta 14m" },
  { value: "Carreta Extensiva", label: "Carreta Extensiva" },
  { value: "Carreta Vanderleia", label: "Carreta Vanderleia" },
  { value: "Prancha", label: "Prancha" },
];

const CONTRACT_TYPES = [
  { value: "CDC", label: "CDC" },
  { value: "Leasing", label: "Leasing" },
  { value: "Consórcio", label: "Consórcio" },
];

const MAINTENANCE_INTERVALS = [
  { value: 10000, label: "10.000 km" },
  { value: 20000, label: "20.000 km" },
  { value: 30000, label: "30.000 km" },
  { value: 40000, label: "40.000 km" },
];

const formSchema = insertVehicleSchema.extend({
  purchaseDate: z.string().optional(),
  crlvExpiry: z.string().optional(),
  tachographExpiry: z.string().optional(),
  anttExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
});

type FormData = z.infer<typeof formSchema>;

interface VehicleFormProps {
  onSuccess?: () => void;
  onCancel?: () => void;
}

export default function VehicleForm({ onSuccess, onCancel }: VehicleFormProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      status: "active",
      preventiveMaintenanceKm: 10000,
      tireRotationKm: 10000,
      photos: [],
    },
  });

  const createVehicleMutation = useMutation({
    mutationFn: async (data: FormData) => {
      // Converter datas string para Date objects
      const processedData = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        crlvExpiry: data.crlvExpiry ? new Date(data.crlvExpiry) : undefined,
        tachographExpiry: data.tachographExpiry ? new Date(data.tachographExpiry) : undefined,
        anttExpiry: data.anttExpiry ? new Date(data.anttExpiry) : undefined,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
      };
      
      return await apiRequest("/api/vehicles", {
        method: "POST",
        body: JSON.stringify(processedData),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Sucesso",
        description: "Veículo cadastrado com sucesso!",
      });
      onSuccess?.();
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao cadastrar veículo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: FormData) => {
    createVehicleMutation.mutate(data);
  };

  const updateFipeValue = async () => {
    toast({
      title: "Simulação FIPE",
      description: "Em um sistema real, aqui seria feita a consulta à API da FIPE",
    });
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Cadastro de Veículo</h1>
        <div className="flex gap-3">
          <Button variant="outline" onClick={onCancel}>
            Cancelar
          </Button>
          <Button
            onClick={form.handleSubmit(onSubmit)}
            disabled={createVehicleMutation.isPending}
            className="min-w-32"
          >
            {createVehicleMutation.isPending ? "Salvando..." : "Salvar Veículo"}
          </Button>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Dados Básicos
          </TabsTrigger>
          <TabsTrigger value="financial" className="flex items-center gap-2">
            <DollarSign className="w-4 h-4" />
            Financeiro
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Documentação
          </TabsTrigger>
          <TabsTrigger value="technical" className="flex items-center gap-2">
            <Upload className="w-4 h-4" />
            Técnico
          </TabsTrigger>
        </TabsList>

        <form onSubmit={form.handleSubmit(onSubmit)} className="mt-6">
          {/* Aba Dados Básicos */}
          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Identificação do Veículo</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="name">Nome/Identificação *</Label>
                  <Input
                    id="name"
                    {...form.register("name")}
                    placeholder="Ex: Caminhão Mercedes 001"
                  />
                  {form.formState.errors.name && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.name.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="plate">Placa *</Label>
                  <Input
                    id="plate"
                    {...form.register("plate")}
                    placeholder="ABC-1234"
                    className="uppercase"
                  />
                  {form.formState.errors.plate && (
                    <p className="text-sm text-red-600 mt-1">{form.formState.errors.plate.message}</p>
                  )}
                </div>

                <div>
                  <Label htmlFor="brand">Marca *</Label>
                  <Input
                    id="brand"
                    {...form.register("brand")}
                    placeholder="Mercedes-Benz"
                  />
                </div>

                <div>
                  <Label htmlFor="model">Modelo *</Label>
                  <Input
                    id="model"
                    {...form.register("model")}
                    placeholder="Atego 1719"
                  />
                </div>

                <div>
                  <Label htmlFor="renavam">RENAVAM</Label>
                  <Input
                    id="renavam"
                    {...form.register("renavam")}
                    placeholder="12345678901"
                  />
                </div>

                <div>
                  <Label htmlFor="chassis">Chassi</Label>
                  <Input
                    id="chassis"
                    {...form.register("chassis")}
                    placeholder="9BM958124P1234567"
                  />
                </div>

                <div>
                  <Label htmlFor="modelYear">Ano Modelo *</Label>
                  <Input
                    id="modelYear"
                    type="number"
                    {...form.register("modelYear", { valueAsNumber: true })}
                    placeholder="2023"
                  />
                </div>

                <div>
                  <Label htmlFor="manufactureYear">Ano Fabricação *</Label>
                  <Input
                    id="manufactureYear"
                    type="number"
                    {...form.register("manufactureYear", { valueAsNumber: true })}
                    placeholder="2023"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Classificação</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="vehicleType">Tipo de Veículo *</Label>
                  <Select onValueChange={(value) => form.setValue("vehicleType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {VEHICLE_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="classification">Classificação *</Label>
                  <Select onValueChange={(value) => form.setValue("classification", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione a classificação" />
                    </SelectTrigger>
                    <SelectContent>
                      {CLASSIFICATIONS.map((classification) => (
                        <SelectItem key={classification.value} value={classification.value}>
                          {classification.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Configurações de Manutenção</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="preventiveMaintenanceKm">Intervalo Revisão Preventiva</Label>
                  <Select onValueChange={(value) => form.setValue("preventiveMaintenanceKm", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_INTERVALS.map((interval) => (
                        <SelectItem key={interval.value} value={interval.value.toString()}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="tireRotationKm">Intervalo Rodízio de Pneus</Label>
                  <Select onValueChange={(value) => form.setValue("tireRotationKm", parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                      {MAINTENANCE_INTERVALS.map((interval) => (
                        <SelectItem key={interval.value} value={interval.value.toString()}>
                          {interval.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Financeira */}
          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações de Compra</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="purchaseDate">Data de Compra</Label>
                  <Input
                    id="purchaseDate"
                    type="date"
                    {...form.register("purchaseDate")}
                  />
                </div>

                <div>
                  <Label htmlFor="purchaseValue">Valor Total da Compra</Label>
                  <Input
                    id="purchaseValue"
                    type="number"
                    step="0.01"
                    {...form.register("purchaseValue")}
                    placeholder="180000.00"
                  />
                </div>

                <div>
                  <Label htmlFor="financialInstitution">Instituição Financeira</Label>
                  <Input
                    id="financialInstitution"
                    {...form.register("financialInstitution")}
                    placeholder="Banco do Brasil"
                  />
                </div>

                <div>
                  <Label htmlFor="contractType">Tipo de Contrato</Label>
                  <Select onValueChange={(value) => form.setValue("contractType", value)}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione o tipo" />
                    </SelectTrigger>
                    <SelectContent>
                      {CONTRACT_TYPES.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="contractNumber">Número do Contrato</Label>
                  <Input
                    id="contractNumber"
                    {...form.register("contractNumber")}
                    placeholder="CDC123456789"
                  />
                </div>

                <div>
                  <Label htmlFor="installmentCount">Quantidade de Parcelas</Label>
                  <Input
                    id="installmentCount"
                    type="number"
                    {...form.register("installmentCount", { valueAsNumber: true })}
                    placeholder="60"
                  />
                </div>

                <div>
                  <Label htmlFor="installmentValue">Valor da Parcela</Label>
                  <Input
                    id="installmentValue"
                    type="number"
                    step="0.01"
                    {...form.register("installmentValue")}
                    placeholder="3500.00"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  Valor FIPE
                  <Button type="button" variant="outline" onClick={updateFipeValue}>
                    Atualizar FIPE
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="fipeCode">Código FIPE</Label>
                  <Input
                    id="fipeCode"
                    {...form.register("fipeCode")}
                    placeholder="005340-3"
                  />
                </div>

                <div>
                  <Label htmlFor="fipeValue">Valor FIPE Atual</Label>
                  <Input
                    id="fipeValue"
                    type="number"
                    step="0.01"
                    {...form.register("fipeValue")}
                    placeholder="165000.00"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Documentação */}
          <TabsContent value="documents" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentos do Veículo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="crlvExpiry">Vencimento CRLV</Label>
                    <Input
                      id="crlvExpiry"
                      type="date"
                      {...form.register("crlvExpiry")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="tachographExpiry">Vencimento Tacógrafo</Label>
                    <Input
                      id="tachographExpiry"
                      type="date"
                      {...form.register("tachographExpiry")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="anttExpiry">Vencimento ANTT</Label>
                    <Input
                      id="anttExpiry"
                      type="date"
                      {...form.register("anttExpiry")}
                    />
                  </div>

                  <div>
                    <Label htmlFor="insuranceExpiry">Vencimento Seguro</Label>
                    <Input
                      id="insuranceExpiry"
                      type="date"
                      {...form.register("insuranceExpiry")}
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="insuranceValue">Valor do Seguro</Label>
                  <Input
                    id="insuranceValue"
                    type="number"
                    step="0.01"
                    {...form.register("insuranceValue")}
                    placeholder="15000.00"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Aba Técnica */}
          <TabsContent value="technical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Especificações Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="bodyWidth">Largura da Carroceria (m)</Label>
                  <Input
                    id="bodyWidth"
                    type="number"
                    step="0.01"
                    {...form.register("bodyWidth")}
                    placeholder="2.45"
                  />
                </div>

                <div>
                  <Label htmlFor="floorHeight">Altura Chão-Assoalho (m)</Label>
                  <Input
                    id="floorHeight"
                    type="number"
                    step="0.01"
                    {...form.register("floorHeight")}
                    placeholder="1.20"
                  />
                </div>

                <div>
                  <Label htmlFor="bodyLength">Comprimento da Carroceria (m)</Label>
                  <Input
                    id="bodyLength"
                    type="number"
                    step="0.01"
                    {...form.register("bodyLength")}
                    placeholder="6.20"
                  />
                </div>

                <div>
                  <Label htmlFor="loadCapacity">Capacidade de Carga (kg)</Label>
                  <Input
                    id="loadCapacity"
                    type="number"
                    step="0.01"
                    {...form.register("loadCapacity")}
                    placeholder="8500.00"
                  />
                </div>

                <div>
                  <Label htmlFor="fuelTankCapacity">Capacidade Tanque (L)</Label>
                  <Input
                    id="fuelTankCapacity"
                    type="number"
                    step="0.01"
                    {...form.register("fuelTankCapacity")}
                    placeholder="200.00"
                  />
                </div>

                <div>
                  <Label htmlFor="fuelConsumption">Consumo Médio (km/L)</Label>
                  <Input
                    id="fuelConsumption"
                    type="number"
                    step="0.1"
                    {...form.register("fuelConsumption")}
                    placeholder="4.5"
                  />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Localização</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="currentLocation">Localização Atual</Label>
                  <Input
                    id="currentLocation"
                    {...form.register("currentLocation")}
                    placeholder="São Paulo, SP"
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </form>
      </Tabs>
    </div>
  );
}