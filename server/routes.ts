import type { Express } from "express";
import { createServer, type Server } from "http";
import multer from "multer";
import PDFDocument from "pdfkit";
import { storage } from "./storage";
import { 
  insertVehicleSchema, 
  insertDriverSchema, 
  insertRouteSchema, 
  insertBookingSchema,
  loginSchema,
  insertEmployeeSchema,
  insertEmployeeDependentSchema,
  insertEmployeeDocumentSchema,

  insertEmployeeMovementSchema,
  insertEmployeeFileSchema
} from "@shared/schema";
import { z } from "zod";

// Configuração do multer para upload de arquivos
const upload = multer({ 
  dest: 'uploads/',
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

export async function registerRoutes(app: Express): Promise<Server> {
  // Authentication routes
  app.post("/api/auth/login", async (req, res) => {
    try {
      const credentials = loginSchema.parse(req.body);
      const user = await storage.authenticateUser(credentials);
      
      if (!user) {
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      // In a real app, you'd set up proper session management here
      res.json({ user: { id: user.id, email: user.email, name: user.name, role: user.role } });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const stats = await storage.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar estatísticas" });
    }
  });

  // Vehicle routes
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar veículos" });
    }
  });

  app.get("/api/vehicles/:id", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Veículo não encontrado" });
      }
      res.json(vehicle);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar veículo" });
    }
  });

  app.post("/api/vehicles", async (req, res) => {
    try {
      const vehicleData = insertVehicleSchema.parse(req.body);
      const vehicle = await storage.createVehicle(vehicleData);
      res.status(201).json(vehicle);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar veículo" });
    }
  });

  app.patch("/api/vehicles/:id", async (req, res) => {
    try {
      // Preparar dados para validação, convertendo strings de data para Date objects
      const bodyData = { ...req.body };
      
      // Converter campos de data se existirem
      const dateFields = ['purchaseDate', 'crlvExpiry', 'tachographExpiry', 'anttExpiry', 'insuranceExpiry'];
      dateFields.forEach(field => {
        if (bodyData[field] && typeof bodyData[field] === 'string') {
          bodyData[field] = new Date(bodyData[field]);
        }
      });

      const vehicleData = insertVehicleSchema.partial().parse(bodyData);
      const vehicle = await storage.updateVehicle(req.params.id, vehicleData);
      if (!vehicle) {
        return res.status(404).json({ message: "Veículo não encontrado" });
      }
      res.json(vehicle);
    } catch (error) {
      console.error('Erro ao atualizar veículo:', error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar veículo" });
    }
  });

  app.delete("/api/vehicles/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteVehicle(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Veículo não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar veículo" });
    }
  });

  // Rota para geração de PDF do veículo
  app.get("/api/vehicles/:id/pdf", async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Veículo não encontrado" });
      }

      const doc = new PDFDocument();
      
      // Configurar headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ficha_${vehicle.plate}_${vehicle.name.replace(/\s+/g, '_')}.pdf`);
      
      // Pipe do PDF para a resposta
      doc.pipe(res);

      // Aplicar cabeçalho e rodapé padronizado
      let yPos = addFelkaHeaderAndFooter(doc, 'FICHA TÉCNICA DO VEÍCULO');
      yPos += 10;

      // Informações principais
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('DADOS PRINCIPAIS', 50, yPos);
      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`Nome: ${vehicle.name}`, 50, yPos); yPos += 15;
      doc.text(`Placa: ${vehicle.plate}`, 50, yPos); yPos += 15;
      doc.text(`Marca: ${vehicle.brand || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Modelo: ${vehicle.model}`, 50, yPos); yPos += 15;
      doc.text(`Ano: ${vehicle.modelYear || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Status: ${vehicle.status}`, 50, yPos); yPos += 15;
      doc.text(`Localização: ${vehicle.currentLocation || 'N/A'}`, 50, yPos); yPos += 25;

      // Informações financeiras
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('INFORMAÇÕES FINANCEIRAS', 50, yPos);
      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`Valor de Compra: R$ ${vehicle.purchaseValue ? parseFloat(vehicle.purchaseValue).toLocaleString('pt-BR') : 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Valor FIPE: R$ ${vehicle.fipeValue ? parseFloat(vehicle.fipeValue).toLocaleString('pt-BR') : 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Instituição Financeira: ${vehicle.financialInstitution || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Tipo de Contrato: ${vehicle.contractType || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Parcelas: ${vehicle.installmentCount || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Valor da Parcela: R$ ${vehicle.installmentValue ? parseFloat(vehicle.installmentValue).toLocaleString('pt-BR') : 'N/A'}`, 50, yPos); yPos += 25;

      // Especificações técnicas
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('ESPECIFICAÇÕES TÉCNICAS', 50, yPos);
      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`Largura: ${vehicle.bodyWidth || 'N/A'} m`, 50, yPos); yPos += 15;
      doc.text(`Comprimento: ${vehicle.bodyLength || 'N/A'} m`, 50, yPos); yPos += 15;
      doc.text(`Altura do Piso: ${vehicle.floorHeight || 'N/A'} m`, 50, yPos); yPos += 15;
      doc.text(`Capacidade de Carga: ${vehicle.loadCapacity || 'N/A'} kg`, 50, yPos); yPos += 15;
      doc.text(`Capacidade do Tanque: ${vehicle.fuelTankCapacity || 'N/A'} L`, 50, yPos); yPos += 15;
      doc.text(`Consumo: ${vehicle.fuelConsumption || 'N/A'} km/L`, 50, yPos); yPos += 25;

      // Documentação
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('DOCUMENTAÇÃO', 50, yPos);
      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`CRLV: ${vehicle.crlvExpiry ? `Vence em ${new Date(vehicle.crlvExpiry).toLocaleDateString('pt-BR')}` : 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Tacógrafo: ${vehicle.tachographExpiry ? `Vence em ${new Date(vehicle.tachographExpiry).toLocaleDateString('pt-BR')}` : 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`ANTT: ${vehicle.anttExpiry ? `Vence em ${new Date(vehicle.anttExpiry).toLocaleDateString('pt-BR')}` : 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Seguro: ${vehicle.insuranceExpiry ? `Vence em ${new Date(vehicle.insuranceExpiry).toLocaleDateString('pt-BR')}` : 'N/A'}`, 50, yPos);

      doc.end();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ message: "Erro ao gerar PDF" });
    }
  });

  // Rota para upload de documentos
  app.post("/api/vehicles/:id/upload", upload.array('files', 10), async (req, res) => {
    try {
      const vehicle = await storage.getVehicle(req.params.id);
      if (!vehicle) {
        return res.status(404).json({ message: "Veículo não encontrado" });
      }

      const files = req.files as Express.Multer.File[];
      if (!files || files.length === 0) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      // Em um sistema real, você salvaria os arquivos no disco ou cloud storage
      // Aqui vamos simular o processo
      const uploadedFiles = files.map(file => ({
        filename: file.originalname,
        mimetype: file.mimetype,
        size: file.size,
        uploadDate: new Date(),
      }));

      res.json({ 
        message: `${files.length} arquivo(s) enviado(s) com sucesso`,
        files: uploadedFiles 
      });
    } catch (error) {
      console.error('Erro no upload:', error);
      res.status(500).json({ message: "Erro no upload de arquivos" });
    }
  });

  // Driver routes
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar motoristas" });
    }
  });

  app.get("/api/drivers/:id", async (req, res) => {
    try {
      const driver = await storage.getDriver(req.params.id);
      if (!driver) {
        return res.status(404).json({ message: "Motorista não encontrado" });
      }
      res.json(driver);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar motorista" });
    }
  });

  app.post("/api/drivers", async (req, res) => {
    try {
      const driverData = insertDriverSchema.parse(req.body);
      const driver = await storage.createDriver(driverData);
      res.status(201).json(driver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar motorista" });
    }
  });

  app.patch("/api/drivers/:id", async (req, res) => {
    try {
      const driverData = insertDriverSchema.partial().parse(req.body);
      const driver = await storage.updateDriver(req.params.id, driverData);
      if (!driver) {
        return res.status(404).json({ message: "Motorista não encontrado" });
      }
      res.json(driver);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar motorista" });
    }
  });

  app.delete("/api/drivers/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteDriver(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Motorista não encontrado" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar motorista" });
    }
  });

  // Route routes
  app.get("/api/routes", async (req, res) => {
    try {
      const routes = await storage.getRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar rotas" });
    }
  });

  app.get("/api/routes/active", async (req, res) => {
    try {
      const routes = await storage.getActiveRoutes();
      res.json(routes);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar rotas ativas" });
    }
  });

  app.post("/api/routes", async (req, res) => {
    try {
      const routeData = insertRouteSchema.parse(req.body);
      const route = await storage.createRoute(routeData);
      res.status(201).json(route);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar rota" });
    }
  });

  app.patch("/api/routes/:id", async (req, res) => {
    try {
      const routeData = insertRouteSchema.partial().parse(req.body);
      const route = await storage.updateRoute(req.params.id, routeData);
      if (!route) {
        return res.status(404).json({ message: "Rota não encontrada" });
      }
      res.json(route);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar rota" });
    }
  });

  // Booking routes
  app.get("/api/bookings", async (req, res) => {
    try {
      const bookings = await storage.getBookings();
      res.json(bookings);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar reservas" });
    }
  });

  app.get("/api/bookings/:id", async (req, res) => {
    try {
      const booking = await storage.getBooking(req.params.id);
      if (!booking) {
        return res.status(404).json({ message: "Reserva não encontrada" });
      }
      res.json(booking);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar reserva" });
    }
  });

  app.post("/api/bookings", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.parse(req.body);
      const booking = await storage.createBooking(bookingData);
      res.status(201).json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar reserva" });
    }
  });

  app.patch("/api/bookings/:id", async (req, res) => {
    try {
      const bookingData = insertBookingSchema.partial().parse(req.body);
      const booking = await storage.updateBooking(req.params.id, bookingData);
      if (!booking) {
        return res.status(404).json({ message: "Reserva não encontrada" });
      }
      res.json(booking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar reserva" });
    }
  });

  app.delete("/api/bookings/:id", async (req, res) => {
    try {
      const deleted = await storage.deleteBooking(req.params.id);
      if (!deleted) {
        return res.status(404).json({ message: "Reserva não encontrada" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Erro ao deletar reserva" });
    }
  });

  // Analytics routes
  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      // Mock analytics data - in real app would query from database
      const revenueData = [
        { month: 'Jan', revenue: 25000 },
        { month: 'Fev', revenue: 30000 },
        { month: 'Mar', revenue: 35000 },
        { month: 'Abr', revenue: 32000 },
        { month: 'Mai', revenue: 42000 },
        { month: 'Jun', revenue: 38000 },
      ];
      res.json(revenueData);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar dados de receita" });
    }
  });

  app.get("/api/analytics/trip-categories", async (req, res) => {
    try {
      // Mock trip categories data
      const tripCategoriesData = [
        { type: 'Carga Geral', count: 45, percentage: 45 },
        { type: 'Mudanças', count: 25, percentage: 25 },
        { type: 'Entrega Expressa', count: 20, percentage: 20 },
        { type: 'Transporte de Veículos', count: 10, percentage: 10 },
      ];
      res.json(tripCategoriesData);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar categorias de viagem" });
    }
  });

  // ============= ROTAS DE RH =============

  // Employee routes
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar colaboradores" });
    }
  });

  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar colaborador" });
    }
  });

  app.post("/api/employees", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.parse(req.body);
      const employee = await storage.createEmployee(employeeData);
      res.status(201).json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar colaborador" });
    }
  });

  app.patch("/api/employees/:id", async (req, res) => {
    try {
      const employeeData = insertEmployeeSchema.partial().parse(req.body);
      const employee = await storage.updateEmployee(req.params.id, employeeData);
      if (!employee) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }
      res.json(employee);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao atualizar colaborador" });
    }
  });

  app.delete("/api/employees/:id", async (req, res) => {
    try {
      const success = await storage.deleteEmployee(req.params.id);
      if (!success) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }
      res.json({ message: "Colaborador removido com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao remover colaborador" });
    }
  });

  // Desativar colaborador
  app.patch("/api/employees/:id/deactivate", async (req, res) => {
    try {
      const { reason, changedBy } = req.body;
      if (!reason || !changedBy) {
        return res.status(400).json({ message: "Motivo e responsável são obrigatórios" });
      }
      
      const employee = await storage.deactivateEmployee(req.params.id, reason, changedBy);
      if (!employee) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Erro ao desativar colaborador" });
    }
  });

  // Reativar colaborador
  app.patch("/api/employees/:id/reactivate", async (req, res) => {
    try {
      const { reason, changedBy } = req.body;
      if (!reason || !changedBy) {
        return res.status(400).json({ message: "Motivo e responsável são obrigatórios" });
      }
      
      const employee = await storage.reactivateEmployee(req.params.id, reason, changedBy);
      if (!employee) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }
      res.json(employee);
    } catch (error) {
      res.status(500).json({ message: "Erro ao reativar colaborador" });
    }
  });

  // Função auxiliar para cabeçalho e rodapé padronizado FELKA
  const addFelkaHeaderAndFooter = (doc: any, title: string) => {
    // Cabeçalho oficial FELKA
    doc.fontSize(16).font('Helvetica-Bold').fillColor('#0C29AB')
       .text('FELKA TRANSPORTES LTDA', 50, 25);
    
    doc.fontSize(8).font('Helvetica').fillColor('black')
       .text('CNPJ: 01.234.567/0001-89 | Inscrição Estadual: 123.456.789.123', 50, 45)
       .text('Rua das Indústrias, 2500 - Distrito Industrial - São Paulo/SP - CEP: 08150-000', 50, 58)
       .text('Tel: (11) 2345-6789 | Email: comercial@felkatransportes.com.br', 50, 71)
       .text('Site: www.felkatransportes.com.br', 50, 84);
    
    // Linha dupla separadora (estilo timbrado)
    doc.strokeColor('#0C29AB').lineWidth(1.5)
       .moveTo(50, 100).lineTo(545, 100).stroke()
       .moveTo(50, 103).lineTo(545, 103).stroke();
    
    // Título do documento centralizado
    doc.fontSize(14).font('Helvetica-Bold').fillColor('#0C29AB')
       .text(title, 0, 120, { width: doc.page.width, align: 'center' });
    
    // Linha separadora do título
    doc.strokeColor('black').lineWidth(0.5)
       .moveTo(50, 143).lineTo(545, 143).stroke();
    
    // Rodapé com informações legais
    const pageHeight = doc.page.height;
    
    // Linha separadora do rodapé
    doc.strokeColor('#0C29AB').lineWidth(0.5)
       .moveTo(50, pageHeight - 70).lineTo(545, pageHeight - 70).stroke();
    
    doc.fontSize(7).font('Helvetica').fillColor('black')
       .text('FELKA TRANSPORTES LTDA - Licença ANTT: 123456789', 50, pageHeight - 60)
       .text('Este documento foi gerado eletronicamente e possui validade legal conforme MP 2.200-2/2001', 50, pageHeight - 50)
       .text(`Emissão: ${new Date().toLocaleDateString('pt-BR')} às ${new Date().toLocaleTimeString('pt-BR')} | Sistema FELKA v2.0`, 50, pageHeight - 40)
       .text('Página 1 de 1', 500, pageHeight - 40);
    
    return 160; // Posição Y inicial para conteúdo
  };

  // Employee PDF generation
  app.get("/api/employees/:id/pdf", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }

      const doc = new PDFDocument();
      
      // Configurar headers para download
      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', `attachment; filename=ficha_${employee.fullName.replace(/\s+/g, '_')}_${employee.employeeNumber}.pdf`);
      
      // Pipe do PDF para a resposta
      doc.pipe(res);

      // Aplicar cabeçalho e rodapé padronizado
      let yPos = addFelkaHeaderAndFooter(doc, 'FICHA DO COLABORADOR');
      yPos += 10;

      // Informações principais
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('DADOS PESSOAIS', 50, yPos);
      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`Nome Completo: ${employee.fullName}`, 50, yPos); yPos += 15;
      doc.text(`CPF: ${employee.cpf}`, 50, yPos); yPos += 15;
      doc.text(`RG: ${employee.rg || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Matrícula: #${employee.employeeNumber}`, 50, yPos); yPos += 15;
      doc.text(`Data de Nascimento: ${employee.birthDate ? new Date(employee.birthDate).toLocaleDateString('pt-BR') : 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Gênero: ${employee.gender || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Estado Civil: ${employee.maritalStatus || 'N/A'}`, 50, yPos); yPos += 25;

      // Contato
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('DADOS DE CONTATO', 50, yPos);
      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`Telefone: ${employee.phone}`, 50, yPos); yPos += 15;
      doc.text(`E-mail Corporativo: ${employee.email || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`E-mail Pessoal: ${employee.personalEmail || 'N/A'}`, 50, yPos); yPos += 25;

      // Endereço
      if (employee.address) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('ENDEREÇO', 50, yPos);
        yPos += 20;
        doc.fontSize(10).font('Helvetica').fillColor('black')
          .text(`Endereço: ${employee.address}`, 50, yPos); yPos += 15;
        doc.text(`Cidade: ${employee.city || 'N/A'} - ${employee.state || 'N/A'}`, 50, yPos); yPos += 15;
        doc.text(`CEP: ${employee.zipCode || 'N/A'}`, 50, yPos); yPos += 25;
      }

      // Informações Profissionais
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('DADOS PROFISSIONAIS', 50, yPos);
      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`Cargo: ${employee.position}`, 50, yPos); yPos += 15;
      doc.text(`Departamento: ${employee.department}`, 50, yPos); yPos += 15;
      doc.text(`Data de Admissão: ${employee.admissionDate ? new Date(employee.admissionDate).toLocaleDateString('pt-BR') : 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Status: ${employee.status === 'active' ? 'Ativo' : 'Inativo'}`, 50, yPos); yPos += 15;
      doc.text(`Gestor: ${employee.manager || 'N/A'}`, 50, yPos); yPos += 15;
      doc.text(`Horário de Trabalho: ${employee.workSchedule || 'N/A'}`, 50, yPos); yPos += 25;

      // Informações Salariais (se disponível)
      if (employee.salary) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('INFORMAÇÕES SALARIAIS', 50, yPos);
        yPos += 20;
        doc.fontSize(10).font('Helvetica').fillColor('black')
          .text(`Salário Base: ${new Intl.NumberFormat('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          }).format(Number(employee.salary))}`, 50, yPos); yPos += 25;
      }

      // Dados Educacionais (se disponível)
      if (employee.education) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('FORMAÇÃO ACADÊMICA', 50, yPos);
        yPos += 20;
        doc.fontSize(10).font('Helvetica').fillColor('black')
          .text(`Escolaridade: ${employee.education}`, 50, yPos); yPos += 15;
        doc.text(`Curso: ${employee.course || 'N/A'}`, 50, yPos); yPos += 15;
        doc.text(`Instituição: ${employee.institution || 'N/A'}`, 50, yPos); yPos += 25;
      }

      doc.end();
    } catch (error) {
      console.error('Erro ao gerar PDF do colaborador:', error);
      res.status(500).json({ message: "Erro ao gerar PDF" });
    }
  });

  // Employee Documents routes
  app.get("/api/employees/:id/documents", async (req, res) => {
    try {
      const documents = await storage.getEmployeeDocuments(req.params.id);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar documentos" });
    }
  });

  app.get("/api/employees/documents/expiring", async (req, res) => {
    try {
      const days = req.query.days ? parseInt(req.query.days as string) : 30;
      const documents = await storage.getExpiringDocuments(days);
      res.json(documents);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar documentos vencendo" });
    }
  });

  app.post("/api/employees/:id/documents", async (req, res) => {
    try {
      const documentData = insertEmployeeDocumentSchema.parse({
        ...req.body,
        employeeId: req.params.id
      });
      const document = await storage.createEmployeeDocument(documentData);
      res.status(201).json(document);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar documento" });
    }
  });

  // Upload de documento com arquivo
  app.post("/api/employees/:id/documents/upload", upload.single('file'), async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }

      const file = req.file;
      if (!file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }

      const documentData = JSON.parse(req.body.documentData);
      const fullDocumentData = {
        ...documentData,
        employeeId: req.params.id,
        filename: file.originalname,
        fileSize: file.size,
        mimeType: file.mimetype,
        // Em produção, salvar arquivo em storage e definir fileUrl
        fileUrl: `/uploads/documents/${req.params.id}/${file.originalname}`,
      };

      const document = await storage.createEmployeeDocument(fullDocumentData);
      res.status(201).json(document);
    } catch (error) {
      console.error('Erro no upload de documento:', error);
      res.status(500).json({ message: "Erro ao fazer upload do documento" });
    }
  });

  // Download de documento
  app.get("/api/employees/:id/documents/:documentId/download", async (req, res) => {
    try {
      const document = await storage.getEmployeeDocument(req.params.documentId);
      if (!document || document.employeeId !== req.params.id) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }

      // Em produção, buscar arquivo do storage e retornar
      res.status(200).json({ message: "Download simulado", filename: document.filename });
    } catch (error) {
      res.status(500).json({ message: "Erro ao baixar documento" });
    }
  });

  // Deletar documento
  app.delete("/api/employees/:id/documents/:documentId", async (req, res) => {
    try {
      const success = await storage.deleteEmployeeDocument(req.params.documentId);
      if (!success) {
        return res.status(404).json({ message: "Documento não encontrado" });
      }
      res.json({ message: "Documento removido com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao remover documento" });
    }
  });

  // === EMPLOYEE OCCURRENCES ROUTES ===

  // Listar ocorrências de um colaborador
  app.get("/api/employees/:id/occurrences", async (req, res) => {
    try {
      const occurrences = await storage.getEmployeeOccurrences(req.params.id);
      res.json(occurrences);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar ocorrências" });
    }
  });

  // Criar nova ocorrência
  app.post("/api/employees/:id/occurrences", async (req, res) => {
    try {
      const occurrenceData = {
        employeeId: req.params.id,
        title: req.body.title,
        occurrenceType: req.body.occurrenceType,
        description: req.body.description,
        occurrenceDate: req.body.occurrenceDate,
        requestedById: req.body.requestedById,
        status: "active"
      };
      
      const occurrence = await storage.createEmployeeOccurrence(occurrenceData);
      res.status(201).json(occurrence);
    } catch (error) {
      console.error("Erro ao criar ocorrência:", error);
      res.status(500).json({ message: "Erro ao criar ocorrência", error: error.message });
    }
  });

  // Gerar documento PDF da ocorrência
  app.get("/api/employees/:id/occurrences/:occurrenceId/document", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      const occurrence = await storage.getEmployeeOccurrence(req.params.occurrenceId);
      
      if (!employee || !occurrence) {
        return res.status(404).json({ message: "Colaborador ou ocorrência não encontrado" });
      }

      const doc = new PDFDocument();
      let buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ocorrencia-${occurrence.id}.pdf"`);
        res.send(pdfData);
      });

      // Aplicar cabeçalho e rodapé padronizado
      let yPos = addFelkaHeaderAndFooter(doc, 'REGISTRO DE OCORRÊNCIA');
      yPos += 10;
      
      // Dados do colaborador
      doc.fontSize(12).font('Helvetica-Bold').text('DADOS DO COLABORADOR:', 50, yPos);
      yPos += 20;
      doc.font('Helvetica').text(`Nome: ${employee.fullName}`, 50, yPos);
      yPos += 15;
      doc.text(`CPF: ${employee.cpf}`, 50, yPos);
      yPos += 15;
      doc.text(`Matrícula: ${employee.employeeNumber}`, 50, yPos);
      yPos += 15;
      doc.text(`Cargo: ${employee.position}`, 50, yPos);
      yPos += 15;
      doc.text(`Departamento: ${employee.department}`, 50, yPos);
      yPos += 30;

      // Dados da ocorrência
      doc.font('Helvetica-Bold').text('DADOS DA OCORRÊNCIA:', 50, yPos);
      yPos += 20;
      doc.font('Helvetica').text(`Título: ${occurrence.title}`, 50, yPos);
      yPos += 15;
      doc.text(`Tipo: ${occurrence.occurrenceType}`, 50, yPos);
      yPos += 15;
      doc.text(`Data da Ocorrência: ${new Date(occurrence.occurrenceDate).toLocaleDateString('pt-BR')}`, 50, yPos);
      yPos += 15;
      doc.text(`Solicitante: ${occurrence.requestedById}`, 50, yPos);
      yPos += 20;

      // Descrição
      doc.font('Helvetica-Bold').text('DESCRIÇÃO:', 50, yPos);
      yPos += 15;
      doc.font('Helvetica').text(occurrence.description, 50, yPos, { width: 495 });
      yPos += Math.ceil(occurrence.description.length / 80) * 15 + 20;

      // Ação requerida (se houver)
      if ((occurrence as any).actionRequired) {
        doc.font('Helvetica-Bold').text('AÇÃO REQUERIDA:', 50, yPos);
        yPos += 15;
        doc.font('Helvetica').text((occurrence as any).actionRequired, 50, yPos, { width: 495 });
        yPos += Math.ceil(((occurrence as any).actionRequired as string).length / 80) * 15 + 20;
      }

      // Assinaturas
      yPos += 30;
      doc.font('Helvetica-Bold').text('ASSINATURAS:', 50, yPos);
      yPos += 40;
      
      doc.text('_________________________________', 50, yPos);
      doc.text('Colaborador', 50, yPos + 15);
      
      doc.text('_________________________________', 300, yPos);
      doc.text('Gestor Solicitante', 300, yPos + 15);
      
      yPos += 60;
      doc.text('_________________________________', 50, yPos);
      doc.text('RH', 50, yPos + 15);
      
      doc.text('_________________________________', 300, yPos);
      doc.text('Data: ___/___/_____', 300, yPos + 15);

      doc.end();
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      res.status(500).json({ message: "Erro ao gerar documento" });
    }
  });

  // Atualizar ocorrência
  app.patch("/api/employees/:id/occurrences/:occurrenceId", async (req, res) => {
    try {
      const occurrence = await storage.updateEmployeeOccurrence(req.params.occurrenceId, req.body);
      if (!occurrence) {
        return res.status(404).json({ message: "Ocorrência não encontrada" });
      }
      res.json(occurrence);
    } catch (error) {
      res.status(500).json({ message: "Erro ao atualizar ocorrência" });
    }
  });

  // Deletar ocorrência
  app.delete("/api/employees/:id/occurrences/:occurrenceId", async (req, res) => {
    try {
      const success = await storage.deleteEmployeeOccurrence(req.params.occurrenceId);
      if (!success) {
        return res.status(404).json({ message: "Ocorrência não encontrada" });
      }
      res.json({ message: "Ocorrência removida com sucesso" });
    } catch (error) {
      res.status(500).json({ message: "Erro ao remover ocorrência" });
    }
  });

  // Listar todas as ocorrências (para relatório geral)
  app.get("/api/occurrences/all", async (req, res) => {
    try {
      const allOccurrences = await storage.getAllOccurrences();
      res.json(allOccurrences);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar ocorrências" });
    }
  });

  // Gerar relatório completo de ocorrências
  app.get("/api/occurrences/report", async (req, res) => {
    try {
      const allOccurrences = await storage.getAllOccurrences();
      const employees = await storage.getEmployees();
      
      const doc = new PDFDocument();
      let buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="relatorio-ocorrencias-${new Date().toISOString().split('T')[0]}.pdf"`);
        res.send(pdfData);
      });

      // Aplicar cabeçalho e rodapé padronizado
      let yPos = addFelkaHeaderAndFooter(doc, 'RELATÓRIO GERAL DE OCORRÊNCIAS');
      yPos += 10;
      
      // Estatísticas gerais
      doc.fontSize(12).font('Helvetica-Bold').text('ESTATÍSTICAS GERAIS:', 50, yPos);
      yPos += 20;
      doc.font('Helvetica').text(`Total de Ocorrências: ${allOccurrences.length}`, 50, yPos);
      yPos += 15;
      doc.text(`Colaboradores Afetados: ${new Set(allOccurrences.map((o: any) => o.employeeId)).size}`, 50, yPos);
      yPos += 30;

      // Lista de ocorrências
      doc.font('Helvetica-Bold').text('HISTÓRICO DE OCORRÊNCIAS:', 50, yPos);
      yPos += 20;

      allOccurrences.forEach((occurrence: any, index: number) => {
        if (yPos > 700) {
          doc.addPage();
          yPos = 50;
        }

        const employee = employees.find((emp: any) => emp.id === occurrence.employeeId);
        const employeeName = employee ? employee.fullName : 'Colaborador não encontrado';

        doc.font('Helvetica-Bold').text(`${index + 1}. ${occurrence.title}`, 50, yPos);
        yPos += 15;
        doc.font('Helvetica').text(`Colaborador: ${employeeName}`, 60, yPos);
        yPos += 12;
        doc.text(`Tipo: ${occurrence.occurrenceType}`, 60, yPos);
        yPos += 12;
        doc.text(`Data: ${new Date(occurrence.occurrenceDate).toLocaleDateString('pt-BR')}`, 60, yPos);
        yPos += 12;
        doc.text(`Solicitante: ${occurrence.requestedById}`, 60, yPos);
        yPos += 12;
        doc.text(`Descrição: ${occurrence.description}`, 60, yPos, { width: 485 });
        yPos += Math.ceil(occurrence.description.length / 80) * 12 + 15;
      });

      doc.end();
    } catch (error) {
      console.error('Erro ao gerar relatório:', error);
      res.status(500).json({ message: "Erro ao gerar relatório" });
    }
  });

  // Employee Dependents routes
  app.get("/api/employees/:id/dependents", async (req, res) => {
    try {
      const dependents = await storage.getEmployeeDependents(req.params.id);
      res.json(dependents);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar dependentes" });
    }
  });

  app.post("/api/employees/:id/dependents", async (req, res) => {
    try {
      const dependentData = insertEmployeeDependentSchema.parse({
        ...req.body,
        employeeId: req.params.id
      });
      const dependent = await storage.createEmployeeDependent(dependentData);
      res.status(201).json(dependent);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar dependente" });
    }
  });

  // Employee Occurrences routes
  app.get("/api/employees/:id/occurrences", async (req, res) => {
    try {
      const occurrences = await storage.getEmployeeOccurrences(req.params.id);
      res.json(occurrences);
    } catch (error) {
      res.status(500).json({ message: "Erro ao carregar ocorrências" });
    }
  });

  app.post("/api/employees/:id/occurrences", async (req, res) => {
    try {
      const occurrenceData = insertEmployeeOccurrenceSchema.parse({
        ...req.body,
        employeeId: req.params.id
      });
      const occurrence = await storage.createEmployeeOccurrence(occurrenceData);
      res.status(201).json(occurrence);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar ocorrência" });
    }
  });

  // Employee with occurrences PDF (PDF completo com histórico)
  app.get("/api/employees/:id/pdf-with-occurrences", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      const occurrences = await storage.getEmployeeOccurrences(req.params.id);
      
      if (!employee) {
        return res.status(404).json({ message: "Colaborador não encontrado" });
      }

      const doc = new PDFDocument();
      let buffers: Buffer[] = [];
      doc.on('data', buffers.push.bind(buffers));
      doc.on('end', () => {
        const pdfData = Buffer.concat(buffers);
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="ficha_completa_${employee.fullName.replace(/\s+/g, '_')}_${employee.employeeNumber}.pdf"`);
        res.send(pdfData);
      });

      // Aplicar cabeçalho e rodapé padronizado
      let yPos = addFelkaHeaderAndFooter(doc, 'FICHA COMPLETA DO COLABORADOR');
      yPos += 10;
      
      // Dados pessoais básicos
      doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('DADOS PESSOAIS', 50, yPos);
      yPos += 20;
      doc.fontSize(10).font('Helvetica').fillColor('black')
        .text(`Nome: ${employee.fullName}`, 50, yPos); yPos += 15;
      doc.text(`CPF: ${employee.cpf}`, 50, yPos); yPos += 15;
      doc.text(`Matrícula: ${employee.employeeNumber}`, 50, yPos); yPos += 15;
      doc.text(`Cargo: ${employee.position}`, 50, yPos); yPos += 15;
      doc.text(`Departamento: ${employee.department}`, 50, yPos); yPos += 15;
      doc.text(`Status: ${employee.status === 'active' ? 'Ativo' : 'Inativo'}`, 50, yPos); yPos += 30;

      // Histórico de ocorrências
      if (occurrences.length > 0) {
        doc.fontSize(12).font('Helvetica-Bold').fillColor('#0C29AB').text('HISTÓRICO DE OCORRÊNCIAS', 50, yPos);
        yPos += 20;
        
        occurrences.forEach((occurrence, index) => {
          if (yPos > 650) {
            doc.addPage();
            yPos = addFelkaHeaderAndFooter(doc, 'FICHA COMPLETA DO COLABORADOR - CONTINUAÇÃO');
            yPos += 10;
          }
          
          doc.fontSize(10).font('Helvetica-Bold').fillColor('black')
            .text(`${index + 1}. ${occurrence.title}`, 50, yPos); yPos += 15;
          doc.fontSize(9).font('Helvetica').fillColor('black')
            .text(`Tipo: ${occurrence.occurrenceType}`, 70, yPos); yPos += 12;
          doc.text(`Data: ${new Date(occurrence.occurrenceDate).toLocaleDateString('pt-BR')}`, 70, yPos); yPos += 12;
          doc.text(`Descrição: ${occurrence.description}`, 70, yPos, { width: 475 }); 
          yPos += Math.ceil(occurrence.description.length / 80) * 12 + 15;
        });
      } else {
        doc.fontSize(10).font('Helvetica').fillColor('black')
          .text('Nenhuma ocorrência registrada para este colaborador', 50, yPos);
      }
      
      doc.end();
    } catch (error) {
      console.error('Erro ao gerar PDF completo:', error);
      res.status(500).json({ message: "Erro ao gerar documento" });
    }
  });

  // Export employees to XLSX
  app.get("/api/employees/export/xlsx", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      const XLSX = require('xlsx');
      
      // Preparar dados para planilha
      const worksheetData = employees.map(emp => ({
        'Nome': emp.fullName,
        'CPF': emp.cpf,
        'Matrícula': emp.employeeNumber,
        'Cargo': emp.position,
        'Departamento': emp.department,
        'Status': emp.status === 'active' ? 'Ativo' : 'Inativo',
        'Data Admissão': emp.admissionDate ? new Date(emp.admissionDate).toLocaleDateString('pt-BR') : '',
        'Telefone': emp.phone || '',
        'Email': emp.email || '',
        'Salário': emp.salary ? Number(emp.salary) : ''
      }));
      
      // Criar workbook e worksheet
      const workbook = XLSX.utils.book_new();
      const worksheet = XLSX.utils.json_to_sheet(worksheetData);
      
      // Definir larguras das colunas
      const columnWidths = [
        { wch: 25 }, // Nome
        { wch: 15 }, // CPF
        { wch: 12 }, // Matrícula
        { wch: 20 }, // Cargo
        { wch: 20 }, // Departamento
        { wch: 10 }, // Status
        { wch: 15 }, // Data Admissão
        { wch: 15 }, // Telefone
        { wch: 25 }, // Email
        { wch: 12 }  // Salário
      ];
      worksheet['!cols'] = columnWidths;
      
      // Adicionar worksheet ao workbook
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Colaboradores');
      
      // Gerar buffer do arquivo
      const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
      
      // Configurar headers para download
      res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
      res.setHeader('Content-Disposition', 'attachment; filename="colaboradores.xlsx"');
      res.send(buffer);
    } catch (error) {
      console.error('Erro ao exportar colaboradores:', error);
      res.status(500).json({ message: "Erro ao exportar colaboradores" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
