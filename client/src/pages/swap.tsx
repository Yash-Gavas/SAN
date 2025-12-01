import { useWallet } from "@/lib/walletContext";
import WalletBanner from "@/components/wallet-banner";
import SwapForm from "@/components/swap-form";
import LiquidityPools from "@/components/liquidity-pools";
import AssetPositions from "@/components/asset-positions";
import { RefreshCw, BarChart2, AlertCircle, Info, TrendingDown, ArrowRightLeft, Zap } from "lucide-react";

export default function Swap() {
  const { isConnected } = useWallet();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 animate-fadeIn">
      {!isConnected && <WalletBanner />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-gradient-to-r from-emerald-50 to-teal-50 p-6 rounded-xl border border-emerald-100">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-700 flex items-center">
            <ArrowRightLeft className="h-8 w-8 mr-2 text-emerald-600" />
            Swap Tokens
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Instantly trade one token for another with optimal rates and low slippage. Access deep liquidity from decentralized pools.
          </p>
        </div>
        
        {isConnected && (
          <div className="mt-4 md:mt-0 flex items-center text-sm bg-emerald-100 text-emerald-800 px-4 py-2 rounded-full">
            <Zap className="h-4 w-4 mr-2" />
            <span className="font-medium">Best Price Routing</span>
            <span className="ml-2 font-bold">Active</span>
          </div>
        )}
      </div>
      
      {isConnected && (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-scaleIn">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-emerald-600" />
              Your Liquidity Positions
            </h2>
            <div className="text-sm text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full font-medium">
              Total Liquidity: $3,250.00
            </div>
          </div>
          <AssetPositions activeTab="liquidity" />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-emerald-600 px-5 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <RefreshCw className="mr-2 h-5 w-5" />
                Swap Tokens
              </h3>
              <p className="text-emerald-100 text-sm">
                Exchange one token for another at the best rates
              </p>
            </div>
            <div className="p-5">
              <SwapForm />
            </div>
          </div>
          
          {/* Information Card */}
          <div className="mt-6 bg-teal-50 border border-teal-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-teal-800 flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              Swap Information
            </h4>
            <ul className="text-xs text-teal-700 space-y-2">
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                Our smart routing finds the best prices across multiple liquidity sources.
              </li>
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                Swaps are subject to price slippage depending on market conditions.
              </li>
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                A small fee is applied to each swap to reward liquidity providers.
              </li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-emerald-600" />
              Popular Liquidity Pools
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              Provide liquidity to earn trading fees and rewards. The most popular pools are listed below.
            </p>
            <LiquidityPools />
          </div>
        </div>
      </div>
      
      {/* Advanced Features Section */}
      <div className="mt-8 bg-teal-50 rounded-xl p-6 border border-teal-100">
        <h3 className="text-lg font-bold text-teal-800 mb-3">Advanced Trading Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-teal-100">
            <div className="text-emerald-600 font-bold mb-2 text-sm flex items-center">
              <TrendingDown className="h-4 w-4 mr-1" />
              Limit Orders
            </div>
            <p className="text-gray-700 text-sm">Set a price to buy or sell automatically when conditions are met</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-teal-100">
            <div className="text-emerald-600 font-bold mb-2 text-sm flex items-center">
              <Zap className="h-4 w-4 mr-1" />
              Flash Swaps
            </div>
            <p className="text-gray-700 text-sm">Borrow assets with zero upfront capital for arbitrage opportunities</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-teal-100">
            <div className="text-emerald-600 font-bold mb-2 text-sm flex items-center">
              <RefreshCw className="h-4 w-4 mr-1" />
              Auto-Compounding
            </div>
            <p className="text-gray-700 text-sm">Automatically reinvest your earned fees to maximize returns</p>
          </div>
        </div>
      </div>
    </div>
  );
}
