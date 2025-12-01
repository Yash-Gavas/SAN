import { pgTable, text, serial, integer, boolean, timestamp, real, varchar } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  walletAddress: varchar("wallet_address", { length: 42 }),
  role: varchar("role", { length: 10 }).notNull().default("user"), // "admin" or "user"
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Asset table
export const assets = pgTable("assets", {
  id: serial("id").primaryKey(),
  symbol: varchar("symbol", { length: 10 }).notNull().unique(),
  name: varchar("name", { length: 50 }).notNull(),
  price: real("price").notNull(),
  iconUrl: text("icon_url").notNull(),
  change24h: real("change_24h").default(0),
});

// Lending pool table
export const lendingPools = pgTable("lending_pools", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  marketSizeInTokens: real("market_size_in_tokens").notNull(),
  apy: real("apy").notNull(),
});

// Borrowing market table
export const borrowingMarkets = pgTable("borrowing_markets", {
  id: serial("id").primaryKey(),
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  availableInTokens: real("available_in_tokens").notNull(),
  interestRate: real("interest_rate").notNull(),
  collateralRequired: real("collateral_required").notNull(),
});

// Liquidity pool table
export const liquidityPools = pgTable("liquidity_pools", {
  id: serial("id").primaryKey(),
  asset1Id: integer("asset1_id").references(() => assets.id).notNull(),
  asset2Id: integer("asset2_id").references(() => assets.id).notNull(),
  liquidityUsd: real("liquidity_usd").notNull(),
  volume24hUsd: real("volume_24h_usd").notNull(),
  apy: real("apy").notNull(),
  feeTier: real("fee_tier").notNull(),
});

// User position table (for lending, borrowing, liquidity)
export const userPositions = pgTable("user_positions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  positionType: varchar("position_type", { length: 10 }).notNull(), // 'lending', 'borrowing', 'liquidity'
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  amount: real("amount").notNull(),
  collateralAssetId: integer("collateral_asset_id").references(() => assets.id),
  collateralAmount: real("collateral_amount"),
  secondAssetId: integer("second_asset_id").references(() => assets.id), // For liquidity positions
  earned: real("earned").default(0),
  apy: real("apy").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Transaction table
export const transactions = pgTable("transactions", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id).notNull(),
  type: varchar("type", { length: 10 }).notNull(), // 'lend', 'borrow', 'swap', 'interest', etc.
  assetId: integer("asset_id").references(() => assets.id).notNull(),
  amount: real("amount").notNull(),
  fromAssetId: integer("from_asset_id").references(() => assets.id),
  toAssetId: integer("to_asset_id").references(() => assets.id),
  status: varchar("status", { length: 10 }).notNull().default("completed"), // 'pending', 'completed', 'failed'
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Schema validations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  walletAddress: true,
  role: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertAssetSchema = createInsertSchema(assets).pick({
  symbol: true,
  name: true,
  price: true,
  iconUrl: true,
  change24h: true,
});

export const insertLendingPoolSchema = createInsertSchema(lendingPools).pick({
  assetId: true,
  marketSizeInTokens: true,
  apy: true,
});

export const insertBorrowingMarketSchema = createInsertSchema(borrowingMarkets).pick({
  assetId: true,
  availableInTokens: true,
  interestRate: true,
  collateralRequired: true,
});

export const insertLiquidityPoolSchema = createInsertSchema(liquidityPools).pick({
  asset1Id: true,
  asset2Id: true,
  liquidityUsd: true,
  volume24hUsd: true,
  apy: true,
  feeTier: true,
});

export const insertUserPositionSchema = createInsertSchema(userPositions).pick({
  userId: true,
  positionType: true,
  assetId: true,
  amount: true,
  collateralAssetId: true,
  collateralAmount: true,
  secondAssetId: true,
  earned: true,
  apy: true,
});

export const insertTransactionSchema = createInsertSchema(transactions).pick({
  userId: true,
  type: true,
  assetId: true,
  amount: true,
  fromAssetId: true,
  toAssetId: true,
  status: true,
});

// Exported types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertAsset = z.infer<typeof insertAssetSchema>;
export type Asset = typeof assets.$inferSelect;

export type InsertLendingPool = z.infer<typeof insertLendingPoolSchema>;
export type LendingPool = typeof lendingPools.$inferSelect;

export type InsertBorrowingMarket = z.infer<typeof insertBorrowingMarketSchema>;
export type BorrowingMarket = typeof borrowingMarkets.$inferSelect;

export type InsertLiquidityPool = z.infer<typeof insertLiquidityPoolSchema>;
export type LiquidityPool = typeof liquidityPools.$inferSelect;

export type InsertUserPosition = z.infer<typeof insertUserPositionSchema>;
export type UserPosition = typeof userPositions.$inferSelect;

export type InsertTransaction = z.infer<typeof insertTransactionSchema>;
export type Transaction = typeof transactions.$inferSelect;
