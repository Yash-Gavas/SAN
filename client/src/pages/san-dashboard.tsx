import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { 
  HardDrive, 
  Database, 
  Server, 
  Shield, 
  Activity, 
  AlertTriangle,
  CheckCircle2,
  Layers,
  Network
} from "lucide-react";

interface DashboardSummary {
  storageSystems: { total: number; online: number; offline: number };
  capacity: { totalTB: number; usedTB: number; availableTB: number; utilizationPercent: number };
  pools: { total: number; healthy: number };
  luns: { total: number; online: number };
  hosts: { total: number; online: number; offline: number };
  alerts: { total: number; critical: number; warning: number; info: number };
  replication: { total: number; active: number; syncing: number };
  engines: {
    failover: { isRunning: boolean; totalPairs: number; activePairs: number };
    tiering: { isRunning: boolean; activePolicies: number };
  };
}

export default function SANDashboard() {
  const { data: summary, isLoading } = useQuery<DashboardSummary>({
    queryKey: ["/api/dashboard/summary"],
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">SAN Management Console</h1>
          <p className="text-gray-500 dark:text-gray-400">Storage Area Network Overview</p>
        </div>
        <div className="flex gap-2">
          <Badge variant={summary?.engines.failover.isRunning ? "default" : "secondary"} className="flex items-center gap-1">
            <Shield className="w-3 h-3" />
            DR: {summary?.engines.failover.isRunning ? "Active" : "Inactive"}
          </Badge>
          <Badge variant={summary?.engines.tiering.isRunning ? "default" : "secondary"} className="flex items-center gap-1">
            <Layers className="w-3 h-3" />
            Tiering: {summary?.engines.tiering.isRunning ? "Active" : "Inactive"}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Systems</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.storageSystems.total || 0}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="default" className="text-xs">
                {summary?.storageSystems.online || 0} Online
              </Badge>
              {(summary?.storageSystems.offline || 0) > 0 && (
                <Badge variant="destructive" className="text-xs">
                  {summary?.storageSystems.offline} Offline
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Storage Pools</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.pools.total || 0}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="default" className="text-xs">
                {summary?.pools.healthy || 0} Healthy
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">LUNs</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.luns.total || 0}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="default" className="text-xs">
                {summary?.luns.online || 0} Online
              </Badge>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hosts</CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{summary?.hosts.total || 0}</div>
            <div className="flex gap-2 mt-1">
              <Badge variant="default" className="text-xs">
                {summary?.hosts.online || 0} Online
              </Badge>
              {(summary?.hosts.offline || 0) > 0 && (
                <Badge variant="secondary" className="text-xs">
                  {summary?.hosts.offline} Offline
                </Badge>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              Capacity Utilization
            </CardTitle>
            <CardDescription>Overall storage capacity across all systems</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Used: {summary?.capacity.usedTB.toFixed(1) || 0} TB</span>
                <span>Total: {summary?.capacity.totalTB.toFixed(1) || 0} TB</span>
              </div>
              <Progress value={summary?.capacity.utilizationPercent || 0} className="h-3" />
              <p className="text-sm text-muted-foreground">
                {summary?.capacity.utilizationPercent.toFixed(1)}% utilized - {summary?.capacity.availableTB.toFixed(1)} TB available
              </p>
            </div>
            
            <div className="grid grid-cols-3 gap-4 pt-4 border-t">
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{summary?.capacity.totalTB.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Total TB</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-orange-500">{summary?.capacity.usedTB.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Used TB</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-green-500">{summary?.capacity.availableTB.toFixed(0)}</p>
                <p className="text-xs text-muted-foreground">Available TB</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5" />
              Active Alerts
            </CardTitle>
            <CardDescription>Current system alerts requiring attention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center p-4 bg-red-50 dark:bg-red-900/20 rounded-lg">
                <p className="text-3xl font-bold text-red-600">{summary?.alerts.critical || 0}</p>
                <p className="text-sm text-red-600">Critical</p>
              </div>
              <div className="text-center p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
                <p className="text-3xl font-bold text-yellow-600">{summary?.alerts.warning || 0}</p>
                <p className="text-sm text-yellow-600">Warning</p>
              </div>
              <div className="text-center p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                <p className="text-3xl font-bold text-blue-600">{summary?.alerts.info || 0}</p>
                <p className="text-sm text-blue-600">Info</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Disaster Recovery Status
            </CardTitle>
            <CardDescription>Replication pairs and DR protection</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Failover Engine</span>
                <Badge variant={summary?.engines.failover.isRunning ? "default" : "secondary"}>
                  {summary?.engines.failover.isRunning ? "Running" : "Stopped"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xl font-bold">{summary?.replication.total || 0}</p>
                  <p className="text-xs text-muted-foreground">Total Pairs</p>
                </div>
                <div className="p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xl font-bold text-green-600">{summary?.replication.active || 0}</p>
                  <p className="text-xs text-muted-foreground">Active</p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Layers className="h-5 w-5" />
              Data Tiering Status
            </CardTitle>
            <CardDescription>Automated tier migration policies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Tiering Engine</span>
                <Badge variant={summary?.engines.tiering.isRunning ? "default" : "secondary"}>
                  {summary?.engines.tiering.isRunning ? "Running" : "Stopped"}
                </Badge>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
                  <p className="text-xl font-bold">{summary?.engines.tiering.activePolicies || 0}</p>
                  <p className="text-xs text-muted-foreground">Active Policies</p>
                </div>
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-blue-600" />
                  <div>
                    <p className="text-sm font-medium">Auto-tiering</p>
                    <p className="text-xs text-muted-foreground">Enabled</p>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
