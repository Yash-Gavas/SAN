import { 
  users, 
  assets,
  lendingPools,
  borrowingMarkets,
  liquidityPools,
  userPositions,
  transactions,
  type User, 
  type InsertUser,
  type Asset,
  type InsertAsset,
  type LendingPool,
  type InsertLendingPool,
  type BorrowingMarket,
  type InsertBorrowingMarket,
  type LiquidityPool,
  type InsertLiquidityPool,
  type UserPosition,
  type InsertUserPosition,
  type Transaction,
  type InsertTransaction
} from "@shared/schema";

// Define the storage interface
export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  getUserByWalletAddress(address: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Asset methods
  getAllAssets(): Promise<Asset[]>;
  getAsset(id: number): Promise<Asset | undefined>;
  getAssetBySymbol(symbol: string): Promise<Asset | undefined>;
  createAsset(asset: InsertAsset): Promise<Asset>;

  // Lending pool methods
  getAllLendingPools(): Promise<LendingPool[]>;
  getLendingPool(id: number): Promise<LendingPool | undefined>;
  createLendingPool(pool: InsertLendingPool): Promise<LendingPool>;

  // Borrowing market methods
  getAllBorrowingMarkets(): Promise<BorrowingMarket[]>;
  getBorrowingMarket(id: number): Promise<BorrowingMarket | undefined>;
  createBorrowingMarket(market: InsertBorrowingMarket): Promise<BorrowingMarket>;

  // Liquidity pool methods
  getAllLiquidityPools(): Promise<LiquidityPool[]>;
  getLiquidityPool(id: number): Promise<LiquidityPool | undefined>;
  createLiquidityPool(pool: InsertLiquidityPool): Promise<LiquidityPool>;

  // User position methods
  getUserPositions(userId: number): Promise<UserPosition[]>;
  getUserPosition(id: number): Promise<UserPosition | undefined>;
  createUserPosition(position: InsertUserPosition): Promise<UserPosition>;
  updateUserPosition(id: number, changes: Partial<InsertUserPosition>): Promise<UserPosition>;
  createOrUpdateUserPosition(
    userId: number, 
    positionType: string, 
    assetId: number, 
    amount: number,
    collateralAssetId?: number | null,
    collateralAmount?: number | null
  ): Promise<UserPosition>;

  // Transaction methods
  getUserTransactions(userId: number): Promise<Transaction[]>;
  getTransaction(id: number): Promise<Transaction | undefined>;
  createTransaction(transaction: InsertTransaction): Promise<Transaction>;
  getAllTransactions(): Promise<Transaction[]>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User>;
  private assetsMap: Map<number, Asset>;
  private lendingPoolsMap: Map<number, LendingPool>;
  private borrowingMarketsMap: Map<number, BorrowingMarket>;
  private liquidityPoolsMap: Map<number, LiquidityPool>;
  private userPositionsMap: Map<number, UserPosition>;
  private transactionsMap: Map<number, Transaction>;

  private userId: number = 1;
  private assetId: number = 1;
  private lendingPoolId: number = 1;
  private borrowingMarketId: number = 1;
  private liquidityPoolId: number = 1;
  private userPositionId: number = 1;
  private transactionId: number = 1;

  constructor() {
    this.usersMap = new Map();
    this.assetsMap = new Map();
    this.lendingPoolsMap = new Map();
    this.borrowingMarketsMap = new Map();
    this.liquidityPoolsMap = new Map();
    this.userPositionsMap = new Map();
    this.transactionsMap = new Map();

    // Initialize with some mock data for development
    this.initializeMockData();
  }

  private initializeMockData() {
    // This is just for development - would be removed in production
    // The frontend already has mock data defined, so this is to match it

    // Mock Assets
    const mockAssets = [
      {
        symbol: "ETH",
        name: "Ethereum",
        price: 1825,
        iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png?v=024",
        change24h: 2.4
      },
      {
        symbol: "BTC",
        name: "Bitcoin",
        price: 57000,
        iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png?v=024",
        change24h: 1.2
      },
      {
        symbol: "USDC",
        name: "USD Coin",
        price: 1,
        iconUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png?v=024",
        change24h: 0.01
      },
      {
        symbol: "LINK",
        name: "Chainlink",
        price: 11.5,
        iconUrl: "https://cryptologos.cc/logos/chainlink-link-logo.png?v=024",
        change24h: -0.8
      },
      {
        symbol: "UNI",
        name: "Uniswap",
        price: 6.5,
        iconUrl: "https://cryptologos.cc/logos/uniswap-uni-logo.png?v=024",
        change24h: 3.5
      },
      {
        symbol: "DAI",
        name: "Dai",
        price: 1,
        iconUrl: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png?v=024",
        change24h: 0.02
      },
      {
        symbol: "USDT",
        name: "Tether",
        price: 1,
        iconUrl: "https://cryptologos.cc/logos/tether-usdt-logo.png?v=024",
        change24h: 0.0
      }
    ];

    // Create assets
    const createdAssets: Asset[] = [];
    for (const assetData of mockAssets) {
      const asset = this.createAssetSync(assetData);
      createdAssets.push(asset);
    }

    // Get created assets by symbol for reference
    const getAssetIdBySymbol = (symbol: string): number => {
      const asset = Array.from(this.assetsMap.values()).find(a => a.symbol === symbol);
      if (!asset) throw new Error(`Asset ${symbol} not found`);
      return asset.id;
    };

    // Mock Lending Pools
    const lendingPoolsData = [
      {
        assetId: getAssetIdBySymbol("ETH"),
        marketSizeInTokens: 15246,
        apy: 3.2
      },
      {
        assetId: getAssetIdBySymbol("BTC"),
        marketSizeInTokens: 985,
        apy: 2.5
      },
      {
        assetId: getAssetIdBySymbol("USDC"),
        marketSizeInTokens: 32568421,
        apy: 5.8
      },
      {
        assetId: getAssetIdBySymbol("LINK"),
        marketSizeInTokens: 965420,
        apy: 2.1
      },
      {
        assetId: getAssetIdBySymbol("UNI"),
        marketSizeInTokens: 524190,
        apy: 1.7
      }
    ];

    // Create lending pools
    for (const poolData of lendingPoolsData) {
      this.createLendingPoolSync(poolData);
    }

    // Mock Borrowing Markets
    const borrowingMarketsData = [
      {
        assetId: getAssetIdBySymbol("USDC"),
        availableInTokens: 12400000,
        interestRate: 7.2,
        collateralRequired: 150
      },
      {
        assetId: getAssetIdBySymbol("DAI"),
        availableInTokens: 8200000,
        interestRate: 6.8,
        collateralRequired: 150
      },
      {
        assetId: getAssetIdBySymbol("USDT"),
        availableInTokens: 15600000,
        interestRate: 7.5,
        collateralRequired: 150
      },
      {
        assetId: getAssetIdBySymbol("ETH"),
        availableInTokens: 2458,
        interestRate: 3.5,
        collateralRequired: 175
      }
    ];

    // Create borrowing markets
    for (const marketData of borrowingMarketsData) {
      this.createBorrowingMarketSync(marketData);
    }

    // Mock Liquidity Pools
    const liquidityPoolsData = [
      {
        asset1Id: getAssetIdBySymbol("ETH"),
        asset2Id: getAssetIdBySymbol("USDC"),
        liquidityUsd: 24500000,
        volume24hUsd: 3200000,
        apy: 15.2,
        feeTier: 0.3
      },
      {
        asset1Id: getAssetIdBySymbol("BTC"),
        asset2Id: getAssetIdBySymbol("ETH"),
        liquidityUsd: 18300000,
        volume24hUsd: 2400000,
        apy: 12.5,
        feeTier: 0.3
      },
      {
        asset1Id: getAssetIdBySymbol("USDC"),
        asset2Id: getAssetIdBySymbol("DAI"),
        liquidityUsd: 32100000,
        volume24hUsd: 5800000,
        apy: 4.2,
        feeTier: 0.05
      },
      {
        asset1Id: getAssetIdBySymbol("ETH"),
        asset2Id: getAssetIdBySymbol("LINK"),
        liquidityUsd: 5700000,
        volume24hUsd: 890000,
        apy: 18.4,
        feeTier: 0.3
      }
    ];

    // Create liquidity pools
    for (const poolData of liquidityPoolsData) {
      this.createLiquidityPoolSync(poolData);
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.username === username
    );
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(
      (user) => user.walletAddress === address
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.userId++;
    const now = new Date();
    const user: User = { ...insertUser, id };
    this.usersMap.set(id, user);
    return user;
  }

  // Asset methods
  async getAllAssets(): Promise<Asset[]> {
    return Array.from(this.assetsMap.values());
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    return this.assetsMap.get(id);
  }

  async getAssetBySymbol(symbol: string): Promise<Asset | undefined> {
    return Array.from(this.assetsMap.values()).find(
      (asset) => asset.symbol === symbol
    );
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const id = this.assetId++;
    const asset: Asset = { ...insertAsset, id };
    this.assetsMap.set(id, asset);
    return asset;
  }

  // Sync version for initialization
  private createAssetSync(insertAsset: InsertAsset): Asset {
    const id = this.assetId++;
    const asset: Asset = { ...insertAsset, id };
    this.assetsMap.set(id, asset);
    return asset;
  }

  // Lending pool methods
  async getAllLendingPools(): Promise<LendingPool[]> {
    return Array.from(this.lendingPoolsMap.values());
  }

  async getLendingPool(id: number): Promise<LendingPool | undefined> {
    return this.lendingPoolsMap.get(id);
  }

  async createLendingPool(insertPool: InsertLendingPool): Promise<LendingPool> {
    const id = this.lendingPoolId++;
    const pool: LendingPool = { ...insertPool, id };
    this.lendingPoolsMap.set(id, pool);
    return pool;
  }

  // Sync version for initialization
  private createLendingPoolSync(insertPool: InsertLendingPool): LendingPool {
    const id = this.lendingPoolId++;
    const pool: LendingPool = { ...insertPool, id };
    this.lendingPoolsMap.set(id, pool);
    return pool;
  }

  // Borrowing market methods
  async getAllBorrowingMarkets(): Promise<BorrowingMarket[]> {
    return Array.from(this.borrowingMarketsMap.values());
  }

  async getBorrowingMarket(id: number): Promise<BorrowingMarket | undefined> {
    return this.borrowingMarketsMap.get(id);
  }

  async createBorrowingMarket(insertMarket: InsertBorrowingMarket): Promise<BorrowingMarket> {
    const id = this.borrowingMarketId++;
    const market: BorrowingMarket = { ...insertMarket, id };
    this.borrowingMarketsMap.set(id, market);
    return market;
  }

  // Sync version for initialization
  private createBorrowingMarketSync(insertMarket: InsertBorrowingMarket): BorrowingMarket {
    const id = this.borrowingMarketId++;
    const market: BorrowingMarket = { ...insertMarket, id };
    this.borrowingMarketsMap.set(id, market);
    return market;
  }

  // Liquidity pool methods
  async getAllLiquidityPools(): Promise<LiquidityPool[]> {
    return Array.from(this.liquidityPoolsMap.values());
  }

  async getLiquidityPool(id: number): Promise<LiquidityPool | undefined> {
    return this.liquidityPoolsMap.get(id);
  }

  async createLiquidityPool(insertPool: InsertLiquidityPool): Promise<LiquidityPool> {
    const id = this.liquidityPoolId++;
    const pool: LiquidityPool = { ...insertPool, id };
    this.liquidityPoolsMap.set(id, pool);
    return pool;
  }

  // Sync version for initialization
  private createLiquidityPoolSync(insertPool: InsertLiquidityPool): LiquidityPool {
    const id = this.liquidityPoolId++;
    const pool: LiquidityPool = { ...insertPool, id };
    this.liquidityPoolsMap.set(id, pool);
    return pool;
  }

  // User position methods
  async getUserPositions(userId: number): Promise<UserPosition[]> {
    return Array.from(this.userPositionsMap.values()).filter(
      (position) => position.userId === userId
    );
  }

  async getUserPosition(id: number): Promise<UserPosition | undefined> {
    return this.userPositionsMap.get(id);
  }

  async createUserPosition(insertPosition: InsertUserPosition): Promise<UserPosition> {
    const id = this.userPositionId++;
    const now = new Date();
    const position: UserPosition = { 
      ...insertPosition, 
      id, 
      createdAt: now,
      updatedAt: now 
    };
    this.userPositionsMap.set(id, position);
    return position;
  }

  async updateUserPosition(id: number, changes: Partial<InsertUserPosition>): Promise<UserPosition> {
    const position = this.userPositionsMap.get(id);
    if (!position) {
      throw new Error(`User position with id ${id} not found`);
    }

    const now = new Date();
    const updatedPosition: UserPosition = {
      ...position,
      ...changes,
      updatedAt: now
    };

    this.userPositionsMap.set(id, updatedPosition);
    return updatedPosition;
  }

  async createOrUpdateUserPosition(
    userId: number,
    positionType: string, 
    assetId: number,
    amount: number,
    collateralAssetId?: number | null,
    collateralAmount?: number | null
  ): Promise<UserPosition> {
    // Find if there's an existing position of this type for this asset
    const existingPosition = Array.from(this.userPositionsMap.values()).find(
      (position) => 
        position.userId === userId && 
        position.positionType === positionType && 
        position.assetId === assetId
    );

    if (existingPosition) {
      // Update existing position
      return this.updateUserPosition(existingPosition.id, {
        amount: existingPosition.amount + amount,
        collateralAssetId: collateralAssetId || existingPosition.collateralAssetId,
        collateralAmount: collateralAmount 
          ? (existingPosition.collateralAmount || 0) + collateralAmount
          : existingPosition.collateralAmount
      });
    } else {
      // Get APY from appropriate market
      let apy = 0;
      if (positionType === 'lending') {
        const lendingPool = Array.from(this.lendingPoolsMap.values()).find(
          (pool) => pool.assetId === assetId
        );
        apy = lendingPool?.apy || 0;
      } else if (positionType === 'borrowing') {
        const borrowingMarket = Array.from(this.borrowingMarketsMap.values()).find(
          (market) => market.assetId === assetId
        );
        apy = borrowingMarket?.interestRate || 0;
      } else if (positionType === 'liquidity') {
        const liquidityPool = Array.from(this.liquidityPoolsMap.values()).find(
          (pool) => pool.asset1Id === assetId || pool.asset2Id === assetId
        );
        apy = liquidityPool?.apy || 0;
      }

      // Create new position
      return this.createUserPosition({
        userId,
        positionType,
        assetId,
        amount,
        collateralAssetId: collateralAssetId || null,
        collateralAmount: collateralAmount || null,
        secondAssetId: null,
        earned: 0,
        apy
      });
    }
  }

  // Transaction methods
  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return Array.from(this.transactionsMap.values())
      .filter((transaction) => transaction.userId === userId)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()); // Sort by newest first
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    return this.transactionsMap.get(id);
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const id = this.transactionId++;
    const now = new Date();
    const transaction: Transaction = { 
      ...insertTransaction, 
      id, 
      createdAt: now
    };
    this.transactionsMap.set(id, transaction);
    return transaction;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  async getAllTransactions(): Promise<Transaction[]> {
    return Array.from(this.transactionsMap.values());
  }
}

import { db } from "./db";
import { eq, and, desc, sql, count } from "drizzle-orm";

export class DatabaseStorage implements IStorage {
  async getUser(id: number): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.username, username));
    return user;
  }

  async getUserByWalletAddress(address: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.walletAddress, address));
    return user;
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const [user] = await db.insert(users).values(insertUser).returning();
    return user;
  }

  async getAllAssets(): Promise<Asset[]> {
    return await db.select().from(assets);
  }

  async getAsset(id: number): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.id, id));
    return asset;
  }

  async getAssetBySymbol(symbol: string): Promise<Asset | undefined> {
    const [asset] = await db.select().from(assets).where(eq(assets.symbol, symbol));
    return asset;
  }

  async createAsset(insertAsset: InsertAsset): Promise<Asset> {
    const [asset] = await db.insert(assets).values(insertAsset).returning();
    return asset;
  }

  async getAllLendingPools(): Promise<LendingPool[]> {
    return await db.select().from(lendingPools);
  }

  async getLendingPool(id: number): Promise<LendingPool | undefined> {
    const [pool] = await db.select().from(lendingPools).where(eq(lendingPools.id, id));
    return pool;
  }

  async createLendingPool(insertPool: InsertLendingPool): Promise<LendingPool> {
    const [pool] = await db.insert(lendingPools).values(insertPool).returning();
    return pool;
  }

  async getAllBorrowingMarkets(): Promise<BorrowingMarket[]> {
    return await db.select().from(borrowingMarkets);
  }

  async getBorrowingMarket(id: number): Promise<BorrowingMarket | undefined> {
    const [market] = await db.select().from(borrowingMarkets).where(eq(borrowingMarkets.id, id));
    return market;
  }

  async createBorrowingMarket(insertMarket: InsertBorrowingMarket): Promise<BorrowingMarket> {
    const [market] = await db.insert(borrowingMarkets).values(insertMarket).returning();
    return market;
  }

  async getAllLiquidityPools(): Promise<LiquidityPool[]> {
    return await db.select().from(liquidityPools);
  }

  async getLiquidityPool(id: number): Promise<LiquidityPool | undefined> {
    const [pool] = await db.select().from(liquidityPools).where(eq(liquidityPools.id, id));
    return pool;
  }

  async createLiquidityPool(insertPool: InsertLiquidityPool): Promise<LiquidityPool> {
    const [pool] = await db.insert(liquidityPools).values(insertPool).returning();
    return pool;
  }

  async getUserPositions(userId: number): Promise<UserPosition[]> {
    return await db.select().from(userPositions).where(eq(userPositions.userId, userId));
  }

  async getUserPosition(id: number): Promise<UserPosition | undefined> {
    const [position] = await db.select().from(userPositions).where(eq(userPositions.id, id));
    return position;
  }

  async createUserPosition(insertPosition: InsertUserPosition): Promise<UserPosition> {
    const [position] = await db.insert(userPositions).values(insertPosition).returning();
    return position;
  }

  async updateUserPosition(id: number, changes: Partial<InsertUserPosition>): Promise<UserPosition> {
    const [updatedPosition] = await db
      .update(userPositions)
      .set({ ...changes, updatedAt: new Date() })
      .where(eq(userPositions.id, id))
      .returning();
    return updatedPosition;
  }

  async createOrUpdateUserPosition(
    userId: number, 
    positionType: string, 
    assetId: number, 
    amount: number,
    collateralAssetId?: number | null,
    collateralAmount?: number | null
  ): Promise<UserPosition> {
    // Try to find an existing position
    const [existingPosition] = await db
      .select()
      .from(userPositions)
      .where(
        and(
          eq(userPositions.userId, userId),
          eq(userPositions.positionType, positionType),
          eq(userPositions.assetId, assetId),
          collateralAssetId 
            ? eq(userPositions.collateralAssetId, collateralAssetId)
            : eq(userPositions.collateralAssetId, null)
        )
      );

    if (existingPosition) {
      // Update existing position
      const newAmount = existingPosition.amount + amount;
      const newCollateralAmount = collateralAmount && existingPosition.collateralAmount 
        ? existingPosition.collateralAmount + collateralAmount
        : collateralAmount || existingPosition.collateralAmount;

      return this.updateUserPosition(existingPosition.id, { 
        amount: newAmount,
        collateralAmount: newCollateralAmount
      });
    } else {
      // Create new position
      // We need to get the asset details to determine APY
      let apy = 0;

      if (positionType === 'lending') {
        const [lendingPool] = await db
          .select()
          .from(lendingPools)
          .where(eq(lendingPools.assetId, assetId));

        if (lendingPool) {
          apy = lendingPool.apy;
        }
      } else if (positionType === 'borrowing') {
        const [borrowingMarket] = await db
          .select()
          .from(borrowingMarkets)
          .where(eq(borrowingMarkets.assetId, assetId));

        if (borrowingMarket) {
          apy = borrowingMarket.interestRate;
        }
      } else if (positionType === 'liquidity') {
        // For liquidity positions, we need both assets
        if (!collateralAssetId) {
          throw new Error('Second asset ID is required for liquidity positions');
        }

        const [liquidityPool] = await db
          .select()
          .from(liquidityPools)
          .where(
            and(
              eq(liquidityPools.asset1Id, assetId),
              eq(liquidityPools.asset2Id, collateralAssetId)
            )
          );

        if (liquidityPool) {
          apy = liquidityPool.apy;
        }
      }

      return this.createUserPosition({
        userId,
        positionType,
        assetId,
        amount,
        collateralAssetId,
        collateralAmount,
        secondAssetId: positionType === 'liquidity' ? collateralAssetId : undefined,
        earned: 0,
        apy
      });
    }
  }

  async getUserTransactions(userId: number): Promise<Transaction[]> {
    return await db
      .select()
      .from(transactions)
      .where(eq(transactions.userId, userId))
      .orderBy(desc(transactions.createdAt));
  }

  async getTransaction(id: number): Promise<Transaction | undefined> {
    const [transaction] = await db.select().from(transactions).where(eq(transactions.id, id));
    return transaction;
  }

  async createTransaction(insertTransaction: InsertTransaction): Promise<Transaction> {
    const [transaction] = await db.insert(transactions).values(insertTransaction).returning();
    return transaction;
  }

  async initializeMockData() {
    // Clear existing data
    await db.delete(transactions);
    await db.delete(userPositions);
    await db.delete(liquidityPools);
    await db.delete(borrowingMarkets);
    await db.delete(lendingPools);
    await db.delete(assets);
    await db.delete(users);

    // Create admin user
    await db.insert(users).values({
      username: "admin",
      password: "admin@123",
      walletAddress: null
    });

    // Check if we already have data
    const assetCount = await db.select({ count: count() }).from(assets);
    if (assetCount[0].count > 0) {
      console.log("Database already initialized with mock data");
      return;
    }

    console.log("Initializing database with mock data");

    // Create mock assets
    const btc = await this.createAsset({
      symbol: "BTC",
      name: "Bitcoin",
      price: 50000,
      iconUrl: "https://cryptologos.cc/logos/bitcoin-btc-logo.png",
      change24h: 1.5
    });

    const eth = await this.createAsset({
      symbol: "ETH",
      name: "Ethereum",
      price: 3000,
      iconUrl: "https://cryptologos.cc/logos/ethereum-eth-logo.png",
      change24h: 2.1
    });

    const usdc = await this.createAsset({
      symbol: "USDC",
      name: "USD Coin",
      price: 1,
      iconUrl: "https://cryptologos.cc/logos/usd-coin-usdc-logo.png",
      change24h: 0.1
    });

    const dai = await this.createAsset({
      symbol: "DAI",
      name: "Dai",
      price: 1,
      iconUrl: "https://cryptologos.cc/logos/multi-collateral-dai-dai-logo.png",
      change24h: 0.05
    });

    const link = await this.createAsset({
      symbol: "LINK",
      name: "Chainlink",
      price: 15,
      iconUrl: "https://cryptologos.cc/logos/chainlink-link-logo.png",
      change24h: 3.2
    });

    // Create lending pools
    await this.createLendingPool({
      assetId: btc.id,
      marketSizeInTokens: 100,
      apy: 2.5
    });

    await this.createLendingPool({
      assetId: eth.id,
      marketSizeInTokens: 2000,
      apy: 3.2
    });

    await this.createLendingPool({
      assetId: usdc.id,
      marketSizeInTokens: 1000000,
      apy: 5.1
    });

    await this.createLendingPool({
      assetId: dai.id,
      marketSizeInTokens: 800000,
      apy: 4.8
    });

    await this.createLendingPool({
      assetId: link.id,
      marketSizeInTokens: 50000,
      apy: 3.7
    });

    // Create borrowing markets
    await this.createBorrowingMarket({
      assetId: btc.id,
      availableInTokens: 80,
      interestRate: 3.5,
      collateralRequired: 1.5
    });

    await this.createBorrowingMarket({
      assetId: eth.id,
      availableInTokens: 1500,
      interestRate: 4.2,
      collateralRequired: 1.4
    });

    await this.createBorrowingMarket({
      assetId: usdc.id,
      availableInTokens: 800000,
      interestRate: 6.1,
      collateralRequired: 1.2
    });

    await this.createBorrowingMarket({
      assetId: dai.id,
      availableInTokens: 600000,
      interestRate: 5.8,
      collateralRequired: 1.2
    });

    await this.createBorrowingMarket({
      assetId: link.id,
      availableInTokens: 40000,
      interestRate: 4.7,
      collateralRequired: 1.3
    });

    // Create liquidity pools
    await this.createLiquidityPool({
      asset1Id: btc.id,
      asset2Id: usdc.id,
      liquidityUsd: 10000000,
      volume24hUsd: 5000000,
      apy: 10.2,
      feeTier: 0.3
    });

    await this.createLiquidityPool({
      asset1Id: eth.id,
      asset2Id: usdc.id,
      liquidityUsd: 8000000,
      volume24hUsd: 4000000,
      apy: 12.5,
      feeTier: 0.3
    });

    await this.createLiquidityPool({
      asset1Id: eth.id,
      asset2Id: btc.id,
      liquidityUsd: 3000000,
      volume24hUsd: 1000000,
      apy: 8.4,
      feeTier: 0.3
    });

    await this.createLiquidityPool({
      asset1Id: link.id,
      asset2Id: eth.id,
      liquidityUsd: 1000000,
      volume24hUsd: 500000,
      apy: 15.1,
      feeTier: 0.3
    });

    await this.createLiquidityPool({
      asset1Id: dai.id,
      asset2Id: usdc.id,
      liquidityUsd: 5000000,
      volume24hUsd: 2000000,
      apy: 4.2,
      feeTier: 0.05
    });

    // Create a test user
    const testUser = await this.createUser({
      username: "testuser",
      password: "password123", // in a real app, this would be hashed
      walletAddress: "0x7a250d5630B4cF539739dF2C5dAcb4c659F2488D"
    });

    // Create some user positions
    await this.createUserPosition({
      userId: testUser.id,
      positionType: "lending",
      assetId: eth.id,
      amount: 5,
      collateralAssetId: null,
      collateralAmount: null,
      secondAssetId: null,
      earned: 0.02,
      apy: 3.2
    });

    await this.createUserPosition({
      userId: testUser.id,
      positionType: "borrowing",
      assetId: usdc.id,
      amount: 5000,
      collateralAssetId: eth.id,
      collateralAmount: 2.5,
      secondAssetId: null,
      earned: 0,
      apy: 6.1
    });

    await this.createUserPosition({
      userId: testUser.id,
      positionType: "liquidity",
      assetId: eth.id,
      amount: 1.5,
      collateralAssetId: usdc.id,
      collateralAmount: 4500,
      secondAssetId: usdc.id,
      earned: 10,
      apy: 12.5
    });

    // Create some transactions
    await this.createTransaction({
      userId: testUser.id,
      type: "lend",
      assetId: eth.id,
      amount: 5,
      fromAssetId: null,
      toAssetId: null,
      status: "completed"
    });

    await this.createTransaction({
      userId: testUser.id,
      type: "borrow",
      assetId: usdc.id,
      amount: 5000,
      fromAssetId: null,
      toAssetId: null,
      status: "completed"
    });

    await this.createTransaction({
      userId: testUser.id,
      type: "swap",
      assetId: eth.id,
      amount: 2,
      fromAssetId: eth.id,
      toAssetId: btc.id,
      status: "completed"
    });

    console.log("Mock data initialization complete");
  }

  async getUserByCredentials(username: string, password: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`${users.username} = ${username} AND ${users.password} = ${password}`)
      .limit(1);
    return user || null;
  }

  async getUserByUsername(username: string): Promise<User | null> {
    const [user] = await db
      .select()
      .from(users)
      .where(sql`${users.username} = ${username}`)
      .limit(1);
    return user || null;
  }

  async getAllUsers(): Promise<User[]> {
    return await db.select().from(users);
  }

  async getAllTransactions(): Promise<any[]> {
    return await db
      .select({
        id: transactions.id,
        type: transactions.type,
        amount: transactions.amount,
        status: transactions.status,
        createdAt: transactions.createdAt,
        username: users.username,
        assetSymbol: assets.symbol
      })
      .from(transactions)
      .leftJoin(users, eq(transactions.userId, users.id))
      .leftJoin(assets, eq(transactions.assetId, assets.id))
      .orderBy(desc(transactions.createdAt));
  }
}

export const storage = new MemStorage();

// Initialize the database with admin user when the server starts
console.log("Database initialized with admin user: username 'admin', password 'admin@123'");