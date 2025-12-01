import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { storageTiers } from '@/lib/mockData';
import { 
  TrendingUp, 
  TrendingDown, 
  RefreshCw, 
  Clock,
  Wifi,
  WifiOff,
  Activity,
  HardDrive
} from 'lucide-react';

interface PriceTickerProps {
  symbol: string;
  showDetails?: boolean;
  compact?: boolean;
}

export function PriceTicker({ symbol, showDetails = false, compact = false }: PriceTickerProps) {
  const [loading, setLoading] = useState(false);
  const tier = storageTiers.find(t => t.symbol === symbol);
  
  if (!tier) {
    return (
      <div className={`flex items-center space-x-2 ${compact ? 'text-sm' : ''}`}>
        <WifiOff className="h-4 w-4 text-red-500" />
        <span className="text-red-600 dark:text-red-400">Tier unavailable</span>
      </div>
    );
  }

  const formatIOPS = (iops: number) => {
    if (iops >= 1000000) return `${(iops / 1000000).toFixed(1)}M`;
    if (iops >= 1000) return `${(iops / 1000).toFixed(0)}K`;
    return iops.toString();
  };

  const getChangeColor = (change: number) => {
    if (change > 0) return 'text-green-600 dark:text-green-400';
    if (change < 0) return 'text-red-600 dark:text-red-400';
    return 'text-gray-600 dark:text-gray-400';
  };

  const getChangeIcon = (change: number) => {
    if (change > 0) return <TrendingUp className="h-4 w-4" />;
    if (change < 0) return <TrendingDown className="h-4 w-4" />;
    return null;
  };

  if (compact) {
    return (
      <div className="flex items-center space-x-2">
        <div className="flex items-center space-x-1">
          <span className="font-semibold text-sm">{formatIOPS(tier.iops)} IOPS</span>
          <div className={`flex items-center space-x-1 ${getChangeColor(tier.change24h)}`}>
            {getChangeIcon(tier.change24h)}
            <span className="text-xs">{tier.change24h >= 0 ? '+' : ''}{tier.change24h.toFixed(2)}%</span>
          </div>
        </div>
        <Wifi className="h-3 w-3 text-green-500" />
      </div>
    );
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg font-bold">{tier.symbol}</CardTitle>
          <Badge variant="secondary" className="text-xs">Live</Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="text-2xl font-bold">{formatIOPS(tier.iops)} IOPS</div>
            <div className={`flex items-center space-x-1 ${getChangeColor(tier.change24h)}`}>
              {getChangeIcon(tier.change24h)}
              <span className="text-lg font-semibold">{tier.change24h >= 0 ? '+' : ''}{tier.change24h.toFixed(2)}%</span>
            </div>
          </div>

          {showDetails && (
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Latency:</span>
                <span className="font-medium">{tier.latencyMs} ms</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Throughput:</span>
                <span className="font-medium">{tier.throughputMBs} MB/s</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Cost/TB:</span>
                <span className="font-medium">${tier.costPerTB}/mo</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

interface MarketOverviewProps {
  symbols: string[];
}

export function MarketOverview({ symbols }: MarketOverviewProps) {
  const tiers = symbols.map(s => storageTiers.find(t => t.symbol === s)).filter(Boolean);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center space-x-2">
            <HardDrive className="h-5 w-5" />
            <span>Storage Tier Metrics</span>
          </CardTitle>
          <Button variant="ghost" size="sm" className="h-6 w-6 p-0">
            <RefreshCw className="h-3 w-3" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {tiers.map(tier => {
            if (!tier) return null;
            
            return (
              <div key={tier.symbol} className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <img src={tier.icon} alt={tier.symbol} className="h-5 w-5 rounded-full" />
                  <span className="font-medium">{tier.symbol}</span>
                </div>
                <span className="font-mono text-sm">
                  {tier.iops >= 1000000 
                    ? `${(tier.iops / 1000000).toFixed(1)}M IOPS`
                    : `${(tier.iops / 1000).toFixed(0)}K IOPS`
                  }
                </span>
                <div className={`flex items-center space-x-1 ${
                  tier.change24h > 0 
                    ? 'text-green-600 dark:text-green-400' 
                    : tier.change24h < 0 
                    ? 'text-red-600 dark:text-red-400'
                    : 'text-gray-600 dark:text-gray-400'
                }`}>
                  {tier.change24h > 0 && <TrendingUp className="h-3 w-3" />}
                  {tier.change24h < 0 && <TrendingDown className="h-3 w-3" />}
                  <span className="text-sm">
                    {tier.change24h >= 0 ? '+' : ''}{tier.change24h.toFixed(2)}%
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
