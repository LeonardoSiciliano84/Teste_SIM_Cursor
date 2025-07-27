import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  User, 
  Settings, 
  Shield, 
  LogOut, 
  ChevronDown,
  Mail,
  Phone,
  Calendar
} from "lucide-react";
import { useAuth } from "@/lib/auth";

export default function Header() {
  const { user, logout } = useAuth();
  const [showProfile, setShowProfile] = useState(false);
  const [showSecurity, setShowSecurity] = useState(false);

  if (!user) return null;

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "admin":
        return <Badge className="bg-red-100 text-red-800">Administrador</Badge>;
      case "user":
        return <Badge className="bg-blue-100 text-blue-800">Usuário</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <>
      <header className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">FELKA Transportes</h1>
            <Badge className="bg-green-100 text-green-800">Sistema Online</Badge>
          </div>

          <div className="flex items-center space-x-4">
            {/* Informações do usuário */}
            <div className="text-right hidden md:block">
              <p className="text-sm font-medium text-gray-900">{user.name}</p>
              <p className="text-xs text-gray-500">{user.email}</p>
            </div>

            {/* Menu do usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center space-x-2">
                  <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                    <User className="w-4 h-4 text-white" />
                  </div>
                  <ChevronDown className="w-4 h-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={() => setShowProfile(true)}>
                  <User className="w-4 h-4 mr-2" />
                  Ver Perfil
                </DropdownMenuItem>
                
                <DropdownMenuItem onClick={() => setShowSecurity(true)}>
                  <Shield className="w-4 h-4 mr-2" />
                  Segurança
                </DropdownMenuItem>
                
                <DropdownMenuItem>
                  <Settings className="w-4 h-4 mr-2" />
                  Configurações
                </DropdownMenuItem>
                
                <DropdownMenuSeparator />
                
                <DropdownMenuItem onClick={logout} className="text-red-600">
                  <LogOut className="w-4 h-4 mr-2" />
                  Sair do Sistema
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Modal de Perfil */}
      <Dialog open={showProfile} onOpenChange={setShowProfile}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Perfil do Usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="w-16 h-16 bg-blue-600 rounded-full flex items-center justify-center">
                <User className="w-8 h-8 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold">{user.name}</h3>
                {getRoleBadge(user.role)}
              </div>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-3">
                <Mail className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Email</p>
                  <p className="font-medium">{user.email}</p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Membro desde</p>
                  <p className="font-medium">
                    {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Shield className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">Tipo de Acesso</p>
                  <p className="font-medium">
                    {user.role === 'admin' ? 'Administrador do Sistema' : 'Usuário Padrão'}
                  </p>
                </div>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <Button variant="outline" onClick={() => setShowProfile(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setShowProfile(false);
                alert("Funcionalidade de edição de perfil em desenvolvimento");
              }}>
                Editar Perfil
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Segurança */}
      <Dialog open={showSecurity} onOpenChange={setShowSecurity}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Configurações de Segurança</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="space-y-4">
              <div className="p-4 bg-green-50 rounded-lg">
                <div className="flex items-center space-x-2">
                  <Shield className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">Conta Protegida</span>
                </div>
                <p className="text-sm text-green-700 mt-1">
                  Sua conta está protegida com senha segura
                </p>
              </div>

              <div className="space-y-3">
                <Button className="w-full" onClick={() => {
                  alert("Funcionalidade de alteração de senha em desenvolvimento");
                }}>
                  Alterar Senha
                </Button>

                <Button variant="outline" className="w-full" onClick={() => {
                  alert("Funcionalidade de autenticação em dois fatores em desenvolvimento");
                }}>
                  Ativar 2FA
                </Button>

                <Button variant="outline" className="w-full" onClick={() => {
                  alert("Histórico de login em desenvolvimento");
                }}>
                  Ver Histórico de Login
                </Button>
              </div>
            </div>

            <div className="flex justify-end">
              <Button variant="outline" onClick={() => setShowSecurity(false)}>
                Fechar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}