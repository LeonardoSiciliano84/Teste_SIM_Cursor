# FELKA Transportes - Sistema de Gestão

## Overview
FELKA Transportes is a comprehensive transport management system designed to manage vehicles, drivers, routes, bookings, and analytics for a transport company. Built with a React frontend and Express.js backend, it features a modern UI using shadcn/ui and Drizzle ORM for full CRUD functionality. The system also includes a robust prancha service management system, ensuring persistent services tied to drivers with automatic state restoration and trip tracking.

## Recent Changes (Janeiro 2025)
- **Facial Recognition System:** Implemented comprehensive visitor registration with facial recognition capabilities
- **Camera Integration:** Fixed camera functionality issues and added robust camera testing and diagnostic tools
- **Cross-browser Compatibility:** Added complete camera diagnostic tool testing MediaDevices API, device enumeration, video playback, and resolution support
- **Visitor Management:** Simplified visitor registration form with mandatory fields (photo, full name, CPF) and optional fields (company, visit reason, vehicle plate)
- **Access Control Module:** Complete access control system with visitor registration, facial recognition, access logs, and diagnostic tools
- **UI Enhancements:** Modern interface with real-time camera preview, detailed error handling, and comprehensive feedback

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