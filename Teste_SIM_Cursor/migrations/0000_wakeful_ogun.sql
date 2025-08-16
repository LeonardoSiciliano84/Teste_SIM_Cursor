CREATE TABLE "access_logs" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_type" text NOT NULL,
	"person_id" uuid NOT NULL,
	"person_name" text NOT NULL,
	"direction" text NOT NULL,
	"access_method" text NOT NULL,
	"recognition_confidence" numeric(4, 2),
	"gatekeeper_id" uuid,
	"gatekeeper_name" text,
	"visit_purpose" text,
	"responsible_person" text,
	"vehicle_plate" text,
	"badge_number" text,
	"observations" text,
	"location" text DEFAULT 'Portaria Principal',
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "bookings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"booking_number" text NOT NULL,
	"client_name" text NOT NULL,
	"client_phone" text NOT NULL,
	"client_email" text,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"type" text NOT NULL,
	"status" text DEFAULT 'pending' NOT NULL,
	"price" numeric(10, 2),
	"route_id" uuid,
	"scheduled_at" timestamp,
	"notes" text,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "bookings_booking_number_unique" UNIQUE("booking_number")
);
--> statement-breakpoint
CREATE TABLE "checklist_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"checklist_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"performed_by" varchar NOT NULL,
	"performed_by_name" varchar NOT NULL,
	"department" varchar,
	"details" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "checklist_items" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"category" varchar NOT NULL,
	"item_name" varchar NOT NULL,
	"description" text,
	"mandatory" boolean DEFAULT true,
	"vehicle_type" varchar,
	"order" integer DEFAULT 0,
	"active" boolean DEFAULT true,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "drivers" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"phone" text NOT NULL,
	"license" text NOT NULL,
	"license_category" text NOT NULL,
	"status" text DEFAULT 'available' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "drivers_license_unique" UNIQUE("license")
);
--> statement-breakpoint
CREATE TABLE "employee_dependents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"name" text NOT NULL,
	"cpf" text,
	"birth_date" date NOT NULL,
	"relationship" text NOT NULL,
	"is_dependent" boolean DEFAULT true,
	"birth_certificate" text,
	"cpf_document" text,
	"school_enrollment" text,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_documents" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"document_type" text NOT NULL,
	"description" text NOT NULL,
	"document_number" text,
	"issued_date" date,
	"expiry_date" date,
	"issuer" text,
	"filename" text,
	"file_url" text,
	"file_size" integer,
	"mime_type" text,
	"status" text DEFAULT 'active',
	"is_active" boolean DEFAULT true,
	"renewal_notified" boolean DEFAULT false,
	"previous_version_id" uuid,
	"change_reason" text,
	"changed_by" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_files" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"file_name" text NOT NULL,
	"file_url" text NOT NULL,
	"file_type" text,
	"file_size" integer,
	"category" text,
	"description" text,
	"uploaded_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_movements" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"movement_type" text NOT NULL,
	"previous_value" text,
	"new_value" text,
	"reason" text NOT NULL,
	"effective_date" date NOT NULL,
	"approved_by_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employee_occurrences" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"employee_id" uuid NOT NULL,
	"requested_by_id" text NOT NULL,
	"occurrence_type" text NOT NULL,
	"title" text NOT NULL,
	"description" text NOT NULL,
	"occurrence_date" date NOT NULL,
	"suspension_days" integer,
	"suspension_start" date,
	"suspension_end" date,
	"medical_days" integer,
	"medical_start" date,
	"medical_end" date,
	"medical_document" text,
	"employee_signature" boolean DEFAULT false,
	"employee_signature_date" timestamp,
	"manager_signature" boolean DEFAULT false,
	"manager_signature_date" timestamp,
	"hr_signature" boolean DEFAULT false,
	"hr_signature_date" timestamp,
	"document_generated" boolean DEFAULT false,
	"document_url" text,
	"status" text DEFAULT 'pending',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "employees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"full_name" text NOT NULL,
	"cpf" text NOT NULL,
	"rg" text,
	"rg_issuer" text,
	"rg_issue_date" date,
	"birth_date" date,
	"gender" text,
	"marital_status" text,
	"nationality" text DEFAULT 'Brasileira',
	"phone" text NOT NULL,
	"email" text,
	"personal_email" text,
	"address" text,
	"address_number" text,
	"complement" text,
	"neighborhood" text,
	"city" text,
	"state" text,
	"zip_code" text,
	"employee_number" text NOT NULL,
	"admission_date" date,
	"dismissal_date" date,
	"position" text NOT NULL,
	"department" text NOT NULL,
	"manager" text,
	"work_schedule" text,
	"work_location" text,
	"salary" numeric(10, 2),
	"benefits" json,
	"bank_account" text,
	"bank" text,
	"bank_agency" text,
	"pix_key" text,
	"education" text,
	"education_institution" text,
	"education_course" text,
	"education_status" text,
	"voter_title" text,
	"military_service" text,
	"work_card" text,
	"pis" text,
	"driver_license" text,
	"driver_license_category" text,
	"driver_license_expiry" date,
	"status" text DEFAULT 'active' NOT NULL,
	"inactive_reason" text,
	"inactive_date" timestamp,
	"reactivation_reason" text,
	"reactivation_date" timestamp,
	"status_changed_by" text,
	"system_user_id" uuid,
	"profile_photo" text,
	"access_level" text DEFAULT 'employee',
	"allowed_modules" text[] DEFAULT '{}',
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "employees_cpf_unique" UNIQUE("cpf"),
	CONSTRAINT "employees_employee_number_unique" UNIQUE("employee_number")
);
--> statement-breakpoint
CREATE TABLE "facial_encodings" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"person_type" text NOT NULL,
	"person_id" uuid NOT NULL,
	"encoding_data" json NOT NULL,
	"confidence" numeric(4, 2),
	"capture_quality" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "gate_system_config" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"key" text NOT NULL,
	"value" text NOT NULL,
	"description" text,
	"category" text,
	"updated_by" uuid,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "gate_system_config_key_unique" UNIQUE("key")
);
--> statement-breakpoint
CREATE TABLE "prancha_services" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" varchar NOT NULL,
	"vehicle_plate" varchar NOT NULL,
	"vehicle_name" varchar NOT NULL,
	"implement_id" varchar NOT NULL,
	"implement_plate" varchar NOT NULL,
	"implement_name" varchar NOT NULL,
	"driver_id" varchar NOT NULL,
	"driver_name" varchar NOT NULL,
	"driver_registration" varchar NOT NULL,
	"oc_number" varchar NOT NULL,
	"start_date" varchar NOT NULL,
	"end_date" varchar,
	"service_days" integer DEFAULT 0,
	"status" varchar DEFAULT 'aguardando',
	"hr_status" varchar DEFAULT 'nao_verificado',
	"observations" text,
	"is_active" boolean DEFAULT false,
	"finalization_notes" text,
	"finalization_attachment" varchar,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "recognition_attempts" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"attempt_type" text NOT NULL,
	"success" boolean NOT NULL,
	"person_type" text,
	"person_id" uuid,
	"confidence" numeric(4, 2),
	"error_reason" text,
	"processing_time" integer,
	"device_info" json,
	"timestamp" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "routes" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"origin" text NOT NULL,
	"destination" text NOT NULL,
	"distance" numeric(10, 2),
	"estimated_duration" integer,
	"vehicle_id" uuid,
	"driver_id" uuid,
	"status" text DEFAULT 'planned' NOT NULL,
	"scheduled_at" timestamp,
	"started_at" timestamp,
	"completed_at" timestamp,
	"created_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "service_logs" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"service_id" varchar NOT NULL,
	"action" varchar NOT NULL,
	"user_name" varchar NOT NULL,
	"user_role" varchar NOT NULL,
	"justification" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sinistro_documents" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sinistro_id" varchar NOT NULL,
	"tipo_documento" varchar NOT NULL,
	"nome_arquivo" varchar NOT NULL,
	"caminho_arquivo" varchar NOT NULL,
	"tamanho_arquivo" integer,
	"tipo_mime" varchar,
	"uploaded_by" varchar NOT NULL,
	"nome_uploader" varchar NOT NULL,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sinistro_history" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"sinistro_id" varchar NOT NULL,
	"tipo_alteracao" varchar NOT NULL,
	"campo_alteracao" varchar,
	"valor_anterior" text,
	"valor_novo" text,
	"usuario_id" varchar NOT NULL,
	"nome_usuario" varchar NOT NULL,
	"observacao" text,
	"created_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "sinistros" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"tipo" varchar NOT NULL,
	"classificacao" varchar,
	"placa_tracao" varchar,
	"tipo_colisao" varchar,
	"percepcao_gravidade" varchar,
	"quem_sofreu_avaria" varchar,
	"condicoes_trajeto" varchar,
	"nome_envolvido" varchar NOT NULL,
	"cargo_envolvido" varchar,
	"data_ocorrido" varchar NOT NULL,
	"hora_ocorrido" varchar NOT NULL,
	"local_endereco" text NOT NULL,
	"observacoes" text NOT NULL,
	"vitimas" boolean DEFAULT false,
	"descricao_vitimas" text,
	"testemunhas" text,
	"condicoes_tempo" varchar,
	"condicoes_pista" varchar,
	"status" varchar DEFAULT 'aberto',
	"acao_corretiva" text,
	"acao_preventiva" text,
	"observacoes_internas" text,
	"registrado_por" varchar NOT NULL,
	"nome_registrador" varchar NOT NULL,
	"cargo_registrador" varchar NOT NULL,
	"finalizado_por" varchar,
	"nome_finalizador" varchar,
	"data_finalizacao" timestamp,
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "temporary_badges" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"badge_number" text NOT NULL,
	"visitor_id" uuid,
	"visitor_name" text NOT NULL,
	"company" text,
	"visit_purpose" text NOT NULL,
	"responsible_person" text NOT NULL,
	"vehicle_plate" text,
	"issue_time" timestamp DEFAULT now() NOT NULL,
	"expected_return" timestamp,
	"actual_return" timestamp,
	"status" text DEFAULT 'active' NOT NULL,
	"issued_by" uuid,
	"returned_by" uuid,
	CONSTRAINT "temporary_badges_badge_number_unique" UNIQUE("badge_number")
);
--> statement-breakpoint
CREATE TABLE "trips" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"route_id" uuid,
	"booking_id" uuid,
	"revenue" numeric(10, 2),
	"fuel_cost" numeric(10, 2),
	"status" text DEFAULT 'completed' NOT NULL,
	"completed_at" timestamp DEFAULT now() NOT NULL
);
--> statement-breakpoint
CREATE TABLE "users" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"email" text NOT NULL,
	"password" text NOT NULL,
	"name" text NOT NULL,
	"role" text DEFAULT 'user' NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "users_email_unique" UNIQUE("email")
);
--> statement-breakpoint
CREATE TABLE "vehicle_checklists" (
	"id" varchar PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"vehicle_id" varchar NOT NULL,
	"vehicle_plate" varchar NOT NULL,
	"vehicle_name" varchar NOT NULL,
	"implement_id" varchar,
	"implement_plate" varchar,
	"implement_name" varchar,
	"driver_id" varchar NOT NULL,
	"driver_name" varchar NOT NULL,
	"driver_employee_number" varchar,
	"base_origin" varchar NOT NULL,
	"base_destination" varchar,
	"exit_date" varchar NOT NULL,
	"exit_time" varchar NOT NULL,
	"return_date" varchar,
	"return_time" varchar,
	"exit_km" integer NOT NULL,
	"return_km" integer,
	"exit_gatekeeper" varchar,
	"return_gatekeeper" varchar,
	"exit_checklist" json NOT NULL,
	"exit_observations" text,
	"exit_photos" text[],
	"return_checklist" json,
	"return_observations" text,
	"return_photos" text[],
	"status" varchar DEFAULT 'saida_registrada' NOT NULL,
	"verification_status" varchar DEFAULT 'nao_verificado' NOT NULL,
	"verified_by" varchar,
	"verified_by_name" varchar,
	"verification_date" timestamp,
	"verification_notes" text,
	"access_departments" text[] DEFAULT ARRAY['frota', 'manutencao', 'seguranca', 'portaria'],
	"created_at" timestamp DEFAULT now(),
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
CREATE TABLE "vehicles" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"plate" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"renavam" text,
	"chassis" text,
	"model_year" integer NOT NULL,
	"manufacture_year" integer NOT NULL,
	"vehicle_type" text NOT NULL,
	"classification" text NOT NULL,
	"preventive_maintenance_km" integer DEFAULT 10000,
	"tire_rotation_km" integer DEFAULT 10000,
	"purchase_date" timestamp,
	"purchase_value" numeric(12, 2),
	"financial_institution" text,
	"contract_type" text,
	"contract_number" text,
	"contract_document" text,
	"installment_count" integer,
	"installment_value" numeric(12, 2),
	"crlv_document" text,
	"crlv_expiry" timestamp,
	"tachograph_document" text,
	"tachograph_expiry" timestamp,
	"antt_document" text,
	"antt_expiry" timestamp,
	"insurance_document" text,
	"insurance_value" numeric(12, 2),
	"insurance_expiry" timestamp,
	"fipe_code" text,
	"fipe_value" numeric(12, 2),
	"fipe_last_update" timestamp,
	"photos" text[],
	"body_width" numeric(8, 2),
	"floor_height" numeric(8, 2),
	"body_length" numeric(8, 2),
	"load_capacity" numeric(10, 2),
	"fuel_tank_capacity" numeric(8, 2),
	"fuel_consumption" numeric(6, 2),
	"status" text DEFAULT 'active' NOT NULL,
	"inactive_reason" text,
	"current_location" text,
	"driver_id" uuid,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "vehicles_plate_unique" UNIQUE("plate")
);
--> statement-breakpoint
CREATE TABLE "visitors" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"cpf" text NOT NULL,
	"name" text NOT NULL,
	"phone" text,
	"email" text,
	"company" text,
	"is_recurring" boolean DEFAULT false NOT NULL,
	"last_visit" timestamp,
	"total_visits" integer DEFAULT 0 NOT NULL,
	"observations" text,
	"is_active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp DEFAULT now() NOT NULL,
	"updated_at" timestamp DEFAULT now() NOT NULL,
	CONSTRAINT "visitors_cpf_unique" UNIQUE("cpf")
);
--> statement-breakpoint
ALTER TABLE "access_logs" ADD CONSTRAINT "access_logs_gatekeeper_id_users_id_fk" FOREIGN KEY ("gatekeeper_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "bookings" ADD CONSTRAINT "bookings_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "checklist_history" ADD CONSTRAINT "checklist_history_checklist_id_vehicle_checklists_id_fk" FOREIGN KEY ("checklist_id") REFERENCES "public"."vehicle_checklists"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_dependents" ADD CONSTRAINT "employee_dependents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_documents" ADD CONSTRAINT "employee_documents_changed_by_users_id_fk" FOREIGN KEY ("changed_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_files" ADD CONSTRAINT "employee_files_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_files" ADD CONSTRAINT "employee_files_uploaded_by_id_employees_id_fk" FOREIGN KEY ("uploaded_by_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_movements" ADD CONSTRAINT "employee_movements_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_movements" ADD CONSTRAINT "employee_movements_approved_by_id_employees_id_fk" FOREIGN KEY ("approved_by_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employee_occurrences" ADD CONSTRAINT "employee_occurrences_employee_id_employees_id_fk" FOREIGN KEY ("employee_id") REFERENCES "public"."employees"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "employees" ADD CONSTRAINT "employees_system_user_id_users_id_fk" FOREIGN KEY ("system_user_id") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "gate_system_config" ADD CONSTRAINT "gate_system_config_updated_by_users_id_fk" FOREIGN KEY ("updated_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_vehicle_id_vehicles_id_fk" FOREIGN KEY ("vehicle_id") REFERENCES "public"."vehicles"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "routes" ADD CONSTRAINT "routes_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "service_logs" ADD CONSTRAINT "service_logs_service_id_prancha_services_id_fk" FOREIGN KEY ("service_id") REFERENCES "public"."prancha_services"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sinistro_documents" ADD CONSTRAINT "sinistro_documents_sinistro_id_sinistros_id_fk" FOREIGN KEY ("sinistro_id") REFERENCES "public"."sinistros"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "sinistro_history" ADD CONSTRAINT "sinistro_history_sinistro_id_sinistros_id_fk" FOREIGN KEY ("sinistro_id") REFERENCES "public"."sinistros"("id") ON DELETE cascade ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporary_badges" ADD CONSTRAINT "temporary_badges_visitor_id_visitors_id_fk" FOREIGN KEY ("visitor_id") REFERENCES "public"."visitors"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporary_badges" ADD CONSTRAINT "temporary_badges_issued_by_users_id_fk" FOREIGN KEY ("issued_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "temporary_badges" ADD CONSTRAINT "temporary_badges_returned_by_users_id_fk" FOREIGN KEY ("returned_by") REFERENCES "public"."users"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_route_id_routes_id_fk" FOREIGN KEY ("route_id") REFERENCES "public"."routes"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "trips" ADD CONSTRAINT "trips_booking_id_bookings_id_fk" FOREIGN KEY ("booking_id") REFERENCES "public"."bookings"("id") ON DELETE no action ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "vehicles" ADD CONSTRAINT "vehicles_driver_id_drivers_id_fk" FOREIGN KEY ("driver_id") REFERENCES "public"."drivers"("id") ON DELETE no action ON UPDATE no action;