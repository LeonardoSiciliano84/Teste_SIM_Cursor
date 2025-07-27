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
  loginSchema 
} from "@shared/schema";
import { z } from "zod";

// Configuração do multer para upload de arquivos
const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'application/pdf'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  }
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
      const vehicleData = insertVehicleSchema.partial().parse(req.body);
      const vehicle = await storage.updateVehicle(req.params.id, vehicleData);
      if (!vehicle) {
        return res.status(404).json({ message: "Veículo não encontrado" });
      }
      res.json(vehicle);
    } catch (error) {
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

      // Header do documento
      doc.fontSize(20).text('FELKA TRANSPORTES', { align: 'center' });
      doc.fontSize(16).text('FICHA TÉCNICA DO VEÍCULO', { align: 'center' });
      doc.moveDown(2);

      // Informações principais
      doc.fontSize(14).text('DADOS PRINCIPAIS', { underline: true });
      doc.fontSize(12)
        .text(`Nome: ${vehicle.name}`)
        .text(`Placa: ${vehicle.plate}`)
        .text(`Marca: ${vehicle.brand || 'N/A'}`)
        .text(`Modelo: ${vehicle.model}`)
        .text(`Ano: ${vehicle.modelYear || 'N/A'}`)
        .text(`Status: ${vehicle.status}`)
        .text(`Localização: ${vehicle.currentLocation || 'N/A'}`)
        .moveDown();

      // Informações financeiras
      doc.fontSize(14).text('INFORMAÇÕES FINANCEIRAS', { underline: true });
      doc.fontSize(12)
        .text(`Valor de Compra: R$ ${vehicle.purchaseValue ? parseFloat(vehicle.purchaseValue).toLocaleString('pt-BR') : 'N/A'}`)
        .text(`Valor FIPE: R$ ${vehicle.fipeValue ? parseFloat(vehicle.fipeValue).toLocaleString('pt-BR') : 'N/A'}`)
        .text(`Instituição Financeira: ${vehicle.financialInstitution || 'N/A'}`)
        .text(`Tipo de Contrato: ${vehicle.contractType || 'N/A'}`)
        .text(`Parcelas: ${vehicle.installmentCount || 'N/A'}`)
        .text(`Valor da Parcela: R$ ${vehicle.installmentValue ? parseFloat(vehicle.installmentValue).toLocaleString('pt-BR') : 'N/A'}`)
        .moveDown();

      // Especificações técnicas
      doc.fontSize(14).text('ESPECIFICAÇÕES TÉCNICAS', { underline: true });
      doc.fontSize(12)
        .text(`Largura: ${vehicle.bodyWidth || 'N/A'} m`)
        .text(`Comprimento: ${vehicle.bodyLength || 'N/A'} m`)
        .text(`Altura do Piso: ${vehicle.floorHeight || 'N/A'} m`)
        .text(`Capacidade de Carga: ${vehicle.loadCapacity || 'N/A'} kg`)
        .text(`Capacidade do Tanque: ${vehicle.fuelTankCapacity || 'N/A'} L`)
        .text(`Consumo: ${vehicle.fuelConsumption || 'N/A'} km/L`)
        .moveDown();

      // Documentação
      doc.fontSize(14).text('DOCUMENTAÇÃO', { underline: true });
      doc.fontSize(12)
        .text(`CRLV: ${vehicle.crlvExpiry ? `Vence em ${new Date(vehicle.crlvExpiry).toLocaleDateString('pt-BR')}` : 'N/A'}`)
        .text(`Tacógrafo: ${vehicle.tachographExpiry ? `Vence em ${new Date(vehicle.tachographExpiry).toLocaleDateString('pt-BR')}` : 'N/A'}`)
        .text(`ANTT: ${vehicle.anttExpiry ? `Vence em ${new Date(vehicle.anttExpiry).toLocaleDateString('pt-BR')}` : 'N/A'}`)
        .text(`Seguro: ${vehicle.insuranceExpiry ? `Vence em ${new Date(vehicle.insuranceExpiry).toLocaleDateString('pt-BR')}` : 'N/A'}`)
        .moveDown();

      // Footer
      doc.fontSize(10)
        .text(`Gerado em: ${new Date().toLocaleString('pt-BR')}`, { align: 'center' })
        .text('Sistema FELKA Transportes', { align: 'center' });

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

  const httpServer = createServer(app);
  return httpServer;
}
