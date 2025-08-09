// Tipos mock para funcionar sem o backend
export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'user' | 'driver';
  createdAt: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plate: string;
  brand: string;
  model: string;
  vehicleType: string;
  classification: string;
  status: string;
  createdAt: string;
  driverId?: string;
  currentKm?: number;
  lastMaintenanceKm?: number;
}

export interface Driver {
  id: string;
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
  licenseCategory: string;
  vehicleId?: string;
  createdAt: string;
}

export interface Employee {
  id: string;
  name: string;
  email: string;
  phone: string;
  position: string;
  department: string;
  cpf?: string;
  rg?: string;
  status: string;
  createdAt: string;
}

export interface EmployeeDocument {
  id: string;
  employeeId: string;
  type: string;
  documentUrl: string;
  expiryDate?: string;
  createdAt: string;
}

export interface EmployeeOccurrence {
  id: string;
  employeeId: string;
  type: string;
  description: string;
  date: string;
  createdAt: string;
}

export interface ExternalPerson {
  id: string;
  name: string;
  cpf: string;
  phone?: string;
  company?: string;
  purpose: string;
  createdAt: string;
}

export interface Visitor {
  id: string;
  name: string;
  cpf: string;
  company?: string;
  purpose: string;
  createdAt: string;
}

export interface AccessLog {
  id: string;
  personId: string;
  personType: 'employee' | 'visitor';
  action: 'entry' | 'exit';
  timestamp: string;
  guardId: string;
}

export interface VehicleChecklist {
  id: string;
  vehicleId: string;
  driverId: string;
  checkDate: string;
  items: any;
  observations?: string;
  status: string;
  createdAt: string;
}

export interface MaintenanceRequest {
  id: string;
  vehicleId: string;
  type: string;
  description: string;
  priority: string;
  status: string;
  cost?: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  origin: string;
  destination: string;
  customerId: string;
  vehicleId?: string;
  driverId?: string;
  status: string;
  scheduledDate: string;
  createdAt: string;
}

export interface Route {
  id: string;
  name: string;
  origin: string;
  destination: string;
  distance: number;
  estimatedTime: number;
  vehicleId?: string;
  driverId?: string;
  status: string;
  createdAt: string;
}

// Tipos para inserção (simplificados)
export type InsertEmployee = Omit<Employee, 'id' | 'createdAt'>;
export type InsertVehicle = Omit<Vehicle, 'id' | 'createdAt'>;
export type InsertRoute = Omit<Route, 'id' | 'createdAt'>;
export type InsertEmployeeDocument = Omit<EmployeeDocument, 'id' | 'createdAt'>;

// Schemas mock para validação (versões simplificadas)
export const loginSchema = {
  parse: (data: any) => data as { email: string; password: string }
};

export const insertEmployeeSchema = {
  parse: (data: any) => data as InsertEmployee
};

export const insertVehicleSchema = {
  parse: (data: any) => data as InsertVehicle
};

export const insertRouteSchema = {
  parse: (data: any) => data as InsertRoute
};

export const insertExternalPersonSchema = {
  parse: (data: any) => data as Omit<ExternalPerson, 'id' | 'createdAt'>
};

// Tipos de dados para login
export type LoginData = {
  email: string;
  password: string;
};