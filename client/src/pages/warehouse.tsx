/**
 * MÓDULO DE ALMOXARIFADO - FELKA TRANSPORTES
 * 
 * Página principal com dois submódulos:
 * 1. Almoxarifado Central
 * 2. Controle de Armazéns de Clientes
 * 
 * Implementação seguindo PRD exato
 */

import { useState } from "react";
import { Plus, Package, FileDown, Search, TrendingUp, AlertTriangle } from "lucide-react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
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

// Componente do Almoxarifado Central
function CentralWarehouse() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados para teste - em produção virão da API
  const centralMaterials = [
    {
      id: "1",
      materialNumber: 1001,
      description: "Óleo Motor 15W40",
      unitType: "L",
      currentQuantity: 45,
      minimumStock: 20,
      addressing: "A-12-03",
      isLowStock: false
    },
    {
      id: "2", 
      materialNumber: 1002,
      description: "Filtro de Ar Caminhão",
      unitType: "pç",
      currentQuantity: 8,
      minimumStock: 15,
      addressing: "B-05-01",
      isLowStock: true
    },
    {
      id: "3",
      materialNumber: 1003,
      description: "Pneu 295/80R22.5",
      unitType: "pç",
      currentQuantity: 25,
      minimumStock: 10,
      addressing: "C-01-07",
      isLowStock: false
    }
  ];

  const filteredMaterials = centralMaterials.filter(material =>
    material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.materialNumber.toString().includes(searchTerm)
  );

  const lowStockMaterials = centralMaterials.filter(material => material.isLowStock);

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
          <h2 className="text-2xl font-bold text-[#0C29AB]">Almoxarifado Central</h2>
          <p className="text-gray-600">Controle de materiais e movimentações</p>
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
            data-testid="input-search-materials"
          />
        </div>
        <Button variant="outline" data-testid="button-export-list">
          <FileDown className="h-4 w-4 mr-2" />
          Exportar Lista (XLSX)
        </Button>
      </div>

      {/* Botões de Histórico */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="secondary" data-testid="button-entry-history">
          Histórico de Entradas
        </Button>
        <Button variant="secondary" data-testid="button-exit-history">
          Histórico de Saídas
        </Button>
      </div>

      {/* Tabela de Materiais */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Materiais</CardTitle>
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
                <TableRow key={material.id} data-testid={`row-material-${material.id}`}>
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
                      <Button size="sm" variant="outline" data-testid={`button-edit-${material.id}`}>
                        Editar
                      </Button>
                      <Button size="sm" variant="outline" className="text-red-600 hover:text-red-700" data-testid={`button-delete-${material.id}`}>
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

// Componente do Controle de Armazéns de Clientes
function ClientWarehouse() {
  const [searchTerm, setSearchTerm] = useState("");

  // Dados mockados para teste - em produção virão da API
  const clientMaterials = [
    {
      id: "1",
      materialNumber: 2001,
      description: "Peça Motor Diesel",
      partNumber: "MT-4567-89",
      client: "Empresa ABC Ltda",
      warehouse: "1",
      addressing: "W1-A-15",
      unitType: "pç",
      currentQuantity: 150
    },
    {
      id: "2",
      materialNumber: 2002,
      description: "Filtro Hidráulico",
      partNumber: "FH-1234-56",
      client: "Transportes XYZ",
      warehouse: "3",
      addressing: "W3-B-08",
      unitType: "pç", 
      currentQuantity: 75
    },
    {
      id: "3",
      materialNumber: 2003,
      description: "Óleo Transmissão",
      partNumber: "OT-9876-54",
      client: "Logística DEF",
      warehouse: "2",
      addressing: "W2-C-22",
      unitType: "L",
      currentQuantity: 200
    }
  ];

  const filteredClientMaterials = clientMaterials.filter(material =>
    material.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.partNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    material.client.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Header com Botões de Ação */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
        <div>
          <h2 className="text-2xl font-bold text-[#0C29AB]">Controle de Armazéns de Clientes</h2>
          <p className="text-gray-600">Gestão de materiais de clientes nos armazéns 1 a 5</p>
        </div>
        
        <div className="flex flex-wrap gap-2">
          <Button className="bg-[#0C29AB] hover:bg-[#0C29AB]/90">
            <Plus className="h-4 w-4 mr-2" />
            Cadastrar Novo Material
          </Button>
          <Button variant="outline" className="border-[#0C29AB] text-[#0C29AB] hover:bg-[#0C29AB]/10">
            <TrendingUp className="h-4 w-4 mr-2" />
            Registrar Entrada
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
            placeholder="Buscar por material, part number ou cliente..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
            data-testid="input-search-client-materials"
          />
        </div>
      </div>

      {/* Botões de Ação Secundários */}
      <div className="flex gap-2 flex-wrap">
        <Button variant="secondary" data-testid="button-movement-history">
          Histórico de Movimentações
        </Button>
        <Button variant="secondary" data-testid="button-storage-dashboard">
          Dashboard de Armazenagem
        </Button>
      </div>

      {/* Tabela de Materiais de Clientes */}
      <Card>
        <CardHeader>
          <CardTitle>Lista de Materiais de Clientes</CardTitle>
          <CardDescription>
            {filteredClientMaterials.length} material(is) encontrado(s)
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nº Material</TableHead>
                <TableHead>Part Number</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Armazém</TableHead>
                <TableHead>Endereçamento</TableHead>
                <TableHead>Unidade</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredClientMaterials.map((material) => (
                <TableRow key={material.id} data-testid={`row-client-material-${material.id}`}>
                  <TableCell className="font-medium">{material.materialNumber}</TableCell>
                  <TableCell className="font-mono text-sm">{material.partNumber}</TableCell>
                  <TableCell>{material.client}</TableCell>
                  <TableCell>
                    <Badge variant="outline">Armazém {material.warehouse}</Badge>
                  </TableCell>
                  <TableCell>{material.addressing}</TableCell>
                  <TableCell>{material.unitType}</TableCell>
                  <TableCell>{material.currentQuantity}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="outline" data-testid={`button-edit-client-${material.id}`}>
                      Editar
                    </Button>
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

// Componente Principal da Página de Almoxarifado
export default function Warehouse() {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header Principal */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-[#0C29AB] mb-2">
          📦 MÓDULO DE ALMOXARIFADO
        </h1>
        <p className="text-gray-600">
          Sistema integrado de controle de materiais - Almoxarifado Central e Armazéns de Clientes
        </p>
      </div>

      {/* Tabs para os Submódulos */}
      <Tabs defaultValue="central" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="central" data-testid="tab-central-warehouse">
            📦 Almoxarifado Central
          </TabsTrigger>
          <TabsTrigger value="clients" data-testid="tab-client-warehouse">
            🏭 Controle de Armazéns de Clientes
          </TabsTrigger>
        </TabsList>

        <TabsContent value="central" className="mt-6">
          <CentralWarehouse />
        </TabsContent>

        <TabsContent value="clients" className="mt-6">
          <ClientWarehouse />
        </TabsContent>
      </Tabs>
    </div>
  );
}