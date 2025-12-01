import { storageSummary, sanMetrics } from "@/lib/mockData";
import { Card, CardContent } from "@/components/ui/card";
import { ArrowUpIcon, ArrowDownIcon, HardDrive, Database, Server, Activity } from "lucide-react";

export default function PortfolioOverview() {
  return (
    <div className="mb-8">
      <h2 className="text-xl font-semibold mb-4">Storage Resource Overview</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Total Capacity</p>
                <p className="text-2xl font-semibold font-mono">{storageSummary.totalCapacityTB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TB</p>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Server className="h-5 w-5 text-blue-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className={`font-medium flex items-center ${storageSummary.capacityChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {storageSummary.capacityChange24h >= 0 ? 
                  <ArrowUpIcon className="h-4 w-4 mr-1" /> : 
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                }
                {Math.abs(storageSummary.capacityChange24h)}%
              </span>
              <span className="text-gray-500 ml-2">last 24h</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Allocated Capacity</p>
                <p className="text-2xl font-semibold font-mono">{storageSummary.allocatedCapacityTB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TB</p>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <HardDrive className="h-5 w-5 text-green-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className={`font-medium flex items-center ${storageSummary.allocationChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {storageSummary.allocationChange24h >= 0 ? 
                  <ArrowUpIcon className="h-4 w-4 mr-1" /> : 
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                }
                {Math.abs(storageSummary.allocationChange24h)}%
              </span>
              <span className="text-gray-500 ml-2">last 24h</span>
            </div>
          </CardContent>
        </Card>
        
        <Card className="bg-white shadow-sm border border-gray-100">
          <CardContent className="p-5">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-gray-500 text-sm">Available Capacity</p>
                <p className="text-2xl font-semibold font-mono">{storageSummary.availableCapacityTB.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} TB</p>
              </div>
              <div className="bg-cyan-100 p-2 rounded-lg">
                <Database className="h-5 w-5 text-cyan-600" />
              </div>
            </div>
            <div className="mt-2 flex items-center text-sm">
              <span className={`font-medium flex items-center ${storageSummary.availableChange24h >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {storageSummary.availableChange24h >= 0 ? 
                  <ArrowUpIcon className="h-4 w-4 mr-1" /> : 
                  <ArrowDownIcon className="h-4 w-4 mr-1" />
                }
                {Math.abs(storageSummary.availableChange24h)}%
              </span>
              <span className="text-gray-500 ml-2">last 24h</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="bg-gradient-to-r from-slate-50 to-blue-50 shadow-sm border border-gray-100">
        <CardContent className="p-5">
          <div className="flex items-center mb-3">
            <Activity className="h-5 w-5 text-blue-600 mr-2" />
            <h3 className="text-sm font-semibold text-gray-700">Real-Time Performance Metrics</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">Total IOPS</p>
              <p className="text-lg font-bold text-blue-600 font-mono">{(sanMetrics.totalIops / 1000).toFixed(0)}K</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">Avg Latency</p>
              <p className="text-lg font-bold text-green-600 font-mono">{sanMetrics.avgLatencyMs} ms</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">Throughput</p>
              <p className="text-lg font-bold text-purple-600 font-mono">{sanMetrics.throughputGBs} GB/s</p>
            </div>
            <div className="text-center">
              <p className="text-xs text-gray-500 uppercase">Replication Lag</p>
              <p className="text-lg font-bold text-orange-600 font-mono">{sanMetrics.replicationLagMs} ms</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
