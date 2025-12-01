
import { Switch, Route, useLocation, Redirect } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { queryClient } from "@/lib/queryClient";
import { WalletProvider } from "@/lib/walletContext";
import { SettingsProvider } from "@/lib/settingsContext";
import SettingsModal from "@/components/settings-modal";
import WalletConnectModal from "@/components/wallet-connect-modal";
import { useAuth } from "@/hooks/use-auth";
import { AuthProvider } from "@/hooks/use-auth";
import Header from "@/components/header";
import Dashboard from "@/pages/dashboard";
import Lend from "@/pages/lend";
import Borrow from "@/pages/borrow";
import Swap from "@/pages/swap";
import History from "@/pages/history";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin-dashboard";
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
      <Header />
      <main>
        <Component />
      </main>
    </div>
  );
}

function AdminRoute({ component: Component }: { component: () => React.JSX.Element }) {
  const { user, isLoading } = useAuth();
  const [, setLocation] = useLocation();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!user || user.username !== 'admin') {
    return <Redirect to="/auth" />;
  }

  return <Component />;
}

function AppRouter() {
  const { user, isLoading } = useAuth();
  const [location] = useLocation();

  // Show loading while checking authentication
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
      <Route path="/admin">
        <AdminRoute component={AdminDashboard} />
      </Route>
      <Route path="/dashboard">
        <ProtectedRoute component={Dashboard} />
      </Route>
      <Route path="/lend">
        <ProtectedRoute component={Lend} />
      </Route>
      <Route path="/borrow">
        <ProtectedRoute component={Borrow} />
      </Route>
      <Route path="/swap">
        <ProtectedRoute component={Swap} />
      </Route>
      <Route path="/history">
        <ProtectedRoute component={History} />
      </Route>
      <Route path="/">
        {user ? (
          // Redirect authenticated users to their appropriate dashboard
          user.username === 'admin' ? (
            <AdminRoute component={AdminDashboard} />
          ) : (
            <ProtectedRoute component={Dashboard} />
          )
        ) : (
          // Show login page for unauthenticated users
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
        <WalletProvider>
          <SettingsProvider>
            <AppRouter />
            <SettingsModal />
            <WalletConnectModal />
            <Toaster />
          </SettingsProvider>
        </WalletProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}
