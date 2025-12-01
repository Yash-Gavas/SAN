import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs-fixed";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { 
  AlertTriangle, 
  Shield, 
  Activity, 
  TrendingDown, 
  Settings,
  Play,
  Pause,
  RefreshCw,
  Zap
} from "lucide-react";
import { getQueryFn, apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

interface LiquidationStats {
  isRunning: boolean;
  totalLiquidations: number;
  completedLiquidations: number;
  pendingLiquidations: number;
  failedLiquidations: number;
  totalLiquidatedValue: number;
  totalCollateralSeized: number;
  config: {
    liquidationThreshold: number;
    liquidationPenalty: number;
    healthFactorThreshold: number;
  };
}

interface LiquidationEvent {
  id: number;
  userId: number;
  positionId: number;
  liquidatedAmount: number;
  collateralSeized: number;
  liquidationPenalty: number;
  liquidatorReward: number;
  timestamp: string;
  status: 'pending' | 'completed' | 'failed';
}

export default function LiquidationMonitor() {
  const { toast } = useToast();
  const [configForm, setConfigForm] = useState({
    liquidationThreshold: 1.5,
    liquidationPenalty: 0.1,
    healthFactorThreshold: 1.0
  });

  // Fetch liquidation stats
  const { data: stats, refetch: refetchStats } = useQuery<LiquidationStats>({
    queryKey: ["/api/liquidation/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  // Fetch recent liquidation events
  const { data: events, refetch: refetchEvents } = useQuery<LiquidationEvent[]>({
    queryKey: ["/api/liquidation/events"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 5000,
  });

  // Start/Stop engine mutations
  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/liquidation/start"),
    onSuccess: () => {
      toast({
        title: "Liquidation Engine Started",
        description: "Automated liquidation monitoring is now active",
        variant: "default"
      });
      refetchStats();
    },
    onError: () => {
      toast({
        title: "Failed to Start Engine",
        description: "Could not start the liquidation engine",
        variant: "destructive"
      });
    }
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/liquidation/stop"),
    onSuccess: () => {
      toast({
        title: "Liquidation Engine Stopped",
        description: "Automated liquidation monitoring has been paused",
        variant: "default"
      });
      refetchStats();
    },
    onError: () => {
      toast({
        title: "Failed to Stop Engine",
        description: "Could not stop the liquidation engine",
        variant: "destructive"
      });
    }
  });

  // Update configuration mutation
  const updateConfigMutation = useMutation({
    mutationFn: (config: typeof configForm) => 
      apiRequest("POST", "/api/liquidation/config", config),
    onSuccess: () => {
      toast({
        title: "Configuration Updated",
        description: "Liquidation parameters have been updated successfully",
        variant: "default"
      });
      refetchStats();
    },
    onError: () => {
      toast({
        title: "Configuration Failed",
        description: "Could not update liquidation configuration",
        variant: "destructive"
      });
    }
  });

  // Update form when stats load
  useEffect(() => {
    if (stats?.config) {
      setConfigForm(stats.config);
    }
  }, [stats]);

  const handleConfigSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    updateConfigMutation.mutate(configForm);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-500';
      case 'pending': return 'bg-yellow-500';
      case 'failed': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header with Engine Controls */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Liquidation Engine</h2>
          <p className="text-muted-foreground">
            Monitor and control the automated liquidation system
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge 
            variant={stats?.isRunning ? "default" : "secondary"}
            className="text-sm px-3 py-1"
          >
            {stats?.isRunning ? (
              <>
                <Activity className="w-3 h-3 mr-1" />
                Active
              </>
            ) : (
              <>
                <Pause className="w-3 h-3 mr-1" />
                Stopped
              </>
            )}
          </Badge>
          {stats?.isRunning ? (
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => stopMutation.mutate()}
              disabled={stopMutation.isPending}
            >
              <Pause className="w-4 h-4 mr-2" />
              Stop Engine
            </Button>
          ) : (
            <Button 
              size="sm"
              onClick={() => startMutation.mutate()}
              disabled={startMutation.isPending}
            >
              <Play className="w-4 h-4 mr-2" />
              Start Engine
            </Button>
          )}
        </div>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidations</CardTitle>
            <Zap className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.totalLiquidations || 0}</div>
            <p className="text-xs text-muted-foreground">
              All time liquidation events
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats?.totalLiquidations ? 
                Math.round((stats.completedLiquidations / stats.totalLiquidations) * 100) : 0}%
            </div>
            <p className="text-xs text-muted-foreground">
              Completed liquidations
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value Liquidated</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalLiquidatedValue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total liquidated value
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collateral Seized</CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              ${stats?.totalCollateralSeized?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground">
              Total collateral recovered
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="events" className="space-y-4">
        <TabsList>
          <TabsTrigger value="events">Recent Events</TabsTrigger>
          <TabsTrigger value="config">Configuration</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Liquidation Events</CardTitle>
                  <CardDescription>
                    Recent liquidation activities and their status
                  </CardDescription>
                </div>
                <Button 
                  variant="outline" 
                  size="sm"
                  onClick={() => {
                    refetchEvents();
                    refetchStats();
                  }}
                >
                  <RefreshCw className="w-4 h-4 mr-2" />
                  Refresh
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {events && events.length > 0 ? (
                <div className="space-y-4">
                  {events.map((event) => (
                    <div key={event.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant="outline"
                            className={`${getStatusColor(event.status)} text-white`}
                          >
                            {event.status}
                          </Badge>
                          <span className="text-sm font-medium">
                            Event #{event.id}
                          </span>
                        </div>
                        <span className="text-sm text-muted-foreground">
                          {formatDate(event.timestamp)}
                        </span>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">User ID</p>
                          <p className="font-medium">{event.userId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Position</p>
                          <p className="font-medium">#{event.positionId}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Liquidated</p>
                          <p className="font-medium">{event.liquidatedAmount.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Collateral Seized</p>
                          <p className="font-medium">{event.collateralSeized.toFixed(4)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-muted-foreground">
                  <Zap className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No liquidation events yet</p>
                  <p className="text-sm">Events will appear here when positions are liquidated</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="config" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="w-5 h-5" />
                Liquidation Configuration
              </CardTitle>
              <CardDescription>
                Adjust the parameters that control when liquidations are triggered
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleConfigSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <Label htmlFor="liquidationThreshold">
                      Liquidation Threshold
                    </Label>
                    <Input
                      id="liquidationThreshold"
                      type="number"
                      step="0.1"
                      min="1.0"
                      max="3.0"
                      value={configForm.liquidationThreshold}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        liquidationThreshold: parseFloat(e.target.value) || 1.5
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Required collateral ratio (e.g., 1.5 = 150%)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="liquidationPenalty">
                      Liquidation Penalty
                    </Label>
                    <Input
                      id="liquidationPenalty"
                      type="number"
                      step="0.01"
                      min="0.05"
                      max="0.2"
                      value={configForm.liquidationPenalty}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        liquidationPenalty: parseFloat(e.target.value) || 0.1
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Penalty rate (e.g., 0.1 = 10%)
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="healthFactorThreshold">
                      Health Factor Threshold
                    </Label>
                    <Input
                      id="healthFactorThreshold"
                      type="number"
                      step="0.1"
                      min="0.5"
                      max="2.0"
                      value={configForm.healthFactorThreshold}
                      onChange={(e) => setConfigForm(prev => ({
                        ...prev,
                        healthFactorThreshold: parseFloat(e.target.value) || 1.0
                      }))}
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Trigger when health factor falls below this value
                    </p>
                  </div>
                </div>

                <Button 
                  type="submit" 
                  disabled={updateConfigMutation.isPending}
                  className="w-full md:w-auto"
                >
                  {updateConfigMutation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Updating...
                    </>
                  ) : (
                    <>
                      <Settings className="w-4 h-4 mr-2" />
                      Update Configuration
                    </>
                  )}
                </Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}