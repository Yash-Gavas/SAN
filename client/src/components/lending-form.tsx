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

export default function LendingForm() {
  const { isConnected, openModal } = useWallet();
  const { toast } = useToast();
  const [selectedTier, setSelectedTier] = useState<StorageTier | null>(null);
  const [capacity, setCapacity] = useState("");

  const handleTierChange = (value: string) => {
    const tier = storageTiers.find(t => t.symbol === value);
    if (tier) setSelectedTier(tier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      openModal();
      return;
    }
    
    if (!selectedTier || !capacity || parseFloat(capacity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select a storage tier and enter a valid capacity",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "LUN Provisioning Initiated",
      description: `Provisioning ${capacity} TB on ${selectedTier.name}`,
    });
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Provision LUN</h3>
        
        <form onSubmit={handleSubmit}>
          <div className="mb-4">
            <Label htmlFor="storageTier" className="block text-sm font-medium text-gray-700 mb-1">Select Storage Tier</Label>
            <Select onValueChange={handleTierChange}>
              <SelectTrigger id="storageTier" className="w-full pl-3 py-3 text-base border-gray-300 focus:ring-primary focus:border-primary rounded-lg appearance-none bg-white">
                <SelectValue placeholder="Select a storage tier" />
              </SelectTrigger>
              <SelectContent>
                {storageTiers.map((tier) => (
                  <SelectItem key={tier.symbol} value={tier.symbol}>
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
            <Label htmlFor="capacity" className="block text-sm font-medium text-gray-700 mb-1">Capacity (TB)</Label>
            <div className="relative rounded-lg shadow-sm">
              <Input 
                id="capacity"
                type="text"
                placeholder="0"
                value={capacity}
                onChange={(e) => setCapacity(e.target.value)}
                className="block w-full pl-3 pr-20 py-3 text-base border-gray-300 focus:ring-primary focus:border-primary rounded-lg"
              />
              <div className="absolute inset-y-0 right-0 flex items-center">
                <Button 
                  type="button" 
                  variant="ghost"
                  className="h-full rounded-r-lg border-0 bg-gray-100 px-3 text-gray-600 text-sm font-medium hover:bg-gray-200"
                  onClick={() => {
                    setCapacity(selectedTier ? "100" : "");
                  }}
                >
                  MAX
                </Button>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <Button 
              type="submit" 
              className="w-full bg-cyan-600 hover:bg-cyan-700 text-white py-3 px-6 rounded-lg font-medium transition-colors duration-200"
            >
              {isConnected ? "Provision LUN" : "Connect Host to Provision"}
            </Button>
          </div>
        </form>
        
        <div className="mt-6 bg-cyan-50 p-4 rounded-lg">
          <h4 className="text-sm font-medium text-gray-900 mb-2">Provisioning Info</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Max IOPS</span>
              <span className="font-medium text-cyan-600">{selectedTier ? selectedTier.iops.toLocaleString() : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Latency</span>
              <span className="font-medium font-mono">{selectedTier ? `${selectedTier.latencyMs} ms` : '—'}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Cost per TB</span>
              <span className="font-medium">{selectedTier ? `$${selectedTier.costPerTB}/mo` : '—'}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
