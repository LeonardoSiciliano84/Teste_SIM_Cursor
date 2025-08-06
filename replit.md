# FELKA Transportes - Sistema de Gestão

## Overview
FELKA Transportes is a comprehensive transport management system designed to manage vehicles, drivers, routes, bookings, and analytics for a transport company. Built with a React frontend and Express.js backend, it features a modern UI using shadcn/ui and Drizzle ORM for full CRUD functionality. The system also includes a robust prancha service management system, ensuring persistent services tied to drivers with automatic state restoration and trip tracking.

## Recent Changes (Janeiro 2025)
- **Access Control System Complete:** Total replacement of facial recognition with CPF/QR Code system
- **Facial Recognition Removal:** Completely removed facial-recognition page, components, and all related code
- **Navigation Update:** Replaced "Reconhecimento Facial" with "Controle de Acesso" in sidebar menu
- **Visitor Management:** CPF-based visitor search and registration system implemented
- **Employee Access Control:** QR Code-based entry/exit system for all employees
- **QR Code Auto-Generation:** Automatic QR code creation for all employees during system initialization
- **Expanded Test Data:** Now includes 10 test employees across different departments and roles
- **Clean Architecture:** Removed all face-api.js dependencies and camera diagnostic components
- **URL Structure:** Changed from /facial-recognition to /access-control route
- **Tabs Reorganization:** Separated employee and visitor logs into distinct tabs for better organization
- **Security Guard Interface:** Created responsive mobile/tablet page for security guard operations
- **Mobile-Optimized Portal:** New /security-guard route with touch-friendly interface for access control
- **Vehicle Control System:** Implemented comprehensive vehicle entry/exit tracking in security guard portal
- **Admin Access to Driver Portal:** Enabled admin users to access driver portal with supervision banner
- **Driver Portal API:** Created endpoints for driver profile and active service management
- **Maintenance Module Enhancement:** Implemented complete cost tracking system following PRD specifications
- **Cost Classification System:** Added 8 predefined cost categories (Mecânica, Elétrica, Estrutural, etc.)
- **Automatic Cost Calculation:** Implemented quantity × unit price auto-calculation in cost entry forms
- **Warehouse Tab Removal:** Eliminated almoxarifado functionality from maintenance module per user requirements
- **Tire Control Module Implementation:** Added comprehensive tire management system with complete lifecycle tracking
- **Tire Management Schema:** Created complete database schema for tires, movements, rotations, and alerts
- **Integrated Tire Interface:** Added 5th tab to maintenance module with 6 internal sub-tabs for full tire control
- **Dashboard with KPIs:** Implemented tire status indicators, movement tracking, and alert management system
- **Cargo Scheduling Module Complete:** Implemented full cargo loading scheduling system with visual calendar interface
- **FELKA Visual Identity:** Applied new visual layout with FELKA header, logo, and consistent #0C29AB branding throughout system
- **Three-Tab Interface:** Agendamento (client scheduling), Admin (management), and Relatórios (reports) with role-based access
- **Time Slot Management:** Visual calendar with available/occupied slots, multiple selection capability, and real-time status updates
- **PDF and Email Integration:** Automatic generation of booking confirmations and email notifications for clients and managers
- **3-Hour Cancellation Policy:** Implemented booking cancellation window with automatic policy enforcement
- **External Persons Module Implementation:** Added comprehensive third-party management system (terceiros)
- **Schema Extension:** Enhanced database schema with ExternalPerson entity for clients and security guards
- **Role-Based Access:** Implemented access control with client and security guard permissions
- **Automated Credentials:** System generates login/password automatically with email notifications
- **Navigation Enhancement:** Added "+ Novo Externo" button alongside "+ Novo Colaborador" in employees page
- **Full CRUD Operations:** Complete backend API endpoints for external persons management with status control
- **Hierarchical Menu Structure:** Completely restructured sidebar with collapsible parent/child menu organization
- **Menu Categories:** Organized into 4 main categories: Dashboards, Colaboradores, Almoxarifado, and Controle de Acesso
- **Mobile Responsive Menu:** Added mobile hamburger menu with overlay, touch-friendly interface for tablets/phones
- **Visual Menu Indicators:** Implemented chevron icons, active state highlighting, and submenu visual separation
- **Submenu Organization:** Dashboard subitems, Colaboradores with 5 subitems, Almoxarifado with Agendamento, Controle de Acesso with Portaria
- **Mileage-Based Preventive Maintenance System:** Complete transition from classification-based to KM-based maintenance logic
- **Automatic Status Calculation:** Dynamic status determination based on kilometers remaining (>3000=Em dia, 2000-3000=Agendar, 0-2000=Em revisão, <0=Vencido)
- **KM-Based Maintenance Records:** New data structure for tracking maintenance history with kilometers, service types, and intervals
- **Driver KM Checklists:** Implementation of driver checklist system with current mileage tracking and vehicle condition monitoring
- **Enhanced API Endpoints:** New routes for preventive maintenance records, driver checklists, and KM-based vehicle tracking
- **Test Data Infrastructure:** Complete sample data including maintenance records and driver checklists for testing the new system
- **Data Import via Spreadsheet System:** Complete implementation following PRD requirements for importing employee and vehicle data from Excel files
- **Import Validation System:** Comprehensive data validation with error reporting, duplicate detection, and field mapping interface
- **Configuration Menu Addition:** Added "Configurações" menu section containing "Importação de Dados" functionality
- **Excel Processing Backend:** Full backend implementation with multer file upload, XLSX processing, and storage integration

## User Preferences
Preferred communication style: Simple, everyday language.
Visual identity: FELKA corporate branding with blue color scheme (#0C29AB)
Logo implementation: FELKA official header image in all PDFs and system areas
Interface language: Portuguese Brazilian
PDF Requirements: Official company header with timbrado image in all documents
Export Format: All exports must be in XLSX format (not CSV)

## System Architecture
The application follows a monorepo structure, separating client, server, and shared code.

**Frontend:**
*   **Framework:** React 18 with TypeScript
*   **Build Tool:** Vite
*   **UI Library:** shadcn/ui (built on Radix UI)
*   **Styling:** Tailwind CSS
*   **State Management:** TanStack Query
*   **Routing:** Wouter
*   **Forms:** React Hook Form with Zod validation

**Backend:**
*   **Framework:** Express.js with TypeScript
*   **Database ORM:** Drizzle ORM
*   **Database:** PostgreSQL (configured for Neon serverless)
*   **Session Management:** PostgreSQL session store with `connect-pg-simple`
*   **API Pattern:** REST endpoints

**Authentication:**
*   Session-based authentication with user roles (admin, user, driver).
*   Role-based access control and protected routes.

**Database Schema:**
*   Users, Vehicles, Drivers, Routes, Bookings, Trips.
*   Prancha services with `isActive`, `finalizationNotes`, and `finalizationAttachment` fields for persistence.

**Key Features:**
*   **HR Management:** Full CRUD for employees, including personal, professional, and document details. Document management with expiration tracking and notifications. Occurrence management (warnings, suspensions, medical certificates) with PDF generation.
*   **Vehicle Management:** Full CRUD for vehicles with detailed information across multiple tabs (Principal, Financeira, Documentação, Técnica). Includes PDF report generation and document upload.
*   **Access Control System:** Complete CPF-based visitor registration and QR Code employee access system with real-time logging and entry/exit tracking.
*   **Security Guard Portal:** Mobile-optimized interface for security personnel with vehicle control, visitor management, employee access monitoring, and comprehensive logging.
*   **Driver Portal:** Mobile-optimized interface for drivers with vehicle selection, document access, prancha service management, and maintenance communication. Admin users can access for supervision purposes.
*   **Prancha Service System:** Persistent prancha service state across driver login sessions, automatic restoration, and service lifecycle management (start → active → finish) with file attachments.
*   **Document Management:** System for uploading, downloading, and tracking documents with expiration dates and visual alerts.
*   **Reporting & Export:** XLSX export for data and PDF generation with corporate branding for various reports (vehicle, employee, occurrences).

## External Dependencies

*   **Database:** Neon (PostgreSQL serverless)
*   **UI Components:** Radix UI
*   **Charting:** Recharts
*   **Date Handling:** date-fns
*   **Animations:** Framer Motion
*   **Icons:** Lucide React
*   **Validation:** Zod
*   **Session Storage:** PostgreSQL-based session management
*   **File Upload:** Multer (for backend document management)
*   **PDF Generation:** pdfkit