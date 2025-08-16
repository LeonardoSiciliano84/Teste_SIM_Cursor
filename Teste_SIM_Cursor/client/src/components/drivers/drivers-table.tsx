import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Eye } from "lucide-react";
import type { Driver, Vehicle } from "@shared/schema";

export default function DriversTable() {
  const [selectedDriver, setSelectedDriver] = useState<Driver | null>(null);
  const [showDriverModal, setShowDriverModal] = useState(false);

  const { data: drivers, isLoading: driversLoading } = useQuery<Driver[]>({
    queryKey: ["/api/drivers"],
  });

  const handleViewDriver = (driver: Driver) => {
    setSelectedDriver(driver);
    setShowDriverModal(true);
  };

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map(word => word.charAt(0))
      .join("")
      .toUpperCase()
      .slice(0, 2);
  };

  const getAvatarColor = (index: number) => {
    const colors = [
      "bg-primary-100 text-primary-600",
      "bg-secondary-100 text-secondary-600",
      "bg-warning-100 text-warning-600",
      "bg-purple-100 text-purple-600",
    ];
    return colors[index % colors.length];
  };

  if (driversLoading) {
    return (
      <Card className="border border-gray-100">
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Motorista
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    CNH
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Ações
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {[1, 2, 3].map((i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-10 h-10 bg-gray-200 rounded-full mr-4"></div>
                        <div>
                          <div className="h-4 bg-gray-200 rounded w-32 mb-1"></div>
                          <div className="h-3 bg-gray-200 rounded w-24"></div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-24"></div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="h-4 bg-gray-200 rounded w-20"></div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border border-gray-100">
      <CardContent className="p-0">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Motorista
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  CNH
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Ações
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {drivers?.map((driver, index) => {
                return (
                  <tr key={driver.id}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-4 ${getAvatarColor(index)}`}>
                          <span className="text-sm font-medium">
                            {getInitials(driver.name)}
                          </span>
                        </div>
                        <div>
                          <div className="text-sm font-medium text-gray-900">{driver.name}</div>
                          <div className="text-sm text-gray-500">{driver.phone}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">{driver.license}</div>
                      <div className="text-sm text-gray-500">Categoria {driver.licenseCategory}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="text-blue-600 hover:text-blue-900"
                        onClick={() => handleViewDriver(driver)}
                      >
                        <Eye className="h-4 w-4 mr-1" />
                        Ver dados do motorista
                      </Button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </CardContent>
      
      {/* Modal de dados do motorista */}
      <Dialog open={showDriverModal} onOpenChange={setShowDriverModal}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Dados do Motorista - {selectedDriver?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedDriver && (
            <div className="space-y-6">
              {/* Dados Pessoais */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Dados Pessoais</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome Completo</label>
                    <p className="text-sm">{selectedDriver.name}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">CPF</label>
                    <p className="text-sm">{selectedDriver.cpf || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Nascimento</label>
                    <p className="text-sm">{selectedDriver.dateOfBirth || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone</label>
                    <p className="text-sm">{selectedDriver.phone}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Email</label>
                    <p className="text-sm">{selectedDriver.email || 'Não informado'}</p>
                  </div>
                </div>
                
                {/* Dados da CNH */}
                <div className="space-y-4">
                  <h3 className="font-semibold text-lg border-b pb-2">Dados da CNH</h3>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Número da CNH</label>
                    <p className="text-sm">{selectedDriver.license}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Categoria</label>
                    <p className="text-sm">{selectedDriver.licenseCategory}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Validade</label>
                    <p className="text-sm">{selectedDriver.licenseExpiry || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">UF Emissor</label>
                    <p className="text-sm">{selectedDriver.licenseIssuer || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Data de Emissão</label>
                    <p className="text-sm">{selectedDriver.licenseIssueDate || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* Endereço */}
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Endereço</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Endereço</label>
                    <p className="text-sm">{selectedDriver.address || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Cidade</label>
                    <p className="text-sm">{selectedDriver.city || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado</label>
                    <p className="text-sm">{selectedDriver.state || 'Não informado'}</p>
                  </div>
                </div>
              </div>

              {/* Informações de Emergência */}
              <div>
                <h3 className="font-semibold text-lg border-b pb-2 mb-4">Contato de Emergência</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Nome do Contato</label>
                    <p className="text-sm">{selectedDriver.emergencyContact || 'Não informado'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-500">Telefone de Emergência</label>
                    <p className="text-sm">{selectedDriver.emergencyPhone || 'Não informado'}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </Card>
  );
}
