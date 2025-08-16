import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertExternalPersonSchema } from "@shared/schema";
import type { z } from "zod";
import { Upload, User, Building, Phone, Mail, Camera } from "lucide-react";

type ExternalPersonFormData = z.infer<typeof insertExternalPersonSchema>;

interface ExternalPersonFormProps {
  isOpen: boolean;
  onClose: () => void;
  externalPerson?: any;
  isEditing?: boolean;
}

export function ExternalPersonForm({ 
  isOpen, 
  onClose, 
  externalPerson, 
  isEditing = false 
}: ExternalPersonFormProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [photoPreview, setPhotoPreview] = useState<string>("");

  const form = useForm<ExternalPersonFormData>({
    resolver: zodResolver(insertExternalPersonSchema),
    defaultValues: {
      fullName: externalPerson?.fullName || "",
      email: externalPerson?.email || "",
      phone: externalPerson?.phone || "",
      companyName: externalPerson?.companyName || "",
      personType: externalPerson?.personType || "cliente",
      photo: externalPerson?.photo || "",
      document: externalPerson?.document || "",
      position: externalPerson?.position || "",
      accessLevel: externalPerson?.accessLevel || "cliente",
      status: externalPerson?.status || "ativo",
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: ExternalPersonFormData) => {
      const endpoint = isEditing ? `/api/external-persons/${externalPerson.id}` : '/api/external-persons';
      const method = isEditing ? 'PUT' : 'POST';
      return apiRequest(endpoint, method, data);
    },
    onSuccess: (data) => {
      toast({
        title: isEditing ? "Terceiro atualizado" : "Terceiro cadastrado",
        description: isEditing 
          ? "Os dados foram atualizados com sucesso." 
          : `${data.fullName} foi cadastrado com sucesso. Dados de acesso enviados por e-mail.`,
      });
      queryClient.invalidateQueries({ queryKey: ["/api/external-persons"] });
      form.reset();
      setPhotoPreview("");
      onClose();
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cadastrar terceiro",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  const handlePhotoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setPhotoPreview(result);
        form.setValue("photo", result);
      };
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = (data: ExternalPersonFormData) => {
    createMutation.mutate(data);
  };

  const handleClose = () => {
    form.reset();
    setPhotoPreview("");
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            {isEditing ? "Editar Terceiro" : "Cadastro de Terceiro"}
          </DialogTitle>
          <DialogDescription>
            {isEditing 
              ? "Atualize os dados do terceiro cadastrado"
              : "Cadastre um novo cliente ou porteiro de empresa terceirizada"
            }
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Foto */}
              <div className="md:col-span-2">
                <Label htmlFor="photo">Foto (Opcional)</Label>
                <div className="flex items-center gap-4 mt-2">
                  <div className="flex-1">
                    <Input
                      id="photo"
                      type="file"
                      accept="image/*"
                      onChange={handlePhotoChange}
                      className="cursor-pointer"
                      data-testid="input-photo"
                    />
                  </div>
                  {photoPreview && (
                    <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-gray-200">
                      <img 
                        src={photoPreview} 
                        alt="Preview" 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  {!photoPreview && (
                    <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center border-2 border-gray-200">
                      <Camera className="h-6 w-6 text-gray-400" />
                    </div>
                  )}
                </div>
              </div>

              {/* Nome completo */}
              <FormField
                control={form.control}
                name="fullName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome Completo *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          {...field} 
                          className="pl-10" 
                          placeholder="Digite o nome completo"
                          data-testid="input-full-name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Email */}
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-mail *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          {...field} 
                          type="email"
                          className="pl-10" 
                          placeholder="email@empresa.com"
                          data-testid="input-email"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Telefone */}
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          {...field} 
                          className="pl-10" 
                          placeholder="(11) 99999-9999"
                          data-testid="input-phone"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Empresa */}
              <FormField
                control={form.control}
                name="companyName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Empresa *</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                        <Input 
                          {...field} 
                          className="pl-10" 
                          placeholder="Nome da empresa terceirizada"
                          data-testid="input-company-name"
                        />
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Tipo de Permissão */}
              <FormField
                control={form.control}
                name="personType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Permissão *</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger data-testid="select-person-type">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="cliente">Cliente</SelectItem>
                        <SelectItem value="porteiro">Porteiro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Cargo/Posição */}
              <FormField
                control={form.control}
                name="position"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cargo/Posição</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="Ex: Gerente, Porteiro, Supervisor"
                        data-testid="input-position"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* CPF/CNPJ */}
              <FormField
                control={form.control}
                name="document"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>CPF/CNPJ</FormLabel>
                    <FormControl>
                      <Input 
                        {...field} 
                        placeholder="000.000.000-00 ou 00.000.000/0001-00"
                        data-testid="input-document"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={handleClose}
                data-testid="button-cancel"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={createMutation.isPending}
                className="bg-[#0C29AB] hover:bg-[#0A2299]"
                data-testid="button-submit"
              >
                {createMutation.isPending ? "Salvando..." : isEditing ? "Atualizar" : "Cadastrar"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}