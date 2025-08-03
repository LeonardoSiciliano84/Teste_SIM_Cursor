import { sql, relations } from "drizzle-orm";
import { pgTable, text, varchar, timestamp, decimal, integer, boolean, uuid, date, json } from "drizzle-orm/pg-core";
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

// ============= MÓDULO DE CONTROLE DE ACESSO - RECONHECIMENTO FACIAL =============

// Tabela para encodings faciais
export const facialEncodings = pgTable("facial_encodings", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  personType: text("person_type").notNull(), // 'employee' ou 'visitor'
  personId: uuid("person_id").notNull(),
  encodingData: json("encoding_data").notNull(), // Array de 128 ou 512 dimensões
  confidence: decimal("confidence", { precision: 4, scale: 2 }),
  captureQuality: text("capture_quality"), // 'excellent', 'good', 'acceptable'
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabela para visitantes
export const visitors = pgTable("visitors", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  cpf: text("cpf").notNull().unique(),
  name: text("name").notNull(),
  company: text("company"), // Campo opcional
  purpose: text("purpose"), // Motivo da visita - campo opcional
  vehiclePlate: text("vehicle_plate"), // Placa do veículo - campo opcional
  totalVisits: integer("total_visits").notNull().default(0),
  lastVisit: timestamp("last_visit"),
  isActive: boolean("is_active").notNull().default(true),
  createdAt: timestamp("created_at").notNull().default(sql`now()`),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabela para controle de acesso/logs
export const accessLogs = pgTable("access_logs", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  personType: text("person_type").notNull(), // 'employee' ou 'visitor'
  personId: uuid("person_id").notNull(),
  personName: text("person_name").notNull(),
  direction: text("direction").notNull(), // 'entry' ou 'exit'
  accessMethod: text("access_method").notNull(), // 'facial', 'manual', 'card'
  recognitionConfidence: decimal("recognition_confidence", { precision: 4, scale: 2 }),
  gatekeeperId: uuid("gatekeeper_id").references(() => users.id),
  gatekeeperName: text("gatekeeper_name"),
  visitPurpose: text("visit_purpose"), // Para visitantes
  responsiblePerson: text("responsible_person"), // Para visitantes
  vehiclePlate: text("vehicle_plate"),
  badgeNumber: text("badge_number"),
  observations: text("observations"),
  location: text("location").default("Portaria Principal"),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

// Tabela para configurações do sistema de portaria
export const gateSystemConfig = pgTable("gate_system_config", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  key: text("key").notNull().unique(),
  value: text("value").notNull(),
  description: text("description"),
  category: text("category"), // 'facial', 'security', 'general'
  updatedBy: uuid("updated_by").references(() => users.id),
  updatedAt: timestamp("updated_at").notNull().default(sql`now()`),
});

// Tabela para crachás temporários
export const temporaryBadges = pgTable("temporary_badges", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  badgeNumber: text("badge_number").notNull().unique(),
  visitorId: uuid("visitor_id").references(() => visitors.id),
  visitorName: text("visitor_name").notNull(),
  company: text("company"),
  visitPurpose: text("visit_purpose").notNull(),
  responsiblePerson: text("responsible_person").notNull(),
  vehiclePlate: text("vehicle_plate"),
  issueTime: timestamp("issue_time").notNull().default(sql`now()`),
  expectedReturn: timestamp("expected_return"),
  actualReturn: timestamp("actual_return"),
  status: text("status").notNull().default("active"), // 'active', 'returned', 'expired'
  issuedBy: uuid("issued_by").references(() => users.id),
  returnedBy: uuid("returned_by").references(() => users.id),
});

// Histórico de tentativas de reconhecimento facial
export const recognitionAttempts = pgTable("recognition_attempts", {
  id: uuid("id").primaryKey().default(sql`gen_random_uuid()`),
  attemptType: text("attempt_type").notNull(), // 'recognition', 'enrollment'
  success: boolean("success").notNull(),
  personType: text("person_type"), // 'employee', 'visitor', 'unknown'
  personId: uuid("person_id"),
  confidence: decimal("confidence", { precision: 4, scale: 2 }),
  errorReason: text("error_reason"),
  processingTime: integer("processing_time"), // em millisegundos
  deviceInfo: json("device_info"),
  timestamp: timestamp("timestamp").notNull().default(sql`now()`),
});

// Relations para controle de acesso
export const facialEncodingsRelations = relations(facialEncodings, ({ one }) => ({
  visitor: one(visitors, {
    fields: [facialEncodings.personId],
    references: [visitors.id],
  }),
  employee: one(employees, {
    fields: [facialEncodings.personId],
    references: [employees.id],
  }),
}));

export const visitorsRelations = relations(visitors, ({ many }) => ({
  facialEncodings: many(facialEncodings),
  accessLogs: many(accessLogs),
  badges: many(temporaryBadges),
}));

export const accessLogsRelations = relations(accessLogs, ({ one }) => ({
  gatekeeper: one(users, {
    fields: [accessLogs.gatekeeperId],
    references: [users.id],
  }),
  visitor: one(visitors, {
    fields: [accessLogs.personId],
    references: [visitors.id],
  }),
  employee: one(employees, {
    fields: [accessLogs.personId],
    references: [employees.id],
  }),
}));

export const temporaryBadgesRelations = relations(temporaryBadges, ({ one }) => ({
  visitor: one(visitors, {
    fields: [temporaryBadges.visitorId],
    references: [visitors.id],
  }),
  issuedByUser: one(users, {
    fields: [temporaryBadges.issuedBy],
    references: [users.id],
  }),
  returnedByUser: one(users, {
    fields: [temporaryBadges.returnedBy],
    references: [users.id],
  }),
}));

// Schemas para validação - Controle de Acesso
export const insertFacialEncodingSchema = createInsertSchema(facialEncodings).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertVisitorSchema = createInsertSchema(visitors).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
  lastVisit: true,
  totalVisits: true,
  isActive: true,
}).extend({
  cpf: z.string().min(11, "CPF deve ter 11 dígitos").max(14, "CPF inválido"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  company: z.string().optional(),
  purpose: z.string().optional(),
  vehiclePlate: z.string().optional(),
});

export const insertAccessLogSchema = createInsertSchema(accessLogs).omit({
  id: true,
  timestamp: true,
});

export const insertTemporaryBadgeSchema = createInsertSchema(temporaryBadges).omit({
  id: true,
  issueTime: true,
  actualReturn: true,
  status: true,
});

export const insertRecognitionAttemptSchema = createInsertSchema(recognitionAttempts).omit({
  id: true,
  timestamp: true,
});

// Types para controle de acesso
export type InsertFacialEncoding = z.infer<typeof insertFacialEncodingSchema>;
export type FacialEncoding = typeof facialEncodings.$inferSelect;

export type InsertVisitor = z.infer<typeof insertVisitorSchema>;
export type Visitor = typeof visitors.$inferSelect;

export type InsertAccessLog = z.infer<typeof insertAccessLogSchema>;
export type AccessLog = typeof accessLogs.$inferSelect;

export type InsertTemporaryBadge = z.infer<typeof insertTemporaryBadgeSchema>;
export type TemporaryBadge = typeof temporaryBadges.$inferSelect;

export type InsertRecognitionAttempt = z.infer<typeof insertRecognitionAttemptSchema>;
export type RecognitionAttempt = typeof recognitionAttempts.$inferSelect;

export type GateSystemConfig = typeof gateSystemConfig.$inferSelect;
export type InsertGateSystemConfig = typeof gateSystemConfig.$inferInsert;
