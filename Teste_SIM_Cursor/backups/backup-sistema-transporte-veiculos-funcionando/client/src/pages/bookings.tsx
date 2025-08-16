import { Plus, Search } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import StatsCard from "@/components/dashboard/stats-card";
import BookingsTable from "@/components/bookings/bookings-table";
import { CalendarDays, Clock, Truck, CheckCircle } from "lucide-react";

export default function Bookings() {
  const [filters, setFilters] = useState({
    status: "all",
    date: "today",
    search: "",
  });

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  // Mock booking stats
  const bookingStats = {
    today: 8,
    pending: 5,
    active: 3,
    completed: 15,
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Gestão de Reservas</h2>
        <Button className="bg-primary-600 hover:bg-primary-700">
          <Plus className="w-4 h-4 mr-2" />
          Nova Reserva
        </Button>
      </div>

      {/* Booking Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatsCard
          title="Reservas Hoje"
          value={bookingStats.today}
          icon={CalendarDays}
          iconColor="bg-primary-100 text-primary-600"
        />
        <StatsCard
          title="Pendentes"
          value={bookingStats.pending}
          icon={Clock}
          iconColor="bg-warning-100 text-warning-600"
        />
        <StatsCard
          title="Em Andamento"
          value={bookingStats.active}
          icon={Truck}
          iconColor="bg-secondary-100 text-secondary-600"
        />
        <StatsCard
          title="Concluídas"
          value={bookingStats.completed}
          icon={CheckCircle}
          iconColor="bg-success-100 text-success-600"
        />
      </div>

      {/* Filters */}
      <Card className="border border-gray-100">
        <CardContent className="p-6">
          <div className="flex flex-wrap gap-4">
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Status</Label>
              <Select value={filters.status} onValueChange={(value) => handleFilterChange("status", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Todos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="confirmed">Confirmada</SelectItem>
                  <SelectItem value="active">Em Andamento</SelectItem>
                  <SelectItem value="completed">Concluída</SelectItem>
                  <SelectItem value="cancelled">Cancelada</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="block text-sm font-medium text-gray-700 mb-1">Data</Label>
              <Select value={filters.date} onValueChange={(value) => handleFilterChange("date", value)}>
                <SelectTrigger className="w-40">
                  <SelectValue placeholder="Hoje" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="today">Hoje</SelectItem>
                  <SelectItem value="week">Esta Semana</SelectItem>
                  <SelectItem value="month">Este Mês</SelectItem>
                  <SelectItem value="custom">Personalizado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="block text-sm font-medium text-gray-700 mb-1">Buscar</Label>
              <div className="relative">
                <Input
                  type="text"
                  placeholder="Cliente, destino ou número da reserva..."
                  value={filters.search}
                  onChange={(e) => handleFilterChange("search", e.target.value)}
                  className="pl-10"
                />
                <Search className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bookings Table */}
      <BookingsTable />
    </div>
  );
}
