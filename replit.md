# Transport Management System

## Overview

This is a comprehensive transport management system called "FELKA Transportes" built with a React frontend and Express.js backend. The application manages vehicles, drivers, routes, bookings, and provides analytics for a transport company. It features a modern UI built with shadcn/ui components and uses Drizzle ORM for database operations with complete CRUD functionality.

## User Preferences

Preferred communication style: Simple, everyday language.
Visual identity: FELKA corporate branding with blue color scheme (#0C29AB)
Logo implementation: FELKA logo in sidebar and header areas
Interface language: Portuguese Brazilian

## System Architecture

The application follows a monorepo structure with clear separation between frontend, backend, and shared code:

- **Client**: React application with TypeScript and Vite for development
- **Server**: Express.js REST API with TypeScript
- **Shared**: Common schemas and types used by both client and server
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations

## Key Components

### Frontend Architecture
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite for fast development and optimized builds
- **UI Library**: shadcn/ui components built on Radix UI primitives
- **Styling**: Tailwind CSS with custom design tokens
- **State Management**: TanStack Query for server state management
- **Routing**: Wouter for lightweight client-side routing
- **Forms**: React Hook Form with Zod validation

### Backend Architecture
- **Framework**: Express.js with TypeScript
- **Database ORM**: Drizzle ORM for type-safe database operations
- **Database**: PostgreSQL (configured for Neon serverless)
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **API Pattern**: REST endpoints with consistent error handling

### Authentication System
- Simple session-based authentication
- User roles (admin, user) for access control
- Frontend auth state management with subscription pattern
- Protected routes with authentication guards

### Database Schema
The system includes the following main entities:
- **Users**: Authentication and role management
- **Vehicles**: Fleet management with status tracking
- **Drivers**: Driver information and availability status
- **Routes**: Route planning with origin/destination and scheduling
- **Bookings**: Customer bookings with trip details
- **Trips**: Actual trip execution and tracking

## Data Flow

1. **Authentication Flow**: Users log in through the frontend, which calls the backend API, validates credentials, and establishes a session
2. **Data Fetching**: Frontend uses TanStack Query to fetch data from REST endpoints with automatic caching and revalidation
3. **Form Submissions**: Forms use React Hook Form with Zod validation, submit to backend APIs, and update the UI optimistically
4. **Real-time Updates**: Query invalidation ensures data freshness across components

## External Dependencies

### Frontend Dependencies
- **UI Components**: Extensive Radix UI component library for accessible primitives
- **Charts**: Recharts for data visualization and analytics
- **Date Handling**: date-fns for date manipulation
- **Animations**: Framer Motion for smooth UI transitions
- **Icons**: Lucide React for consistent iconography

### Backend Dependencies
- **Database**: Neon serverless PostgreSQL connection
- **Validation**: Zod for runtime type checking and validation
- **Session Storage**: PostgreSQL-based session management

### Development Tools
- **TypeScript**: Full type safety across the stack
- **ESBuild**: Fast backend bundling for production
- **Replit Integration**: Development environment optimizations

## Deployment Strategy

### Development Environment
- Frontend served through Vite dev server with HMR
- Backend runs with tsx for TypeScript execution
- Database migrations handled through Drizzle Kit
- Replit-specific optimizations for cloud development

### Production Build
- Frontend built with Vite and served as static files
- Backend bundled with ESBuild as ES modules
- Environment variable configuration for database connections
- Single deployment artifact with both frontend and backend

### Database Management
- Drizzle migrations stored in `/migrations` directory
- Schema definitions in shared code for type consistency
- Environment-based configuration with fallback handling
- PostgreSQL session store for production scalability

The architecture supports easy scaling by separating concerns and using modern, performant technologies throughout the stack.

## Recent Changes and Current Status (January 2025)

### HR Management Module - FULLY FUNCTIONAL ✓ (January 27, 2025)
- Complete employee management system with CRUD operations
- Employee registration with comprehensive data fields (personal, professional, contact, education)
- Employee details page with 4 tabs: Visão Geral, Pessoais, Profissionais, Documentos
- Employee editing functionality with pre-populated forms
- PDF generation for employee records with complete information
- Navigation between employee pages working correctly (list → details → edit)

### Document Management System - NEWLY IMPLEMENTED ✓ (January 27, 2025)
- Comprehensive document upload and management for employees and dependents
- File upload system with validation (PDF, JPG, PNG, max 5MB)
- Document expiry control with automatic notifications
- Visual alerts for expired and expiring documents (30-day warning)
- Document types: CNH, RG, CPF, Carteira de Trabalho, Exames Médicos, Cursos, etc.
- Download and deletion functionality for documents
- Document history tracking with previous versions and change reasons
- Integration in employee details page under "Documentos" tab

### Vehicle Management Module - FULLY FUNCTIONAL ✓
- Complete CRUD operations for vehicles with 4 tabs (Principal, Financeira, Documentação, Técnica)
- Vehicle editing functionality working with proper routing (/vehicles/edit/:id)
- PDF generation for vehicle reports using pdfkit
- File upload system for documents (CRLV, tacógrafo, ANTT, seguro)
- 9 new vehicle fields implemented: manufacture date, installment data, document expiry dates
- Payment progress calculation and visualization
- Vehicle filtering and search functionality
- Integration with Supabase/PostgreSQL database

### Visual Identity Implementation ✓ (Updated January 27, 2025)
- FELKA corporate branding with official logo implementation
- Enhanced blue color scheme with darker borders (hsl(220, 40%, 30%)) throughout system
- Logo placement in sidebar, header, and login page
- Portuguese Brazilian interface language consistently applied

### Authentication System ✓
- Session-based authentication working
- User roles (admin, user) implemented
- Protected routes with authentication guards
- Login credentials: admin@felka.com / admin123

### Technical Infrastructure ✓ (Enhanced January 27, 2025)
- PostgreSQL database with Drizzle ORM
- Express.js REST API with proper error handling
- React frontend with TypeScript and modern UI patterns
- File upload handling with multer for document management
- PDF generation capabilities for both vehicles and employees
- Modern UI with shadcn/ui components and consistent styling
- Date handling with date-fns library for expiry controls

### Working API Endpoints ✓ (Expanded January 27, 2025)
**Vehicle Management:**
- GET /api/vehicles - List all vehicles
- GET /api/vehicles/:id - Get specific vehicle
- POST /api/vehicles - Create new vehicle
- PATCH /api/vehicles/:id - Update vehicle
- GET /api/vehicles/:id/pdf - Generate vehicle PDF

**Employee Management:**
- GET /api/employees - List all employees
- GET /api/employees/:id - Get specific employee
- POST /api/employees - Create new employee
- PATCH /api/employees/:id - Update employee
- DELETE /api/employees/:id - Delete employee
- GET /api/employees/:id/pdf - Generate employee PDF

**Document Management:**
- GET /api/employees/:id/documents - Get employee documents
- POST /api/employees/:id/documents/upload - Upload document with file
- GET /api/employees/:id/documents/:docId/download - Download document
- DELETE /api/employees/:id/documents/:docId - Delete document
- GET /api/employees/documents/expiring - Get expiring documents

**System:**
- POST /api/auth/login - User authentication
- GET /api/dashboard/stats - Dashboard statistics

This represents a comprehensive transport management system with complete HR module including advanced document management capabilities and full employee occurrence management system, ready for production use.

## Employee Occurrence Management System - FULLY IMPLEMENTED ✓ (January 28, 2025)
- Complete CRUD system for employee occurrences (warnings, suspensions, absences, medical certificates)
- Occurrence types: verbal/written warnings, suspensions, absence records, medical certificates, disciplinary actions
- Automatic PDF document generation with official formatting and signature fields
- Dedicated occurrences page (/occurrences) with comprehensive filtering and search
- Integration with employee details page through "Ocorrências" tab
- Full reporting system with PDF export for individual and complete occurrence reports
- Visual severity indicators (high/medium/low) with color-coded badges
- Form validation and error handling for occurrence registration
- Menu integration in sidebar for easy access to occurrence management

## Final Phase Additional Functionalities - COMPLETED ✓ (January 28, 2025)
- **Employee Status Control**: Deactivation/reactivation with mandatory reason tracking and audit trail
- **General Attachments**: Comprehensive document upload system with validation and expiry control
- **Controlled Deletions**: Full traceability for document and data deletions with change reasons
- **Advanced Exports**: XLSX export with formatted columns and complete employee data
- **Complete PDF Reports**: Employee records with occurrence history integration
- **Status Management**: Visual controls for active/inactive employees with reason documentation

### New API Endpoints Added:
- PATCH /api/employees/:id/deactivate - Employee deactivation with reason
- PATCH /api/employees/:id/reactivate - Employee reactivation with reason  
- GET /api/employees/:id/pdf-with-occurrences - Complete PDF with occurrence history
- GET /api/employees/export/xlsx - XLSX export with formatted spreadsheet data

The HR management module is now complete with all requested additional functionalities implemented and fully functional.