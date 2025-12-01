import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Layers, Database, Activity } from "lucide-react";

interface Lun {
  id: number;
  storagePoolId: number;
  lunNumber: number;
  name: string;
  capacityGB: number;
  usedCapacityGB: number;
  thinProvisioned: boolean;
  status: string;
  tierLevel: string;
}

interface StoragePool {
  id: number;
  name: string;
}

export default function LunManagement() {
  const { data: luns, isLoading: lunsLoading } = useQuery<Lun[]>({
    queryKey: ["/api/luns"],
  });

  const { data: pools } = useQuery<StoragePool[]>({
    queryKey: ["/api/storage-pools"],
  });

  const poolMap = new Map(pools?.map(p => [p.id, p.name]) || []);

  if (lunsLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const totalCapacity = luns?.reduce((sum, l) => sum + l.capacityGB, 0) || 0;
  const usedCapacity = luns?.reduce((sum, l) => sum + l.usedCapacityGB, 0) || 0;

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">LUN Management</h1>
          <p className="text-gray-500 dark:text-gray-400">Logical Unit Number allocation and masking</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total LUNs</CardTitle>
            <Layers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{luns?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Online</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {luns?.filter(l => l.status === 'online').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Capacity</CardTitle>
            <Database className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{(totalCapacity / 1024).toFixed(1)} TB</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Thin Provisioned</CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {luns?.filter(l => l.thinProvisioned).length || 0}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>LUN Inventory</CardTitle>
          <CardDescription>All configured Logical Unit Numbers</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>LUN #</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Pool</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Capacity</TableHead>
                <TableHead>Utilization</TableHead>
                <TableHead>Provisioning</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {luns?.map((lun) => {
                const utilization = (lun.usedCapacityGB / lun.capacityGB) * 100;
                return (
                  <TableRow key={lun.id}>
                    <TableCell className="font-mono">{lun.lunNumber}</TableCell>
                    <TableCell className="font-medium">{lun.name}</TableCell>
                    <TableCell>{poolMap.get(lun.storagePoolId) || `Pool ${lun.storagePoolId}`}</TableCell>
                    <TableCell>
                      <Badge variant={lun.status === 'online' ? 'default' : 'destructive'}>
                        {lun.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={lun.tierLevel === 'hot' ? 'destructive' : lun.tierLevel === 'cold' ? 'secondary' : 'default'}>
                        {lun.tierLevel}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div>{lun.capacityGB} GB</div>
                      <div className="text-xs text-muted-foreground">
                        {lun.usedCapacityGB} GB used
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
                    <TableCell>
                      <Badge variant={lun.thinProvisioned ? 'outline' : 'secondary'}>
                        {lun.thinProvisioned ? 'Thin' : 'Thick'}
                      </Badge>
                    </TableCell>
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
