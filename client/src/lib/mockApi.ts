// Mock API para funcionar sem backend
import { User, Vehicle, Employee, Maintenance } from '../types/mock';

// Delay para simular latência de rede
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

// Dados mock
const mockUser: User = {
  id: "user-1",
  email: "admin@felka.com.br",
  name: "Administrador FELKA",
  role: "admin",
  createdAt: new Date().toISOString()
};

const mockVehicles: Vehicle[] = [
  {
    id: "vehicle-1",
    name: "Scania R450",
    plate: "ABC-1234",
    brand: "Scania",
    model: "R450",
    vehicleType: "Tração",
    classification: "Pesado",
    status: "Ativo",
    createdAt: new Date().toISOString()
  },
  {
    id: "vehicle-2",
    name: "Volvo FH540",
    plate: "DEF-5678",
    brand: "Volvo",
    model: "FH540",
    vehicleType: "Tração",
    classification: "Pesado",
    status: "Manutenção",
    createdAt: new Date().toISOString()
  }
];

const mockEmployees: Employee[] = [
  {
    id: "emp-1",
    name: "João Silva",
    email: "joao@felka.com.br",
    phone: "(11) 99999-9999",
    position: "Motorista",
    department: "Operações",
    createdAt: new Date().toISOString()
  },
  {
    id: "emp-2",
    name: "Maria Santos",
    email: "maria@felka.com.br",
    phone: "(11) 88888-8888",
    position: "Gerente",
    department: "Administração",
    createdAt: new Date().toISOString()
  }
];

// Interceptar requests para APIs e retornar dados mock
export const setupMockApi = () => {
  // Override do fetch para interceptar chamadas da API
  const originalFetch = window.fetch;
  
  window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
    const url = input.toString();
    
    // Simular delay de rede
    await delay(300);
    
    // Interceptar chamadas de autenticação
    if (url.includes('/api/auth/login')) {
      return new Response(JSON.stringify({ user: mockUser }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Interceptar dashboard stats
    if (url.includes('/api/dashboard/stats')) {
      return new Response(JSON.stringify(mockDashboardStats), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Interceptar veículos
    if (url.includes('/api/vehicles')) {
      return new Response(JSON.stringify(expandedMockVehicles), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Interceptar funcionários
    if (url.includes('/api/employees')) {
      return new Response(JSON.stringify(mockEmployees), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Para outras APIs, retornar array vazio ou objeto padrão
    if (url.includes('/api/')) {
      const isArray = url.includes('list') || url.includes('vehicles') || url.includes('employees');
      return new Response(JSON.stringify(isArray ? [] : {}), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    // Para outras requisições, usar fetch original
    return originalFetch(input, init);
  };
};

// Dados mock mais completos para demonstração
const mockDashboardStats = {
  activeVehicles: 24,
  totalDrivers: 45,
  todayTrips: 12,
  monthlyRevenue: 350000,
  weeklyTrips: [
    { day: 'Seg', trips: 8 },
    { day: 'Ter', trips: 12 },
    { day: 'Qua', trips: 10 },
    { day: 'Qui', trips: 15 },
    { day: 'Sex', trips: 18 },
    { day: 'Sáb', trips: 6 },
    { day: 'Dom', trips: 3 }
  ],
  revenueChart: [
    { month: 'Jan', revenue: 280000 },
    { month: 'Fev', revenue: 320000 },
    { month: 'Mar', revenue: 350000 },
    { month: 'Abr', revenue: 310000 },
    { month: 'Mai', revenue: 380000 },
    { month: 'Jun', revenue: 350000 }
  ]
};

// Extender dados de veículos
const expandedMockVehicles: Vehicle[] = [
  {
    id: "vehicle-1",
    name: "Scania R450 - Transportes",
    plate: "ABC-1234",
    brand: "Scania",
    model: "R450",
    vehicleType: "Tração",
    classification: "Pesado",
    status: "Ativo",
    driverId: "driver-1",
    currentKm: 125000,
    lastMaintenanceKm: 120000,
    createdAt: new Date().toISOString()
  },
  {
    id: "vehicle-2",
    name: "Volvo FH540 - Logística",
    plate: "DEF-5678",
    brand: "Volvo",
    model: "FH540",
    vehicleType: "Tração",
    classification: "Pesado",
    status: "Manutenção",
    currentKm: 98000,
    lastMaintenanceKm: 95000,
    createdAt: new Date().toISOString()
  },
  {
    id: "vehicle-3",
    name: "Mercedes Actros - Cargas",
    plate: "GHI-9012",
    brand: "Mercedes-Benz",
    model: "Actros 2646",
    vehicleType: "Tração",
    classification: "Pesado",
    status: "Ativo",
    driverId: "driver-2",
    currentKm: 87000,
    lastMaintenanceKm: 85000,
    createdAt: new Date().toISOString()
  }
];

// Auto-login para demo
export const setupAutoLogin = () => {
  setTimeout(() => {
    localStorage.setItem('felka_auth_user', JSON.stringify(mockUser));
    
    // Disparar evento customizado para notificar mudança de auth
    const authEvent = new CustomEvent('authChange', { detail: mockUser });
    window.dispatchEvent(authEvent);
    
    console.log('🚀 FELKA Transportes - Demo Mode Ativo');
    console.log('👤 Usuário logado automaticamente:', mockUser.name);
  }, 100);
};