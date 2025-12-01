import { storage } from "./storage";
import { liquidationEngine } from "./liquidation-engine";

// Create test scenarios for liquidation system
export async function createTestLiquidationScenarios() {
  console.log("🧪 Creating test liquidation scenarios...");

  try {
    // Create test users
    const testUser1 = await storage.createUser({
      username: "test_borrower_1",
      password: "test123",
      walletAddress: "0x1111111111111111111111111111111111111111",
      role: "user"
    });

    const testUser2 = await storage.createUser({
      username: "test_borrower_2", 
      password: "test123",
      walletAddress: "0x2222222222222222222222222222222222222222",
      role: "user"
    });

    // Get existing assets
    const assets = await storage.getAllAssets();
    const ethAsset = assets.find(a => a.symbol === "ETH");
    const usdcAsset = assets.find(a => a.symbol === "USDC");
    const btcAsset = assets.find(a => a.symbol === "BTC");

    if (!ethAsset || !usdcAsset || !btcAsset) {
      console.log("❌ Required assets not found");
      return;
    }

    // Scenario 1: Safe borrowing position (healthy)
    console.log("Creating safe borrowing position...");
    await storage.createUserPosition({
      userId: testUser1.id,
      positionType: "borrowing",
      assetId: usdcAsset.id, // Borrowing USDC
      amount: 1000, // $1000 USDC borrowed
      collateralAssetId: ethAsset.id, // ETH as collateral
      collateralAmount: 1.0, // 1 ETH (~$2000 worth)
      apy: 5.5
    });

    // Scenario 2: Risky borrowing position (near liquidation)
    console.log("Creating risky borrowing position...");
    await storage.createUserPosition({
      userId: testUser2.id,
      positionType: "borrowing", 
      assetId: usdcAsset.id, // Borrowing USDC
      amount: 1500, // $1500 USDC borrowed
      collateralAssetId: btcAsset.id, // BTC as collateral
      collateralAmount: 0.04, // 0.04 BTC (~$1600 worth) - very close to liquidation threshold
      apy: 6.0
    });

    // Scenario 3: Critical borrowing position (should be liquidated)
    console.log("Creating critical borrowing position...");
    await storage.createUserPosition({
      userId: testUser1.id,
      positionType: "borrowing",
      assetId: usdcAsset.id, // Borrowing USDC  
      amount: 2000, // $2000 USDC borrowed
      collateralAssetId: ethAsset.id, // ETH as collateral
      collateralAmount: 1.2, // 1.2 ETH (~$2400 worth) - 120% ratio, below 150% threshold
      apy: 7.0
    });

    console.log("✅ Test liquidation scenarios created successfully!");
    console.log(`
📊 Test Scenarios Summary:
1. Safe Position: User ${testUser1.id} - $1000 borrowed with $2000 collateral (200% ratio) ✅ SAFE
2. Risky Position: User ${testUser2.id} - $1500 borrowed with $1600 collateral (107% ratio) ⚠️ RISKY  
3. Critical Position: User ${testUser1.id} - $2000 borrowed with $2400 collateral (120% ratio) 🚨 LIQUIDATABLE

The liquidation engine will automatically detect and liquidate positions below 150% collateral ratio.
    `);

    return {
      testUser1,
      testUser2,
      scenarios: [
        { type: "safe", ratio: "200%", status: "healthy" },
        { type: "risky", ratio: "107%", status: "at_risk" },
        { type: "critical", ratio: "120%", status: "liquidatable" }
      ]
    };

  } catch (error) {
    console.error("❌ Failed to create test scenarios:", error);
    throw error;
  }
}

// Simulate price changes to trigger liquidations
export async function simulatePriceVolatility() {
  console.log("📈 Simulating market volatility...");
  
  try {
    const assets = await storage.getAllAssets();
    
    // Simulate ETH price drop (makes ETH collateral worth less)
    const ethAsset = assets.find(a => a.symbol === "ETH");
    if (ethAsset) {
      // Drop ETH price by 20% to trigger liquidations
      const newPrice = ethAsset.price * 0.8;
      console.log(`💥 ETH price dropped from $${ethAsset.price} to $${newPrice} (-20%)`);
      
      // Note: In a real system, this would update the asset price
      // For testing, we'll use the liquidation engine's manual trigger
    }

    console.log("🎯 Market volatility simulated - positions should now be checked for liquidation");
    
  } catch (error) {
    console.error("❌ Failed to simulate price volatility:", error);
  }
}

// Get liquidation system status
export function getLiquidationSystemStatus() {
  const stats = liquidationEngine.getStats();
  const recentEvents = liquidationEngine.getRecentEvents(5);
  
  return {
    engineStatus: stats.isRunning ? "ACTIVE" : "STOPPED",
    totalLiquidations: stats.totalLiquidations,
    successRate: stats.totalLiquidations > 0 ? 
      Math.round((stats.completedLiquidations / stats.totalLiquidations) * 100) : 0,
    recentEvents: recentEvents.length,
    configuration: stats.config
  };
}