import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/use-auth";
import { 
  HardDrive, 
  Database, 
  Layers, 
  Server, 
  Network, 
  Shield, 
  ArrowUpDown,
  LogOut,
  LayoutDashboard
} from "lucide-react";

export default function SANHeader() {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();

  const navItems = [
    { path: "/", label: "Dashboard", icon: LayoutDashboard },
    { path: "/storage-systems", label: "Storage", icon: HardDrive },
    { path: "/luns", label: "LUNs", icon: Layers },
    { path: "/hosts", label: "Hosts", icon: Server },
    { path: "/fabric", label: "Fabric", icon: Network },
    { path: "/disaster-recovery", label: "DR", icon: Shield },
    { path: "/tiering", label: "Tiering", icon: ArrowUpDown },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-14 items-center">
        <div className="mr-4 flex items-center gap-2">
          <Database className="h-6 w-6 text-blue-600" />
          <span className="font-bold text-lg hidden md:block">SAN Console</span>
        </div>
        
        <nav className="flex items-center gap-1 text-sm">
          {navItems.map((item) => {
            const isActive = location === item.path || 
              (item.path !== "/" && location.startsWith(item.path));
            const Icon = item.icon;
            return (
              <Link key={item.path} href={item.path}>
                <Button
                  variant={isActive ? "secondary" : "ghost"}
                  size="sm"
                  className="h-8 gap-1.5"
                >
                  <Icon className="h-4 w-4" />
                  <span className="hidden lg:inline">{item.label}</span>
                </Button>
              </Link>
            );
          })}
        </nav>

        <div className="ml-auto flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden md:block">
            {user?.username}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => logoutMutation.mutate()}
            disabled={logoutMutation.isPending}
          >
            <LogOut className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </header>
  );
}
