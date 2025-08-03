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

      const visitor = await storage.upsertVisitor({
        name,
        cpf,
        photo: photo || ""
      });

      res.status(201).json({ visitor, message: "Visitante registrado com sucesso" });
    } catch (error) {
      console.error("Erro ao registrar visitante:", error);
      res.status(500).json({ message: "Erro interno do servidor" });
    }
  });

  // Processar QR Code de funcionário
  app.post("/api/access-control/qrcode", async (req, res) => {
    try {
      const { qrCode, direction } = req.body;
      
      if (!qrCode || !direction) {
        return res.status(400).json({ message: "QR Code e direção são obrigatórios" });
      }

      // Buscar funcionário pelo QR Code
      const employeeQrCode = await storage.getEmployeeByQrCode(qrCode);
      
      if (!employeeQrCode) {
        return res.status(404).json({ message: "QR Code inválido ou funcionário não encontrado" });
      }

      // Buscar dados completos do funcionário
      const employee = await storage.getEmployee(employeeQrCode.employeeId);
      
      if (!employee) {
        return res.status(404).json({ message: "Funcionário não encontrado" });
      }

      // Registrar acesso
      const accessLog = await storage.createAccessLog({
        personType: "employee",
        personId: employee.id,
        personName: employee.fullName,
        personCpf: employee.cpf,
        direction,
        accessMethod: "qrcode",
        location: "Portaria Principal"
      });

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

  const httpServer = createServer(app);
  return httpServer;
}