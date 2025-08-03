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
  const [showSlotModal, setShowSlotModal] = useState(false);
  const [selectedBooking, setSelectedBooking] = useState<CargoScheduling | null>(null);
  const [managerAction, setManagerAction] = useState<'complete' | 'cancel'>('complete');
  const [managerNotes, setManagerNotes] = useState('');
  const [newSlotTime, setNewSlotTime] = useState('');
  const [activeTab, setActiveTab] = useState('client');
  
  const { user } = useAuth();
  const isManager = user?.role === 'admin';
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar horários disponíveis
  const { data: slots = [] } = useQuery({
    queryKey: ['/api/cargo-scheduling/slots', format(selectedDate, 'yyyy-MM-dd')],
    enabled: !!selectedDate,
  });

  // Buscar agendamentos do cliente
  const { data: mySchedulings = [] } = useQuery({
    queryKey: ['/api/cargo-scheduling/my-bookings'],
    enabled: !isManager,
  });

  // Buscar todos os agendamentos (para gestor)
  const { data: allSchedulings = [] } = useQuery({
    queryKey: ['/api/cargo-scheduling/all-bookings'],
    enabled: isManager,
  });

  // Buscar pessoas externas (clientes)
  const { data: externalPersons = [] } = useQuery({
    queryKey: ['/api/external-persons'],
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
        description: "Seu agendamento foi confirmado. Você receberá um e-mail de confirmação.",
      });
      setShowBookingModal(false);
      setSelectedSlots([]);
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
      setSelectedBooking(null);
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling'] });
    },
  });

  // Mutação para ações do gestor
  const managerActionMutation = useMutation({
    mutationFn: async (data: { bookingId: string; action: string; notes: string }) => {
      return apiRequest(`/api/cargo-scheduling/manager-action/${data.bookingId}`, {
        method: 'PATCH',
        body: JSON.stringify({ action: data.action, notes: data.notes }),
      });
    },
    onSuccess: () => {
      toast({
        title: managerAction === 'complete' ? "Agendamento concluído" : "Agendamento cancelado",
        description: `Ação realizada com sucesso.`,
      });
      setShowManagerModal(false);
      setSelectedBooking(null);
      setManagerNotes('');
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling'] });
    },
  });

  // Mutação para liberar horários
  const createSlotMutation = useMutation({
    mutationFn: async (data: any) => {
      return apiRequest('/api/cargo-scheduling/slots', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: "Horário liberado",
        description: "O horário foi liberado para agendamento.",
      });
      setShowSlotModal(false);
      setNewSlotTime('');
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling/slots'] });
    },
  });

  // Mutação para programar semana
  const scheduleWeekMutation = useMutation({
    mutationFn: async () => {
      return apiRequest('/api/cargo-scheduling/schedule-week', {
        method: 'POST',
        body: JSON.stringify({ date: format(selectedDate, 'yyyy-MM-dd') }),
      });
    },
    onSuccess: () => {
      toast({
        title: "Semana programada",
        description: "A semana útil foi liberada automaticamente.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/cargo-scheduling/slots'] });
    },
  });

  const handleDateChange = (date: Date) => {
    setSelectedDate(date);
    setSelectedSlots([]);
  };

  const handleSlotToggle = (slotId: string) => {
    setSelectedSlots(prev => 
      prev.includes(slotId) 
        ? prev.filter(id => id !== slotId)
        : [...prev, slotId]
    );
  };

  const canCancelBooking = (booking: CargoScheduling) => {
    const bookingDateTime = new Date(`${booking.date}T${booking.timeSlot}`);
    const hoursUntilBooking = differenceInHours(bookingDateTime, new Date());
    return hoursUntilBooking >= 3;
  };

  const renderClientView = () => (
    <div className="space-y-6">
      {/* Calendário de Agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0C29AB]" />
            Agendar Carreamento
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Calendário */}
            <div>
              <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-4">
                {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                  <div key={day} className="p-2">{day}</div>
                ))}
              </div>
              <div className="grid grid-cols-7 gap-2">
                {Array.from({ length: 35 }, (_, i) => {
                  const date = addDays(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), i - 7);
                  const isToday = format(date, 'yyyy-MM-dd') === format(new Date(), 'yyyy-MM-dd');
                  const isPast = isBefore(date, new Date()) && !isToday;
                  const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                  const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                  
                  return (
                    <button
                      key={i}
                      onClick={() => !isPast && handleDateChange(date)}
                      disabled={isPast}
                      className={`
                        p-2 text-sm rounded-lg transition-colors
                        ${isPast ? 'text-gray-300 cursor-not-allowed' : 'hover:bg-blue-50'}
                        ${isSelected ? 'bg-[#0C29AB] text-white' : ''}
                        ${!isCurrentMonth ? 'text-gray-400' : ''}
                        ${isToday && !isSelected ? 'bg-blue-100 text-[#0C29AB] font-semibold' : ''}
                      `}
                      data-testid={`calendar-day-${format(date, 'yyyy-MM-dd')}`}
                    >
                      {date.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Horários Disponíveis */}
            <div>
              <h3 className="font-semibold mb-4">
                Horários para {format(selectedDate, "dd 'de' MMMM", { locale: ptBR })}
              </h3>
              <div className="grid grid-cols-2 gap-2 max-h-80 overflow-y-auto">
                {slots.map((slot: ScheduleSlot) => {
                  const isAvailable = slot.isAvailable && slot.currentBookings < slot.maxCapacity;
                  const isSelected = selectedSlots.includes(slot.id);
                  
                  return (
                    <button
                      key={slot.id}
                      onClick={() => isAvailable && handleSlotToggle(slot.id)}
                      disabled={!isAvailable}
                      className={`
                        p-3 rounded-lg border-2 transition-all text-left
                        ${isAvailable ? 'border-green-200 bg-green-50 hover:border-green-300' : 'border-gray-200 bg-gray-50 cursor-not-allowed'}
                        ${isSelected ? 'border-[#0C29AB] bg-blue-50' : ''}
                      `}
                      data-testid={`time-slot-${slot.timeSlot}`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{slot.timeSlot}</span>
                        <Badge 
                          variant={isAvailable ? "default" : "secondary"}
                          className={isAvailable ? "bg-green-500" : ""}
                        >
                          {isAvailable ? 'Disponível' : 'Ocupado'}
                        </Badge>
                      </div>
                      <div className="text-xs text-gray-600 mt-1">
                        {slot.currentBookings}/{slot.maxCapacity} vagas
                      </div>
                    </button>
                  );
                })}
              </div>
              
              {selectedSlots.length > 0 && (
                <Button
                  onClick={() => setShowBookingModal(true)}
                  className="w-full mt-4 bg-[#0C29AB] hover:bg-blue-800"
                  data-testid="button-book-slots"
                >
                  Agendar {selectedSlots.length} horário{selectedSlots.length > 1 ? 's' : ''}
                </Button>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Meus Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Meus Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {mySchedulings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum agendamento encontrado</p>
            ) : (
              mySchedulings.map((booking: CargoScheduling) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{booking.companyName}</h4>
                        <Badge variant={
                          booking.status === 'agendado' ? 'default' :
                          booking.status === 'confirmado' ? 'default' :
                          booking.status === 'concluido' ? 'secondary' :
                          'destructive'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 space-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(booking.date), "dd/MM/yyyy")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {booking.timeSlot}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {booking.contactPerson}
                        </div>
                      </div>
                    </div>
                    
                    {booking.status === 'agendado' && canCancelBooking(booking) && (
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedBooking(booking);
                          setShowCancelModal(true);
                        }}
                        className="text-red-600 hover:text-red-700"
                        data-testid={`button-cancel-${booking.id}`}
                      >
                        Cancelar
                      </Button>
                    )}
                  </div>
                  
                  {booking.notes && (
                    <div className="mt-3 p-3 bg-gray-50 rounded-lg">
                      <p className="text-sm"><strong>Observações:</strong> {booking.notes}</p>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderManagerView = () => (
    <div className="space-y-6">
      {/* Controles do Gestor */}
      <Card>
        <CardHeader>
          <CardTitle>Gerenciar Horários</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 flex-wrap">
            <Button
              onClick={() => setShowSlotModal(true)}
              className="bg-[#0C29AB] hover:bg-blue-800"
              data-testid="button-add-slot"
            >
              <Plus className="w-4 h-4 mr-2" />
              Liberar Horário
            </Button>
            
            <Button
              onClick={() => scheduleWeekMutation.mutate()}
              variant="outline"
              data-testid="button-schedule-week"
            >
              <CalendarDays className="w-4 h-4 mr-2" />
              Programar Semana Liberada
            </Button>
          </div>
          
          {/* Calendário do Gestor */}
          <div className="mt-6">
            <div className="grid grid-cols-7 gap-2 text-center text-sm font-medium mb-4">
              {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                <div key={day} className="p-2">{day}</div>
              ))}
            </div>
            <div className="grid grid-cols-7 gap-2">
              {Array.from({ length: 35 }, (_, i) => {
                const date = addDays(new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1), i - 7);
                const isSelected = format(date, 'yyyy-MM-dd') === format(selectedDate, 'yyyy-MM-dd');
                const isCurrentMonth = date.getMonth() === selectedDate.getMonth();
                
                return (
                  <button
                    key={i}
                    onClick={() => handleDateChange(date)}
                    className={`
                      p-2 text-sm rounded-lg transition-colors hover:bg-blue-50
                      ${isSelected ? 'bg-[#0C29AB] text-white' : ''}
                      ${!isCurrentMonth ? 'text-gray-400' : ''}
                    `}
                  >
                    {date.getDate()}
                  </button>
                );
              })}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Agendamentos */}
      <Card>
        <CardHeader>
          <CardTitle>Agendamentos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {allSchedulings.length === 0 ? (
              <p className="text-gray-500 text-center py-4">Nenhum agendamento encontrado</p>
            ) : (
              allSchedulings.map((booking: CargoScheduling) => (
                <div key={booking.id} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h4 className="font-semibold">{booking.companyName}</h4>
                        <Badge variant={
                          booking.status === 'agendado' ? 'default' :
                          booking.status === 'confirmado' ? 'default' :
                          booking.status === 'concluido' ? 'secondary' :
                          'destructive'
                        }>
                          {booking.status}
                        </Badge>
                      </div>
                      <div className="text-sm text-gray-600 grid grid-cols-2 gap-x-4 gap-y-1">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4" />
                          {format(new Date(booking.date), "dd/MM/yyyy")}
                        </div>
                        <div className="flex items-center gap-2">
                          <Clock className="w-4 h-4" />
                          {booking.timeSlot}
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-4 h-4" />
                          {booking.contactPerson}
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4" />
                          {booking.contactEmail}
                        </div>
                      </div>
                    </div>
                    
                    {booking.status === 'agendado' && (
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setManagerAction('complete');
                            setShowManagerModal(true);
                          }}
                          className="bg-green-600 hover:bg-green-700"
                          data-testid={`button-complete-${booking.id}`}
                        >
                          Concluir
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            setSelectedBooking(booking);
                            setManagerAction('cancel');
                            setShowManagerModal(true);
                          }}
                          className="text-red-600 hover:text-red-700"
                          data-testid={`button-manager-cancel-${booking.id}`}
                        >
                          Cancelar
                        </Button>
                      </div>
                    )}
                  </div>
                  
                  {(booking.notes || booking.managerNotes) && (
                    <div className="mt-3 space-y-2">
                      {booking.notes && (
                        <div className="p-3 bg-gray-50 rounded-lg">
                          <p className="text-sm"><strong>Observações do Cliente:</strong> {booking.notes}</p>
                        </div>
                      )}
                      {booking.managerNotes && (
                        <div className="p-3 bg-blue-50 rounded-lg">
                          <p className="text-sm"><strong>Observações do Gestor:</strong> {booking.managerNotes}</p>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );

  return (
    <div className="container mx-auto p-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">
          Agendamento de Carreamento
        </h1>
        <p className="text-gray-600">
          Sistema integrado para agendamento de serviços de carreamento
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          {!isManager && (
            <TabsTrigger value="client" data-testid="tab-client">
              Agendamento
            </TabsTrigger>
          )}
          {isManager && (
            <>
              <TabsTrigger value="client" data-testid="tab-calendar">
                Calendário
              </TabsTrigger>
              <TabsTrigger value="manager" data-testid="tab-manager">
                Gerenciar
              </TabsTrigger>
            </>
          )}
        </TabsList>

        <TabsContent value="client">
          {renderClientView()}
        </TabsContent>

        {isManager && (
          <TabsContent value="manager">
            {renderManagerView()}
          </TabsContent>
        )}
      </Tabs>

      {/* Modal de Agendamento */}
      <Dialog open={showBookingModal} onOpenChange={setShowBookingModal}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmar Agendamento</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Data e Horários Selecionados</Label>
              <div className="mt-2 space-y-2">
                <p className="font-medium">{format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}</p>
                {selectedSlots.map(slotId => {
                  const slot = slots.find((s: ScheduleSlot) => s.id === slotId);
                  return slot ? (
                    <Badge key={slotId} variant="outline">{slot.timeSlot}</Badge>
                  ) : null;
                })}
              </div>
            </div>
            
            <div>
              <Label htmlFor="companyName">Nome da Empresa *</Label>
              <Input id="companyName" placeholder="Digite o nome da empresa" />
            </div>
            
            <div>
              <Label htmlFor="contactPerson">Pessoa de Contato *</Label>
              <Input id="contactPerson" placeholder="Nome da pessoa responsável" />
            </div>
            
            <div>
              <Label htmlFor="contactEmail">E-mail de Contato *</Label>
              <Input id="contactEmail" type="email" placeholder="email@empresa.com" />
            </div>
            
            <div>
              <Label htmlFor="contactPhone">Telefone</Label>
              <Input id="contactPhone" placeholder="(11) 99999-9999" />
            </div>
            
            <div>
              <Label htmlFor="notes">Observações</Label>
              <Textarea id="notes" placeholder="Informações adicionais sobre o carreamento" />
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowBookingModal(false)}>
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                // Implementar lógica de agendamento
                setShowBookingModal(false);
                toast({
                  title: "Agendamento confirmado!",
                  description: "Você receberá um e-mail de confirmação em breve.",
                });
              }}
              className="bg-[#0C29AB] hover:bg-blue-800"
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
          <p>Tem certeza que deseja cancelar este agendamento?</p>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCancelModal(false)}>
              Não
            </Button>
            <Button 
              variant="destructive"
              onClick={() => {
                setShowCancelModal(false);
                toast({
                  title: "Agendamento cancelado",
                  description: "O agendamento foi cancelado com sucesso.",
                });
              }}
              data-testid="button-confirm-cancel"
            >
              Sim, Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Ações do Gestor */}
      <Dialog open={showManagerModal} onOpenChange={setShowManagerModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {managerAction === 'complete' ? 'Concluir Agendamento' : 'Cancelar Agendamento'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Observação {managerAction === 'cancel' ? '(Obrigatória)' : ''}</Label>
              <Textarea
                value={managerNotes}
                onChange={(e) => setManagerNotes(e.target.value)}
                placeholder={
                  managerAction === 'complete' 
                    ? "Observações sobre a conclusão do serviço..."
                    : "Motivo do cancelamento..."
                }
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowManagerModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowManagerModal(false);
                toast({
                  title: managerAction === 'complete' ? "Agendamento concluído" : "Agendamento cancelado",
                  description: "Ação realizada com sucesso.",
                });
              }}
              className={managerAction === 'complete' ? "bg-green-600 hover:bg-green-700" : ""}
              variant={managerAction === 'cancel' ? "destructive" : "default"}
              data-testid={`button-confirm-${managerAction}`}
            >
              {managerAction === 'complete' ? 'Concluir' : 'Cancelar Agendamento'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal para Liberar Horário */}
      <Dialog open={showSlotModal} onOpenChange={setShowSlotModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Liberar Horário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Data Selecionada</Label>
              <p className="text-sm text-gray-600">
                {format(selectedDate, "dd 'de' MMMM 'de' yyyy", { locale: ptBR })}
              </p>
            </div>
            <div>
              <Label htmlFor="timeSlot">Horário</Label>
              <Select value={newSlotTime} onValueChange={setNewSlotTime}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o horário" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 9 }, (_, i) => {
                    const hour = 8 + i;
                    const time = `${hour.toString().padStart(2, '0')}:00`;
                    return (
                      <SelectItem key={time} value={time}>
                        {time}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowSlotModal(false)}>
              Cancelar
            </Button>
            <Button
              onClick={() => {
                setShowSlotModal(false);
                toast({
                  title: "Horário liberado",
                  description: "O horário foi liberado para agendamento.",
                });
              }}
              disabled={!newSlotTime}
              className="bg-[#0C29AB] hover:bg-blue-800"
              data-testid="button-confirm-slot"
            >
              Liberar Horário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}