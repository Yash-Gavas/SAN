import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Shield, RefreshCw, AlertTriangle, CheckCircle2, Clock, Play, Square } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface ReplicationPair {
  id: number;
  name: string;
  sourceLunId: number;
  targetStorageSystemId: number;
  targetLunIdentifier: string | null;
  replicationType: string;
  rpoMinutes: number;
  status: string;
  lastSyncAt: string | null;
}

interface FailoverStats {
  isRunning: boolean;
  lastCheck: string | null;
  totalPairs: number;
  activePairs: number;
  syncingPairs: number;
  failedPairs: number;
  lastFailover: string | null;
}

export default function DisasterRecovery() {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: pairs, isLoading: pairsLoading } = useQuery<ReplicationPair[]>({
    queryKey: ["/api/replication-pairs"],
  });

  const { data: stats } = useQuery<FailoverStats>({
    queryKey: ["/api/failover/stats"],
    refetchInterval: 5000,
  });

  const startEngineMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/failover/start', { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/failover/stats"] });
      toast({ title: "Failover engine started" });
    },
  });

  const stopEngineMutation = useMutation({
    mutationFn: async () => {
      const res = await fetch('/api/failover/stop', { method: 'POST' });
      return res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/failover/stats"] });
      toast({ title: "Failover engine stopped" });
    },
  });

  const triggerFailoverMutation = useMutation({
    mutationFn: async (pairId: number) => {
      const res = await fetch(`/api/failover/trigger/${pairId}`, { method: 'POST' });
      return res.json();
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ["/api/replication-pairs"] });
      toast({ title: data.message });
    },
  });

  if (pairsLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Disaster Recovery</h1>
          <p className="text-gray-500 dark:text-gray-400">Replication and failover management</p>
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
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <Badge variant={stats?.isRunning ? "default" : "secondary"} className="text-lg">
              {stats?.isRunning ? "Running" : "Stopped"}
            </Badge>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Replication Pairs</CardTitle>
            <RefreshCw className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalPairs || 0}</div>
            <div className="text-xs text-muted-foreground">
              {stats?.activePairs || 0} active
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active</CardTitle>
            <CheckCircle2 className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats?.activePairs || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Failed</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">{stats?.failedPairs || 0}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Replication Pairs</CardTitle>
          <CardDescription>Configured DR replication relationships</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>RPO</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Last Sync</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {pairs?.map((pair) => (
                <TableRow key={pair.id}>
                  <TableCell className="font-medium">{pair.name}</TableCell>
                  <TableCell>
                    <Badge variant={pair.replicationType === 'sync' ? 'default' : 'secondary'}>
                      {pair.replicationType === 'sync' ? 'Synchronous' : 'Asynchronous'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {pair.rpoMinutes === 0 ? 'Zero' : `${pair.rpoMinutes} min`}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge 
                      variant={pair.status === 'active' ? 'default' : pair.status === 'syncing' ? 'secondary' : 'destructive'}
                    >
                      {pair.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-sm">
                    {pair.lastSyncAt ? new Date(pair.lastSyncAt).toLocaleString() : 'Never'}
                  </TableCell>
                  <TableCell>
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => triggerFailoverMutation.mutate(pair.id)}
                      disabled={triggerFailoverMutation.isPending}
                    >
                      <Shield className="h-3 w-3 mr-1" />
                      Failover
                    </Button>
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
