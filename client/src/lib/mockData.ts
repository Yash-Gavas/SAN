export interface StorageTier {
  id: string;
  name: string;
  symbol: string;
  icon: string;
  iops: number;
  latencyMs: number;
  throughputMBs: number;
  costPerTB: number;
  change24h: number;
}

export interface LunAllocation {
  tier: StorageTier;
  capacityTB: number;
  usedTB: number;
  utilizationPercent: number;
  iopsAllocated: number;
  raidType: string;
}

export interface StorageRequest {
  tier: StorageTier;
  requestedTB: number;
  allocatedTB: number;
  redundancyTier: StorageTier;
  redundancyCapacityTB: number;
  healthFactor: number;
}

export interface ReplicationPosition {
  sourceTier: StorageTier;
  targetTier: StorageTier;
  capacityTB: number;
  syncPercent: number;
  rpo: number;
}

export interface LunProvisioningOption {
  tier: StorageTier;
  availableCapacityTB: number;
  maxIops: number;
  hostGroup: string;
}

export interface StorageRequestOption {
  tier: StorageTier;
  availableTB: number;
  utilizationRate: number;
  redundancyRequired: number;
  hostGroup: string;
}

export interface StoragePool {
  tiers: [StorageTier, StorageTier];
  totalCapacityTB: number;
  usedCapacityTB: number;
  iopsTotal: number;
  tieringPolicy: string;
}

export interface StorageOperation {
  id: string;
  type: 'provision' | 'deallocate' | 'migrate' | 'replicate' | 'failover' | 'expand';
  tier: StorageTier;
  capacityTB: number;
  fromTier?: StorageTier;
  toTier?: StorageTier;
  date: Date;
  status: 'pending' | 'completed' | 'failed';
}

export interface StorageSummary {
  totalCapacityTB: number;
  capacityChange24h: number;
  allocatedCapacityTB: number;
  allocationChange24h: number;
  availableCapacityTB: number;
  availableChange24h: number;
}

export interface SanMetrics {
  totalIops: number;
  avgLatencyMs: number;
  throughputGBs: number;
  replicationLagMs: number;
}

export type Asset = StorageTier;
export type LendingPosition = LunAllocation;
export type BorrowingPosition = StorageRequest;
export type LiquidityPosition = ReplicationPosition;
export type LendingMarketAsset = LunProvisioningOption;
export type BorrowingMarketAsset = StorageRequestOption;
export type LiquidityPool = StoragePool;
export type Transaction = StorageOperation;
export type PortfolioSummary = StorageSummary;

const getStorageTierIcon = (tier: string): string => {
  const icons: Record<string, string> = {
    'nvme': 'https://img.icons8.com/fluency/96/ssd.png',
    'ssd': 'https://img.icons8.com/fluency/96/ssd.png',
    'sas': 'https://img.icons8.com/fluency/96/hdd.png',
    'hdd': 'https://img.icons8.com/fluency/96/hdd.png',
    'tape': 'https://img.icons8.com/fluency/96/tape-drive.png',
    'cloud': 'https://img.icons8.com/fluency/96/cloud-storage.png',
    'hybrid': 'https://img.icons8.com/fluency/96/data-recovery.png',
  };
  return icons[tier.toLowerCase()] || icons['ssd'];
};

export const storageTiers: StorageTier[] = [
  {
    id: "nvme",
    name: "NVMe Flash",
    symbol: "NVMe",
    icon: getStorageTierIcon('nvme'),
    iops: 1000000,
    latencyMs: 0.1,
    throughputMBs: 7000,
    costPerTB: 250,
    change24h: 2.4
  },
  {
    id: "ssd",
    name: "SSD Enterprise",
    symbol: "SSD",
    icon: getStorageTierIcon('ssd'),
    iops: 200000,
    latencyMs: 0.5,
    throughputMBs: 3500,
    costPerTB: 150,
    change24h: 1.2
  },
  {
    id: "sas",
    name: "SAS 15K RPM",
    symbol: "SAS",
    icon: getStorageTierIcon('sas'),
    iops: 50000,
    latencyMs: 2.0,
    throughputMBs: 1200,
    costPerTB: 80,
    change24h: 0.5
  },
  {
    id: "hdd",
    name: "SATA 7.2K RPM",
    symbol: "HDD",
    icon: getStorageTierIcon('hdd'),
    iops: 15000,
    latencyMs: 8.0,
    throughputMBs: 250,
    costPerTB: 30,
    change24h: -0.8
  },
  {
    id: "tape",
    name: "Tape Archive",
    symbol: "TAPE",
    icon: getStorageTierIcon('tape'),
    iops: 100,
    latencyMs: 60000,
    throughputMBs: 400,
    costPerTB: 5,
    change24h: 0.1
  },
  {
    id: "cloud",
    name: "Cloud Tier",
    symbol: "CLOUD",
    icon: getStorageTierIcon('cloud'),
    iops: 50000,
    latencyMs: 5.0,
    throughputMBs: 1000,
    costPerTB: 25,
    change24h: 3.5
  },
  {
    id: "hybrid",
    name: "Hybrid Pool",
    symbol: "HYBRID",
    icon: getStorageTierIcon('hybrid'),
    iops: 150000,
    latencyMs: 1.0,
    throughputMBs: 2500,
    costPerTB: 100,
    change24h: 1.8
  }
];

export const assets = storageTiers;

const getTierBySymbol = (symbol: string): StorageTier => {
  const tier = storageTiers.find(t => t.symbol === symbol);
  if (!tier) throw new Error(`Storage tier ${symbol} not found`);
  return tier;
};

const getAssetBySymbol = getTierBySymbol;

export const storageSummary: StorageSummary = {
  totalCapacityTB: 2456.78,
  capacityChange24h: 2.4,
  allocatedCapacityTB: 1823.92,
  allocationChange24h: 1.8,
  availableCapacityTB: 632.86,
  availableChange24h: 0.5,
};

export const portfolioSummary = storageSummary;

export const lunAllocations: LunAllocation[] = [
  {
    tier: getTierBySymbol("NVMe"),
    capacityTB: 50,
    usedTB: 42.5,
    utilizationPercent: 85,
    iopsAllocated: 500000,
    raidType: "RAID 10",
  },
  {
    tier: getTierBySymbol("SSD"),
    capacityTB: 200,
    usedTB: 156,
    utilizationPercent: 78,
    iopsAllocated: 150000,
    raidType: "RAID 6",
  },
  {
    tier: getTierBySymbol("HDD"),
    capacityTB: 1000,
    usedTB: 720,
    utilizationPercent: 72,
    iopsAllocated: 10000,
    raidType: "RAID 6",
  }
];

export const lendingPositions = lunAllocations.map(alloc => ({
  asset: alloc.tier,
  balance: alloc.capacityTB,
  apy: alloc.utilizationPercent,
  earned: alloc.usedTB,
}));

export const storageRequests: StorageRequest[] = [
  {
    tier: getTierBySymbol("NVMe"),
    requestedTB: 25,
    allocatedTB: 25,
    redundancyTier: getTierBySymbol("SSD"),
    redundancyCapacityTB: 25,
    healthFactor: 1.8,
  },
  {
    tier: getTierBySymbol("SSD"),
    requestedTB: 100,
    allocatedTB: 100,
    redundancyTier: getTierBySymbol("HDD"),
    redundancyCapacityTB: 100,
    healthFactor: 1.6,
  },
];

export const borrowingPositions = storageRequests.map(req => ({
  asset: req.tier,
  amount: req.requestedTB,
  interest: 0,
  collateral: req.redundancyTier,
  collateralAmount: req.redundancyCapacityTB,
  healthFactor: req.healthFactor,
}));

export const replicationPositions: ReplicationPosition[] = [
  {
    sourceTier: getTierBySymbol("NVMe"),
    targetTier: getTierBySymbol("SSD"),
    capacityTB: 50,
    syncPercent: 99.8,
    rpo: 15,
  }
];

export const liquidityPositions = replicationPositions.map(rep => ({
  pair: [rep.sourceTier, rep.targetTier] as [StorageTier, StorageTier],
  liquidity: rep.capacityTB * 1000,
  share: rep.syncPercent / 100,
  apy: rep.rpo,
}));

export const lunProvisioningOptions: LunProvisioningOption[] = [
  {
    tier: getTierBySymbol("NVMe"),
    availableCapacityTB: 150,
    maxIops: 1000000,
    hostGroup: "Production Cluster A",
  },
  {
    tier: getTierBySymbol("SSD"),
    availableCapacityTB: 500,
    maxIops: 200000,
    hostGroup: "Database Servers",
  },
  {
    tier: getTierBySymbol("SAS"),
    availableCapacityTB: 800,
    maxIops: 50000,
    hostGroup: "Application Servers",
  },
  {
    tier: getTierBySymbol("HDD"),
    availableCapacityTB: 2000,
    maxIops: 15000,
    hostGroup: "Archive Systems",
  },
  {
    tier: getTierBySymbol("CLOUD"),
    availableCapacityTB: 5000,
    maxIops: 50000,
    hostGroup: "DR Site",
  },
];

export const lendingMarket = lunProvisioningOptions.map(opt => ({
  asset: opt.tier,
  marketSize: opt.availableCapacityTB * opt.tier.costPerTB,
  apy: (opt.maxIops / 10000),
  lender: opt.hostGroup,
}));

export const storageRequestOptions: StorageRequestOption[] = [
  {
    tier: getTierBySymbol("NVMe"),
    availableTB: 100,
    utilizationRate: 85,
    redundancyRequired: 150,
    hostGroup: "Production Cluster A",
  },
  {
    tier: getTierBySymbol("SSD"),
    availableTB: 400,
    utilizationRate: 78,
    redundancyRequired: 120,
    hostGroup: "Database Servers",
  },
  {
    tier: getTierBySymbol("SAS"),
    availableTB: 600,
    utilizationRate: 65,
    redundancyRequired: 100,
    hostGroup: "Application Servers",
  },
  {
    tier: getTierBySymbol("HDD"),
    availableTB: 1500,
    utilizationRate: 55,
    redundancyRequired: 80,
    hostGroup: "Backup Systems",
  },
];

export const borrowingMarket = storageRequestOptions.map(opt => ({
  asset: opt.tier,
  available: opt.availableTB,
  interestRate: opt.utilizationRate,
  collateralRequired: opt.redundancyRequired,
  borrower: opt.hostGroup,
}));

export const storagePools: StoragePool[] = [
  {
    tiers: [getTierBySymbol("NVMe"), getTierBySymbol("SSD")],
    totalCapacityTB: 650,
    usedCapacityTB: 520,
    iopsTotal: 1200000,
    tieringPolicy: "Auto-Tier",
  },
  {
    tiers: [getTierBySymbol("SSD"), getTierBySymbol("HDD")],
    totalCapacityTB: 2500,
    usedCapacityTB: 1875,
    iopsTotal: 215000,
    tieringPolicy: "Performance",
  },
  {
    tiers: [getTierBySymbol("HDD"), getTierBySymbol("TAPE")],
    totalCapacityTB: 10000,
    usedCapacityTB: 6500,
    iopsTotal: 15100,
    tieringPolicy: "Archive",
  },
  {
    tiers: [getTierBySymbol("NVMe"), getTierBySymbol("CLOUD")],
    totalCapacityTB: 5150,
    usedCapacityTB: 2060,
    iopsTotal: 1050000,
    tieringPolicy: "Hybrid Cloud",
  },
];

export const liquidityPools = storagePools.map(pool => ({
  pair: pool.tiers,
  liquidity: pool.totalCapacityTB * 1000,
  volume24h: pool.usedCapacityTB * 100,
  apy: (pool.iopsTotal / pool.totalCapacityTB / 100),
  feeTier: pool.tieringPolicy,
}));

export const storageOperations: StorageOperation[] = [
  {
    id: "op1",
    type: "provision",
    tier: getTierBySymbol("NVMe"),
    capacityTB: 10,
    date: new Date(Date.now() - 2 * 60 * 60 * 1000),
    status: "completed",
  },
  {
    id: "op2",
    type: "migrate",
    capacityTB: 50,
    fromTier: getTierBySymbol("SSD"),
    toTier: getTierBySymbol("HDD"),
    tier: getTierBySymbol("SSD"),
    date: new Date(Date.now() - 5 * 60 * 60 * 1000),
    status: "completed",
  },
  {
    id: "op3",
    type: "replicate",
    capacityTB: 25,
    fromTier: getTierBySymbol("NVMe"),
    toTier: getTierBySymbol("CLOUD"),
    tier: getTierBySymbol("NVMe"),
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "completed",
  },
  {
    id: "op4",
    type: "expand",
    tier: getTierBySymbol("SSD"),
    capacityTB: 100,
    date: new Date(Date.now() - 24 * 60 * 60 * 1000),
    status: "completed",
  },
];

export const transactions = storageOperations.map(op => ({
  id: op.id,
  type: op.type as 'lend' | 'borrow' | 'repay' | 'withdraw' | 'swap' | 'interest',
  asset: op.tier,
  amount: op.capacityTB,
  fromAsset: op.fromTier,
  toAsset: op.toTier,
  date: op.date,
  status: op.status,
}));

export const sanMetrics: SanMetrics = {
  totalIops: 1465100,
  avgLatencyMs: 1.2,
  throughputGBs: 12.5,
  replicationLagMs: 50,
};

export const getTieringEfficiency = (fromTier: StorageTier, toTier: StorageTier): number => {
  return fromTier.iops / toTier.iops;
};

export const getExchangeRate = getTieringEfficiency;

export const calculateMigrationImpact = (capacityTB: number, fromTier: StorageTier): number => {
  const impact = capacityTB * fromTier.costPerTB / 10000;
  return Math.min(impact, 5);
};

export const calculatePriceImpact = calculateMigrationImpact;
