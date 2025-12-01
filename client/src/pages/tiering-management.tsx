import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Activity, ArrowUpDown, Play, Square, Clock } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface TierPolicy {
  id: number;
  name: string;
  storagePoolId: number;
  hotTierThresholdIOPS: number;
  coldTierThresholdDays: number;
  migrationSchedule: string;
  isEnabled: boolean;
  lastExecutedAt: string | null;
}

interface TieringStats {
  isRunning: boolean;
  lastCheck: string | null;
  totalMigrationsToday: number;
  hotTierMigrations: number;
  coldTierMigrations: number;
  activePolicies: number;
}

interface StoragePool {
  id: number;
  name: string;
}

export default function TieringManagement() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: policies, isLoading: policiesLoading } = useQuery<TierPolicy[]>({
    queryKey: ["/api/tier-policies"],
  });

  const { data: pools } = useQuery<StoragePool[]>({
    queryKey: ["/api/storage-pools"],
  });

  const { data: stats } = useQuery<TieringStats>({
    queryKey: ["/api/tiering/stats"],
    refetchInterval: 5000,
  });

  const poolMap = new Map(pools?.map(p => [p.id, p.name]) || []);

  const startEngineMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/tiering/start', { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tiering/stats"] });
      toast({ title: "Tiering engine started" });
    },
  });

  const stopEngineMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/tiering/stop', { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/tiering/stats"] });
      toast({ title: "Tiering engine stopped" });
    },
  });

  if (policiesLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Data Tiering</h1>
          <p className="text-gray-500 dark:text-gray-400">Automated data tier migration policies</p>
        </div>
        <div className="flex gap-2">
          {stats?.isRunning ? (
            <Button variant="destructive" onClick={() => stopEngineMutation.mutate()}>
              <Square className="h-4 w-4 mr-2" />
              Stop Engine
            </Button>
          ) : (
            <Button onClick={() => startEngineMutation.mutate()}>
              <Play className="h-4 w-4 mr-2" />
              Start Engine
            </Button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Engine Status</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={stats?.isRunning ? "default" : "secondary"} className="text-lg">
              {stats?.isRunning ? "Running" : "Stopped"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.activePolicies || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Hot Tier Migrations</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.hotTierMigrations || 0}</div>
            <div className="text-xs text-muted-foreground">today</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Cold Tier Migrations</CardTitle>
            <ArrowUpDown className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">{stats?.coldTierMigrations || 0}</div>
            <div className="text-xs text-muted-foreground">today</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Tiering Policies</CardTitle>
          <CardDescription>Automated data migration rules</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy Name</TableHead>
                <TableHead>Storage Pool</TableHead>
                <TableHead>Hot Tier Threshold</TableHead>
                <TableHead>Cold Tier Threshold</TableHead>
                <TableHead>Schedule</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Run</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies?.map((policy) => (
                <TableRow key={policy.id}>
                  <TableCell className="font-medium">{policy.name}</TableCell>
                  <TableCell>{poolMap.get(policy.storagePoolId) || `Pool ${policy.storagePoolId}`}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Activity className="h-3 w-3 text-red-500" />
                      {policy.hotTierThresholdIOPS} IOPS
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3 text-blue-500" />
                      {policy.coldTierThresholdDays} days
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{policy.migrationSchedule}</Badge>
                  </TableCell>
                  <TableCell>
                    <Badge variant={policy.isEnabled ? 'default' : 'secondary'}>
                      {policy.isEnabled ? 'Enabled' : 'Disabled'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {policy.lastExecutedAt ? new Date(policy.lastExecutedAt).toLocaleString() : 'Never'}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
