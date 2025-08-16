import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, Save, X } from "lucide-react";
import * as z from "zod";

// Schema for material registration
const materialFormSchema = z.object({
  description: z.string().min(1, "Descrição é obrigatória"),
  unitType: z.string().min(1, "Tipo de unidade é obrigatório"),
  minimumStock: z.string().min(1, "Estoque mínimo é obrigatório"),
  addressing: z.string().optional(),
});

type MaterialFormData = z.infer<typeof materialFormSchema>;

interface MaterialFormProps {
  isOpen: boolean;
  onClose: () => void;
  material?: any; // For editing
  isEditing?: boolean;
  warehouseType?: "central" | "maintenance" | "client";
}

export function MaterialForm({ 
  isOpen, 
  onClose, 
  material, 
  isEditing = false,
  warehouseType = "central"
}: MaterialFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<MaterialFormData>({
    resolver: zodResolver(materialFormSchema),
    defaultValues: {
      description: material?.description || "",
      unitType: material?.unitType || "",
      minimumStock: material?.minimumStock?.toString() || "",
      addressing: material?.addressing || "",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: MaterialFormData) => {
      const endpoint = warehouseType === "client" 
        ? "/api/warehouse/client-materials" 
        : "/api/warehouse/central-materials";
      
      return apiRequest(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: `Material ${isEditing ? "atualizado" : "cadastrado"} com sucesso.`,
      });
      queryClient.invalidateQueries({ queryKey: ["warehouse-materials"] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro!",
        description: `Erro ao ${isEditing ? "atualizar" : "cadastrar"} material: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: MaterialFormData) => {
      const endpoint = warehouseType === "client" 
        ? `/api/warehouse/client-materials/${material.id}` 
        : `/api/warehouse/central-materials/${material.id}`;
      
      return apiRequest(endpoint, {
        method: "PUT",
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Sucesso!",
        description: "Material atualizado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["warehouse-materials"] });
      handleClose();
    },
    onError: (error) => {
      toast({
        title: "Erro!",
        description: `Erro ao atualizar material: ${error.message}`,
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: MaterialFormData) => {
    setIsLoading(true);
    
    if (isEditing) {
      updateMutation.mutate(data);
    } else {
      createMutation.mutate(data);
    }
    
    setIsLoading(false);
  };

  const handleClose = () => {
    form.reset();
    onClose();
  };

  const unitTypes = [
    { value: "pç", label: "Peça (pç)" },
    { value: "kg", label: "Quilograma (kg)" },
    { value: "m", label: "Metro (m)" },
    { value: "L", label: "Litro (L)" },
    { value: "UN", label: "Unidade (UN)" },
    { value: "JG", label: "Jogo (JG)" },
    { value: "CX", label: "Caixa (CX)" },
    { value: "PCT", label: "Pacote (PCT)" },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Plus className="h-5 w-5" />
            {isEditing ? "Editar Material" : "Cadastrar Novo Material"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize os dados do material"
              : "Cadastre um novo material no almoxarifado"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {/* Descrição */}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Descrição *</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: Óleo Motor 15W40" 
                      {...field} 
                      data-testid="input-material-description"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Tipo de Unidade */}
            <FormField
              control={form.control}
              name="unitType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tipo de Unidade *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger data-testid="select-unit-type">
                        <SelectValue placeholder="Selecione o tipo de unidade" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {unitTypes.map((type) => (
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

            {/* Estoque Mínimo */}
            <FormField
              control={form.control}
              name="minimumStock"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Estoque Mínimo *</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder="0" 
                      {...field} 
                      data-testid="input-minimum-stock"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Endereçamento */}
            <FormField
              control={form.control}
              name="addressing"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Endereçamento</FormLabel>
                  <FormControl>
                    <Input 
                      placeholder="Ex: A-12-03" 
                      {...field} 
                      data-testid="input-addressing"
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
                disabled={isLoading}
                data-testid="button-save-material"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? "Salvando..." : (isEditing ? "Atualizar" : "Cadastrar")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
