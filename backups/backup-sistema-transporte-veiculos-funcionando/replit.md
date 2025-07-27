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

### Vehicle Management Module - FULLY FUNCTIONAL ✓
- Complete CRUD operations for vehicles with 4 tabs (Principal, Financeira, Documentação, Técnica)
- Vehicle editing functionality working with proper routing (/vehicles/edit/:id)
- PDF generation for vehicle reports using pdfkit
- File upload system for documents (CRLV, tacógrafo, ANTT, seguro)
- 9 new vehicle fields implemented: manufacture date, installment data, document expiry dates
- Payment progress calculation and visualization
- Vehicle filtering and search functionality
- Integration with Supabase/PostgreSQL database

### Visual Identity Implementation ✓
- FELKA corporate branding with official logo implementation
- Blue color scheme (#0C29AB) applied throughout system
- Logo placement in sidebar, header, and login page
- Portuguese Brazilian interface language

### Authentication System ✓
- Session-based authentication working
- User roles (admin, user) implemented
- Protected routes with authentication guards
- Login credentials: admin@felka.com / admin123

### Technical Infrastructure ✓
- PostgreSQL database with Drizzle ORM
- Express.js REST API with proper error handling
- React frontend with TypeScript
- File upload handling with multer
- PDF generation capabilities
- Modern UI with shadcn/ui components

### Working API Endpoints ✓
- GET /api/vehicles - List all vehicles
- GET /api/vehicles/:id - Get specific vehicle
- POST /api/vehicles - Create new vehicle
- PATCH /api/vehicles/:id - Update vehicle
- POST /api/auth/login - User authentication
- GET /api/dashboard/stats - Dashboard statistics

This represents a stable, fully functional vehicle management system ready for production use.