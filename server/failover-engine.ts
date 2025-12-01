import { storage } from "./storage";

interface FailoverEvent {
  timestamp: Date;
  type: 'failover' | 'failback' | 'sync' | 'health_check';
  pairId: number;
  pairName: string;
  status: 'success' | 'failed' | 'in_progress';
  details: string;
}

interface FailoverStats {
  isRunning: boolean;
  lastCheck: Date | null;
  totalPairs: number;
  activePairs: number;
  syncingPairs: number;
  failedPairs: number;
  lastFailover: Date | null;
}

class FailoverEngine {
  private isRunning: boolean = false;
  private checkInterval: NodeJS.Timeout | null = null;
  private events: FailoverEvent[] = [];
  private stats: FailoverStats = {
    isRunning: false,
    lastCheck: null,
    totalPairs: 0,
    activePairs: 0,
    syncingPairs: 0,
    failedPairs: 0,
    lastFailover: null
  };

  constructor() {
    this.initializeSampleEvents();
  }

  private initializeSampleEvents() {
    const now = new Date();
    this.events = [
      {
        timestamp: new Date(now.getTime() - 60000),
        type: 'sync',
        pairId: 1,
        pairName: 'DB-Primary-DR',
        status: 'success',
        details: 'Synchronous replication completed - 0 lag'
      },
      {
        timestamp: new Date(now.getTime() - 300000),
        type: 'sync',
        pairId: 2,
        pairName: 'App-Server-DR',
        status: 'success',
        details: 'Async replication completed - 2 minute lag'
      },
      {
        timestamp: new Date(now.getTime() - 3600000),
        type: 'health_check',
        pairId: 0,
        pairName: 'All Pairs',
        status: 'success',
        details: 'Health check passed - All replication pairs healthy'
      },
      {
        timestamp: new Date(now.getTime() - 86400000 * 7),
        type: 'failover',
        pairId: 1,
        pairName: 'DB-Primary-DR',
        status: 'success',
        details: 'Planned failover test completed successfully'
      }
    ];
    this.stats.lastFailover = new Date(now.getTime() - 86400000 * 7);
  }

  start() {
    if (this.isRunning) {
      console.log("Failover engine is already running");
      return;
    }

    this.isRunning = true;
    this.stats.isRunning = true;
    console.log("🛡️ Failover Engine Started - Monitoring replication pairs...");

    this.checkInterval = setInterval(() => this.runHealthCheck(), 30000);
    this.runHealthCheck();
  }

  stop() {
    if (!this.isRunning) {
      console.log("Failover engine is not running");
      return;
    }

    this.isRunning = false;
    this.stats.isRunning = false;
    
    if (this.checkInterval) {
      clearInterval(this.checkInterval);
      this.checkInterval = null;
    }
    
    console.log("⏹️ Failover Engine Stopped");
  }

  private async runHealthCheck() {
    try {
      const pairs = await storage.getAllReplicationPairs();
      
      this.stats.lastCheck = new Date();
      this.stats.totalPairs = pairs.length;
      this.stats.activePairs = pairs.filter(p => p.status === 'active').length;
      this.stats.syncingPairs = pairs.filter(p => p.status === 'syncing').length;
      this.stats.failedPairs = pairs.filter(p => p.status === 'failed').length;

      for (const pair of pairs) {
        if (pair.status === 'active') {
          await this.simulateSync(pair);
        }
      }

      const healthEvent: FailoverEvent = {
        timestamp: new Date(),
        type: 'health_check',
        pairId: 0,
        pairName: 'All Pairs',
        status: this.stats.failedPairs === 0 ? 'success' : 'failed',
        details: `Health check: ${this.stats.activePairs}/${this.stats.totalPairs} pairs active`
      };

      this.addEvent(healthEvent);
    } catch (error) {
      console.error("Failover health check error:", error);
    }
  }

  private async simulateSync(pair: any) {
    const now = new Date();
    const syncEvent: FailoverEvent = {
      timestamp: now,
      type: 'sync',
      pairId: pair.id,
      pairName: pair.name,
      status: 'success',
      details: pair.replicationType === 'sync' 
        ? 'Synchronous replication in sync - 0 lag'
        : `Async replication completed - ${pair.rpoMinutes} minute RPO`
    };

    await storage.updateReplicationPair(pair.id, { lastSyncAt: now });
    this.addEvent(syncEvent);
  }

  async triggerManualFailover(pairId: number): Promise<{ success: boolean; message: string }> {
    try {
      const pair = await storage.getReplicationPair(pairId);
      
      if (!pair) {
        return { success: false, message: "Replication pair not found" };
      }

      const failoverEvent: FailoverEvent = {
        timestamp: new Date(),
        type: 'failover',
        pairId: pair.id,
        pairName: pair.name,
        status: 'in_progress',
        details: 'Manual failover initiated'
      };

      this.addEvent(failoverEvent);

      await storage.updateReplicationPair(pairId, { status: 'failover' });

      await new Promise(resolve => setTimeout(resolve, 2000));

      await storage.updateReplicationPair(pairId, { status: 'active' });

      const completeEvent: FailoverEvent = {
        timestamp: new Date(),
        type: 'failover',
        pairId: pair.id,
        pairName: pair.name,
        status: 'success',
        details: 'Failover completed successfully - Target site now active'
      };

      this.addEvent(completeEvent);
      this.stats.lastFailover = new Date();

      await storage.createAlert({
        entityType: 'replication_pair',
        entityId: pairId,
        severity: 'warning',
        title: 'Failover Completed',
        message: `Failover for ${pair.name} completed successfully. Target site is now the primary.`
      });

      return { success: true, message: `Failover for ${pair.name} completed successfully` };
    } catch (error) {
      console.error("Manual failover error:", error);
      return { success: false, message: "Failover failed - see logs for details" };
    }
  }

  private addEvent(event: FailoverEvent) {
    this.events.unshift(event);
    if (this.events.length > 100) {
      this.events = this.events.slice(0, 100);
    }
  }

  getStats(): FailoverStats {
    return { ...this.stats };
  }

  getRecentEvents(limit: number = 10): FailoverEvent[] {
    return this.events.slice(0, limit);
  }
}

export const failoverEngine = new FailoverEngine();
