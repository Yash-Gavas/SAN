import { useState } from "react";
import { useWallet } from "@/lib/walletContext";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { storageTiers } from "@/lib/mockData";
import { StorageTier } from "@/lib/mockData";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function BorrowingForm() {
  const { isConnected, openModal } = useWallet();
  const { toast } = useToast();
  const [requestTier, setRequestTier] = useState<StorageTier | null>(null);
  const [redundancyTier, setRedundancyTier] = useState<StorageTier | null>(null);
  const [requestCapacity, setRequestCapacity] = useState("");
  const [redundancyCapacity, setRedundancyCapacity] = useState("");

  const handleRequestTierChange = (value: string) => {
    const tier = storageTiers.find(t => t.symbol === value);
    if (tier) setRequestTier(tier);
  };

  const handleRedundancyTierChange = (value: string) => {
    const tier = storageTiers.find(t => t.symbol === value);
    if (tier) setRedundancyTier(tier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      openModal();
      return;
    }
    
    if (!requestTier || !redundancyTier || !requestCapacity || !redundancyCapacity || 
        parseFloat(requestCapacity) <= 0 || parseFloat(redundancyCapacity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select storage tiers and enter valid capacities",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Storage Request Submitted",
      description: `Requesting ${requestCapacity} TB on ${requestTier.name} with ${redundancyCapacity} TB redundancy on ${redundancyTier.symbol}`,
    });
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Request Storage Capacity</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="requestTier" className="block text-sm font-medium text-gray-700 mb-1">Primary Storage Tier</Label>
            <Select onValueChange={handleRequestTierChange}>
              <SelectTrigger id="requestTier" className="w-full pl-3 py-3 text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg appearance-none bg-white">
                <SelectValue placeholder="Select storage tier" />
              </SelectTrigger>
              <SelectContent>
                {storageTiers.map((tier) => (
                  <SelectItem key={`request-${tier.symbol}`} value={tier.symbol}>
                    <div className="flex items-center">
                      <img src={tier.icon} alt={tier.symbol} className="h-5 w-5 rounded-full mr-2" />
                      {tier.name} ({tier.symbol})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="requestCapacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity (TB)</Label>
            <div className="relative rounded-lg shadow-sm">
              <Input 
                id="requestCapacity"
                type="text"
                placeholder="0"
                value={requestCapacity}
                onChange={(e) => setRequestCapacity(e.target.value)}
                className="block w-full pl-3 pr-20 py-3 text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button 
                  type="button" 
                  variant="ghost"
                  className="h-full rounded-r-lg border-0 bg-gray-100 px-3 text-gray-600 text-sm font-medium hover:bg-gray-200"
                  onClick={() => setRequestCapacity("100")}
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="redundancyTier" className="block text-sm font-medium text-gray-700 mb-1">Redundancy Tier (DR)</Label>
            <Select onValueChange={handleRedundancyTierChange}>
              <SelectTrigger id="redundancyTier" className="w-full pl-3 py-3 text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg appearance-none bg-white">
                <SelectValue placeholder="Select DR tier" />
              </SelectTrigger>
              <SelectContent>
                {storageTiers.map((tier) => (
                  <SelectItem key={`redundancy-${tier.symbol}`} value={tier.symbol}>
                    <div className="flex items-center">
                      <img src={tier.icon} alt={tier.symbol} className="h-5 w-5 rounded-full mr-2" />
                      {tier.name} ({tier.symbol})
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="mb-4">
            <Label htmlFor="redundancyCapacity" className="block text-sm font-medium text-gray-700 mb-1">Redundancy Capacity (TB)</Label>
            <div className="relative rounded-lg shadow-sm">
              <Input 
                id="redundancyCapacity"
                type="text"
                placeholder="0"
                value={redundancyCapacity}
                onChange={(e) => setRedundancyCapacity(e.target.value)}
                className="block w-full pl-3 pr-20 py-3 text-base border-gray-300 focus:ring-blue-500 focus:border-blue-500 rounded-lg"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button 
                  type="button" 
                  variant="ghost"
                  className="h-full rounded-r-lg border-0 bg-gray-100 px-3 text-gray-600 text-sm font-medium hover:bg-gray-200"
                  onClick={() => setRedundancyCapacity("100")}
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              type="submit" 
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              {isConnected ? "Submit Request" : "Connect Host to Request"}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 bg-blue-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Request Info</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Utilization Rate</span>
              <span className="font-medium text-blue-600">{requestTier ? `${85}%` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Redundancy Level</span>
              <span className="font-medium">150%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Failover Threshold</span>
              <span className="font-medium">120%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Health Factor</span>
              <span className="font-medium text-green-600">1.6</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
