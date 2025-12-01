import { useState } from "react";
import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import WalletConnectButton from "@/components/wallet-connect-button";
import { Logo } from "@/components/ui/logo";
import { Button } from "@/components/ui/button";
import { 
  Menu, 
  X, 
  Home, 
  HardDrive, 
  Database, 
  Layers, 
  Clock, 
  Settings,
  User,
  Bell,
  Moon,
  Sun,
  Server
} from "lucide-react";
import { useSettings } from "@/lib/settingsContext";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

export default function Header() {
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const { openSettings, theme, setTheme } = useSettings();

  const isActive = (path: string) => {
    return location === path;
  };

  const navigationItems = [
    { name: "Dashboard", path: "/", icon: <Home size={18} /> },
    { name: "Provision", path: "/lend", icon: <HardDrive size={18} /> },
    { name: "Request", path: "/borrow", icon: <Database size={18} /> },
    { name: "Tiering", path: "/swap", icon: <Layers size={18} /> },
    { name: "Operations", path: "/history", icon: <Clock size={18} /> },
  ];

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  return (
    <header className="bg-gradient-to-r from-slate-50 via-white to-cyan-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-900 border-b border-gray-200 dark:border-gray-700 sticky top-0 z-50 shadow-sm">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link to="/">
              <div className="flex items-center">
                <Server className="h-8 w-8 text-cyan-600" />
                <span className="ml-2 text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-cyan-600 to-blue-600 hidden sm:inline-block dark:from-cyan-400 dark:to-blue-400">
                  SAN Manager
                </span>
              </div>
            </Link>
          </div>

          <nav className="hidden md:flex space-x-1">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-4 py-2 rounded-full text-sm font-medium transition-all duration-200
                  ${isActive(item.path)
                    ? "bg-cyan-100 text-cyan-700 shadow-sm dark:bg-cyan-900 dark:text-cyan-300"
                    : "hover:bg-cyan-50 text-gray-700 hover:text-cyan-700 dark:text-gray-300 dark:hover:bg-cyan-900 dark:hover:text-cyan-300"
                  }
                `}
              >
                <span className="mr-2">{item.icon}</span>
                {item.name}
              </Link>
            ))}
          </nav>

          <div className="flex items-center space-x-3">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900"
                    onClick={toggleTheme}
                  >
                    {theme === 'light' ? 
                      <Moon className="h-5 w-5 text-gray-700 dark:text-gray-300" /> : 
                      <Sun className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                    }
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Toggle {theme === 'light' ? 'Dark' : 'Light'} Mode</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="rounded-full hover:bg-cyan-100 dark:hover:bg-cyan-900"
                    onClick={openSettings}
                  >
                    <Settings className="h-5 w-5 text-gray-700 dark:text-gray-300" />
                  </Button>
                </TooltipTrigger>
                <TooltipContent>
                  <p>Settings</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>

            <WalletConnectButton />

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden rounded-full hover:bg-cyan-100"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="text-gray-700" /> : <Menu className="text-gray-700" />}
            </Button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-200 dark:border-gray-700 bg-white dark:bg-slate-800 shadow-lg absolute w-full z-50">
          <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
            {navigationItems.map((item) => (
              <Link
                key={item.path}
                href={item.path}
                className={`
                  flex items-center px-4 py-3 rounded-lg text-base font-medium
                  ${isActive(item.path)
                    ? "bg-cyan-100 text-cyan-700 dark:bg-cyan-900 dark:text-cyan-300"
                    : "text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 dark:text-gray-300 dark:hover:bg-cyan-900 dark:hover:text-cyan-300"
                  }
                `}
                onClick={() => setMobileMenuOpen(false)}
              >
                <span className="mr-3">{item.icon}</span>
                {item.name}
              </Link>
            ))}

            <button 
              className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 dark:text-gray-300 dark:hover:bg-cyan-900 dark:hover:text-cyan-300"
              onClick={() => {
                openSettings();
                setMobileMenuOpen(false);
              }}
            >
              <Settings className="mr-3" size={18} />
              Settings
            </button>

            <button 
              className="w-full flex items-center px-4 py-3 rounded-lg text-base font-medium text-gray-700 hover:bg-cyan-50 hover:text-cyan-700 dark:text-gray-300 dark:hover:bg-cyan-900 dark:hover:text-cyan-300"
              onClick={() => {
                toggleTheme();
                setMobileMenuOpen(false);
              }}
            >
              {theme === 'light' ? 
                <Moon className="mr-3" size={18} /> : 
                <Sun className="mr-3" size={18} />
              }
              Switch to {theme === 'light' ? 'Dark' : 'Light'} Mode
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
