import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import {
  insertAssetSchema,
  insertLendingPoolSchema,
  insertBorrowingMarketSchema,
  insertLiquidityPoolSchema,
  insertUserPositionSchema,
  insertTransactionSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import { failoverEngine } from "./failover-engine";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { username, password } = req.body;
      
      if (username === 'admin' && password === 'admin@123') {
        const adminUser = {
          id: 999,
          username: 'admin',
          role: 'admin',
          walletAddress: null
        };
        return res.json({ user: adminUser });
      }
      
      const user = await storage.getUserByUsername(username);
      
      if (!user || user.password !== password) {
        return res.status(401).json({ message: "Invalid credentials" });
      }
      
      res.json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role || 'user',
          walletAddress: user.walletAddress 
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid login data", 
          errors: error.errors 
        });
      }
      
      console.error("Login error:", error);
      res.status(500).json({ message: "Failed to login" });
    }
  });

  app.post("/api/auth/register", async (req, res) => {
    try {
      const userData = insertUserSchema.parse({
        ...req.body,
        role: "user"
      });
      
      const existingUser = await storage.getUserByUsername(userData.username);
      if (existingUser) {
        return res.status(400).json({ message: "Username already exists" });
      }
      
      const user = await storage.createUser(userData);
      
      res.status(201).json({ 
        user: { 
          id: user.id, 
          username: user.username, 
          role: user.role,
          walletAddress: user.walletAddress 
        } 
      });
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid registration data", 
          errors: error.errors 
        });
      }
      
      console.error("Registration error:", error);
      res.status(500).json({ message: "Failed to register user" });
    }
  });

  app.get("/api/admin/users", async (req, res) => {
    try {
      const users = await storage.getAllUsers();
      res.json(users);
    } catch (error) {
      console.error("Get users error:", error);
      res.status(500).json({ message: "Failed to get users" });
    }
  });

  app.get("/api/admin/all-transactions", async (req, res) => {
    try {
      const transactions = await storage.getAllTransactions();
      res.json(transactions);
    } catch (error) {
      console.error("Get all transactions error:", error);
      res.status(500).json({ message: "Failed to get transactions" });
    }
  });

  app.get("/api/assets", async (req, res) => {
    const assets = await storage.getAllAssets();
    res.json(assets);
  });

  app.get("/api/assets/:symbol", async (req, res) => {
    const { symbol } = req.params;
    const asset = await storage.getAssetBySymbol(symbol);
    
    if (!asset) {
      return res.status(404).json({ message: `Asset ${symbol} not found` });
    }
    
    res.json(asset);
  });

  app.get("/api/lending-pools", async (req, res) => {
    const lendingPools = await storage.getAllLendingPools();
    res.json(lendingPools);
  });

  app.get("/api/borrowing-markets", async (req, res) => {
    const borrowingMarkets = await storage.getAllBorrowingMarkets();
    res.json(borrowingMarkets);
  });

  app.get("/api/liquidity-pools", async (req, res) => {
    const liquidityPools = await storage.getAllLiquidityPools();
    res.json(liquidityPools);
  });

  app.get("/api/user-positions", async (req, res) => {
    const userAddress = req.query.address as string;
    
    if (!userAddress) {
      return res.status(400).json({ message: "Host address required" });
    }
    
    const user = await storage.getUserByWalletAddress(userAddress);
    
    if (!user) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    const positions = await storage.getUserPositions(user.id);
    res.json(positions);
  });

  app.get("/api/transactions", async (req, res) => {
    const userAddress = req.query.address as string;
    
    if (!userAddress) {
      return res.status(400).json({ message: "Host address required" });
    }
    
    const user = await storage.getUserByWalletAddress(userAddress);
    
    if (!user) {
      return res.status(404).json({ message: "Host not found" });
    }
    
    const transactions = await storage.getUserTransactions(user.id);
    res.json(transactions);
  });

  app.post("/api/transactions", async (req, res) => {
    try {
      const userAddress = req.body.walletAddress;
      
      if (!userAddress) {
        return res.status(400).json({ message: "Host address required" });
      }
      
      let user = await storage.getUserByWalletAddress(userAddress);
      
      if (!user) {
        user = await storage.createUser({
          username: userAddress,
          password: "placeholder",
          walletAddress: userAddress
        });
      }
      
      const transactionData = insertTransactionSchema.parse({
        ...req.body,
        userId: user.id
      });
      
      const transaction = await storage.createTransaction(transactionData);
      
      if (["lend", "borrow"].includes(transaction.type)) {
        await storage.createOrUpdateUserPosition(
          user.id,
          transaction.type === "lend" ? "lending" : "borrowing",
          transaction.assetId,
          transaction.amount,
          transaction.fromAssetId,
          req.body.collateralAmount
        );
      }
      
      res.status(201).json(transaction);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ 
          message: "Invalid transaction data", 
          errors: error.errors 
        });
      }
      
      console.error("Transaction error:", error);
      res.status(500).json({ message: "Failed to create transaction" });
    }
  });

  app.get("/api/failover/stats", async (req, res) => {
    try {
      const stats = failoverEngine.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Get failover stats error:", error);
      res.status(500).json({ message: "Failed to get failover stats" });
    }
  });

  app.get("/api/failover/events", async (req, res) => {
    try {
      const limit = parseInt(req.query.limit as string) || 10;
      const events = failoverEngine.getRecentEvents(limit);
      res.json(events);
    } catch (error) {
      console.error("Get failover events error:", error);
      res.status(500).json({ message: "Failed to get failover events" });
    }
  });

  app.post("/api/failover/start", async (req, res) => {
    try {
      failoverEngine.start();
      res.json({ message: "Failover protection engine started successfully", isRunning: true });
    } catch (error) {
      console.error("Start failover engine error:", error);
      res.status(500).json({ message: "Failed to start failover engine" });
    }
  });

  app.post("/api/failover/stop", async (req, res) => {
    try {
      failoverEngine.stop();
      res.json({ message: "Failover protection engine stopped successfully", isRunning: false });
    } catch (error) {
      console.error("Stop failover engine error:", error);
      res.status(500).json({ message: "Failed to stop failover engine" });
    }
  });

  app.post("/api/failover/trigger/:allocationId", async (req, res) => {
    try {
      const allocationId = parseInt(req.params.allocationId);
      const result = await failoverEngine.triggerManualFailover(allocationId);
      
      if (result.success) {
        res.json(result);
      } else {
        res.status(400).json(result);
      }
    } catch (error) {
      console.error("Manual failover error:", error);
      res.status(500).json({ message: "Failed to trigger manual failover" });
    }
  });

  app.post("/api/failover/config", async (req, res) => {
    try {
      const { redundancyThreshold, failoverPenalty, healthFactorThreshold } = req.body;
      
      failoverEngine.updateConfig({
        redundancyThreshold: redundancyThreshold || undefined,
        failoverPenalty: failoverPenalty || undefined,
        healthFactorThreshold: healthFactorThreshold || undefined
      });
      
      res.json({ message: "Failover configuration updated successfully" });
    } catch (error) {
      console.error("Update failover config error:", error);
      res.status(500).json({ message: "Failed to update failover configuration" });
    }
  });

  app.post("/api/transfer", async (req, res) => {
    try {
      const { recipientUsername, assetSymbol, amount } = req.body;
      
      if (!req.isAuthenticated()) {
        return res.status(401).json({ message: "Unauthorized" });
      }
      
      const sender = req.user;
      const recipient = await storage.getUserByUsername(recipientUsername);
      
      if (!recipient) {
        return res.status(404).json({ message: "Recipient not found" });
      }
      
      if (sender.id === recipient.id) {
        return res.status(400).json({ message: "Cannot transfer to yourself" });
      }
      
      const asset = await storage.getAssetBySymbol(assetSymbol);
      if (!asset) {
        return res.status(404).json({ message: "Asset not found" });
      }
      
      await storage.createTransaction({
        userId: sender.id,
        type: "transfer_out",
        assetId: asset.id,
        amount: -amount,
        toAssetId: null,
        fromAssetId: null,
        status: "completed"
      });
      
      await storage.createTransaction({
        userId: recipient.id,
        type: "transfer_in",
        assetId: asset.id,
        amount: amount,
        toAssetId: null,
        fromAssetId: null,
        status: "completed"
      });
      
      res.json({ 
        message: `Successfully transferred ${amount} ${assetSymbol} to ${recipientUsername}`,
        transfer: {
          from: sender.username,
          to: recipient.username,
          amount,
          asset: assetSymbol
        }
      });
    } catch (error) {
      console.error("Transfer error:", error);
      res.status(500).json({ message: "Transfer failed" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
