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
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Package, Save, X, Search, Plus, Trash2, FileText } from "lucide-react";
import * as z from "zod";

// Schema for material exit
const materialExitSchema = z.object({
  exitType: z.string().min(1, "Tipo de saída é obrigatório"),
  vehiclePlate: z.string().optional(),
  withdrawerName: z.string().min(1, "Nome do retirante é obrigatório"),
  observations: z.string().optional(),
  items: z.array(z.object({
    materialId: z.string(),
    quantity: z.string(),
    materialDescription: z.string(),
    materialNumber: z.number(),
    unitType: z.string(),
  })).min(1, "Pelo menos um item deve ser adicionado"),
});

type MaterialExitFormData = z.infer<typeof materialExitSchema>;

interface MaterialExitFormProps {
  isOpen: boolean;
  onClose: () => void;
  warehouseType?: "central" | "maintenance" | "client";
}

export function MaterialExitForm({ 
  isOpen, 
  onClose, 
  warehouseType = "central"
}: MaterialExitFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [selectedMaterial, setSelectedMaterial] = useState<any>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [exitItems, setExitItems] = useState<any[]>([]);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MaterialExitFormData>({
    resolver: zodResolver(materialExitSchema),
    defaultValues: {
      exitType: "",
      vehiclePlate: "",
      withdrawerName: "",
      observations: "",
      items: [],
    },
  });

  // Mock materials for demo - in production would come from API
  const materials = [
    { id: "1", materialNumber: 1001, description: "Óleo Motor 15W40", unitType: "L", currentQuantity: 45 },
    { id: "2", materialNumber: 1002, description: "Filtro de Ar Caminhão", unitType: "pç", currentQuantity: 8 },
    { id: "3", materialNumber: 1003, description: "Pneu 295/80R22.5", unitType: "pç", currentQuantity: 25 },
  ];

  const filteredMaterials = materials.filter(material =>
    material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.materialNumber.toString().includes(searchTerm)
  );

  const exitTypes = warehouseType === "maintenance" 
    ? [
        { value: "normal", label: "Normal" },
        { value: "descarte", label: "Descarte" },
      ]
    : [
        { value: "normal", label: "Normal" },
        { value: "descarte", label: "Descarte" },
        { value: "acautelamento_servico", label: "Acautelamento Serviço" },
        { value: "acautelamento_contratacao", label: "Acautelamento Contratação" },
      ];

  const createMutation = useMutation({
    mutationFn: async (data: MaterialExitFormData) => {
      const endpoint = warehouseType === "client" 
        ? "/api/warehouse/client-exits" 
        : "/api/warehouse/central-exits";
      
      return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Saída de material registrada com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["warehouse-exits"] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro!",
        description: `Erro ao registrar saída: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MaterialExitFormData) => {
    setIsLoading(true);
    data.items = exitItems;
    createMutation.mutate(data);
    setIsLoading(false);
  };

  const handleClose = () => {
    form.reset();
    setSelectedMaterial(null);
    setSearchTerm("");
    setExitItems([]);
    onClose();
  };

  const handleMaterialSelect = (material: any) => {
    setSelectedMaterial(material);
  };

  const handleAddItem = () => {
    if (!selectedMaterial) return;
    
    const quantity = form.getValues("quantity");
    if (!quantity || parseFloat(quantity) <= 0) {
      toast({
        title: "Erro!",
        description: "Quantidade deve ser maior que zero",
        variant: "destructive",
      });
      return;
    }

    if (parseFloat(quantity) > selectedMaterial.currentQuantity) {
      toast({
        title: "Erro!",
        description: "Quantidade solicitada excede o estoque disponível",
        variant: "destructive",
      });
      return;
    }

    const newItem = {
      materialId: selectedMaterial.id,
      quantity: quantity,
      materialDescription: selectedMaterial.description,
      materialNumber: selectedMaterial.materialNumber,
      unitType: selectedMaterial.unitType,
    };

    setExitItems([...exitItems, newItem]);
    setSelectedMaterial(null);
    form.setValue("quantity", "");
    form.setValue("materialId", "");
  };

  const handleRemoveItem = (index: number) => {
    setExitItems(exitItems.filter((_, i) => i !== index));
  };

  const selectedExitType = form.watch("exitType");

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Registrar Saída de Material
          </DialogTitle>
          <DialogDescription>
            Registre a saída de material do almoxarifado
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Tipo de Saída */}
              <FormField
                control={form.control}
                name="exitType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Saída *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-exit-type">
                          <SelectValue placeholder="Selecione o tipo de saída" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {exitTypes.map((type) => (
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

              {/* Placa do Veículo */}
              <FormField
                control={form.control}
                name="vehiclePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa do Veículo</FormLabel>
                    <FormControl>
                      <Input placeholder="Ex: ABC-1234" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Nome do Retirante */}
              <FormField
                control={form.control}
                name="withdrawerName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome do Retirante *</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Adicionar Itens */}
            <div className="border rounded-lg p-4">
              <h3 className="font-medium mb-4">Adicionar Itens</h3>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                {/* Busca de Material */}
                <div className="space-y-2">
                  <FormLabel>Material</FormLabel>
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      placeholder="Buscar material..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  
                  {searchTerm && (
                    <div className="border rounded-md max-h-32 overflow-y-auto">
                      {filteredMaterials.map((material) => (
                        <div
                          key={material.id}
                          className="p-2 hover:bg-gray-50 cursor-pointer border-b last:border-b-0 text-sm"
                          onClick={() => handleMaterialSelect(material)}
                        >
                          <div className="font-medium">{material.description}</div>
                          <div className="text-xs text-gray-500">
                            Nº {material.materialNumber} - Estoque: {material.currentQuantity} {material.unitType}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Quantidade */}
                <div className="space-y-2">
                  <FormLabel>Quantidade</FormLabel>
                  <Input
                    type="number"
                    placeholder="0"
                    value={form.watch("quantity") || ""}
                    onChange={(e) => form.setValue("quantity", e.target.value)}
                  />
                </div>

                {/* Botão Adicionar */}
                <div className="space-y-2">
                  <FormLabel>&nbsp;</FormLabel>
                  <Button
                    type="button"
                    onClick={handleAddItem}
                    disabled={!selectedMaterial || !form.watch("quantity")}
                    className="w-full"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Adicionar
                  </Button>
                </div>
              </div>

              {/* Material Selecionado */}
              {selectedMaterial && (
                <div className="p-3 bg-blue-50 rounded-md mb-4">
                  <div className="font-medium text-blue-900">
                    Material selecionado: {selectedMaterial.description}
                  </div>
                  <div className="text-sm text-blue-700">
                    Nº {selectedMaterial.materialNumber} - Estoque: {selectedMaterial.currentQuantity} {selectedMaterial.unitType}
                  </div>
                </div>
              )}
            </div>

            {/* Lista de Itens */}
            {exitItems.length > 0 && (
              <div className="border rounded-lg p-4">
                <h3 className="font-medium mb-4">Itens para Saída</h3>
                <div className="space-y-2">
                  {exitItems.map((item, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                      <div className="flex-1">
                        <div className="font-medium">{item.materialDescription}</div>
                        <div className="text-sm text-gray-500">
                          Nº {item.materialNumber} - {item.quantity} {item.unitType}
                        </div>
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveItem(index)}
                        className="text-red-600 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
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
                disabled={isLoading || exitItems.length === 0}
                data-testid="button-save-exit"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Registrando..." : "Registrar Saída"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
