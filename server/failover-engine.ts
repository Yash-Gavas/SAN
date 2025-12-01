import { storage } from "./storage";
import { UserPosition, Asset } from "@shared/schema";

export interface FailoverConfig {
  redundancyThreshold: number;
  failoverPenalty: number;
  healthFactorThreshold: number;
}

export interface FailoverEvent {
  id: number;
  userId: number;
  allocationId: number;
  failoverCapacity: number;
  redundancyRecovered: number;
  protectionPenalty: number;
  recoveryReward: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export class FailoverProtectionEngine {
  private config: FailoverConfig;
  private isRunning: boolean = false;
  private failoverEvents: Map<number, FailoverEvent> = new Map();
  private eventId: number = 1;

  constructor() {
    this.config = {
      redundancyThreshold: 1.5,
      failoverPenalty: 0.1,
      healthFactorThreshold: 1.0,
    };
  }

  start() {
    if (this.isRunning) {
      console.log("Failover protection engine is already running");
      return;
    }

    this.isRunning = true;
    console.log("🛡️ Failover & Protection Engine Started - Monitoring allocations...");
    
    this.scheduleAllocationCheck();
  }

  stop() {
    this.isRunning = false;
    console.log("⏹️ Failover & Protection Engine Stopped");
  }

  private scheduleAllocationCheck() {
    if (!this.isRunning) return;

    setTimeout(async () => {
      try {
        await this.checkAllAllocations();
      } catch (error) {
        console.error("Error during allocation check:", error);
      }
      
      this.scheduleAllocationCheck();
    }, 30000);
  }

  private async checkAllAllocations() {
    try {
      const storageTiers = await storage.getAllAssets();
      const tierMap = new Map(storageTiers.map(tier => [tier.id, tier]));

      const hosts = await this.getAllHosts();
      
      for (const host of hosts) {
        const allocations = await storage.getUserPositions(host.id);
        
        for (const allocation of allocations) {
          if (allocation.positionType === 'borrowing') {
            await this.checkAllocationForFailover(allocation, tierMap);
          }
        }
      }
    } catch (error) {
      console.error("Error checking allocations:", error);
    }
  }

  private async getAllHosts() {
    return [
      { id: 1, hostname: "admin-host", hostAddress: null },
      { id: 2, hostname: "app-server-01", hostAddress: "10.0.1.100" },
      { id: 3, hostname: "db-server-01", hostAddress: "10.0.1.101" }
    ];
  }

  private async checkAllocationForFailover(
    allocation: UserPosition, 
    tierMap: Map<number, Asset>
  ) {
    const primaryTier = tierMap.get(allocation.assetId);
    const redundancyTier = allocation.collateralAssetId ? 
      tierMap.get(allocation.collateralAssetId) : null;

    if (!primaryTier || !redundancyTier || !allocation.collateralAmount) {
      return;
    }

    const primaryCapacity = allocation.amount * primaryTier.price;
    const redundancyCapacity = allocation.collateralAmount * redundancyTier.price;
    
    const redundancyRatio = redundancyCapacity / primaryCapacity;
    const healthFactor = redundancyRatio / this.config.redundancyThreshold;

    console.log(`📊 Allocation Check - Host ${allocation.userId}:
      Primary: ${allocation.amount} TB ${primaryTier.symbol} ($${primaryCapacity.toFixed(2)}/mo)
      Redundancy: ${allocation.collateralAmount} TB ${redundancyTier.symbol} ($${redundancyCapacity.toFixed(2)}/mo)
      Redundancy Ratio: ${(redundancyRatio * 100).toFixed(2)}%
      Health Factor: ${healthFactor.toFixed(3)}
      Status: ${healthFactor < this.config.healthFactorThreshold ? '🚨 FAILOVER REQUIRED' : '✅ PROTECTED'}`);

    if (healthFactor < this.config.healthFactorThreshold) {
      await this.executeFailover(allocation, primaryTier, redundancyTier, healthFactor);
    }
  }

  private async executeFailover(
    allocation: UserPosition,
    primaryTier: Asset,
    redundancyTier: Asset,
    healthFactor: number
  ) {
    try {
      console.log(`🚨 FAILOVER TRIGGERED for Host ${allocation.userId}`);
      console.log(`Allocation ID: ${allocation.id}, Health Factor: ${healthFactor.toFixed(3)}`);

      const primaryValue = allocation.amount * primaryTier.price;
      const redundancyValue = allocation.collateralAmount! * redundancyTier.price;

      const failoverCapacity = Math.min(allocation.amount * 0.5, allocation.amount);
      const redundancyToReclaim = (failoverCapacity * primaryTier.price) / redundancyTier.price;
      const penalty = redundancyToReclaim * this.config.failoverPenalty;
      const recoveryReward = penalty * 0.5;

      const failoverEvent: FailoverEvent = {
        id: this.eventId++,
        userId: allocation.userId,
        allocationId: allocation.id,
        failoverCapacity: failoverCapacity,
        redundancyRecovered: redundancyToReclaim + penalty,
        protectionPenalty: penalty,
        recoveryReward: recoveryReward,
        timestamp: new Date(),
        status: 'pending'
      };

      this.failoverEvents.set(failoverEvent.id, failoverEvent);

      await this.processFailover(failoverEvent, allocation);

      console.log(`✅ FAILOVER COMPLETED for Host ${allocation.userId}`);
      console.log(`Migrated: ${failoverCapacity.toFixed(4)} TB ${primaryTier.symbol}`);
      console.log(`Redundancy Used: ${(redundancyToReclaim + penalty).toFixed(4)} TB ${redundancyTier.symbol}`);
      console.log(`Protection Overhead: ${penalty.toFixed(4)} TB ${redundancyTier.symbol}`);

    } catch (error) {
      console.error(`❌ FAILOVER FAILED for Host ${allocation.userId}:`, error);
    }
  }

  private async processFailover(event: FailoverEvent, allocation: UserPosition) {
    try {
      const newCapacity = allocation.amount - event.failoverCapacity;
      const newRedundancyCapacity = (allocation.collateralAmount || 0) - event.redundancyRecovered;

      await storage.updateUserPosition(allocation.id, {
        amount: newCapacity,
        collateralAmount: Math.max(0, newRedundancyCapacity)
      });

      await storage.createTransaction({
        type: 'liquidation',
        amount: event.failoverCapacity,
        status: 'completed',
        assetId: allocation.assetId,
        userId: allocation.userId,
        fromAssetId: allocation.collateralAssetId,
        toAssetId: allocation.assetId
      });

      event.status = 'completed';
      this.failoverEvents.set(event.id, event);

    } catch (error) {
      event.status = 'failed';
      this.failoverEvents.set(event.id, event);
      throw error;
    }
  }

  getStats() {
    const events = Array.from(this.failoverEvents.values());
    const completed = events.filter(e => e.status === 'completed');
    const pending = events.filter(e => e.status === 'pending');
    const failed = events.filter(e => e.status === 'failed');

    const totalFailoverCapacity = completed.reduce((sum, e) => sum + e.failoverCapacity, 0);
    const totalRedundancyUsed = completed.reduce((sum, e) => sum + e.redundancyRecovered, 0);

    return {
      isRunning: this.isRunning,
      totalFailovers: events.length,
      completedFailovers: completed.length,
      pendingFailovers: pending.length,
      failedFailovers: failed.length,
      totalFailoverCapacity,
      totalRedundancyUsed,
      config: this.config
    };
  }

  getRecentEvents(limit: number = 10) {
    return Array.from(this.failoverEvents.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  updateConfig(newConfig: Partial<FailoverConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log("📋 Failover config updated:", this.config);
  }

  async triggerManualFailover(allocationId: number) {
    try {
      const allocation = await storage.getUserPosition(allocationId);
      if (!allocation) {
        throw new Error(`Allocation ${allocationId} not found`);
      }

      const storageTiers = await storage.getAllAssets();
      const tierMap = new Map(storageTiers.map(tier => [tier.id, tier]));

      await this.checkAllocationForFailover(allocation, tierMap);
      
      return { success: true, message: `Manual failover check completed for allocation ${allocationId}` };
    } catch (error) {
      return { success: false, message: `Manual failover failed: ${error}` };
    }
  }
}

export const failoverEngine = new FailoverProtectionEngine();
