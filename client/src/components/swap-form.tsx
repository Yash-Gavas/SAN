import { useState, useEffect } from "react";
import { useWallet } from "@/lib/walletContext";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { storageTiers, getTieringEfficiency, calculateMigrationImpact } from "@/lib/mockData";
import { StorageTier } from "@/lib/mockData";
import { 
  ArrowUpDown, 
  Layers, 
  Zap, 
  AlertCircle, 
  Percent,
  ChevronDown
} from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";

export default function SwapForm() {
  const { isConnected, openModal } = useWallet();
  const { toast } = useToast();
  const [fromTier, setFromTier] = useState<StorageTier | null>(null);
  const [toTier, setToTier] = useState<StorageTier | null>(null);
  const [fromCapacity, setFromCapacity] = useState("");
  const [toCapacity, setToCapacity] = useState("");
  const [tieringRatio, setTieringRatio] = useState<number | null>(null);
  const [migrationImpact, setMigrationImpact] = useState<number>(0);

  const handleFromTierChange = (value: string) => {
    const tier = storageTiers.find(t => t.symbol === value);
    if (tier) {
      setFromTier(tier);
      updateCalculations(fromCapacity, tier, toTier);
    }
  };

  const handleToTierChange = (value: string) => {
    const tier = storageTiers.find(t => t.symbol === value);
    if (tier) {
      setToTier(tier);
      updateCalculations(fromCapacity, fromTier, tier);
    }
  };

  const updateCalculations = (capacity: string, from: StorageTier | null, to: StorageTier | null) => {
    if (from && to && capacity && !isNaN(parseFloat(capacity))) {
      const ratio = getTieringEfficiency(from, to);
      setTieringRatio(ratio);
      
      const capacityNum = parseFloat(capacity);
      setToCapacity(capacityNum.toFixed(2));
      
      const impact = calculateMigrationImpact(capacityNum, from);
      setMigrationImpact(impact);
    } else {
      setToCapacity("");
      setTieringRatio(null);
      setMigrationImpact(0);
    }
  };

  const handleFromCapacityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFromCapacity(value);
    updateCalculations(value, fromTier, toTier);
  };

  const switchTiers = () => {
    const tempFromTier = fromTier;
    const tempToTier = toTier;
    const tempFromCapacity = fromCapacity;
    const tempToCapacity = toCapacity;
    
    setFromTier(tempToTier);
    setToTier(tempFromTier);
    setFromCapacity(tempToCapacity);
    setToCapacity(tempFromCapacity);
    
    updateCalculations(tempToCapacity, tempToTier, tempFromTier);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!isConnected) {
      openModal();
      return;
    }
    
    if (!fromTier || !toTier || !fromCapacity || parseFloat(fromCapacity) <= 0) {
      toast({
        title: "Invalid Input",
        description: "Please select storage tiers and enter a valid capacity",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Data Migration Initiated",
      description: `Migrating ${fromCapacity} TB from ${fromTier.symbol} to ${toTier.symbol}`,
    });
  };

  useEffect(() => {
    const defaultFromTier = storageTiers.find(t => t.symbol === "SSD");
    const defaultToTier = storageTiers.find(t => t.symbol === "HDD");
    
    if (defaultFromTier && defaultToTier) {
      setFromTier(defaultFromTier);
      setToTier(defaultToTier);
      setTieringRatio(getTieringEfficiency(defaultFromTier, defaultToTier));
    }
  }, []);

  return (
    <div className="card-shadow hover:shadow-md transition-all duration-300">
      <Card className="bg-white border border-gray-100 overflow-hidden">
        <div className="bg-gradient-to-r from-indigo-600 to-purple-600 py-4 px-6">
          <h3 className="text-lg font-bold text-white flex items-center">
            <Layers className="mr-2 h-5 w-5" />
            Data Tiering
          </h3>
          <p className="text-sm text-indigo-100">
            Migrate data between storage tiers for optimal cost/performance
          </p>
        </div>
        
        <CardContent className="p-6">
          {!isConnected && (
            <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
              <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
              <div className="flex-1">
                <p className="text-blue-700 text-sm font-medium">Connect your host to migrate data</p>
                <p className="text-blue-600 text-xs mt-1">You need to connect your host first to access data tiering</p>
              </div>
              <Button 
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium ml-4"
                onClick={() => openModal()}
              >
                Connect Host
              </Button>
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <Label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span className="mr-1">Source Tier</span>
                <div className="text-xs bg-red-100 text-red-700 px-2 py-0.5 rounded-full">Hot Data</div>
              </Label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div className="relative w-2/3">
                    <Input
                      type="text"
                      value={fromCapacity}
                      onChange={handleFromCapacityChange}
                      className="block w-full bg-transparent text-xl font-medium focus:outline-none font-mono border-none"
                      placeholder="0"
                    />
                  </div>
                  <div className="w-1/3">
                    <Select value={fromTier?.symbol} onValueChange={handleFromTierChange}>
                      <SelectTrigger className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full justify-between">
                        {fromTier ? (
                          <div className="flex items-center">
                            <img src={fromTier.icon} alt={fromTier.symbol} className="h-6 w-6 rounded-full mr-2" />
                            <span className="font-medium">{fromTier.symbol}</span>
                          </div>
                        ) : (
                          <span>Select</span>
                        )}
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </SelectTrigger>
                      <SelectContent>
                        {storageTiers.map((tier) => (
                          <SelectItem key={`from-${tier.symbol}`} value={tier.symbol}>
                            <div className="flex items-center">
                              <img src={tier.icon} alt={tier.symbol} className="h-5 w-5 rounded-full mr-2" />
                              <span>{tier.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-sm text-gray-500 flex justify-between">
                  <span>IOPS: {fromTier ? `${(fromTier.iops / 1000).toFixed(0)}K` : "0"}</span>
                  <Button 
                    type="button" 
                    variant="ghost" 
                    className="text-indigo-600 font-medium px-2 py-1 h-auto hover:bg-indigo-50 rounded-md"
                    onClick={() => {
                      if (fromTier) {
                        setFromCapacity("100");
                        updateCalculations("100", fromTier, toTier);
                      }
                    }}
                  >
                    MAX
                  </Button>
                </div>
              </div>
            </div>
            
            <div className="flex justify-center my-3">
              <Button 
                type="button" 
                variant="outline"
                size="icon"
                className="bg-white border border-indigo-200 p-3 rounded-full text-indigo-600 hover:bg-indigo-50 transition-all duration-200 shadow-sm"
                onClick={switchTiers}
              >
                <ArrowUpDown className="h-5 w-5" />
              </Button>
            </div>
            
            <div className="mb-5">
              <Label className="block text-sm font-medium text-gray-700 mb-1 flex items-center">
                <span className="mr-1">Target Tier</span>
                <div className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">Cold Data</div>
              </Label>
              <div className="bg-gray-50 rounded-lg p-4 border border-gray-200 hover:border-indigo-300 transition-colors">
                <div className="flex justify-between items-center mb-2">
                  <div className="relative w-2/3">
                    <Input
                      type="text"
                      value={toCapacity}
                      className="block w-full bg-transparent text-xl font-medium focus:outline-none font-mono border-none"
                      placeholder="0"
                      readOnly
                    />
                  </div>
                  <div className="w-1/3">
                    <Select value={toTier?.symbol} onValueChange={handleToTierChange}>
                      <SelectTrigger className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-lg text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 w-full justify-between">
                        {toTier ? (
                          <div className="flex items-center">
                            <img src={toTier.icon} alt={toTier.symbol} className="h-6 w-6 rounded-full mr-2" />
                            <span className="font-medium">{toTier.symbol}</span>
                          </div>
                        ) : (
                          <span>Select</span>
                        )}
                        <ChevronDown className="h-4 w-4 opacity-70" />
                      </SelectTrigger>
                      <SelectContent>
                        {storageTiers.map((tier) => (
                          <SelectItem key={`to-${tier.symbol}`} value={tier.symbol}>
                            <div className="flex items-center">
                              <img src={tier.icon} alt={tier.symbol} className="h-5 w-5 rounded-full mr-2" />
                              <span>{tier.symbol}</span>
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="text-sm text-gray-500">
                  <span>IOPS: {toTier ? `${(toTier.iops / 1000).toFixed(0)}K` : "0"}</span>
                </div>
              </div>
            </div>
            
            <div className="bg-indigo-50 p-4 rounded-lg mb-5 border border-indigo-100">
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 flex items-center">
                  <Layers className="h-4 w-4 mr-1 text-indigo-600" />
                  Performance Ratio
                </span>
                <span className="font-medium text-indigo-700">
                  {tieringRatio && fromTier && toTier
                    ? `${fromTier.symbol} is ${tieringRatio.toFixed(1)}x faster than ${toTier.symbol}`
                    : "-"
                  }
                </span>
              </div>
              <div className="flex justify-between text-sm mb-2">
                <span className="text-gray-700 flex items-center">
                  <Percent className="h-4 w-4 mr-1 text-indigo-600" />
                  Migration Impact
                </span>
                <span className={`font-medium px-2 py-0.5 rounded-full ${
                  migrationImpact < 1 ? "bg-green-100 text-green-700" : 
                  migrationImpact < 3 ? "bg-yellow-100 text-yellow-700" : "bg-red-100 text-red-700"
                }`}>
                  {migrationImpact.toFixed(2)}%
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-700 flex items-center">
                  <Zap className="h-4 w-4 mr-1 text-indigo-600" />
                  Est. Migration Time
                </span>
                <span className="font-medium text-indigo-700">
                  {fromCapacity ? `${Math.ceil(parseFloat(fromCapacity) / 10)} hours` : '—'}
                </span>
              </div>
            </div>
            
            <div className="mt-4">
              <Button 
                type={isConnected ? "submit" : "button"}
                onClick={() => !isConnected && openModal()}
                className="w-full bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-indigo-600 hover:to-purple-600 text-white py-4 px-6 rounded-lg font-bold text-md transition-all duration-200 shadow-md hover:shadow-lg"
              >
                Migrate Data
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
