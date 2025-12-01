import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CryptoIcon } from "@/components/ui/crypto-icon";
import { useWallet } from "@/lib/walletContext";
import { storageRequestOptions } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";
import { Database, AlertCircle } from "lucide-react";

export default function BorrowingMarket() {
  const { isConnected, openModal } = useWallet();
  const { toast } = useToast();

  const handleRequest = (tierSymbol: string) => {
    if (!isConnected) {
      openModal();
      return;
    }

    toast({
      title: "Tier Selected",
      description: `Selected ${tierSymbol} tier for storage request`,
    });
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-gray-900 flex items-center">
            <Database className="h-5 w-5 mr-1 text-blue-600" />
            Storage Request Options
          </h3>
          <div className="text-sm text-green-600 bg-green-50 px-3 py-1 rounded-full">
            <span>Updated 1 min ago</span>
          </div>
        </div>

        {!isConnected && (
          <div className="mb-6 bg-blue-50 border border-blue-200 rounded-lg p-4 flex items-center">
            <AlertCircle className="h-5 w-5 text-blue-600 mr-2 flex-shrink-0" />
            <div className="flex-1">
              <p className="text-blue-700 text-sm font-medium">Connect your host to request storage</p>
              <p className="text-blue-600 text-xs mt-1">Unlock access to storage allocation by connecting your host</p>
            </div>
            <Button 
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium ml-4"
              onClick={() => openModal()}
            >
              Connect Host
            </Button>
          </div>
        )}

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-blue-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Storage Tier</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Available (TB)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Utilization</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Redundancy Req.</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Host Group</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-blue-700 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {storageRequestOptions.map((option, index) => (
                <tr key={`storage-request-${index}`} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="h-10 w-10 flex-shrink-0">
                        <CryptoIcon src={option.tier.icon} alt={option.tier.symbol} />
                      </div>
                      <div className="ml-4">
                        <div className="text-sm font-semibold text-gray-900">{option.tier.name}</div>
                        <div className="text-xs text-gray-500">{option.tier.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium font-mono">
                      {option.availableTB.toLocaleString()} TB
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      ${(option.availableTB * option.tier.costPerTB / 1000).toFixed(1)}K/mo
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                        <div 
                          className={`h-2 rounded-full ${
                            option.utilizationRate > 80 ? 'bg-red-500' : 
                            option.utilizationRate > 60 ? 'bg-yellow-500' : 'bg-green-500'
                          }`}
                          style={{ width: `${option.utilizationRate}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium">{option.utilizationRate}%</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-semibold bg-cyan-50 text-cyan-700 px-4 py-1.5 rounded-full inline-block shadow-sm">
                      {option.redundancyRequired}%
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {option.hostGroup}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button 
                      className={`bg-blue-600 hover:bg-blue-700 text-white font-semibold px-6 py-2.5 rounded-lg shadow-sm hover:shadow-md transition-all duration-200 ${!isConnected ? 'opacity-80' : ''}`}
                      onClick={() => isConnected ? handleRequest(option.tier.symbol) : openModal()}
                    >
                      Request
                    </Button>
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
