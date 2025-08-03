import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";

export async function registerRoutes(app: Express): Promise<Server> {
  // Middleware para CORS
  app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization");
    if (req.method === "OPTIONS") {
      res.sendStatus(200);
    } else {
      next();
    }
  });

  // ============= MÓDULO DE CONTROLE DE ACESSO - CPF E QR CODE =============

  // Buscar visitante por CPF
  app.get("/api/access-control/visitors/search", async (req, res) => {
    try {
      const cpf = req.query.cpf as string;
      
      if (!cpf) {
        return res.status(400).json({ message: "CPF é obrigatório" });
      }

      const visitor = await storage.getVisitorByCpf(cpf);
      
      if (!visitor) {
        return res.status(404).json({ message: "Visitante não encontrado" });
      }

      res.json({ visitor });
    } catch (error) {
      console.error("Erro ao buscar visitante:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Cadastrar/atualizar visitante
  app.post("/api/access-control/visitors", async (req, res) => {
    try {
      const { name, cpf, photo } = req.body;
      
      if (!name || !cpf) {
        return res.status(400).json({ message: "Nome e CPF são obrigatórios" });
      }

      // Limpar formatação do CPF para validação
      const cleanCpf = cpf.replace(/\D/g, '');
      
      if (cleanCpf.length !== 11) {
        return res.status(400).json({ message: "CPF deve ter 11 dígitos" });
      }

      // Verificar se já existe visitante com este CPF
      const existingVisitor = await storage.getVisitorByCpf(cleanCpf);
      
      if (existingVisitor) {
        // Incrementar número de visitas ao invés de sobrescrever
        const updatedVisitor = await storage.incrementVisitorVisits(existingVisitor.id);
        return res.status(200).json({ 
          visitor: updatedVisitor, 
          message: `Visitante ${existingVisitor.name} já cadastrado. Total de visitas: ${updatedVisitor.totalVisits}`,
          isExisting: true
        });
      }
      
      const visitor = await storage.upsertVisitor({
        name,
        cpf: cleanCpf,
        photo: photo || ""
      });

      const message = "Visitante cadastrado com sucesso";

      res.status(201).json({ visitor, message, isExisting: false });
    } catch (error) {
      console.error("Erro ao registrar visitante:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Processar QR Code de funcionário
  app.post("/api/access-control/qrcode", async (req, res) => {
    try {
      const { qrCodeData, accessType } = req.body;
      
      if (!qrCodeData || !accessType) {
        return res.status(400).json({ message: "QR Code e tipo de acesso são obrigatórios" });
      }

      console.log("Processando QR Code:", qrCodeData);
      console.log("Tipo de acesso recebido:", accessType);
      
      // Buscar funcionário pelo QR Code
      const employeeQrCode = await storage.getEmployeeByQrCode(qrCodeData);
      
      console.log("QR Code encontrado:", employeeQrCode);
      
      if (!employeeQrCode) {
        console.log("QR Code não encontrado no sistema");
        return res.status(404).json({ message: "QR Code inválido ou funcionário não encontrado" });
      }

      // Buscar dados completos do funcionário
      const employee = await storage.getEmployee(employeeQrCode.employeeId);
      
      if (!employee) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }

      // Registrar acesso
      console.log("Criando log de acesso com direção:", accessType);
      const accessLog = await storage.createAccessLog({
        personType: "employee",
        personId: employee.id,
        personName: employee.fullName,
        personCpf: employee.cpf,
        direction: accessType,
        accessMethod: "qrcode",
        location: "Portaria Principal"
      });
      console.log("Log de acesso criado:", accessLog);

      res.json({ employee, accessLog, message: "Acesso registrado com sucesso" });
    } catch (error) {
      console.error("Erro ao processar QR Code:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Listar logs de acesso
  app.get("/api/access-control/logs", async (req, res) => {
    try {
      const logs = await storage.getAccessLogs();
      res.json(logs);
    } catch (error) {
      console.error("Erro ao listar logs:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Listar visitantes
  app.get("/api/access-control/visitors", async (req, res) => {
    try {
      const visitors = await storage.getVisitors();
      res.json(visitors);
    } catch (error) {
      console.error("Erro ao listar visitantes:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // ============= ROTAS DE FUNCIONÁRIOS =============
  
  // Listar funcionários
  app.get("/api/employees", async (req, res) => {
    try {
      const employees = await storage.getEmployees();
      res.json(employees);
    } catch (error) {
      console.error("Erro ao listar funcionários:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter funcionário por ID
  app.get("/api/employees/:id", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }
      res.json(employee);
    } catch (error) {
      console.error("Erro ao buscar funcionário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Documentos vencendo (requisito da página de funcionários)
  app.get("/api/employees/documents/expiring", async (req, res) => {
    try {
      // Retorna array vazio por enquanto - pode ser implementado depois
      res.json([]);
    } catch (error) {
      console.error("Erro ao buscar documentos vencendo:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter QR Code do funcionário
  // DEBUG: Listar todos os QR Codes (temporário)
  app.get("/api/debug/qrcodes", async (req, res) => {
    try {
      const allQrCodes = await storage.getAllEmployeeQrCodes();
      console.log("Todos os QR Codes:", allQrCodes);
      res.json(allQrCodes);
    } catch (error) {
      console.error("Erro ao listar QR Codes:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  app.get("/api/employees/:id/qrcode", async (req, res) => {
    try {
      const employee = await storage.getEmployee(req.params.id);
      if (!employee) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }

      // Buscar QR Code existente do funcionário
      const qrCode = await storage.getEmployeeQrCodeByEmployeeId(employee.id);
      
      if (!qrCode) {
        return res.status(404).json({ message: "QR Code não encontrado para este funcionário" });
      }

      res.json({
        employeeId: employee.id,
        employeeName: employee.fullName,
        employeeNumber: employee.employeeNumber,
        qrCodeData: qrCode.qrCodeData,
        isActive: qrCode.isActive
      });
    } catch (error) {
      console.error("Erro ao obter QR Code do funcionário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // ============= OUTRAS ROTAS BÁSICAS =============

  // Dashboard stats
  app.get("/api/dashboard/stats", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      const drivers = await storage.getDrivers();
      const employees = await storage.getEmployees();
      
      res.json({
        totalVehicles: vehicles.length,
        totalDrivers: drivers.length,
        totalEmployees: employees.length,
        activeTrips: vehicles.filter(v => v.status === 'active').length
      });
    } catch (error) {
      console.error("Erro ao obter estatísticas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Listar veículos
  app.get("/api/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      res.json(vehicles);
    } catch (error) {
      console.error("Erro ao listar veículos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Listar motoristas
  app.get("/api/drivers", async (req, res) => {
    try {
      const drivers = await storage.getDrivers();
      res.json(drivers);
    } catch (error) {
      console.error("Erro ao listar motoristas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Analytics - revenue
  app.get("/api/analytics/revenue", async (req, res) => {
    try {
      // Dados fictícios para dashboard
      const mockRevenue = [
        { month: "Jan", revenue: 45000 },
        { month: "Fev", revenue: 52000 },
        { month: "Mar", revenue: 48000 },
        { month: "Abr", revenue: 61000 },
        { month: "Mai", revenue: 55000 },
        { month: "Jun", revenue: 67000 }
      ];
      res.json(mockRevenue);
    } catch (error) {
      console.error("Erro ao obter dados de receita:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Checklists
  app.get("/api/checklists", async (req, res) => {
    try {
      const checklists = await storage.getChecklistHistory() || [];
      res.json(checklists);
    } catch (error) {
      console.error("Erro ao listar checklists:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Sinistros
  app.get("/api/sinistros", async (req, res) => {
    try {
      const sinistros = await storage.getSinistros();
      res.json(sinistros);
    } catch (error) {
      console.error("Erro ao listar sinistros:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}