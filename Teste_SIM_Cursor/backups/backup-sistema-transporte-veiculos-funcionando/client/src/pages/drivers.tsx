import { useState } from "react";
import { Plus, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import DriversTable from "@/components/drivers/drivers-table";

export default function Drivers() {
  const [filters, setFilters] = useState({
    search: "",
    status: "all",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Motoristas</h2>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          Adicionar Motorista
        </Button>
      </div>

      {/* Search and Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div className="flex-1">
              <Label className="block text-sm font-medium text-gray-700 mb-1">
                Buscar Motorista
              </Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Nome, CPF ou CNH..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="on_trip">Em Viagem</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Drivers Table */}
      <DriversTable />
    </div>
  );
}
