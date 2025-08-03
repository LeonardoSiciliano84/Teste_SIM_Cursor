import { 
  type User, 
  type InsertUser, 
  type Vehicle, 
  type InsertVehicle,
  type Driver,
  type InsertDriver,
  type Route,
  type InsertRoute,
  type Booking,
  type InsertBooking,
  type Trip,
  type InsertTrip,
  type LoginData,
  type Employee,
  type InsertEmployee,
  type EmployeeDependent,
  type InsertEmployeeDependent,
  type EmployeeDocument,
  type InsertEmployeeDocument,
  type EmployeeOccurrence,
  type InsertEmployeeOccurrence,
  type EmployeeMovement,
  type InsertEmployeeMovement,
  type EmployeeFile,
  type InsertEmployeeFile,
  type PranchaService,
  type InsertPranchaService,
  type ServiceLog,
  type InsertServiceLog,
  type Sinistro,
  type InsertSinistro,
  type SinistroDocument,
  type InsertSinistroDocument,
  type SinistroHistory,
  type InsertSinistroHistory,
  type VehicleChecklist,
  type InsertVehicleChecklist,
  type ChecklistItem,
  type InsertChecklistItem,
  type ChecklistHistory,
  type InsertChecklistHistory,
  // Tipos do módulo de controle de acesso
  type Visitor,
  type InsertVisitor,
  type FacialEncoding,
  type InsertFacialEncoding,
  type AccessLog,
  type InsertAccessLog,
  type TemporaryBadge,
  type InsertTemporaryBadge,
  type RecognitionAttempt,
  type InsertRecognitionAttempt,
  type GateSystemConfig,
  type InsertGateSystemConfig,
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // User methods
  getUser(id: string): Promise<User | undefined>;
  getUserByEmail(email: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  authenticateUser(credentials: LoginData): Promise<User | null>;

  // Vehicle methods
  getVehicles(): Promise<Vehicle[]>;
  getVehicle(id: string): Promise<Vehicle | undefined>;
  createVehicle(vehicle: InsertVehicle): Promise<Vehicle>;
  updateVehicle(id: string, vehicle: Partial<InsertVehicle>): Promise<Vehicle | undefined>;
  deleteVehicle(id: string): Promise<boolean>;

  // Driver methods
  getDrivers(): Promise<Driver[]>;
  getDriver(id: string): Promise<Driver | undefined>;
  createDriver(driver: InsertDriver): Promise<Driver>;
  updateDriver(id: string, driver: Partial<InsertDriver>): Promise<Driver | undefined>;
  deleteDriver(id: string): Promise<boolean>;

  // Route methods
  getRoutes(): Promise<Route[]>;
  getRoute(id: string): Promise<Route | undefined>;
  createRoute(route: InsertRoute): Promise<Route>;
  updateRoute(id: string, route: Partial<InsertRoute>): Promise<Route | undefined>;
  deleteRoute(id: string): Promise<boolean>;
  getActiveRoutes(): Promise<Route[]>;

  // Booking methods
  getBookings(): Promise<Booking[]>;
  getBooking(id: string): Promise<Booking | undefined>;
  createBooking(booking: InsertBooking): Promise<Booking>;
  updateBooking(id: string, booking: Partial<InsertBooking>): Promise<Booking | undefined>;
  deleteBooking(id: string): Promise<boolean>;

  // Trip methods
  getTrips(): Promise<Trip[]>;
  createTrip(trip: InsertTrip): Promise<Trip>;

  // Analytics methods
  getDashboardStats(): Promise<{
    activeVehicles: number;
    totalDrivers: number;
    todayTrips: number;
    monthlyRevenue: number;
  }>;

  // Employee methods
  getEmployees(): Promise<Employee[]>;
  getEmployee(id: string): Promise<Employee | undefined>;
  createEmployee(employee: InsertEmployee): Promise<Employee>;
  updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined>;
  deleteEmployee(id: string): Promise<boolean>;

  // Employee Dependents methods
  getEmployeeDependents(employeeId: string): Promise<EmployeeDependent[]>;
  createEmployeeDependent(dependent: InsertEmployeeDependent): Promise<EmployeeDependent>;
  updateEmployeeDependent(id: string, dependent: Partial<InsertEmployeeDependent>): Promise<EmployeeDependent | undefined>;
  deleteEmployeeDependent(id: string): Promise<boolean>;

  // Employee Documents methods
  getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]>;
  getEmployeeDocument(documentId: string): Promise<EmployeeDocument | undefined>;
  createEmployeeDocument(document: any): Promise<EmployeeDocument>;
  updateEmployeeDocument(id: string, document: Partial<any>): Promise<EmployeeDocument | undefined>;
  deleteEmployeeDocument(id: string): Promise<boolean>;
  getExpiringDocuments(days?: number): Promise<EmployeeDocument[]>;

  // Employee Occurrences methods
  getEmployeeOccurrences(employeeId: string): Promise<EmployeeOccurrence[]>;
  getEmployeeOccurrence(occurrenceId: string): Promise<EmployeeOccurrence | undefined>;
  getAllOccurrences(): Promise<EmployeeOccurrence[]>;
  createEmployeeOccurrence(occurrence: InsertEmployeeOccurrence): Promise<EmployeeOccurrence>;
  updateEmployeeOccurrence(id: string, occurrence: Partial<InsertEmployeeOccurrence>): Promise<EmployeeOccurrence | undefined>;
  deleteEmployeeOccurrence(id: string): Promise<boolean>;

  // Employee Movements methods
  getEmployeeMovements(employeeId: string): Promise<EmployeeMovement[]>;
  createEmployeeMovement(movement: InsertEmployeeMovement): Promise<EmployeeMovement>;

  // Employee Files methods
  getEmployeeFiles(employeeId: string): Promise<EmployeeFile[]>;
  createEmployeeFile(file: InsertEmployeeFile): Promise<EmployeeFile>;
  deleteEmployeeFile(id: string): Promise<boolean>;

  // Prancha Service methods
  getPranchaServices(): Promise<PranchaService[]>;
  getPranchaService(id: string): Promise<PranchaService | undefined>;
  createPranchaService(service: InsertPranchaService): Promise<PranchaService>;
  updatePranchaService(id: string, service: Partial<InsertPranchaService>): Promise<PranchaService | undefined>;
  
  // Service Log methods
  getServiceLogs(serviceId: string): Promise<ServiceLog[]>;
  createServiceLog(log: InsertServiceLog): Promise<ServiceLog>;

  // Sinistro methods
  getSinistros(): Promise<Sinistro[]>;
  getSinistro(id: string): Promise<Sinistro | undefined>;
  createSinistro(sinistro: InsertSinistro): Promise<Sinistro>;
  updateSinistro(id: string, updates: Partial<Sinistro>, updatedBy: string, updatedByName: string): Promise<Sinistro | undefined>;
  finalizarSinistro(id: string, finalizadoPor: string, nomeFinalizador: string): Promise<Sinistro | undefined>;

  // SinistroDocument methods
  getSinistroDocuments(sinistroId: string): Promise<SinistroDocument[]>;
  createSinistroDocument(document: InsertSinistroDocument): Promise<SinistroDocument>;
  deleteSinistroDocument(id: string, deletedBy: string, deletedByName: string): Promise<boolean>;

  // SinistroHistory methods
  getSinistroHistory(sinistroId: string): Promise<SinistroHistory[]>;
  createSinistroHistory(history: InsertSinistroHistory): Promise<SinistroHistory>;
  
  // Vehicle Checklist methods
  getVehicleChecklists(filters?: {
    vehiclePlate?: string;
    driverName?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    verificationStatus?: string;
    baseOrigin?: string;
  }): Promise<VehicleChecklist[]>;
  getVehicleChecklist(id: string): Promise<VehicleChecklist | undefined>;
  createVehicleChecklist(checklist: InsertVehicleChecklist): Promise<VehicleChecklist>;
  updateVehicleChecklist(id: string, updates: Partial<VehicleChecklist>): Promise<VehicleChecklist | undefined>;
  verifyChecklist(id: string, verifiedBy: string, verifiedByName: string, notes?: string): Promise<VehicleChecklist | undefined>;
  
  // Checklist Items methods  
  getChecklistItems(category?: string): Promise<ChecklistItem[]>;
  createChecklistItem(item: InsertChecklistItem): Promise<ChecklistItem>;
  updateChecklistItem(id: string, item: Partial<ChecklistItem>): Promise<ChecklistItem | undefined>;
  deleteChecklistItem(id: string): Promise<boolean>;
  
  // Checklist History methods
  getChecklistHistory(checklistId: string): Promise<ChecklistHistory[]>;
  createChecklistHistory(history: InsertChecklistHistory): Promise<ChecklistHistory>;
  
  // ============= MÓDULO DE CONTROLE DE ACESSO =============
  
  // Visitor methods
  getVisitors(): Promise<Visitor[]>;
  getVisitor(id: string): Promise<Visitor | undefined>;
  getVisitorByCpf(cpf: string): Promise<Visitor | undefined>;
  createVisitor(visitor: InsertVisitor): Promise<Visitor>;
  updateVisitor(id: string, visitor: Partial<InsertVisitor>): Promise<Visitor | undefined>;
  deleteVisitor(id: string): Promise<boolean>;
  
  // Facial Encoding methods
  getFacialEncodings(personType?: string, personId?: string): Promise<FacialEncoding[]>;
  getFacialEncoding(id: string): Promise<FacialEncoding | undefined>;
  createFacialEncoding(encoding: InsertFacialEncoding): Promise<FacialEncoding>;
  updateFacialEncoding(id: string, encoding: Partial<InsertFacialEncoding>): Promise<FacialEncoding | undefined>;
  deleteFacialEncoding(id: string): Promise<boolean>;
  
  // Access Log methods
  getAccessLogs(filters?: {
    personType?: string;
    personId?: string;
    direction?: string;
    accessMethod?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
  }): Promise<AccessLog[]>;
  getAccessLog(id: string): Promise<AccessLog | undefined>;
  createAccessLog(log: InsertAccessLog): Promise<AccessLog>;
  
  // Temporary Badge methods
  getTemporaryBadges(status?: string): Promise<TemporaryBadge[]>;
  getTemporaryBadge(id: string): Promise<TemporaryBadge | undefined>;
  getTemporaryBadgeByNumber(badgeNumber: string): Promise<TemporaryBadge | undefined>;
  createTemporaryBadge(badge: InsertTemporaryBadge): Promise<TemporaryBadge>;
  updateTemporaryBadge(id: string, badge: Partial<InsertTemporaryBadge>): Promise<TemporaryBadge | undefined>;
  returnTemporaryBadge(id: string, returnedBy: string): Promise<TemporaryBadge | undefined>;
  
  // Recognition Attempt methods
  getRecognitionAttempts(filters?: {
    attemptType?: string;
    success?: boolean;
    personType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RecognitionAttempt[]>;
  createRecognitionAttempt(attempt: InsertRecognitionAttempt): Promise<RecognitionAttempt>;
  
  // Gate System Config methods
  getGateSystemConfig(): Promise<GateSystemConfig[]>;
  getGateSystemConfigByKey(key: string): Promise<GateSystemConfig | undefined>;
  setGateSystemConfig(config: InsertGateSystemConfig): Promise<GateSystemConfig>;
  updateGateSystemConfig(key: string, value: string, updatedBy: string): Promise<GateSystemConfig | undefined>;
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<string, Vehicle>;
  private drivers: Map<string, Driver>;
  private routes: Map<string, Route>;
  private bookings: Map<string, Booking>;
  private trips: Map<string, Trip>;
  private employees: Map<string, Employee>;
  private employeeDependents: Map<string, EmployeeDependent>;
  private employeeDocuments: Map<string, EmployeeDocument>;
  private employeeOccurrences: Map<string, EmployeeOccurrence>;
  private employeeMovements: Map<string, EmployeeMovement>;
  private employeeFiles: Map<string, EmployeeFile>;
  private pranchaServices: Map<string, PranchaService>;
  private serviceLogs: Map<string, ServiceLog>;
  private sinistros: Map<string, Sinistro>;
  private sinistroDocuments: Map<string, SinistroDocument>;
  private sinistroHistory: Map<string, SinistroHistory>;
  private vehicleChecklists: Map<string, VehicleChecklist>;
  private checklistItems: Map<string, ChecklistItem>;
  private checklistHistory: Map<string, ChecklistHistory>;
  // Módulo de controle de acesso
  private visitors: Map<string, Visitor>;
  private facialEncodings: Map<string, FacialEncoding>;
  private accessLogs: Map<string, AccessLog>;
  private temporaryBadges: Map<string, TemporaryBadge>;
  private recognitionAttempts: Map<string, RecognitionAttempt>;
  private gateSystemConfig: Map<string, GateSystemConfig>;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.drivers = new Map();
    this.routes = new Map();
    this.bookings = new Map();
    this.trips = new Map();
    this.employees = new Map();
    this.employeeDependents = new Map();
    this.employeeDocuments = new Map();
    this.employeeOccurrences = new Map();
    this.employeeMovements = new Map();
    this.employeeFiles = new Map();
    this.pranchaServices = new Map();
    this.serviceLogs = new Map();
    this.sinistros = new Map();
    this.sinistroDocuments = new Map();
    this.sinistroHistory = new Map();
    this.vehicleChecklists = new Map();
    this.checklistItems = new Map();
    this.checklistHistory = new Map();
    // Módulo de controle de acesso
    this.visitors = new Map();
    this.facialEncodings = new Map();
    this.accessLogs = new Map();
    this.temporaryBadges = new Map();
    this.recognitionAttempts = new Map();
    this.gateSystemConfig = new Map();
    
    // Initialize with default admin user and sample data
    this.initializeDefaultData();
    this.initializeChecklistTestData();
  }

  private initializeDefaultData() {
    const adminUser: User = {
      id: randomUUID(),
      email: "admin@felka.com",
      password: "admin123", // In production, this should be hashed
      name: "Administrador",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Usuário específico para motorista
    const driverUser: User = {
      id: randomUUID(),
      email: "motorista@felka.com",
      password: "admin123", // In production, this should be hashed
      name: "João Silva",
      role: "driver",
      createdAt: new Date(),
    };
    this.users.set(driverUser.id, driverUser);

    // Add some sample drivers
    const drivers = [
      {
        id: randomUUID(),
        name: "Carlos Silva",
        phone: "(11) 99999-9999",
        license: "12345678901",
        licenseCategory: "D",
        status: "on_trip" as const,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Maria Santos",
        phone: "(11) 98888-8888",
        license: "98765432109",
        licenseCategory: "C",
        status: "available" as const,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "José Oliveira",
        phone: "(11) 97777-7777",
        license: "11122233344",
        licenseCategory: "E",
        status: "on_trip" as const,
        createdAt: new Date(),
      },
    ];

    drivers.forEach(driver => this.drivers.set(driver.id, driver));

    // Dados iniciais de colaboradores
    const employees = [
      {
        id: randomUUID(),
        fullName: "Maria Silva Santos",
        cpf: "123.456.789-01",
        birthDate: "1985-03-15",
        phone: "(11) 98765-4321",
        employeeNumber: "EMP-001",
        admissionDate: "2020-01-15",
        position: "Analista de RH",
        department: "Recursos Humanos",
        status: "active" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Carlos Oliveira Costa",
        cpf: "987.654.321-00",
        birthDate: "1990-07-22",
        phone: "(11) 97654-3210",
        employeeNumber: "EMP-002",
        admissionDate: "2021-05-10",
        position: "Motorista Sênior",
        department: "Operações",
        status: "active" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "João Silva",
        cpf: "111.222.333-44",
        birthDate: "1988-12-05",
        phone: "(11) 91234-5678",
        email: "motorista@felka.com",
        employeeNumber: "MOT-001",
        admissionDate: "2019-03-01",
        position: "Motorista",
        department: "Operações",
        driverLicense: "12345678901",
        driverLicenseCategory: "D",
        driverLicenseExpiry: "2025-12-31",
        status: "active" as const,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    employees.forEach(employee => {
      this.employees.set(employee.id, employee);
    });

    // Dados iniciais de veículos para teste
    const vehicles = [
      {
        id: randomUUID(),
        name: "Volvo FH 540 - Cavalo Mecânico",
        plate: "ABC-1234",
        brand: "Volvo",
        model: "FH 540",
        renavam: "123456789",
        chassis: "9BW1234567890123",
        modelYear: 2020,
        manufactureYear: 2020,
        vehicleType: "Tração",
        classification: "Cavalo Mecânico",
        preventiveMaintenanceKm: 8500,
        tireRotationKm: 15000,
        loadCapacity: 25000,
        fuelTankCapacity: 400,
        fuelConsumption: 3.2,
        status: "active",
        currentLocation: "Terminal São Paulo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Mercedes-Benz Actros - Cavalo",
        plate: "DEF-5678",
        brand: "Mercedes-Benz",
        model: "Actros 2546",
        renavam: "987654321",
        chassis: "9BW9876543210987",
        modelYear: 2021,
        manufactureYear: 2021,
        vehicleType: "Tração",
        classification: "Cavalo Mecânico",
        preventiveMaintenanceKm: 12000,
        tireRotationKm: 18000,
        loadCapacity: 28000,
        fuelTankCapacity: 450,
        fuelConsumption: 3.5,
        status: "active",
        currentLocation: "Terminal Campinas",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Carreta Baú Frigorífica",
        plate: "GHI-9012",
        brand: "Randon",
        model: "Sider R-230",
        renavam: "456789123",
        chassis: "9BR4567891234567",
        modelYear: 2019,
        manufactureYear: 2019,
        vehicleType: "Semirreboque",
        classification: "Carreta Baú",
        loadCapacity: 30000,
        bodyLength: 15.5,
        bodyWidth: 2.6,
        floorHeight: 2.7,
        status: "active",
        currentLocation: "Terminal Santos",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Carreta Graneleira",
        plate: "JKL-3456",
        brand: "Guerra",
        model: "Graneleiro G-300",
        renavam: "789123456",
        chassis: "9BG7891234567890",
        modelYear: 2020,
        manufactureYear: 2020,
        vehicleType: "Semirreboque",
        classification: "Carreta Graneleira",
        loadCapacity: 35000,
        bodyLength: 14.0,
        bodyWidth: 2.6,
        floorHeight: 1.8,
        status: "active",
        currentLocation: "Terminal Interior",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Prancha Rebaixada",
        plate: "MNO-7890",
        brand: "Noma",
        model: "Prancha PR-40",
        renavam: "321654987",
        chassis: "9BN3216549876543",
        modelYear: 2018,
        manufactureYear: 2018,
        vehicleType: "Semirreboque",
        classification: "Prancha",
        loadCapacity: 40000,
        bodyLength: 12.0,
        bodyWidth: 2.6,
        floorHeight: 0.9,
        status: "active",
        currentLocation: "Pátio Principal",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Implemento Tank Container",
        plate: "PQR-2468",
        brand: "Librelato",
        model: "Tank TC-25",
        renavam: "654987321",
        chassis: "9BL6549873219876",
        modelYear: 2021,
        manufactureYear: 2021,
        vehicleType: "Semirreboque",
        classification: "Tank Container",
        loadCapacity: 25000,
        fuelTankCapacity: 25000,
        bodyLength: 12.2,
        bodyWidth: 2.5,
        status: "active",
        currentLocation: "Terminal Químico",
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    vehicles.forEach(vehicle => {
      this.vehicles.set(vehicle.id, vehicle);
    });

    // Dados de rotas de exemplo
    const routes = [
      {
        id: randomUUID(),
        origin: "São Paulo, SP",
        destination: "Rio de Janeiro, RJ",
        distance: 430,
        estimatedTime: "6 horas",
        status: "active" as const,
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        origin: "São Paulo, SP",
        destination: "Belo Horizonte, MG",
        distance: 586,
        estimatedTime: "8 horas",
        status: "active" as const,
        createdAt: new Date(),
      },
    ];

    routes.forEach(route => {
      this.routes.set(route.id, route);
    });

    // Dados de serviços de prancha para teste
    const pranchaServicesData = [
      {
        id: randomUUID(),
        vehicleId: "1",
        vehiclePlate: "ABC-1234",
        vehicleName: "Scania R 450",
        implementId: "3",
        implementPlate: "MNO-7890",
        implementName: "Prancha Rebaixada",
        driverId: "driver1",
        driverName: "João Silva",
        driverRegistration: "MT001",
        ocNumber: "OC-2025-001",
        startDate: "2025-01-25",
        endDate: "2025-01-27",
        serviceDays: 3,
        status: "aguardando" as const,
        hrStatus: "nao_verificado" as const,
        observations: "Serviço de transporte de equipamentos pesados",
        createdAt: new Date(),
        updatedAt: new Date(),
        logs: []
      },
      {
        id: randomUUID(),
        vehicleId: "2",
        vehiclePlate: "DEF-5678",
        vehicleName: "Volvo FH 540",
        implementId: "3",
        implementPlate: "MNO-7890",
        implementName: "Prancha Rebaixada",
        driverId: "driver2",
        driverName: "Carlos Santos",
        driverRegistration: "MT002",
        ocNumber: "OC-2025-002",
        startDate: "2025-01-20",
        endDate: "2025-01-23",
        serviceDays: 4,
        status: "confirmado" as const,
        hrStatus: "verificado" as const,
        observations: "Transporte concluído com sucesso",
        createdAt: new Date(),
        updatedAt: new Date(),
        logs: []
      }
    ];

    pranchaServicesData.forEach(service => {
      this.pranchaServices.set(service.id, service);
    });

  }

  // User methods
  async getUser(id: string): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByEmail(email: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(user => user.email === email);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = randomUUID();
    const user: User = { 
      ...insertUser, 
      id,
      role: insertUser.role || "user",
      createdAt: new Date(),
    };
    this.users.set(id, user);
    return user;
  }

  async authenticateUser(credentials: LoginData): Promise<User | null> {
    const user = await this.getUserByEmail(credentials.email);
    if (user && user.password === credentials.password) {
      return user;
    }
    return null;
  }

  // Vehicle methods
  async getVehicles(): Promise<Vehicle[]> {
    return Array.from(this.vehicles.values());
  }

  async getVehicle(id: string): Promise<Vehicle | undefined> {
    return this.vehicles.get(id);
  }

  async createVehicle(insertVehicle: InsertVehicle): Promise<Vehicle> {
    const id = randomUUID();
    const vehicle: Vehicle = {
      ...insertVehicle,
      id,
      status: insertVehicle.status || "active",
      currentLocation: insertVehicle.currentLocation || null,
      driverId: insertVehicle.driverId || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.vehicles.set(id, vehicle);
    return vehicle;
  }

  async updateVehicle(id: string, vehicleUpdate: Partial<InsertVehicle>): Promise<Vehicle | undefined> {
    const vehicle = this.vehicles.get(id);
    if (!vehicle) return undefined;

    const updatedVehicle = { ...vehicle, ...vehicleUpdate };
    this.vehicles.set(id, updatedVehicle);
    return updatedVehicle;
  }

  async deleteVehicle(id: string): Promise<boolean> {
    return this.vehicles.delete(id);
  }

  // Driver methods
  async getDrivers(): Promise<Driver[]> {
    return Array.from(this.drivers.values());
  }

  async getDriver(id: string): Promise<Driver | undefined> {
    return this.drivers.get(id);
  }

  async createDriver(insertDriver: InsertDriver): Promise<Driver> {
    const id = randomUUID();
    const driver: Driver = {
      ...insertDriver,
      id,
      status: insertDriver.status || "available",
      createdAt: new Date(),
    };
    this.drivers.set(id, driver);
    return driver;
  }

  async updateDriver(id: string, driverUpdate: Partial<InsertDriver>): Promise<Driver | undefined> {
    const driver = this.drivers.get(id);
    if (!driver) return undefined;

    const updatedDriver = { ...driver, ...driverUpdate };
    this.drivers.set(id, updatedDriver);
    return updatedDriver;
  }

  async deleteDriver(id: string): Promise<boolean> {
    return this.drivers.delete(id);
  }

  // Route methods
  async getRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values());
  }

  async getRoute(id: string): Promise<Route | undefined> {
    return this.routes.get(id);
  }

  async createRoute(insertRoute: InsertRoute): Promise<Route> {
    const id = randomUUID();
    const route: Route = {
      ...insertRoute,
      id,
      status: insertRoute.status || "planned",
      distance: insertRoute.distance || null,
      estimatedDuration: insertRoute.estimatedDuration || null,
      vehicleId: insertRoute.vehicleId || null,
      driverId: insertRoute.driverId || null,
      scheduledAt: insertRoute.scheduledAt || null,
      startedAt: insertRoute.startedAt || null,
      completedAt: insertRoute.completedAt || null,
      createdAt: new Date(),
    };
    this.routes.set(id, route);
    return route;
  }

  async updateRoute(id: string, routeUpdate: Partial<InsertRoute>): Promise<Route | undefined> {
    const route = this.routes.get(id);
    if (!route) return undefined;

    const updatedRoute = { ...route, ...routeUpdate };
    this.routes.set(id, updatedRoute);
    return updatedRoute;
  }

  async deleteRoute(id: string): Promise<boolean> {
    return this.routes.delete(id);
  }

  async getActiveRoutes(): Promise<Route[]> {
    return Array.from(this.routes.values()).filter(route => 
      route.status === 'active' || route.status === 'planned'
    );
  }

  // Booking methods
  async getBookings(): Promise<Booking[]> {
    return Array.from(this.bookings.values());
  }

  async getBooking(id: string): Promise<Booking | undefined> {
    return this.bookings.get(id);
  }

  async createBooking(insertBooking: InsertBooking): Promise<Booking> {
    const id = randomUUID();
    const bookingNumber = `BK-${Date.now()}`;
    const booking: Booking = {
      ...insertBooking,
      id,
      bookingNumber,
      status: insertBooking.status || "pending",
      scheduledAt: insertBooking.scheduledAt || null,
      clientEmail: insertBooking.clientEmail || null,
      price: insertBooking.price || null,
      routeId: insertBooking.routeId || null,
      notes: insertBooking.notes || null,
      createdAt: new Date(),
    };
    this.bookings.set(id, booking);
    return booking;
  }

  async updateBooking(id: string, bookingUpdate: Partial<InsertBooking>): Promise<Booking | undefined> {
    const booking = this.bookings.get(id);
    if (!booking) return undefined;

    const updatedBooking = { ...booking, ...bookingUpdate };
    this.bookings.set(id, updatedBooking);
    return updatedBooking;
  }

  async deleteBooking(id: string): Promise<boolean> {
    return this.bookings.delete(id);
  }

  // Trip methods
  async getTrips(): Promise<Trip[]> {
    return Array.from(this.trips.values());
  }

  async createTrip(insertTrip: InsertTrip): Promise<Trip> {
    const id = randomUUID();
    const trip: Trip = {
      ...insertTrip,
      id,
      status: insertTrip.status || "planned",
      completedAt: insertTrip.completedAt || new Date(),
      routeId: insertTrip.routeId || null,
      bookingId: insertTrip.bookingId || null,
      revenue: insertTrip.revenue || null,
      fuelCost: insertTrip.fuelCost || null,
    };
    this.trips.set(id, trip);
    return trip;
  }

  // Analytics methods
  async getDashboardStats(): Promise<{
    activeVehicles: number;
    totalDrivers: number;
    todayTrips: number;
    monthlyRevenue: number;
  }> {
    const activeVehicles = Array.from(this.vehicles.values()).filter(v => v.status === 'active').length;
    const totalDrivers = this.drivers.size;
    const todayTrips = 12; // Mock data - in real app would calculate from today's routes
    const monthlyRevenue = 45200; // Mock data - in real app would sum from trips

    return {
      activeVehicles,
      totalDrivers,
      todayTrips,
      monthlyRevenue,
    };
  }

  // ============= MÉTODOS DE RH =============

  // Employee methods
  async getEmployees(): Promise<Employee[]> {
    // Popular dados de teste se não houver funcionários
    if (this.employees.size === 0) {
      await this.populateTestEmployees();
    }
    return Array.from(this.employees.values());
  }

  private async populateTestEmployees(): Promise<void> {
    const testEmployees = [
      {
        id: randomUUID(),
        fullName: "João Silva Santos",
        cpf: "12345678901",
        phone: "(11) 99999-1111",
        employeeNumber: "001",
        position: "Motorista Sênior",
        department: "Operações",
        email: "joao.silva@felka.com.br",
        status: "active",
        accessLevel: "employee",
        profilePhoto: "",
        admissionDate: "2020-03-15",
        manager: "Carlos Pereira",
        workLocation: "Matriz São Paulo",
        allowedModules: ["vehicles", "routes", "checklists"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Maria Oliveira Costa",
        cpf: "98765432109",
        phone: "(11) 99999-2222",
        employeeNumber: "002", 
        position: "Coordenadora de Frota",
        department: "Gestão de Frota",
        email: "maria.oliveira@felka.com.br",
        status: "active",
        accessLevel: "supervisor",
        profilePhoto: "",
        admissionDate: "2019-08-20",
        manager: "Roberto Lima",
        workLocation: "Matriz São Paulo",
        allowedModules: ["vehicles", "drivers", "maintenance", "reports"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Carlos Eduardo Pereira",
        cpf: "11122233344",
        phone: "(11) 99999-3333",
        employeeNumber: "003",
        position: "Gerente de Operações",
        department: "Gerência",
        email: "carlos.pereira@felka.com.br", 
        status: "active",
        accessLevel: "manager",
        profilePhoto: "",
        admissionDate: "2018-01-10",
        manager: "Diretor Executivo",
        workLocation: "Matriz São Paulo",
        allowedModules: ["all"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Ana Paula Ferreira",
        cpf: "55566677788",
        phone: "(11) 99999-4444",
        employeeNumber: "004",
        position: "Analista de RH",
        department: "Recursos Humanos",
        email: "ana.ferreira@felka.com.br",
        status: "active", 
        accessLevel: "supervisor",
        profilePhoto: "",
        admissionDate: "2021-05-12",
        manager: "Mariana Santos",
        workLocation: "Matriz São Paulo",
        allowedModules: ["employees", "hr", "reports"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Roberto Lima da Silva", 
        cpf: "77788899900",
        phone: "(11) 99999-5555",
        employeeNumber: "005",
        position: "Porteiro",
        department: "Segurança",
        email: "roberto.lima@felka.com.br",
        status: "active",
        accessLevel: "employee", 
        profilePhoto: "",
        admissionDate: "2022-02-28",
        manager: "Carlos Pereira",
        workLocation: "Portaria Principal",
        allowedModules: ["access-control", "visitors"],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    for (const employee of testEmployees) {
      this.employees.set(employee.id, employee as Employee);
    }
  }

  async getEmployee(id: string): Promise<Employee | undefined> {
    return this.employees.get(id);
  }

  async createEmployee(employee: InsertEmployee): Promise<Employee> {
    const newEmployee: Employee = {
      id: randomUUID(),
      ...employee,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.employees.set(newEmployee.id, newEmployee);
    return newEmployee;
  }

  async updateEmployee(id: string, employee: Partial<InsertEmployee>): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    
    const updated: Employee = {
      ...existing,
      ...employee,
      updatedAt: new Date(),
    };
    this.employees.set(id, updated);
    return updated;
  }

  async deleteEmployee(id: string): Promise<boolean> {
    return this.employees.delete(id);
  }

  // Desativar colaborador com motivo
  async deactivateEmployee(id: string, reason: string, changedBy: string): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    
    const updated: Employee = {
      ...existing,
      status: "inactive",
      inactiveReason: reason,
      inactiveDate: new Date(),
      statusChangedBy: changedBy,
      updatedAt: new Date(),
    };
    this.employees.set(id, updated);
    return updated;
  }

  // Reativar colaborador com motivo
  async reactivateEmployee(id: string, reason: string, changedBy: string): Promise<Employee | undefined> {
    const existing = this.employees.get(id);
    if (!existing) return undefined;
    
    const updated: Employee = {
      ...existing,
      status: "active",
      reactivationReason: reason,
      reactivationDate: new Date(),
      statusChangedBy: changedBy,
      updatedAt: new Date(),
    };
    this.employees.set(id, updated);
    return updated;
  }

  // Employee Dependents methods
  async getEmployeeDependents(employeeId: string): Promise<EmployeeDependent[]> {
    return Array.from(this.employeeDependents.values()).filter(d => d.employeeId === employeeId);
  }

  async createEmployeeDependent(dependent: InsertEmployeeDependent): Promise<EmployeeDependent> {
    const newDependent: EmployeeDependent = {
      id: randomUUID(),
      ...dependent,
      createdAt: new Date(),
    };
    this.employeeDependents.set(newDependent.id, newDependent);
    return newDependent;
  }

  async updateEmployeeDependent(id: string, dependent: Partial<InsertEmployeeDependent>): Promise<EmployeeDependent | undefined> {
    const existing = this.employeeDependents.get(id);
    if (!existing) return undefined;
    
    const updated = { ...existing, ...dependent };
    this.employeeDependents.set(id, updated);
    return updated;
  }

  async deleteEmployeeDependent(id: string): Promise<boolean> {
    return this.employeeDependents.delete(id);
  }

  // Employee Documents methods
  async getEmployeeDocuments(employeeId: string): Promise<EmployeeDocument[]> {
    return Array.from(this.employeeDocuments.values()).filter(d => d.employeeId === employeeId);
  }

  async getEmployeeDocument(documentId: string): Promise<EmployeeDocument | undefined> {
    return this.employeeDocuments.get(documentId);
  }

  async createEmployeeDocument(document: any): Promise<EmployeeDocument> {
    const newDocument: EmployeeDocument = {
      id: randomUUID(),
      employeeId: document.employeeId,
      documentType: document.documentType,
      description: document.description,
      documentNumber: document.documentNumber || null,
      issuedDate: document.issuedDate || null,
      expiryDate: document.expiryDate || null,
      issuer: document.issuer || null,
      filename: document.filename || null,
      fileUrl: document.fileUrl || null,
      fileSize: document.fileSize || null,
      mimeType: document.mimeType || null,
      status: document.status || "active",
      isActive: document.isActive !== false,
      renewalNotified: document.renewalNotified || false,
      previousVersionId: document.previousVersionId || null,
      changeReason: document.changeReason || null,
      changedBy: document.changedBy || null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.employeeDocuments.set(newDocument.id, newDocument);
    return newDocument;
  }

  async updateEmployeeDocument(id: string, document: Partial<InsertEmployeeDocument>): Promise<EmployeeDocument | undefined> {
    const existing = this.employeeDocuments.get(id);
    if (!existing) return undefined;
    
    const updated: EmployeeDocument = {
      ...existing,
      ...document,
      updatedAt: new Date(),
    };
    this.employeeDocuments.set(id, updated);
    return updated;
  }

  async deleteEmployeeDocument(id: string): Promise<boolean> {
    return this.employeeDocuments.delete(id);
  }

  async getExpiringDocuments(days: number = 30): Promise<EmployeeDocument[]> {
    const now = new Date();
    const futureDate = new Date(now.getTime() + days * 24 * 60 * 60 * 1000);
    
    return Array.from(this.employeeDocuments.values()).filter(doc => {
      if (!doc.expiryDate) return false;
      const expiryDate = typeof doc.expiryDate === 'string' ? new Date(doc.expiryDate) : doc.expiryDate;
      return expiryDate <= futureDate && expiryDate >= now;
    });
  }

  // Employee Occurrences methods
  async getEmployeeOccurrences(employeeId: string): Promise<EmployeeOccurrence[]> {
    return Array.from(this.employeeOccurrences.values()).filter(o => o.employeeId === employeeId);
  }

  async getEmployeeOccurrence(occurrenceId: string): Promise<EmployeeOccurrence | undefined> {
    return this.employeeOccurrences.get(occurrenceId);
  }

  async getAllOccurrences(): Promise<EmployeeOccurrence[]> {
    return Array.from(this.employeeOccurrences.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createEmployeeOccurrence(occurrenceData: any): Promise<EmployeeOccurrence> {
    const occurrence: EmployeeOccurrence = {
      id: randomUUID(),
      employeeId: occurrenceData.employeeId,
      requestedById: occurrenceData.requestedById,
      occurrenceType: occurrenceData.occurrenceType,
      title: occurrenceData.title,
      description: occurrenceData.description,
      occurrenceDate: occurrenceData.occurrenceDate,
      suspensionDays: occurrenceData.suspensionDays || null,
      suspensionStart: occurrenceData.suspensionStart || null,
      suspensionEnd: occurrenceData.suspensionEnd || null,
      medicalDays: occurrenceData.medicalDays || null,
      medicalStart: occurrenceData.medicalStart || null,
      medicalEnd: occurrenceData.medicalEnd || null,
      medicalDocument: occurrenceData.medicalDocument || null,
      employeeSignature: false,
      employeeSignatureDate: null,
      managerSignature: false,
      managerSignatureDate: null,
      hrSignature: false,
      hrSignatureDate: null,
      documentGenerated: false,
      documentUrl: null,
      status: occurrenceData.status || "pending",
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.employeeOccurrences.set(occurrence.id, occurrence);
    return occurrence;
  }

  async updateEmployeeOccurrence(id: string, occurrence: Partial<InsertEmployeeOccurrence>): Promise<EmployeeOccurrence | undefined> {
    const existing = this.employeeOccurrences.get(id);
    if (!existing) return undefined;
    
    const updated: EmployeeOccurrence = {
      ...existing,
      ...occurrence,
      updatedAt: new Date(),
    };
    this.employeeOccurrences.set(id, updated);
    return updated;
  }

  async deleteEmployeeOccurrence(id: string): Promise<boolean> {
    return this.employeeOccurrences.delete(id);
  }

  // Employee Movements methods
  async getEmployeeMovements(employeeId: string): Promise<EmployeeMovement[]> {
    return Array.from(this.employeeMovements.values()).filter(m => m.employeeId === employeeId);
  }

  async createEmployeeMovement(movement: InsertEmployeeMovement): Promise<EmployeeMovement> {
    const newMovement: EmployeeMovement = {
      id: randomUUID(),
      ...movement,
      createdAt: new Date(),
    };
    this.employeeMovements.set(newMovement.id, newMovement);
    return newMovement;
  }

  // Employee Files methods
  async getEmployeeFiles(employeeId: string): Promise<EmployeeFile[]> {
    return Array.from(this.employeeFiles.values()).filter(f => f.employeeId === employeeId);
  }

  async createEmployeeFile(file: InsertEmployeeFile): Promise<EmployeeFile> {
    const newFile: EmployeeFile = {
      id: randomUUID(),
      ...file,
      createdAt: new Date(),
    };
    this.employeeFiles.set(newFile.id, newFile);
    return newFile;
  }

  async deleteEmployeeFile(id: string): Promise<boolean> {
    return this.employeeFiles.delete(id);
  }

  // Prancha Service methods
  async getPranchaServices(): Promise<PranchaService[]> {
    return Array.from(this.pranchaServices.values());
  }

  async getActiveServiceByDriver(driverId: string): Promise<PranchaService | undefined> {
    console.log(`Looking for active service for driver: ${driverId}`);
    const allServices = Array.from(this.pranchaServices.values());
    console.log(`Total services: ${allServices.length}`);
    
    allServices.forEach(service => {
      console.log(`Service ID: ${service.id}, driverId: ${service.driverId}, isActive: ${service.isActive}`);
    });
    
    const activeService = allServices.find(
      service => service.driverId === driverId && service.isActive === true
    );
    
    console.log(`Found active service:`, activeService ? 'YES' : 'NO');
    return activeService;
  }

  async updatePranchaService(id: string, updates: Partial<PranchaService>): Promise<PranchaService | undefined> {
    const service = this.pranchaServices.get(id);
    if (!service) return undefined;
    
    const updatedService = {
      ...service,
      ...updates,
      updatedAt: new Date()
    };
    
    this.pranchaServices.set(id, updatedService);
    return updatedService;
  }

  async getPranchaService(id: string): Promise<PranchaService | undefined> {
    return this.pranchaServices.get(id);
  }

  async createPranchaService(serviceData: InsertPranchaService): Promise<PranchaService> {
    const id = randomUUID();
    const service: PranchaService = {
      ...serviceData,
      id,
      serviceDays: serviceData.serviceDays || 0,
      status: "em_andamento",
      hrStatus: "nao_verificado",
      isActive: true, // Marca como ativo para o motorista
      finalizationNotes: null,
      finalizationAttachment: null,
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    console.log(`Creating service with ID: ${id}, driverId: ${service.driverId}, isActive: ${service.isActive}`);
    this.pranchaServices.set(id, service);
    console.log(`Total services in memory: ${this.pranchaServices.size}`);
    return service;
  }

  // Service Log methods
  async getServiceLogs(serviceId: string): Promise<ServiceLog[]> {
    return Array.from(this.serviceLogs.values()).filter(log => log.serviceId === serviceId);
  }

  async createServiceLog(logData: InsertServiceLog): Promise<ServiceLog> {
    const id = randomUUID();
    const log: ServiceLog = {
      ...logData,
      id,
      createdAt: new Date()
    };
    
    this.serviceLogs.set(id, log);
    return log;
  }

  // ============= MÉTODOS DE SINISTROS =============

  async getSinistros(): Promise<Sinistro[]> {
    return Array.from(this.sinistros.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getSinistro(id: string): Promise<Sinistro | undefined> {
    return this.sinistros.get(id);
  }

  async createSinistro(sinistroData: InsertSinistro): Promise<Sinistro> {
    const id = randomUUID();
    const sinistro: Sinistro = {
      ...sinistroData,
      id,
      status: "aberto",
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.sinistros.set(id, sinistro);
    
    // Criar histórico inicial
    await this.createSinistroHistory({
      sinistroId: id,
      tipoAlteracao: "criacao",
      usuarioId: sinistroData.registradoPor,
      nomeUsuario: sinistroData.nomeRegistrador,
      observacao: "Sinistro criado"
    });
    
    return sinistro;
  }

  async updateSinistro(id: string, updates: Partial<Sinistro>, updatedBy: string, updatedByName: string): Promise<Sinistro | undefined> {
    const sinistro = this.sinistros.get(id);
    if (!sinistro) return undefined;

    const oldSinistro = { ...sinistro };
    const updatedSinistro = {
      ...sinistro,
      ...updates,
      updatedAt: new Date()
    };

    this.sinistros.set(id, updatedSinistro);

    // Criar histórico para campos alterados
    for (const [campo, novoValor] of Object.entries(updates)) {
      if (campo !== 'updatedAt' && oldSinistro[campo as keyof Sinistro] !== novoValor) {
        await this.createSinistroHistory({
          sinistroId: id,
          tipoAlteracao: "edicao",
          campoAlterado: campo,
          valorAnterior: String(oldSinistro[campo as keyof Sinistro] || ''),
          valorNovo: String(novoValor || ''),
          usuarioId: updatedBy,
          nomeUsuario: updatedByName,
          observacao: `Campo ${campo} alterado`
        });
      }
    }

    return updatedSinistro;
  }

  async finalizarSinistro(id: string, finalizadoPor: string, nomeFinalizador: string): Promise<Sinistro | undefined> {
    const sinistro = this.sinistros.get(id);
    if (!sinistro) return undefined;

    const updatedSinistro = {
      ...sinistro,
      status: "finalizado",
      finalizadoPor,
      nomeFinalizador,
      dataFinalizacao: new Date(),
      updatedAt: new Date()
    };

    this.sinistros.set(id, updatedSinistro);

    // Criar histórico de finalização
    await this.createSinistroHistory({
      sinistroId: id,
      tipoAlteracao: "mudanca_status",
      campoAlterado: "status",
      valorAnterior: sinistro.status,
      valorNovo: "finalizado",
      usuarioId: finalizadoPor,
      nomeUsuario: nomeFinalizador,
      observacao: "Sinistro finalizado pelo QSMS"
    });

    return updatedSinistro;
  }

  // ============= MÉTODOS DE DOCUMENTOS DE SINISTROS =============

  async getSinistroDocuments(sinistroId: string): Promise<SinistroDocument[]> {
    return Array.from(this.sinistroDocuments.values())
      .filter(doc => doc.sinistroId === sinistroId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSinistroDocument(documentData: InsertSinistroDocument): Promise<SinistroDocument> {
    const id = randomUUID();
    const document: SinistroDocument = {
      ...documentData,
      id,
      createdAt: new Date()
    };
    
    this.sinistroDocuments.set(id, document);

    // Criar histórico de upload
    await this.createSinistroHistory({
      sinistroId: documentData.sinistroId,
      tipoAlteracao: "upload_documento",
      campoAlterado: "documento",
      valorNovo: documentData.nomeArquivo,
      usuarioId: documentData.uploadedBy,
      nomeUsuario: documentData.nomeUploader,
      observacao: `Upload de documento: ${documentData.tipoDocumento}`
    });

    return document;
  }

  async deleteSinistroDocument(id: string, deletedBy: string, deletedByName: string): Promise<boolean> {
    const document = this.sinistroDocuments.get(id);
    if (!document) return false;

    this.sinistroDocuments.delete(id);

    // Criar histórico de remoção
    await this.createSinistroHistory({
      sinistroId: document.sinistroId,
      tipoAlteracao: "remocao_documento",
      campoAlterado: "documento",
      valorAnterior: document.nomeArquivo,
      usuarioId: deletedBy,
      nomeUsuario: deletedByName,
      observacao: `Remoção de documento: ${document.tipoDocumento}`
    });

    return true;
  }

  // ============= MÉTODOS DE HISTÓRICO DE SINISTROS =============

  async getSinistroHistory(sinistroId: string): Promise<SinistroHistory[]> {
    return Array.from(this.sinistroHistory.values())
      .filter(hist => hist.sinistroId === sinistroId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createSinistroHistory(historyData: InsertSinistroHistory): Promise<SinistroHistory> {
    const id = randomUUID();
    const history: SinistroHistory = {
      ...historyData,
      id,
      createdAt: new Date()
    };
    
    this.sinistroHistory.set(id, history);
    return history;
  }

  // ============= MÉTODOS DE CHECKLISTS DE VEÍCULOS =============

  async getVehicleChecklists(filters?: {
    vehiclePlate?: string;
    driverName?: string;
    startDate?: string;
    endDate?: string;
    status?: string;
    verificationStatus?: string;
    baseOrigin?: string;
  }): Promise<VehicleChecklist[]> {
    let checklists = Array.from(this.vehicleChecklists.values());

    // Aplicar filtros se fornecidos
    if (filters) {
      if (filters.vehiclePlate) {
        checklists = checklists.filter(c => 
          c.vehiclePlate.toLowerCase().includes(filters.vehiclePlate!.toLowerCase()) ||
          (c.implementPlate && c.implementPlate.toLowerCase().includes(filters.vehiclePlate!.toLowerCase()))
        );
      }
      if (filters.driverName) {
        checklists = checklists.filter(c => 
          c.driverName.toLowerCase().includes(filters.driverName!.toLowerCase())
        );
      }
      if (filters.status) {
        checklists = checklists.filter(c => c.status === filters.status);
      }
      if (filters.verificationStatus) {
        checklists = checklists.filter(c => c.verificationStatus === filters.verificationStatus);
      }
      if (filters.baseOrigin) {
        checklists = checklists.filter(c => c.baseOrigin === filters.baseOrigin);
      }
      if (filters.startDate) {
        checklists = checklists.filter(c => c.exitDate >= filters.startDate!);
      }
      if (filters.endDate) {
        checklists = checklists.filter(c => c.exitDate <= filters.endDate!);
      }
    }

    // Ordenar por data de criação mais recente
    return checklists.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getVehicleChecklist(id: string): Promise<VehicleChecklist | undefined> {
    return this.vehicleChecklists.get(id);
  }

  async createVehicleChecklist(checklistData: InsertVehicleChecklist): Promise<VehicleChecklist> {
    const id = randomUUID();
    const checklist: VehicleChecklist = {
      ...checklistData,
      id,
      status: "saida_registrada",
      verificationStatus: "nao_verificado",
      accessDepartments: ["frota", "manutencao", "seguranca", "portaria"],
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    this.vehicleChecklists.set(id, checklist);

    // Criar histórico de criação
    await this.createChecklistHistory({
      checklistId: id,
      action: "criacao",
      performedBy: checklistData.driverId,
      performedByName: checklistData.driverName,
      details: `Checklist de saída criado para veículo ${checklistData.vehiclePlate}`
    });

    return checklist;
  }

  async updateVehicleChecklist(id: string, updates: Partial<VehicleChecklist>): Promise<VehicleChecklist | undefined> {
    const checklist = this.vehicleChecklists.get(id);
    if (!checklist) return undefined;

    const updated = {
      ...checklist,
      ...updates,
      updatedAt: new Date()
    };

    this.vehicleChecklists.set(id, updated);
    return updated;
  }

  async verifyChecklist(id: string, verifiedBy: string, verifiedByName: string, notes?: string): Promise<VehicleChecklist | undefined> {
    const checklist = this.vehicleChecklists.get(id);
    if (!checklist) return undefined;

    const updated = {
      ...checklist,
      verificationStatus: "verificado" as const,
      verifiedBy,
      verifiedByName,
      verificationDate: new Date(),
      verificationNotes: notes,
      updatedAt: new Date()
    };

    this.vehicleChecklists.set(id, updated);

    // Criar histórico de verificação
    await this.createChecklistHistory({
      checklistId: id,
      action: "verificacao",
      performedBy: verifiedBy,
      performedByName: verifiedByName,
      details: `Checklist verificado${notes ? `: ${notes}` : ""}`
    });

    return updated;
  }

  // ============= MÉTODOS DE ITENS DE CHECKLIST =============

  async getChecklistItems(category?: string): Promise<ChecklistItem[]> {
    let items = Array.from(this.checklistItems.values()).filter(item => item.active);
    
    if (category) {
      items = items.filter(item => item.category === category);
    }
    
    return items.sort((a, b) => a.order - b.order);
  }

  async createChecklistItem(itemData: InsertChecklistItem): Promise<ChecklistItem> {
    const id = randomUUID();
    const item: ChecklistItem = {
      ...itemData,
      id,
      createdAt: new Date()
    };
    
    this.checklistItems.set(id, item);
    return item;
  }

  async updateChecklistItem(id: string, itemData: Partial<ChecklistItem>): Promise<ChecklistItem | undefined> {
    const item = this.checklistItems.get(id);
    if (!item) return undefined;

    const updated = { ...item, ...itemData };
    this.checklistItems.set(id, updated);
    return updated;
  }

  async deleteChecklistItem(id: string): Promise<boolean> {
    return this.checklistItems.delete(id);
  }

  // ============= MÉTODOS DE HISTÓRICO DE CHECKLISTS =============

  async getChecklistHistory(checklistId: string): Promise<ChecklistHistory[]> {
    return Array.from(this.checklistHistory.values())
      .filter(hist => hist.checklistId === checklistId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async createChecklistHistory(historyData: InsertChecklistHistory): Promise<ChecklistHistory> {
    const id = randomUUID();
    const history: ChecklistHistory = {
      ...historyData,
      id,
      createdAt: new Date()
    };
    
    this.checklistHistory.set(id, history);
    return history;
  }

  // ============= INICIALIZAÇÃO DE DADOS DE TESTE - CHECKLISTS =============

  private initializeChecklistTestData() {
    // Itens de checklist padrão
    const checklistItems = [
      {
        id: randomUUID(),
        description: "Verificação de freios",
        category: "seguranca",
        order: 1,
        active: true,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        description: "Verificação de pneus",
        category: "seguranca", 
        order: 2,
        active: true,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        description: "Verificação de luzes",
        category: "seguranca",
        order: 3,
        active: true,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        description: "Nível de óleo do motor",
        category: "manutencao",
        order: 4,
        active: true,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        description: "Nível de combustível",
        category: "manutencao",
        order: 5,
        active: true,
        createdAt: new Date()
      },
      {
        id: randomUUID(),
        description: "Documentação do veículo",
        category: "documentos",
        order: 6,
        active: true,
        createdAt: new Date()
      }
    ];

    checklistItems.forEach(item => this.checklistItems.set(item.id, item));

    // Checklists de exemplo
    const sampleChecklists = [
      {
        id: randomUUID(),
        driverId: "driver123",
        driverName: "João Silva",
        vehicleId: "vehicle1",
        vehicleName: "Scania R450",
        vehiclePlate: "ABC-1234",
        implementId: null,
        implementName: null,
        implementPlate: null,
        baseOrigin: "Base São Paulo",
        baseDestination: "Base Rio de Janeiro",
        exitDate: "2025-01-27",
        exitTime: "08:30",
        exitKm: 45230,
        exitGatekeeper: "Carlos Porteiro",
        exitChecklist: {
          "Verificação de freios": true,
          "Verificação de pneus": true,
          "Verificação de luzes": true,
          "Nível de óleo do motor": true,
          "Nível de combustível": true,
          "Documentação do veículo": true
        },
        exitObservations: "Veículo em perfeito estado para viagem",
        returnDate: "2025-01-28",
        returnTime: "16:45",
        returnKm: 45890,
        returnGatekeeper: "Maria Porteiro",
        returnChecklist: {
          "Verificação de freios": true,
          "Verificação de pneus": false,
          "Verificação de luzes": true,
          "Nível de óleo do motor": true,
          "Nível de combustível": false,
          "Documentação do veículo": true
        },
        returnObservations: "Pneu traseiro direito com desgaste, combustível baixo",
        status: "retorno_registrado" as const,
        verificationStatus: "nao_verificado" as const,
        accessDepartments: ["frota", "manutencao", "seguranca", "portaria"],
        createdAt: new Date("2025-01-27T08:30:00"),
        updatedAt: new Date("2025-01-28T16:45:00")
      },
      {
        id: randomUUID(),
        driverId: "driver456",
        driverName: "Maria Santos",
        vehicleId: "vehicle2",
        vehicleName: "Mercedes Actros",
        vehiclePlate: "DEF-5678",
        implementId: "impl1",
        implementName: "Sider 30t",
        implementPlate: "GHI-9012",
        baseOrigin: "Base Campinas",
        baseDestination: "Base Belo Horizonte",
        exitDate: "2025-01-28",
        exitTime: "14:20",
        exitKm: 32450,
        exitGatekeeper: "Pedro Porteiro",
        exitChecklist: {
          "Verificação de freios": true,
          "Verificação de pneus": true,
          "Verificação de luzes": true,
          "Nível de óleo do motor": true,
          "Nível de combustível": true,
          "Documentação do veículo": true
        },
        exitObservations: null,
        returnDate: null,
        returnTime: null,
        returnKm: null,
        returnGatekeeper: null,
        returnChecklist: null,
        returnObservations: null,
        status: "viagem_em_andamento" as const,
        verificationStatus: "verificado" as const,
        verifiedBy: "admin123",
        verifiedByName: "Supervisor Frota",
        verificationDate: new Date("2025-01-28T14:30:00"),
        verificationNotes: "Checklist aprovado, viagem autorizada",
        accessDepartments: ["frota", "manutencao", "seguranca", "portaria"],
        createdAt: new Date("2025-01-28T14:20:00"),
        updatedAt: new Date("2025-01-28T14:30:00")
      },
      {
        id: randomUUID(),
        driverId: "driver789",
        driverName: "José Oliveira",
        vehicleId: "vehicle3",
        vehicleName: "Volvo FH",
        vehiclePlate: "JKL-3456",
        implementId: null,
        implementName: null,
        implementPlate: null,
        baseOrigin: "Base Guarulhos",
        baseDestination: null,
        exitDate: "2025-01-28",
        exitTime: "09:15",
        exitKm: 78920,
        exitGatekeeper: "Ana Porteiro",
        exitChecklist: {
          "Verificação de freios": true,
          "Verificação de pneus": true,
          "Verificação de luzes": false,
          "Nível de óleo do motor": true,
          "Nível de combustível": true,
          "Documentação do veículo": true
        },
        exitObservations: "Farol direito com problema, será reparado no destino",
        returnDate: null,
        returnTime: null,
        returnKm: null,
        returnGatekeeper: null,
        returnChecklist: null,
        returnObservations: null,
        status: "saida_registrada" as const,
        verificationStatus: "nao_verificado" as const,
        accessDepartments: ["frota", "manutencao", "seguranca", "portaria"],
        createdAt: new Date("2025-01-28T09:15:00"),
        updatedAt: new Date("2025-01-28T09:15:00")
      }
    ];

    sampleChecklists.forEach(checklist => this.vehicleChecklists.set(checklist.id, checklist));

    // Histórico de exemplo para os checklists
    sampleChecklists.forEach(checklist => {
      // Histórico de criação
      const creationHistory = {
        id: randomUUID(),
        checklistId: checklist.id,
        action: "criacao" as const,
        performedBy: checklist.driverId,
        performedByName: checklist.driverName,
        details: `Checklist de saída criado para veículo ${checklist.vehiclePlate}`,
        createdAt: checklist.createdAt
      };
      this.checklistHistory.set(creationHistory.id, creationHistory);

      // Histórico de verificação (se verificado)
      if (checklist.verificationStatus === "verificado" && checklist.verifiedBy) {
        const verificationHistory = {
          id: randomUUID(),
          checklistId: checklist.id,
          action: "verificacao" as const,
          performedBy: checklist.verifiedBy,
          performedByName: checklist.verifiedByName!,
          details: `Checklist verificado${checklist.verificationNotes ? `: ${checklist.verificationNotes}` : ""}`,
          createdAt: checklist.verificationDate!
        };
        this.checklistHistory.set(verificationHistory.id, verificationHistory);
      }

      // Histórico de retorno (se houver)
      if (checklist.returnDate) {
        const returnHistory = {
          id: randomUUID(),
          checklistId: checklist.id,
          action: "retorno" as const,
          performedBy: checklist.driverId,
          performedByName: checklist.driverName,
          details: `Checklist de retorno registrado para veículo ${checklist.vehiclePlate}`,
          createdAt: new Date(checklist.returnDate + "T" + (checklist.returnTime || "16:00"))
        };
        this.checklistHistory.set(returnHistory.id, returnHistory);
      }
    });
  }

  // ============= MÉTODOS DO MÓDULO DE CONTROLE DE ACESSO =============
  
  // Métodos para Visitantes
  async getVisitors(): Promise<Visitor[]> {
    return Array.from(this.visitors.values());
  }

  async getVisitor(id: string): Promise<Visitor | undefined> {
    return this.visitors.get(id);
  }

  async getVisitorByCpf(cpf: string): Promise<Visitor | undefined> {
    return Array.from(this.visitors.values()).find(visitor => visitor.cpf === cpf);
  }

  async createVisitor(visitor: InsertVisitor): Promise<Visitor> {
    const id = randomUUID();
    const newVisitor: Visitor = {
      id,
      ...visitor,
      totalVisits: 0,
      lastVisit: null,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.visitors.set(id, newVisitor);
    return newVisitor;
  }

  async updateVisitor(id: string, visitor: Partial<InsertVisitor>): Promise<Visitor | undefined> {
    const existing = this.visitors.get(id);
    if (!existing) return undefined;
    
    const updated: Visitor = {
      ...existing,
      ...visitor,
      updatedAt: new Date(),
    };
    this.visitors.set(id, updated);
    return updated;
  }

  async deleteVisitor(id: string): Promise<boolean> {
    return this.visitors.delete(id);
  }

  // Métodos para Encoding Facial
  async getFacialEncodings(personType?: string, personId?: string): Promise<FacialEncoding[]> {
    const encodings = Array.from(this.facialEncodings.values());
    let filtered = encodings;
    
    if (personType) {
      filtered = filtered.filter(encoding => encoding.personType === personType);
    }
    
    if (personId) {
      filtered = filtered.filter(encoding => encoding.personId === personId);
    }
    
    return filtered.filter(encoding => encoding.isActive);
  }

  async getFacialEncoding(id: string): Promise<FacialEncoding | undefined> {
    return this.facialEncodings.get(id);
  }

  async createFacialEncoding(encoding: InsertFacialEncoding): Promise<FacialEncoding> {
    const id = randomUUID();
    const newEncoding: FacialEncoding = {
      id,
      ...encoding,
      isActive: true,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.facialEncodings.set(id, newEncoding);
    return newEncoding;
  }

  async updateFacialEncoding(id: string, encoding: Partial<InsertFacialEncoding>): Promise<FacialEncoding | undefined> {
    const existing = this.facialEncodings.get(id);
    if (!existing) return undefined;
    
    const updated: FacialEncoding = {
      ...existing,
      ...encoding,
      updatedAt: new Date(),
    };
    this.facialEncodings.set(id, updated);
    return updated;
  }

  async deleteFacialEncoding(id: string): Promise<boolean> {
    return this.facialEncodings.delete(id);
  }

  // Métodos para Logs de Acesso
  async getAccessLogs(filters?: {
    personType?: string;
    personId?: string;
    direction?: string;
    accessMethod?: string;
    startDate?: string;
    endDate?: string;
    location?: string;
  }): Promise<AccessLog[]> {
    let logs = Array.from(this.accessLogs.values());
    
    if (filters) {
      if (filters.personType) {
        logs = logs.filter(log => log.personType === filters.personType);
      }
      if (filters.personId) {
        logs = logs.filter(log => log.personId === filters.personId);
      }
      if (filters.direction) {
        logs = logs.filter(log => log.direction === filters.direction);
      }
      if (filters.accessMethod) {
        logs = logs.filter(log => log.accessMethod === filters.accessMethod);
      }
      if (filters.location) {
        logs = logs.filter(log => log.location === filters.location);
      }
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        logs = logs.filter(log => new Date(log.timestamp) >= startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        logs = logs.filter(log => new Date(log.timestamp) <= endDate);
      }
    }
    
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async getAccessLog(id: string): Promise<AccessLog | undefined> {
    return this.accessLogs.get(id);
  }

  async createAccessLog(log: InsertAccessLog): Promise<AccessLog> {
    const id = randomUUID();
    const newLog: AccessLog = {
      id,
      ...log,
      timestamp: new Date(),
    };
    this.accessLogs.set(id, newLog);
    return newLog;
  }

  // Métodos para Crachás Temporários
  async getTemporaryBadges(status?: string): Promise<TemporaryBadge[]> {
    const badges = Array.from(this.temporaryBadges.values());
    if (status) {
      return badges.filter(badge => badge.status === status);
    }
    return badges;
  }

  async getTemporaryBadge(id: string): Promise<TemporaryBadge | undefined> {
    return this.temporaryBadges.get(id);
  }

  async getTemporaryBadgeByNumber(badgeNumber: string): Promise<TemporaryBadge | undefined> {
    return Array.from(this.temporaryBadges.values()).find(badge => badge.badgeNumber === badgeNumber);
  }

  async createTemporaryBadge(badge: InsertTemporaryBadge): Promise<TemporaryBadge> {
    const id = randomUUID();
    const newBadge: TemporaryBadge = {
      id,
      ...badge,
      status: "active",
      issueTime: new Date(),
      actualReturn: null,
    };
    this.temporaryBadges.set(id, newBadge);
    return newBadge;
  }

  async updateTemporaryBadge(id: string, badge: Partial<InsertTemporaryBadge>): Promise<TemporaryBadge | undefined> {
    const existing = this.temporaryBadges.get(id);
    if (!existing) return undefined;
    
    const updated: TemporaryBadge = {
      ...existing,
      ...badge,
    };
    this.temporaryBadges.set(id, updated);
    return updated;
  }

  async returnTemporaryBadge(id: string, returnedBy: string): Promise<TemporaryBadge | undefined> {
    const existing = this.temporaryBadges.get(id);
    if (!existing) return undefined;
    
    const updated: TemporaryBadge = {
      ...existing,
      status: "returned",
      actualReturn: new Date(),
      returnedBy,
    };
    this.temporaryBadges.set(id, updated);
    return updated;
  }

  // Métodos para Tentativas de Reconhecimento
  async getRecognitionAttempts(filters?: {
    attemptType?: string;
    success?: boolean;
    personType?: string;
    startDate?: string;
    endDate?: string;
  }): Promise<RecognitionAttempt[]> {
    let attempts = Array.from(this.recognitionAttempts.values());
    
    if (filters) {
      if (filters.attemptType) {
        attempts = attempts.filter(attempt => attempt.attemptType === filters.attemptType);
      }
      if (filters.success !== undefined) {
        attempts = attempts.filter(attempt => attempt.success === filters.success);
      }
      if (filters.personType) {
        attempts = attempts.filter(attempt => attempt.personType === filters.personType);
      }
      if (filters.startDate) {
        const startDate = new Date(filters.startDate);
        attempts = attempts.filter(attempt => new Date(attempt.timestamp) >= startDate);
      }
      if (filters.endDate) {
        const endDate = new Date(filters.endDate);
        attempts = attempts.filter(attempt => new Date(attempt.timestamp) <= endDate);
      }
    }
    
    return attempts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
  }

  async createRecognitionAttempt(attempt: InsertRecognitionAttempt): Promise<RecognitionAttempt> {
    const id = randomUUID();
    const newAttempt: RecognitionAttempt = {
      id,
      ...attempt,
      timestamp: new Date(),
    };
    this.recognitionAttempts.set(id, newAttempt);
    return newAttempt;
  }

  // Métodos para Configurações do Sistema
  async getGateSystemConfig(): Promise<GateSystemConfig[]> {
    return Array.from(this.gateSystemConfig.values());
  }

  async getGateSystemConfigByKey(key: string): Promise<GateSystemConfig | undefined> {
    return Array.from(this.gateSystemConfig.values()).find(config => config.key === key);
  }

  async setGateSystemConfig(config: InsertGateSystemConfig): Promise<GateSystemConfig> {
    const id = randomUUID();
    const newConfig: GateSystemConfig = {
      id,
      ...config,
      updatedAt: new Date(),
    };
    this.gateSystemConfig.set(id, newConfig);
    return newConfig;
  }

  async updateGateSystemConfig(key: string, value: string, updatedBy: string): Promise<GateSystemConfig | undefined> {
    const existing = Array.from(this.gateSystemConfig.values()).find(config => config.key === key);
    if (!existing) return undefined;
    
    const updated: GateSystemConfig = {
      ...existing,
      value,
      updatedBy,
      updatedAt: new Date(),
    };
    this.gateSystemConfig.set(existing.id, updated);
    return updated;
  }
}

export const storage = new MemStorage();
