import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { apiRequest } from "@/lib/queryClient";
import { UserCheck, UserX } from "lucide-react";
import type { Employee } from "@shared/schema";

const statusChangeSchema = z.object({
  reason: z.string().min(10, "Motivo deve ter pelo menos 10 caracteres"),
});

type StatusChangeForm = z.infer<typeof statusChangeSchema>;

interface EmployeeStatusControlProps {
  employee: Employee;
}

export function EmployeeStatusControl({ employee }: EmployeeStatusControlProps) {
  const [showDeactivateDialog, setShowDeactivateDialog] = useState(false);
  const [showReactivateDialog, setShowReactivateDialog] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<StatusChangeForm>({
    resolver: zodResolver(statusChangeSchema),
    defaultValues: {
      reason: "",
    },
  });

  const deactivateMutation = useMutation({
    mutationFn: async (data: StatusChangeForm) => {
      return apiRequest(`/api/employees/${employee.id}/deactivate`, "PATCH", {
        reason: data.reason,
        changedBy: "admin@felka.com", // Aqui deveria vir do contexto de usuário logado
      });
    },
    onSuccess: () => {
      toast({
        title: "Colaborador desativado",
        description: "O colaborador foi desativado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setShowDeactivateDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao desativar colaborador.",
        variant: "destructive",
      });
    },
  });

  const reactivateMutation = useMutation({
    mutationFn: async (data: StatusChangeForm) => {
      return apiRequest(`/api/employees/${employee.id}/reactivate`, "PATCH", {
        reason: data.reason,
        changedBy: "admin@felka.com", // Aqui deveria vir do contexto de usuário logado
      });
    },
    onSuccess: () => {
      toast({
        title: "Colaborador reativado",
        description: "O colaborador foi reativado com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ["/api/employees"] });
      setShowReactivateDialog(false);
      form.reset();
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Erro ao reativar colaborador.",
        variant: "destructive",
      });
    },
  });

  const handleDeactivate = (data: StatusChangeForm) => {
    deactivateMutation.mutate(data);
  };

  const handleReactivate = (data: StatusChangeForm) => {
    reactivateMutation.mutate(data);
  };

  return (
    <>
      {employee.status === "active" ? (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowDeactivateDialog(true)}
          title="Desativar Colaborador"
        >
          <UserX className="w-4 h-4" />
        </Button>
      ) : (
        <Button 
          variant="outline" 
          size="sm"
          onClick={() => setShowReactivateDialog(true)}
          title="Reativar Colaborador"
        >
          <UserCheck className="w-4 h-4" />
        </Button>
      )}

      {/* Modal de Desativação */}
      <Dialog open={showDeactivateDialog} onOpenChange={setShowDeactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Desativar Colaborador</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleDeactivate)} className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Você está prestes a desativar o colaborador <strong>{employee.fullName}</strong>.
                  Esta ação requer um motivo detalhado.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Desativação *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o motivo da desativação do colaborador..."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDeactivateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  variant="destructive"
                  disabled={deactivateMutation.isPending}
                >
                  {deactivateMutation.isPending ? "Desativando..." : "Desativar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Modal de Reativação */}
      <Dialog open={showReactivateDialog} onOpenChange={setShowReactivateDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Reativar Colaborador</DialogTitle>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleReactivate)} className="space-y-4">
              <div>
                <p className="text-sm text-muted-foreground mb-4">
                  Você está prestes a reativar o colaborador <strong>{employee.fullName}</strong>.
                  Esta ação requer um motivo detalhado.
                </p>
              </div>
              
              <FormField
                control={form.control}
                name="reason"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Motivo da Reativação *</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva o motivo da reativação do colaborador..."
                        {...field}
                        rows={4}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowReactivateDialog(false)}
                >
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={reactivateMutation.isPending}
                >
                  {reactivateMutation.isPending ? "Reativando..." : "Reativar"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
    </>
  );
}