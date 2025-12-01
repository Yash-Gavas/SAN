import { useWallet } from "@/lib/walletContext";
import WalletBanner from "@/components/wallet-banner";
import LendingForm from "@/components/lending-form";
import LendingMarket from "@/components/lending-market";
import AssetPositions from "@/components/asset-positions";
import { TrendingUp, BarChart2, AlertCircle, Info, Percent } from "lucide-react";

export default function Lend() {
  const { isConnected } = useWallet();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 animate-fadeIn">
      {!isConnected && <WalletBanner />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-xl border border-blue-100">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-700 flex items-center">
            <TrendingUp className="h-8 w-8 mr-2 text-blue-600" />
            Lend Assets
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Earn passive income by lending your crypto assets to the protocol. Interest is accrued in real-time and can be withdrawn anytime.
          </p>
        </div>
        
        {isConnected && (
          <div className="mt-4 md:mt-0 flex items-center text-sm bg-blue-100 text-blue-800 px-4 py-2 rounded-full">
            <Percent className="h-4 w-4 mr-2" />
            <span className="font-medium">Average APY:</span>
            <span className="ml-2 font-bold">4.32%</span>
          </div>
        )}
      </div>
      
      {isConnected && (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-scaleIn">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
              Your Lending Positions
            </h2>
            <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full font-medium">
              Total Supplied: $5,750.00
            </div>
          </div>
          <AssetPositions activeTab="lending" />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-blue-600 px-5 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5" />
                Lend Assets
              </h3>
              <p className="text-blue-100 text-sm">
                Select an asset to lend and start earning interest
              </p>
            </div>
            <div className="p-5">
              <LendingForm />
            </div>
          </div>
          
          {/* Information Card */}
          <div className="mt-6 bg-emerald-50 border border-emerald-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-emerald-800 flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              Lending Information
            </h4>
            <ul className="text-xs text-emerald-700 space-y-2">
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                Interest is accrued automatically and can be viewed in real-time.
              </li>
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                APY rates are variable and adjust based on market supply and demand.
              </li>
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                You can withdraw your assets at any time with no lock-up period.
              </li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-blue-600" />
              Lending Market
            </h3>
            <LendingMarket />
          </div>
        </div>
      </div>
      
      {/* Education section */}
      <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-800 mb-3">How Lending Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-indigo-600 font-bold mb-2 text-sm">Step 1</div>
            <p className="text-gray-700 text-sm">Deposit your crypto assets to the lending pool</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-indigo-600 font-bold mb-2 text-sm">Step 2</div>
            <p className="text-gray-700 text-sm">Earn interest automatically while your assets are in the pool</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-indigo-600 font-bold mb-2 text-sm">Step 3</div>
            <p className="text-gray-700 text-sm">Withdraw your assets plus earned interest at any time</p>
          </div>
        </div>
      </div>
    </div>
  );
}
