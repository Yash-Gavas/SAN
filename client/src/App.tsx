import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { useAuth, AuthProvider } from "@/hooks/use-auth";
import SANHeader from "@/components/san-header";
import SANDashboard from "@/pages/san-dashboard";
import StorageSystems from "@/pages/storage-systems";
import LunManagement from "@/pages/lun-management";
import HostManagement from "@/pages/host-management";
import FabricManagement from "@/pages/fabric-management";
import DisasterRecovery from "@/pages/disaster-recovery";
import TieringManagement from "@/pages/tiering-management";
import AuthPage from "@/pages/auth-page";
import NotFound from "@/pages/not-found";

function ProtectedRoute({ component: Component }: { component: () => React.JSX.Element }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user) {
    setLocation('/auth');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-slate-900">
      <SANHeader />
      <main>
        <Component />
      </main>
    </div>
  );
}

function AppRouter() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600 dark:text-gray-300">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <Route path="/storage-systems">
        <ProtectedRoute component={StorageSystems} />
      </Route>
      <Route path="/luns">
        <ProtectedRoute component={LunManagement} />
      </Route>
      <Route path="/hosts">
        <ProtectedRoute component={HostManagement} />
      </Route>
      <Route path="/fabric">
        <ProtectedRoute component={FabricManagement} />
      </Route>
      <Route path="/disaster-recovery">
        <ProtectedRoute component={DisasterRecovery} />
      </Route>
      <Route path="/tiering">
        <ProtectedRoute component={TieringManagement} />
      </Route>
      <Route path="/">
        {user ? (
          <ProtectedRoute component={SANDashboard} />
        ) : (
          <AuthPage />
        )}
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <AppRouter />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}
