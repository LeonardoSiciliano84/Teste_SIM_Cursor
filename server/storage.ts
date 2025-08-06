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
  type EmployeeQrCode,
  type InsertEmployeeQrCode,
  type AccessLog,
  type InsertAccessLog,
  // Tipos do módulo de manutenção
  type MaintenanceRequest,
  type InsertMaintenanceRequest,
  type MaintenanceCost,
  type InsertMaintenanceCost,
  // Tipos do módulo de almoxarifado
  type CentralWarehouseMaterial,
  type InsertCentralWarehouseMaterial,
  type CentralWarehouseEntry,
  type InsertCentralWarehouseEntry,
  type CentralWarehouseExit,
  type InsertCentralWarehouseExit,
  type CentralWarehouseExitItem,
  type WarehouseClient,
  type InsertWarehouseClient,
  type ClientWarehouseMaterial,
  type InsertClientWarehouseMaterial,
  type ClientWarehouseEntry,
  type InsertClientWarehouseEntry,
  type ClientWarehouseExit,
  type InsertClientWarehouseExit,
  type Tire,
  type InsertTire,
  type TireMovement,
  type InsertTireMovement,
  // Tipos de terceiros
  type ExternalPerson,
  type InsertExternalPerson,
} from "@shared/schema";
import { randomUUID } from "crypto";
import { db } from "./db";
import { eq } from "drizzle-orm";
import { vehicles, employees } from "@shared/schema";

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
  
  // ============= MÓDULO DE CONTROLE DE ACESSO - CPF E QR CODE =============
  
  // Visitor methods
  getVisitors(): Promise<Visitor[]>;
  getVisitor(id: string): Promise<Visitor | undefined>;
  getVisitorByCpf(cpf: string): Promise<Visitor | undefined>;
  incrementVisitorVisits(id: string): Promise<Visitor>;
  upsertVisitor(visitor: InsertVisitor): Promise<Visitor>;
  updateVisitor(id: string, updates: Partial<Visitor>): Promise<Visitor>;
  
  // Employee QR Code methods
  createEmployeeQrCode(qrCode: InsertEmployeeQrCode): Promise<EmployeeQrCode>;
  getEmployeeByQrCode(qrCodeData: string): Promise<EmployeeQrCode | undefined>;
  
  // Access Log methods
  getAccessLogs(): Promise<AccessLog[]>;
  createAccessLog(log: InsertAccessLog): Promise<AccessLog>;
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

  // ============= MAINTENANCE MODULE =============
  // Maintenance Request methods
  getMaintenanceRequests(): Promise<MaintenanceRequest[]>;
  getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined>;
  createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest>;
  updateMaintenanceRequest(id: string, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined>;
  deleteMaintenanceRequest(id: string): Promise<boolean>;
  getVehicleMaintenanceHistory(vehicleId: string): Promise<MaintenanceRequest[]>;
  getVehiclesInMaintenance(): Promise<MaintenanceRequest[]>;

  // Maintenance Cost methods
  getMaintenanceCosts(): Promise<MaintenanceCost[]>;
  createMaintenanceCost(cost: InsertMaintenanceCost): Promise<MaintenanceCost>;
  getVehicleMaintenanceCosts(vehicleId: string): Promise<MaintenanceCost[]>;

  // ============= WAREHOUSE MODULE =============
  // Central Warehouse Material methods
  getCentralWarehouseMaterials(): Promise<CentralWarehouseMaterial[]>;
  getCentralWarehouseMaterial(id: string): Promise<CentralWarehouseMaterial | undefined>;
  createCentralWarehouseMaterial(material: InsertCentralWarehouseMaterial): Promise<CentralWarehouseMaterial>;
  updateCentralWarehouseMaterial(id: string, material: Partial<InsertCentralWarehouseMaterial>): Promise<CentralWarehouseMaterial | undefined>;
  deleteCentralWarehouseMaterial(id: string): Promise<boolean>;
  getCentralMaterialsLowStock(): Promise<CentralWarehouseMaterial[]>;

  // Central Warehouse Entry methods
  getCentralWarehouseEntries(materialId?: string): Promise<CentralWarehouseEntry[]>;
  createCentralWarehouseEntry(entry: InsertCentralWarehouseEntry): Promise<CentralWarehouseEntry>;
  updateCentralWarehouseEntry(id: string, entry: Partial<InsertCentralWarehouseEntry>, editReason: string, editedBy: string): Promise<CentralWarehouseEntry | undefined>;

  // Central Warehouse Exit methods
  getCentralWarehouseExits(): Promise<CentralWarehouseExit[]>;
  getCentralWarehouseExit(id: string): Promise<CentralWarehouseExit | undefined>;
  createCentralWarehouseExit(exit: InsertCentralWarehouseExit, items: { materialId: string; quantity: string }[]): Promise<CentralWarehouseExit>;
  updateCentralWarehouseExit(id: string, exit: Partial<InsertCentralWarehouseExit>, editReason: string, editedBy: string): Promise<CentralWarehouseExit | undefined>;
  getActiveServiceLoans(): Promise<CentralWarehouseExit[]>;
  markLoanAsReturned(authenticationCode: string): Promise<boolean>;

  // Warehouse Client methods
  getWarehouseClients(): Promise<WarehouseClient[]>;
  createWarehouseClient(client: InsertWarehouseClient): Promise<WarehouseClient>;

  // Client Warehouse Material methods
  getClientWarehouseMaterials(clientId?: string, warehouse?: string): Promise<ClientWarehouseMaterial[]>;
  getClientWarehouseMaterial(id: string): Promise<ClientWarehouseMaterial | undefined>;
  createClientWarehouseMaterial(material: InsertClientWarehouseMaterial): Promise<ClientWarehouseMaterial>;
  updateClientWarehouseMaterial(id: string, material: Partial<InsertClientWarehouseMaterial>): Promise<ClientWarehouseMaterial | undefined>;

  // Client Warehouse Entry methods
  getClientWarehouseEntries(materialId?: string, status?: string): Promise<ClientWarehouseEntry[]>;
  createClientWarehouseEntry(entry: InsertClientWarehouseEntry): Promise<ClientWarehouseEntry>;
  updateClientWarehouseEntry(id: string, entry: Partial<InsertClientWarehouseEntry>, editReason: string, editedBy: string): Promise<ClientWarehouseEntry | undefined>;
  
  // Client Warehouse Exit methods
  getClientWarehouseExits(materialId?: string): Promise<ClientWarehouseExit[]>;
  createClientWarehouseExit(exit: InsertClientWarehouseExit): Promise<ClientWarehouseExit>;
  updateClientWarehouseExit(id: string, exit: Partial<InsertClientWarehouseExit>, editReason: string, editedBy: string): Promise<ClientWarehouseExit | undefined>;
  deleteClientWarehouseExit(id: string, deleteReason: string, deletedBy: string): Promise<boolean>;

  // Tire Management methods
  getTires(): Promise<Tire[]>;
  getTire(id: string): Promise<Tire | undefined>;
  getTireByFireNumber(fireNumber: string): Promise<Tire | undefined>;
  createTire(tire: InsertTire): Promise<Tire>;
  updateTire(id: string, tire: Partial<InsertTire>): Promise<Tire | undefined>;
  getTiresByStatus(status: string): Promise<Tire[]>;

  // Tire Movement methods
  getTireMovements(tireId?: string): Promise<TireMovement[]>;
  createTireMovement(movement: InsertTireMovement): Promise<TireMovement>;

  // External Person methods (Terceiros)
  getExternalPersons(): Promise<ExternalPerson[]>;
  getExternalPerson(id: string): Promise<ExternalPerson | undefined>;
  getExternalPersonByEmail(email: string): Promise<ExternalPerson | undefined>;
  createExternalPerson(person: InsertExternalPerson): Promise<ExternalPerson>;
  updateExternalPerson(id: string, person: Partial<InsertExternalPerson>): Promise<ExternalPerson | undefined>;
  updateExternalPersonStatus(id: string, status: string, reason?: string): Promise<ExternalPerson | undefined>;
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
  // Módulo de controle de acesso - CPF e QR Code
  private visitors: Map<string, Visitor>;
  private employeeQrCodes: Map<string, EmployeeQrCode>;
  private accessLogs: Map<string, AccessLog>;
  // Módulo de manutenção
  private maintenanceRequests: Map<string, MaintenanceRequest>;
  private maintenanceCosts: Map<string, MaintenanceCost>;
  private tires: Map<string, Tire>;
  private tireMovements: Map<string, TireMovement>;
  // Módulo de almoxarifado
  private centralWarehouseMaterials: Map<string, CentralWarehouseMaterial>;
  private centralWarehouseEntries: Map<string, CentralWarehouseEntry>;
  private centralWarehouseExits: Map<string, CentralWarehouseExit>;
  private centralWarehouseExitItems: Map<string, CentralWarehouseExitItem>;
  private warehouseClients: Map<string, WarehouseClient>;
  private clientWarehouseMaterials: Map<string, ClientWarehouseMaterial>;
  private clientWarehouseEntries: Map<string, ClientWarehouseEntry>;
  private clientWarehouseExits: Map<string, ClientWarehouseExit>;
  // Módulo de terceiros
  private externalPersons: Map<string, ExternalPerson>;

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
    // Módulo de controle de acesso - CPF e QR Code
    this.visitors = new Map();
    this.employeeQrCodes = new Map();
    this.accessLogs = new Map();
    // Módulo de manutenção
    this.maintenanceRequests = new Map();
    this.maintenanceCosts = new Map();
    this.tires = new Map();
    this.tireMovements = new Map();
    // Módulo de almoxarifado
    this.centralWarehouseMaterials = new Map();
    this.centralWarehouseEntries = new Map();
    this.centralWarehouseExits = new Map();
    this.centralWarehouseExitItems = new Map();
    this.warehouseClients = new Map();
    this.clientWarehouseMaterials = new Map();
    this.clientWarehouseEntries = new Map();
    this.clientWarehouseExits = new Map();
    // Módulo de terceiros
    this.externalPersons = new Map();
    
    // Initialize with default admin user and sample data
    this.initializeDefaultData();
    this.initializeChecklistTestData();
    this.initializeMaintenanceTestData();
    this.initCargoSchedulingData();
  }

  private initializeDefaultData() {
    const adminUser: User = {
      id: "7c11006f-3064-4941-9092-97fe5fc89619", // ID fixo para manter consistência
      email: "admin@felka.com",
      password: "admin123", // In production, this should be hashed
      name: "Administrador",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUser.id, adminUser);

    // Criar usuário admin adicional com formato simples para facilitar acesso
    const adminUserSimple: User = {
      id: randomUUID(),
      email: "admin@felka",
      password: "admin123",
      name: "Administrador FELKA",
      role: "admin",
      createdAt: new Date(),
    };
    this.users.set(adminUserSimple.id, adminUserSimple);

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

    // Dados iniciais de colaboradores (dados de teste atualizados)
    const employees = [
      {
        id: randomUUID(),
        fullName: "João Silva Santos",
        cpf: "12345678901",
        phone: "(11) 99999-1111",
        employeeNumber: "001",
        position: "Motorista Sênior",
        department: "Operações", 
        email: "joao.silva@felka.com.br",
        status: "active" as const,
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
        status: "active" as const,
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
        status: "active" as const,
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
        status: "active" as const,
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
        status: "active" as const,
        accessLevel: "employee",
        profilePhoto: "",
        admissionDate: "2022-02-28",
        manager: "Carlos Pereira",
        workLocation: "Portaria Principal",
        allowedModules: ["access-control", "visitors"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Ana Paula Rodrigues",
        cpf: "11122233344",
        phone: "(11) 99999-6666",
        employeeNumber: "006",
        position: "Analista de RH",
        department: "Recursos Humanos",
        email: "ana.rodrigues@felka.com.br",
        status: "active" as const,
        accessLevel: "employee",
        profilePhoto: "",
        admissionDate: "2021-05-10",
        manager: "Roberto Lima",
        workLocation: "Matriz São Paulo",
        allowedModules: ["employees", "reports", "occurrences"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Pedro Santos Oliveira",
        cpf: "22233344455",
        phone: "(11) 99999-7777",
        employeeNumber: "007",
        position: "Técnico em Manutenção",
        department: "Manutenção",
        email: "pedro.santos@felka.com.br",
        status: "active" as const,
        accessLevel: "employee",
        profilePhoto: "",
        admissionDate: "2020-09-15",
        manager: "Maria Oliveira",
        workLocation: "Oficina Central",
        allowedModules: ["vehicles", "maintenance", "checklists"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Carla Fernandes Lima",
        cpf: "33344455566",
        phone: "(11) 99999-8888",
        employeeNumber: "008",
        position: "Assistente Administrativo",
        department: "Administrativo",
        email: "carla.fernandes@felka.com.br",
        status: "active" as const,
        accessLevel: "employee",
        profilePhoto: "",
        admissionDate: "2023-01-20",
        manager: "Ana Paula Rodrigues",
        workLocation: "Matriz São Paulo",
        allowedModules: ["bookings", "reports", "documents"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Ricardo Souza Costa",
        cpf: "44455566677",
        phone: "(11) 99999-9999",
        employeeNumber: "009",
        position: "Supervisor de Operações",
        department: "Operações",
        email: "ricardo.souza@felka.com.br",
        status: "active" as const,
        accessLevel: "supervisor",
        profilePhoto: "",
        admissionDate: "2018-11-05",
        manager: "Carlos Pereira",
        workLocation: "Terminal Principal",
        allowedModules: ["vehicles", "drivers", "routes", "operations", "reports"],
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fullName: "Fernanda Alves Santos",
        cpf: "55566677788",
        phone: "(11) 99999-0000",
        employeeNumber: "010",
        position: "Coordenadora Financeira",
        department: "Financeiro",
        email: "fernanda.alves@felka.com.br",
        status: "active" as const,
        accessLevel: "supervisor",
        profilePhoto: "",
        admissionDate: "2019-03-12",
        manager: "Carlos Pereira",
        workLocation: "Matriz São Paulo",
        allowedModules: ["analytics", "reports", "finances", "vehicles"],
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    employees.forEach(employee => {
      this.employees.set(employee.id, employee);
      
      // Gerar QR Code para cada funcionário baseado no CPF (formato simples e consistente)
      const qrCodeData = `FELKA_EMP_${employee.cpf}`;
      const employeeQrCode = {
        id: randomUUID(),
        employeeId: employee.id,
        qrCodeData,
        isActive: true,
        createdAt: new Date(),
        expiresAt: null,
      };
      console.log(`QR Code criado para ${employee.fullName}: ${qrCodeData}`);
      this.employeeQrCodes.set(employeeQrCode.id, employeeQrCode);
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
    try {
      const employeesFromDb = await db.select().from(employees);
      console.log('Employees fetched from PostgreSQL:', employeesFromDb.length);
      return employeesFromDb;
    } catch (error) {
      console.error('Erro ao buscar funcionários do PostgreSQL:', error);
      return [];
    }
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
    try {
      const [employee] = await db.select().from(employees).where(eq(employees.id, id));
      return employee;
    } catch (error) {
      console.error('Erro ao buscar funcionário do PostgreSQL:', error);
      return undefined;
    }
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

  async getVehicleChecklists(): Promise<VehicleChecklist[]> {
    return Array.from(this.vehicleChecklists.values());
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

  async getChecklistHistory(checklistId?: string): Promise<ChecklistHistory[]> {
    const allHistory = Array.from(this.checklistHistory.values());
    if (checklistId) {
      return allHistory
        .filter(hist => hist.checklistId === checklistId)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return allHistory.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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

    // Adicionar visitantes de teste
    this.initializeVisitorTestData();
  }

  private initializeMaintenanceTestData() {
    // Obter veículos existentes para usar nos dados de teste
    const vehicleIds = Array.from(this.vehicles.keys()).slice(0, 5);
    
    // Criar algumas requisições de manutenção de teste
    const maintenanceRequests = [
      {
        id: randomUUID(),
        orderNumber: "OS-2025-00001",
        vehicleId: vehicleIds[0] || "ABC-1234",
        requestType: "corrective" as const,
        status: "open" as const,
        priority: "high" as const,
        description: "Falha no sistema de freios - necessita reparo urgente",
        reportedBy: "Carlos Silva",
        mechanic: null,
        startDate: null,
        endDate: null,
        daysStoped: 0,
        estimatedCost: 2500.00,
        actualCost: null,
        createdAt: new Date("2025-01-15"),
        updatedAt: new Date("2025-01-15"),
      },
      {
        id: randomUUID(),
        orderNumber: "OS-2025-00002",
        vehicleId: vehicleIds[1] || "DEF-5678",
        requestType: "preventive" as const,
        status: "in_progress" as const,
        priority: "medium" as const,
        description: "Manutenção preventiva - troca de óleo e filtros",
        reportedBy: "Maria Santos",
        mechanic: "José Oliveira",
        startDate: new Date("2025-01-20"),
        endDate: null,
        daysStoped: 5,
        estimatedCost: 800.00,
        actualCost: null,
        createdAt: new Date("2025-01-19"),
        updatedAt: new Date("2025-01-20"),
      },
      {
        id: randomUUID(),
        orderNumber: "OS-2025-00003",
        vehicleId: vehicleIds[2] || "GHI-9012",
        requestType: "corrective" as const,
        status: "completed" as const,
        priority: "low" as const,
        description: "Substituição de lâmpadas e ajuste de faróis",
        reportedBy: "Pedro Santos",
        mechanic: "André Costa",
        startDate: new Date("2025-01-10"),
        endDate: new Date("2025-01-11"),
        daysStoped: 1,
        estimatedCost: 150.00,
        actualCost: 180.00,
        createdAt: new Date("2025-01-10"),
        updatedAt: new Date("2025-01-11"),
      },
      {
        id: randomUUID(),
        orderNumber: "OS-2025-00004",
        vehicleId: vehicleIds[0] || "ABC-1234",
        requestType: "preventive" as const,
        status: "scheduled" as const,
        priority: "medium" as const,
        description: "Revisão geral de 50.000 km",
        reportedBy: "Ana Paula",
        mechanic: null,
        startDate: new Date("2025-02-01"),
        endDate: null,
        daysStoped: 0,
        estimatedCost: 3500.00,
        actualCost: null,
        createdAt: new Date("2025-01-20"),
        updatedAt: new Date("2025-01-20"),
      },
      // Adicionar mais exemplos para demonstrar o Kanban
      {
        id: randomUUID(),
        orderNumber: "OS-2025-00005",
        vehicleId: vehicleIds[3] || "JKL-3456",
        requestType: "corrective" as const,
        status: "open" as const,
        priority: "medium" as const,
        description: "Problema na transmissão - dificuldade para engatar marchas",
        reportedBy: "Roberto Lima",
        mechanic: null,
        startDate: null,
        endDate: null,
        daysStoped: 0,
        estimatedCost: 1800.00,
        actualCost: null,
        createdAt: new Date("2025-01-21"),
        updatedAt: new Date("2025-01-21"),
      },
      {
        id: randomUUID(),
        orderNumber: "OS-2025-00006",
        vehicleId: vehicleIds[4] || "MNO-7890",
        requestType: "corrective" as const,
        status: "in_progress" as const,
        priority: "high" as const,
        description: "Motor superaquecendo - necessita troca do radiador",
        reportedBy: "Fernanda Santos",
        mechanic: "Carlos Eduardo",
        startDate: new Date("2025-01-18"),
        endDate: null,
        daysStoped: 3,
        estimatedCost: 2200.00,
        actualCost: null,
        createdAt: new Date("2025-01-17"),
        updatedAt: new Date("2025-01-18"),
      },
      {
        id: randomUUID(),
        orderNumber: "OS-2025-00007",
        vehicleId: vehicleIds[1] || "DEF-5678",
        requestType: "preventive" as const,
        status: "completed" as const,
        priority: "low" as const,
        description: "Troca de pastilhas de freio - manutenção preventiva",
        reportedBy: "João Silva",
        mechanic: "André Costa",
        startDate: new Date("2025-01-12"),
        endDate: new Date("2025-01-13"),
        daysStoped: 1,
        estimatedCost: 450.00,
        actualCost: 420.00,
        createdAt: new Date("2025-01-11"),
        updatedAt: new Date("2025-01-13"),
      },
      {
        id: randomUUID(),
        orderNumber: "OS-2025-00008",
        vehicleId: vehicleIds[2] || "GHI-9012",
        requestType: "corrective" as const,
        status: "closed" as const,
        priority: "medium" as const,
        description: "Reparo do sistema elétrico - falha no alternador",
        reportedBy: "Maria Oliveira",
        mechanic: "José Oliveira",
        startDate: new Date("2025-01-05"),
        endDate: new Date("2025-01-08"),
        daysStoped: 3,
        estimatedCost: 950.00,
        actualCost: 1100.00,
        createdAt: new Date("2025-01-04"),
        updatedAt: new Date("2025-01-08"),
      }
    ];

    maintenanceRequests.forEach(request => {
      this.maintenanceRequests.set(request.id, request);
    });

    // Criar alguns materiais de almoxarifado
    const warehouseMaterials = [
      {
        id: randomUUID(),
        materialNumber: 1,
        materialCode: "MAT-001",
        description: "Óleo Motor 15W40",
        unit: "L",
        currentQuantity: "45",
        minimumQuantity: "20",
        maximumQuantity: "100",
        location: "A1-B2",
        warehouseType: "interno",
        category: "Lubrificantes",
        brand: "Shell",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        materialNumber: 2,
        materialCode: "MAT-002",
        description: "Filtro de Óleo",
        unit: "UN",
        currentQuantity: "15",
        minimumQuantity: "10",
        maximumQuantity: "50",
        location: "A2-C3",
        warehouseType: "interno",
        category: "Filtros",
        brand: "Mahle",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        materialNumber: 3,
        materialCode: "MAT-003",
        description: "Pastilha de Freio Dianteira",
        unit: "JG",
        currentQuantity: "8",
        minimumQuantity: "5",
        maximumQuantity: "20",
        location: "B1-D2",
        warehouseType: "interno",
        category: "Freios",
        brand: "Fras-le",
        isActive: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    // Dados de teste removidos - serão implementados no novo sistema de almoxarifado

    // Criar alguns pneus de teste
    const tires = [
      {
        id: randomUUID(),
        fireNumber: "FN-001-2025",
        brand: "Michelin",
        model: "X Multi D",
        size: "295/80R22.5",
        dotCode: "2024",
        purchaseDate: new Date("2024-12-01"),
        purchaseValue: 2800.00,
        supplier: "Pneus São Paulo Ltda",
        currentLife: 1,
        maxLives: 3,
        status: "in_use" as const,
        currentVehicleId: vehicleIds[0],
        position: "DD1",
        lastMeasurement: 15.5,
        measurementDate: new Date("2025-01-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fireNumber: "FN-002-2025",
        brand: "Firestone",
        model: "FS400",
        size: "295/80R22.5",
        dotCode: "2024",
        purchaseDate: new Date("2024-11-15"),
        purchaseValue: 2500.00,
        supplier: "Pneus São Paulo Ltda",
        currentLife: 1,
        maxLives: 3,
        status: "stock" as const,
        currentVehicleId: null,
        position: null,
        lastMeasurement: 16.0,
        measurementDate: new Date("2024-11-15"),
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: randomUUID(),
        fireNumber: "FN-003-2025",
        brand: "Goodyear",
        model: "KMAX D",
        size: "295/80R22.5",
        dotCode: "2023",
        purchaseDate: new Date("2023-10-20"),
        purchaseValue: 2650.00,
        supplier: "Distribuidora de Pneus ABC",
        currentLife: 2,
        maxLives: 3,
        status: "retreading" as const,
        currentVehicleId: null,
        position: null,
        lastMeasurement: 8.0,
        measurementDate: new Date("2025-01-10"),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    ];

    tires.forEach(tire => {
      this.tires.set(tire.id, tire);
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

  // Inicializar dados de teste para visitantes
  private initializeVisitorTestData() {
    const testVisitors: InsertVisitor[] = [
      {
        name: "Carlos Eduardo Silva",
        cpf: "12345678901",
        company: "Empresa ABC Ltda",
        phone: "(11) 99999-1234",
        email: "carlos.silva@empresaabc.com.br"
      },
      {
        name: "Maria Fernanda Santos",
        cpf: "98765432109",
        company: "Prestadora XYZ",
        phone: "(11) 98888-5678",
        email: "maria.santos@prestadoraxyz.com.br"
      },
      {
        name: "Roberto Lima Costa",
        cpf: "11122233344",
        company: "Fornecedor 123",
        phone: "(11) 97777-9012",
        email: "roberto.costa@fornecedor123.com.br"
      },
      {
        name: "Ana Paula Rodrigues",
        cpf: "55566677788",
        company: "Cliente Premium",
        phone: "(11) 96666-3456", 
        email: "ana.rodrigues@clientepremium.com.br"
      },
      {
        name: "José Fernando Oliveira",
        cpf: "33344455566",
        company: "Consultoria Tech",
        phone: "(11) 95555-7890",
        email: "jose.oliveira@consultoriatech.com.br"
      }
    ];

    testVisitors.forEach(visitorData => {
      const id = randomUUID();
      const visitor: Visitor = {
        id,
        ...visitorData,
        totalVisits: Math.floor(Math.random() * 5), // 0-4 visitas anteriores
        lastVisit: Math.random() > 0.5 ? new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000) : null,
        isActive: true,
        createdAt: new Date(Date.now() - Math.random() * 90 * 24 * 60 * 60 * 1000), // Criado nos últimos 90 dias
        updatedAt: new Date(),
      };
      this.visitors.set(id, visitor);
    });
  }

  async updateVisitor(id: string, visitor: Partial<Visitor>): Promise<Visitor> {
    const existing = this.visitors.get(id);
    if (!existing) {
      throw new Error(`Visitor with id ${id} not found`);
    }
    
    const updated: Visitor = {
      ...existing,
      ...visitor,
      updatedAt: new Date(),
    };
    this.visitors.set(id, updated);
    return updated;
  }

  async incrementVisitorVisits(id: string): Promise<Visitor> {
    const visitor = this.visitors.get(id);
    if (!visitor) {
      throw new Error(`Visitor with id ${id} not found`);
    }
    
    const updated: Visitor = {
      ...visitor,
      totalVisits: visitor.totalVisits + 1,
      lastVisit: new Date(),
      updatedAt: new Date(),
    };
    this.visitors.set(id, updated);
    return updated;
  }

  async deleteVisitor(id: string): Promise<void> {
    this.visitors.delete(id);
  }

  async upsertVisitor(visitor: InsertVisitor): Promise<Visitor> {
    const existing = await this.getVisitorByCpf(visitor.cpf);
    
    if (existing) {
      // Atualizar visitante existente
      const updated: Visitor = {
        ...existing,
        ...visitor,
        totalVisits: existing.totalVisits + 1,
        lastVisit: new Date(),
        updatedAt: new Date(),
      };
      this.visitors.set(existing.id, updated);
      return updated;
    } else {
      // Criar novo visitante
      return await this.createVisitor(visitor);
    }
  }

  // Métodos para QR Codes dos funcionários
  async createEmployeeQrCode(qrCode: InsertEmployeeQrCode): Promise<EmployeeQrCode> {
    const id = randomUUID();
    const newQrCode: EmployeeQrCode = {
      id,
      ...qrCode,
      createdAt: new Date(),
      expiresAt: null,
    };
    this.employeeQrCodes.set(id, newQrCode);
    return newQrCode;
  }

  async getEmployeeByQrCode(qrCodeData: string): Promise<EmployeeQrCode | undefined> {
    return Array.from(this.employeeQrCodes.values()).find(
      qrCode => qrCode.qrCodeData === qrCodeData && qrCode.isActive
    );
  }

  async getEmployeeQrCodeByEmployeeId(employeeId: string): Promise<EmployeeQrCode | undefined> {
    return Array.from(this.employeeQrCodes.values()).find(
      qrCode => qrCode.employeeId === employeeId && qrCode.isActive
    );
  }

  async getAllEmployeeQrCodes(): Promise<EmployeeQrCode[]> {
    return Array.from(this.employeeQrCodes.values()).filter(qrCode => qrCode.isActive);
  }

  // Métodos para Logs de Acesso
  async getAccessLogs(): Promise<AccessLog[]> {
    const logs = Array.from(this.accessLogs.values());
    return logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
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

  // ============= MAINTENANCE MODULE =============
  // Maintenance Request methods
  async getMaintenanceRequests(): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getMaintenanceRequest(id: string): Promise<MaintenanceRequest | undefined> {
    return this.maintenanceRequests.get(id);
  }

  async createMaintenanceRequest(request: InsertMaintenanceRequest): Promise<MaintenanceRequest> {
    const year = new Date().getFullYear();
    const count = Array.from(this.maintenanceRequests.values()).filter(r => 
      r.orderNumber.startsWith(`OS-${year}-`)
    ).length + 1;
    
    const orderNumber = `OS-${year}-${count.toString().padStart(5, '0')}`;
    
    const newRequest: MaintenanceRequest = {
      id: randomUUID(),
      orderNumber,
      ...request,
      status: request.status || 'open',
      daysStoped: 0,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.maintenanceRequests.set(newRequest.id, newRequest);
    return newRequest;
  }

  async updateMaintenanceRequest(id: string, request: Partial<InsertMaintenanceRequest>): Promise<MaintenanceRequest | undefined> {
    const existing = this.maintenanceRequests.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...request,
      updatedAt: new Date(),
    };
    
    // Calculate days stopped if in maintenance
    if (updated.startDate && !updated.endDate) {
      const start = new Date(updated.startDate);
      const now = new Date();
      updated.daysStoped = Math.floor((now.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
    }
    
    this.maintenanceRequests.set(id, updated);
    return updated;
  }

  async deleteMaintenanceRequest(id: string): Promise<boolean> {
    return this.maintenanceRequests.delete(id);
  }

  async getVehicleMaintenanceHistory(vehicleId: string): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values())
      .filter(r => r.vehicleId === vehicleId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getVehiclesInMaintenance(): Promise<MaintenanceRequest[]> {
    return Array.from(this.maintenanceRequests.values()).filter(r => r.status === 'in_progress');
  }

  // Maintenance Cost methods
  async getMaintenanceCosts(): Promise<MaintenanceCost[]> {
    return Array.from(this.maintenanceCosts.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createMaintenanceCost(cost: InsertMaintenanceCost): Promise<MaintenanceCost> {
    const newCost: MaintenanceCost = {
      id: randomUUID(),
      ...cost,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.maintenanceCosts.set(newCost.id, newCost);
    return newCost;
  }

  async getVehicleMaintenanceCosts(vehicleId: string): Promise<MaintenanceCost[]> {
    return Array.from(this.maintenanceCosts.values()).filter(c => c.vehicleId === vehicleId);
  }

  // Warehouse Material methods
  async getWarehouseMaterials(warehouseType?: string): Promise<WarehouseMaterial[]> {
    let materials = Array.from(this.warehouseMaterials.values());
    if (warehouseType) {
      materials = materials.filter(m => m.warehouseType === warehouseType);
    }
    return materials.filter(m => m.isActive);
  }

  async getWarehouseMaterial(id: string): Promise<WarehouseMaterial | undefined> {
    return this.warehouseMaterials.get(id);
  }

  async createWarehouseMaterial(material: InsertWarehouseMaterial): Promise<WarehouseMaterial> {
    const newMaterial: WarehouseMaterial = {
      id: randomUUID(),
      materialNumber: this.warehouseMaterials.size + 1,
      ...material,
      currentQuantity: material.currentQuantity || '0',
      minimumQuantity: material.minimumQuantity || '0',
      isActive: material.isActive !== false,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.warehouseMaterials.set(newMaterial.id, newMaterial);
    return newMaterial;
  }

  async updateWarehouseMaterial(id: string, material: Partial<InsertWarehouseMaterial>): Promise<WarehouseMaterial | undefined> {
    const existing = this.warehouseMaterials.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...material,
      updatedAt: new Date(),
    };
    
    this.warehouseMaterials.set(id, updated);
    return updated;
  }

  async getMaterialsLowStock(warehouseType?: string): Promise<WarehouseMaterial[]> {
    let materials = await this.getWarehouseMaterials(warehouseType);
    return materials.filter(m => 
      parseFloat(m.currentQuantity) < parseFloat(m.minimumQuantity)
    );
  }

  // Material Movement methods
  async getMaterialMovements(materialId?: string): Promise<MaterialMovement[]> {
    let movements = Array.from(this.materialMovements.values());
    if (materialId) {
      movements = movements.filter(m => m.materialId === materialId);
    }
    return movements.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createMaterialMovement(movement: InsertMaterialMovement): Promise<MaterialMovement> {
    const newMovement: MaterialMovement = {
      id: randomUUID(),
      ...movement,
      authenticationCode: movement.exitType === 'loan_service' ? randomUUID().slice(0, 8) : undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    // Update material quantity
    const material = await this.getWarehouseMaterial(movement.materialId);
    if (material) {
      const currentQty = parseFloat(material.currentQuantity);
      const movementQty = parseFloat(movement.quantity);
      
      const newQty = movement.movementType === 'entry' 
        ? currentQty + movementQty 
        : currentQty - movementQty;
        
      await this.updateWarehouseMaterial(movement.materialId, {
        currentQuantity: newQty.toString()
      });
    }
    
    this.materialMovements.set(newMovement.id, newMovement);
    return newMovement;
  }

  async getActiveLoans(): Promise<MaterialMovement[]> {
    return Array.from(this.materialMovements.values()).filter(m => 
      m.exitType && m.exitType.includes('loan') && m.loanStatus === 'active'
    );
  }

  // Tire Management methods
  async getTires(): Promise<Tire[]> {
    return Array.from(this.tires.values()).sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async getTire(id: string): Promise<Tire | undefined> {
    return this.tires.get(id);
  }

  async getTireByFireNumber(fireNumber: string): Promise<Tire | undefined> {
    return Array.from(this.tires.values()).find(t => t.fireNumber === fireNumber);
  }

  async createTire(tire: InsertTire): Promise<Tire> {
    const newTire: Tire = {
      id: randomUUID(),
      ...tire,
      currentLife: tire.currentLife || 1,
      status: tire.status || 'active',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.tires.set(newTire.id, newTire);
    return newTire;
  }

  async updateTire(id: string, tire: Partial<InsertTire>): Promise<Tire | undefined> {
    const existing = this.tires.get(id);
    if (!existing) return undefined;
    
    const updated = {
      ...existing,
      ...tire,
      updatedAt: new Date(),
    };
    
    this.tires.set(id, updated);
    return updated;
  }

  async getTiresByStatus(status: string): Promise<Tire[]> {
    return Array.from(this.tires.values()).filter(t => t.status === status);
  }

  // Tire Movement methods
  async getTireMovements(tireId?: string): Promise<TireMovement[]> {
    let movements = Array.from(this.tireMovements.values());
    if (tireId) {
      movements = movements.filter(m => m.tireId === tireId);
    }
    return movements.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  async createTireMovement(movement: InsertTireMovement): Promise<TireMovement> {
    const newMovement: TireMovement = {
      id: randomUUID(),
      ...movement,
      createdAt: new Date(),
    };
    
    // Update tire status based on movement type
    const tire = await this.getTire(movement.tireId);
    if (tire) {
      let newStatus = tire.status;
      let newLife = tire.currentLife;
      
      switch (movement.movementType) {
        case 'installation':
          newStatus = 'in_use';
          break;
        case 'retreading':
          newStatus = 'retreading';
          newLife = (movement.lifeAfter || tire.currentLife) + 1;
          break;
        case 'disposal':
          newStatus = 'discarded';
          break;
        case 'sale':
          newStatus = 'sold';
          break;
        case 'loss':
          newStatus = 'loss';
          break;
      }
      
      await this.updateTire(movement.tireId, {
        status: newStatus,
        currentLife: newLife
      });
    }
    
    this.tireMovements.set(newMovement.id, newMovement);
    return newMovement;
  }

  // ============= MÓDULO DE AGENDAMENTO DE CARREAMENTO =============

  // Pessoas Externas
  private externalPersons = new Map<string, any>();
  private scheduleSlots = new Map<string, any>();
  private cargoSchedulings = new Map<string, any>();

  // Dados de exemplo para desenvolvimento
  private initCargoSchedulingData() {
    // Pessoas externas de exemplo
    const externalPersonsData = [
      {
        id: "ext-1",
        fullName: "João Transportes Ltda",
        email: "contato@joaotransportes.com",
        phone: "(11) 99999-1111",
        document: "12.345.678/0001-90",
        personType: "cliente",
        companyName: "João Transportes Ltda",
        hasSystemAccess: true,
        allowedModules: ["cargo-scheduling"],
        accessLevel: "basic",
        status: "ativo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "ext-2",
        fullName: "Maria Silva",
        email: "maria@logisticaexpress.com",
        phone: "(11) 88888-2222",
        document: "98.765.432/0001-12",
        personType: "terceirizado",
        externalCompany: "Logística Express",
        position: "Coordenadora de Cargas",
        hasSystemAccess: true,
        allowedModules: ["access-control", "cargo-scheduling"],
        accessLevel: "advanced",
        status: "ativo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        id: "ext-3",
        fullName: "Carlos Prestador",
        email: "carlos@prestadorlogistica.com",
        phone: "(11) 77777-3333",
        document: "11.222.333/0001-44",
        personType: "prestador",
        externalCompany: "Prestador Logística",
        position: "Supervisor de Cargas",
        hasSystemAccess: false,
        allowedModules: [],
        accessLevel: "basic",
        status: "ativo",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    externalPersonsData.forEach(person => {
      this.externalPersons.set(person.id, person);
    });

    // Horários de exemplo para hoje e próximos dias
    const today = new Date();
    for (let day = 0; day < 7; day++) {
      const date = new Date(today);
      date.setDate(today.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Criar alguns horários por dia
      const hours = [8, 10, 14, 16];
      hours.forEach(hour => {
        const slotId = `slot-${dateStr}-${hour}`;
        this.scheduleSlots.set(slotId, {
          id: slotId,
          date: dateStr,
          timeSlot: `${hour.toString().padStart(2, '0')}:00`,
          isAvailable: true,
          maxCapacity: 1,
          currentBookings: 0,
          createdBy: "system",
          createdAt: new Date(),
        });
      });
    }

    // Agendamentos de exemplo
    const bookingsData = [
      {
        id: "booking-1",
        clientId: "ext-1",
        slotId: `slot-${today.toISOString().split('T')[0]}-10`,
        companyName: "João Transportes Ltda",
        contactPerson: "João Silva",
        contactEmail: "contato@joaotransportes.com",
        contactPhone: "(11) 99999-1111",
        status: "agendado",
        notes: "Carga frágil - manusear com cuidado",
        createdAt: new Date(),
        updatedAt: new Date(),
      },
    ];

    bookingsData.forEach(booking => {
      this.cargoSchedulings.set(booking.id, booking);
    });
  }

  async getExternalPersons(): Promise<any[]> {
    return Array.from(this.externalPersons.values());
  }

  async createExternalPerson(data: any): Promise<any> {
    const person = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    this.externalPersons.set(person.id, person);
    return person;
  }

  async updateExternalPerson(id: string, data: any): Promise<any> {
    const existing = this.externalPersons.get(id);
    if (!existing) throw new Error('Person not found');
    
    const updated = {
      ...existing,
      ...data,
      updatedAt: new Date(),
    };
    this.externalPersons.set(id, updated);
    return updated;
  }

  async deleteExternalPerson(id: string): Promise<void> {
    this.externalPersons.delete(id);
  }

  // Horários de Agendamento
  async getScheduleSlots(date: string): Promise<any[]> {
    const slots = Array.from(this.scheduleSlots.values())
      .filter(slot => slot.date === date);
    
    // Atualizar contagem de reservas para cada slot
    for (const slot of slots) {
      const bookings = Array.from(this.cargoSchedulings.values())
        .filter(booking => 
          booking.slotId === slot.id && 
          ['agendado', 'confirmado', 'em_andamento'].includes(booking.status)
        );
      slot.currentBookings = bookings.length;
      // Marcar como não disponível se a capacidade for atingida
      slot.isAvailable = slot.currentBookings < slot.maxCapacity;
    }
    
    return slots.sort((a, b) => a.timeSlot.localeCompare(b.timeSlot));
  }

  async getAllScheduleSlots(): Promise<any[]> {
    const slots = Array.from(this.scheduleSlots.values());
    
    // Atualizar contagem de reservas para cada slot
    for (const slot of slots) {
      const bookings = Array.from(this.cargoSchedulings.values())
        .filter(booking => 
          booking.slotId === slot.id && 
          ['agendado', 'confirmado', 'em_andamento'].includes(booking.status)
        );
      slot.currentBookings = bookings.length;
      // Marcar como não disponível se a capacidade for atingida
      slot.isAvailable = slot.currentBookings < slot.maxCapacity;
    }
    
    return slots.sort((a, b) => {
      // Ordenar por data primeiro, depois por horário
      const dateCompare = a.date.localeCompare(b.date);
      if (dateCompare !== 0) return dateCompare;
      return a.timeSlot.localeCompare(b.timeSlot);
    });
  }

  async createScheduleSlot(data: any): Promise<any> {
    const slot = {
      id: randomUUID(),
      ...data,
      createdAt: new Date(),
    };
    this.scheduleSlots.set(slot.id, slot);
    return slot;
  }

  async scheduleWeekSlots(startDate: string): Promise<any[]> {
    const slots = [];
    const start = new Date(startDate);
    
    // Criar horários para 5 dias úteis (segunda a sexta)
    for (let day = 0; day < 5; day++) {
      const date = new Date(start);
      date.setDate(start.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Horários: 8h às 16h
      for (let hour = 8; hour <= 16; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        
        // Verificar se já existe
        const existing = Array.from(this.scheduleSlots.values())
          .find(slot => slot.date === dateStr && slot.timeSlot === timeSlot);
        
        if (!existing) {
          const slot = {
            id: randomUUID(),
            date: dateStr,
            timeSlot,
            isAvailable: true,
            maxCapacity: 1,
            currentBookings: 0,
            createdBy: "system",
            createdAt: new Date(),
          };
          this.scheduleSlots.set(slot.id, slot);
          slots.push(slot);
        }
      }
    }
    
    return slots;
  }

  // Agendamentos
  async createCargoScheduling(data: any): Promise<any> {
    // Encontrar o slot correspondente baseado na data e horário
    const slot = Array.from(this.scheduleSlots.values())
      .find(s => s.date === data.date && s.timeSlot === data.timeSlot);
    
    if (!slot) {
      throw new Error(`Slot não encontrado para ${data.date} às ${data.timeSlot}`);
    }
    
    // Verificar se o slot ainda tem capacidade
    const existingBookings = Array.from(this.cargoSchedulings.values())
      .filter(booking => 
        booking.slotId === slot.id && 
        ['agendado', 'confirmado', 'em_andamento'].includes(booking.status)
      );
    
    if (existingBookings.length >= slot.maxCapacity) {
      throw new Error('Horário não disponível - capacidade esgotada');
    }
    
    const booking = {
      id: randomUUID(),
      ...data,
      slotId: slot.id, // Vincular ao slot correto
      status: 'agendado',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.cargoSchedulings.set(booking.id, booking);
    return booking;
  }

  async getClientBookings(clientId: string): Promise<any[]> {
    return Array.from(this.cargoSchedulings.values())
      .filter(booking => booking.clientId === clientId)
      .map(booking => {
        const slot = this.scheduleSlots.get(booking.slotId);
        return {
          ...booking,
          date: slot?.date,
          timeSlot: slot?.timeSlot,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async getBookingById(id: string): Promise<any | null> {
    const booking = this.cargoSchedulings.get(id);
    if (!booking) return null;
    
    const slot = this.scheduleSlots.get(booking.slotId);
    return {
      ...booking,
      date: slot?.date,
      timeSlot: slot?.timeSlot,
    };
  }

  async getAllBookings(): Promise<any[]> {
    return Array.from(this.cargoSchedulings.values())
      .map(booking => {
        const slot = this.scheduleSlots.get(booking.slotId);
        return {
          ...booking,
          date: slot?.date,
          timeSlot: slot?.timeSlot,
        };
      })
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async cancelBooking(id: string, reason?: string): Promise<void> {
    const booking = this.cargoSchedulings.get(id);
    if (!booking) throw new Error('Booking not found');
    
    const updated = {
      ...booking,
      status: 'cancelado',
      cancellationReason: reason,
      canceledAt: new Date(),
      updatedAt: new Date(),
    };
    this.cargoSchedulings.set(id, updated);
  }

  async managerActionBooking(id: string, action: string, notes: string): Promise<any> {
    const booking = this.cargoSchedulings.get(id);
    if (!booking) throw new Error('Booking not found');
    
    const updated = {
      ...booking,
      status: action === 'complete' ? 'concluido' : 'cancelado',
      managerNotes: notes,
      updatedAt: new Date(),
    };
    
    if (action === 'complete') {
      updated.completedAt = new Date();
      updated.completedBy = "admin"; // Em implementação real, usar ID do usuário
    } else {
      updated.canceledAt = new Date();
      updated.canceledBy = "admin";
      updated.cancellationReason = notes;
    }
    
    this.cargoSchedulings.set(id, updated);
    return updated;
  }

  // Criar semana completa de horários
  async createWeekSlots(startDate: string, serviceType: string): Promise<any[]> {
    const slots = [];
    const start = new Date(startDate);
    
    // Criar horários para 7 dias (segunda a domingo)
    for (let day = 0; day < 7; day++) {
      const date = new Date(start);
      date.setDate(start.getDate() + day);
      const dateStr = date.toISOString().split('T')[0];
      
      // Horários: 8h às 17h (10 slots por dia)
      for (let hour = 8; hour <= 17; hour++) {
        const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
        
        // Verificar se já existe
        const existing = Array.from(this.scheduleSlots.values())
          .find(slot => slot.date === dateStr && slot.timeSlot === timeSlot);
        
        if (!existing) {
          const slot = {
            id: `slot-${dateStr}-${hour}`,
            date: dateStr,
            timeSlot,
            isAvailable: true,
            maxCapacity: 2, // Capacidade para 2 agendamentos por horário
            currentBookings: 0,
            serviceType,
            status: 'disponivel',
            createdBy: "admin",
            createdAt: new Date(),
          };
          this.scheduleSlots.set(slot.id, slot);
          slots.push(slot);
        }
      }
    }
    
    return slots;
  }

  // Bloquear horários selecionados
  async blockSlots(slotIds: string[]): Promise<any[]> {
    const blockedSlots = [];
    
    for (const slotId of slotIds) {
      const slot = this.scheduleSlots.get(slotId);
      if (slot) {
        const updatedSlot = {
          ...slot,
          status: 'bloqueado',
          isAvailable: false,
          blockedAt: new Date(),
          blockedBy: "admin",
        };
        this.scheduleSlots.set(slotId, updatedSlot);
        blockedSlots.push(updatedSlot);
      }
    }
    
    return blockedSlots;
  }

  // ============= MÉTODOS DE TERCEIROS (PESSOAS EXTERNAS) =============
  
  async getExternalPersons(): Promise<ExternalPerson[]> {
    return Array.from(this.externalPersons.values());
  }

  async getExternalPerson(id: string): Promise<ExternalPerson | undefined> {
    return this.externalPersons.get(id);
  }

  async getExternalPersonByEmail(email: string): Promise<ExternalPerson | undefined> {
    return Array.from(this.externalPersons.values())
      .find(person => person.email === email);
  }

  async createExternalPerson(person: InsertExternalPerson): Promise<ExternalPerson> {
    const newPerson: ExternalPerson = {
      id: randomUUID(),
      ...person,
      status: 'ativo',
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    this.externalPersons.set(newPerson.id, newPerson);
    return newPerson;
  }

  async updateExternalPerson(id: string, person: Partial<InsertExternalPerson>): Promise<ExternalPerson | undefined> {
    const existing = this.externalPersons.get(id);
    if (!existing) return undefined;

    const updated: ExternalPerson = {
      ...existing,
      ...person,
      updatedAt: new Date(),
    };

    this.externalPersons.set(id, updated);
    return updated;
  }

  async updateExternalPersonStatus(id: string, status: string, reason?: string): Promise<ExternalPerson | undefined> {
    const existing = this.externalPersons.get(id);
    if (!existing) return undefined;

    const updated: ExternalPerson = {
      ...existing,
      status,
      statusReason: reason,
      updatedAt: new Date(),
    };

    this.externalPersons.set(id, updated);
    return updated;
  }

  getParkedVehicles(): Array<any> {
    // Mock data for parked vehicles in maintenance
    const mockParkedVehicles = [
      {
        id: "v1",
        plate: "FLK-2023",
        classification: "Caminhão Baú",
        maintenanceType: "Corretiva",
        stoppedDate: "2025-01-30T08:00:00Z",
        expectedReleaseDate: "2025-02-10T16:00:00Z",
        daysParked: 6,
        status: "Em Manutenção"
      },
      {
        id: "v2",
        plate: "FLK-2024",
        classification: "Carreta",
        maintenanceType: "Preventiva",
        stoppedDate: "2025-02-01T14:30:00Z",
        expectedReleaseDate: "2025-02-08T10:00:00Z",
        daysParked: 4,
        status: "Em Manutenção"
      },
      {
        id: "v3",
        plate: "FLK-2025",
        classification: "Bitrem",
        maintenanceType: "Emergencial",
        stoppedDate: "2025-01-25T16:45:00Z",
        expectedReleaseDate: "2025-02-15T12:00:00Z",
        daysParked: 11,
        status: "Em Manutenção"
      },
      {
        id: "v4",
        plate: "FLK-2026",
        classification: "Caminhão Toco",
        maintenanceType: "Revisão",
        stoppedDate: "2025-02-03T09:15:00Z",
        expectedReleaseDate: "2025-02-07T17:00:00Z",
        daysParked: 2,
        status: "Em Manutenção"
      },
      {
        id: "v5",
        plate: "FLK-2027",
        classification: "Carreta",
        maintenanceType: "Corretiva",
        stoppedDate: "2025-01-28T11:20:00Z",
        expectedReleaseDate: "2025-02-12T14:30:00Z",
        daysParked: 8,
        status: "Em Manutenção"
      }
    ];

    // Calculate days parked dynamically
    return mockParkedVehicles.map(vehicle => {
      const stoppedDate = new Date(vehicle.stoppedDate);
      const today = new Date();
      const daysParked = Math.floor((today.getTime() - stoppedDate.getTime()) / (1000 * 60 * 60 * 24));
      
      return {
        ...vehicle,
        daysParked: Math.max(0, daysParked)
      };
    });
  }

  // Sistema de notificações para motoristas
  private driverNotifications = new Map<string, any>();

  async getPreventiveMaintenanceVehicles(): Promise<Array<any>> {
    try {
      // Importar a conexão do banco de dados
      const { db } = await import('./db');
      const { vehicles } = await import('@shared/schema');
      const { eq } = await import('drizzle-orm');
      
      // Buscar veículos ativos do banco de dados
      const vehiclesList = await db.select().from(vehicles).where(eq(vehicles.status, 'ativo'));
      
      const vehiclesWithMaintenance = vehiclesList.map(vehicle => {
        // Simular dados de manutenção preventiva baseado na quilometragem configurada
        const maintenanceInterval = vehicle.preventiveMaintenanceKm || 10000; // Use a quilometragem configurada ou 10.000 km padrão
        const lastMaintenanceKm = Math.floor(Math.random() * 50000) + 100000;
        const currentKm = lastMaintenanceKm + Math.floor(Math.random() * 15000);
        const kmToNextMaintenance = (lastMaintenanceKm + maintenanceInterval) - currentKm;
        
        // Verificar se veículo já tem agendamento
        const hasScheduled = Array.from(this.driverNotifications.values())
          .find(notification => 
            notification.vehicleId === vehicle.id && 
            notification.type === 'preventive_maintenance' &&
            notification.status !== 'completed'
          );

        let status: 'em_dia' | 'programar_revisao' | 'em_revisao' | 'agendado';
        let priority: number;
        
        if (hasScheduled) {
          status = 'agendado';
          priority = 0; // Prioridade especial para agendados
        } else if (kmToNextMaintenance < 0) {
          status = 'em_revisao';
          priority = 1; // Máxima prioridade
        } else if (kmToNextMaintenance >= 2000 && kmToNextMaintenance <= 3000) {
          status = 'programar_revisao';
          priority = 2; // Prioridade média
        } else {
          status = 'em_dia';
          priority = 3; // Menor prioridade
        }

        return {
          id: vehicle.id,
          plate: vehicle.plate || 'N/A',
          vehicleType: vehicle.vehicleType || 'Caminhão',
          classification: vehicle.classification || 'N/A',
          lastMaintenanceDate: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString(),
          lastMaintenanceKm,
          currentKm,
          kmToNextMaintenance,
          maintenanceInterval,
          status,
          priority,
          name: vehicle.name,
          brand: vehicle.brand,
          model: vehicle.model,
          scheduledMaintenance: hasScheduled || null
        };
      });

      // Ordenar por prioridade: Em revisão, Programar revisão, Em dia
      return vehiclesWithMaintenance.sort((a, b) => {
        if (a.priority !== b.priority) {
          return a.priority - b.priority;
        }
        // Se mesma prioridade, ordenar por quilometragem restante (menor primeiro)
        return a.kmToNextMaintenance - b.kmToNextMaintenance;
      });
    } catch (error) {
      console.error('Erro ao buscar veículos para manutenção preventiva:', error);
      return [];
    }
  }

  async schedulePreventiveMaintenance(data: {
    vehicleId: string;
    driverId: string;
    location: 'oficina_interna' | 'oficina_externa';
    scheduledDate: string;
  }) {
    console.log('Dados recebidos para agendamento:', data);
    
    // Buscar veículo no banco de dados
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, data.vehicleId));
    console.log('Veículo encontrado:', vehicle);
    
    const [driver] = await db.select().from(employees).where(eq(employees.id, data.driverId));
    console.log('Motorista encontrado:', driver);
    
    if (!vehicle || !driver) {
      console.log('Erro: Veículo ou motorista não encontrado');
      console.log('Vehicle ID buscado:', data.vehicleId);
      console.log('Driver ID buscado:', data.driverId);
      throw new Error('Veículo ou motorista não encontrado');
    }

    // Verificar se já existe agendamento para este veículo
    const existingSchedule = Array.from(this.driverNotifications.values())
      .find(notification => 
        notification.vehicleId === data.vehicleId && 
        notification.type === 'preventive_maintenance' &&
        notification.status !== 'completed'
      );

    if (existingSchedule) {
      throw new Error('Este veículo já possui um agendamento de manutenção preventiva em aberto');
    }

    // Criar notificação para o motorista
    const notificationId = randomUUID();
    const locationText = data.location === 'oficina_interna' ? 'Oficina Interna' : 'Oficina Externa';
    
    const notification = {
      id: notificationId,
      driverId: data.driverId,
      vehicleId: data.vehicleId,
      type: 'preventive_maintenance',
      title: 'Agendamento de Manutenção Preventiva',
      message: `Prezado.

Segue abaixo o agendamento de parada do veículo:

Tipo de parada: Manutenção Preventiva
Placa: ${vehicle.plate}
Data: ${new Date(data.scheduledDate).toLocaleDateString('pt-BR')}
Local: ${locationText}

Deixar carreta no setor de manutenção para preventiva

Observações Importantes:

O setor logístico já está ciente da data. Contudo, solicitamos que o motorista confirme com o setor logístico um dia antes da parada.

Não deixar itens pessoais no veículo, como celular, carteira, óculos, relógio, entre outros.

${data.location === 'oficina_interna' ? 
`Para manutenções realizadas na oficina interna:
• Levar o veículo até a base de manutenção;
• Retirar ou prender materiais que possam cair no painel durante o içamento da cabine;
• Após a entrega do veículo, retornar à base 02 e dirigir-se à sala de espera dos motoristas.` :
`Para manutenções realizadas externamente:
• Levar o veículo até o local indicado;
• Alinhar com o setor logístico sobre a permanência do motorista no fornecedor ou retorno à base.`
}

Em caso de dúvidas, entrar em contato com o setor de Frota e Manutenção.`,
      scheduledDate: data.scheduledDate,
      location: data.location,
      vehiclePlate: vehicle.placa,
      isRead: false,
      status: 'scheduled',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    this.driverNotifications.set(notificationId, notification);

    return {
      success: true,
      notificationId,
      message: 'Manutenção preventiva agendada com sucesso'
    };
  }

  getDriverNotifications(driverId: string): Array<any> {
    return Array.from(this.driverNotifications.values())
      .filter(notification => notification.driverId === driverId)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  async markNotificationAsRead(notificationId: string) {
    const notification = this.driverNotifications.get(notificationId);
    if (!notification) return null;

    notification.isRead = true;
    notification.updatedAt = new Date();
    
    this.driverNotifications.set(notificationId, notification);
    return notification;
  }

  // Buscar agendamento de manutenção
  getScheduledMaintenance(vehicleId: string) {
    return Array.from(this.driverNotifications.values())
      .find(notification => 
        notification.vehicleId === vehicleId && 
        notification.type === 'preventive_maintenance' &&
        notification.status !== 'completed'
      );
  }

  // Registrar nova manutenção preventiva realizada
  async registerCompletedMaintenance(data: {
    vehicleId: string;
    newKm: number;
    maintenanceDate: string;
    location: string;
    notes?: string;
  }) {
    console.log('Registrando manutenção realizada:', data);
    
    // Buscar veículo no banco
    const [vehicle] = await db.select().from(vehicles).where(eq(vehicles.id, data.vehicleId));
    
    if (!vehicle) {
      throw new Error('Veículo não encontrado');
    }

    // Marcar agendamento como concluído se existir
    const scheduledMaintenance = this.getScheduledMaintenance(data.vehicleId);
    if (scheduledMaintenance) {
      scheduledMaintenance.status = 'completed';
      scheduledMaintenance.completedAt = new Date().toISOString();
      scheduledMaintenance.completedKm = data.newKm;
      scheduledMaintenance.completionNotes = data.notes;
    }

    // Aqui você poderia salvar no banco de dados um histórico de manutenções
    // Por enquanto, vamos apenas simular que a manutenção foi registrada
    
    return {
      success: true,
      message: 'Manutenção registrada com sucesso',
      vehicle: {
        id: vehicle.id,
        plate: vehicle.plate,
        newKm: data.newKm,
        maintenanceDate: data.maintenanceDate
      }
    };
  }

}

export const storage = new MemStorage();
