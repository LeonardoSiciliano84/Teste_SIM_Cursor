import { useState, useEffect } from "react";
import { Calendar, Clock, Users, MapPin, AlertCircle, CheckCircle, XCircle, Plus, CalendarDays } from "lucide-react";
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
  const [activeTab, setActiveTab] = useState('calendario');
  
  // Dados do formulário de agendamento
  const [bookingForm, setBookingForm] = useState({
    companyName: '',
    contactPerson: '',
    contactEmail: '',
    contactPhone: '',
    notes: '',
    manager: ''
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
    queryKey: ['/api/cargo-scheduling/my-bookings'],
    queryFn: () => apiRequest('/api/cargo-scheduling/my-bookings'),
    enabled: !isManager,
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
      return apiRequest('/api/cargo-scheduling/book', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Agendamento realizado!",
        description: "Seu agendamento foi confirmado. PDF e e-mail de confirmação foram enviados.",
      });
      setShowBookingModal(false);
      setSelectedSlots([]);
      setBookingForm({
        companyName: '',
        contactPerson: '',
        contactEmail: '',
        contactPhone: '',
        notes: '',
        manager: ''
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling'] });
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
      return apiRequest(`/api/cargo-scheduling/cancel/${data.bookingId}`, {
        method: 'DELETE',
        body: JSON.stringify({ reason: data.reason }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Agendamento cancelado",
        description: "O agendamento foi cancelado com sucesso.",
      });
      setShowCancelModal(false);
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling'] });
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
    if (!bookingForm.companyName || !bookingForm.contactPerson || !bookingForm.contactEmail) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    // Criar um agendamento para cada slot selecionado
    selectedSlots.forEach(slotId => {
      createBookingMutation.mutate({
        slotId,
        ...bookingForm,
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

  const calendarDays = generateCalendarDays();
  const weekDays = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'];
  const months = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 
                  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Agendamento de Carreamento</h1>
          <p className="text-gray-600">Sistema integrado para agendamento de serviços de carreamento</p>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="calendario" data-testid="tab-calendario">Calendário</TabsTrigger>
          <TabsTrigger value="gerenciar" data-testid="tab-gerenciar">Gerenciar</TabsTrigger>
        </TabsList>

        <TabsContent value="calendario" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CalendarDays className="h-5 w-5" />
                Agendar Carreamento
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Calendário */}
                <div className="lg:col-span-2">
                  <div className="mb-4 flex items-center justify-between">
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() - 1, 1))}
                      data-testid="button-prev-month"
                    >
                      ←
                    </Button>
                    <h3 className="text-lg font-semibold">
                      {months[selectedDate.getMonth()]} {selectedDate.getFullYear()}
                    </h3>
                    <Button
                      variant="outline"
                      onClick={() => setSelectedDate(prev => new Date(prev.getFullYear(), prev.getMonth() + 1, 1))}
                      data-testid="button-next-month"
                    >
                      →
                    </Button>
                  </div>

                  <div className="grid grid-cols-7 gap-1 mb-2">
                    {weekDays.map(day => (
                      <div key={day} className="p-2 text-center text-sm font-medium text-gray-500">
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
                            p-2 text-sm border rounded-md transition-colors
                            ${!isCurrentMonth ? 'text-gray-300 bg-gray-50' : ''}
                            ${isToday ? 'bg-blue-100 border-blue-300 text-blue-900' : ''}
                            ${isSelected ? 'bg-blue-600 text-white' : ''}
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

                {/* Horários Disponíveis */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="font-semibold">Horários para {format(selectedDate, 'dd/MM/yyyy')}</h4>
                    {selectedSlots.length > 0 && (
                      <Button 
                        onClick={openBookingModal}
                        className="bg-[#0C29AB] hover:bg-[#0A2299]"
                        data-testid="button-agendar"
                      >
                        Agendar ({selectedSlots.length})
                      </Button>
                    )}
                  </div>
                  
                  <div className="space-y-2 max-h-96 overflow-y-auto">
                    {slots.length === 0 ? (
                      <p className="text-gray-500 text-sm">Nenhum horário disponível para esta data</p>
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
                                  : 'bg-green-50 border-green-200 text-green-800 hover:bg-green-100'
                                : 'bg-gray-100 border-gray-200 text-gray-500 cursor-not-allowed'
                              }
                            `}
                            data-testid={`slot-${slot.id}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-medium">{slot.timeSlot}</span>
                              <span className="text-xs">
                                {isAvailable ? 'LIVRE' : 'OCUPADO'}
                              </span>
                            </div>
                            <div className="text-xs mt-1">
                              {slot.currentBookings}/{slot.maxCapacity} reservas
                            </div>
                          </button>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Meus Agendamentos */}
          {!isManager && (
            <Card>
              <CardHeader>
                <CardTitle>Meus Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
                {mySchedulings.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">Nenhum agendamento encontrado</p>
                ) : (
                  <div className="space-y-4">
                    {mySchedulings.map((booking: CargoScheduling) => (
                      <div
                        key={booking.id}
                        className="border rounded-lg p-4 space-y-2"
                        data-testid={`booking-${booking.id}`}
                      >
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-medium">{booking.companyName}</h4>
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
                            {canCancel(booking) && booking.status === 'agendado' && (
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => {
                                  setSelectedBooking(booking);
                                  setShowCancelModal(true);
                                }}
                                data-testid={`button-cancel-${booking.id}`}
                              >
                                Cancelar
                              </Button>
                            )}
                          </div>
                        </div>
                        {booking.notes && (
                          <p className="text-sm text-gray-600">Observações: {booking.notes}</p>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="gerenciar" className="space-y-6">
          {isManager ? (
            <Card>
              <CardHeader>
                <CardTitle>Gerenciar Agendamentos</CardTitle>
              </CardHeader>
              <CardContent>
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
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="text-center py-12">
                <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Acesso Restrito</h3>
                <p className="text-gray-600">Apenas gestores podem acessar esta seção.</p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

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
            
            <div className="space-y-2">
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input
                id="companyName"
                value={bookingForm.companyName}
                onChange={(e) => setBookingForm(prev => ({ ...prev, companyName: e.target.value }))}
                data-testid="input-company-name"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPerson">Pessoa de Contato *</Label>
              <Input
                id="contactPerson"
                value={bookingForm.contactPerson}
                onChange={(e) => setBookingForm(prev => ({ ...prev, contactPerson: e.target.value }))}
                data-testid="input-contact-person"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactEmail">E-mail *</Label>
              <Input
                id="contactEmail"
                type="email"
                value={bookingForm.contactEmail}
                onChange={(e) => setBookingForm(prev => ({ ...prev, contactEmail: e.target.value }))}
                data-testid="input-contact-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="contactPhone">Telefone</Label>
              <Input
                id="contactPhone"
                value={bookingForm.contactPhone}
                onChange={(e) => setBookingForm(prev => ({ ...prev, contactPhone: e.target.value }))}
                data-testid="input-contact-phone"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="manager">Gestor Responsável</Label>
              <Select value={bookingForm.manager} onValueChange={(value) => setBookingForm(prev => ({ ...prev, manager: value }))}>
                <SelectTrigger data-testid="select-manager">
                  <SelectValue placeholder="Selecione o gestor" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="admin">Administrador</SelectItem>
                  <SelectItem value="supervisor">Supervisor</SelectItem>
                  <SelectItem value="coordinator">Coordenador</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={bookingForm.notes}
                onChange={(e) => setBookingForm(prev => ({ ...prev, notes: e.target.value }))}
                placeholder="Informações adicionais sobre a carga..."
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
      <Dialog open={showCancelModal} onOpenChange={setShowCancelModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Cancelar Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p>Tem certeza que deseja cancelar este agendamento?</p>
            <div className="space-y-2">
              <Label htmlFor="cancelReason">Motivo do Cancelamento</Label>
              <Textarea
                id="cancelReason"
                placeholder="Informe o motivo do cancelamento..."
                data-testid="textarea-cancel-reason"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)} data-testid="button-cancel-cancel">
              Manter Agendamento
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => {
                if (selectedBooking) {
                  const reason = (document.getElementById('cancelReason') as HTMLTextAreaElement)?.value;
                  cancelBookingMutation.mutate({ bookingId: selectedBooking.id, reason });
                }
              }}
              data-testid="button-confirm-cancel"
            >
              Confirmar Cancelamento
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