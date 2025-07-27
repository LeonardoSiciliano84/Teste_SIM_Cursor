import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

interface VehicleFiltersProps {
  filters: {
    type: string;
    status: string;
    search: string;
  };
  onFilterChange: (key: string, value: string) => void;
}

export default function VehicleFilters({ filters, onFilterChange }: VehicleFiltersProps) {
  return (
    <Card className="border border-gray-100">
      <CardContent className="p-6">
        <div className="flex flex-wrap gap-4">
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Tipo</Label>
            <Select value={filters.type} onValueChange={(value) => onFilterChange("type", value)}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="truck">Caminhão</SelectItem>
                <SelectItem value="van">Van</SelectItem>
                <SelectItem value="trailer">Carreta</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="block text-sm font-medium text-gray-700 mb-1">Status</Label>
            <Select value={filters.status} onValueChange={(value) => onFilterChange("status", value)}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativo</SelectItem>
                <SelectItem value="maintenance">Em Manutenção</SelectItem>
                <SelectItem value="inactive">Inativo</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex-1">
            <Label className="block text-sm font-medium text-gray-700 mb-1">Buscar</Label>
            <div className="relative">
              <Input
                type="text"
                placeholder="Buscar por placa ou modelo..."
                value={filters.search}
                onChange={(e) => onFilterChange("search", e.target.value)}
                className="pl-10"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
