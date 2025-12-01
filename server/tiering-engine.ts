import { storage } from "./storage";

interface TieringEvent {
  timestamp: Date;
  type: 'tier_up' | 'tier_down' | 'policy_executed';
  lunId: number;
  lunName: string;
  fromTier: string;
  toTier: string;
  reason: string;
}

interface TieringStats {
  isRunning: boolean;
  lastCheck: Date | null;
  totalMigrationsToday: number;
  hotTierMigrations: number;
  coldTierMigrations: number;
  activePolicies: number;
}

class TieringEngine {
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private events: TieringEvent[] = [];
  private stats: TieringStats = {
    isRunning: false,
    lastCheck: null,
    totalMigrationsToday: 0,
    hotTierMigrations: 0,
    coldTierMigrations: 0,
    activePolicies: 0
  };

  constructor() {
    this.initializeSampleEvents();
  }

  private initializeSampleEvents() {
    const now = new Date();
    this.events = [
      {
        timestamp: new Date(now.getTime() - 3600000),
        type: 'tier_up',
        lunId: 3,
        lunName: 'LUN-Archive-2024',
        fromTier: 'cold',
        toTier: 'standard',
        reason: 'Increased access frequency detected (>500 IOPS)'
      },
      {
        timestamp: new Date(now.getTime() - 7200000),
        type: 'tier_down',
        lunId: 2,
        lunName: 'LUN-App-Server-01',
        fromTier: 'hot',
        toTier: 'standard',
        reason: 'Low activity for 7 days'
      },
      {
        timestamp: new Date(now.getTime() - 86400000),
        type: 'policy_executed',
        lunId: 0,
        lunName: 'All LUNs',
        fromTier: 'n/a',
        toTier: 'n/a',
        reason: 'Daily tiering policy scan completed - 3 LUNs evaluated'
      }
    ];
    this.stats.totalMigrationsToday = 2;
    this.stats.hotTierMigrations = 1;
    this.stats.coldTierMigrations = 1;
  }

  start() {
    if (this.isRunning) {
      console.log("Tiering engine is already running");
      return;
    }

    this.isRunning = true;
    this.stats.isRunning = true;
    console.log("🔄 Tiering Engine Started - Monitoring data access patterns...");

    this.checkInterval = setInterval(() => this.runTieringCheck(), 60000);
    this.runTieringCheck();
  }

  stop() {
    if (!this.isRunning) {
      console.log("Tiering engine is not running");
      return;
    }

    this.isRunning = false;
    this.stats.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    console.log("⏹️ Tiering Engine Stopped");
  }

  private async runTieringCheck() {
    try {
      const policies = await storage.getAllTierPolicies();
      const luns = await storage.getAllLuns();
      
      this.stats.lastCheck = new Date();
      this.stats.activePolicies = policies.filter(p => p.isEnabled).length;

      for (const policy of policies) {
        if (!policy.isEnabled) continue;

        const poolLuns = luns.filter(l => l.storagePoolId === policy.storagePoolId);
        
        for (const lun of poolLuns) {
          const iops = this.simulateIOPS(lun.id);
          
          if (iops > policy.hotTierThresholdIOPS && lun.tierLevel !== 'hot') {
            await this.migrateTier(lun, 'hot', `High IOPS detected: ${iops}`);
          } else if (iops < policy.hotTierThresholdIOPS / 10 && lun.tierLevel === 'hot') {
            await this.migrateTier(lun, 'cold', `Low IOPS detected: ${iops}`);
          }
        }
      }
    } catch (error) {
      console.error("Tiering check error:", error);
    }
  }

  private simulateIOPS(lunId: number): number {
    return Math.floor(Math.random() * 2000) + 100;
  }

  private async migrateTier(lun: any, newTier: string, reason: string) {
    const event: TieringEvent = {
      timestamp: new Date(),
      type: newTier === 'hot' ? 'tier_up' : 'tier_down',
      lunId: lun.id,
      lunName: lun.name,
      fromTier: lun.tierLevel,
      toTier: newTier,
      reason
    };

    this.events.unshift(event);
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }

    this.stats.totalMigrationsToday++;
    if (newTier === 'hot') {
      this.stats.hotTierMigrations++;
    } else {
      this.stats.coldTierMigrations++;
    }

    await storage.updateLun(lun.id, { tierLevel: newTier });
    console.log(`📦 Tier migration: ${lun.name} moved from ${lun.tierLevel} to ${newTier}`);
  }

  getStats(): TieringStats {
    return { ...this.stats };
  }

  getRecentEvents(limit: number = 10): TieringEvent[] {
    return this.events.slice(0, limit);
  }
}

export const tieringEngine = new TieringEngine();
