import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import { Express } from "express";
import session from "express-session";
import { scrypt, randomBytes, timingSafeEqual } from "crypto";
import { promisify } from "util";
import { storage } from "./storage";
import { User as SelectUser } from "@shared/schema";
import createMemoryStore from "memorystore";

declare global {
  namespace Express {
    interface User extends SelectUser {}
  }
}

const MemoryStore = createMemoryStore(session);
const scryptAsync = promisify(scrypt);

async function hashPassword(password: string) {
  const salt = randomBytes(16).toString("hex");
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString("hex")}.${salt}`;
}

async function comparePasswords(supplied: string, stored: string) {
  const [hashed, salt] = stored.split(".");
  const hashedBuf = Buffer.from(hashed, "hex");
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

export function setupAuth(app: Express) {
  const sessionSettings: session.SessionOptions = {
    secret: process.env.SESSION_SECRET || "your-secret-key",
    resave: false,
    saveUninitialized: false,
    store: new MemoryStore({
      checkPeriod: 86400000, // prune expired entries every 24h
    }),
    cookie: {
      secure: false, // set to true in production with HTTPS
      maxAge: 24 * 60 * 60 * 1000, // 24 hours
    },
  };

  app.set("trust proxy", 1);
  app.use(session(sessionSettings));
  app.use(passport.initialize());
  app.use(passport.session());

  passport.use(
    new LocalStrategy(async (username, password, done) => {
      try {
        // Check for admin user first
        if (username === 'admin' && password === 'admin@123') {
          const adminUser = {
            id: 999,
            username: 'admin',
            password: 'admin@123',
            role: 'admin',
            walletAddress: null,
            createdAt: new Date()
          };
          return done(null, adminUser);
        }

        const user = await storage.getUserByUsername(username);
        if (!user) {
          return done(null, false);
        }

        // For regular users, compare hashed passwords
        if (await comparePasswords(password, user.password)) {
          return done(null, user);
        }

        return done(null, false);
      } catch (error) {
        return done(error);
      }
    }),
  );

  passport.serializeUser((user, done) => done(null, user.id));
  passport.deserializeUser(async (id: number, done) => {
    try {
      // Handle admin user specially
      if (id === 999) {
        const adminUser = {
          id: 999,
          username: 'admin',
          password: 'admin@123',
          role: 'admin',
          walletAddress: null,
          createdAt: new Date()
        };
        return done(null, adminUser);
      }
      
      const user = await storage.getUser(id);
      done(null, user);
    } catch (error) {
      done(error);
    }
  });

  // Registration endpoint
  app.post("/api/register", async (req, res, next) => {
    try {
      const { username, password, walletAddress } = req.body;

      if (!username || !password) {
        return res.status(400).send("Username and password are required");
      }

      const existingUser = await storage.getUserByUsername(username);
      if (existingUser) {
        return res.status(400).send("Username already exists");
      }

      const hashedPassword = await hashPassword(password);
      const user = await storage.createUser({
        username,
        password: hashedPassword,
        walletAddress: walletAddress || null,
      });

      req.login(user, (err) => {
        if (err) return next(err);
        res.status(201).json({
          id: user.id,
          username: user.username,
          walletAddress: user.walletAddress,
        });
      });
    } catch (error) {
      console.error("Registration error:", error);
      res.status(500).send("Internal server error");
    }
  });

  // Login endpoint
  app.post("/api/login", passport.authenticate("local"), (req, res) => {
    res.status(200).json({
      id: req.user!.id,
      username: req.user!.username,
      walletAddress: req.user!.walletAddress,
    });
  });

  // Logout endpoint
  app.post("/api/logout", (req, res, next) => {
    req.logout((err) => {
      if (err) return next(err);
      res.sendStatus(200);
    });
  });

  // Get current user
  app.get("/api/user", (req, res) => {
    if (!req.isAuthenticated()) return res.sendStatus(401);
    res.json({
      id: req.user!.id,
      username: req.user!.username,
      walletAddress: req.user!.walletAddress,
    });
  });

  // Admin routes
  app.get("/api/admin/users", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.username !== "admin") {
      return res.sendStatus(403);
    }

    try {
      // Mock data for now - in production, fetch from database
      const users = [
        {
          id: 1,
          username: "admin",
          walletAddress: null,
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          username: "user1",
          walletAddress: "0x1234567890123456789012345678901234567890",
          createdAt: new Date().toISOString(),
        },
        {
          id: 3,
          username: "user2",
          walletAddress: null,
          createdAt: new Date().toISOString(),
        },
      ];
      res.json(users);
    } catch (error) {
      res.status(500).send("Failed to fetch users");
    }
  });

  app.get("/api/admin/transactions", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.username !== "admin") {
      return res.sendStatus(403);
    }

    try {
      // Mock data for now
      const transactions = [
        {
          id: 1,
          type: "lend",
          amount: 1000,
          status: "completed",
          userId: 2,
          username: "user1",
          createdAt: new Date().toISOString(),
        },
        {
          id: 2,
          type: "borrow",
          amount: 500,
          status: "pending",
          userId: 3,
          username: "user2",
          createdAt: new Date().toISOString(),
        },
      ];
      res.json(transactions);
    } catch (error) {
      res.status(500).send("Failed to fetch transactions");
    }
  });

  app.get("/api/admin/stats", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.username !== "admin") {
      return res.sendStatus(403);
    }

    try {
      const stats = {
        totalUsers: 3,
        totalTransactions: 15,
        totalVolume: 125000,
        activeUsers: 2,
      };
      res.json(stats);
    } catch (error) {
      res.status(500).send("Failed to fetch stats");
    }
  });

  app.post("/api/admin/users/:id/:action", async (req, res) => {
    if (!req.isAuthenticated() || req.user!.username !== "admin") {
      return res.sendStatus(403);
    }

    const { id, action } = req.params;
    
    // Mock implementation - in production, implement actual user actions
    console.log(`Admin action: ${action} on user ${id}`);
    res.json({ success: true, message: `User ${action} completed` });
  });
}