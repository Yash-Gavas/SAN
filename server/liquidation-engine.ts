import { storage } from "./storage";
import { UserPosition, Asset } from "@shared/schema";

export interface LiquidationConfig {
  liquidationThreshold: number; // e.g., 1.5 = 150% collateral ratio
  liquidationPenalty: number; // e.g., 0.1 = 10% penalty
  healthFactorThreshold: number; // e.g., 1.0 = 100% health factor
}

export interface LiquidationEvent {
  id: number;
  userId: number;
  positionId: number;
  liquidatedAmount: number;
  collateralSeized: number;
  liquidationPenalty: number;
  liquidatorReward: number;
  timestamp: Date;
  status: 'pending' | 'completed' | 'failed';
}

export class LiquidationEngine {
  private config: LiquidationConfig;
  private isRunning: boolean = false;
  private liquidationEvents: Map<number, LiquidationEvent> = new Map();
  private eventId: number = 1;

  constructor() {
    this.config = {
      liquidationThreshold: 1.5, // 150% collateral ratio
      liquidationPenalty: 0.1, // 10% penalty
      healthFactorThreshold: 1.0, // 100% health factor
    };
  }

  // Start the liquidation monitoring system
  start() {
    if (this.isRunning) {
      console.log("Liquidation engine is already running");
      return;
    }

    this.isRunning = true;
    console.log("🚀 Liquidation Engine Started - Monitoring positions...");
    
    // Check positions every 30 seconds
    this.schedulePositionCheck();
  }

  // Stop the liquidation monitoring system
  stop() {
    this.isRunning = false;
    console.log("⏹️ Liquidation Engine Stopped");
  }

  private schedulePositionCheck() {
    if (!this.isRunning) return;

    setTimeout(async () => {
      try {
        await this.checkAllPositions();
      } catch (error) {
        console.error("Error during position check:", error);
      }
      
      // Schedule next check
      this.schedulePositionCheck();
    }, 30000); // Check every 30 seconds
  }

  // Check all user positions for liquidation eligibility
  private async checkAllPositions() {
    try {
      // Get all assets for price calculations
      const assets = await storage.getAllAssets();
      const assetMap = new Map(assets.map(asset => [asset.id, asset]));

      // Get all users to check their positions
      const users = await this.getAllUsers();
      
      for (const user of users) {
        const positions = await storage.getUserPositions(user.id);
        
        for (const position of positions) {
          if (position.positionType === 'borrowing') {
            await this.checkPositionForLiquidation(position, assetMap);
          }
        }
      }
    } catch (error) {
      console.error("Error checking positions:", error);
    }
  }

  // Get all users (mock implementation for now)
  private async getAllUsers() {
    // In a real implementation, this would fetch from storage
    return [
      { id: 1, username: "admin", walletAddress: null },
      { id: 2, username: "user1", walletAddress: "0x1234567890123456789012345678901234567890" },
      { id: 3, username: "user2", walletAddress: "0xabcdefabcdefabcdefabcdefabcdefabcdefabcd" }
    ];
  }

  // Check individual position for liquidation
  private async checkPositionForLiquidation(
    position: UserPosition, 
    assetMap: Map<number, Asset>
  ) {
    const borrowedAsset = assetMap.get(position.assetId);
    const collateralAsset = position.collateralAssetId ? 
      assetMap.get(position.collateralAssetId) : null;

    if (!borrowedAsset || !collateralAsset || !position.collateralAmount) {
      return; // Skip positions without proper collateral
    }

    // Calculate current values
    const borrowedValue = position.amount * borrowedAsset.price;
    const collateralValue = position.collateralAmount * collateralAsset.price;
    
    // Calculate collateral ratio
    const collateralRatio = collateralValue / borrowedValue;
    
    // Calculate health factor
    const healthFactor = collateralRatio / this.config.liquidationThreshold;

    console.log(`📊 Position Check - User ${position.userId}:
      Borrowed: ${position.amount} ${borrowedAsset.symbol} ($${borrowedValue.toFixed(2)})
      Collateral: ${position.collateralAmount} ${collateralAsset.symbol} ($${collateralValue.toFixed(2)})
      Collateral Ratio: ${(collateralRatio * 100).toFixed(2)}%
      Health Factor: ${healthFactor.toFixed(3)}
      Status: ${healthFactor < this.config.healthFactorThreshold ? '🚨 LIQUIDATABLE' : '✅ SAFE'}`);

    // Check if position should be liquidated
    if (healthFactor < this.config.healthFactorThreshold) {
      await this.liquidatePosition(position, borrowedAsset, collateralAsset, healthFactor);
    }
  }

  // Execute liquidation for an undercollateralized position
  private async liquidatePosition(
    position: UserPosition,
    borrowedAsset: Asset,
    collateralAsset: Asset,
    healthFactor: number
  ) {
    try {
      console.log(`🚨 LIQUIDATION TRIGGERED for User ${position.userId}`);
      console.log(`Position ID: ${position.id}, Health Factor: ${healthFactor.toFixed(3)}`);

      const borrowedValue = position.amount * borrowedAsset.price;
      const collateralValue = position.collateralAmount! * collateralAsset.price;

      // Calculate liquidation amounts
      const liquidationAmount = Math.min(position.amount * 0.5, position.amount); // Max 50% of debt
      const collateralToSeize = (liquidationAmount * borrowedAsset.price) / collateralAsset.price;
      const penalty = collateralToSeize * this.config.liquidationPenalty;
      const liquidatorReward = penalty * 0.5; // 50% of penalty goes to liquidator

      // Create liquidation event
      const liquidationEvent: LiquidationEvent = {
        id: this.eventId++,
        userId: position.userId,
        positionId: position.id,
        liquidatedAmount: liquidationAmount,
        collateralSeized: collateralToSeize + penalty,
        liquidationPenalty: penalty,
        liquidatorReward: liquidatorReward,
        timestamp: new Date(),
        status: 'pending'
      };

      this.liquidationEvents.set(liquidationEvent.id, liquidationEvent);

      // Execute the liquidation
      await this.executeLiquidation(liquidationEvent, position);

      console.log(`✅ LIQUIDATION COMPLETED for User ${position.userId}`);
      console.log(`Liquidated: ${liquidationAmount.toFixed(4)} ${borrowedAsset.symbol}`);
      console.log(`Collateral Seized: ${(collateralToSeize + penalty).toFixed(4)} ${collateralAsset.symbol}`);
      console.log(`Penalty: ${penalty.toFixed(4)} ${collateralAsset.symbol}`);

    } catch (error) {
      console.error(`❌ LIQUIDATION FAILED for User ${position.userId}:`, error);
    }
  }

  // Execute the actual liquidation transaction
  private async executeLiquidation(event: LiquidationEvent, position: UserPosition) {
    try {
      // Update the user position
      const newAmount = position.amount - event.liquidatedAmount;
      const newCollateralAmount = (position.collateralAmount || 0) - event.collateralSeized;

      await storage.updateUserPosition(position.id, {
        amount: newAmount,
        collateralAmount: Math.max(0, newCollateralAmount)
      });

      // Create liquidation transaction record
      await storage.createTransaction({
        type: 'liquidation',
        amount: event.liquidatedAmount,
        status: 'completed',
        assetId: position.assetId,
        userId: position.userId,
        fromAssetId: position.collateralAssetId,
        toAssetId: position.assetId
      });

      // Update liquidation event status
      event.status = 'completed';
      this.liquidationEvents.set(event.id, event);

    } catch (error) {
      event.status = 'failed';
      this.liquidationEvents.set(event.id, event);
      throw error;
    }
  }

  // Get liquidation statistics
  getStats() {
    const events = Array.from(this.liquidationEvents.values());
    const completed = events.filter(e => e.status === 'completed');
    const pending = events.filter(e => e.status === 'pending');
    const failed = events.filter(e => e.status === 'failed');

    const totalLiquidatedValue = completed.reduce((sum, e) => sum + e.liquidatedAmount, 0);
    const totalCollateralSeized = completed.reduce((sum, e) => sum + e.collateralSeized, 0);

    return {
      isRunning: this.isRunning,
      totalLiquidations: events.length,
      completedLiquidations: completed.length,
      pendingLiquidations: pending.length,
      failedLiquidations: failed.length,
      totalLiquidatedValue,
      totalCollateralSeized,
      config: this.config
    };
  }

  // Get recent liquidation events
  getRecentEvents(limit: number = 10) {
    return Array.from(this.liquidationEvents.values())
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  // Update liquidation configuration
  updateConfig(newConfig: Partial<LiquidationConfig>) {
    this.config = { ...this.config, ...newConfig };
    console.log("📋 Liquidation config updated:", this.config);
  }

  // Manual liquidation trigger (for testing or emergency situations)
  async triggerManualLiquidation(positionId: number) {
    try {
      const position = await storage.getUserPosition(positionId);
      if (!position) {
        throw new Error(`Position ${positionId} not found`);
      }

      const assets = await storage.getAllAssets();
      const assetMap = new Map(assets.map(asset => [asset.id, asset]));

      await this.checkPositionForLiquidation(position, assetMap);
      
      return { success: true, message: `Manual liquidation check completed for position ${positionId}` };
    } catch (error) {
      return { success: false, message: `Manual liquidation failed: ${error}` };
    }
  }
}

// Create global liquidation engine instance
export const liquidationEngine = new LiquidationEngine();