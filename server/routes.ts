import type { Express } from "express";
import { createServer, type Server } from "http";
import { setupAuth } from "./auth";
import { storage } from "./storage";
import {
  insertStorageSystemSchema,
  insertStoragePoolSchema,
  insertLunSchema,
  insertHostSchema,
  insertLunMaskingSchema,
  insertFabricSwitchSchema,
  insertZoneSchema,
  insertTierPolicySchema,
  insertReplicationPairSchema,
  insertUserSchema
} from "@shared/schema";
import { z } from "zod";
import { failoverEngine } from "./failover-engine";
import { tieringEngine } from "./tiering-engine";

export async function registerRoutes(app: Express): Promise<Server> {
  setupAuth(app);

  // Storage Systems routes
  app.get("/api/storage-systems", async (req, res) => {
    try {
      const systems = await storage.getAllStorageSystems();
      res.json(systems);
    } catch (error) {
      console.error("Get storage systems error:", error);
      res.status(500).json({ message: "Failed to get storage systems" });
    }
  });

  app.get("/api/storage-systems/:id", async (req, res) => {
    try {
      const system = await storage.getStorageSystem(parseInt(req.params.id));
      if (!system) {
        return res.status(404).json({ message: "Storage system not found" });
      }
      res.json(system);
    } catch (error) {
      console.error("Get storage system error:", error);
      res.status(500).json({ message: "Failed to get storage system" });
    }
  });

  app.post("/api/storage-systems", async (req, res) => {
    try {
      const data = insertStorageSystemSchema.parse(req.body);
      const system = await storage.createStorageSystem(data);
      res.status(201).json(system);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create storage system error:", error);
      res.status(500).json({ message: "Failed to create storage system" });
    }
  });

  app.put("/api/storage-systems/:id", async (req, res) => {
    try {
      const system = await storage.updateStorageSystem(parseInt(req.params.id), req.body);
      res.json(system);
    } catch (error) {
      console.error("Update storage system error:", error);
      res.status(500).json({ message: "Failed to update storage system" });
    }
  });

  app.delete("/api/storage-systems/:id", async (req, res) => {
    try {
      await storage.deleteStorageSystem(parseInt(req.params.id));
      res.json({ message: "Storage system deleted" });
    } catch (error) {
      console.error("Delete storage system error:", error);
      res.status(500).json({ message: "Failed to delete storage system" });
    }
  });

  // Storage Pools routes
  app.get("/api/storage-pools", async (req, res) => {
    try {
      const systemId = req.query.systemId ? parseInt(req.query.systemId as string) : undefined;
      const pools = systemId 
        ? await storage.getStoragePoolsBySystem(systemId)
        : await storage.getAllStoragePools();
      res.json(pools);
    } catch (error) {
      console.error("Get storage pools error:", error);
      res.status(500).json({ message: "Failed to get storage pools" });
    }
  });

  app.get("/api/storage-pools/:id", async (req, res) => {
    try {
      const pool = await storage.getStoragePool(parseInt(req.params.id));
      if (!pool) {
        return res.status(404).json({ message: "Storage pool not found" });
      }
      res.json(pool);
    } catch (error) {
      console.error("Get storage pool error:", error);
      res.status(500).json({ message: "Failed to get storage pool" });
    }
  });

  app.post("/api/storage-pools", async (req, res) => {
    try {
      const data = insertStoragePoolSchema.parse(req.body);
      const pool = await storage.createStoragePool(data);
      res.status(201).json(pool);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create storage pool error:", error);
      res.status(500).json({ message: "Failed to create storage pool" });
    }
  });

  app.put("/api/storage-pools/:id", async (req, res) => {
    try {
      const pool = await storage.updateStoragePool(parseInt(req.params.id), req.body);
      res.json(pool);
    } catch (error) {
      console.error("Update storage pool error:", error);
      res.status(500).json({ message: "Failed to update storage pool" });
    }
  });

  app.delete("/api/storage-pools/:id", async (req, res) => {
    try {
      await storage.deleteStoragePool(parseInt(req.params.id));
      res.json({ message: "Storage pool deleted" });
    } catch (error) {
      console.error("Delete storage pool error:", error);
      res.status(500).json({ message: "Failed to delete storage pool" });
    }
  });

  // LUN routes
  app.get("/api/luns", async (req, res) => {
    try {
      const poolId = req.query.poolId ? parseInt(req.query.poolId as string) : undefined;
      const luns = poolId 
        ? await storage.getLunsByPool(poolId)
        : await storage.getAllLuns();
      res.json(luns);
    } catch (error) {
      console.error("Get LUNs error:", error);
      res.status(500).json({ message: "Failed to get LUNs" });
    }
  });

  app.get("/api/luns/:id", async (req, res) => {
    try {
      const lun = await storage.getLun(parseInt(req.params.id));
      if (!lun) {
        return res.status(404).json({ message: "LUN not found" });
      }
      res.json(lun);
    } catch (error) {
      console.error("Get LUN error:", error);
      res.status(500).json({ message: "Failed to get LUN" });
    }
  });

  app.post("/api/luns", async (req, res) => {
    try {
      const data = insertLunSchema.parse(req.body);
      const lun = await storage.createLun(data);
      res.status(201).json(lun);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create LUN error:", error);
      res.status(500).json({ message: "Failed to create LUN" });
    }
  });

  app.put("/api/luns/:id", async (req, res) => {
    try {
      const lun = await storage.updateLun(parseInt(req.params.id), req.body);
      res.json(lun);
    } catch (error) {
      console.error("Update LUN error:", error);
      res.status(500).json({ message: "Failed to update LUN" });
    }
  });

  app.delete("/api/luns/:id", async (req, res) => {
    try {
      await storage.deleteLun(parseInt(req.params.id));
      res.json({ message: "LUN deleted" });
    } catch (error) {
      console.error("Delete LUN error:", error);
      res.status(500).json({ message: "Failed to delete LUN" });
    }
  });

  // Host routes
  app.get("/api/hosts", async (req, res) => {
    try {
      const hosts = await storage.getAllHosts();
      res.json(hosts);
    } catch (error) {
      console.error("Get hosts error:", error);
      res.status(500).json({ message: "Failed to get hosts" });
    }
  });

  app.get("/api/hosts/:id", async (req, res) => {
    try {
      const host = await storage.getHost(parseInt(req.params.id));
      if (!host) {
        return res.status(404).json({ message: "Host not found" });
      }
      res.json(host);
    } catch (error) {
      console.error("Get host error:", error);
      res.status(500).json({ message: "Failed to get host" });
    }
  });

  app.post("/api/hosts", async (req, res) => {
    try {
      const data = insertHostSchema.parse(req.body);
      const host = await storage.createHost(data);
      res.status(201).json(host);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create host error:", error);
      res.status(500).json({ message: "Failed to create host" });
    }
  });

  app.put("/api/hosts/:id", async (req, res) => {
    try {
      const host = await storage.updateHost(parseInt(req.params.id), req.body);
      res.json(host);
    } catch (error) {
      console.error("Update host error:", error);
      res.status(500).json({ message: "Failed to update host" });
    }
  });

  app.delete("/api/hosts/:id", async (req, res) => {
    try {
      await storage.deleteHost(parseInt(req.params.id));
      res.json({ message: "Host deleted" });
    } catch (error) {
      console.error("Delete host error:", error);
      res.status(500).json({ message: "Failed to delete host" });
    }
  });

  // LUN Masking routes
  app.get("/api/lun-masking", async (req, res) => {
    try {
      const lunId = req.query.lunId ? parseInt(req.query.lunId as string) : undefined;
      const hostId = req.query.hostId ? parseInt(req.query.hostId as string) : undefined;
      
      let masking;
      if (lunId) {
        masking = await storage.getLunMaskingByLun(lunId);
      } else if (hostId) {
        masking = await storage.getLunMaskingByHost(hostId);
      } else {
        masking = await storage.getAllLunMasking();
      }
      res.json(masking);
    } catch (error) {
      console.error("Get LUN masking error:", error);
      res.status(500).json({ message: "Failed to get LUN masking" });
    }
  });

  app.post("/api/lun-masking", async (req, res) => {
    try {
      const data = insertLunMaskingSchema.parse(req.body);
      const masking = await storage.createLunMasking(data);
      res.status(201).json(masking);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create LUN masking error:", error);
      res.status(500).json({ message: "Failed to create LUN masking" });
    }
  });

  app.delete("/api/lun-masking/:id", async (req, res) => {
    try {
      await storage.deleteLunMasking(parseInt(req.params.id));
      res.json({ message: "LUN masking removed" });
    } catch (error) {
      console.error("Delete LUN masking error:", error);
      res.status(500).json({ message: "Failed to delete LUN masking" });
    }
  });

  // Fabric Switch routes
  app.get("/api/fabric-switches", async (req, res) => {
    try {
      const switches = await storage.getAllFabricSwitches();
      res.json(switches);
    } catch (error) {
      console.error("Get fabric switches error:", error);
      res.status(500).json({ message: "Failed to get fabric switches" });
    }
  });

  app.get("/api/fabric-switches/:id", async (req, res) => {
    try {
      const sw = await storage.getFabricSwitch(parseInt(req.params.id));
      if (!sw) {
        return res.status(404).json({ message: "Fabric switch not found" });
      }
      res.json(sw);
    } catch (error) {
      console.error("Get fabric switch error:", error);
      res.status(500).json({ message: "Failed to get fabric switch" });
    }
  });

  app.post("/api/fabric-switches", async (req, res) => {
    try {
      const data = insertFabricSwitchSchema.parse(req.body);
      const sw = await storage.createFabricSwitch(data);
      res.status(201).json(sw);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create fabric switch error:", error);
      res.status(500).json({ message: "Failed to create fabric switch" });
    }
  });

  app.put("/api/fabric-switches/:id", async (req, res) => {
    try {
      const sw = await storage.updateFabricSwitch(parseInt(req.params.id), req.body);
      res.json(sw);
    } catch (error) {
      console.error("Update fabric switch error:", error);
      res.status(500).json({ message: "Failed to update fabric switch" });
    }
  });

  app.delete("/api/fabric-switches/:id", async (req, res) => {
    try {
      await storage.deleteFabricSwitch(parseInt(req.params.id));
      res.json({ message: "Fabric switch deleted" });
    } catch (error) {
      console.error("Delete fabric switch error:", error);
      res.status(500).json({ message: "Failed to delete fabric switch" });
    }
  });

  // Zone routes
  app.get("/api/zones", async (req, res) => {
    try {
      const switchId = req.query.switchId ? parseInt(req.query.switchId as string) : undefined;
      const zones = switchId 
        ? await storage.getZonesBySwitch(switchId)
        : await storage.getAllZones();
      res.json(zones);
    } catch (error) {
      console.error("Get zones error:", error);
      res.status(500).json({ message: "Failed to get zones" });
    }
  });

  app.post("/api/zones", async (req, res) => {
    try {
      const data = insertZoneSchema.parse(req.body);
      const zone = await storage.createZone(data);
      res.status(201).json(zone);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create zone error:", error);
      res.status(500).json({ message: "Failed to create zone" });
    }
  });

  app.put("/api/zones/:id", async (req, res) => {
    try {
      const zone = await storage.updateZone(parseInt(req.params.id), req.body);
      res.json(zone);
    } catch (error) {
      console.error("Update zone error:", error);
      res.status(500).json({ message: "Failed to update zone" });
    }
  });

  app.delete("/api/zones/:id", async (req, res) => {
    try {
      await storage.deleteZone(parseInt(req.params.id));
      res.json({ message: "Zone deleted" });
    } catch (error) {
      console.error("Delete zone error:", error);
      res.status(500).json({ message: "Failed to delete zone" });
    }
  });

  // Tier Policy routes
  app.get("/api/tier-policies", async (req, res) => {
    try {
      const poolId = req.query.poolId ? parseInt(req.query.poolId as string) : undefined;
      const policies = poolId 
        ? await storage.getTierPoliciesByPool(poolId)
        : await storage.getAllTierPolicies();
      res.json(policies);
    } catch (error) {
      console.error("Get tier policies error:", error);
      res.status(500).json({ message: "Failed to get tier policies" });
    }
  });

  app.post("/api/tier-policies", async (req, res) => {
    try {
      const data = insertTierPolicySchema.parse(req.body);
      const policy = await storage.createTierPolicy(data);
      res.status(201).json(policy);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create tier policy error:", error);
      res.status(500).json({ message: "Failed to create tier policy" });
    }
  });

  app.put("/api/tier-policies/:id", async (req, res) => {
    try {
      const policy = await storage.updateTierPolicy(parseInt(req.params.id), req.body);
      res.json(policy);
    } catch (error) {
      console.error("Update tier policy error:", error);
      res.status(500).json({ message: "Failed to update tier policy" });
    }
  });

  app.delete("/api/tier-policies/:id", async (req, res) => {
    try {
      await storage.deleteTierPolicy(parseInt(req.params.id));
      res.json({ message: "Tier policy deleted" });
    } catch (error) {
      console.error("Delete tier policy error:", error);
      res.status(500).json({ message: "Failed to delete tier policy" });
    }
  });

  // Replication Pair routes
  app.get("/api/replication-pairs", async (req, res) => {
    try {
      const pairs = await storage.getAllReplicationPairs();
      res.json(pairs);
    } catch (error) {
      console.error("Get replication pairs error:", error);
      res.status(500).json({ message: "Failed to get replication pairs" });
    }
  });

  app.get("/api/replication-pairs/:id", async (req, res) => {
    try {
      const pair = await storage.getReplicationPair(parseInt(req.params.id));
      if (!pair) {
        return res.status(404).json({ message: "Replication pair not found" });
      }
      res.json(pair);
    } catch (error) {
      console.error("Get replication pair error:", error);
      res.status(500).json({ message: "Failed to get replication pair" });
    }
  });

  app.post("/api/replication-pairs", async (req, res) => {
    try {
      const data = insertReplicationPairSchema.parse(req.body);
      const pair = await storage.createReplicationPair(data);
      res.status(201).json(pair);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid data", errors: error.errors });
      }
      console.error("Create replication pair error:", error);
      res.status(500).json({ message: "Failed to create replication pair" });
    }
  });

  app.put("/api/replication-pairs/:id", async (req, res) => {
    try {
      const pair = await storage.updateReplicationPair(parseInt(req.params.id), req.body);
      res.json(pair);
    } catch (error) {
      console.error("Update replication pair error:", error);
      res.status(500).json({ message: "Failed to update replication pair" });
    }
  });

  app.delete("/api/replication-pairs/:id", async (req, res) => {
    try {
      await storage.deleteReplicationPair(parseInt(req.params.id));
      res.json({ message: "Replication pair deleted" });
    } catch (error) {
      console.error("Delete replication pair error:", error);
      res.status(500).json({ message: "Failed to delete replication pair" });
    }
  });

  // Performance Metrics routes
  app.get("/api/metrics", async (req, res) => {
    try {
      const metrics = await storage.getLatestMetrics();
      res.json(metrics);
    } catch (error) {
      console.error("Get metrics error:", error);
      res.status(500).json({ message: "Failed to get metrics" });
    }
  });

  app.get("/api/metrics/:entityType/:entityId", async (req, res) => {
    try {
      const { entityType, entityId } = req.params;
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const metrics = await storage.getPerformanceMetrics(entityType, parseInt(entityId), limit);
      res.json(metrics);
    } catch (error) {
      console.error("Get entity metrics error:", error);
      res.status(500).json({ message: "Failed to get metrics" });
    }
  });

  // Alerts routes
  app.get("/api/alerts", async (req, res) => {
    try {
      const includeAcknowledged = req.query.includeAcknowledged === 'true';
      const alerts = await storage.getAllAlerts(includeAcknowledged);
      res.json(alerts);
    } catch (error) {
      console.error("Get alerts error:", error);
      res.status(500).json({ message: "Failed to get alerts" });
    }
  });

  app.post("/api/alerts/:id/acknowledge", async (req, res) => {
    try {
      const userId = req.body.userId || 1;
      const alert = await storage.acknowledgeAlert(parseInt(req.params.id), userId);
      res.json(alert);
    } catch (error) {
      console.error("Acknowledge alert error:", error);
      res.status(500).json({ message: "Failed to acknowledge alert" });
    }
  });

  // Audit Logs routes
  app.get("/api/audit-logs", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : 100;
      const logs = await storage.getAuditLogs(limit);
      res.json(logs);
    } catch (error) {
      console.error("Get audit logs error:", error);
      res.status(500).json({ message: "Failed to get audit logs" });
    }
  });

  // Failover Engine routes (DR)
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

  app.post("/api/failover/trigger/:pairId", async (req, res) => {
    try {
      const pairId = parseInt(req.params.pairId);
      const result = await failoverEngine.triggerManualFailover(pairId);
      
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

  // Tiering Engine routes
  app.get("/api/tiering/stats", async (req, res) => {
    try {
      const stats = tieringEngine.getStats();
      res.json(stats);
    } catch (error) {
      console.error("Get tiering stats error:", error);
      res.status(500).json({ message: "Failed to get tiering stats" });
    }
  });

  app.post("/api/tiering/start", async (req, res) => {
    try {
      tieringEngine.start();
      res.json({ message: "Tiering engine started successfully", isRunning: true });
    } catch (error) {
      console.error("Start tiering engine error:", error);
      res.status(500).json({ message: "Failed to start tiering engine" });
    }
  });

  app.post("/api/tiering/stop", async (req, res) => {
    try {
      tieringEngine.stop();
      res.json({ message: "Tiering engine stopped successfully", isRunning: false });
    } catch (error) {
      console.error("Stop tiering engine error:", error);
      res.status(500).json({ message: "Failed to stop tiering engine" });
    }
  });

  // Dashboard summary route
  app.get("/api/dashboard/summary", async (req, res) => {
    try {
      const [systems, pools, luns, hosts, alerts, replicationPairs] = await Promise.all([
        storage.getAllStorageSystems(),
        storage.getAllStoragePools(),
        storage.getAllLuns(),
        storage.getAllHosts(),
        storage.getAllAlerts(false),
        storage.getAllReplicationPairs()
      ]);

      const totalCapacity = systems.reduce((sum, s) => sum + s.totalCapacityTB, 0);
      const usedCapacity = systems.reduce((sum, s) => sum + s.usedCapacityTB, 0);
      const onlineSystems = systems.filter(s => s.status === 'online').length;
      const onlineHosts = hosts.filter(h => h.status === 'online').length;

      res.json({
        storageSystems: {
          total: systems.length,
          online: onlineSystems,
          offline: systems.length - onlineSystems
        },
        capacity: {
          totalTB: totalCapacity,
          usedTB: usedCapacity,
          availableTB: totalCapacity - usedCapacity,
          utilizationPercent: totalCapacity > 0 ? (usedCapacity / totalCapacity) * 100 : 0
        },
        pools: {
          total: pools.length,
          healthy: pools.filter(p => p.status === 'healthy').length
        },
        luns: {
          total: luns.length,
          online: luns.filter(l => l.status === 'online').length
        },
        hosts: {
          total: hosts.length,
          online: onlineHosts,
          offline: hosts.length - onlineHosts
        },
        alerts: {
          total: alerts.length,
          critical: alerts.filter(a => a.severity === 'critical').length,
          warning: alerts.filter(a => a.severity === 'warning').length,
          info: alerts.filter(a => a.severity === 'info').length
        },
        replication: {
          total: replicationPairs.length,
          active: replicationPairs.filter(r => r.status === 'active').length,
          syncing: replicationPairs.filter(r => r.status === 'syncing').length
        },
        engines: {
          failover: failoverEngine.getStats(),
          tiering: tieringEngine.getStats()
        }
      });
    } catch (error) {
      console.error("Get dashboard summary error:", error);
      res.status(500).json({ message: "Failed to get dashboard summary" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
