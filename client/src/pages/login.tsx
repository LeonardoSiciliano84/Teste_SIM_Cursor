import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { loginSchema, type LoginData } from "@shared/schema";
import { authManager } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent } from "@/components/ui/card";
import { Truck } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function Login() {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const form = useForm<LoginData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginData) => {
    setIsLoading(true);
    try {
      const result = await authManager.login(data.email, data.password);
      if (!result.success) {
        toast({
          title: "Erro de login",
          description: result.error || "Credenciais inválidas",
          variant: "destructive",
        });
      }
    } catch (error) {
      toast({
        title: "Erro",
        description: "Erro de conexão com o servidor",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-400 via-primary to-blue-800 p-4">
      <Card className="w-full max-w-md shadow-2xl">
        <CardContent className="pt-8 p-8">
          <div className="text-center mb-8">
            <div className="flex justify-center mb-6">
              <div className="bg-white p-4 rounded-xl shadow-lg">
                <img 
                  src="/src/assets/felka-logo.svg" 
                  alt="Felka Transportes" 
                  className="h-16 w-auto"
                />
              </div>
            </div>
            <h1 className="text-2xl font-bold text-gray-900">Sistema FELKA Transportes</h1>
            <p className="text-gray-600">Gestão Completa de Frota</p>
          </div>

          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <Label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-2">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                {...form.register("email")}
                className="w-full"
              />
              {form.formState.errors.email && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.email.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                {...form.register("password")}
                className="w-full"
              />
              {form.formState.errors.password && (
                <p className="text-sm text-red-600 mt-1">{form.formState.errors.password.message}</p>
              )}
            </div>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Checkbox id="remember" />
                <Label htmlFor="remember" className="text-sm text-gray-600">
                  Lembrar-me
                </Label>
              </div>
              <a href="#" className="text-sm text-primary hover:text-primary/80">
                Esqueceu a senha?
              </a>
            </div>

            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Não tem uma conta?{" "}
              <a href="#" className="text-primary hover:text-primary/80 font-medium">
                Cadastre-se
              </a>
            </p>
          </div>

          <div className="mt-4 text-xs text-gray-500 text-center">
            <p>Credenciais de teste:</p>
            <p>Email: admin@felka.com</p>
            <p>Senha: admin123</p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
