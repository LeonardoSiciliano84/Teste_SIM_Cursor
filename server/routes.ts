import type { Express } from "express";
import { createServer, type Server } from "http";
import { z } from "zod";
import { storage } from "./storage";
import { loginSchema } from "@shared/schema";

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

  // ============= AUTHENTICATION ROUTES =============
  app.post("/api/auth/login", async (req, res) => {
    console.log("=== LOGIN REQUEST ===");
    console.log("Body:", req.body);
    console.log("Headers:", req.headers);
    
    try {
      const credentials = loginSchema.parse(req.body);
      console.log("Parsed credentials:", credentials);
      
      const user = await storage.authenticateUser(credentials);
      console.log("Authenticated user:", user ? `${user.name} (${user.role})` : "null");
      
      if (!user) {
        console.log("Authentication failed");
        return res.status(401).json({ message: "Credenciais inválidas" });
      }

      const userData = { id: user.id, email: user.email, name: user.name, role: user.role };
      console.log("Returning user data:", userData);
      
      res.json({ user: userData });
    } catch (error) {
      console.error("Login error:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro interno do servidor" });
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

  // Perfil do motorista - agora acessível por admins também
  app.get("/api/driver/profile", async (req, res) => {
    try {
      // Para demonstração, vamos usar dados simulados que representariam um funcionário-motorista
      // Em produção, isso seria baseado no usuário logado ou selecionado
      const mockDriverProfile = {
        id: "37de4856-dc50-4828-bcc5-1472c84e6e99",
        fullName: "João Silva Santos",
        email: "joao.silva@felkatransportes.com.br",
        employeeNumber: "F2025001", 
        profilePhoto: null,
        position: "Motorista Sênior",
        department: "Operacional",
        driverLicense: "12345678901",
        driverLicenseCategory: "D",
        driverLicenseExpiry: "2026-12-31",
        phone: "(11) 98765-4321"
      };
      
      res.json(mockDriverProfile);
    } catch (error) {
      console.error("Erro ao buscar perfil do motorista:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Buscar serviço ativo do motorista
  app.get("/api/driver/:id/active-service", async (req, res) => {
    try {
      const driverId = req.params.id;
      
      // Buscar serviço ativo para o motorista
      // Por enquanto retornamos null (sem serviço ativo)
      res.json(null);
    } catch (error) {
      console.error("Erro ao buscar serviço ativo:", error);
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

  // Manual employee access route
  app.post("/api/access-control/employee-manual", async (req, res) => {
    try {
      const { employeeId, direction } = req.body;
      
      if (!employeeId || !direction) {
        return res.status(400).json({ message: "Employee ID e direção são obrigatórios" });
      }

      const employee = await storage.getEmployee(employeeId);
      
      if (!employee) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }

      // Registrar log de acesso manual
      await storage.createAccessLog({
        personType: 'employee',
        personId: employee.id,
        personName: employee.fullName,
        personCpf: employee.cpf,
        direction: direction,
        accessMethod: 'manual',
        location: 'Portaria'
      });

      res.json({
        success: true,
        employeeName: employee.fullName,
        direction: direction,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Erro no acesso manual do funcionário:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Visitor access route
  app.post("/api/access-control/visitor-access", async (req, res) => {
    try {
      const { visitorId, direction } = req.body;
      
      if (!visitorId || !direction) {
        return res.status(400).json({ message: "Visitor ID e direção são obrigatórios" });
      }

      const visitor = await storage.getVisitor(visitorId);
      
      if (!visitor) {
        return res.status(404).json({ message: "Visitante não encontrado" });
      }

      // Atualizar total de visitas se for entrada
      if (direction === 'entry') {
        // Como não temos campos para atualizar diretamente, apenas registramos o log
        // O total de visitas será calculado pelos logs
      }

      // Registrar log de acesso
      await storage.createAccessLog({
        personType: 'visitor',
        personId: visitor.id,
        personName: visitor.name,
        personCpf: visitor.cpf,
        direction: direction,
        accessMethod: 'manual',
        location: 'Portaria'
      });

      res.json({
        success: true,
        visitorName: visitor.name,
        direction: direction,
        timestamp: new Date(),
      });
    } catch (error) {
      console.error("Erro no acesso do visitante:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Vehicle Status Route - Busca veículos com checklist criado e prontos para saída
  app.get("/api/vehicles/status", async (req, res) => {
    try {
      // Buscar todos os checklists ativos (recém-criados)
      const checklists = await storage.getVehicleChecklists();
      
      // Filtrar checklists que estão prontos para liberação (status: saida_registrada)
      const readyChecklists = checklists.filter(checklist => 
        checklist.status === "saida_registrada" && 
        checklist.verificationStatus === "nao_verificado"
      );
      
      // Criar dados de status dos veículos baseado nos checklists
      const vehicleStatus = readyChecklists.map(checklist => ({
        vehicleId: checklist.vehicleId,
        driverId: checklist.driverId,
        status: "available",
        checklistStatus: "approved", // Checklist criado = aprovado para saída
        checklistDate: checklist.createdAt,
        checklistId: checklist.id,
        exitTime: null,
        destination: null,
        vehiclePlate: checklist.vehiclePlate,
        driverName: checklist.driverName
      }));
      
      res.json(vehicleStatus);
    } catch (error) {
      console.error("Erro ao buscar status dos veículos:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Get parked vehicles (in maintenance) for logistics monitoring
  app.get('/api/vehicles/parked', async (req, res) => {
    try {
      const parkedVehicles = storage.getParkedVehicles();
      res.json(parkedVehicles);
    } catch (error) {
      console.error('Error fetching parked vehicles:', error);
      res.status(500).json({ message: 'Erro interno do servidor' });
    }
  });

  // Vehicle Exit Route
  app.post("/api/vehicles/exit", async (req, res) => {
    try {
      const { vehicleId, driverId, destination, checklistId } = req.body;
      
      if (!vehicleId || !driverId || !destination) {
        return res.status(400).json({ message: "Dados obrigatórios: vehicleId, driverId, destination" });
      }

      // Buscar dados do veículo e motorista
      const vehicle = await storage.getVehicle(vehicleId);
      const driver = await storage.getDriver(driverId);
      
      if (!vehicle || !driver) {
        return res.status(404).json({ message: "Veículo ou motorista não encontrado" });
      }

      // Se tem checklistId, marcar como usado/liberado
      if (checklistId) {
        await storage.updateVehicleChecklist(checklistId, {
          status: "veiculo_liberado",
          exitTime: new Date()
        });
      }

      // Registrar log de saída de veículo
      await storage.createAccessLog({
        personType: "vehicle",
        personId: vehicleId,
        personName: `${vehicle.plate} - ${driver.name}`,
        personCpf: "", // Veículos não têm CPF
        direction: "exit",
        accessMethod: "manual",
        location: "Portaria"
      });

      // Em produção, atualizaria o status do veículo no sistema
      // Por enquanto apenas retornamos sucesso
      
      res.json({
        success: true,
        vehiclePlate: vehicle.plate,
        driverName: driver.name,
        destination: destination,
        exitTime: new Date(),
      });
    } catch (error) {
      console.error("Erro ao registrar saída do veículo:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Vehicle Return Route
  app.post("/api/vehicles/return", async (req, res) => {
    try {
      const { vehicleId, driverId, originBase } = req.body;
      
      if (!vehicleId || !driverId || !originBase) {
        return res.status(400).json({ message: "Dados obrigatórios: vehicleId, driverId, originBase" });
      }

      // Buscar dados do veículo e motorista
      const vehicle = await storage.getVehicle(vehicleId);
      const driver = await storage.getDriver(driverId);
      
      if (!vehicle || !driver) {
        return res.status(404).json({ message: "Veículo ou motorista não encontrado" });
      }

      // Registrar log de retorno de veículo
      await storage.createAccessLog({
        personType: "vehicle",
        personId: vehicleId,
        personName: `${vehicle.plate} - ${driver.name}`,
        personCpf: "", // Veículos não têm CPF
        direction: "entry",
        accessMethod: "manual",
        location: "Portaria"
      });

      // Em produção, atualizaria o status do veículo no sistema
      
      res.json({
        success: true,
        vehiclePlate: vehicle.plate,
        driverName: driver.name,
        originBase: originBase,
        returnTime: new Date().toISOString(),
      });
    } catch (error) {
      console.error("Erro ao registrar retorno do veículo:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // API para logs administrativos com filtros
  app.get("/api/access-control/logs", async (req, res) => {
    try {
      const { startDate, endDate, personType, direction, search } = req.query;
      
      let logs = await storage.getAccessLogs();
      
      // Aplicar filtros
      if (startDate) {
        const start = new Date(startDate as string);
        logs = logs.filter(log => new Date(log.timestamp) >= start);
      }
      
      if (endDate) {
        const end = new Date(endDate as string);
        end.setHours(23, 59, 59, 999); // Final do dia
        logs = logs.filter(log => new Date(log.timestamp) <= end);
      }
      
      if (personType && personType !== 'todos') {
        logs = logs.filter(log => log.personType === personType);
      }
      
      if (direction && direction !== 'todos') {
        logs = logs.filter(log => log.direction === direction);
      }
      
      if (search) {
        const searchLower = (search as string).toLowerCase();
        logs = logs.filter(log => 
          log.personName.toLowerCase().includes(searchLower) ||
          (log.personCpf && log.personCpf.includes(searchLower))
        );
      }
      
      // Ordenar por data mais recente
      logs.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      
      res.json(logs);
    } catch (error) {
      console.error("Erro ao buscar logs de acesso:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // API para estatísticas de acesso
  app.get("/api/access-control/stats", async (req, res) => {
    try {
      const { date } = req.query;
      const targetDate = date ? new Date(date as string) : new Date();
      
      // Definir início e fim do dia
      const startOfDay = new Date(targetDate);
      startOfDay.setHours(0, 0, 0, 0);
      
      const endOfDay = new Date(targetDate);
      endOfDay.setHours(23, 59, 59, 999);
      
      const logs = await storage.getAccessLogs();
      const dayLogs = logs.filter(log => {
        const logDate = new Date(log.timestamp);
        return logDate >= startOfDay && logDate <= endOfDay;
      });
      
      // Calcular estatísticas
      const totalEntriesToday = dayLogs.filter(log => log.direction === 'entry').length;
      const totalExitsToday = dayLogs.filter(log => log.direction === 'exit').length;
      
      // Pessoas atualmente dentro (entradas - saídas)
      const employeeEntries = dayLogs.filter(log => log.personType === 'employee' && log.direction === 'entry').length;
      const employeeExits = dayLogs.filter(log => log.personType === 'employee' && log.direction === 'exit').length;
      const employeesInside = Math.max(0, employeeEntries - employeeExits);
      
      const visitorEntries = dayLogs.filter(log => log.personType === 'visitor' && log.direction === 'entry').length;
      const visitorExits = dayLogs.filter(log => log.personType === 'visitor' && log.direction === 'exit').length;
      const visitorsInside = Math.max(0, visitorEntries - visitorExits);
      
      const vehicleEntries = dayLogs.filter(log => log.personType === 'vehicle' && log.direction === 'entry').length;
      const vehicleExits = dayLogs.filter(log => log.personType === 'vehicle' && log.direction === 'exit').length;
      const vehiclesInside = Math.max(0, vehicleEntries - vehicleExits);
      
      // Horário de pico (simplificado)
      const peakHour = "08:00 - 09:00";
      const averageStayTime = 4.5; // horas (simplificado)
      
      const stats = {
        totalEntriesToday,
        totalExitsToday,
        employeesInside,
        visitorsInside,
        vehiclesInside,
        averageStayTime,
        peakHour
      };
      
      res.json(stats);
    } catch (error) {
      console.error("Erro ao calcular estatísticas:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // API para registrar entrada de visitante
  app.post("/api/access-control/visitor-entry", async (req, res) => {
    try {
      const { visitorId, accessReason, vehiclePlate, photo, authorizedBy } = req.body;
      
      if (!visitorId || !accessReason || !authorizedBy) {
        return res.status(400).json({ message: "Dados obrigatórios: visitorId, accessReason, authorizedBy" });
      }

      // Buscar visitante
      const visitor = await storage.getVisitor(visitorId);
      if (!visitor) {
        return res.status(404).json({ message: "Visitante não encontrado" });
      }

      // Registrar log de entrada
      const entryTime = new Date();
      await storage.createAccessLog({
        personType: "visitor",
        personId: visitorId,
        personName: visitor.name,
        personCpf: visitor.cpf,
        direction: "entry",
        accessMethod: "manual",
        location: "Portaria Principal",
        notes: `Motivo: ${accessReason}${vehiclePlate ? `, Veículo: ${vehiclePlate}` : ''}, Autorizado por: ${authorizedBy}`
      });

      // Atualizar dados do visitante
      await storage.updateVisitor(visitorId, {
        totalVisits: (visitor.totalVisits || 0) + 1,
        lastVisit: entryTime.toISOString(),
        isActive: true
      });

      res.json({
        success: true,
        visitor: visitor,
        entryTime: entryTime.toISOString(),
        message: "Entrada registrada com sucesso"
      });
    } catch (error) {
      console.error("Erro ao registrar entrada do visitante:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Endpoint para buscar visitante por CPF
  app.post("/api/access-control/visitor-search", async (req, res) => {
    try {
      const { cpf } = req.body;
      
      if (!cpf) {
        return res.status(400).json({ message: "CPF is required" });
      }

      const visitor = await storage.getVisitorByCpf(cpf);
      
      res.json({
        visitor: visitor || null,
        found: !!visitor
      });
    } catch (error) {
      console.error("Error searching visitor:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Endpoint para logs de visitantes
  app.get("/api/access-control/visitor-logs", async (req, res) => {
    try {
      const logs = await storage.getAccessLogs();
      const visitorLogs = logs.filter(log => log.personType === "visitor");
      res.json(visitorLogs);
    } catch (error) {
      console.error("Error fetching visitor logs:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Endpoint para registrar entrada de visitante
  app.post("/api/visitor-entries", async (req, res) => {
    try {
      const {
        visitorId,
        accessReason,
        vehiclePlate,
        authorizingPerson,
        photo
      } = req.body;

      if (!visitorId) {
        return res.status(400).json({ message: "Visitor ID is required" });
      }

      // Get visitor from storage
      const visitor = await storage.getVisitor(visitorId);
      if (!visitor) {
        return res.status(404).json({ message: "Visitor not found" });
      }

      // Increment visitor visits
      const updatedVisitor = await storage.incrementVisitorVisits(visitorId);

      // Log the visitor entry
      await storage.createAccessLog({
        personId: visitorId,
        personName: visitor.name,
        personType: "visitor",
        direction: "entry",
        timestamp: new Date(),
        method: "manual",
        notes: `Acesso autorizado - Motivo: ${accessReason}${authorizingPerson ? ` - Autorizado por: ${authorizingPerson}` : ''}`
      });

      res.json({
        success: true,
        visitor: updatedVisitor,
        message: "Entrada de visitante registrada com sucesso"
      });
    } catch (error) {
      console.error("Error registering visitor entry:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ==================== MÓDULO DE MANUTENÇÃO ====================
  
  // Listar requisições de manutenção
  app.get("/api/maintenance/requests", async (req, res) => {
    try {
      const requests = await storage.getMaintenanceRequests();
      res.json(requests);
    } catch (error) {
      console.error("Error fetching maintenance requests:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Obter veículos em manutenção
  app.get("/api/maintenance/vehicles-in-maintenance", async (req, res) => {
    try {
      const vehiclesInMaintenance = await storage.getVehiclesInMaintenance();
      res.json(vehiclesInMaintenance);
    } catch (error) {
      console.error("Error fetching vehicles in maintenance:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Criar nova requisição de manutenção (rota Kanban - Nova Solicitação)
  app.post("/api/maintenance/requests", async (req, res) => {
    try {
      const { vehicleId, driverName, requestType, description, preventiveOrder, preventiveLevel } = req.body;
      
      // Validação dos campos obrigatórios
      if (!vehicleId || !driverName || !requestType) {
        return res.status(400).json({ 
          message: "Campos obrigatórios: placa, nome do motorista e tipo de manutenção" 
        });
      }

      // Validações específicas por tipo
      if (requestType === "corrective" && !description) {
        return res.status(400).json({ 
          message: "Descrição é obrigatória para manutenção corretiva" 
        });
      }

      if (requestType === "preventive") {
        if (!preventiveOrder || !preventiveLevel) {
          return res.status(400).json({ 
            message: "Ordem e nível são obrigatórios para manutenção preventiva" 
          });
        }
      }

      // Gerar número sequencial de O.S. automático
      const existingRequests = await storage.getMaintenanceRequests();
      const currentYear = new Date().getFullYear();
      const currentRequests = existingRequests.filter(r => 
        r.orderNumber.includes(`OS-${currentYear}`)
      );
      const nextNumber = currentRequests.length + 1;
      const orderNumber = `OS-${currentYear}-${String(nextNumber).padStart(5, '0')}`;

      // Criar descrição para manutenção preventiva
      let finalDescription = description;
      if (requestType === "preventive") {
        finalDescription = `Manutenção preventiva - Ordem ${preventiveOrder}, Nível ${preventiveLevel}`;
      }

      const maintenanceData = {
        orderNumber,
        vehicleId,
        requestType,
        status: "open" as const,
        priority: requestType === "corrective" ? "high" as const : "medium" as const,
        description: finalDescription || "",
        reportedBy: driverName,
        mechanic: null,
        startDate: null,
        endDate: null,
        daysStoped: 0,
        estimatedCost: 0,
        actualCost: null,
      };

      const newRequest = await storage.createMaintenanceRequest(maintenanceData);
      res.json(newRequest);
    } catch (error) {
      console.error("Error creating maintenance request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Atualizar requisição de manutenção
  app.put("/api/maintenance/requests/:id", async (req, res) => {
    try {
      const updated = await storage.updateMaintenanceRequest(req.params.id, req.body);
      if (!updated) {
        return res.status(404).json({ message: "Maintenance request not found" });
      }
      res.json(updated);
    } catch (error) {
      console.error("Error updating maintenance request:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Listar materiais do almoxarifado
  app.get("/api/maintenance/warehouse/materials", async (req, res) => {
    try {
      const warehouseType = req.query.warehouseType as string | undefined;
      const materials = await storage.getWarehouseMaterials(warehouseType);
      res.json(materials);
    } catch (error) {
      console.error("Error fetching warehouse materials:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Criar novo material
  app.post("/api/maintenance/warehouse/materials", async (req, res) => {
    try {
      const newMaterial = await storage.createWarehouseMaterial(req.body);
      res.json(newMaterial);
    } catch (error) {
      console.error("Error creating warehouse material:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Listar pneus
  app.get("/api/maintenance/tires", async (req, res) => {
    try {
      const tires = await storage.getTires();
      res.json(tires);
    } catch (error) {
      console.error("Error fetching tires:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Criar novo pneu
  app.post("/api/maintenance/tires", async (req, res) => {
    try {
      const newTire = await storage.createTire(req.body);
      res.json(newTire);
    } catch (error) {
      console.error("Error creating tire:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============= DASHBOARD ROUTES =============
  
  // Dashboard de Manutenção da Frota
  app.get("/api/dashboard/maintenance", async (req, res) => {
    try {
      const period = req.query.period as string || "mes";
      const year = req.query.year as string || "2025";
      
      const vehicles = await storage.getVehicles();
      const maintenanceRequests = await storage.getMaintenanceRequests();
      const costs = await storage.getMaintenanceCosts();
      
      // Veículos parados no momento
      const vehiclesStopped = maintenanceRequests.filter(req => req.status === "em_andamento").length;
      
      // Custo total no mês
      const currentMonth = new Date().getMonth();
      const totalCost = costs
        .filter(cost => new Date(cost.createdAt).getMonth() === currentMonth)
        .reduce((sum, cost) => sum + parseFloat(cost.totalValue), 0);
      
      // Manutenções por tipo (dados simulados para demonstração)
      const maintenanceTypes = [
        { month: 'Jan', corretiva: 45, preventiva: 65 },
        { month: 'Fev', corretiva: 38, preventiva: 72 },
        { month: 'Mar', corretiva: 52, preventiva: 58 }
      ];
      
      // Top 5 veículos com maior custo
      const topCostVehicles = [
        { plate: 'ABC-1234', cost: 8500, vehicle: 'Scania R450' },
        { plate: 'DEF-5678', cost: 7200, vehicle: 'Volvo FH460' },
        { plate: 'GHI-9012', cost: 6800, vehicle: 'Mercedes Actros' },
        { plate: 'JKL-3456', cost: 5900, vehicle: 'Iveco Stralis' },
        { plate: 'MNO-7890', cost: 5200, vehicle: 'DAF XF' }
      ];
      
      res.json({
        vehiclesStopped,
        totalVehicles: vehicles.length,
        totalCost,
        averageCPK: "0,45",
        averageDowntime: "2,3",
        pendingChecklists: 23,
        maintenanceTypes,
        topCostVehicles
      });
    } catch (error) {
      console.error("Error fetching maintenance dashboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard de Almoxarifado
  app.get("/api/dashboard/warehouse", async (req, res) => {
    try {
      const period = req.query.period as string || "mes";
      const year = req.query.year as string || "2025";
      
      const centralWarehouseItems = await storage.getCentralWarehouseItems();
      
      // Calcular valor total em estoque
      const totalStockValue = centralWarehouseItems.reduce((sum, item) => {
        const quantity = parseFloat(item.currentQuantity);
        const unitValue = parseFloat(item.unitValue || "0");
        return sum + (quantity * unitValue);
      }, 0);
      
      // Itens com estoque baixo
      const lowStockItems = centralWarehouseItems.filter(item => 
        parseFloat(item.currentQuantity) <= parseFloat(item.minimumQuantity)
      ).length;
      
      // Top 10 itens mais consumidos
      const topConsumedItems = [
        { item: 'Óleo Motor 15W40', quantity: 85, unit: 'L' },
        { item: 'Filtro de Ar', quantity: 42, unit: 'UN' },
        { item: 'Pastilha de Freio', quantity: 38, unit: 'JG' },
        { item: 'Filtro de Óleo', quantity: 35, unit: 'UN' },
        { item: 'Lâmpada H7', quantity: 28, unit: 'UN' }
      ];
      
      // Dados de movimento (simulados)
      const movementData = [
        { month: 'Jan', entradas: 125, saidas: 118 },
        { month: 'Fev', entradas: 135, saidas: 128 },
        { month: 'Mar', entradas: 142, saidas: 135 }
      ];
      
      // Valor por setor
      const stockBySector = [
        { name: 'Manutenção', value: 180500, color: '#0C29AB' },
        { name: 'Peças Gerais', value: 125300, color: '#1E40AF' },
        { name: 'Consumíveis', value: 89200, color: '#3B82F6' },
        { name: 'Emergência', value: 30680, color: '#60A5FA' }
      ];
      
      res.json({
        totalStockValue,
        lowStockItems,
        criticalShortages: 3,
        expiringItems: 7,
        topConsumedItems,
        movementData,
        stockBySector
      });
    } catch (error) {
      console.error("Error fetching warehouse dashboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard de Sinistros e Ocorrências
  app.get("/api/dashboard/accidents", async (req, res) => {
    try {
      const period = req.query.period as string || "mes";
      const year = req.query.year as string || "2025";
      
      // Dados simulados para demonstração
      res.json({
        totalAccidents: 12,
        averageCost: 8500,
        averageResolutionTime: "5,2",
        classification: [
          { type: 'Leve', count: 7 },
          { type: 'Médio', count: 3 },
          { type: 'Grave', count: 2 }
        ]
      });
    } catch (error) {
      console.error("Error fetching accidents dashboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard Financeiro da Frota
  app.get("/api/dashboard/financial", async (req, res) => {
    try {
      const period = req.query.period as string || "mes";
      const year = req.query.year as string || "2025";
      
      // Dados simulados para demonstração
      res.json({
        totalMonthlyCost: 285000,
        averageCPK: "0,45",
        budgetVariance: 12.5,
        costBreakdown: [
          { category: 'Combustível', value: 125000 },
          { category: 'Manutenção', value: 85000 },
          { category: 'Pedágios', value: 45000 },
          { category: 'Outros', value: 30000 }
        ]
      });
    } catch (error) {
      console.error("Error fetching financial dashboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard de Veículos
  app.get("/api/dashboard/vehicles", async (req, res) => {
    try {
      const vehicles = await storage.getVehicles();
      
      // Total da frota ativa
      const activeVehicles = vehicles.filter(v => v.status === "ativo");
      
      // Quantidade por classificação
      const byClassification = vehicles.reduce((acc, vehicle) => {
        const classification = vehicle.classificacao || "Não informado";
        acc[classification] = (acc[classification] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const classificationData = Object.entries(byClassification).map(([name, value]) => ({
        name,
        value
      }));
      
      // Valor total da frota (simulado)
      const totalFleetValue = activeVehicles.length * 280000; // Valor médio por veículo
      
      // Idade média da frota
      const currentYear = new Date().getFullYear();
      const averageAge = activeVehicles.reduce((sum, vehicle) => {
        const age = currentYear - (vehicle.anoFabricacao || currentYear);
        return sum + age;
      }, 0) / activeVehicles.length;
      
      // Distribuição por idade
      const ageDistribution = [
        { range: '0-3 anos', count: 12 },
        { range: '4-6 anos', count: 18 },
        { range: '7-9 anos', count: 15 },
        { range: '10+ anos', count: 8 }
      ];
      
      res.json({
        totalActiveVehicles: activeVehicles.length,
        classificationData,
        totalFleetValue,
        averageAge: Math.round(averageAge * 10) / 10,
        ageDistribution
      });
    } catch (error) {
      console.error("Error fetching vehicles dashboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Dashboard de RH
  app.get("/api/dashboard/hr", async (req, res) => {
    try {
      const period = req.query.period as string || "mes";
      const year = req.query.year as string || "2025";
      
      const employees = await storage.getEmployees();
      
      // Total de colaboradores ativos
      const activeEmployees = employees.filter(emp => emp.status === "ativo");
      
      // Distribuição por cargo
      const byPosition = employees.reduce((acc, employee) => {
        const position = employee.cargo || "Não informado";
        acc[position] = (acc[position] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);
      
      const positionData = Object.entries(byPosition).map(([name, value]) => ({
        name,
        value
      }));
      
      // Colaboradores afastados
      const onLeave = employees.filter(emp => emp.status === "afastado").length;
      
      // Dados de contratação/desligamento (simulados)
      const hiringData = [
        { month: 'Jan', contratados: 8, desligados: 3 },
        { month: 'Fev', contratados: 5, desligados: 7 },
        { month: 'Mar', contratados: 12, desligados: 2 }
      ];
      
      // Turnover (simulado)
      const turnover = 8.5;
      
      // Tempo médio de casa (simulado)
      const averageTenure = "3,2";
      
      res.json({
        totalActiveEmployees: activeEmployees.length,
        positionData,
        onLeave,
        hiringData,
        turnover,
        averageTenure,
        openPositions: 5
      });
    } catch (error) {
      console.error("Error fetching HR dashboard:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============= MÓDULO DE AGENDAMENTO DE CARREAMENTO =============

  // Buscar pessoas externas
  app.get("/api/external-persons", async (req, res) => {
    try {
      const externalPersons = await storage.getExternalPersons();
      res.json(externalPersons);
    } catch (error) {
      console.error("Error fetching external persons:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Criar pessoa externa
  app.post("/api/external-persons", async (req, res) => {
    try {
      const person = await storage.createExternalPerson(req.body);
      res.status(201).json(person);
    } catch (error) {
      console.error("Error creating external person:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Atualizar pessoa externa
  app.put("/api/external-persons/:id", async (req, res) => {
    try {
      const person = await storage.updateExternalPerson(req.params.id, req.body);
      res.json(person);
    } catch (error) {
      console.error("Error updating external person:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Excluir pessoa externa
  app.delete("/api/external-persons/:id", async (req, res) => {
    try {
      await storage.deleteExternalPerson(req.params.id);
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting external person:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buscar horários disponíveis para uma data
  app.get("/api/cargo-scheduling/slots", async (req, res) => {
    try {
      const date = req.query.date as string;
      const all = req.query.all as string;
      
      if (all === 'true') {
        // Retornar todos os slots
        const slots = await storage.getAllScheduleSlots();
        res.json(slots);
      } else if (date) {
        const slots = await storage.getScheduleSlots(date);
        res.json(slots);
      } else {
        return res.status(400).json({ message: "Data é obrigatória quando all=true não for fornecido" });
      }
    } catch (error) {
      console.error("Error fetching schedule slots:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Criar novo horário disponível
  app.post("/api/cargo-scheduling/slots", async (req, res) => {
    try {
      const slot = await storage.createScheduleSlot(req.body);
      res.status(201).json(slot);
    } catch (error) {
      console.error("Error creating schedule slot:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Programar semana de horários
  app.post("/api/cargo-scheduling/schedule-week", async (req, res) => {
    try {
      const { date } = req.body;
      const slots = await storage.scheduleWeekSlots(date);
      res.json(slots);
    } catch (error) {
      console.error("Error scheduling week:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Criar agendamento
  app.post("/api/cargo-scheduling/book", async (req, res) => {
    try {
      const booking = await storage.createCargoScheduling(req.body);
      
      // Simular geração de PDF e envio de e-mail
      console.log(`📧 E-mail de confirmação enviado para: ${booking.contactEmail}`);
      console.log(`📄 PDF de agendamento gerado para reserva: ${booking.id}`);
      
      res.status(201).json({
        ...booking,
        pdfGenerated: true,
        emailSent: true
      });
    } catch (error) {
      console.error("Error creating booking:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buscar meus agendamentos (cliente)
  app.get("/api/cargo-scheduling/my-bookings", async (req, res) => {
    try {
      // Para demonstração, vamos buscar todos os agendamentos do usuário atual
      // Em produção, usar autenticação real para pegar o clientId
      const clientId = req.query.clientId as string || "guest";
      const bookings = await storage.getClientBookings(clientId);
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching client bookings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Buscar todos os agendamentos (gestor)
  app.get("/api/cargo-scheduling/all-bookings", async (req, res) => {
    try {
      const bookings = await storage.getAllBookings();
      res.json(bookings);
    } catch (error) {
      console.error("Error fetching all bookings:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Cancelar agendamento
  app.delete("/api/cargo-scheduling/cancel/:id", async (req, res) => {
    try {
      const { reason } = req.body;
      const booking = await storage.getBookingById(req.params.id);
      
      if (!booking) {
        return res.status(404).json({ message: "Agendamento não encontrado" });
      }
      
      // Cancelar o agendamento
      await storage.cancelBooking(req.params.id, reason);
      
      // Simular envio de e-mails (em produção, integrar com SendGrid ou similar)
      console.log(`📧 E-mail de cancelamento enviado para: ${booking.contactEmail}`);
      console.log(`📧 E-mail de cancelamento enviado para: admin@felka.com`);
      console.log(`Motivo do cancelamento: ${reason}`);
      console.log(`Data do agendamento: ${booking.date} às ${booking.timeSlot}`);
      console.log(`Empresa: ${booking.companyName}`);
      
      res.json({ 
        message: "Agendamento cancelado com sucesso",
        emailSent: true,
        booking: {
          id: booking.id,
          date: booking.date,
          timeSlot: booking.timeSlot,
          companyName: booking.companyName,
          status: "cancelado"
        }
      });
    } catch (error) {
      console.error("Error canceling booking:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Ações do gestor (concluir/cancelar)
  app.patch("/api/cargo-scheduling/manager-action/:id", async (req, res) => {
    try {
      console.log("📝 Manager action request:", {
        id: req.params.id,
        body: req.body,
        method: req.method,
        url: req.url
      });
      
      const { action, notes } = req.body;
      console.log("📝 Extracted data:", { action, notes });
      
      const booking = await storage.managerActionBooking(req.params.id, action, notes);
      console.log("📝 Updated booking:", booking);
      
      res.json(booking);
    } catch (error) {
      console.error("Error executing manager action:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Criar semana completa de horários
  app.post("/api/cargo-scheduling/create-week", async (req, res) => {
    try {
      const { startDate, serviceType } = req.body;
      
      if (!startDate || !serviceType) {
        return res.status(400).json({ message: "Data de início e tipo de serviço são obrigatórios" });
      }
      
      const slots = await storage.createWeekSlots(startDate, serviceType);
      
      console.log(`📅 Semana completa criada: ${slots.length} horários para ${serviceType} a partir de ${startDate}`);
      
      res.status(201).json({ 
        message: "Semana criada com sucesso",
        slotsCreated: slots.length,
        slots 
      });
    } catch (error) {
      console.error("Error creating week slots:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Bloquear horários selecionados
  app.post("/api/cargo-scheduling/block-slots", async (req, res) => {
    try {
      const { slotIds } = req.body;
      
      if (!slotIds || !Array.isArray(slotIds) || slotIds.length === 0) {
        return res.status(400).json({ message: "IDs dos horários são obrigatórios" });
      }
      
      const blockedSlots = await storage.blockSlots(slotIds);
      
      console.log(`🚫 ${blockedSlots.length} horário(s) bloqueado(s): ${slotIds.join(', ')}`);
      
      res.json({ 
        message: "Horários bloqueados com sucesso",
        slotsBlocked: blockedSlots.length,
        blockedSlots 
      });
    } catch (error) {
      console.error("Error blocking slots:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // Criar horário individual
  app.post("/api/cargo-scheduling/create-slot", async (req, res) => {
    try {
      const { dateTime, serviceType } = req.body;
      
      if (!dateTime || !serviceType) {
        return res.status(400).json({ message: "Data/hora e tipo de serviço são obrigatórios" });
      }
      
      // Parse do datetime para extrair data e horário
      const parsedDate = new Date(dateTime);
      const date = parsedDate.toISOString().split('T')[0]; // YYYY-MM-DD
      const hour = parsedDate.getHours();
      const timeSlot = `${hour.toString().padStart(2, '0')}:00`;
      
      // Criar o slot individual
      const slotData = {
        id: `slot-${date}-${hour}`,
        date,
        timeSlot,
        isAvailable: true,
        maxCapacity: 5,
        currentBookings: 0,
        serviceType,
        status: 'available'
      };
      
      const slot = await storage.createScheduleSlot(slotData);
      
      console.log(`⏰ Horário individual criado: ${date} às ${timeSlot} para ${serviceType}`);
      
      res.status(201).json({ 
        message: "Horário criado com sucesso",
        slot 
      });
    } catch (error) {
      console.error("Error creating individual slot:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  });

  // ============= MÓDULO DE TERCEIROS (PESSOAS EXTERNAS) =============
  
  // Listar todas as pessoas externas
  app.get("/api/external-persons", async (req, res) => {
    try {
      const persons = await storage.getExternalPersons();
      res.json({ persons });
    } catch (error) {
      console.error("Error fetching external persons:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Obter pessoa externa por ID
  app.get("/api/external-persons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const person = await storage.getExternalPerson(id);
      
      if (!person) {
        return res.status(404).json({ message: "Pessoa não encontrada" });
      }
      
      res.json({ person });
    } catch (error) {
      console.error("Error fetching external person:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Criar nova pessoa externa
  app.post("/api/external-persons", async (req, res) => {
    try {
      const personData = req.body;
      
      // Verificar se email já existe
      const existingPerson = await storage.getExternalPersonByEmail(personData.email);
      if (existingPerson) {
        return res.status(400).json({ message: "Email já cadastrado no sistema" });
      }
      
      const person = await storage.createExternalPerson(personData);
      res.status(201).json({ person });
    } catch (error) {
      console.error("Error creating external person:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Atualizar pessoa externa
  app.put("/api/external-persons/:id", async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      
      const person = await storage.updateExternalPerson(id, updates);
      
      if (!person) {
        return res.status(404).json({ message: "Pessoa não encontrada" });
      }
      
      res.json({ person });
    } catch (error) {
      console.error("Error updating external person:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Atualizar status da pessoa externa
  app.patch("/api/external-persons/:id/status", async (req, res) => {
    try {
      const { id } = req.params;
      const { status, reason } = req.body;
      
      const person = await storage.updateExternalPersonStatus(id, status, reason);
      
      if (!person) {
        return res.status(404).json({ message: "Pessoa não encontrada" });
      }
      
      res.json({ person });
    } catch (error) {
      console.error("Error updating external person status:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}