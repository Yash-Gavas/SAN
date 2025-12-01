import { 
  users, 
  storageSystems,
  storagePools,
  luns,
  hosts,
  lunMasking,
  fabricSwitches,
  zones,
  tierPolicies,
  replicationPairs,
  performanceMetrics,
  alerts,
  auditLogs,
  failoverEvents,
  type User, 
  type InsertUser,
  type StorageSystem,
  type InsertStorageSystem,
  type StoragePool,
  type InsertStoragePool,
  type Lun,
  type InsertLun,
  type Host,
  type InsertHost,
  type LunMasking,
  type InsertLunMasking,
  type FabricSwitch,
  type InsertFabricSwitch,
  type Zone,
  type InsertZone,
  type TierPolicy,
  type InsertTierPolicy,
  type ReplicationPair,
  type InsertReplicationPair,
  type PerformanceMetric,
  type InsertPerformanceMetric,
  type Alert,
  type InsertAlert,
  type AuditLog,
  type InsertAuditLog,
  type FailoverEvent,
  type InsertFailoverEvent
} from "@shared/schema";

import { db } from "./db";
import { eq, and, desc, sql, gte, lte } from "drizzle-orm";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;

  // Storage System methods
  getAllStorageSystems(): Promise<StorageSystem[]>;
  getStorageSystem(id: number): Promise<StorageSystem | undefined>;
  createStorageSystem(system: InsertStorageSystem): Promise<StorageSystem>;
  updateStorageSystem(id: number, changes: Partial<InsertStorageSystem>): Promise<StorageSystem>;
  deleteStorageSystem(id: number): Promise<void>;

  // Storage Pool methods
  getAllStoragePools(): Promise<StoragePool[]>;
  getStoragePool(id: number): Promise<StoragePool | undefined>;
  getStoragePoolsBySystem(systemId: number): Promise<StoragePool[]>;
  createStoragePool(pool: InsertStoragePool): Promise<StoragePool>;
  updateStoragePool(id: number, changes: Partial<InsertStoragePool>): Promise<StoragePool>;
  deleteStoragePool(id: number): Promise<void>;

  // LUN methods
  getAllLuns(): Promise<Lun[]>;
  getLun(id: number): Promise<Lun | undefined>;
  getLunsByPool(poolId: number): Promise<Lun[]>;
  createLun(lun: InsertLun): Promise<Lun>;
  updateLun(id: number, changes: Partial<InsertLun>): Promise<Lun>;
  deleteLun(id: number): Promise<void>;

  // Host methods
  getAllHosts(): Promise<Host[]>;
  getHost(id: number): Promise<Host | undefined>;
  createHost(host: InsertHost): Promise<Host>;
  updateHost(id: number, changes: Partial<InsertHost>): Promise<Host>;
  deleteHost(id: number): Promise<void>;

  // LUN Masking methods
  getAllLunMasking(): Promise<LunMasking[]>;
  getLunMaskingByLun(lunId: number): Promise<LunMasking[]>;
  getLunMaskingByHost(hostId: number): Promise<LunMasking[]>;
  createLunMasking(masking: InsertLunMasking): Promise<LunMasking>;
  deleteLunMasking(id: number): Promise<void>;

  // Fabric Switch methods
  getAllFabricSwitches(): Promise<FabricSwitch[]>;
  getFabricSwitch(id: number): Promise<FabricSwitch | undefined>;
  createFabricSwitch(sw: InsertFabricSwitch): Promise<FabricSwitch>;
  updateFabricSwitch(id: number, changes: Partial<InsertFabricSwitch>): Promise<FabricSwitch>;
  deleteFabricSwitch(id: number): Promise<void>;

  // Zone methods
  getAllZones(): Promise<Zone[]>;
  getZonesBySwitch(switchId: number): Promise<Zone[]>;
  createZone(zone: InsertZone): Promise<Zone>;
  updateZone(id: number, changes: Partial<InsertZone>): Promise<Zone>;
  deleteZone(id: number): Promise<void>;

  // Tier Policy methods
  getAllTierPolicies(): Promise<TierPolicy[]>;
  getTierPoliciesByPool(poolId: number): Promise<TierPolicy[]>;
  createTierPolicy(policy: InsertTierPolicy): Promise<TierPolicy>;
  updateTierPolicy(id: number, changes: Partial<InsertTierPolicy>): Promise<TierPolicy>;
  deleteTierPolicy(id: number): Promise<void>;

  // Replication Pair methods
  getAllReplicationPairs(): Promise<ReplicationPair[]>;
  getReplicationPair(id: number): Promise<ReplicationPair | undefined>;
  createReplicationPair(pair: InsertReplicationPair): Promise<ReplicationPair>;
  updateReplicationPair(id: number, changes: Partial<InsertReplicationPair> & { lastSyncAt?: Date }): Promise<ReplicationPair>;
  deleteReplicationPair(id: number): Promise<void>;

  // Performance Metrics methods
  getPerformanceMetrics(entityType: string, entityId: number, limit?: number): Promise<PerformanceMetric[]>;
  createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric>;
  getLatestMetrics(): Promise<PerformanceMetric[]>;

  // Alert methods
  getAllAlerts(includeAcknowledged?: boolean): Promise<Alert[]>;
  createAlert(alert: InsertAlert): Promise<Alert>;
  acknowledgeAlert(id: number, userId: number): Promise<Alert>;

  // Audit Log methods
  getAuditLogs(limit?: number): Promise<AuditLog[]>;
  createAuditLog(log: InsertAuditLog): Promise<AuditLog>;

  // Failover Event methods
  getAllFailoverEvents(): Promise<FailoverEvent[]>;
  getFailoverEventsByPair(pairId: number): Promise<FailoverEvent[]>;
  createFailoverEvent(event: InsertFailoverEvent): Promise<FailoverEvent>;
  updateFailoverEvent(id: number, changes: Partial<InsertFailoverEvent>): Promise<FailoverEvent>;
}

export class MemStorage implements IStorage {
  private usersMap: Map<number, User> = new Map();
  private storageSystemsMap: Map<number, StorageSystem> = new Map();
  private storagePoolsMap: Map<number, StoragePool> = new Map();
  private lunsMap: Map<number, Lun> = new Map();
  private hostsMap: Map<number, Host> = new Map();
  private lunMaskingMap: Map<number, LunMasking> = new Map();
  private fabricSwitchesMap: Map<number, FabricSwitch> = new Map();
  private zonesMap: Map<number, Zone> = new Map();
  private tierPoliciesMap: Map<number, TierPolicy> = new Map();
  private replicationPairsMap: Map<number, ReplicationPair> = new Map();
  private performanceMetricsMap: Map<number, PerformanceMetric> = new Map();
  private alertsMap: Map<number, Alert> = new Map();
  private auditLogsMap: Map<number, AuditLog> = new Map();
  private failoverEventsMap: Map<number, FailoverEvent> = new Map();

  private nextId: { [key: string]: number } = {
    users: 1,
    storageSystems: 1,
    storagePools: 1,
    luns: 1,
    hosts: 1,
    lunMasking: 1,
    fabricSwitches: 1,
    zones: 1,
    tierPolicies: 1,
    replicationPairs: 1,
    performanceMetrics: 1,
    alerts: 1,
    auditLogs: 1,
    failoverEvents: 1
  };

  constructor() {
    this.initializeSampleData();
  }

  private initializeSampleData() {
    const now = new Date();

    // Sample Storage Systems
    const systems: StorageSystem[] = [
      { id: 1, name: "Primary-Array-01", vendor: "Dell EMC", model: "PowerStore 500T", serialNumber: "PS500T-001", ipAddress: "192.168.1.10", status: "online", totalCapacityTB: 100, usedCapacityTB: 45.5, raidLevel: "RAID-6", firmwareVersion: "3.2.1", location: "DC1-Rack-A1", createdAt: now, updatedAt: now },
      { id: 2, name: "Secondary-Array-01", vendor: "NetApp", model: "AFF A400", serialNumber: "AFF400-002", ipAddress: "192.168.1.11", status: "online", totalCapacityTB: 80, usedCapacityTB: 32.0, raidLevel: "RAID-DP", firmwareVersion: "9.11.1", location: "DC1-Rack-A2", createdAt: now, updatedAt: now },
      { id: 3, name: "DR-Array-01", vendor: "Pure Storage", model: "FlashArray//X70", serialNumber: "FA-X70-003", ipAddress: "192.168.2.10", status: "online", totalCapacityTB: 120, usedCapacityTB: 28.0, raidLevel: "RAID-3D", firmwareVersion: "6.3.4", location: "DC2-Rack-B1", createdAt: now, updatedAt: now }
    ];
    systems.forEach(s => this.storageSystemsMap.set(s.id, s));
    this.nextId.storageSystems = 4;

    // Sample Storage Pools
    const pools: StoragePool[] = [
      { id: 1, storageSystemId: 1, name: "Pool-SSD-Tier1", poolType: "ssd", totalCapacityTB: 50, allocatedCapacityTB: 35, usedCapacityTB: 28.5, thinProvisioningEnabled: true, compressionEnabled: true, deduplicationEnabled: true, status: "healthy", createdAt: now, updatedAt: now },
      { id: 2, storageSystemId: 1, name: "Pool-HDD-Archive", poolType: "hdd", totalCapacityTB: 50, allocatedCapacityTB: 20, usedCapacityTB: 17.0, thinProvisioningEnabled: true, compressionEnabled: false, deduplicationEnabled: false, status: "healthy", createdAt: now, updatedAt: now },
      { id: 3, storageSystemId: 2, name: "Pool-Flash-Primary", poolType: "nvme", totalCapacityTB: 80, allocatedCapacityTB: 45, usedCapacityTB: 32.0, thinProvisioningEnabled: true, compressionEnabled: true, deduplicationEnabled: true, status: "healthy", createdAt: now, updatedAt: now },
      { id: 4, storageSystemId: 3, name: "Pool-DR-Replica", poolType: "ssd", totalCapacityTB: 120, allocatedCapacityTB: 35, usedCapacityTB: 28.0, thinProvisioningEnabled: true, compressionEnabled: true, deduplicationEnabled: false, status: "healthy", createdAt: now, updatedAt: now }
    ];
    pools.forEach(p => this.storagePoolsMap.set(p.id, p));
    this.nextId.storagePools = 5;

    // Sample LUNs
    const lunsList: Lun[] = [
      { id: 1, storagePoolId: 1, lunNumber: 0, name: "LUN-DB-Primary", capacityGB: 2048, usedCapacityGB: 1536, thinProvisioned: true, status: "online", tierLevel: "hot", createdAt: now, updatedAt: now },
      { id: 2, storagePoolId: 1, lunNumber: 1, name: "LUN-App-Server-01", capacityGB: 1024, usedCapacityGB: 768, thinProvisioned: true, status: "online", tierLevel: "hot", createdAt: now, updatedAt: now },
      { id: 3, storagePoolId: 2, lunNumber: 0, name: "LUN-Archive-2024", capacityGB: 5120, usedCapacityGB: 4096, thinProvisioned: true, status: "online", tierLevel: "cold", createdAt: now, updatedAt: now },
      { id: 4, storagePoolId: 3, lunNumber: 0, name: "LUN-VDI-Pool", capacityGB: 10240, usedCapacityGB: 6144, thinProvisioned: true, status: "online", tierLevel: "standard", createdAt: now, updatedAt: now },
      { id: 5, storagePoolId: 4, lunNumber: 0, name: "LUN-DR-DB-Primary", capacityGB: 2048, usedCapacityGB: 1536, thinProvisioned: true, status: "online", tierLevel: "hot", createdAt: now, updatedAt: now }
    ];
    lunsList.forEach(l => this.lunsMap.set(l.id, l));
    this.nextId.luns = 6;

    // Sample Hosts
    const hostsList: Host[] = [
      { id: 1, name: "DB-Server-01", osType: "RHEL 8.5", ipAddress: "192.168.10.20", wwpn: "50:01:43:80:01:23:45:67", iqn: null, status: "online", hbaType: "fc", createdAt: now, updatedAt: now },
      { id: 2, name: "App-Server-01", osType: "Windows Server 2022", ipAddress: "192.168.10.21", wwpn: "50:01:43:80:01:23:45:68", iqn: null, status: "online", hbaType: "fc", createdAt: now, updatedAt: now },
      { id: 3, name: "VDI-Host-01", osType: "VMware ESXi 8.0", ipAddress: "192.168.10.30", wwpn: null, iqn: "iqn.2024-01.com.company:vdi-host-01", status: "online", hbaType: "iscsi", createdAt: now, updatedAt: now },
      { id: 4, name: "Backup-Server-01", osType: "Ubuntu 22.04", ipAddress: "192.168.10.40", wwpn: null, iqn: "iqn.2024-01.com.company:backup-01", status: "online", hbaType: "iscsi", createdAt: now, updatedAt: now }
    ];
    hostsList.forEach(h => this.hostsMap.set(h.id, h));
    this.nextId.hosts = 5;

    // Sample LUN Masking
    const maskings: LunMasking[] = [
      { id: 1, lunId: 1, hostId: 1, accessLevel: "read_write", createdAt: now },
      { id: 2, lunId: 2, hostId: 2, accessLevel: "read_write", createdAt: now },
      { id: 3, lunId: 3, hostId: 4, accessLevel: "read_only", createdAt: now },
      { id: 4, lunId: 4, hostId: 3, accessLevel: "read_write", createdAt: now }
    ];
    maskings.forEach(m => this.lunMaskingMap.set(m.id, m));
    this.nextId.lunMasking = 5;

    // Sample Fabric Switches
    const switches: FabricSwitch[] = [
      { id: 1, name: "FC-Switch-A1", vendor: "Brocade", model: "G620", ipAddress: "192.168.1.100", portCount: 48, activePortCount: 32, status: "online", firmwareVersion: "9.1.1", createdAt: now, updatedAt: now },
      { id: 2, name: "FC-Switch-A2", vendor: "Brocade", model: "G620", ipAddress: "192.168.1.101", portCount: 48, activePortCount: 28, status: "online", firmwareVersion: "9.1.1", createdAt: now, updatedAt: now },
      { id: 3, name: "iSCSI-Switch-01", vendor: "Cisco", model: "Nexus 9336C", ipAddress: "192.168.1.102", portCount: 36, activePortCount: 18, status: "online", firmwareVersion: "10.2(3)", createdAt: now, updatedAt: now }
    ];
    switches.forEach(s => this.fabricSwitchesMap.set(s.id, s));
    this.nextId.fabricSwitches = 4;

    // Sample Zones
    const zonesList: Zone[] = [
      { id: 1, fabricSwitchId: 1, name: "Zone-DB-Primary", zoneType: "soft", members: "DB-Server-01:Primary-Array-01", status: "active", createdAt: now },
      { id: 2, fabricSwitchId: 1, name: "Zone-App-Servers", zoneType: "soft", members: "App-Server-01:Primary-Array-01", status: "active", createdAt: now },
      { id: 3, fabricSwitchId: 2, name: "Zone-DR-Replication", zoneType: "soft", members: "Primary-Array-01:DR-Array-01", status: "active", createdAt: now }
    ];
    zonesList.forEach(z => this.zonesMap.set(z.id, z));
    this.nextId.zones = 4;

    // Sample Tier Policies
    const policies: TierPolicy[] = [
      { id: 1, name: "Auto-Tier-SSD-HDD", storagePoolId: 1, hotTierThresholdIOPS: 500, coldTierThresholdDays: 30, migrationSchedule: "daily", isEnabled: true, lastExecutedAt: new Date(now.getTime() - 3600000), createdAt: now },
      { id: 2, name: "Archive-Policy", storagePoolId: 2, hotTierThresholdIOPS: 100, coldTierThresholdDays: 7, migrationSchedule: "weekly", isEnabled: true, lastExecutedAt: new Date(now.getTime() - 86400000), createdAt: now }
    ];
    policies.forEach(p => this.tierPoliciesMap.set(p.id, p));
    this.nextId.tierPolicies = 3;

    // Sample Replication Pairs
    const pairs: ReplicationPair[] = [
      { id: 1, name: "DB-Primary-DR", sourceLunId: 1, targetStorageSystemId: 3, targetLunIdentifier: "LUN-DR-DB-Primary", replicationType: "sync", rpoMinutes: 0, status: "active", lastSyncAt: new Date(now.getTime() - 60000), createdAt: now },
      { id: 2, name: "App-Server-DR", sourceLunId: 2, targetStorageSystemId: 3, targetLunIdentifier: "LUN-DR-App-01", replicationType: "async", rpoMinutes: 15, status: "active", lastSyncAt: new Date(now.getTime() - 300000), createdAt: now }
    ];
    pairs.forEach(p => this.replicationPairsMap.set(p.id, p));
    this.nextId.replicationPairs = 3;

    // Sample Alerts
    const alertsList: Alert[] = [
      { id: 1, entityType: "storage_system", entityId: 1, severity: "warning", title: "High Capacity Utilization", message: "Storage system Primary-Array-01 is at 45.5% capacity", isAcknowledged: false, acknowledgedBy: null, acknowledgedAt: null, createdAt: now },
      { id: 2, entityType: "lun", entityId: 1, severity: "info", title: "High IOPS Detected", message: "LUN-DB-Primary experiencing 15,000 IOPS", isAcknowledged: true, acknowledgedBy: 1, acknowledgedAt: now, createdAt: new Date(now.getTime() - 7200000) }
    ];
    alertsList.forEach(a => this.alertsMap.set(a.id, a));
    this.nextId.alerts = 3;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.usersMap.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.usersMap.values()).find(u => u.username === username);
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.nextId.users++;
    const user: User = { 
      id,
      username: insertUser.username,
      password: insertUser.password,
      email: insertUser.email ?? null,
      role: insertUser.role ?? 'operator',
      createdAt: new Date() 
    };
    this.usersMap.set(id, user);
    return user;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.usersMap.values());
  }

  // Storage System methods
  async getAllStorageSystems(): Promise<StorageSystem[]> {
    return Array.from(this.storageSystemsMap.values());
  }

  async getStorageSystem(id: number): Promise<StorageSystem | undefined> {
    return this.storageSystemsMap.get(id);
  }

  async createStorageSystem(system: InsertStorageSystem): Promise<StorageSystem> {
    const id = this.nextId.storageSystems++;
    const now = new Date();
    const newSystem: StorageSystem = { 
      id,
      name: system.name,
      vendor: system.vendor,
      model: system.model,
      serialNumber: system.serialNumber ?? null,
      ipAddress: system.ipAddress ?? null,
      status: system.status ?? 'online',
      totalCapacityTB: system.totalCapacityTB,
      usedCapacityTB: system.usedCapacityTB ?? 0,
      raidLevel: system.raidLevel ?? null,
      firmwareVersion: system.firmwareVersion ?? null,
      location: system.location ?? null,
      createdAt: now, 
      updatedAt: now 
    };
    this.storageSystemsMap.set(id, newSystem);
    return newSystem;
  }

  async updateStorageSystem(id: number, changes: Partial<InsertStorageSystem>): Promise<StorageSystem> {
    const system = this.storageSystemsMap.get(id);
    if (!system) throw new Error(`Storage system ${id} not found`);
    const updated: StorageSystem = { ...system, ...changes, updatedAt: new Date() };
    this.storageSystemsMap.set(id, updated);
    return updated;
  }

  async deleteStorageSystem(id: number): Promise<void> {
    this.storageSystemsMap.delete(id);
  }

  // Storage Pool methods
  async getAllStoragePools(): Promise<StoragePool[]> {
    return Array.from(this.storagePoolsMap.values());
  }

  async getStoragePool(id: number): Promise<StoragePool | undefined> {
    return this.storagePoolsMap.get(id);
  }

  async getStoragePoolsBySystem(systemId: number): Promise<StoragePool[]> {
    return Array.from(this.storagePoolsMap.values()).filter(p => p.storageSystemId === systemId);
  }

  async createStoragePool(pool: InsertStoragePool): Promise<StoragePool> {
    const id = this.nextId.storagePools++;
    const now = new Date();
    const newPool: StoragePool = { 
      id,
      storageSystemId: pool.storageSystemId,
      name: pool.name,
      poolType: pool.poolType,
      totalCapacityTB: pool.totalCapacityTB,
      allocatedCapacityTB: pool.allocatedCapacityTB ?? 0,
      usedCapacityTB: pool.usedCapacityTB ?? 0,
      thinProvisioningEnabled: pool.thinProvisioningEnabled ?? true,
      compressionEnabled: pool.compressionEnabled ?? false,
      deduplicationEnabled: pool.deduplicationEnabled ?? false,
      status: pool.status ?? 'healthy',
      createdAt: now, 
      updatedAt: now 
    };
    this.storagePoolsMap.set(id, newPool);
    return newPool;
  }

  async updateStoragePool(id: number, changes: Partial<InsertStoragePool>): Promise<StoragePool> {
    const pool = this.storagePoolsMap.get(id);
    if (!pool) throw new Error(`Storage pool ${id} not found`);
    const updated: StoragePool = { ...pool, ...changes, updatedAt: new Date() };
    this.storagePoolsMap.set(id, updated);
    return updated;
  }

  async deleteStoragePool(id: number): Promise<void> {
    this.storagePoolsMap.delete(id);
  }

  // LUN methods
  async getAllLuns(): Promise<Lun[]> {
    return Array.from(this.lunsMap.values());
  }

  async getLun(id: number): Promise<Lun | undefined> {
    return this.lunsMap.get(id);
  }

  async getLunsByPool(poolId: number): Promise<Lun[]> {
    return Array.from(this.lunsMap.values()).filter(l => l.storagePoolId === poolId);
  }

  async createLun(lun: InsertLun): Promise<Lun> {
    const id = this.nextId.luns++;
    const now = new Date();
    const newLun: Lun = { 
      id,
      storagePoolId: lun.storagePoolId,
      lunNumber: lun.lunNumber,
      name: lun.name,
      capacityGB: lun.capacityGB,
      usedCapacityGB: lun.usedCapacityGB ?? 0,
      thinProvisioned: lun.thinProvisioned ?? true,
      status: lun.status ?? 'online',
      tierLevel: lun.tierLevel ?? 'standard',
      createdAt: now, 
      updatedAt: now 
    };
    this.lunsMap.set(id, newLun);
    return newLun;
  }

  async updateLun(id: number, changes: Partial<InsertLun>): Promise<Lun> {
    const lun = this.lunsMap.get(id);
    if (!lun) throw new Error(`LUN ${id} not found`);
    const updated: Lun = { ...lun, ...changes, updatedAt: new Date() };
    this.lunsMap.set(id, updated);
    return updated;
  }

  async deleteLun(id: number): Promise<void> {
    this.lunsMap.delete(id);
  }

  // Host methods
  async getAllHosts(): Promise<Host[]> {
    return Array.from(this.hostsMap.values());
  }

  async getHost(id: number): Promise<Host | undefined> {
    return this.hostsMap.get(id);
  }

  async createHost(host: InsertHost): Promise<Host> {
    const id = this.nextId.hosts++;
    const now = new Date();
    const newHost: Host = { 
      id,
      name: host.name,
      osType: host.osType,
      ipAddress: host.ipAddress ?? null,
      wwpn: host.wwpn ?? null,
      iqn: host.iqn ?? null,
      status: host.status ?? 'online',
      hbaType: host.hbaType ?? 'fc',
      createdAt: now, 
      updatedAt: now 
    };
    this.hostsMap.set(id, newHost);
    return newHost;
  }

  async updateHost(id: number, changes: Partial<InsertHost>): Promise<Host> {
    const host = this.hostsMap.get(id);
    if (!host) throw new Error(`Host ${id} not found`);
    const updated: Host = { ...host, ...changes, updatedAt: new Date() };
    this.hostsMap.set(id, updated);
    return updated;
  }

  async deleteHost(id: number): Promise<void> {
    this.hostsMap.delete(id);
  }

  // LUN Masking methods
  async getAllLunMasking(): Promise<LunMasking[]> {
    return Array.from(this.lunMaskingMap.values());
  }

  async getLunMaskingByLun(lunId: number): Promise<LunMasking[]> {
    return Array.from(this.lunMaskingMap.values()).filter(m => m.lunId === lunId);
  }

  async getLunMaskingByHost(hostId: number): Promise<LunMasking[]> {
    return Array.from(this.lunMaskingMap.values()).filter(m => m.hostId === hostId);
  }

  async createLunMasking(masking: InsertLunMasking): Promise<LunMasking> {
    const id = this.nextId.lunMasking++;
    const newMasking: LunMasking = { 
      id,
      lunId: masking.lunId,
      hostId: masking.hostId,
      accessLevel: masking.accessLevel ?? 'read_write',
      createdAt: new Date() 
    };
    this.lunMaskingMap.set(id, newMasking);
    return newMasking;
  }

  async deleteLunMasking(id: number): Promise<void> {
    this.lunMaskingMap.delete(id);
  }

  // Fabric Switch methods
  async getAllFabricSwitches(): Promise<FabricSwitch[]> {
    return Array.from(this.fabricSwitchesMap.values());
  }

  async getFabricSwitch(id: number): Promise<FabricSwitch | undefined> {
    return this.fabricSwitchesMap.get(id);
  }

  async createFabricSwitch(sw: InsertFabricSwitch): Promise<FabricSwitch> {
    const id = this.nextId.fabricSwitches++;
    const now = new Date();
    const newSwitch: FabricSwitch = { 
      id,
      name: sw.name,
      vendor: sw.vendor,
      model: sw.model ?? null,
      ipAddress: sw.ipAddress ?? null,
      portCount: sw.portCount,
      activePortCount: sw.activePortCount ?? 0,
      status: sw.status ?? 'online',
      firmwareVersion: sw.firmwareVersion ?? null,
      createdAt: now, 
      updatedAt: now 
    };
    this.fabricSwitchesMap.set(id, newSwitch);
    return newSwitch;
  }

  async updateFabricSwitch(id: number, changes: Partial<InsertFabricSwitch>): Promise<FabricSwitch> {
    const sw = this.fabricSwitchesMap.get(id);
    if (!sw) throw new Error(`Fabric switch ${id} not found`);
    const updated: FabricSwitch = { ...sw, ...changes, updatedAt: new Date() };
    this.fabricSwitchesMap.set(id, updated);
    return updated;
  }

  async deleteFabricSwitch(id: number): Promise<void> {
    this.fabricSwitchesMap.delete(id);
  }

  // Zone methods
  async getAllZones(): Promise<Zone[]> {
    return Array.from(this.zonesMap.values());
  }

  async getZonesBySwitch(switchId: number): Promise<Zone[]> {
    return Array.from(this.zonesMap.values()).filter(z => z.fabricSwitchId === switchId);
  }

  async createZone(zone: InsertZone): Promise<Zone> {
    const id = this.nextId.zones++;
    const newZone: Zone = { 
      id,
      fabricSwitchId: zone.fabricSwitchId,
      name: zone.name,
      zoneType: zone.zoneType ?? 'soft',
      members: zone.members ?? null,
      status: zone.status ?? 'active',
      createdAt: new Date() 
    };
    this.zonesMap.set(id, newZone);
    return newZone;
  }

  async updateZone(id: number, changes: Partial<InsertZone>): Promise<Zone> {
    const zone = this.zonesMap.get(id);
    if (!zone) throw new Error(`Zone ${id} not found`);
    const updated: Zone = { ...zone, ...changes };
    this.zonesMap.set(id, updated);
    return updated;
  }

  async deleteZone(id: number): Promise<void> {
    this.zonesMap.delete(id);
  }

  // Tier Policy methods
  async getAllTierPolicies(): Promise<TierPolicy[]> {
    return Array.from(this.tierPoliciesMap.values());
  }

  async getTierPoliciesByPool(poolId: number): Promise<TierPolicy[]> {
    return Array.from(this.tierPoliciesMap.values()).filter(p => p.storagePoolId === poolId);
  }

  async createTierPolicy(policy: InsertTierPolicy): Promise<TierPolicy> {
    const id = this.nextId.tierPolicies++;
    const newPolicy: TierPolicy = { 
      id,
      name: policy.name,
      storagePoolId: policy.storagePoolId,
      hotTierThresholdIOPS: policy.hotTierThresholdIOPS ?? 1000,
      coldTierThresholdDays: policy.coldTierThresholdDays ?? 30,
      migrationSchedule: policy.migrationSchedule ?? 'daily',
      isEnabled: policy.isEnabled ?? true,
      lastExecutedAt: null, 
      createdAt: new Date() 
    };
    this.tierPoliciesMap.set(id, newPolicy);
    return newPolicy;
  }

  async updateTierPolicy(id: number, changes: Partial<InsertTierPolicy>): Promise<TierPolicy> {
    const policy = this.tierPoliciesMap.get(id);
    if (!policy) throw new Error(`Tier policy ${id} not found`);
    const updated: TierPolicy = { ...policy, ...changes };
    this.tierPoliciesMap.set(id, updated);
    return updated;
  }

  async deleteTierPolicy(id: number): Promise<void> {
    this.tierPoliciesMap.delete(id);
  }

  // Replication Pair methods
  async getAllReplicationPairs(): Promise<ReplicationPair[]> {
    return Array.from(this.replicationPairsMap.values());
  }

  async getReplicationPair(id: number): Promise<ReplicationPair | undefined> {
    return this.replicationPairsMap.get(id);
  }

  async createReplicationPair(pair: InsertReplicationPair): Promise<ReplicationPair> {
    const id = this.nextId.replicationPairs++;
    const newPair: ReplicationPair = { 
      id,
      name: pair.name,
      sourceLunId: pair.sourceLunId,
      targetStorageSystemId: pair.targetStorageSystemId,
      targetLunIdentifier: pair.targetLunIdentifier ?? null,
      replicationType: pair.replicationType ?? 'async',
      rpoMinutes: pair.rpoMinutes ?? 15,
      status: pair.status ?? 'active',
      lastSyncAt: null, 
      createdAt: new Date() 
    };
    this.replicationPairsMap.set(id, newPair);
    return newPair;
  }

  async updateReplicationPair(id: number, changes: Partial<InsertReplicationPair> & { lastSyncAt?: Date }): Promise<ReplicationPair> {
    const pair = this.replicationPairsMap.get(id);
    if (!pair) throw new Error(`Replication pair ${id} not found`);
    const updated: ReplicationPair = { ...pair, ...changes };
    this.replicationPairsMap.set(id, updated);
    return updated;
  }

  async deleteReplicationPair(id: number): Promise<void> {
    this.replicationPairsMap.delete(id);
  }

  // Performance Metrics methods
  async getPerformanceMetrics(entityType: string, entityId: number, limit: number = 100): Promise<PerformanceMetric[]> {
    return Array.from(this.performanceMetricsMap.values())
      .filter(m => m.entityType === entityType && m.entityId === entityId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, limit);
  }

  async createPerformanceMetric(metric: InsertPerformanceMetric): Promise<PerformanceMetric> {
    const id = this.nextId.performanceMetrics++;
    const newMetric: PerformanceMetric = { 
      id,
      entityType: metric.entityType,
      entityId: metric.entityId,
      iops: metric.iops ?? 0,
      throughputMBps: metric.throughputMBps ?? 0,
      latencyMs: metric.latencyMs ?? 0,
      readPercent: metric.readPercent ?? 50,
      queueDepth: metric.queueDepth ?? 0,
      timestamp: new Date() 
    };
    this.performanceMetricsMap.set(id, newMetric);
    return newMetric;
  }

  async getLatestMetrics(): Promise<PerformanceMetric[]> {
    const metricsArray = Array.from(this.performanceMetricsMap.values());
    const latestByEntity = new Map<string, PerformanceMetric>();
    metricsArray.forEach(m => {
      const key = `${m.entityType}-${m.entityId}`;
      const existing = latestByEntity.get(key);
      if (!existing || m.timestamp > existing.timestamp) {
        latestByEntity.set(key, m);
      }
    });
    return Array.from(latestByEntity.values());
  }

  // Alert methods
  async getAllAlerts(includeAcknowledged: boolean = false): Promise<Alert[]> {
    const alertsArray = Array.from(this.alertsMap.values());
    if (includeAcknowledged) return alertsArray;
    return alertsArray.filter(a => !a.isAcknowledged);
  }

  async createAlert(alert: InsertAlert): Promise<Alert> {
    const id = this.nextId.alerts++;
    const newAlert: Alert = { 
      ...alert, 
      id, 
      isAcknowledged: false, 
      acknowledgedBy: null, 
      acknowledgedAt: null, 
      createdAt: new Date() 
    };
    this.alertsMap.set(id, newAlert);
    return newAlert;
  }

  async acknowledgeAlert(id: number, userId: number): Promise<Alert> {
    const alert = this.alertsMap.get(id);
    if (!alert) throw new Error(`Alert ${id} not found`);
    const updated: Alert = { ...alert, isAcknowledged: true, acknowledgedBy: userId, acknowledgedAt: new Date() };
    this.alertsMap.set(id, updated);
    return updated;
  }

  // Audit Log methods
  async getAuditLogs(limit: number = 100): Promise<AuditLog[]> {
    return Array.from(this.auditLogsMap.values())
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .slice(0, limit);
  }

  async createAuditLog(log: InsertAuditLog): Promise<AuditLog> {
    const id = this.nextId.auditLogs++;
    const newLog: AuditLog = { 
      id,
      userId: log.userId ?? null,
      action: log.action,
      entityType: log.entityType,
      entityId: log.entityId ?? null,
      details: log.details ?? null,
      ipAddress: log.ipAddress ?? null,
      createdAt: new Date() 
    };
    this.auditLogsMap.set(id, newLog);
    return newLog;
  }

  // Failover Event methods
  async getAllFailoverEvents(): Promise<FailoverEvent[]> {
    return Array.from(this.failoverEventsMap.values());
  }

  async getFailoverEventsByPair(pairId: number): Promise<FailoverEvent[]> {
    return Array.from(this.failoverEventsMap.values()).filter(e => e.replicationPairId === pairId);
  }

  async createFailoverEvent(event: InsertFailoverEvent): Promise<FailoverEvent> {
    const id = this.nextId.failoverEvents++;
    const newEvent: FailoverEvent = { 
      id,
      replicationPairId: event.replicationPairId,
      eventType: event.eventType,
      status: event.status,
      triggeredBy: event.triggeredBy,
      details: event.details ?? null,
      startedAt: new Date(), 
      completedAt: null 
    };
    this.failoverEventsMap.set(id, newEvent);
    return newEvent;
  }

  async updateFailoverEvent(id: number, changes: Partial<InsertFailoverEvent>): Promise<FailoverEvent> {
    const event = this.failoverEventsMap.get(id);
    if (!event) throw new Error(`Failover event ${id} not found`);
    const updated: FailoverEvent = { ...event, ...changes };
    this.failoverEventsMap.set(id, updated);
    return updated;
  }
}

// Use memory storage for now - can switch to database storage later
export const storage: IStorage = new MemStorage();
