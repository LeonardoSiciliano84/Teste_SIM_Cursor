import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { TrendingUp, Save, X, Search } from "lucide-react";
import * as z from "zod";

// Schema for material entry
const materialEntrySchema = z.object({
  materialId: z.string().min(1, "Material é obrigatório"),
  entryType: z.string().min(1, "Tipo de entrada é obrigatório"),
  quantity: z.string().min(1, "Quantidade é obrigatória"),
  
  // Common entry fields
  nfNumber: z.string().optional(),
  purchaseOrderNumber: z.string().optional(),
  supplier: z.string().optional(),
  
  // Service return fields
  authenticationCode: z.string().optional(),
  withdrawalDate: z.string().optional(),
  withdrawerName: z.string().optional(),
  
  // Contract return fields
  returnerName: z.string().optional(),
  
  // Normal return fields
  observations: z.string().optional(),
});

type MaterialEntryFormData = z.infer<typeof materialEntrySchema>;

interface MaterialEntryFormProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseType?: "central" | "maintenance" | "client";
}

export function MaterialEntryForm({ 
  isOpen, 
  onClose, 
  warehouseType = "central"
}: MaterialEntryFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MaterialEntryFormData>({
    resolver: zodResolver(materialEntrySchema),
    defaultValues: {
      materialId: "",
      entryType: "",
      quantity: "",
      nfNumber: "",
      purchaseOrderNumber: "",
      supplier: "",
      authenticationCode: "",
      withdrawalDate: "",
      withdrawerName: "",
      returnerName: "",
      observations: "",
    },
  });

  // Mock materials for demo - in production would come from API
  const materials = [
    { id: "1", materialNumber: 1001, description: "Óleo Motor 15W40", unitType: "L" },
    { id: "2", materialNumber: 1002, description: "Filtro de Ar Caminhão", unitType: "pç" },
    { id: "3", materialNumber: 1003, description: "Pneu 295/80R22.5", unitType: "pç" },
  ];

  const filteredMaterials = materials.filter(material =>
    material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.materialNumber.toString().includes(searchTerm)
  );

  const entryTypes = [
    { value: "entrada_comum", label: "✅ Entrada Comum" },
    { value: "devolucao_servico", label: "🔁 Devolução de Material Acautelado (Serviço)" },
    { value: "devolucao_contratacao", label: "🧢 Devolução de Material Acautelado (Contratação)" },
    { value: "devolucao_normal", label: "↩ Devolução Normal" },
  ];

  const createMutation = useMutation({
    mutationFn: async (data: MaterialEntryFormData) => {
      const endpoint = warehouseType === "client" 
        ? "/api/warehouse/client-entries" 
        : "/api/warehouse/central-entries";
      
      return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Entrada de material registrada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["warehouse-entries"] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro!",
        description: `Erro ao registrar entrada: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MaterialEntryFormData) => {
    setIsLoading(true);
    createMutation.mutate(data);
    setIsLoading(false);
  };

  const handleClose = () => {
    form.reset();
    setSelectedMaterial(null);
    setSearchTerm("");
    onClose();
  };

  const handleMaterialSelect = (material: any) => {
    setSelectedMaterial(material);
    form.setValue("materialId", material.id);
  };

  const selectedEntryType = form.watch("entryType");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Lançar Entrada de Material
          </DialogTitle>
          <DialogDescription>
            Registre a entrada de material no almoxarifado
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            {/* Seleção de Material */}
            <div className="space-y-2">
              <FormLabel>Material *</FormLabel>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                <Input
                  placeholder="Buscar material..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                  data-testid="input-search-material"
                />
              </div>
              
              {searchTerm && (
                <div className="border rounded-md max-h-40 overflow-y-auto">
                  {filteredMaterials.map((material) => (
                    <div
                      key={material.id}
                      className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
                      onClick={() => handleMaterialSelect(material)}
                      data-testid={`material-option-${material.id}`}
                    >
                      <div className="font-medium">{material.description}</div>
                      <div className="text-sm text-gray-500">
                        Nº {material.materialNumber} - {material.unitType}
                      </div>
                    </div>
                  ))}
                </div>
              )}
              
              {selectedMaterial && (
                <div className="p-3 bg-blue-50 rounded-md">
                  <div className="font-medium text-blue-900">
                    Material selecionado: {selectedMaterial.description}
                  </div>
                  <div className="text-sm text-blue-700">
                    Nº {selectedMaterial.materialNumber} - {selectedMaterial.unitType}
                  </div>
                </div>
              )}
            </div>

            {/* Tipo de Entrada */}
            <FormField
              control={form.control}
              name="entryType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Entrada *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-entry-type">
                        <SelectValue placeholder="Selecione o tipo de entrada" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {entryTypes.map((type) => (
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

            {/* Quantidade */}
            <FormField
              control={form.control}
              name="quantity"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Quantidade *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      data-testid="input-quantity"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Campos específicos por tipo de entrada */}
            {selectedEntryType === "entrada_comum" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="nfNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº NF</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: 123456" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="purchaseOrderNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº Ordem de Compra</FormLabel>
                      <FormControl>
                        <Input placeholder="Ex: OC-2025-001" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="supplier"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fornecedor</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome do fornecedor" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedEntryType === "devolucao_servico" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="authenticationCode"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nº de Autenticação *</FormLabel>
                      <FormControl>
                        <Input placeholder="Código de autenticação" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="withdrawalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Retirada</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="withdrawerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Retirante</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {selectedEntryType === "devolucao_contratacao" && (
              <FormField
                control={form.control}
                name="returnerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Devolvente *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {selectedEntryType === "devolucao_normal" && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="withdrawerName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome do Retirante</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="withdrawalDate"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Data da Retirada</FormLabel>
                      <FormControl>
                        <Input type="date" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            {/* Observações */}
            <FormField
              control={form.control}
              name="observations"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Observações</FormLabel>
                  <FormControl>
                    <Textarea 
                      placeholder="Observações adicionais..." 
                      {...field} 
                      rows={3}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                disabled={isLoading}
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isLoading || !selectedMaterial}
                data-testid="button-save-entry"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Registrando..." : "Registrar Entrada"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
