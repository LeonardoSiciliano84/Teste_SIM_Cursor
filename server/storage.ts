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
  type LoginData
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
}

export class MemStorage implements IStorage {
  private users: Map<string, User>;
  private vehicles: Map<string, Vehicle>;
  private drivers: Map<string, Driver>;
  private routes: Map<string, Route>;
  private bookings: Map<string, Booking>;
  private trips: Map<string, Trip>;

  constructor() {
    this.users = new Map();
    this.vehicles = new Map();
    this.drivers = new Map();
    this.routes = new Map();
    this.bookings = new Map();
    this.trips = new Map();
    
    // Initialize with default admin user
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

    // Add sample vehicles
    const driverIds = Array.from(this.drivers.keys());
    const vehicles = [
      {
        id: randomUUID(),
        name: "Caminhão 001",
        plate: "ABC-1234",
        type: "truck",
        model: "Mercedes-Benz Atego",
        year: 2022,
        status: "active" as const,
        currentLocation: "São Paulo, SP",
        driverId: driverIds[0],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Van 003",
        plate: "DEF-5678",
        type: "van",
        model: "Iveco Daily",
        year: 2021,
        status: "maintenance" as const,
        currentLocation: "Oficina Central",
        driverId: driverIds[1],
        createdAt: new Date(),
      },
      {
        id: randomUUID(),
        name: "Caminhão 002",
        plate: "GHI-9012",
        type: "truck",
        model: "Volvo FH",
        year: 2023,
        status: "active" as const,
        currentLocation: "Rio de Janeiro, RJ",
        driverId: driverIds[2],
        createdAt: new Date(),
      },
    ];

    vehicles.forEach(vehicle => this.vehicles.set(vehicle.id, vehicle));
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
}

export const storage = new MemStorage();
