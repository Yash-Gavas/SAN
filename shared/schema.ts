import { pgTable, text, serial, integer, boolean, timestamp, real, varchar, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User table for SAN administrators
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  email: varchar("email", { length: 255 }),
  role: varchar("role", { length: 20 }).notNull().default("operator"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Storage Systems (Enterprise Arrays)
export const storageSystems = pgTable("storage_systems", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  vendor: varchar("vendor", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }).notNull(),
  serialNumber: varchar("serial_number", { length: 100 }).unique(),
  ipAddress: varchar("ip_address", { length: 45 }),
  status: varchar("status", { length: 20 }).notNull().default("online"),
  totalCapacityTB: real("total_capacity_tb").notNull(),
  usedCapacityTB: real("used_capacity_tb").notNull().default(0),
  raidLevel: varchar("raid_level", { length: 20 }),
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  location: varchar("location", { length: 100 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Storage Pools (Capacity Pooling)
export const storagePools = pgTable("storage_pools", {
  id: serial("id").primaryKey(),
  storageSystemId: integer("storage_system_id").references(() => storageSystems.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  poolType: varchar("pool_type", { length: 20 }).notNull(),
  totalCapacityTB: real("total_capacity_tb").notNull(),
  allocatedCapacityTB: real("allocated_capacity_tb").notNull().default(0),
  usedCapacityTB: real("used_capacity_tb").notNull().default(0),
  thinProvisioningEnabled: boolean("thin_provisioning_enabled").notNull().default(true),
  compressionEnabled: boolean("compression_enabled").notNull().default(false),
  deduplicationEnabled: boolean("deduplication_enabled").notNull().default(false),
  status: varchar("status", { length: 20 }).notNull().default("healthy"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// LUNs (Logical Unit Numbers)
export const luns = pgTable("luns", {
  id: serial("id").primaryKey(),
  storagePoolId: integer("storage_pool_id").references(() => storagePools.id).notNull(),
  lunNumber: integer("lun_number").notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  capacityGB: real("capacity_gb").notNull(),
  usedCapacityGB: real("used_capacity_gb").notNull().default(0),
  thinProvisioned: boolean("thin_provisioned").notNull().default(true),
  status: varchar("status", { length: 20 }).notNull().default("online"),
  tierLevel: varchar("tier_level", { length: 20 }).notNull().default("standard"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Hosts (Servers with HBAs)
export const hosts = pgTable("hosts", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  osType: varchar("os_type", { length: 50 }).notNull(),
  ipAddress: varchar("ip_address", { length: 45 }),
  wwpn: varchar("wwpn", { length: 50 }),
  iqn: varchar("iqn", { length: 255 }),
  status: varchar("status", { length: 20 }).notNull().default("online"),
  hbaType: varchar("hba_type", { length: 20 }).notNull().default("fc"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// LUN Masking (Host-to-LUN assignments)
export const lunMasking = pgTable("lun_masking", {
  id: serial("id").primaryKey(),
  lunId: integer("lun_id").references(() => luns.id).notNull(),
  hostId: integer("host_id").references(() => hosts.id).notNull(),
  accessLevel: varchar("access_level", { length: 20 }).notNull().default("read_write"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Fabric Switches
export const fabricSwitches = pgTable("fabric_switches", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  vendor: varchar("vendor", { length: 50 }).notNull(),
  model: varchar("model", { length: 100 }),
  ipAddress: varchar("ip_address", { length: 45 }),
  portCount: integer("port_count").notNull(),
  activePortCount: integer("active_port_count").notNull().default(0),
  status: varchar("status", { length: 20 }).notNull().default("online"),
  firmwareVersion: varchar("firmware_version", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Zones (Fabric Zoning)
export const zones = pgTable("zones", {
  id: serial("id").primaryKey(),
  fabricSwitchId: integer("fabric_switch_id").references(() => fabricSwitches.id).notNull(),
  name: varchar("name", { length: 100 }).notNull(),
  zoneType: varchar("zone_type", { length: 20 }).notNull().default("soft"),
  members: text("members"),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Tier Policies (Automated Data Tiering)
export const tierPolicies = pgTable("tier_policies", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  storagePoolId: integer("storage_pool_id").references(() => storagePools.id).notNull(),
  hotTierThresholdIOPS: integer("hot_tier_threshold_iops").notNull().default(1000),
  coldTierThresholdDays: integer("cold_tier_threshold_days").notNull().default(30),
  migrationSchedule: varchar("migration_schedule", { length: 50 }).notNull().default("daily"),
  isEnabled: boolean("is_enabled").notNull().default(true),
  lastExecutedAt: timestamp("last_executed_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Replication Pairs (DR)
export const replicationPairs = pgTable("replication_pairs", {
  id: serial("id").primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  sourceLunId: integer("source_lun_id").references(() => luns.id).notNull(),
  targetStorageSystemId: integer("target_storage_system_id").references(() => storageSystems.id).notNull(),
  targetLunIdentifier: varchar("target_lun_identifier", { length: 100 }),
  replicationType: varchar("replication_type", { length: 20 }).notNull().default("async"),
  rpoMinutes: integer("rpo_minutes").notNull().default(15),
  status: varchar("status", { length: 20 }).notNull().default("active"),
  lastSyncAt: timestamp("last_sync_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Performance Metrics
export const performanceMetrics = pgTable("performance_metrics", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 20 }).notNull(),
  entityId: integer("entity_id").notNull(),
  iops: real("iops").notNull().default(0),
  throughputMBps: real("throughput_mbps").notNull().default(0),
  latencyMs: real("latency_ms").notNull().default(0),
  readPercent: real("read_percent").notNull().default(50),
  queueDepth: integer("queue_depth").notNull().default(0),
  timestamp: timestamp("timestamp").defaultNow().notNull(),
});

// Alerts
export const alerts = pgTable("alerts", {
  id: serial("id").primaryKey(),
  entityType: varchar("entity_type", { length: 20 }).notNull(),
  entityId: integer("entity_id").notNull(),
  severity: varchar("severity", { length: 20 }).notNull(),
  title: varchar("title", { length: 200 }).notNull(),
  message: text("message").notNull(),
  isAcknowledged: boolean("is_acknowledged").notNull().default(false),
  acknowledgedBy: integer("acknowledged_by").references(() => users.id),
  acknowledgedAt: timestamp("acknowledged_at"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Audit Logs
export const auditLogs = pgTable("audit_logs", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").references(() => users.id),
  action: varchar("action", { length: 50 }).notNull(),
  entityType: varchar("entity_type", { length: 50 }).notNull(),
  entityId: integer("entity_id"),
  details: text("details"),
  ipAddress: varchar("ip_address", { length: 45 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

// Failover Events (DR Events)
export const failoverEvents = pgTable("failover_events", {
  id: serial("id").primaryKey(),
  replicationPairId: integer("replication_pair_id").references(() => replicationPairs.id).notNull(),
  eventType: varchar("event_type", { length: 20 }).notNull(),
  status: varchar("status", { length: 20 }).notNull(),
  triggeredBy: varchar("triggered_by", { length: 20 }).notNull(),
  details: text("details"),
  startedAt: timestamp("started_at").defaultNow().notNull(),
  completedAt: timestamp("completed_at"),
});

// Schema validations
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
  email: true,
  role: true,
});

export const loginUserSchema = z.object({
  username: z.string().min(1),
  password: z.string().min(1),
});

export const insertStorageSystemSchema = createInsertSchema(storageSystems).pick({
  name: true,
  vendor: true,
  model: true,
  serialNumber: true,
  ipAddress: true,
  status: true,
  totalCapacityTB: true,
  usedCapacityTB: true,
  raidLevel: true,
  firmwareVersion: true,
  location: true,
});

export const insertStoragePoolSchema = createInsertSchema(storagePools).pick({
  storageSystemId: true,
  name: true,
  poolType: true,
  totalCapacityTB: true,
  allocatedCapacityTB: true,
  usedCapacityTB: true,
  thinProvisioningEnabled: true,
  compressionEnabled: true,
  deduplicationEnabled: true,
  status: true,
});

export const insertLunSchema = createInsertSchema(luns).pick({
  storagePoolId: true,
  lunNumber: true,
  name: true,
  capacityGB: true,
  usedCapacityGB: true,
  thinProvisioned: true,
  status: true,
  tierLevel: true,
});

export const insertHostSchema = createInsertSchema(hosts).pick({
  name: true,
  osType: true,
  ipAddress: true,
  wwpn: true,
  iqn: true,
  status: true,
  hbaType: true,
});

export const insertLunMaskingSchema = createInsertSchema(lunMasking).pick({
  lunId: true,
  hostId: true,
  accessLevel: true,
});

export const insertFabricSwitchSchema = createInsertSchema(fabricSwitches).pick({
  name: true,
  vendor: true,
  model: true,
  ipAddress: true,
  portCount: true,
  activePortCount: true,
  status: true,
  firmwareVersion: true,
});

export const insertZoneSchema = createInsertSchema(zones).pick({
  fabricSwitchId: true,
  name: true,
  zoneType: true,
  members: true,
  status: true,
});

export const insertTierPolicySchema = createInsertSchema(tierPolicies).pick({
  name: true,
  storagePoolId: true,
  hotTierThresholdIOPS: true,
  coldTierThresholdDays: true,
  migrationSchedule: true,
  isEnabled: true,
});

export const insertReplicationPairSchema = createInsertSchema(replicationPairs).pick({
  name: true,
  sourceLunId: true,
  targetStorageSystemId: true,
  targetLunIdentifier: true,
  replicationType: true,
  rpoMinutes: true,
  status: true,
});

export const insertPerformanceMetricSchema = createInsertSchema(performanceMetrics).pick({
  entityType: true,
  entityId: true,
  iops: true,
  throughputMBps: true,
  latencyMs: true,
  readPercent: true,
  queueDepth: true,
});

export const insertAlertSchema = createInsertSchema(alerts).pick({
  entityType: true,
  entityId: true,
  severity: true,
  title: true,
  message: true,
});

export const insertAuditLogSchema = createInsertSchema(auditLogs).pick({
  userId: true,
  action: true,
  entityType: true,
  entityId: true,
  details: true,
  ipAddress: true,
});

export const insertFailoverEventSchema = createInsertSchema(failoverEvents).pick({
  replicationPairId: true,
  eventType: true,
  status: true,
  triggeredBy: true,
  details: true,
});

// Exported types
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertStorageSystem = z.infer<typeof insertStorageSystemSchema>;
export type StorageSystem = typeof storageSystems.$inferSelect;

export type InsertStoragePool = z.infer<typeof insertStoragePoolSchema>;
export type StoragePool = typeof storagePools.$inferSelect;

export type InsertLun = z.infer<typeof insertLunSchema>;
export type Lun = typeof luns.$inferSelect;

export type InsertHost = z.infer<typeof insertHostSchema>;
export type Host = typeof hosts.$inferSelect;

export type InsertLunMasking = z.infer<typeof insertLunMaskingSchema>;
export type LunMasking = typeof lunMasking.$inferSelect;

export type InsertFabricSwitch = z.infer<typeof insertFabricSwitchSchema>;
export type FabricSwitch = typeof fabricSwitches.$inferSelect;

export type InsertZone = z.infer<typeof insertZoneSchema>;
export type Zone = typeof zones.$inferSelect;

export type InsertTierPolicy = z.infer<typeof insertTierPolicySchema>;
export type TierPolicy = typeof tierPolicies.$inferSelect;

export type InsertReplicationPair = z.infer<typeof insertReplicationPairSchema>;
export type ReplicationPair = typeof replicationPairs.$inferSelect;

export type InsertPerformanceMetric = z.infer<typeof insertPerformanceMetricSchema>;
export type PerformanceMetric = typeof performanceMetrics.$inferSelect;

export type InsertAlert = z.infer<typeof insertAlertSchema>;
export type Alert = typeof alerts.$inferSelect;

export type InsertAuditLog = z.infer<typeof insertAuditLogSchema>;
export type AuditLog = typeof auditLogs.$inferSelect;

export type InsertFailoverEvent = z.infer<typeof insertFailoverEventSchema>;
export type FailoverEvent = typeof failoverEvents.$inferSelect;
