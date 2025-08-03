import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, uuid, date, json, serial } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  email: text("email").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull().default("user"), // user, admin, driver
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
  birthDate: date("birth_date"),
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
  admissionDate: date("admission_date"),
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
  inactiveDate: timestamp("inactive_date"),
  reactivationReason: text("reactivation_reason"),
  reactivationDate: timestamp("reactivation_date"),
  statusChangedBy: text("status_changed_by"),
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
  
  documentType: text("document_type").notNull(), // CNH, RG, CPF, Carteira de Trabalho, etc.
  description: text("description").notNull(),
  documentNumber: text("document_number"),
  issuedDate: date("issued_date"),
  expiryDate: date("expiry_date"),
  issuer: text("issuer"), // Órgão emissor
  
  // Arquivo
  filename: text("filename"),
  fileUrl: text("file_url"),
  fileSize: integer("file_size"),
  mimeType: text("mime_type"),
  
  // Controle
  status: text("status").default("active"), // active, expired, renewed
  isActive: boolean("is_active").default(true),
  renewalNotified: boolean("renewal_notified").default(false),
  
  // Histórico de alterações
  previousVersionId: uuid("previous_version_id"),
  changeReason: text("change_reason"), // renovação, correção, etc.
  changedBy: uuid("changed_by").references(() => users.id),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

export const employeeOccurrences = pgTable("employee_occurrences", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  requestedById: text("requested_by_id").notNull(),
  
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

// ============= MÓDULO DE ALMOXARIFADO =============

// 1. ALMOXARIFADO CENTRAL - Materiais
export const centralWarehouseMaterials = pgTable("central_warehouse_materials", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  materialNumber: serial("material_number").unique(),
  description: text("description").notNull(),
  unitType: text("unit_type").notNull(), // pç, kg, m, L, etc.
  currentQuantity: decimal("current_quantity").default("0"),
  minimumStock: decimal("minimum_stock").default("0"),
  addressing: text("addressing"), // endereçamento livre
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 2. ALMOXARIFADO CENTRAL - Entradas
export const centralWarehouseEntries = pgTable("central_warehouse_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  materialId: uuid("material_id").references(() => centralWarehouseMaterials.id).notNull(),
  
  entryType: text("entry_type").notNull(), // entrada_comum, devolucao_servico, devolucao_contratacao, devolucao_normal
  quantity: decimal("quantity").notNull(),
  
  // Para entrada comum
  nfNumber: text("nf_number"),
  purchaseOrderNumber: text("purchase_order_number"),
  supplier: text("supplier"),
  
  // Para devoluções de acautelamento (serviço)
  authenticationCode: text("authentication_code"),
  withdrawalDate: date("withdrawal_date"),
  withdrawerName: text("withdrawer_name"),
  
  // Para devoluções de acautelamento (contratação)
  returnerName: text("returner_name"),
  
  observations: text("observations"),
  
  // Controle de edição
  editReason: text("edit_reason"),
  editedBy: uuid("edited_by").references(() => users.id),
  editedAt: timestamp("edited_at"),
  
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 3. ALMOXARIFADO CENTRAL - Saídas
export const centralWarehouseExits = pgTable("central_warehouse_exits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  exitType: text("exit_type").notNull(), // normal, descarte, acautelamento_servico, acautelamento_contratacao
  vehiclePlate: text("vehicle_plate"),
  withdrawerName: text("withdrawer_name").notNull(),
  observations: text("observations"),
  
  // Para acautelamento de serviço
  authenticationCode: text("authentication_code"), // código único gerado
  
  // Status para acautelamentos
  status: text("status").default("em_andamento"), // em_andamento, vencido, devolvido
  dueDate: date("due_date"), // 15 dias corridos para serviço
  
  // PDF gerado
  pdfGenerated: boolean("pdf_generated").default(false),
  pdfUrl: text("pdf_url"),
  
  // Controle de edição
  editReason: text("edit_reason"),
  editedBy: uuid("edited_by").references(() => users.id),
  editedAt: timestamp("edited_at"),
  
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 4. ALMOXARIFADO CENTRAL - Itens de Saída
export const centralWarehouseExitItems = pgTable("central_warehouse_exit_items", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  exitId: uuid("exit_id").references(() => centralWarehouseExits.id).notNull(),
  materialId: uuid("material_id").references(() => centralWarehouseMaterials.id).notNull(),
  quantity: decimal("quantity").notNull(),
});

// 5. CONTROLE DE ARMAZÉNS - Clientes
export const warehouseClients = pgTable("warehouse_clients", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  code: text("code").unique(),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 6. CONTROLE DE ARMAZÉNS - Materiais dos Clientes
export const clientWarehouseMaterials = pgTable("client_warehouse_materials", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  materialNumber: serial("material_number").unique(),
  description: text("description").notNull(),
  partNumber: text("part_number"),
  unitType: text("unit_type").notNull(),
  clientId: uuid("client_id").references(() => warehouseClients.id).notNull(),
  warehouse: text("warehouse").notNull(), // 1, 2, 3, 4, 5
  addressing: text("addressing"),
  currentQuantity: decimal("current_quantity").default("0"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// 7. CONTROLE DE ARMAZÉNS - Entradas
export const clientWarehouseEntries = pgTable("client_warehouse_entries", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  materialId: uuid("material_id").references(() => clientWarehouseMaterials.id).notNull(),
  
  entryDate: date("entry_date").notNull(),
  quantity: decimal("quantity").notNull(),
  batch: text("batch"),
  referenceNfNumber: text("reference_nf_number").notNull(),
  coverageNfNumber: text("coverage_nf_number"),
  conferentName: text("conferent_name").notNull(),
  unitValue: decimal("unit_value"),
  
  // Upload de NFs
  referenceNfUrl: text("reference_nf_url"),
  coverageNfUrl: text("coverage_nf_url"),
  
  // Status
  status: text("status").default("pendente"), // pendente, finalizada
  
  // Controle de edição
  editReason: text("edit_reason"),
  editedBy: uuid("edited_by").references(() => users.id),
  editedAt: timestamp("edited_at"),
  
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// 8. CONTROLE DE ARMAZÉNS - Saídas
export const clientWarehouseExits = pgTable("client_warehouse_exits", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  materialId: uuid("material_id").references(() => clientWarehouseMaterials.id).notNull(),
  
  exitDate: date("exit_date").notNull(),
  quantity: decimal("quantity").notNull(),
  batch: text("batch"),
  exitNfNumber: text("exit_nf_number").notNull(),
  requester: text("requester").notNull(),
  vehiclePlate: text("vehicle_plate"),
  driverName: text("driver_name"),
  unitValue: decimal("unit_value"),
  observations: text("observations"),
  
  // Upload de NF
  exitNfUrl: text("exit_nf_url"),
  
  // Controle de edição/exclusão
  editReason: text("edit_reason"),
  editedBy: uuid("edited_by").references(() => users.id),
  editedAt: timestamp("edited_at"),
  
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// ============= MÓDULO DE AGENDAMENTO DE CARREAMENTO =============

// Tabela de horários disponíveis para agendamento
export const scheduleSlots = pgTable("schedule_slots", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  date: date("date").notNull(),
  timeSlot: text("time_slot").notNull(), // Formato: "08:00", "09:00", etc.
  isAvailable: boolean("is_available").notNull().default(true),
  maxCapacity: integer("max_capacity").notNull().default(1),
  currentBookings: integer("current_bookings").notNull().default(0),
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
});

// Tabela de agendamentos
export const cargoSchedulings = pgTable("cargo_schedulings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  clientId: uuid("client_id").references(() => externalPersons.id).notNull(),
  slotId: uuid("slot_id").references(() => scheduleSlots.id).notNull(),
  
  // Dados do agendamento
  companyName: text("company_name").notNull(),
  contactPerson: text("contact_person").notNull(),
  contactEmail: text("contact_email").notNull(),
  contactPhone: text("contact_phone"),
  
  // Status e controle
  status: text("status").notNull().default("agendado"), // agendado, confirmado, em_andamento, concluido, cancelado
  notes: text("notes"),
  
  // Dados de conclusão/cancelamento
  completedAt: timestamp("completed_at"),
  completedBy: uuid("completed_by").references(() => users.id),
  canceledAt: timestamp("canceled_at"),
  canceledBy: uuid("canceled_by").references(() => users.id),
  cancellationReason: text("cancellation_reason"),
  managerNotes: text("manager_notes"),
  
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// ============= ALTERAÇÕES NO MÓDULO DE RH - PESSOAS EXTERNAS =============

// Tabela de pessoas externas (clientes, terceirizados)
export const externalPersons = pgTable("external_persons", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Dados básicos
  fullName: text("full_name").notNull(),
  email: text("email").notNull().unique(),
  phone: text("phone"),
  document: text("document"), // CPF ou CNPJ
  
  // Tipo de pessoa externa
  personType: text("person_type").notNull(), // cliente, terceirizado, prestador
  
  // Dados específicos por tipo
  companyName: text("company_name"), // Para clientes
  externalCompany: text("external_company"), // Para terceirizados/prestadores
  position: text("position"), // Cargo/função
  
  // Permissões e acesso
  hasSystemAccess: boolean("has_system_access").notNull().default(false),
  allowedModules: text("allowed_modules").array().default([]), // Array de módulos permitidos
  accessLevel: text("access_level").default("basic"), // basic, advanced
  
  // Status
  status: text("status").notNull().default("ativo"), // ativo, inativo, bloqueado
  inactiveReason: text("inactive_reason"),
  
  // Documentos básicos (para terceirizados)
  basicDocuments: json("basic_documents"),
  
  // Controle
  createdBy: uuid("created_by").references(() => users.id).notNull(),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").default(sql`now()`),
});

// Relacionamentos para agendamento
export const scheduleRelations = relations(scheduleSlots, ({ many }) => ({
  schedulings: many(cargoSchedulings),
}));

export const cargoSchedulingRelations = relations(cargoSchedulings, ({ one }) => ({
  client: one(externalPersons, {
    fields: [cargoSchedulings.clientId],
    references: [externalPersons.id],
  }),
  slot: one(scheduleSlots, {
    fields: [cargoSchedulings.slotId],
    references: [scheduleSlots.id],
  }),
  completedBy: one(users, {
    fields: [cargoSchedulings.completedBy],
    references: [users.id],
  }),
  canceledBy: one(users, {
    fields: [cargoSchedulings.canceledBy],
    references: [users.id],
  }),
}));

export const externalPersonRelations = relations(externalPersons, ({ many, one }) => ({
  schedulings: many(cargoSchedulings),
  createdBy: one(users, {
    fields: [externalPersons.createdBy],
    references: [users.id],
  }),
}));

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

export const insertEmployeeSchema = z.object({
  fullName: z.string().min(1, "Nome é obrigatório"),
  cpf: z.string().min(1, "CPF é obrigatório"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  employeeNumber: z.string().min(1, "Matrícula é obrigatória"),
  position: z.string().min(1, "Cargo é obrigatório"),
  department: z.string().min(1, "Departamento é obrigatório"),
  // Todos os outros campos opcionais
  rg: z.string().optional(),
  rgIssuer: z.string().optional(),
  rgIssueDate: z.string().optional(),
  birthDate: z.string().optional(),
  gender: z.string().optional(),
  maritalStatus: z.string().optional(),
  nationality: z.string().optional(),
  email: z.string().optional(),
  personalEmail: z.string().optional(),
  address: z.string().optional(),
  addressNumber: z.string().optional(),
  complement: z.string().optional(),
  neighborhood: z.string().optional(),
  city: z.string().optional(),
  state: z.string().optional(),
  zipCode: z.string().optional(),
  admissionDate: z.string().optional(),
  dismissalDate: z.string().optional(),
  manager: z.string().optional(),
  workSchedule: z.string().optional(),
  workLocation: z.string().optional(),
  salary: z.number().optional(),
  benefits: z.any().optional(),
  bankAccount: z.string().optional(),
  bank: z.string().optional(),
  bankAgency: z.string().optional(),
  pixKey: z.string().optional(),
  education: z.string().optional(),
  educationInstitution: z.string().optional(),
  educationCourse: z.string().optional(),
  educationStatus: z.string().optional(),
  voterTitle: z.string().optional(),
  militaryService: z.string().optional(),
  workCard: z.string().optional(),
  pis: z.string().optional(),
  driverLicense: z.string().optional(),
  driverLicenseCategory: z.string().optional(),
  driverLicenseExpiry: z.string().optional(),
  status: z.string().optional(),
  inactiveReason: z.string().optional(),
  systemUserId: z.string().optional(),
  profilePhoto: z.string().optional(),
  accessLevel: z.string().optional(),
  allowedModules: z.array(z.string()).optional(),
});

export const insertEmployeeDependentSchema = createInsertSchema(employeeDependents).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeDocumentSchema = createInsertSchema(employeeDocuments).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  filename: true,
  fileUrl: true,
  fileSize: true,
  mimeType: true,
  previousVersionId: true,
  changedBy: true,
});

export const insertEmployeeOccurrenceSchema = createInsertSchema(employeeOccurrences).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  occurrenceDate: z.string(),
  requestedById: z.string(),
  severity: z.enum(["low", "medium", "high"]).optional(),
  actionRequired: z.string().optional(),
  followUpDate: z.string().optional(),
  witnesses: z.string().optional(),
});

export const insertEmployeeMovementSchema = createInsertSchema(employeeMovements).omit({
  id: true,
  createdAt: true,
});

export const insertEmployeeFileSchema = createInsertSchema(employeeFiles).omit({
  id: true,
  createdAt: true,
});

// ============= SCHEMAS DE ALMOXARIFADO =============

// Schemas para Almoxarifado Central
export const insertCentralWarehouseMaterialSchema = createInsertSchema(centralWarehouseMaterials).omit({
  id: true,
  materialNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCentralWarehouseEntrySchema = createInsertSchema(centralWarehouseEntries).omit({
  id: true,
  createdAt: true,
  editedBy: true,
  editedAt: true,
});

export const insertCentralWarehouseExitSchema = createInsertSchema(centralWarehouseExits).omit({
  id: true,
  createdAt: true,
  editedBy: true,
  editedAt: true,
  authenticationCode: true,
  status: true,
  dueDate: true,
  pdfGenerated: true,
  pdfUrl: true,
});

// Schemas para Controle de Armazéns de Clientes
export const insertWarehouseClientSchema = createInsertSchema(warehouseClients).omit({
  id: true,
  createdAt: true,
});

export const insertClientWarehouseMaterialSchema = createInsertSchema(clientWarehouseMaterials).omit({
  id: true,
  materialNumber: true,
  createdAt: true,
  updatedAt: true,
});

export const insertClientWarehouseEntrySchema = createInsertSchema(clientWarehouseEntries).omit({
  id: true,
  createdAt: true,
  editedBy: true,
  editedAt: true,
  status: true,
});

export const insertClientWarehouseExitSchema = createInsertSchema(clientWarehouseExits).omit({
  id: true,
  createdAt: true,
  editedBy: true,
  editedAt: true,
});

// ============= SCHEMAS DE AGENDAMENTO DE CARREAMENTO =============

export const insertExternalPersonSchema = createInsertSchema(externalPersons).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  createdBy: true,
}).extend({
  fullName: z.string().min(1, "Nome completo é obrigatório"),
  email: z.string().email("Email deve ser válido"),
  personType: z.enum(["cliente", "terceirizado", "prestador"]),
  companyName: z.string().optional(),
  externalCompany: z.string().optional(),
  phone: z.string().optional(),
  document: z.string().optional(),
  position: z.string().optional(),
  hasSystemAccess: z.boolean().default(false),
  allowedModules: z.array(z.string()).default([]),
  accessLevel: z.string().default("basic"),
  status: z.string().default("ativo"),
});

export const insertScheduleSlotSchema = createInsertSchema(scheduleSlots).omit({
  id: true,
  createdAt: true,
  createdBy: true,
}).extend({
  date: z.string(),
  timeSlot: z.string().min(1, "Horário é obrigatório"),
  isAvailable: z.boolean().default(true),
  maxCapacity: z.number().min(1).default(1),
});

export const insertCargoSchedulingSchema = createInsertSchema(cargoSchedulings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  completedAt: true,
  completedBy: true,
  canceledAt: true,
  canceledBy: true,
}).extend({
  companyName: z.string().min(1, "Nome da empresa é obrigatório"),
  contactPerson: z.string().min(1, "Pessoa de contato é obrigatória"),
  contactEmail: z.string().email("Email deve ser válido"),
  contactPhone: z.string().optional(),
  notes: z.string().optional(),
  status: z.string().default("agendado"),
});

// Tipos TypeScript
export type CentralWarehouseMaterial = typeof centralWarehouseMaterials.$inferSelect;
export type InsertCentralWarehouseMaterial = z.infer<typeof insertCentralWarehouseMaterialSchema>;

export type CentralWarehouseEntry = typeof centralWarehouseEntries.$inferSelect;
export type InsertCentralWarehouseEntry = z.infer<typeof insertCentralWarehouseEntrySchema>;

export type CentralWarehouseExit = typeof centralWarehouseExits.$inferSelect;
export type InsertCentralWarehouseExit = z.infer<typeof insertCentralWarehouseExitSchema>;

export type CentralWarehouseExitItem = typeof centralWarehouseExitItems.$inferSelect;

export type WarehouseClient = typeof warehouseClients.$inferSelect;
export type InsertWarehouseClient = z.infer<typeof insertWarehouseClientSchema>;

export type ClientWarehouseMaterial = typeof clientWarehouseMaterials.$inferSelect;
export type InsertClientWarehouseMaterial = z.infer<typeof insertClientWarehouseMaterialSchema>;

export type ClientWarehouseEntry = typeof clientWarehouseEntries.$inferSelect;
export type InsertClientWarehouseEntry = z.infer<typeof insertClientWarehouseEntrySchema>;

export type ClientWarehouseExit = typeof clientWarehouseExits.$inferSelect;
export type InsertClientWarehouseExit = z.infer<typeof insertClientWarehouseExitSchema>;

// Tipos para agendamento de carreamento
export type ExternalPerson = typeof externalPersons.$inferSelect;
export type InsertExternalPerson = z.infer<typeof insertExternalPersonSchema>;

export type ScheduleSlot = typeof scheduleSlots.$inferSelect;
export type InsertScheduleSlot = z.infer<typeof insertScheduleSlotSchema>;

export type CargoScheduling = typeof cargoSchedulings.$inferSelect;
export type InsertCargoScheduling = z.infer<typeof insertCargoSchedulingSchema>;

// Login schema
export const loginSchema = z.object({
  email: z.string().email("Email inválido"),
  password: z.string().min(6, "Senha deve ter pelo menos 6 caracteres"),
});

// Types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

// Prancha Services table
export const pranchaServices = pgTable("prancha_services", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  vehicleId: varchar("vehicle_id").notNull(),
  vehiclePlate: varchar("vehicle_plate").notNull(),
  vehicleName: varchar("vehicle_name").notNull(),
  implementId: varchar("implement_id").notNull(),
  implementPlate: varchar("implement_plate").notNull(),
  implementName: varchar("implement_name").notNull(),
  driverId: varchar("driver_id").notNull(),
  driverName: varchar("driver_name").notNull(),
  driverRegistration: varchar("driver_registration").notNull(),
  ocNumber: varchar("oc_number").notNull(),
  startDate: varchar("start_date").notNull(),
  endDate: varchar("end_date"),
  serviceDays: integer("service_days").default(0),
  status: varchar("status", { enum: ["aguardando", "confirmado", "negado", "aditado", "em_andamento", "finalizado"] }).default("aguardando"),
  hrStatus: varchar("hr_status", { enum: ["nao_verificado", "verificado"] }).default("nao_verificado"),
  observations: text("observations"),
  isActive: boolean("is_active").default(false), // Controla se o serviço está ativo para o motorista
  finalizationNotes: text("finalization_notes"), // Notas de finalização
  finalizationAttachment: varchar("finalization_attachment"), // Caminho do anexo
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Service Logs table  
export const serviceLogs = pgTable("service_logs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  serviceId: varchar("service_id").notNull().references(() => pranchaServices.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(),
  userName: varchar("user_name").notNull(),
  userRole: varchar("user_role").notNull(),
  justification: text("justification"),
  createdAt: timestamp("created_at").defaultNow(),
});

export type PranchaService = typeof pranchaServices.$inferSelect;
export type InsertPranchaService = typeof pranchaServices.$inferInsert;
export type ServiceLog = typeof serviceLogs.$inferSelect;
export type InsertServiceLog = typeof serviceLogs.$inferInsert;

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

// Prancha Service schemas
export const insertPranchaServiceSchema = createInsertSchema(pranchaServices).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  hrStatus: true
});

export type InsertPranchaServiceZod = z.infer<typeof insertPranchaServiceSchema>;


// ============= MÓDULO DE SINISTROS =============

// Tabela de sinistros (incidentes/acidentes)
export const sinistros = pgTable("sinistros", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  tipo: varchar("tipo").notNull(), // veicular, trabalhista_cat, interno_base, externo_cliente, ambiental, falha_epi, quase_acidente
  classificacao: varchar("classificacao"), // erro_humano, falha_tecnica, omissao_epi, etc
  placaTracao: varchar("placa_tracao"), // nova estrutura para sinistros veiculares
  tipoColisao: varchar("tipo_colisao"),
  percepcaoGravidade: varchar("percepcao_gravidade"),
  quemSofreuAvaria: varchar("quem_sofreu_avaria"),
  condicoesTrajeto: varchar("condicoes_trajeto"),
  nomeEnvolvido: varchar("nome_envolvido").notNull(),
  cargoEnvolvido: varchar("cargo_envolvido"),
  dataOcorrido: varchar("data_ocorrido").notNull(),
  horaOcorrido: varchar("hora_ocorrido").notNull(),
  localEndereco: text("local_endereco").notNull(), // mudou de local para localEndereco
  observacoes: text("observacoes").notNull(), // mudou de descricao para observacoes
  vitimas: boolean("vitimas").default(false),
  descricaoVitimas: text("descricao_vitimas"),
  testemunhas: text("testemunhas"),
  condicoesTempo: varchar("condicoes_tempo"),
  condicoesPista: varchar("condicoes_pista"),
  status: varchar("status").default("aberto"), // aberto, em_andamento, finalizado
  acaoCorretiva: text("acao_corretiva"),
  acaoPreventiva: text("acao_preventiva"),
  observacoesInternas: text("observacoes_internas"),
  registradoPor: varchar("registrado_por").notNull(), // ID do usuário que registrou
  nomeRegistrador: varchar("nome_registrador").notNull(),
  cargoRegistrador: varchar("cargo_registrador").notNull(),
  finalizadoPor: varchar("finalizado_por"), // ID do usuário QSMS que finalizou
  nomeFinalizador: varchar("nome_finalizador"),
  dataFinalizacao: timestamp("data_finalizacao"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de documentos/anexos dos sinistros
export const sinistroDocuments = pgTable("sinistro_documents", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sinistroId: varchar("sinistro_id").notNull().references(() => sinistros.id, { onDelete: "cascade" }),
  tipoDocumento: varchar("tipo_documento").notNull(), // foto_local, brat, cat, ficha_saude, relatorio_qsms, checklist, outros
  nomeArquivo: varchar("nome_arquivo").notNull(),
  caminhoArquivo: varchar("caminho_arquivo").notNull(),
  tamanhoArquivo: integer("tamanho_arquivo"),
  tipoMime: varchar("tipo_mime"),
  uploadedBy: varchar("uploaded_by").notNull(),
  nomeUploader: varchar("nome_uploader").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de histórico de alterações dos sinistros
export const sinistroHistory = pgTable("sinistro_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  sinistroId: varchar("sinistro_id").notNull().references(() => sinistros.id, { onDelete: "cascade" }),
  tipoAlteracao: varchar("tipo_alteracao").notNull(), // criacao, edicao, upload_documento, mudanca_status
  campoAlterado: varchar("campo_alteracao"),
  valorAnterior: text("valor_anterior"),
  valorNovo: text("valor_novo"),
  usuarioId: varchar("usuario_id").notNull(),
  nomeUsuario: varchar("nome_usuario").notNull(),
  observacao: text("observacao"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations para sinistros
export const sinistrosRelations = relations(sinistros, ({ many }) => ({
  documents: many(sinistroDocuments),
  history: many(sinistroHistory),
}));

export const sinistroDocumentsRelations = relations(sinistroDocuments, ({ one }) => ({
  sinistro: one(sinistros, {
    fields: [sinistroDocuments.sinistroId],
    references: [sinistros.id],
  }),
}));

export const sinistroHistoryRelations = relations(sinistroHistory, ({ one }) => ({
  sinistro: one(sinistros, {
    fields: [sinistroHistory.sinistroId],
    references: [sinistros.id],
  }),
}));

// Schemas para validação
export const insertSinistroSchema = createInsertSchema(sinistros).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  acaoCorretiva: true,
  acaoPreventiva: true,
  observacoesInternas: true,
  finalizadoPor: true,
  dataFinalizacao: true,
  nomeFinalizador: true
}).extend({
  // Campos obrigatórios
  tipo: z.string().min(1, "Tipo é obrigatório"),
  nomeEnvolvido: z.string().min(1, "Nome do envolvido é obrigatório"),
  dataOcorrido: z.string().min(1, "Data é obrigatória"),
  horaOcorrido: z.string().min(1, "Hora é obrigatória"),
  localEndereco: z.string().min(1, "Local é obrigatório"),
  observacoes: z.string().min(1, "Observações são obrigatórias"),
  registradoPor: z.string().min(1, "Registrado por é obrigatório"),
  nomeRegistrador: z.string().min(1, "Nome do registrador é obrigatório"),
  cargoRegistrador: z.string().min(1, "Cargo do registrador é obrigatório"),
  
  // Campos opcionais
  classificacao: z.string().optional(),
  placaTracao: z.string().optional(),
  tipoColisao: z.string().optional(),
  percepcaoGravidade: z.string().optional(),
  quemSofreuAvaria: z.string().optional(),
  condicoesTrajeto: z.string().optional(),
  cargoEnvolvido: z.string().optional(),
  vitimas: z.boolean().default(false),
  descricaoVitimas: z.string().optional(),
  testemunhas: z.string().optional(),
  condicoesTempo: z.string().optional(),
  condicoesPista: z.string().optional(),
});

export const insertSinistroDocumentSchema = createInsertSchema(sinistroDocuments).omit({
  id: true,
  createdAt: true
});

export const insertSinistroHistorySchema = createInsertSchema(sinistroHistory).omit({
  id: true,
  createdAt: true
});

export type InsertSinistro = typeof sinistros.$inferInsert;
export type Sinistro = typeof sinistros.$inferSelect;
export type InsertSinistroDocument = typeof sinistroDocuments.$inferInsert;
export type SinistroDocument = typeof sinistroDocuments.$inferSelect;
export type InsertSinistroHistory = typeof sinistroHistory.$inferInsert;
export type SinistroHistory = typeof sinistroHistory.$inferSelect;

// ============= MÓDULO DE CONTROLE DE PNEUS =============

// Tabela principal de pneus
export const tires = pgTable("tires", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Dados básicos do pneu
  fireNumber: varchar("fire_number").notNull().unique(), // Número do fogo (código único permanente)
  brand: varchar("brand").notNull(), // Marca
  model: varchar("model").notNull(), // Modelo
  size: varchar("size").notNull(), // Medida
  type: varchar("type").notNull(), // direcional, tração, arrasto, misto
  
  // Dados financeiros
  purchaseValue: decimal("purchase_value", { precision: 10, scale: 2 }), // Valor de compra
  purchaseDate: date("purchase_date"), // Data de compra
  
  // Dados técnicos
  manufacturingYear: integer("manufacturing_year"), // Ano de fabricação
  currentLife: integer("current_life").default(1), // Vida atual (inicial: 1)
  status: varchar("status").default("ativo"), // ativo, em_uso, recapagem, perda, vendido, descartado
  
  // Documentos
  invoiceDocument: varchar("invoice_document"), // Upload de nota fiscal
  
  // Controle
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de movimentações de pneus
export const tireMovements = pgTable("tire_movements", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Pneu e veículo
  tireId: varchar("tire_id").notNull().references(() => tires.id, { onDelete: "cascade" }),
  fireNumber: varchar("fire_number").notNull(),
  vehicleId: varchar("vehicle_id"),
  vehiclePlate: varchar("vehicle_plate"),
  
  // Tipo de movimentação
  movementType: varchar("movement_type").notNull(), // entrada, instalacao, rodizio, recapagem, descarte, venda, perda
  
  // Posição no veículo
  axle: varchar("axle"), // Eixo
  axleNumber: integer("axle_number"), // Número do eixo
  side: varchar("side"), // interno/externo, direito/esquerdo/central
  
  // Dados técnicos
  currentKm: integer("current_km"), // KM no momento
  twi: decimal("twi", { precision: 3, scale: 1 }), // TWI (opcional)
  lifeBefore: integer("life_before"), // Vida antes
  lifeAfter: integer("life_after"), // Vida depois
  
  // Recapagem
  recapType: varchar("recap_type"), // tipo de recapagem (se aplicável)
  recapCompany: varchar("recap_company"), // empresa recapadora
  recapValue: decimal("recap_value", { precision: 10, scale: 2 }), // valor da recapagem
  
  // Observações
  reason: text("reason"), // Motivo da movimentação
  notes: text("notes"), // Observações gerais
  
  // Documentos
  document: varchar("document"), // Upload de comprovante/documento
  
  // Usuário responsável
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name").notNull(),
  
  // Controle
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de rodízios
export const tireRotations = pgTable("tire_rotations", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Pneu e veículo
  tireId: varchar("tire_id").notNull().references(() => tires.id, { onDelete: "cascade" }),
  fireNumber: varchar("fire_number").notNull(),
  vehicleId: varchar("vehicle_id").notNull(),
  vehiclePlate: varchar("vehicle_plate").notNull(),
  
  // Posições
  axleOrigin: varchar("axle_origin").notNull(), // Eixo origem
  axleDestination: varchar("axle_destination").notNull(), // Eixo destino
  sideOrigin: varchar("side_origin").notNull(), // Lado origem
  sideDestination: varchar("side_destination").notNull(), // Lado destino
  
  // Dados
  vehicleKm: integer("vehicle_km").notNull(), // KM do veículo
  twi: decimal("twi", { precision: 3, scale: 1 }), // TWI (opcional)
  
  // Usuário responsável
  userId: varchar("user_id").notNull(),
  userName: varchar("user_name").notNull(),
  
  // Controle
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de alertas automáticos de pneus
export const tireAlerts = pgTable("tire_alerts", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Pneu
  tireId: varchar("tire_id").notNull().references(() => tires.id, { onDelete: "cascade" }),
  fireNumber: varchar("fire_number").notNull(),
  
  // Tipo de alerta
  alertType: varchar("alert_type").notNull(), // rodizio_km, vida_util, recapagem_necessaria
  
  // Dados do alerta
  currentValue: integer("current_value"), // Valor atual (KM, vida, etc.)
  limitValue: integer("limit_value"), // Valor limite
  message: text("message").notNull(), // Mensagem do alerta
  
  // Status
  status: varchar("status").default("ativo"), // ativo, resolvido, ignorado
  resolvedAt: timestamp("resolved_at"),
  resolvedBy: varchar("resolved_by"),
  
  // Controle
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations para pneus
export const tiresRelations = relations(tires, ({ many }) => ({
  movements: many(tireMovements),
  rotations: many(tireRotations),
  alerts: many(tireAlerts),
}));

export const tireMovementsRelations = relations(tireMovements, ({ one }) => ({
  tire: one(tires, {
    fields: [tireMovements.tireId],
    references: [tires.id],
  }),
}));

export const tireRotationsRelations = relations(tireRotations, ({ one }) => ({
  tire: one(tires, {
    fields: [tireRotations.tireId],
    references: [tires.id],
  }),
}));

export const tireAlertsRelations = relations(tireAlerts, ({ one }) => ({
  tire: one(tires, {
    fields: [tireAlerts.tireId],
    references: [tires.id],
  }),
}));

// Schemas para validação de pneus
export const insertTireSchema = createInsertSchema(tires).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
}).extend({
  fireNumber: z.string().min(1, "Número do fogo é obrigatório"),
  brand: z.string().min(1, "Marca é obrigatória"),
  model: z.string().min(1, "Modelo é obrigatório"),
  size: z.string().min(1, "Medida é obrigatória"),
  type: z.enum(["direcional", "tracao", "arrasto", "misto"], {
    required_error: "Tipo é obrigatório"
  }),
  purchaseValue: z.number().min(0, "Valor deve ser positivo").optional(),
  currentLife: z.number().min(1, "Vida atual deve ser ao menos 1").optional(),
  manufacturingYear: z.number().min(2000, "Ano inválido").max(new Date().getFullYear(), "Ano não pode ser futuro").optional(),
});

export const insertTireMovementSchema = createInsertSchema(tireMovements).omit({
  id: true,
  createdAt: true,
}).extend({
  tireId: z.string().min(1, "Pneu é obrigatório"),
  fireNumber: z.string().min(1, "Número do fogo é obrigatório"),
  movementType: z.enum(["entrada", "instalacao", "rodizio", "recapagem", "descarte", "venda", "perda"], {
    required_error: "Tipo de movimentação é obrigatório"
  }),
  reason: z.string().min(1, "Motivo é obrigatório"),
  userId: z.string().min(1, "Usuário é obrigatório"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
});

export const insertTireRotationSchema = createInsertSchema(tireRotations).omit({
  id: true,
  createdAt: true,
}).extend({
  tireId: z.string().min(1, "Pneu é obrigatório"),
  fireNumber: z.string().min(1, "Número do fogo é obrigatório"),
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  vehiclePlate: z.string().min(1, "Placa é obrigatória"),
  axleOrigin: z.string().min(1, "Eixo origem é obrigatório"),
  axleDestination: z.string().min(1, "Eixo destino é obrigatório"),
  sideOrigin: z.string().min(1, "Lado origem é obrigatório"),
  sideDestination: z.string().min(1, "Lado destino é obrigatório"),
  vehicleKm: z.number().min(0, "KM deve ser positivo"),
  userId: z.string().min(1, "Usuário é obrigatório"),
  userName: z.string().min(1, "Nome do usuário é obrigatório"),
});

// Tipos para pneus
export type InsertTire = typeof tires.$inferInsert;
export type Tire = typeof tires.$inferSelect;
export type InsertTireMovement = typeof tireMovements.$inferInsert;
export type TireMovement = typeof tireMovements.$inferSelect;
export type InsertTireRotation = typeof tireRotations.$inferInsert;
export type TireRotation = typeof tireRotations.$inferSelect;
export type TireAlert = typeof tireAlerts.$inferSelect;

// ============= MÓDULO DE CHECKLISTS =============

// Tabela principal de checklists de veículos
export const vehicleChecklists = pgTable("vehicle_checklists", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  
  // Informações do veículo
  vehicleId: varchar("vehicle_id").notNull(),
  vehiclePlate: varchar("vehicle_plate").notNull(),
  vehicleName: varchar("vehicle_name").notNull(),
  implementId: varchar("implement_id"),
  implementPlate: varchar("implement_plate"),
  implementName: varchar("implement_name"),
  
  // Informações do motorista
  driverId: varchar("driver_id").notNull(),
  driverName: varchar("driver_name").notNull(),
  driverEmployeeNumber: varchar("driver_employee_number"),
  
  // Dados da viagem
  baseOrigin: varchar("base_origin").notNull(), // Base de origem
  baseDestination: varchar("base_destination"), // Base de destino
  exitDate: varchar("exit_date").notNull(),
  exitTime: varchar("exit_time").notNull(),
  returnDate: varchar("return_date"),
  returnTime: varchar("return_time"),
  exitKm: integer("exit_km").notNull(),
  returnKm: integer("return_km"),
  
  // Portaria
  exitGatekeeper: varchar("exit_gatekeeper"), // Nome do porteiro na saída
  returnGatekeeper: varchar("return_gatekeeper"), // Nome do porteiro no retorno
  
  // Checklist de saída (JSON com os itens verificados)
  exitChecklist: json("exit_checklist").notNull(), // {documentos: true, pneus: true, etc}
  exitObservations: text("exit_observations"),
  exitPhotos: text("exit_photos").array(), // Array de URLs das fotos
  
  // Checklist de retorno (JSON com os itens verificados)
  returnChecklist: json("return_checklist"), // {documentos: true, pneus: true, etc}
  returnObservations: text("return_observations"),
  returnPhotos: text("return_photos").array(), // Array de URLs das fotos
  
  // Status e verificação
  status: varchar("status").notNull().default("saida_registrada"), // saida_registrada, viagem_em_andamento, retorno_registrado, finalizado
  verificationStatus: varchar("verification_status").notNull().default("nao_verificado"), // nao_verificado, verificado
  verifiedBy: varchar("verified_by"), // ID do usuário que verificou
  verifiedByName: varchar("verified_by_name"), // Nome do usuário que verificou
  verificationDate: timestamp("verification_date"),
  verificationNotes: text("verification_notes"),
  
  // Permissões de acesso (setores que podem visualizar)
  accessDepartments: text("access_departments").array().default(sql`ARRAY['frota', 'manutencao', 'seguranca', 'portaria']`),
  
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Tabela de itens de checklist padrão
export const checklistItems = pgTable("checklist_items", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  category: varchar("category").notNull(), // documentos, equipamentos, pneus, manutencao, combustivel, etc
  itemName: varchar("item_name").notNull(), // "CNH válida", "Pneus calibrados", etc
  description: text("description"),
  mandatory: boolean("mandatory").default(true),
  vehicleType: varchar("vehicle_type"), // Para qual tipo de veículo se aplica
  order: integer("order").default(0), // Ordem de exibição
  active: boolean("active").default(true),
  createdAt: timestamp("created_at").defaultNow(),
});

// Tabela de histórico de ações nos checklists
export const checklistHistory = pgTable("checklist_history", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  checklistId: varchar("checklist_id").notNull().references(() => vehicleChecklists.id, { onDelete: "cascade" }),
  action: varchar("action").notNull(), // criacao, verificacao, edicao, exportacao
  performedBy: varchar("performed_by").notNull(),
  performedByName: varchar("performed_by_name").notNull(),
  department: varchar("department"),
  details: text("details"),
  createdAt: timestamp("created_at").defaultNow(),
});

// Relations para checklists
export const vehicleChecklistsRelations = relations(vehicleChecklists, ({ many }) => ({
  history: many(checklistHistory),
}));

export const checklistHistoryRelations = relations(checklistHistory, ({ one }) => ({
  checklist: one(vehicleChecklists, {
    fields: [checklistHistory.checklistId],
    references: [vehicleChecklists.id],
  }),
}));

// Schemas para validação
export const insertVehicleChecklistSchema = createInsertSchema(vehicleChecklists).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  verificationStatus: true,
  verifiedBy: true,
  verifiedByName: true,
  verificationDate: true,
  verificationNotes: true,
}).extend({
  // Campos obrigatórios
  vehicleId: z.string().min(1, "Veículo é obrigatório"),
  vehiclePlate: z.string().min(1, "Placa do veículo é obrigatória"),
  vehicleName: z.string().min(1, "Nome do veículo é obrigatório"),
  driverId: z.string().min(1, "Motorista é obrigatório"),
  driverName: z.string().min(1, "Nome do motorista é obrigatório"),
  baseOrigin: z.string().min(1, "Base de origem é obrigatória"),
  exitDate: z.string().min(1, "Data de saída é obrigatória"),
  exitTime: z.string().min(1, "Hora de saída é obrigatória"),
  exitKm: z.number().min(0, "KM de saída deve ser positivo"),
  exitChecklist: z.any(), // JSON object
  
  // Campos opcionais
  implementId: z.string().optional(),
  implementPlate: z.string().optional(),
  implementName: z.string().optional(),
  baseDestination: z.string().optional(),
  returnDate: z.string().optional(),
  returnTime: z.string().optional(),
  returnKm: z.number().optional(),
  exitObservations: z.string().optional(),
  exitPhotos: z.array(z.string()).optional(),
  returnChecklist: z.any().optional(),
  returnObservations: z.string().optional(),
  returnPhotos: z.array(z.string()).optional(),
  exitGatekeeper: z.string().optional(),
  returnGatekeeper: z.string().optional(),
});

export const insertChecklistItemSchema = createInsertSchema(checklistItems).omit({
  id: true,
  createdAt: true,
});

export const insertChecklistHistorySchema = createInsertSchema(checklistHistory).omit({
  id: true,
  createdAt: true,
});

export type InsertVehicleChecklist = typeof vehicleChecklists.$inferInsert;
export type VehicleChecklist = typeof vehicleChecklists.$inferSelect;
export type InsertChecklistItem = typeof checklistItems.$inferInsert;
export type ChecklistItem = typeof checklistItems.$inferSelect;
export type InsertChecklistHistory = typeof checklistHistory.$inferInsert;
export type ChecklistHistory = typeof checklistHistory.$inferSelect;

// ============= MÓDULO DE CONTROLE DE ACESSO - CPF E QR CODE =============

// Tabela para visitantes (simplificada - apenas CPF)
export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  name: text("name").notNull(),
  cpf: text("cpf").notNull().unique(),
  photo: text("photo"), // Base64 ou URL da foto tipo documento
  totalVisits: integer("total_visits").notNull().default(0),
  lastVisit: timestamp("last_visit"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabela para QR Codes dos funcionários
export const employeeQrCodes = pgTable("employee_qr_codes", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  employeeId: uuid("employee_id").references(() => employees.id).notNull(),
  cpf: text("cpf").notNull(),
  qrCodeData: text("qr_code_data").notNull().unique(), // Chave baseada em CPF
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  expiresAt: timestamp("expires_at"), // Opcional - data de expiração
});

// Tabela para controle de acesso/logs (atualizada para QR Code)
export const accessLogs = pgTable("access_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  personType: text("person_type").notNull(), // 'employee' ou 'visitor'
  personId: uuid("person_id").notNull(),
  personName: text("person_name").notNull(),
  personCpf: text("person_cpf").notNull(),
  direction: text("direction").notNull(), // 'entry' ou 'exit'
  accessMethod: text("access_method").notNull(), // 'qrcode', 'manual'
  location: text("location").default("Portaria Principal"),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

// Relations para controle de acesso
export const visitorsRelations = relations(visitors, ({ many }) => ({
  accessLogs: many(accessLogs),
}));

export const employeeQrCodesRelations = relations(employeeQrCodes, ({ one }) => ({
  employee: one(employees, {
    fields: [employeeQrCodes.employeeId],
    references: [employees.id],
  }),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  visitor: one(visitors, {
    fields: [accessLogs.personId],
    references: [visitors.id],
  }),
  employee: one(employees, {
    fields: [accessLogs.personId],
    references: [employees.id],
  }),
}));

// Schemas para validação - Controle de Acesso
export const insertVisitorSchema = createInsertSchema(visitors).omit({
  id: true,
  totalVisits: true,
  lastVisit: true,
  isActive: true,
  createdAt: true,
  updatedAt: true,
});

export const insertEmployeeQrCodeSchema = createInsertSchema(employeeQrCodes).omit({
  id: true,
  createdAt: true,
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({
  id: true,
  timestamp: true,
});

// Types para controle de acesso
export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

export type InsertEmployeeQrCode = z.infer<typeof insertEmployeeQrCodeSchema>;
export type EmployeeQrCode = typeof employeeQrCodes.$inferSelect;

export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;

// ============= MÓDULO DE MANUTENÇÃO =============

// Tabela de requisições/ordens de serviço de manutenção
export const maintenanceRequests = pgTable("maintenance_requests", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  orderNumber: varchar("order_number").unique().notNull(), // OS-2025-00001 format
  vehicleId: varchar("vehicle_id").references(() => vehicles.id).notNull(),
  driverId: varchar("driver_id").references(() => drivers.id),
  requestType: varchar("request_type").notNull(), // 'preventive' | 'corrective'
  description: text("description"),
  preventiveOrder: integer("preventive_order"), // 1-12 for preventive
  preventiveLevel: varchar("preventive_level"), // M1-M5 for preventive
  status: varchar("status").default("open").notNull(), // 'open' | 'scheduled' | 'in_progress' | 'completed' | 'closed'
  maintenanceType: varchar("maintenance_type"), // 'internal' | 'external'
  maintenanceClassification: varchar("maintenance_classification"), // 'mechanical' | 'electrical' | 'structural' | 'accessories' | 'painting' | 'brake' | 'air_conditioning' | 'bodywork'
  mechanic: varchar("mechanic"),
  supplier: varchar("supplier"),
  expectedReleaseDate: timestamp("expected_release_date"),
  startDate: timestamp("start_date"),
  endDate: timestamp("end_date"),
  daysStoped: integer("days_stoped").default(0),
  servicesPerformed: text("services_performed"),
  partsUsed: text("parts_used"),
  observations: text("observations"),
  attachments: text("attachments").array(),
  createdBy: varchar("created_by").references(() => users.id),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MaintenanceRequest = typeof maintenanceRequests.$inferSelect;
export type InsertMaintenanceRequest = typeof maintenanceRequests.$inferInsert;

// Tabela de custos de manutenção
export const maintenanceCosts = pgTable("maintenance_costs", {
  id: varchar("id").primaryKey().default(sql`gen_random_uuid()`),
  maintenanceRequestId: varchar("maintenance_request_id").references(() => maintenanceRequests.id),
  vehicleId: varchar("vehicle_id").references(() => vehicles.id),
  invoiceNumber: varchar("invoice_number").notNull(),
  invoiceDate: timestamp("invoice_date").notNull(),
  supplier: varchar("supplier").notNull(),
  serviceType: varchar("service_type").notNull(), // 'preventive' | 'corrective'
  description: text("description").notNull(),
  classification: varchar("classification").notNull(), // Predefined classifications
  costGroup: varchar("cost_group").notNull(), // 'fuel' | 'parts' | 'contracts' | 'services' | 'tires' | 'washing'
  quantity: decimal("quantity", { precision: 10, scale: 2 }).notNull(),
  unitValue: decimal("unit_value", { precision: 10, scale: 2 }).notNull(),
  totalValue: decimal("total_value", { precision: 10, scale: 2 }).notNull(),
  attachment: varchar("attachment"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export type MaintenanceCost = typeof maintenanceCosts.$inferSelect;
export type InsertMaintenanceCost = typeof maintenanceCosts.$inferInsert;




