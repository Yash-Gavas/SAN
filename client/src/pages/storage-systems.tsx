import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { HardDrive, Server, Activity } from "lucide-react";

interface StorageSystem {
  id: number;
  name: string;
  vendor: string;
  model: string;
  serialNumber: string | null;
  ipAddress: string | null;
  status: string;
  totalCapacityTB: number;
  usedCapacityTB: number;
  raidLevel: string | null;
  firmwareVersion: string | null;
  location: string | null;
}

export default function StorageSystems() {
  const { data: systems, isLoading } = useQuery<StorageSystem[]>({
    queryKey: ["/api/storage-systems"],
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Storage Systems</h1>
          <p className="text-gray-500 dark:text-gray-400">Enterprise storage arrays and systems</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Systems</CardTitle>
            <HardDrive className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{systems?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Server className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {systems?.filter(s => s.status === 'online').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {systems?.reduce((sum, s) => sum + s.totalCapacityTB, 0).toFixed(0) || 0} TB
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Storage Systems</CardTitle>
          <CardDescription>All configured storage arrays</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Vendor / Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>RAID</TableHead>
                <TableHead>Location</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {systems?.map((system) => {
                const utilization = (system.usedCapacityTB / system.totalCapacityTB) * 100;
                return (
                  <TableRow key={system.id}>
                    <TableCell className="font-medium">{system.name}</TableCell>
                    <TableCell>
                      <div>{system.vendor}</div>
                      <div className="text-xs text-muted-foreground">{system.model}</div>
                    </TableCell>
                    <TableCell>
                      <Badge variant={system.status === 'online' ? 'default' : 'destructive'}>
                        {system.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>{system.totalCapacityTB} TB</div>
                      <div className="text-xs text-muted-foreground">
                        {system.usedCapacityTB} TB used
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="w-24">
                        <Progress value={utilization} className="h-2" />
                        <div className="text-xs text-muted-foreground mt-1">
                          {utilization.toFixed(1)}%
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>{system.raidLevel || '-'}</TableCell>
                    <TableCell>{system.location || '-'}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
