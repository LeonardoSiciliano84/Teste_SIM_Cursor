# Transport Management System

## Overview

This is a comprehensive transport management system called "FELKA Transportes" built with a React frontend and Express.js backend. The application manages vehicles, drivers, routes, bookings, and provides analytics for a transport company. It features a modern UI built with shadcn/ui components and uses Drizzle ORM for database operations with complete CRUD functionality.

The system now includes a complete prancha service management system with persistent services that remain tied to drivers across login sessions, featuring automatic state restoration and trip tracking capabilities.

## User Preferences

Preferred communication style: Simple, everyday language.
Visual identity: FELKA corporate branding with blue color scheme (#0C29AB)
Logo implementation: FELKA official header image in all PDFs and system areas
Interface language: Portuguese Brazilian
PDF Requirements: Official company header with timbrado image in all documents
Export Format: All exports must be in XLSX format (not CSV)

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

## PRÓXIMO MÓDULO - Gestão de Frotas Avançada

**Módulo 3:** Sistema avançado de gestão de frotas com:
- Rastreamento GPS e localização em tempo real
- Controle de combustível e consumo
- Manutenção preventiva e corretiva
- Gestão de motoristas e escalas
- Relatórios de performance e custos
- Integração com sistemas externos

## Recent Changes and Current Status (January 2025)

### Sistema de Download de Documentos e Controle de Acesso - IMPLEMENTADO ✓ (January 28, 2025)
**Sistema completo de download de arquivos e controle de acesso por função:**
- Componente SinistroDocuments para visualização e download de anexos em sinistros
- Download direto de documentos através de endpoints /api/sinistros/:id/documents/:docId/download
- Persistência automática de login com localStorage e restauração de sessão
- Controle de acesso baseado em função (role-based access control):
  * Motoristas (role: 'driver') acessam apenas o portal do motorista
  * Usuários admin e user podem acessar sistema completo + portal do motorista
- Usuário teste criado: motorista@felka.com / admin123 (role: driver)
- AuthManager aprimorado com métodos canAccessAdmin() e isDriver()
- Redirecionamento automático baseado na função do usuário no App.tsx
- Interface de download com ícones, informações de arquivo e badges por tipo

### Prancha Service Persistence System ✓ (January 28, 2025)
**Complete prancha service management with persistent state across login sessions:**
- Database-backed service persistence with PostgreSQL integration
- Enhanced schema with isActive, finalizationNotes, and finalizationAttachment fields
- Service state survives driver logout/login cycles with automatic restoration
- New API endpoints: GET /api/driver/:driverId/active-service, PATCH /api/prancha-services/:id/finalize
- Automatic service detection and restoration on driver portal load
- Service lifecycle management: start → active → finish with file attachments
- Trip day counter that continues across sessions
- Finish service modal with notes and file upload capability
- Updated storage layer with getActiveServiceByDriver and updatePranchaService methods

### Module 3 - Driver Portal Mobile Interface ✓ (January 28, 2025)
**Complete driver-specific mobile portal implementation:**
- Driver authentication system with credentials: motorista@felka.com / admin123
- Mobile-optimized interface with responsive design
- Vehicle selection functionality (traction and implement search)
- Document access modal for both vehicles and implements
- 4 quick access buttons for operational workflows:
  * Pre-Checklist Warning (yellow) - Safety alerts before checklist
  * Exit Checklist (green) - Complete vehicle departure checklist
  * Maintenance Request (blue) - Submit maintenance requests
  * Incident Communication (red) - Report accidents/incidents
- Test vehicle data including trucks, trailers, containers, and flatbeds
- Integration with employee database for driver profile display
- Corporate FELKA branding throughout mobile interface

### HR Management Module - COMPLETAMENTE FUNCIONAL ✓ (January 28, 2025)
**Sistema completo de gestão de colaboradores com todas as funcionalidades:**
- Sistema CRUD completo para colaboradores com validação
- Cadastro de colaboradores com dados pessoais, profissionais, contato e educação
- Página de detalhes com 4 abas: Visão Geral, Pessoais, Profissionais, Documentos, Ocorrências
- Funcionalidade de edição com formulários pré-preenchidos
- Sistema de controle de status (ativo/inativo) com rastreamento de motivos
- Navegação completa entre páginas (lista → detalhes → edição)

### Sistema de Gestão Documental - IMPLEMENTADO ✓ (January 28, 2025)
**Controle completo de documentos com vencimentos:**
- Upload de documentos com validação (PDF, JPG, PNG, máx 5MB)
- Controle de vencimento com notificações automáticas
- Alertas visuais para documentos vencidos e próximos ao vencimento (aviso 30 dias)
- Tipos de documentos: CNH, RG, CPF, Carteira de Trabalho, Exames Médicos, Cursos
- Download e exclusão de documentos com rastreamento
- Histórico de versões com controle de alterações e motivos
- Integração na página de detalhes do colaborador

### Sistema de Gestão de Ocorrências - IMPLEMENTADO ✓ (January 28, 2025)
**Sistema completo para registro e controle de ocorrências:**
- CRUD completo para ocorrências (advertências, suspensões, atestados, faltas)
- Tipos: advertência verbal/escrita, suspensões, registros de falta, atestados médicos
- Geração automática de documentos PDF com formatação oficial e campos para assinatura
- Página dedicada (/occurrences) com filtros e busca avançada
- Integração na página de detalhes através da aba "Ocorrências"
- Sistema de relatórios com exportação PDF individual e geral
- Indicadores visuais de severidade (alta/média/baixa) com badges coloridos
- Validação de formulários e tratamento de erros

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

### Authentication System ✓ (Atualizado January 28, 2025)
- Session-based authentication with automatic persistence via localStorage
- User roles (admin, user, driver) implemented with role-based access control
- Protected routes with authentication guards and role-based redirection
- Automatic session restoration on page reload
- Login credentials: 
  * admin@felka.com / admin123 (admin - acesso completo)
  * motorista@felka.com / admin123 (driver - apenas portal do motorista)

### Technical Infrastructure ✓ (Enhanced January 27, 2025)
- PostgreSQL database with Drizzle ORM
- Express.js REST API with proper error handling
- React frontend with TypeScript and modern UI patterns
- File upload handling with multer for document management
- PDF generation capabilities for both vehicles and employees
- Modern UI with shadcn/ui components and consistent styling
- Date handling with date-fns library for expiry controls

### API Endpoints Funcionais ✓ (Atualizado January 28, 2025)
**Gestão de Veículos:**
- GET /api/vehicles - Listar todos os veículos
- GET /api/vehicles/:id - Obter veículo específico
- POST /api/vehicles - Criar novo veículo
- PATCH /api/vehicles/:id - Atualizar veículo
- GET /api/vehicles/:id/pdf - Gerar PDF do veículo

**Gestão de Documentos de Sinistros:**
- GET /api/sinistros/:id/documents - Listar documentos do sinistro
- GET /api/sinistros/:id/documents/:docId/download - Download de documento
- POST /api/sinistros/:id/documents/upload - Upload de documento
- DELETE /api/sinistros/:id/documents/:docId - Deletar documento

**Gestão de Colaboradores:**
- GET /api/employees - Listar todos os colaboradores
- GET /api/employees/:id - Obter colaborador específico
- POST /api/employees - Criar novo colaborador
- PATCH /api/employees/:id - Atualizar colaborador
- DELETE /api/employees/:id - Deletar colaborador
- GET /api/employees/:id/pdf - Gerar PDF do colaborador
- GET /api/employees/:id/pdf-with-occurrences - PDF completo com histórico
- GET /api/employees/export/xlsx - Exportar colaboradores em XLSX
- PATCH /api/employees/:id/deactivate - Desativar colaborador
- PATCH /api/employees/:id/reactivate - Reativar colaborador

**Gestão de Documentos:**
- GET /api/employees/:id/documents - Obter documentos do colaborador
- POST /api/employees/:id/documents/upload - Upload de documento
- GET /api/employees/:id/documents/:docId/download - Download de documento
- DELETE /api/employees/:id/documents/:docId - Deletar documento
- GET /api/employees/documents/expiring - Documentos próximos ao vencimento

**Gestão de Ocorrências:**
- GET /api/employees/:id/occurrences - Listar ocorrências do colaborador
- POST /api/employees/:id/occurrences - Criar nova ocorrência
- GET /api/employees/:id/occurrences/:occurrenceId/document - Gerar PDF da ocorrência
- PATCH /api/employees/:id/occurrences/:occurrenceId - Atualizar ocorrência
- DELETE /api/employees/:id/occurrences/:occurrenceId - Deletar ocorrência
- GET /api/occurrences/all - Listar todas as ocorrências
- GET /api/occurrences/report - Relatório geral de ocorrências

**Sistema:**
- POST /api/auth/login - Autenticação de usuário com controle de função
- GET /api/dashboard/stats - Estatísticas do dashboard
- GET /api/driver/profile - Perfil do motorista logado
- GET /api/driver/:driverId/active-service - Serviço ativo do motorista

### Sistema de Exportação e Relatórios - IMPLEMENTADO ✓ (January 28, 2025)
**Exportações profissionais com formatação corporativa:**
- Exportação XLSX com colunas formatadas e dados completos dos colaboradores
- PDFs com cabeçalho oficial da FELKA (imagem do timbrado)
- Relatórios individuais e completos de colaboradores
- Relatórios gerais de ocorrências com estatísticas
- Sistema de fallback para garantir funcionamento dos PDFs
- Rodapé padronizado com informações legais e data/hora de emissão

### Identidade Visual Corporativa - IMPLEMENTADA ✓ (January 28, 2025)
**Branding completo da FELKA em todo o sistema:**
- Logo oficial da FELKA implementado em sidebar, header e documentos
- Cabeçalho padronizado com imagem oficial do timbrado em todos os PDFs
- Esquema de cores corporativo azul FELKA (#0C29AB) consistente
- Interface em português brasileiro aplicada uniformemente
- Documentos com formatação profissional e informações da empresa

## MÓDULO 2 - RECURSOS HUMANOS: COMPLETAMENTE FINALIZADO ✓

**Status:** Sistema de RH totalmente funcional e pronto para produção
**Funcionalidades:** Gestão completa de colaboradores, documentos, ocorrências, exportações e relatórios
**Documentação:** Todas as funcionalidades documentadas e testadas
**Próximo:** Preparação para Módulo 3 - Sistema de Gestão de Frotas Avançado