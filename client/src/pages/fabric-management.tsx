import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Network, Layers, Activity } from "lucide-react";

interface FabricSwitch {
  id: number;
  name: string;
  vendor: string;
  model: string | null;
  ipAddress: string | null;
  portCount: number;
  activePortCount: number;
  status: string;
  firmwareVersion: string | null;
}

interface Zone {
  id: number;
  fabricSwitchId: number;
  name: string;
  zoneType: string;
  members: string | null;
  status: string;
}

export default function FabricManagement() {
  const { data: switches, isLoading: switchesLoading } = useQuery<FabricSwitch[]>({
    queryKey: ["/api/fabric-switches"],
  });

  const { data: zones } = useQuery<Zone[]>({
    queryKey: ["/api/zones"],
  });

  const switchMap = new Map(switches?.map(s => [s.id, s.name]) || []);

  if (switchesLoading) {
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
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Fabric Management</h1>
          <p className="text-gray-500 dark:text-gray-400">SAN fabric switches and zoning configuration</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Fabric Switches</CardTitle>
            <Network className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{switches?.length || 0}</div>
            <div className="text-xs text-muted-foreground">
              {switches?.filter(s => s.status === 'online').length || 0} online
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Active Zones</CardTitle>
            <Layers className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {zones?.filter(z => z.status === 'active').length || 0}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Ports</CardTitle>
            <Activity className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {switches?.reduce((sum, s) => sum + s.activePortCount, 0) || 0}
              <span className="text-sm font-normal text-muted-foreground">
                / {switches?.reduce((sum, s) => sum + s.portCount, 0) || 0}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Fabric Switches</CardTitle>
          <CardDescription>SAN infrastructure switches</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Vendor / Model</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Ports</TableHead>
                <TableHead>Firmware</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {switches?.map((sw) => (
                <TableRow key={sw.id}>
                  <TableCell className="font-medium">{sw.name}</TableCell>
                  <TableCell>
                    <div>{sw.vendor}</div>
                    <div className="text-xs text-muted-foreground">{sw.model || '-'}</div>
                  </TableCell>
                  <TableCell>
                    <Badge variant={sw.status === 'online' ? 'default' : 'destructive'}>
                      {sw.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="font-mono text-sm">{sw.ipAddress || '-'}</TableCell>
                  <TableCell>
                    {sw.activePortCount} / {sw.portCount}
                  </TableCell>
                  <TableCell className="text-sm">{sw.firmwareVersion || '-'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Zone Configuration</CardTitle>
          <CardDescription>Fabric zoning for access control</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zone Name</TableHead>
                <TableHead>Switch</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Members</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {zones?.map((zone) => (
                <TableRow key={zone.id}>
                  <TableCell className="font-medium">{zone.name}</TableCell>
                  <TableCell>{switchMap.get(zone.fabricSwitchId) || `Switch ${zone.fabricSwitchId}`}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{zone.zoneType}</Badge>
                  </TableCell>
                  <TableCell className="text-sm max-w-xs truncate">{zone.members || '-'}</TableCell>
                  <TableCell>
                    <Badge variant={zone.status === 'active' ? 'default' : 'secondary'}>
                      {zone.status}
                    </Badge>
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
