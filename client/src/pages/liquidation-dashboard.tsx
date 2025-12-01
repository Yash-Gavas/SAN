import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
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
  Zap,
  Eye,
  Target
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

export default function LiquidationDashboard() {
  const { toast } = useToast();
  const [configForm, setConfigForm] = useState({
    liquidationThreshold: 1.5,
    liquidationPenalty: 0.1,
    healthFactorThreshold: 1.0
  });

  const [testPositionId, setTestPositionId] = useState<string>("");

  // Fetch liquidation stats with real-time updates
  const { data: stats, refetch: refetchStats } = useQuery<LiquidationStats>({
    queryKey: ["/api/liquidation/stats"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 3000, // Update every 3 seconds for real-time monitoring
  });

  // Fetch recent liquidation events
  const { data: events, refetch: refetchEvents } = useQuery<LiquidationEvent[]>({
    queryKey: ["/api/liquidation/events"],
    queryFn: getQueryFn({ on401: "returnNull" }),
    refetchInterval: 3000,
  });

  // Engine control mutations
  const startMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/liquidation/start"),
    onSuccess: () => {
      toast({
        title: "🚀 Liquidation Engine Started",
        description: "Now monitoring all positions for safety",
      });
      refetchStats();
    },
  });

  const stopMutation = useMutation({
    mutationFn: () => apiRequest("POST", "/api/liquidation/stop"),
    onSuccess: () => {
      toast({
        title: "⏸️ Engine Paused",
        description: "Liquidation monitoring has been stopped",
      });
      refetchStats();
    },
  });

  const updateConfigMutation = useMutation({
    mutationFn: (config: typeof configForm) => 
      apiRequest("POST", "/api/liquidation/config", config),
    onSuccess: () => {
      toast({
        title: "⚙️ Configuration Updated",
        description: "New liquidation parameters are now active",
      });
      refetchStats();
    },
  });

  const triggerManualLiquidation = useMutation({
    mutationFn: (positionId: number) => 
      apiRequest("POST", `/api/liquidation/trigger/${positionId}`),
    onSuccess: () => {
      toast({
        title: "🎯 Manual Liquidation Triggered",
        description: "Position has been checked for liquidation",
      });
      refetchEvents();
      setTestPositionId("");
    },
    onError: (error: any) => {
      toast({
        title: "❌ Liquidation Failed",
        description: error.message || "Could not trigger liquidation",
        variant: "destructive",
      });
    },
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

  const handleManualLiquidation = (e: React.FormEvent) => {
    e.preventDefault();
    const positionId = parseInt(testPositionId);
    if (positionId && positionId > 0) {
      triggerManualLiquidation.mutate(positionId);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      completed: "bg-green-500 text-white",
      pending: "bg-yellow-500 text-white",
      failed: "bg-red-500 text-white"
    };
    return colors[status as keyof typeof colors] || "bg-gray-500 text-white";
  };

  const calculateSuccessRate = () => {
    if (!stats?.totalLiquidations) return 0;
    return Math.round((stats.completedLiquidations / stats.totalLiquidations) * 100);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 p-6">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Liquidation Engine Dashboard
            </h1>
            <p className="text-lg text-muted-foreground mt-2">
              Real-time monitoring and control of automated liquidations
            </p>
          </div>
          
          {/* Engine Status & Controls */}
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className={`w-3 h-3 rounded-full ${stats?.isRunning ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`} />
              <Badge variant={stats?.isRunning ? "default" : "secondary"} className="text-sm px-3 py-1">
                {stats?.isRunning ? (
                  <>
                    <Activity className="w-3 h-3 mr-1" />
                    ACTIVE
                  </>
                ) : (
                  <>
                    <Pause className="w-3 h-3 mr-1" />
                    STOPPED
                  </>
                )}
              </Badge>
            </div>
            
            {stats?.isRunning ? (
              <Button 
                variant="destructive" 
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
                className="bg-green-600 hover:bg-green-700"
              >
                <Play className="w-4 h-4 mr-2" />
                Start Engine
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Real-time Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="border-l-4 border-l-blue-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Liquidations</CardTitle>
            <Zap className="h-5 w-5 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-600">{stats?.totalLiquidations || 0}</div>
            <p className="text-xs text-muted-foreground mt-1">
              All-time liquidation events
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Success Rate</CardTitle>
            <Shield className="h-5 w-5 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-600">{calculateSuccessRate()}%</div>
            <Progress value={calculateSuccessRate()} className="mt-2" />
            <p className="text-xs text-muted-foreground mt-1">
              Successfully completed liquidations
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-purple-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Value Liquidated</CardTitle>
            <TrendingDown className="h-5 w-5 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-purple-600">
              ${stats?.totalLiquidatedValue?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total liquidated value
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-l-orange-500">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Collateral Seized</CardTitle>
            <AlertTriangle className="h-5 w-5 text-orange-500" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-orange-600">
              ${stats?.totalCollateralSeized?.toFixed(2) || '0.00'}
            </div>
            <p className="text-xs text-muted-foreground mt-1">
              Total collateral recovered
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Configuration Panel */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="w-5 h-5" />
              Engine Configuration
            </CardTitle>
            <CardDescription>
              Adjust liquidation parameters and risk thresholds
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form onSubmit={handleConfigSubmit} className="space-y-4">
              <div>
                <Label htmlFor="liquidationThreshold">Liquidation Threshold</Label>
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
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Required collateral ratio (1.5 = 150%)
                </p>
              </div>

              <div>
                <Label htmlFor="liquidationPenalty">Liquidation Penalty</Label>
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
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Penalty rate (0.1 = 10%)
                </p>
              </div>

              <div>
                <Label htmlFor="healthFactorThreshold">Health Factor Threshold</Label>
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
                  className="mt-1"
                />
                <p className="text-xs text-muted-foreground mt-1">
                  Trigger liquidation below this health factor
                </p>
              </div>

              <Button 
                type="submit" 
                disabled={updateConfigMutation.isPending}
                className="w-full"
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

            {/* Manual Liquidation Testing */}
            <div className="border-t pt-4">
              <h4 className="font-medium mb-3 flex items-center gap-2">
                <Target className="w-4 h-4" />
                Manual Liquidation Test
              </h4>
              <form onSubmit={handleManualLiquidation} className="space-y-3">
                <div>
                  <Label htmlFor="positionId">Position ID</Label>
                  <Input
                    id="positionId"
                    type="number"
                    placeholder="Enter position ID to test"
                    value={testPositionId}
                    onChange={(e) => setTestPositionId(e.target.value)}
                    className="mt-1"
                  />
                </div>
                <Button 
                  type="submit" 
                  variant="outline"
                  disabled={triggerManualLiquidation.isPending || !testPositionId}
                  className="w-full"
                >
                  {triggerManualLiquidation.isPending ? (
                    <>
                      <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                      Checking...
                    </>
                  ) : (
                    <>
                      <Target className="w-4 h-4 mr-2" />
                      Trigger Liquidation Check
                    </>
                  )}
                </Button>
              </form>
            </div>
          </CardContent>
        </Card>

        {/* Recent Events */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <Activity className="w-5 h-5" />
                  Recent Liquidations
                </CardTitle>
                <CardDescription>
                  Live feed of liquidation events
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
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {events.map((event) => (
                  <div key={event.id} className="border rounded-lg p-4 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <Badge className={getStatusBadge(event.status)}>
                          {event.status.toUpperCase()}
                        </Badge>
                        <span className="font-medium">Event #{event.id}</span>
                      </div>
                      <span className="text-sm text-muted-foreground">
                        {formatDate(event.timestamp)}
                      </span>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-muted-foreground">User & Position</p>
                        <p className="font-medium">User {event.userId} • Pos #{event.positionId}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Liquidated Amount</p>
                        <p className="font-medium">{event.liquidatedAmount.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Collateral Seized</p>
                        <p className="font-medium">{event.collateralSeized.toFixed(4)}</p>
                      </div>
                      <div>
                        <p className="text-muted-foreground">Penalty</p>
                        <p className="font-medium">{event.liquidationPenalty.toFixed(4)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12 text-muted-foreground">
                <Zap className="w-16 h-16 mx-auto mb-4 opacity-50" />
                <h3 className="font-medium mb-2">No Liquidations Yet</h3>
                <p className="text-sm">
                  Events will appear here when positions are liquidated
                </p>
                <p className="text-xs mt-2">
                  The engine is monitoring all positions for safety
                </p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}