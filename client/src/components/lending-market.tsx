import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CryptoIcon } from "@/components/ui/crypto-icon";
import { useWallet } from "@/lib/walletContext";
import { lunProvisioningOptions } from "@/lib/mockData";
import { useToast } from "@/hooks/use-toast";

export default function LendingMarket() {
  const { isConnected, openModal } = useWallet();
  const { toast } = useToast();

  const handleProvision = (tierSymbol: string) => {
    if (!isConnected) {
      openModal();
      return;
    }

    toast({
      title: "Tier Selected",
      description: `Selected ${tierSymbol} tier for LUN provisioning`,
    });
  };

  return (
    <Card className="bg-white shadow-sm border border-gray-100">
      <CardContent className="p-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Available Storage Tiers</h3>
          <div className="text-sm text-gray-500">
            <span>Updated 1 min ago</span>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Tier</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Available (TB)</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Max IOPS</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Host Group</th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {lunProvisioningOptions.map((option, index) => (
                <tr key={`provision-option-${index}`}>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="flex items-center">
                      <CryptoIcon src={option.tier.icon} alt={option.tier.symbol} />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{option.tier.name}</div>
                        <div className="text-xs text-gray-500">{option.tier.symbol}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-mono">
                      {option.availableCapacityTB.toLocaleString()} TB
                    </div>
                    <div className="text-xs text-gray-500 font-mono">
                      ${(option.availableCapacityTB * option.tier.costPerTB / 1000).toFixed(1)}K/mo
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm bg-cyan-100 text-cyan-700 px-3 py-1 rounded-full font-semibold inline-block">{(option.maxIops / 1000).toFixed(0)}K</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">{option.hostGroup}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    <Button 
                      className="bg-cyan-600 hover:bg-cyan-700 text-white px-6 py-2 rounded-lg text-sm font-semibold shadow-sm hover:shadow transition-all duration-200"
                      onClick={() => handleProvision(option.tier.symbol)}
                    >
                      Provision
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
