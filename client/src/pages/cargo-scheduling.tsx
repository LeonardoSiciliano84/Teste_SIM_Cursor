import { useState, useEffect } from "react";
import { Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, XCircle, Plus, CalendarDays, ChevronLeft, ChevronRight, User, Settings, LogOut, Shield } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { format, addDays, isBefore, isAfter, differenceInHours } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuth } from "@/lib/auth";

interface ScheduleSlot {
  id: string;
  date: string;
  timeSlot: string;
  isAvailable: boolean;
  maxCapacity: number;
  currentBookings: number;
}

interface CargoScheduling {
  id: string;
  companyName: string;
  contactPerson: string;
  contactEmail: string;
  contactPhone?: string;
  date: string;
  timeSlot: string;
  status: string;
  notes?: string;
  createdAt: string;
  managerNotes?: string;
  cancellationReason?: string;
}

interface ExternalPerson {
  id: string;
  fullName: string;
  email: string;
  phone?: string;
  companyName?: string;
  personType: string;
  status: string;
}

export default function CargoScheduling() {
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [selectedSlots, setSelectedSlots] = useState<string[]>([]);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [showCancelModal, setShowCancelModal] = useState(false);
  const [showManagerModal, setShowManagerModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CargoScheduling | null>(null);
  const [managerAction, setManagerAction] = useState<'complete' | 'cancel'>('complete');
  const [managerNotes, setManagerNotes] = useState('');
  const [activeTab, setActiveTab] = useState('agendamento');
  const [searchEmail, setSearchEmail] = useState('');
  const [cancellationReason, setCancellationReason] = useState('');
  
  // Dados do formulário de agendamento
  const [bookingForm, setBookingForm] = useState({
    notes: ''
  });
  
  const { user } = useAuth();
  const isManager = user?.role === 'admin';
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar horários disponíveis
  const { data: slots = [] } = useQuery({
    queryKey: ['/api/cargo-scheduling/slots', format(selectedDate, 'yyyy-MM-dd')],
    queryFn: () => apiRequest(`/api/cargo-scheduling/slots?date=${format(selectedDate, 'yyyy-MM-dd')}`),
    enabled: !!selectedDate,
  });

  // Buscar agendamentos do cliente
  const { data: mySchedulings = [] } = useQuery({
    queryKey: ['/api/cargo-scheduling/my-bookings', user?.id],
    queryFn: () => apiRequest(`/api/cargo-scheduling/my-bookings?clientId=${user?.id || 'guest'}`),
    enabled: !isManager && !!user,
  });

  // Buscar todos os agendamentos (para gestor)
  const { data: allSchedulings = [] } = useQuery({
    queryKey: ['/api/cargo-scheduling/all-bookings'],
    queryFn: () => apiRequest('/api/cargo-scheduling/all-bookings'),
    enabled: isManager,
  });

  // Buscar pessoas externas (clientes)
  const { data: externalPersons = [] } = useQuery({
    queryKey: ['/api/external-persons'],
    queryFn: () => apiRequest('/api/external-persons'),
    enabled: isManager,
  });

  // Mutação para criar agendamento
  const createBookingMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/cargo-scheduling/book', 'POST', data);
    },
    onSuccess: () => {
      toast({
        title: "Agendamento realizado!",
        description: "Seu agendamento foi confirmado. PDF e e-mail de confirmação foram enviados.",
      });
      setShowBookingModal(false);
      setSelectedSlots([]);
      setBookingForm({
        notes: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling/my-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao agendar",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  // Mutação para cancelar agendamento
  const cancelBookingMutation = useMutation({
    mutationFn: async (data: { bookingId: string; reason?: string }) => {
      return apiRequest(`/api/cargo-scheduling/cancel/${data.bookingId}`, 'DELETE', { reason: data.reason });
    },
    onSuccess: (data) => {
      toast({
        title: "Agendamento cancelado com sucesso",
        description: "E-mails de cancelamento foram enviados para você e para a administração.",
      });
      setShowCancelModal(false);
      setSelectedBooking(null);
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling'] });
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling/my-bookings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao cancelar agendamento",
        description: error.message || "Erro interno do servidor",
        variant: "destructive",
      });
    },
  });

  // Função para gerar calendário do mês
  const generateCalendarDays = () => {
    const today = new Date();
    const currentMonth = selectedDate.getMonth();
    const currentYear = selectedDate.getFullYear();
    
    const firstDay = new Date(currentYear, currentMonth, 1);
    const lastDay = new Date(currentYear, currentMonth + 1, 0);
    const startDate = new Date(firstDay);
    startDate.setDate(startDate.getDate() - firstDay.getDay());
    
    const days = [];
    for (let i = 0; i < 42; i++) {
      const day = new Date(startDate);
      day.setDate(startDate.getDate() + i);
      days.push(day);
    }
    
    return days;
  };

  // Função para verificar se uma data tem horários disponíveis
  const hasAvailableSlots = (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    return slots.some((slot: ScheduleSlot) => 
      slot.date === dateStr && slot.isAvailable && slot.currentBookings < slot.maxCapacity
    );
  };

  // Função para alternar seleção de horário
  const toggleSlotSelection = (slotId: string) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  // Função para abrir modal de agendamento
  const openBookingModal = () => {
    if (selectedSlots.length === 0) {
      toast({
        title: "Selecione horários",
        description: "Selecione pelo menos um horário disponível para agendar.",
        variant: "destructive",
      });
      return;
    }
    setShowBookingModal(true);
  };

  // Função para confirmar agendamento
  const handleBookingSubmit = () => {
    // Criar um agendamento para cada slot selecionado
    selectedSlots.forEach(slotId => {
      createBookingMutation.mutate({
        slotId,
        ...bookingForm,
        // Dados preenchidos automaticamente do usuário logado
        companyName: user?.companyName || 'Empresa Cliente',
        contactPerson: user?.name || user?.email || 'Cliente',
        contactEmail: user?.email || 'cliente@email.com',
        contactPhone: user?.phone || '',
        manager: 'Administrador',
        clientId: user?.id || 'guest',
      });
    });
  };

  // Função para verificar se pode cancelar (até 3 horas antes)
  const canCancel = (booking: CargoScheduling) => {
    const bookingDateTime = new Date(`${booking.date}T${booking.timeSlot}`);
    const now = new Date();
    const hoursUntilBooking = differenceInHours(bookingDateTime, now);
    return hoursUntilBooking >= 3;
  };

  // Função para confirmar cancelamento
  const handleCancelConfirm = () => {
    if (selectedBooking && cancellationReason.trim()) {
      cancelBookingMutation.mutate({ 
        bookingId: selectedBooking.id,
        reason: cancellationReason.trim()
      });
      setCancellationReason('');
    }
  };

  // Buscar agendamentos por e-mail
  const searchBookingsByEmail = () => {
    if (!searchEmail) {
      toast({
        title: "Digite um e-mail",
        description: "Digite um e-mail para buscar os agendamentos.",
        variant: "destructive",
      });
      return;
    }
    // Implementar busca por e-mail
    console.log("Buscando agendamentos para:", searchEmail);
  };

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['janeiro', 'fevereiro', 'março', 'abril', 'maio', 'junho', 
                  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro'];

  // Estatísticas dos horários
  const totalSlots = slots.length;
  const availableSlots = slots.filter((slot: ScheduleSlot) => slot.isAvailable && slot.currentBookings < slot.maxCapacity).length;
  const occupiedSlots = totalSlots - availableSlots;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header FELKA */}
      <div className="bg-white border-b border-gray-200 px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-[#0C29AB] text-white p-2 rounded-md">
              <span className="font-bold text-lg">F</span>
            </div>
            <span className="text-xl font-semibold text-gray-900">Sistema de Agendamento Felka</span>
          </div>
          
          <div className="flex items-center gap-4">
            {/* Navegação por Botões */}
            <div className="flex items-center gap-2">
              <Button 
                variant={activeTab === 'agendamento' ? 'default' : 'outline'}
                onClick={() => setActiveTab('agendamento')}
                className={activeTab === 'agendamento' ? 'bg-[#0C29AB] hover:bg-[#0A2299]' : ''}
                data-testid="tab-agendamento"
              >
                <Calendar className="h-4 w-4 mr-2" />
                Agendamento
              </Button>
              {isManager && (
                <Button 
                  variant={activeTab === 'admin' ? 'default' : 'outline'}
                  onClick={() => setActiveTab('admin')}
                  className={activeTab === 'admin' ? 'bg-[#0C29AB] hover:bg-[#0A2299]' : ''}
                  data-testid="tab-admin"
                >
                  <Users className="h-4 w-4 mr-2" />
                  Admin
                </Button>
              )}
              <Button 
                variant={activeTab === 'relatorios' ? 'default' : 'outline'}
                onClick={() => setActiveTab('relatorios')}
                className={activeTab === 'relatorios' ? 'bg-[#0C29AB] hover:bg-[#0A2299]' : ''}
                data-testid="tab-relatorios"
              >
                <CheckCircle className="h-4 w-4 mr-2" />
                Relatórios
              </Button>
            </div>

            {/* Dropdown do Perfil do Usuário */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="flex items-center gap-2 p-2" data-testid="user-profile-menu">
                  <Avatar className="h-8 w-8">
                    <AvatarImage src={user?.profileImage || ""} />
                    <AvatarFallback className="bg-[#0C29AB] text-white">
                      {user?.name?.charAt(0) || user?.email?.charAt(0) || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  <div className="text-left">
                    <p className="text-sm font-medium">{user?.name || user?.email}</p>
                    <p className="text-xs text-gray-500">{user?.role === 'admin' ? 'Administrador' : 'Cliente'}</p>
                  </div>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem data-testid="user-data">
                  <User className="mr-2 h-4 w-4" />
                  <span>Dados do Usuário</span>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="security">
                  <Shield className="mr-2 h-4 w-4" />
                  <span>Segurança</span>
                </DropdownMenuItem>
                <DropdownMenuItem data-testid="settings">
                  <Settings className="mr-2 h-4 w-4" />
                  <span>Configurações</span>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  className="text-red-600 focus:text-red-600"
                  onClick={() => {
                    // Implementar logout
                    console.log('Logout');
                  }}
                  data-testid="logout"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>Sair</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      <div className="p-6">
        {/* Tab de Agendamento */}
        {activeTab === 'agendamento' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Agendamento de Serviços Felka</h1>
              <p className="text-gray-600">Selecione uma data no calendário e escolha um horário disponível para agendar seu serviço.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Calendário */}
              <div className="lg:col-span-2 bg-white rounded-lg p-6 shadow-sm border">
                <div className="mb-6">
                  <h2 className="text-lg font-semibold mb-4">Calendário</h2>
                  <div className="flex items-center justify-between mb-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      data-testid="button-prev-month"
                    >
                      <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <h3 className="text-lg font-medium">
                      {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h3>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      data-testid="button-next-month"
                    >
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="p-3 text-center text-sm font-medium text-gray-500">
                        {day}
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-7 gap-1">
                    {calendarDays.map((day, index) => {
                      const isCurrentMonth = day.getMonth() === selectedDate.getMonth();
                      const isToday = format(day, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                      const isSelected = format(day, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                      const hasSlots = hasAvailableSlots(day);
                      const isPast = isBefore(day, new Date()) && !isToday;
                      
                      return (
                        <button
                          key={index}
                          onClick={() => !isPast && setSelectedDate(day)}
                          disabled={isPast}
                          className={`
                            p-3 text-sm border rounded-md transition-colors min-h-[40px]
                            ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
                            ${isToday ? 'bg-blue-100 border-blue-300 text-blue-900' : ''}
                            ${isSelected ? 'bg-[#0C29AB] text-white border-[#0C29AB]' : ''}
                            ${hasSlots && isCurrentMonth && !isSelected ? 'bg-green-50 border-green-200 text-green-800' : ''}
                            ${isPast ? 'cursor-not-allowed opacity-50' : 'hover:bg-gray-100'}
                            ${!hasSlots && isCurrentMonth && !isPast && !isSelected ? 'bg-gray-100' : ''}
                          `}
                          data-testid={`calendar-day-${format(day, 'yyyy-MM-dd')}`}
                        >
                          {day.getDate()}
                        </button>
                      );
                    })}
                  </div>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-600">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-[#0C29AB] rounded"></div>
                    <span>Data Selecionada</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 bg-green-50 border border-green-200 rounded"></div>
                    <span>Horários Disponíveis</span>
                  </div>
                </div>
              </div>

              {/* Horários Disponíveis */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <div className="mb-4">
                  <h2 className="text-lg font-semibold mb-2">Horários Disponíveis</h2>
                  <p className="text-sm text-gray-600">
                    {format(selectedDate, 'dd', { locale: ptBR })} de {months[selectedDate.getMonth()]}, {selectedDate.getFullYear()}
                  </p>
                </div>
                
                <div className="space-y-3 mb-6">
                  {slots.length === 0 ? (
                    <p className="text-gray-500 text-sm text-center py-8">
                      Nenhum horário disponível para esta data
                    </p>
                  ) : (
                    slots.map((slot: ScheduleSlot) => {
                      const isAvailable = slot.isAvailable && slot.currentBookings < slot.maxCapacity;
                      const isSelected = selectedSlots.includes(slot.id);
                      
                      return (
                        <button
                          key={slot.id}
                          onClick={() => isAvailable && toggleSlotSelection(slot.id)}
                          disabled={!isAvailable}
                          className={`
                            w-full p-3 text-left border rounded-md transition-colors
                            ${isAvailable 
                              ? isSelected 
                                ? 'bg-[#0C29AB] text-white border-[#0C29AB]' 
                                : 'bg-white border-gray-200 hover:border-gray-300'
                              : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                            }
                          `}
                          data-testid={`slot-${slot.id}`}
                        >
                          <div className="flex items-center justify-between">
                            <span className="font-medium">{slot.timeSlot}</span>
                            <span className={`text-xs px-2 py-1 rounded ${
                              isAvailable ? 'bg-green-100 text-green-800' : 'bg-gray-200 text-gray-600'
                            }`}>
                              {isAvailable ? 'LIVRE' : 'OCUPADO'}
                            </span>
                          </div>
                          <div className="text-xs mt-1 opacity-75">
                            {slot.currentBookings}/{slot.maxCapacity} reservas
                          </div>
                        </button>
                      );
                    })
                  )}
                </div>

                {selectedSlots.length > 0 && (
                  <Button 
                    onClick={openBookingModal}
                    className="w-full bg-[#0C29AB] hover:bg-[#0A2299]"
                    data-testid="button-agendar"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Agendar ({selectedSlots.length})
                  </Button>
                )}
              </div>
            </div>

            {/* Meus Agendamentos */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <div className="mb-6">
                <h2 className="text-lg font-semibold mb-2">Meus Agendamentos</h2>
                <p className="text-sm text-gray-600">Histórico dos seus agendamentos realizados</p>
              </div>

              {/* Lista de Agendamentos do Cliente */}
              <div className="space-y-3">
                {mySchedulings.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-gray-500 text-sm">Nenhum agendamento encontrado</p>
                  </div>
                ) : (
                  mySchedulings.map((booking: CargoScheduling) => {
                    const canCancelBooking = canCancel(booking);
                    const bookingDate = new Date(`${booking.date}T${booking.timeSlot}`);
                    const now = new Date();
                    const hoursUntilBooking = differenceInHours(bookingDate, now);
                    
                    return (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 hover:shadow-sm transition-shadow"
                        data-testid={`booking-${booking.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-3 mb-2">
                              <h4 className="font-medium text-gray-900">{booking.companyName}</h4>
                              <Badge
                                variant={
                                  booking.status === 'agendado' ? 'default' :
                                  booking.status === 'concluido' || booking.status === 'finalizado' ? 'secondary' :
                                  'destructive'
                                }
                                className={
                                  booking.status === 'agendado' ? 'bg-blue-100 text-blue-800' :
                                  booking.status === 'concluido' || booking.status === 'finalizado' ? 'bg-green-100 text-green-800' :
                                  'bg-red-100 text-red-800'
                                }
                              >
                                {booking.status === 'agendado' ? 'AGENDADO' :
                                 booking.status === 'concluido' ? 'FINALIZADO' :
                                 booking.status === 'finalizado' ? 'FINALIZADO' :
                                 'CANCELADO'}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600 mb-1">
                              <Calendar className="h-4 w-4 inline mr-1" />
                              {format(new Date(booking.date), 'dd/MM/yyyy', { locale: ptBR })} às {booking.timeSlot}
                            </p>
                            <p className="text-sm text-gray-600">
                              Contato: {booking.contactPerson} - {booking.contactEmail}
                            </p>
                            {booking.notes && (
                              <p className="text-sm text-gray-500 mt-2 italic">
                                Obs: {booking.notes}
                              </p>
                            )}
                            {booking.status === 'agendado' && hoursUntilBooking < 3 && hoursUntilBooking > 0 && (
                              <p className="text-xs text-amber-600 mt-2">
                                <AlertCircle className="h-3 w-3 inline mr-1" />
                                Restam {Math.ceil(hoursUntilBooking)}h para cancelamento
                              </p>
                            )}
                          </div>
                          
                          <div className="flex items-center gap-2 ml-4">
                            {booking.status === 'agendado' && (
                              <Button
                                variant={canCancelBooking ? "destructive" : "outline"}
                                size="sm"
                                disabled={!canCancelBooking}
                                onClick={() => {
                                  if (canCancelBooking) {
                                    setSelectedBooking(booking);
                                    setShowCancelModal(true);
                                  }
                                }}
                                className={canCancelBooking ? 
                                  "bg-red-600 hover:bg-red-700 text-white" : 
                                  "opacity-50 cursor-not-allowed bg-gray-100 text-gray-400"
                                }
                                data-testid={`button-cancel-${booking.id}`}
                              >
                                <XCircle className="h-4 w-4 mr-1" />
                                Cancelar
                              </Button>
                            )}
                            {booking.status === 'cancelado' && booking.cancellationReason && (
                              <div className="text-xs text-red-600 max-w-40">
                                Motivo: {booking.cancellationReason}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Tab de Admin */}
        {activeTab === 'admin' && isManager && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Painel Administrativo Felka</h1>
              <p className="text-gray-600">Gerencie horários disponíveis e visualize todos os agendamentos do sistema.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Criar Horários */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Criar Horários Disponíveis</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="adminDate">Data e Hora</Label>
                    <Input
                      id="adminDate"
                      type="datetime-local"
                      className="mt-1"
                      data-testid="input-admin-date"
                    />
                  </div>
                  <div>
                    <Label htmlFor="serviceType">Tipo de Serviço</Label>
                    <Select>
                      <SelectTrigger data-testid="select-service-type">
                        <SelectValue placeholder="Selecione o serviço" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="carregamento">Carregamento</SelectItem>
                        <SelectItem value="descarregamento">Descarregamento</SelectItem>
                        <SelectItem value="transporte">Transporte</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <Button className="w-full bg-[#0C29AB] hover:bg-[#0A2299]" data-testid="button-create-slot">
                    <Plus className="h-4 w-4 mr-2" />
                    Criar Horário
                  </Button>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-3">Criação em Lote</h3>
                  <div className="space-y-2">
                    <Button variant="outline" className="w-full" data-testid="button-create-week">
                      <Calendar className="h-4 w-4 mr-2" />
                      Criar Semana Completa
                    </Button>
                    <Button variant="outline" className="w-full" data-testid="button-block-hours">
                      <XCircle className="h-4 w-4 mr-2" />
                      Bloquear Horários
                    </Button>
                  </div>
                </div>
              </div>

              {/* Estatísticas */}
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Estatísticas Rápidas</h2>
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-[#0C29AB]">
                      {allSchedulings.filter((b: CargoScheduling) => 
                        format(new Date(b.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                      ).length}
                    </div>
                    <div className="text-sm text-gray-600">Hoje</div>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-green-600">
                      {allSchedulings.filter((b: CargoScheduling) => {
                        const bookingDate = new Date(b.date);
                        const now = new Date();
                        const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                        const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                        return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
                      }).length}
                    </div>
                    <div className="text-sm text-gray-600">Esta Semana</div>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-yellow-600">{availableSlots}</div>
                    <div className="text-sm text-gray-600">Disponíveis</div>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <div className="text-2xl font-bold text-red-600">{occupiedSlots}</div>
                    <div className="text-sm text-gray-600">Ocupados</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Lista de Agendamentos */}
            <div className="bg-white rounded-lg p-6 shadow-sm border">
              <h2 className="text-lg font-semibold mb-4">Todos os Agendamentos</h2>
              <div className="space-y-4">
                {allSchedulings.map((booking: CargoScheduling) => (
                  <div
                    key={booking.id}
                    className="border rounded-lg p-4 space-y-2"
                    data-testid={`admin-booking-${booking.id}`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <h4 className="font-medium">{booking.companyName}</h4>
                        <p className="text-sm text-gray-600">
                          Contato: {booking.contactPerson} - {booking.contactEmail}
                        </p>
                        <p className="text-sm text-gray-600">
                          {format(new Date(booking.date), 'dd/MM/yyyy')} às {booking.timeSlot}
                        </p>
                      </div>
                      <div className="flex items-center gap-2">
                        <Badge
                          variant={
                            booking.status === 'agendado' ? 'default' :
                            booking.status === 'concluido' ? 'secondary' :
                            'destructive'
                          }
                        >
                          {booking.status.toUpperCase()}
                        </Badge>
                        {booking.status === 'agendado' && (
                          <>
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setManagerAction('complete');
                                setShowManagerModal(true);
                              }}
                              data-testid={`button-complete-${booking.id}`}
                            >
                              Concluir
                            </Button>
                            <Button
                              variant="destructive"
                              size="sm"
                              onClick={() => {
                                setSelectedBooking(booking);
                                setManagerAction('cancel');
                                setShowManagerModal(true);
                              }}
                              data-testid={`button-admin-cancel-${booking.id}`}
                            >
                              Cancelar
                            </Button>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab de Relatórios */}
        {activeTab === 'relatorios' && (
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 mb-2">Relatórios Felka</h1>
              <p className="text-gray-600">Visualize estatísticas e relatórios detalhados dos agendamentos.</p>
            </div>

            {/* Estatísticas Gerais */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="text-3xl font-bold text-[#0C29AB] mb-2">
                  {allSchedulings.filter((b: CargoScheduling) => 
                    format(new Date(b.date), 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd')
                  ).length}
                </div>
                <div className="text-sm text-gray-600">Agendamentos Hoje</div>
                <div className="text-xs text-green-600 mt-1">↑ Ativo</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="text-3xl font-bold text-green-600 mb-2">
                  {allSchedulings.filter((b: CargoScheduling) => {
                    const bookingDate = new Date(b.date);
                    const now = new Date();
                    const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
                    const endOfWeek = new Date(now.setDate(now.getDate() - now.getDay() + 6));
                    return bookingDate >= startOfWeek && bookingDate <= endOfWeek;
                  }).length}
                </div>
                <div className="text-sm text-gray-600">Esta Semana</div>
                <div className="text-xs text-green-600 mt-1">↑ Crescendo</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="text-3xl font-bold text-yellow-600 mb-2">
                  {allSchedulings.filter((b: CargoScheduling) => b.status === 'agendado').length}
                </div>
                <div className="text-sm text-gray-600">Carregamentos</div>
                <div className="text-xs text-gray-500 mt-1">0% do total</div>
              </div>

              <div className="bg-white p-6 rounded-lg shadow-sm border text-center">
                <div className="text-3xl font-bold text-red-600 mb-2">
                  {allSchedulings.filter((b: CargoScheduling) => b.status === 'cancelado').length}
                </div>
                <div className="text-sm text-gray-600">Descarregamentos</div>
                <div className="text-xs text-gray-500 mt-1">0% do total</div>
              </div>
            </div>

            {/* Filtros e Exportação */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Filtros de Relatório</h2>
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="period">Período</Label>
                    <Select>
                      <SelectTrigger data-testid="select-period">
                        <SelectValue placeholder="Esta Semana" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="week">Esta Semana</SelectItem>
                        <SelectItem value="month">Este Mês</SelectItem>
                        <SelectItem value="year">Este Ano</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="serviceTypeFilter">Tipo de Serviço</Label>
                    <Select>
                      <SelectTrigger data-testid="select-service-filter">
                        <SelectValue placeholder="Todos os serviços" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os serviços</SelectItem>
                        <SelectItem value="carregamento">Carregamento</SelectItem>
                        <SelectItem value="descarregamento">Descarregamento</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div>
                    <Label htmlFor="statusFilter">Status</Label>
                    <Select>
                      <SelectTrigger data-testid="select-status-filter">
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos os status</SelectItem>
                        <SelectItem value="agendado">Agendado</SelectItem>
                        <SelectItem value="concluido">Concluído</SelectItem>
                        <SelectItem value="cancelado">Cancelado</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-lg p-6 shadow-sm border">
                <h2 className="text-lg font-semibold mb-4">Exportar Dados</h2>
                <div className="space-y-4">
                  <Button className="w-full bg-green-600 hover:bg-green-700" data-testid="button-export-xlsx">
                    <CheckCircle className="h-4 w-4 mr-2" />
                    Exportar XLSX
                  </Button>
                  <p className="text-sm text-gray-500 text-center">
                    {allSchedulings.length} agendamentos no período selecionado
                  </p>
                </div>

                <div className="mt-6 pt-6 border-t">
                  <h3 className="font-medium mb-3">Distribuição por Horário</h3>
                  <p className="text-sm text-gray-500 text-center">
                    Nenhum dado disponível para o período selecionado
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de Agendamento */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-sm text-blue-800">
                <AlertCircle className="h-4 w-4 inline mr-1" />
                Você tem até 3 horas antes do horário agendado para cancelar.
              </p>
            </div>
            
            {/* Dados do Cliente (Preenchidos Automaticamente) */}
            <div className="bg-gray-50 p-4 rounded-md">
              <h4 className="font-medium text-gray-900 mb-2">Dados do Agendamento</h4>
              <div className="text-sm text-gray-600 space-y-1">
                <p><strong>Empresa:</strong> {user?.companyName || 'Empresa Cliente'}</p>
                <p><strong>Contato:</strong> {user?.name || user?.email || 'Cliente'}</p>
                <p><strong>E-mail:</strong> {user?.email || 'cliente@email.com'}</p>
                <p><strong>Gestor:</strong> Administrador</p>
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informações adicionais sobre a carga..."
                rows={4}
                data-testid="textarea-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingModal(false)} data-testid="button-cancel-booking">
              Cancelar
            </Button>
            <Button 
              onClick={handleBookingSubmit}
              className="bg-[#0C29AB] hover:bg-[#0A2299]"
              data-testid="button-confirm-booking"
            >
              Confirmar Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Cancelamento */}
      <Dialog open={showCancelModal} onOpenChange={(open) => {
        setShowCancelModal(open);
        if (!open) {
          setCancellationReason('');
        }
      }}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            {selectedBooking && (
              <div className="bg-amber-50 p-3 rounded-md">
                <p className="text-sm text-amber-800 mb-2">
                  <AlertCircle className="h-4 w-4 inline mr-1" />
                  Você está prestes a cancelar o agendamento:
                </p>
                <div className="text-sm">
                  <p><strong>Data:</strong> {format(new Date(selectedBooking.date), 'dd/MM/yyyy', { locale: ptBR })} às {selectedBooking.timeSlot}</p>
                  <p><strong>Empresa:</strong> {selectedBooking.companyName}</p>
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Motivo do Cancelamento <span className="text-red-500">*</span></Label>
              <Textarea
                id="cancelReason"
                value={cancellationReason}
                onChange={(e) => setCancellationReason(e.target.value)}
                placeholder="Informe o motivo do cancelamento..."
                rows={3}
                data-testid="textarea-cancel-reason"
              />
              {!cancellationReason.trim() && (
                <p className="text-xs text-gray-500">Este campo é obrigatório</p>
              )}
            </div>

            <div className="bg-blue-50 p-3 rounded-md">
              <p className="text-xs text-blue-700">
                📧 Um e-mail de cancelamento será enviado automaticamente para você e para a administração.
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setShowCancelModal(false)} 
              data-testid="button-cancel-cancel"
            >
              Manter Agendamento
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleCancelConfirm}
              disabled={!cancellationReason.trim() || cancelBookingMutation.isPending}
              data-testid="button-confirm-cancel"
            >
              {cancelBookingMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Cancelando...
                </>
              ) : (
                'Confirmar Cancelamento'
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Ação do Gestor */}
      <Dialog open={showManagerModal} onOpenChange={setShowManagerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {managerAction === 'complete' ? 'Concluir' : 'Cancelar'} Agendamento
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="managerNotes">Observações</Label>
              <Textarea
                id="managerNotes"
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder={
                  managerAction === 'complete' 
                    ? "Observações sobre a conclusão do serviço..."
                    : "Motivo do cancelamento..."
                }
                data-testid="textarea-manager-notes"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManagerModal(false)} data-testid="button-cancel-manager">
              Cancelar
            </Button>
            <Button 
              variant={managerAction === 'complete' ? 'default' : 'destructive'}
              onClick={() => {
                if (selectedBooking) {
                  // Implementar ação do gestor via API
                  apiRequest(`/api/cargo-scheduling/manager-action/${selectedBooking.id}`, {
                    method: 'PATCH',
                    body: JSON.stringify({
                      action: managerAction,
                      notes: managerNotes
                    })
                  }).then(() => {
                    toast({
                      title: managerAction === 'complete' ? "Agendamento concluído" : "Agendamento cancelado",
                      description: "Ação realizada com sucesso.",
                    });
                    queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling'] });
                    queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling/my-bookings'] });
                  }).catch((error) => {
                    toast({
                      title: "Erro",
                      description: error.message || "Erro interno do servidor",
                      variant: "destructive",
                    });
                  });
                }
                setShowManagerModal(false);
                setManagerNotes('');
              }}
              data-testid="button-confirm-manager"
            >
              {managerAction === 'complete' ? 'Concluir' : 'Cancelar'} Agendamento
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}