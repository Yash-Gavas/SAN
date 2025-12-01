import { useState } from "react";
import { useLocation } from "wouter";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { useSettings, ThemeType, ColorScheme } from "@/lib/settingsContext";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { Moon, Sun, Laptop, User, Bell, ShieldCheck, Palette, LogOut } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export default function SettingsModal() {
  const { 
    isSettingsOpen, 
    closeSettings, 
    theme, 
    setTheme, 
    colorScheme, 
    setColorScheme,
    userProfile,
    updateProfile
  } = useSettings();
  const { user, logoutMutation } = useAuth();
  const [, setLocation] = useLocation();
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("profile");
  const [displayName, setDisplayName] = useState(userProfile.displayName || "");
  const [email, setEmail] = useState(userProfile.email || "");
  const [notificationsEnabled, setNotificationsEnabled] = useState(userProfile.notificationsEnabled);

  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      closeSettings();
      setLocation('/auth');
      toast({
        title: "Logged Out",
        description: "You have been successfully logged out",
      });
    } catch (error) {
      toast({
        title: "Logout Failed",
        description: "Failed to logout. Please try again.",
        variant: "destructive",
      });
    }
  };
  
  const handleSaveProfile = () => {
    updateProfile({
      displayName: displayName || null,
      email: email || null
    });
    
    toast({
      title: "Profile Updated",
      description: "Your profile information has been saved",
    });
  };
  
  const handleSaveNotifications = () => {
    updateProfile({
      notificationsEnabled
    });
    
    toast({
      title: "Notification Settings Updated",
      description: notificationsEnabled 
        ? "You will receive notifications about important events" 
        : "Notifications are now disabled",
    });
  };
  
  const themeOptions: {value: ThemeType, label: string, icon: JSX.Element}[] = [
    { value: 'light', label: 'Light', icon: <Sun className="h-4 w-4 mr-2" /> },
    { value: 'dark', label: 'Dark', icon: <Moon className="h-4 w-4 mr-2" /> },
    { value: 'system', label: 'System', icon: <Laptop className="h-4 w-4 mr-2" /> }
  ];
  
  const colorOptions: {value: ColorScheme, label: string, color: string}[] = [
    { value: 'blue', label: 'Blue', color: 'bg-blue-500' },
    { value: 'purple', label: 'Purple', color: 'bg-purple-500' },
    { value: 'emerald', label: 'Emerald', color: 'bg-emerald-500' },
    { value: 'orange', label: 'Orange', color: 'bg-orange-500' },
    { value: 'indigo', label: 'Indigo', color: 'bg-indigo-500' }
  ];
  
  return (
    <Dialog open={isSettingsOpen} onOpenChange={closeSettings}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900">Settings</DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Customize your experience and manage your account settings.
          </DialogDescription>
        </DialogHeader>
        
        <Tabs defaultValue="profile" className="w-full" value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="profile" className="flex items-center justify-center">
              <User className="h-4 w-4 mr-2" />
              <span>Profile</span>
            </TabsTrigger>
            <TabsTrigger value="appearance" className="flex items-center justify-center">
              <Palette className="h-4 w-4 mr-2" />
              <span>Appearance</span>
            </TabsTrigger>
            <TabsTrigger value="notifications" className="flex items-center justify-center">
              <Bell className="h-4 w-4 mr-2" />
              <span>Notifications</span>
            </TabsTrigger>
            <TabsTrigger value="security" className="flex items-center justify-center">
              <ShieldCheck className="h-4 w-4 mr-2" />
              <span>Security</span>
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="profile" className="space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <Avatar className="h-20 w-20">
                  <AvatarImage src={userProfile.avatar || ""} />
                  <AvatarFallback className="bg-primary text-white text-lg">
                    {user?.username ? user.username.charAt(0).toUpperCase() : "U"}
                  </AvatarFallback>
                </Avatar>
              </div>
            </div>
            
            <div className="text-center space-y-2 mb-6">
              <h3 className="text-xl font-semibold">Welcome back!</h3>
              <p className="text-muted-foreground">
                Logged in as: <span className="font-medium text-foreground">{user?.username}</span>
              </p>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 border rounded-lg bg-muted/50">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium">Account Information</h4>
                    <p className="text-sm text-muted-foreground">Username: {user?.username}</p>
                    <p className="text-sm text-muted-foreground">Role: {user?.role || 'User'}</p>
                  </div>
                  <User className="h-8 w-8 text-muted-foreground" />
                </div>
              </div>
              
              <Button 
                className="w-full" 
                variant="destructive"
                onClick={handleLogout}
                disabled={logoutMutation.isPending}
              >
                <LogOut className="h-4 w-4 mr-2" />
                {logoutMutation.isPending ? "Logging out..." : "Logout"}
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="appearance" className="space-y-4">
            <div className="space-y-2">
              <Label className="block mb-2">Theme</Label>
              <div className="grid grid-cols-3 gap-2">
                {themeOptions.map((option) => (
                  <Button
                    key={option.value}
                    type="button"
                    variant={theme === option.value ? "default" : "outline"}
                    className={`flex items-center justify-center h-12 ${theme === option.value ? 'border-2 border-primary' : ''}`}
                    onClick={() => {
                      setTheme(option.value);
                      toast({
                        title: "Theme Updated",
                        description: `Theme changed to ${option.label} mode`,
                      });
                    }}
                  >
                    {option.icon}
                    {option.label}
                  </Button>
                ))}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label className="block mb-2">Accent Color</Label>
              <div className="grid grid-cols-5 gap-2">
                {colorOptions.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    className={`h-10 rounded-full ${option.color} ${colorScheme === option.value ? 'ring-2 ring-offset-2 ring-gray-500' : ''}`}
                    onClick={() => {
                      setColorScheme(option.value);
                      toast({
                        title: "Color Updated",
                        description: `Accent color changed to ${option.label}`,
                      });
                    }}
                    title={option.label}
                  />
                ))}
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="notifications" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Enable Notifications</h4>
                  <p className="text-sm text-gray-500">Receive alerts for important events</p>
                </div>
                <Switch 
                  checked={notificationsEnabled}
                  onCheckedChange={setNotificationsEnabled}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Transaction Alerts</h4>
                  <p className="text-sm text-gray-500">Get notified about your DeFi transactions</p>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  disabled={!notificationsEnabled}
                  onCheckedChange={() => {}}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Price Alerts</h4>
                  <p className="text-sm text-gray-500">Alerts when assets reach price targets</p>
                </div>
                <Switch 
                  checked={notificationsEnabled} 
                  disabled={!notificationsEnabled}
                  onCheckedChange={() => {}}
                />
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Security Alerts</h4>
                  <p className="text-sm text-gray-500">Important security notifications</p>
                </div>
                <Switch 
                  checked={true} 
                  disabled
                  onCheckedChange={() => {}}
                />
              </div>
              
              <Button 
                className="w-full mt-4" 
                onClick={handleSaveNotifications}
              >
                Save Notification Settings
              </Button>
            </div>
          </TabsContent>

          <TabsContent value="security" className="space-y-4">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Two-Factor Authentication</h4>
                  <p className="text-sm text-gray-500">Add an extra layer of security to your account</p>
                </div>
                <Switch 
                  checked={false}
                  onCheckedChange={() => {
                    toast({
                      title: "2FA Setup",
                      description: "Two-factor authentication setup would be initiated here",
                    });
                  }}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Transaction Signing</h4>
                  <p className="text-sm text-gray-500">Require password for all transactions</p>
                </div>
                <Switch 
                  checked={true}
                  onCheckedChange={() => {}}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Hardware Wallet Support</h4>
                  <p className="text-sm text-gray-500">Enable hardware wallet integration</p>
                </div>
                <Switch 
                  checked={true}
                  onCheckedChange={() => {}}
                />
              </div>

              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-sm font-medium">Spending Limits</h4>
                  <p className="text-sm text-gray-500">Set daily transaction limits</p>
                </div>
                <Input 
                  type="number"
                  className="w-24"
                  placeholder="1000"
                  onChange={() => {
                    toast({
                      title: "Limit Updated",
                      description: "Daily spending limit would be updated here",
                    });
                  }}
                />
              </div>

              <div className="space-y-2 mt-6">
                <h4 className="text-sm font-medium">Active Sessions</h4>
                <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">Current Browser</p>
                      <p className="text-xs text-gray-500">Last active: Just now</p>
                    </div>
                    <Button variant="outline" size="sm">
                      Current
                    </Button>
                  </div>
                </div>
              </div>

              <Button 
                className="w-full mt-4" 
                onClick={() => {
                  toast({
                    title: "Security Settings",
                    description: "Security settings would be saved here",
                  });
                }}
              >
                Save Security Settings
              </Button>
            </div>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}