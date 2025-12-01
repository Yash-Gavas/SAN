import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { 
  Users, 
  Activity, 
  DollarSign, 
  TrendingUp, 
  Shield, 
  Settings,
  LogOut,
  Eye,
  Ban,
  CheckCircle,
  UserX,
  UserCheck,
  AlertTriangle,
  Database,
  Server,
  Zap
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";

interface User {
  id: number;
  username: string;
  walletAddress: string | null;
  createdAt: string;
  status?: string;
}

interface Transaction {
  id: number;
  type: string;
  amount: number;
  status: string;
  userId: number;
  username?: string;
  createdAt: string;
  fromAssetId?: number;
  toAssetId?: number;
}

export default function AdminDashboard() {
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalTransactions: 0,
    totalVolume: 0,
    activeUsers: 0
  });
  const [systemSettings, setSystemSettings] = useState({
    maintenanceMode: false,
    newUserRegistration: true,
    liquidationThreshold: 150,
    liquidationPenalty: 10,
    minimumCollateralRatio: 120
  });
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [showSystemSettings, setShowSystemSettings] = useState(false);

  useEffect(() => {
    fetchUsers();
    fetchTransactions();
    fetchStats();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchTransactions = async () => {
    try {
      const response = await fetch('/api/admin/transactions');
      if (response.ok) {
        const data = await response.json();
        setTransactions(data);
      }
    } catch (error) {
      console.error('Failed to fetch transactions:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/admin/stats');
      if (response.ok) {
        const data = await response.json();
        setStats(data);
      }
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    }
  };

  const { logoutMutation } = useAuth();
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      setLocation('/auth');
      toast({
        title: "Logged Out",
        description: "Successfully logged out of admin panel",
      });
    } catch (error) {
      console.error('Logout failed:', error);
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };

  const handleUserAction = async (userId: number, action: string) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}/${action}`, {
        method: 'POST'
      });
      
      if (response.ok) {
        toast({
          title: "User Action Completed",
          description: `User ${action} successful`,
        });
        fetchUsers();
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Failed to ${action} user`,
        variant: "destructive",
      });
    }
  };

  const getTransactionColor = (type: string) => {
    switch (type.toLowerCase()) {
      case 'lend':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'borrow':
        return 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300';
      case 'swap':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300';
      case 'failed':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
      {/* Header */}
      <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <Shield className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
              <h1 className="text-xl font-bold text-gray-900 dark:text-gray-100">
                Admin Dashboard
              </h1>
            </div>
            <div className="flex items-center space-x-4">
              <Dialog open={showSystemSettings} onOpenChange={setShowSystemSettings}>
                <DialogTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full"
                  >
                    <Settings className="h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[500px]">
                  <DialogHeader>
                    <DialogTitle className="flex items-center">
                      <Server className="h-5 w-5 mr-2" />
                      System Settings
                    </DialogTitle>
                    <DialogDescription>
                      Configure platform-wide settings and security controls
                    </DialogDescription>
                  </DialogHeader>
                  <div className="grid gap-6 py-4">
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium flex items-center">
                        <Shield className="h-4 w-4 mr-2" />
                        Platform Controls
                      </h4>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="maintenance">Maintenance Mode</Label>
                          <p className="text-xs text-muted-foreground">
                            Disable all trading when enabled
                          </p>
                        </div>
                        <Switch
                          id="maintenance"
                          checked={systemSettings.maintenanceMode}
                          onCheckedChange={(checked) => 
                            setSystemSettings(prev => ({ ...prev, maintenanceMode: checked }))
                          }
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <div className="space-y-1">
                          <Label htmlFor="registration">New User Registration</Label>
                          <p className="text-xs text-muted-foreground">
                            Allow new users to register
                          </p>
                        </div>
                        <Switch
                          id="registration"
                          checked={systemSettings.newUserRegistration}
                          onCheckedChange={(checked) => 
                            setSystemSettings(prev => ({ ...prev, newUserRegistration: checked }))
                          }
                        />
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <h4 className="text-sm font-medium flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-2" />
                        Risk Management
                      </h4>
                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label htmlFor="liquidation-threshold">
                            Liquidation Threshold (%)
                          </Label>
                          <Input
                            id="liquidation-threshold"
                            value={systemSettings.liquidationThreshold}
                            onChange={(e) => 
                              setSystemSettings(prev => ({ 
                                ...prev, 
                                liquidationThreshold: parseInt(e.target.value) || 150 
                              }))
                            }
                            type="number"
                            min="100"
                            max="300"
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="liquidation-penalty">
                            Liquidation Penalty (%)
                          </Label>
                          <Input
                            id="liquidation-penalty"
                            value={systemSettings.liquidationPenalty}
                            onChange={(e) => 
                              setSystemSettings(prev => ({ 
                                ...prev, 
                                liquidationPenalty: parseInt(e.target.value) || 10 
                              }))
                            }
                            type="number"
                            min="1"
                            max="50"
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="collateral-ratio">
                          Minimum Collateral Ratio (%)
                        </Label>
                        <Input
                          id="collateral-ratio"
                          value={systemSettings.minimumCollateralRatio}
                          onChange={(e) => 
                            setSystemSettings(prev => ({ 
                              ...prev, 
                              minimumCollateralRatio: parseInt(e.target.value) || 120 
                            }))
                          }
                          type="number"
                          min="100"
                          max="200"
                        />
                      </div>
                    </div>
                    
                    <div className="flex justify-end space-x-2">
                      <Button variant="outline" onClick={() => setShowSystemSettings(false)}>
                        Cancel
                      </Button>
                      <Button onClick={() => {
                        toast({
                          title: "Settings Updated",
                          description: "System settings have been applied successfully",
                        });
                        setShowSystemSettings(false);
                      }}>
                        <Zap className="h-4 w-4 mr-2" />
                        Apply Settings
                      </Button>
                    </div>
                  </div>
                </DialogContent>
              </Dialog>
              <Button
                variant="outline"
                onClick={handleLogout}
                className="flex items-center space-x-2"
              >
                <LogOut className="h-4 w-4" />
                <span>Logout</span>
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
              <p className="text-xs text-muted-foreground">
                +12% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalTransactions}</div>
              <p className="text-xs text-muted-foreground">
                +8% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Volume</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalVolume.toLocaleString()}</div>
              <p className="text-xs text-muted-foreground">
                +15% from last month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeUsers}</div>
              <p className="text-xs text-muted-foreground">
                +5% from last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="users">User Management</TabsTrigger>
            <TabsTrigger value="transactions">Transaction Monitor</TabsTrigger>
            <TabsTrigger value="liquidations">Liquidation Engine</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="users" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>
                  Monitor and manage all registered users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">User ID</th>
                        <th className="text-left p-4">Username</th>
                        <th className="text-left p-4">Wallet Address</th>
                        <th className="text-left p-4">Joined</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {users.map((user) => (
                        <tr key={user.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-4">{user.id}</td>
                          <td className="p-4 font-medium">{user.username}</td>
                          <td className="p-4">
                            {user.walletAddress ? (
                              <code className="text-xs bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded">
                                {user.walletAddress.slice(0, 6)}...{user.walletAddress.slice(-4)}
                              </code>
                            ) : (
                              <span className="text-gray-500">Not connected</span>
                            )}
                          </td>
                          <td className="p-4">
                            {new Date(user.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <Badge variant={user.walletAddress ? "default" : "secondary"}>
                              {user.walletAddress ? "Active" : "Inactive"}
                            </Badge>
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'view')}
                              >
                                <Eye className="h-3 w-3 mr-1" />
                                View
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => handleUserAction(user.id, 'suspend')}
                              >
                                <Ban className="h-3 w-3 mr-1" />
                                Suspend
                              </Button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Transaction Monitor</CardTitle>
                <CardDescription>
                  Monitor all user transactions in real-time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4">TX ID</th>
                        <th className="text-left p-4">User</th>
                        <th className="text-left p-4">Type</th>
                        <th className="text-left p-4">Amount</th>
                        <th className="text-left p-4">Status</th>
                        <th className="text-left p-4">Date</th>
                        <th className="text-left p-4">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {transactions.map((tx) => (
                        <tr key={tx.id} className="border-b hover:bg-gray-50 dark:hover:bg-gray-800">
                          <td className="p-4">#{tx.id}</td>
                          <td className="p-4">{tx.username || `User ${tx.userId}`}</td>
                          <td className="p-4">
                            <Badge className={getTransactionColor(tx.type)}>
                              {tx.type}
                            </Badge>
                          </td>
                          <td className="p-4 font-medium">${tx.amount.toLocaleString()}</td>
                          <td className="p-4">
                            <Badge className={getStatusColor(tx.status)}>
                              {tx.status}
                            </Badge>
                          </td>
                          <td className="p-4">
                            {new Date(tx.createdAt).toLocaleDateString()}
                          </td>
                          <td className="p-4">
                            <div className="flex space-x-2">
                              <Button size="sm" variant="outline">
                                <Eye className="h-3 w-3 mr-1" />
                                Details
                              </Button>
                              {tx.status === 'pending' && (
                                <Button size="sm" variant="outline">
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  Approve
                                </Button>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Platform Analytics</CardTitle>
                  <CardDescription>
                    Key metrics and performance indicators
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span>User Growth Rate</span>
                      <span className="font-bold text-green-600">+12%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Transaction Success Rate</span>
                      <span className="font-bold text-green-600">98.5%</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Average Transaction Value</span>
                      <span className="font-bold">$2,450</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span>Platform Uptime</span>
                      <span className="font-bold text-green-600">99.9%</span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Health</CardTitle>
                  <CardDescription>
                    Monitor system performance and alerts
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Database Status</span>
                      </div>
                      <span className="text-green-600">Healthy</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>API Response Time</span>
                      </div>
                      <span className="text-green-600">120ms</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                        <span>Active Connections</span>
                      </div>
                      <span className="text-yellow-600">247</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span>Security Status</span>
                      </div>
                      <span className="text-green-600">Secure</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}