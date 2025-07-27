import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { CalendarDays, Upload, DollarSign, FileText, Settings, ArrowLeft } from "lucide-react";
import { insertVehicleSchema, type Vehicle } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

// Schema para edição (todos os campos opcionais exceto o que queremos validar)
const editVehicleSchema = insertVehicleSchema.partial().extend({
  purchaseDate: z.string().optional(),
  crlvExpiry: z.string().optional(),
  tachographExpiry: z.string().optional(),
  anttExpiry: z.string().optional(),
  insuranceExpiry: z.string().optional(),
});
type EditFormData = z.infer<typeof editVehicleSchema>;

interface VehicleEditProps {
  vehicleId: string;
  onCancel: () => void;
}

export default function VehicleEdit({ vehicleId, onCancel }: VehicleEditProps) {
  const [activeTab, setActiveTab] = useState("basic");
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [, setLocation] = useLocation();

  // Buscar dados do veículo
  const { data: vehicle, isLoading } = useQuery<Vehicle>({
    queryKey: ["/api/vehicles", vehicleId],
    queryFn: async () => {
      const response = await fetch(`/api/vehicles/${vehicleId}`);
      if (!response.ok) {
        throw new Error('Veículo não encontrado');
      }
      return response.json();
    },
  });

  const form = useForm<EditFormData>({
    resolver: zodResolver(editVehicleSchema),
    defaultValues: {},
  });

  // Atualizar form quando dados chegarem
  useEffect(() => {
    if (vehicle) {
      // Converter datas para formato string (yyyy-mm-dd) e remover campos que não são editáveis
      const { id, createdAt, updatedAt, ...editableFields } = vehicle;
      const formattedVehicle = {
        ...editableFields,
        purchaseDate: vehicle.purchaseDate ? new Date(vehicle.purchaseDate).toISOString().split('T')[0] : undefined,
        crlvExpiry: vehicle.crlvExpiry ? new Date(vehicle.crlvExpiry).toISOString().split('T')[0] : undefined,
        tachographExpiry: vehicle.tachographExpiry ? new Date(vehicle.tachographExpiry).toISOString().split('T')[0] : undefined,
        anttExpiry: vehicle.anttExpiry ? new Date(vehicle.anttExpiry).toISOString().split('T')[0] : undefined,
        insuranceExpiry: vehicle.insuranceExpiry ? new Date(vehicle.insuranceExpiry).toISOString().split('T')[0] : undefined,
      };
      form.reset(formattedVehicle);
    }
  }, [vehicle, form]);

  const updateVehicleMutation = useMutation({
    mutationFn: async (data: EditFormData) => {
      // Converter datas string para Date objects
      const processedData = {
        ...data,
        purchaseDate: data.purchaseDate ? new Date(data.purchaseDate) : undefined,
        crlvExpiry: data.crlvExpiry ? new Date(data.crlvExpiry) : undefined,
        tachographExpiry: data.tachographExpiry ? new Date(data.tachographExpiry) : undefined,
        anttExpiry: data.anttExpiry ? new Date(data.anttExpiry) : undefined,
        insuranceExpiry: data.insuranceExpiry ? new Date(data.insuranceExpiry) : undefined,
      };

      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(processedData),
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }

      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles", vehicleId] });
      toast({
        title: "Sucesso",
        description: "Veículo atualizado com sucesso!",
      });
      setLocation("/vehicles");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar veículo",
        variant: "destructive",
      });
    },
  });

  const deleteVehicleMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/vehicles/${vehicleId}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error(`Erro ${response.status}: ${response.statusText}`);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/vehicles"] });
      toast({
        title: "Sucesso",
        description: "Veículo excluído com sucesso!",
      });
      setLocation("/vehicles");
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir veículo",
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: EditFormData) => {
    updateVehicleMutation.mutate(data);
  };

  const handleDelete = () => {
    if (window.confirm("Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.")) {
      deleteVehicleMutation.mutate();
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: string) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const formData = new FormData();
    Array.from(files).forEach(file => {
      formData.append('files', file);
    });

    try {
      const response = await fetch(`/api/vehicles/${vehicleId}/upload`, {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Erro no upload');
      }

      const result = await response.json();
      toast({
        title: "Upload Realizado",
        description: result.message,
      });
    } catch (error) {
      toast({
        title: "Erro no Upload",
        description: "Erro ao fazer upload dos arquivos",
        variant: "destructive",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Carregando dados do veículo...</p>
        </div>
      </div>
    );
  }

  if (!vehicle) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Veículo não encontrado</p>
        <Button onClick={() => setLocation("/vehicles")} className="mt-4">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Voltar para Lista
        </Button>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={() => setLocation("/vehicles")}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <h1 className="text-2xl font-bold text-gray-900">
            Editar Veículo - {vehicle.name}
          </h1>
        </div>
        <div className="flex gap-3">
          <Button
            variant="destructive"
            onClick={handleDelete}
            disabled={deleteVehicleMutation.isPending}
          >
            {deleteVehicleMutation.isPending ? "Excluindo..." : "Excluir"}
          </Button>
        </div>
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)}>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="basic">Principal</TabsTrigger>
            <TabsTrigger value="financial">Financeira</TabsTrigger>
            <TabsTrigger value="documentation">Documentação</TabsTrigger>
            <TabsTrigger value="technical">Técnica</TabsTrigger>
          </TabsList>

          <TabsContent value="basic" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Informações Básicas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="name">Nome do Veículo</Label>
                  <Input id="name" {...form.register("name")} />
                </div>
                <div>
                  <Label htmlFor="plate">Placa</Label>
                  <Input id="plate" {...form.register("plate")} />
                </div>
                <div>
                  <Label htmlFor="brand">Marca</Label>
                  <Input id="brand" {...form.register("brand")} />
                </div>
                <div>
                  <Label htmlFor="model">Modelo</Label>
                  <Input id="model" {...form.register("model")} />
                </div>
                <div>
                  <Label htmlFor="modelYear">Ano do Modelo</Label>
                  <Input id="modelYear" type="number" {...form.register("modelYear", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="manufactureYear">Ano de Fabricação</Label>
                  <Input id="manufactureYear" type="number" {...form.register("manufactureYear", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="status">Status</Label>
                  <Select value={form.watch("status")} onValueChange={(value) => form.setValue("status", value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Ativo</SelectItem>
                      <SelectItem value="maintenance">Em Manutenção</SelectItem>
                      <SelectItem value="inactive">Inativo</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="financial" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Dados Financeiros</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="purchaseValue">Valor de Compra</Label>
                  <Input id="purchaseValue" {...form.register("purchaseValue")} />
                </div>
                <div>
                  <Label htmlFor="purchaseDate">Data de Compra</Label>
                  <Input id="purchaseDate" type="date" {...form.register("purchaseDate")} />
                </div>
                <div>
                  <Label htmlFor="financialInstitution">Instituição Financeira</Label>
                  <Input id="financialInstitution" {...form.register("financialInstitution")} />
                </div>
                <div>
                  <Label htmlFor="contractType">Tipo de Contrato</Label>
                  <Select value={form.watch("contractType") || ""} onValueChange={(value) => form.setValue("contractType", value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="CDC">CDC</SelectItem>
                      <SelectItem value="Leasing">Leasing</SelectItem>
                      <SelectItem value="Consórcio">Consórcio</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="installmentCount">Quantidade de Parcelas</Label>
                  <Input id="installmentCount" type="number" {...form.register("installmentCount", { valueAsNumber: true })} />
                </div>
                <div>
                  <Label htmlFor="installmentValue">Valor da Parcela</Label>
                  <Input id="installmentValue" {...form.register("installmentValue")} placeholder="R$ 0,00" />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="documentation" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Documentação e Upload</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* CRLV */}
                <div>
                  <h4 className="font-semibold mb-3">CRLV - Certificado de Registro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="crlvExpiry">Vencimento CRLV</Label>
                      <Input id="crlvExpiry" type="date" {...form.register("crlvExpiry")} />
                    </div>
                    <div>
                      <Label htmlFor="crlvUpload">Upload CRLV</Label>
                      <Input
                        id="crlvUpload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'crlv')}
                      />
                    </div>
                  </div>
                </div>

                {/* Tacógrafo */}
                <div>
                  <h4 className="font-semibold mb-3">Tacógrafo</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="tachographExpiry">Vencimento Tacógrafo</Label>
                      <Input id="tachographExpiry" type="date" {...form.register("tachographExpiry")} />
                    </div>
                    <div>
                      <Label htmlFor="tachographUpload">Upload Tacógrafo</Label>
                      <Input
                        id="tachographUpload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'tachograph')}
                      />
                    </div>
                  </div>
                </div>

                {/* ANTT */}
                <div>
                  <h4 className="font-semibold mb-3">ANTT - Registro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="anttExpiry">Vencimento ANTT</Label>
                      <Input id="anttExpiry" type="date" {...form.register("anttExpiry")} />
                    </div>
                    <div>
                      <Label htmlFor="anttUpload">Upload ANTT</Label>
                      <Input
                        id="anttUpload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'antt')}
                      />
                    </div>
                  </div>
                </div>

                {/* Seguro */}
                <div>
                  <h4 className="font-semibold mb-3">Seguro</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="insuranceExpiry">Vencimento Seguro</Label>
                      <Input id="insuranceExpiry" type="date" {...form.register("insuranceExpiry")} />
                    </div>
                    <div>
                      <Label htmlFor="insuranceUpload">Upload Apólice</Label>
                      <Input
                        id="insuranceUpload"
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={(e) => handleFileUpload(e, 'insurance')}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="technical" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Especificações Técnicas</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="bodyWidth">Largura (m)</Label>
                  <Input id="bodyWidth" {...form.register("bodyWidth")} />
                </div>
                <div>
                  <Label htmlFor="bodyLength">Comprimento (m)</Label>
                  <Input id="bodyLength" {...form.register("bodyLength")} />
                </div>
                <div>
                  <Label htmlFor="loadCapacity">Capacidade de Carga (kg)</Label>
                  <Input id="loadCapacity" {...form.register("loadCapacity")} />
                </div>
                <div>
                  <Label htmlFor="fuelConsumption">Consumo (km/L)</Label>
                  <Input id="fuelConsumption" {...form.register("fuelConsumption")} />
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Fotos do Veículo</CardTitle>
              </CardHeader>
              <CardContent>
                <div>
                  <Label htmlFor="vehiclePhotos">Upload de Fotos</Label>
                  <Input
                    id="vehiclePhotos"
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={(e) => handleFileUpload(e, 'photos')}
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        <div className="flex justify-end space-x-4 mt-6">
          <Button type="button" variant="outline" onClick={() => setLocation("/vehicles")}>
            Cancelar
          </Button>
          <Button type="submit" disabled={updateVehicleMutation.isPending}>
            {updateVehicleMutation.isPending ? "Salvando..." : "Salvar Alterações"}
          </Button>
        </div>
      </form>
    </div>
  );
}