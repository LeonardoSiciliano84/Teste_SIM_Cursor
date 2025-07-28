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
  type InsertServiceLog
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
    
    // Initialize with default admin user and sample data
    this.initializeDefaultData();
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
    return Array.from(this.employees.values());
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
    return Array.from(this.pranchaServices.values()).map(service => ({
      ...service,
      logs: Array.from(this.serviceLogs.values()).filter(log => log.serviceId === service.id)
    }));
  }

  async getPranchaService(id: string): Promise<PranchaService | undefined> {
    const service = this.pranchaServices.get(id);
    if (!service) return undefined;
    
    return {
      ...service,
      logs: Array.from(this.serviceLogs.values()).filter(log => log.serviceId === id)
    };
  }

  async createPranchaService(serviceData: InsertPranchaService): Promise<PranchaService> {
    const id = randomUUID();
    const service: PranchaService = {
      ...serviceData,
      id,
      serviceDays: serviceData.serviceDays || 0,
      status: "aguardando",
      hrStatus: "nao_verificado",
      createdAt: new Date(),
      updatedAt: new Date(),
      logs: []
    };
    
    this.pranchaServices.set(id, service);
    return service;
  }

  async updatePranchaService(id: string, serviceData: Partial<InsertPranchaService>): Promise<PranchaService | undefined> {
    const service = this.pranchaServices.get(id);
    if (!service) return undefined;

    const updatedService = {
      ...service,
      ...serviceData,
      updatedAt: new Date()
    };

    this.pranchaServices.set(id, updatedService);
    return updatedService;
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
}

export const storage = new MemStorage();
