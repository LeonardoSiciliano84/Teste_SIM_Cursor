import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
// Removido ScrollArea pois não está disponível
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { 
  Bell,
  BellRing,
  Calendar,
  Car,
  Clock,
  CheckCircle,
  X,
  MapPin,
  AlertTriangle
} from "lucide-react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface DriverNotification {
  id: string;
  driverId: string;
  vehicleId: string;
  type: string;
  title: string;
  message: string;
  scheduledDate?: string;
  location?: string;
  vehiclePlate?: string;
  isRead: boolean;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface DriverNotificationsProps {
  driverId: string;
}

export default function DriverNotifications({ driverId }: DriverNotificationsProps) {
  const [selectedNotification, setSelectedNotification] = useState<DriverNotification | null>(null);
  const [isNotificationModalOpen, setIsNotificationModalOpen] = useState(false);
  
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Buscar notificações do motorista
  const { data: notifications = [], isLoading } = useQuery<DriverNotification[]>({
    queryKey: ['/api/driver', driverId, 'notifications'],
    refetchInterval: 30000, // Atualizar a cada 30 segundos
  });

  // Mutation para marcar notificação como lida
  const markAsReadMutation = useMutation({
    mutationFn: async (notificationId: string) => {
      return apiRequest(`/api/driver/notifications/${notificationId}/read`, {
        method: 'PUT',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/driver', driverId, 'notifications'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro",
        description: error.message || "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    },
  });

  const unreadCount = notifications.filter(n => !n.isRead).length;

  const handleNotificationClick = (notification: DriverNotification) => {
    setSelectedNotification(notification);
    setIsNotificationModalOpen(true);
    
    // Marcar como lida se não estiver
    if (!notification.isRead) {
      markAsReadMutation.mutate(notification.id);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'preventive_maintenance':
        return Calendar;
      case 'vehicle_alert':
        return AlertTriangle;
      default:
        return Bell;
    }
  };

  const getNotificationColor = (type: string, isRead: boolean) => {
    if (isRead) return 'bg-gray-100 text-gray-700';
    
    switch (type) {
      case 'preventive_maintenance':
        return 'bg-blue-100 text-blue-800';
      case 'vehicle_alert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-yellow-100 text-yellow-800';
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse space-y-4">
        <div className="h-16 bg-gray-200 rounded"></div>
        <div className="h-16 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <>
      {/* Header com contador */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="relative">
            {unreadCount > 0 ? (
              <BellRing className="w-6 h-6 text-[#0C29AB]" />
            ) : (
              <Bell className="w-6 h-6 text-gray-600" />
            )}
            {unreadCount > 0 && (
              <Badge 
                className="absolute -top-2 -right-2 h-5 w-5 text-xs rounded-full bg-red-500 text-white p-0 flex items-center justify-center"
              >
                {unreadCount > 9 ? '9+' : unreadCount}
              </Badge>
            )}
          </div>
          <h2 className="text-xl font-bold text-gray-900">Notificações</h2>
        </div>
        {unreadCount > 0 && (
          <span className="text-sm text-gray-600">
            {unreadCount} {unreadCount === 1 ? 'nova' : 'novas'}
          </span>
        )}
      </div>

      {/* Lista de notificações */}
      {notifications.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <Bell className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-600 mb-2">
              Nenhuma notificação
            </h3>
            <p className="text-gray-500">
              Você não possui notificações no momento
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const NotificationIcon = getNotificationIcon(notification.type);
            const isUrgent = notification.scheduledDate && 
              new Date(notification.scheduledDate) <= new Date(Date.now() + 24 * 60 * 60 * 1000); // Próximas 24 horas

            return (
              <Card 
                key={notification.id}
                className={`cursor-pointer transition-all hover:shadow-md ${
                  !notification.isRead ? 'ring-2 ring-[#0C29AB]/20 bg-blue-50/50' : ''
                } ${isUrgent ? 'border-red-300' : ''}`}
                onClick={() => handleNotificationClick(notification)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`p-2 rounded-full ${getNotificationColor(notification.type, notification.isRead)}`}>
                      <NotificationIcon className="w-4 h-4" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-1">
                        <h4 className={`font-semibold truncate ${!notification.isRead ? 'text-gray-900' : 'text-gray-700'}`}>
                          {notification.title}
                        </h4>
                        <div className="flex items-center gap-2">
                          {isUrgent && (
                            <Badge variant="destructive" className="text-xs">
                              URGENTE
                            </Badge>
                          )}
                          {!notification.isRead && (
                            <div className="w-2 h-2 bg-[#0C29AB] rounded-full"></div>
                          )}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                        {notification.message.split('\n')[0]}...
                      </p>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {format(new Date(notification.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                        </div>
                        
                        {notification.vehiclePlate && (
                          <div className="flex items-center gap-1">
                            <Car className="w-3 h-3" />
                            {notification.vehiclePlate}
                          </div>
                        )}
                        
                        {notification.scheduledDate && (
                          <div className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {format(new Date(notification.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Modal de detalhes da notificação */}
      <Dialog open={isNotificationModalOpen} onOpenChange={setIsNotificationModalOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh]">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="flex items-center gap-2">
                {selectedNotification && (
                  <>
                    {(() => {
                      const NotificationIcon = getNotificationIcon(selectedNotification.type);
                      return <NotificationIcon className="w-5 h-5" />;
                    })()}
                    {selectedNotification.title}
                  </>
                )}
              </DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsNotificationModalOpen(false)}
              >
                <X className="w-4 h-4" />
              </Button>
            </div>
          </DialogHeader>
          
          {selectedNotification && (
            <div className="max-h-96 overflow-y-auto">
              <div className="space-y-4">
                {/* Informações do agendamento */}
                {selectedNotification.type === 'preventive_maintenance' && (
                  <Card className="bg-gray-50">
                    <CardContent className="p-4">
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        {selectedNotification.vehiclePlate && (
                          <div>
                            <p className="font-semibold text-gray-700">Veículo</p>
                            <p className="flex items-center gap-1">
                              <Car className="w-4 h-4" />
                              {selectedNotification.vehiclePlate}
                            </p>
                          </div>
                        )}
                        
                        {selectedNotification.scheduledDate && (
                          <div>
                            <p className="font-semibold text-gray-700">Data Agendada</p>
                            <p className="flex items-center gap-1">
                              <Calendar className="w-4 h-4" />
                              {format(new Date(selectedNotification.scheduledDate), "dd/MM/yyyy", { locale: ptBR })}
                            </p>
                          </div>
                        )}
                        
                        {selectedNotification.location && (
                          <div>
                            <p className="font-semibold text-gray-700">Local</p>
                            <p className="flex items-center gap-1">
                              <MapPin className="w-4 h-4" />
                              {selectedNotification.location === 'oficina_interna' ? 'Oficina Interna' : 'Oficina Externa'}
                            </p>
                          </div>
                        )}
                        
                        <div>
                          <p className="font-semibold text-gray-700">Status</p>
                          <Badge className={selectedNotification.status === 'scheduled' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100 text-gray-800'}>
                            {selectedNotification.status === 'scheduled' ? 'Agendado' : 'Concluído'}
                          </Badge>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )}
                
                {/* Mensagem completa */}
                <div>
                  <h4 className="font-semibold text-gray-900 mb-2">Mensagem</h4>
                  <div className="bg-white border rounded-lg p-4 whitespace-pre-wrap text-sm text-gray-700">
                    {selectedNotification.message}
                  </div>
                </div>
                
                {/* Rodapé com data */}
                <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t">
                  <span>
                    Recebido em {format(new Date(selectedNotification.createdAt), "dd/MM/yyyy 'às' HH:mm", { locale: ptBR })}
                  </span>
                  {selectedNotification.isRead && (
                    <div className="flex items-center gap-1">
                      <CheckCircle className="w-3 h-3" />
                      Lida
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}