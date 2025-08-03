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
*   **Driver Portal:** Mobile-optimized interface for drivers with vehicle selection, document access, and quick access buttons for pre-checklist, exit checklist, maintenance requests, and incident communication.
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