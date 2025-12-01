import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useWallet } from "@/lib/walletContext";
import { useToast } from "@/hooks/use-toast";
import { useLocation } from "wouter";

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [role, setRole] = useState("user");
  const { connectWallet, setIsAdmin } = useWallet();
  const { toast } = useToast();
  const [, setLocation] = useLocation();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const success = await connectWallet();
      if (success) {
        setIsAdmin(role === "admin");
        toast({
          title: "Success!",
          description: isLogin ? "Logged in successfully" : "Account created successfully",
        });
        setLocation(role === "admin" ? "/admin" : "/dashboard");
      } else {
        throw new Error("Authentication failed");
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to connect wallet",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h2 className="text-2xl font-bold">{isLogin ? "Login" : "Sign Up"}</h2>
          <p className="text-gray-600">Connect your wallet to continue</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div className="flex justify-center gap-4">
              <Button
                type="button"
                variant={role === "user" ? "default" : "outline"}
                onClick={() => setRole("user")}
              >
                User
              </Button>
              <Button
                type="button"
                variant={role === "admin" ? "default" : "outline"}
                onClick={() => setRole("admin")}
              >
                Admin
              </Button>
            </div>
          </div>
          <Button type="submit" className="w-full">
            Connect Wallet
          </Button>
        </form>
      </div>
    </div>
  );
}