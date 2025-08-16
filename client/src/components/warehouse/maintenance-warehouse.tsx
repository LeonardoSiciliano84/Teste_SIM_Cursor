import { useState } from "react";
import { Plus, Package, FileDown, Search, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from "@/components/ui/table";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function MaintenanceWarehouse() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados para teste - em produção virão da API
  const maintenanceMaterials = [
    {
      id: "1",
      materialNumber: 3001,
      description: "Óleo Hidráulico",
      unitType: "L",
      currentQuantity: 120,
      minimumStock: 50,
      addressing: "M-A-01",
      isLowStock: false
    },
    {
      id: "2", 
      materialNumber: 3002,
      description: "Filtro de Combustível",
      unitType: "pç",
      currentQuantity: 12,
      minimumStock: 20,
      addressing: "M-B-05",
      isLowStock: true
    },
    {
      id: "3",
      materialNumber: 3003,
      description: "Pastilha de Freio",
      unitType: "JG",
      currentQuantity: 35,
      minimumStock: 15,
      addressing: "M-C-12",
      isLowStock: false
    },
    {
      id: "4",
      materialNumber: 3004,
      description: "Lâmpada H4",
      unitType: "pç",
      currentQuantity: 5,
      minimumStock: 10,
      addressing: "M-D-08",
      isLowStock: true
    }
  ];

  const filteredMaterials = maintenanceMaterials.filter(material =>
    material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.materialNumber.toString().includes(searchTerm)
  );

  const lowStockMaterials = maintenanceMaterials.filter(material => material.isLowStock);

  return (
    <div className="space-y-6">
      {/* Alertas de Estoque Baixo */}
      {lowStockMaterials.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <strong>Atenção!</strong> {lowStockMaterials.length} material(is) com estoque abaixo do mínimo.
          </AlertDescription>
        </Alert>
      )}

      {/* Header com Botões de Ação */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0C29AB]">Estoque da Manutenção</h2>
          <p className="text-gray-600">Controle de materiais para manutenção - Sem opções de acautelamento</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button className="bg-[#0C29AB] hover:bg-[#0C29AB]/90">
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Novo Material
          </Button>
          <Button variant="outline" className="border-[#0C29AB] text-[#0C29AB] hover:bg-[#0C29AB]/10">
            <TrendingUp className="h-4 w-4 mr-2" />
            Lançar Entrada
          </Button>
          <Button variant="outline" className="border-[#0C29AB] text-[#0C29AB] hover:bg-[#0C29AB]/10">
            <Package className="h-4 w-4 mr-2" />
            Registrar Saída
          </Button>
        </div>
      </div>

      {/* Campo de Busca */}
      <div className="flex gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
          <Input
            placeholder="Buscar por material ou número..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-maintenance-materials"
          />
        </div>
        <Button variant="outline" data-testid="button-export-maintenance-list">
          <FileDown className="h-4 w-4 mr-2" />
          Exportar Lista (XLSX)
        </Button>
      </div>

      {/* Botões de Histórico */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="secondary" data-testid="button-maintenance-entry-history">
          Histórico de Entradas
        </Button>
        <Button variant="secondary" data-testid="button-maintenance-exit-history">
          Histórico de Saídas
        </Button>
      </div>

      {/* Tabela de Materiais */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Materiais - Manutenção</CardTitle>
          <CardDescription>
            {filteredMaterials.length} material(is) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº do Material</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Quantidade Atual</TableHead>
                <TableHead>Estoque Mínimo</TableHead>
                <TableHead>Endereçamento</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredMaterials.map((material) => (
                <TableRow key={material.id} data-testid={`row-maintenance-material-${material.id}`}>
                  <TableCell className="font-medium">{material.materialNumber}</TableCell>
                  <TableCell>{material.description}</TableCell>
                  <TableCell>{material.unitType}</TableCell>
                  <TableCell>
                    <span className={material.isLowStock ? "text-orange-600 font-semibold" : ""}>
                      {material.currentQuantity}
                    </span>
                  </TableCell>
                  <TableCell>{material.minimumStock}</TableCell>
                  <TableCell>{material.addressing}</TableCell>
                  <TableCell>
                    {material.isLowStock ? (
                      <Badge variant="destructive">Estoque Baixo</Badge>
                    ) : (
                      <Badge variant="secondary">Normal</Badge>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" data-testid={`button-edit-maintenance-${material.id}`}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" data-testid={`button-delete-maintenance-${material.id}`}>
                        Excluir
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
