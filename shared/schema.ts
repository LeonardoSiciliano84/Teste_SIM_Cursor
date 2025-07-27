import { sql } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, uuid, date, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const vehicles = pgTable("vehicles", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  // Identificação básica
  name: text("name").notNull(),
  plate: text("plate").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  renavam: text("renavam"),
  chassis: text("chassis"),
  modelYear: integer("model_year").notNull(),
  manufactureYear: integer("manufacture_year").notNull(),
  
  // Tipo e classificação
  vehicleType: text("vehicle_type").notNull(), // Tração, Semirreboque, Equipamento
  classification: text("classification").notNull(), // Passeio, Moto, Empilhadeira, etc.
  
  // Manutenção
  preventiveMaintenanceKm: integer("preventive_maintenance_km").default(10000),
  tireRotationKm: integer("tire_rotation_km").default(10000),
  
  // Informações Financeiras
  purchaseDate: timestamp("purchase_date"),
  purchaseValue: decimal("purchase_value", { precision: 12, scale: 2 }),
  financialInstitution: text("financial_institution"),
  contractType: text("contract_type"), // CDC, Leasing, Consórcio
  contractNumber: text("contract_number"),
  contractDocument: text("contract_document"), // URL do arquivo
  installmentCount: integer("installment_count"),
  installmentValue: decimal("installment_value", { precision: 12, scale: 2 }),
  
  // Documentação
  crlvDocument: text("crlv_document"), // URL
  crlvExpiry: timestamp("crlv_expiry"),
  tachographDocument: text("tachograph_document"),
  tachographExpiry: timestamp("tachograph_expiry"),
  anttDocument: text("antt_document"),
  anttExpiry: timestamp("antt_expiry"),
  insuranceDocument: text("insurance_document"),
  insuranceValue: decimal("insurance_value", { precision: 12, scale: 2 }),
  insuranceExpiry: timestamp("insurance_expiry"),
  
  // FIPE
  fipeCode: text("fipe_code"),
  fipeValue: decimal("fipe_value", { precision: 12, scale: 2 }),
  fipeLastUpdate: timestamp("fipe_last_update"),
  
  // Informações Técnicas
  photos: text("photos").array(), // Array de URLs das fotos
  bodyWidth: decimal("body_width", { precision: 8, scale: 2 }), // em metros
  floorHeight: decimal("floor_height", { precision: 8, scale: 2 }), // em metros
  bodyLength: decimal("body_length", { precision: 8, scale: 2 }), // em metros
  loadCapacity: decimal("load_capacity", { precision: 10, scale: 2 }), // em kg
  fuelTankCapacity: decimal("fuel_tank_capacity", { precision: 8, scale: 2 }), // em litros
  fuelConsumption: decimal("fuel_consumption", { precision: 6, scale: 2 }), // km/L
  
  // Status e controle
  status: text("status").notNull().default("active"), // active, inactive
  inactiveReason: text("inactive_reason"),
  currentLocation: text("current_location"),
  driverId: uuid("driver_id").references(() => drivers.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const drivers = pgTable("drivers", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  phone: text("phone").notNull(),
  license: text("license").notNull().unique(),
  licenseCategory: text("license_category").notNull(),
  status: text("status").notNull().default("available"), // 'available', 'on_trip', 'inactive'
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const routes = pgTable("routes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  distance: decimal("distance", { precision: 10, scale: 2 }),
  estimatedDuration: integer("estimated_duration"), // in minutes
  vehicleId: uuid("vehicle_id").references(() => vehicles.id),
  driverId: uuid("driver_id").references(() => drivers.id),
  status: text("status").notNull().default("planned"), // 'planned', 'active', 'completed', 'cancelled'
  scheduledAt: timestamp("scheduled_at"),
  startedAt: timestamp("started_at"),
  completedAt: timestamp("completed_at"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const bookings = pgTable("bookings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  bookingNumber: text("booking_number").notNull().unique(),
  clientName: text("client_name").notNull(),
  clientPhone: text("client_phone").notNull(),
  clientEmail: text("client_email"),
  origin: text("origin").notNull(),
  destination: text("destination").notNull(),
  type: text("type").notNull(), // 'cargo', 'moving', 'express', 'vehicle_transport'
  status: text("status").notNull().default("pending"), // 'pending', 'confirmed', 'active', 'completed', 'cancelled'
  price: decimal("price", { precision: 10, scale: 2 }),
  routeId: uuid("route_id").references(() => routes.id),
  scheduledAt: timestamp("scheduled_at"),
  notes: text("notes"),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const trips = pgTable("trips", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  routeId: uuid("route_id").references(() => routes.id),
  bookingId: uuid("booking_id").references(() => bookings.id),
  revenue: decimal("revenue", { precision: 10, scale: 2 }),
  fuelCost: decimal("fuel_cost", { precision: 10, scale: 2 }),
  status: text("status").notNull().default("completed"), // 'completed', 'cancelled'
  completedAt: timestamp("completed_at").notNull().default(sql`now()`),
});

// ============= MÓDULO DE RH E DEPARTAMENTO PESSOAL =============

export const employees = pgTable("employees", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Dados pessoais
  fullName: text("full_name").notNull(),
  cpf: text("cpf").notNull().unique(),
  rg: text("rg"),
  rgIssuer: text("rg_issuer"),
  rgIssueDate: date("rg_issue_date"),
  birthDate: date("birth_date").notNull(),
  gender: text("gender"), // M, F, Outro
  maritalStatus: text("marital_status"), // Solteiro, Casado, Divorciado, Viúvo
  nationality: text("nationality").default("Brasileira"),
  
  // Contato
  phone: text("phone").notNull(),
  email: text("email"),
  personalEmail: text("personal_email"),
  
  // Endereço
  address: text("address"),
  addressNumber: text("address_number"),
  complement: text("complement"),
  neighborhood: text("neighborhood"),
  city: text("city"),
  state: text("state"),
  zipCode: text("zip_code"),
  
  // Informações profissionais
  employeeNumber: text("employee_number").notNull().unique(),
  admissionDate: date("admission_date").notNull(),
  dismissalDate: date("dismissal_date"),
  position: text("position").notNull(),
  department: text("department").notNull(),
  manager: text("manager"),
  workSchedule: text("work_schedule"),
  workLocation: text("work_location"),
  
  // Informações salariais
  salary: decimal("salary", { precision: 10, scale: 2 }),
  benefits: json("benefits"), // Array de benefícios
  bankAccount: text("bank_account"),
  bank: text("bank"),
  bankAgency: text("bank_agency"),
  pixKey: text("pix_key"),
  
  // Informações escolares
  education: text("education"), // Fundamental, Médio, Superior, Pós
  educationInstitution: text("education_institution"),
  educationCourse: text("education_course"),
  educationStatus: text("education_status"), // Completo, Incompleto, Cursando
  
  // Documentos pessoais
  voterTitle: text("voter_title"),
  militaryService: text("military_service"),
  workCard: text("work_card"),
  pis: text("pis"),
  
  // CNH (se aplicável)
  driverLicense: text("driver_license"),
  driverLicenseCategory: text("driver_license_category"),
  driverLicenseExpiry: date("driver_license_expiry"),
  
  // Sistema
  status: text("status").notNull().default("active"), // active, inactive
  inactiveReason: text("inactive_reason"),
  systemUserId: uuid("system_user_id").references(() => users.id),
  profilePhoto: text("profile_photo"),
  
  // Permissões de acesso
  accessLevel: text("access_level").default("employee"), // employee, supervisor, manager, admin
  allowedModules: text("allowed_modules").array().default(sql`'{}'`),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const employeeDependents = pgTable("employee_dependents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  
  name: text("name").notNull(),
  cpf: text("cpf"),
  birthDate: date("birth_date").notNull(),
  relationship: text("relationship").notNull(), // Filho(a), Cônjuge, Pai, Mãe, etc.
  isDependent: boolean("is_dependent").default(true),
  
  // Documentos
  birthCertificate: text("birth_certificate"),
  cpfDocument: text("cpf_document"),
  schoolEnrollment: text("school_enrollment"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const employeeDocuments = pgTable("employee_documents", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  
  documentType: text("document_type").notNull(), // CNH, Exame Médico, Curso, ASO, etc.
  documentName: text("document_name").notNull(),
  documentUrl: text("document_url"),
  expiryDate: date("expiry_date"),
  issueDate: date("issue_date"),
  issuer: text("issuer"),
  
  // Controle de vencimento
  notificationSent: boolean("notification_sent").default(false),
  notificationDate: timestamp("notification_date"),
  
  // Histórico
  previousVersionId: uuid("previous_version_id"),
  version: integer("version").default(1),
  
  status: text("status").default("active"), // active, expired, renewed, archived
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const employeeOccurrences = pgTable("employee_occurrences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  requestedById: uuid("requested_by_id").references(() => employees.id).notNull(),
  
  occurrenceType: text("occurrence_type").notNull(), // advertencia_verbal, advertencia_escrita, suspensao, falta, atestado
  title: text("title").notNull(),
  description: text("description").notNull(),
  occurrenceDate: date("occurrence_date").notNull(),
  
  // Para suspensões
  suspensionDays: integer("suspension_days"),
  suspensionStart: date("suspension_start"),
  suspensionEnd: date("suspension_end"),
  
  // Para atestados
  medicalDays: integer("medical_days"),
  medicalStart: date("medical_start"),
  medicalEnd: date("medical_end"),
  medicalDocument: text("medical_document"),
  
  // Assinatura e aprovação
  employeeSignature: boolean("employee_signature").default(false),
  employeeSignatureDate: timestamp("employee_signature_date"),
  managerSignature: boolean("manager_signature").default(false),
  managerSignatureDate: timestamp("manager_signature_date"),
  hrSignature: boolean("hr_signature").default(false),
  hrSignatureDate: timestamp("hr_signature_date"),
  
  // Documento gerado
  documentGenerated: boolean("document_generated").default(false),
  documentUrl: text("document_url"),
  
  status: text("status").default("pending"), // pending, signed, completed, cancelled
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const employeeMovements = pgTable("employee_movements", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  
  movementType: text("movement_type").notNull(), // promocao, transferencia, mudanca_salario, mudanca_cargo
  previousValue: text("previous_value"),
  newValue: text("new_value"),
  reason: text("reason").notNull(),
  effectiveDate: date("effective_date").notNull(),
  approvedById: uuid("approved_by_id").references(() => employees.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

export const employeeFiles = pgTable("employee_files", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  
  fileName: text("file_name").notNull(),
  fileUrl: text("file_url").notNull(),
  fileType: text("file_type"), // PDF, DOC, DOCX, JPG, PNG
  fileSize: integer("file_size"),
  category: text("category"), // contrato, exame, curso, documento_pessoal, outros
  description: text("description"),
  
  uploadedById: uuid("uploaded_by_id").references(() => employees.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
});

export const insertVehicleSchema = createInsertSchema(vehicles).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertDriverSchema = createInsertSchema(drivers).omit({
  id: true,
  createdAt: true,
});

export const insertRouteSchema = createInsertSchema(routes).omit({
  id: true,
  createdAt: true,
});

export const insertBookingSchema = createInsertSchema(bookings).omit({
  id: true,
  createdAt: true,
});

export const insertTripSchema = createInsertSchema(trips).omit({
  id: true,
});

// ============= SCHEMAS DE RH =============

export const insertEmployeeSchema = createInsertSchema(employees).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  driverLicense: z.string().optional(),
  driverLicenseCategory: z.string().optional(),
  driverLicenseExpiry: z.string().optional(),
});

export const insertEmployeeDependentSchema = createInsertSchema(employeeDependents).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeDocumentSchema = createInsertSchema(employeeDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeOccurrenceSchema = createInsertSchema(employeeOccurrences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeMovementSchema = createInsertSchema(employeeMovements).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeFileSchema = createInsertSchema(employeeFiles).omit({
  id: true,
  createdAt: true,
});

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertVehicle = z.infer<typeof insertVehicleSchema>;
export type Vehicle = typeof vehicles.$inferSelect;

export type InsertDriver = z.infer<typeof insertDriverSchema>;
export type Driver = typeof drivers.$inferSelect;

export type InsertRoute = z.infer<typeof insertRouteSchema>;
export type Route = typeof routes.$inferSelect;

export type InsertBooking = z.infer<typeof insertBookingSchema>;
export type Booking = typeof bookings.$inferSelect;

export type InsertTrip = z.infer<typeof insertTripSchema>;
export type Trip = typeof trips.$inferSelect;

export type LoginData = z.infer<typeof loginSchema>;

// ============= TIPOS DE RH =============

export type InsertEmployee = z.infer<typeof insertEmployeeSchema>;
export type Employee = typeof employees.$inferSelect;

export type InsertEmployeeDependent = z.infer<typeof insertEmployeeDependentSchema>;
export type EmployeeDependent = typeof employeeDependents.$inferSelect;

export type InsertEmployeeDocument = z.infer<typeof insertEmployeeDocumentSchema>;
export type EmployeeDocument = typeof employeeDocuments.$inferSelect;

export type InsertEmployeeOccurrence = z.infer<typeof insertEmployeeOccurrenceSchema>;
export type EmployeeOccurrence = typeof employeeOccurrences.$inferSelect;

export type InsertEmployeeMovement = z.infer<typeof insertEmployeeMovementSchema>;
export type EmployeeMovement = typeof employeeMovements.$inferSelect;

export type InsertEmployeeFile = z.infer<typeof insertEmployeeFileSchema>;
export type EmployeeFile = typeof employeeFiles.$inferSelect;
