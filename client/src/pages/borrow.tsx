import { useWallet } from "@/lib/walletContext";
import WalletBanner from "@/components/wallet-banner";
import BorrowingForm from "@/components/borrowing-form";
import BorrowingMarket from "@/components/borrowing-market";
import AssetPositions from "@/components/asset-positions";
import { DollarSign, BarChart2, AlertCircle, Info, Shield } from "lucide-react";

export default function Borrow() {
  const { isConnected } = useWallet();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-4 md:py-6 animate-fadeIn">
      {!isConnected && <WalletBanner />}
      
      <div className="flex flex-col md:flex-row md:items-center justify-between mb-6 bg-gradient-to-r from-purple-50 to-indigo-50 p-6 rounded-xl border border-purple-100">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-700 to-indigo-700 flex items-center">
            <DollarSign className="h-8 w-8 mr-2 text-purple-600" />
            Borrow Assets
          </h1>
          <p className="text-gray-600 max-w-2xl">
            Use your crypto as collateral to borrow stable coins and other assets. Maintain a healthy collateral ratio to avoid liquidation.
          </p>
        </div>
        
        {isConnected && (
          <div className="mt-4 md:mt-0 flex items-center text-sm bg-purple-100 text-purple-800 px-4 py-2 rounded-full">
            <Shield className="h-4 w-4 mr-2" />
            <span className="font-medium">Collateral Health:</span>
            <span className="ml-2 font-bold text-green-600">Excellent</span>
          </div>
        )}
      </div>
      
      {isConnected && (
        <div className="mb-8 bg-white rounded-xl shadow-sm border border-gray-100 p-5 animate-scaleIn">
          <div className="flex justify-between items-center mb-5">
            <h2 className="text-xl font-bold text-gray-800 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-purple-600" />
              Your Borrowed Assets
            </h2>
            <div className="text-sm text-purple-600 bg-purple-50 px-3 py-1 rounded-full font-medium">
              Total Borrowed: $2,450.00
            </div>
          </div>
          <AssetPositions activeTab="borrowing" />
        </div>
      )}
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
            <div className="bg-purple-600 px-5 py-4">
              <h3 className="text-lg font-bold text-white flex items-center">
                <DollarSign className="mr-2 h-5 w-5" />
                Borrow Assets
              </h3>
              <p className="text-purple-100 text-sm">
                Select an asset to borrow and provide collateral
              </p>
            </div>
            <div className="p-5">
              <BorrowingForm />
            </div>
          </div>
          
          {/* Risk Information Card */}
          <div className="mt-6 bg-amber-50 border border-amber-100 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-amber-800 flex items-center mb-2">
              <AlertCircle className="h-4 w-4 mr-2" />
              Borrowing Risk Information
            </h4>
            <ul className="text-xs text-amber-700 space-y-2">
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                If your collateral value drops below the required ratio, your position may be liquidated.
              </li>
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                You'll pay interest on your borrowed assets. Rates are variable and adjust with market conditions.
              </li>
              <li className="flex">
                <Info className="h-3 w-3 mr-2 flex-shrink-0 mt-0.5" />
                Maintain a healthy buffer above the minimum collateral ratio to avoid liquidation during market volatility.
              </li>
            </ul>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 h-full">
            <h3 className="text-xl font-bold text-gray-800 mb-5 flex items-center">
              <BarChart2 className="mr-2 h-5 w-5 text-purple-600" />
              Borrowing Market
            </h3>
            <BorrowingMarket />
          </div>
        </div>
      </div>
      
      {/* Education section */}
      <div className="mt-8 bg-indigo-50 rounded-xl p-6 border border-indigo-100">
        <h3 className="text-lg font-bold text-indigo-800 mb-3">How Borrowing Works</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-indigo-600 font-bold mb-2 text-sm">Step 1</div>
            <p className="text-gray-700 text-sm">Deposit collateral to back your loan</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-indigo-600 font-bold mb-2 text-sm">Step 2</div>
            <p className="text-gray-700 text-sm">Borrow assets against your collateral up to your available limit</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm border border-indigo-100">
            <div className="text-indigo-600 font-bold mb-2 text-sm">Step 3</div>
            <p className="text-gray-700 text-sm">Repay your loan at any time to retrieve your collateral</p>
          </div>
        </div>
      </div>
    </div>
  );
}
