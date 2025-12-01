import { useState } from "react";
import { useWallet } from "@/lib/walletContext";
import WalletBanner from "@/components/wallet-banner";
import PortfolioOverview from "@/components/portfolio-overview";
import AssetPositions from "@/components/asset-positions";
import LendingForm from "@/components/lending-form";
import LendingMarket from "@/components/lending-market";
import BorrowingForm from "@/components/borrowing-form";
import BorrowingMarket from "@/components/borrowing-market";
import SwapForm from "@/components/swap-form";
import LiquidityPools from "@/components/liquidity-pools";
import TransactionsTable from "@/components/transactions-table";
import { MarketOverview } from "@/components/price-ticker";
import TransferForm from "@/components/transfer-form";
import SocialSharing from "@/components/social-sharing";
import { HardDrive, Database, RefreshCw, Clock, ChevronRight, BarChart2, ShieldCheck, Share, Server, Activity, Layers } from "lucide-react";

export default function Dashboard() {
  const { isConnected } = useWallet();
  const [activeTab, setActiveTab] = useState<"lend" | "borrow" | "swap">("lend");
  const [activePositionTab, setActivePositionTab] = useState<"lending" | "borrowing" | "liquidity">("lending");

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-cyan-50 dark:from-gray-900 dark:via-slate-900/10 dark:to-cyan-900/10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Enhanced Hero Section */}
        <div className="mb-12 text-center">
          <div className="inline-flex items-center justify-center w-24 h-24 bg-gradient-to-r from-cyan-500 via-blue-500 to-indigo-600 rounded-3xl mb-6 shadow-2xl">
            <Server className="w-12 h-12 text-white" />
          </div>
          <h1 className="text-5xl md:text-6xl font-bold bg-gradient-to-r from-cyan-600 via-blue-600 to-indigo-600 bg-clip-text text-transparent mb-4">
            SAN Management Console
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto leading-relaxed">
            Enterprise Storage Area Network management with advanced LUN provisioning, data tiering, and automated failover protection
          </p>
          <div className="flex justify-center mt-6">
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <div className="flex items-center">
                <div className="w-2 h-2 bg-green-500 rounded-full mr-2 animate-pulse"></div>
                Live Metrics
              </div>
              <div className="flex items-center">
                <ShieldCheck className="w-4 h-4 text-blue-500 mr-2" />
                RAID Protected
              </div>
              <div className="flex items-center">
                <Activity className="w-4 h-4 text-cyan-500 mr-2" />
                High Availability
              </div>
            </div>
          </div>
        </div>

        {!isConnected ? (
          <div className="max-w-4xl mx-auto">
            <WalletBanner />
          </div>
        ) : (
          <>
            {/* Enhanced Storage Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="lg:col-span-2 animate-fadeIn">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6">
                  <PortfolioOverview />
                </div>
              </div>
              <div className="animate-fadeIn">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-6">
                  <MarketOverview symbols={['NVMe', 'SSD', 'SAS', 'HDD', 'TAPE', 'CLOUD']} />
                </div>
              </div>
            </div>
          
            {/* Enhanced Storage Allocations */}
            <div className="mb-12 bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-8 animate-fadeIn">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <BarChart2 className="mr-3 h-6 w-6 text-blue-600" />
                  Storage Allocations
                </h2>
                <div className="flex space-x-1 bg-gray-100 p-1 rounded-xl">
                  {([
                    { key: "lending", label: "LUN Allocations" },
                    { key: "borrowing", label: "Storage Requests" },
                    { key: "liquidity", label: "Replication" }
                  ] as const).map((tab) => (
                    <button
                      key={tab.key}
                      onClick={() => setActivePositionTab(tab.key)}
                      className={`px-6 py-3 rounded-lg text-sm font-medium transition-all duration-200 ${
                        activePositionTab === tab.key
                          ? "bg-white text-blue-600 shadow-md"
                          : "text-gray-600 hover:text-gray-800"
                      }`}
                    >
                      {tab.label}
                    </button>
                  ))}
                </div>
              </div>
              <AssetPositions activeTab={activePositionTab} />
            </div>

            {/* Enhanced Action Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
              <div className="bg-gradient-to-br from-cyan-500 to-cyan-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold">Provision LUNs</h3>
                  <HardDrive className="h-8 w-8 opacity-80" />
                </div>
                <p className="text-cyan-100 mb-6">Allocate storage capacity from pools to host servers</p>
                <button
                  onClick={() => setActiveTab("lend")}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "lend"
                      ? "bg-white text-cyan-600 shadow-md"
                      : "bg-cyan-400/20 text-white hover:bg-cyan-400/30"
                  }`}
                >
                  Provision Storage
                </button>
              </div>

              <div className="bg-gradient-to-br from-blue-500 to-blue-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold">Request Capacity</h3>
                  <Database className="h-8 w-8 opacity-80" />
                </div>
                <p className="text-blue-100 mb-6">Request additional storage with redundancy protection</p>
                <button
                  onClick={() => setActiveTab("borrow")}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "borrow"
                      ? "bg-white text-blue-600 shadow-md"
                      : "bg-blue-400/20 text-white hover:bg-blue-400/30"
                  }`}
                >
                  Request Storage
                </button>
              </div>

              <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl shadow-xl p-8 text-white">
                <div className="flex justify-between items-start mb-6">
                  <h3 className="text-2xl font-bold">Data Tiering</h3>
                  <Layers className="h-8 w-8 opacity-80" />
                </div>
                <p className="text-indigo-100 mb-6">Migrate data between storage tiers for optimal performance</p>
                <button
                  onClick={() => setActiveTab("swap")}
                  className={`w-full py-3 rounded-xl font-medium transition-all duration-200 ${
                    activeTab === "swap"
                      ? "bg-white text-indigo-600 shadow-md"
                      : "bg-indigo-400/20 text-white hover:bg-indigo-400/30"
                  }`}
                >
                  Migrate Data
                </button>
              </div>
            </div>

            {/* Enhanced Feature Sections */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-8">
                {activeTab === "lend" && (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Available Storage Tiers</h3>
                    <LendingMarket />
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold mb-4">Quick Provision</h4>
                      <LendingForm />
                    </div>
                  </>
                )}
                {activeTab === "borrow" && (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Storage Request Options</h3>
                    <BorrowingMarket />
                    <div className="mt-8">
                      <h4 className="text-lg font-semibold mb-4">Quick Request</h4>
                      <BorrowingForm />
                    </div>
                  </>
                )}
                {activeTab === "swap" && (
                  <>
                    <h3 className="text-2xl font-bold text-gray-800 mb-6">Data Migration</h3>
                    <SwapForm />
                  </>
                )}
              </div>

              <div className="space-y-8">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Storage Pools</h3>
                  <LiquidityPools />
                </div>
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-8">
                  <h3 className="text-xl font-bold text-gray-800 mb-6">Data Transfer</h3>
                  <TransferForm />
                </div>
              </div>
            </div>

            {/* Enhanced Sharing Section */}
            <div className="bg-gradient-to-r from-green-50 to-emerald-50 dark:from-green-900/10 dark:to-emerald-900/10 rounded-2xl shadow-lg border border-green-100/50 p-8 mb-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Share className="mr-3 h-6 w-6 text-green-600" />
                  Share Storage Reports
                </h2>
              </div>
              <SocialSharing 
                portfolioValue={2500}
                totalProfit={500}
                profitPercentage={25}
              />
            </div>

            {/* Enhanced Recent Operations */}
            <div className="bg-white/80 backdrop-blur-sm rounded-2xl shadow-lg border border-gray-100/50 p-8 mb-12">
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-bold text-gray-800 flex items-center">
                  <Clock className="mr-3 h-6 w-6 text-blue-600" />
                  Recent Storage Operations
                </h2>
                <button className="text-sm font-medium text-blue-600 hover:text-blue-800 flex items-center transition-colors">
                  View All <ChevronRight className="h-4 w-4 ml-1" />
                </button>
              </div>
              <TransactionsTable limit={4} showViewAll={true} />
            </div>
          </>
        )}
      </div>
    </div>
  );
}
