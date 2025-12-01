import { CryptoIcon } from "@/components/ui/crypto-icon";
import { 
  lunAllocations, 
  storageRequests,
  replicationPositions
} from "@/lib/mockData";
import { Button } from "@/components/ui/button";
import { DualCryptoIcon } from "./ui/crypto-icon";

interface AssetPositionsProps {
  activeTab: "lending" | "borrowing" | "liquidity";
}

export default function AssetPositions({ activeTab }: AssetPositionsProps) {
  return (
    <div className="overflow-x-auto">
      {activeTab === "lending" && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage Tier</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity (TB)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Utilization</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Used (TB)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RAID</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {lunAllocations.map((allocation, index) => (
              <tr key={`allocation-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CryptoIcon src={allocation.tier.icon} alt={allocation.tier.symbol} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{allocation.tier.name}</div>
                      <div className="text-xs text-gray-500">{allocation.tier.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium font-mono">{allocation.capacityTB} TB</div>
                  <div className="text-xs text-gray-500 font-mono">{allocation.iopsAllocated.toLocaleString()} IOPS</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className={`h-2 rounded-full ${
                          allocation.utilizationPercent > 80 ? 'bg-red-500' : 
                          allocation.utilizationPercent > 60 ? 'bg-yellow-500' : 'bg-green-500'
                        }`}
                        style={{ width: `${allocation.utilizationPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{allocation.utilizationPercent}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono">{allocation.usedTB} TB</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded font-medium">{allocation.raidType}</span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="bg-cyan-600 text-white px-4 py-1.5 rounded-lg hover:bg-cyan-700 transition-colors mr-2 text-sm font-semibold">Expand</button>
                  <button className="bg-orange-600 text-white px-4 py-1.5 rounded-lg hover:bg-orange-700 transition-colors text-sm font-semibold">Migrate</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === "borrowing" && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Storage Tier</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Requested</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Allocated</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Redundancy Tier</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Health Factor</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {storageRequests.map((request, index) => (
              <tr key={`request-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CryptoIcon src={request.tier.icon} alt={request.tier.symbol} />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">{request.tier.name}</div>
                      <div className="text-xs text-gray-500">{request.tier.symbol}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium font-mono">{request.requestedTB} TB</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm bg-green-100 text-green-800 px-3 py-1 rounded-full font-semibold inline-block">{request.allocatedTB} TB</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <CryptoIcon src={request.redundancyTier.icon} alt={request.redundancyTier.symbol} size={6} />
                    <div className="ml-2 text-sm font-mono">
                      {request.redundancyCapacityTB} TB {request.redundancyTier.symbol}
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className={`text-sm font-medium ${
                    request.healthFactor > 1.5 ? 'text-green-600' : 
                    request.healthFactor > 1.1 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {request.healthFactor.toFixed(1)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 mr-2">Deallocate</button>
                  <button className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200">Add Redundancy</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {activeTab === "liquidity" && (
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Replication Pair</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Capacity (TB)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sync Status</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">RPO (min)</th>
              <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {replicationPositions.map((position, index) => (
              <tr key={`replication-${index}`}>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <DualCryptoIcon 
                      src1={position.sourceTier.icon} 
                      src2={position.targetTier.icon} 
                      alt1={position.sourceTier.symbol} 
                      alt2={position.targetTier.symbol}
                    />
                    <div className="ml-4">
                      <div className="text-sm font-medium text-gray-900">
                        {position.sourceTier.symbol} → {position.targetTier.symbol}
                      </div>
                      <div className="text-xs text-gray-500">Synchronous Replication</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-mono">{position.capacityTB} TB</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="w-16 bg-gray-200 rounded-full h-2 mr-2">
                      <div 
                        className="bg-green-500 h-2 rounded-full"
                        style={{ width: `${position.syncPercent}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium text-green-600">{position.syncPercent}%</span>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-semibold inline-block">{position.rpo} min</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200 mr-2">Stop</button>
                  <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-semibold shadow-sm hover:shadow-md transition-all duration-200">Failover</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
