import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DualCryptoIcon } from "@/components/ui/crypto-icon";
import { useWallet } from "@/lib/walletContext";
import { storagePools } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { PlusCircle, Database } from "lucide-react";

export default function LiquidityPools() {
  const { isConnected, openModal } = useWallet();
  const { toast } = useToast();

  const handleMigrate = (pool: string) => {
    if (!isConnected) {
      openModal();
      return;
    }
    
    toast({
      title: "Pool Selected",
      description: `Selected ${pool} pool for data migration`,
    });
  };

  const handleAddCapacity = (pool: string) => {
    if (!isConnected) {
      openModal();
      return;
    }
    
    toast({
      title: "Expand Pool",
      description: `Selected ${pool} pool for capacity expansion`,
    });
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-2 text-blue-600" />
            Storage Pools
          </h3>
          <div className="flex items-center">
            <Button 
              variant="ghost"
              className="text-sm font-medium text-blue-600 mr-4 flex items-center"
              onClick={() => {
                if (!isConnected) {
                  openModal();
                  return;
                }
                toast({
                  title: "Create Pool",
                  description: "Navigate to pool creation form",
                });
              }}
            >
              <PlusCircle className="h-4 w-4 mr-1" /> Create Pool
            </Button>
            <span className="text-sm text-gray-500">
              Updated 1 min ago
            </span>
          </div>
        </div>
        
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Pool Tiers</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Capacity</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used (TB)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">IOPS</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tiering Policy</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {storagePools.map((pool, index) => (
                <tr key={`storage-pool-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <DualCryptoIcon 
                        src1={pool.tiers[0].icon} 
                        src2={pool.tiers[1].icon} 
                        alt1={pool.tiers[0].symbol} 
                        alt2={pool.tiers[1].symbol}
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{pool.tiers[0].symbol} + {pool.tiers[1].symbol}</div>
                        <div className="text-xs text-gray-500">Hybrid Pool</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono">
                      {pool.totalCapacityTB.toLocaleString()} TB
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className="bg-blue-500 h-2 rounded-full"
                          style={{ width: `${(pool.usedCapacityTB / pool.totalCapacityTB) * 100}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-mono">{pool.usedCapacityTB.toLocaleString()}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-semibold inline-block">
                      {(pool.iopsTotal / 1000).toFixed(0)}K
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm bg-purple-100 text-purple-700 px-3 py-1 rounded-full font-medium inline-block">
                      {pool.tieringPolicy}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <button 
                      className="text-indigo-600 hover:text-indigo-800 mr-3 font-medium"
                      onClick={() => handleMigrate(`${pool.tiers[0].symbol}+${pool.tiers[1].symbol}`)}
                    >
                      Migrate
                    </button>
                    <button 
                      className="text-green-600 hover:text-green-800 font-medium"
                      onClick={() => handleAddCapacity(`${pool.tiers[0].symbol}+${pool.tiers[1].symbol}`)}
                    >
                      Expand
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
}
