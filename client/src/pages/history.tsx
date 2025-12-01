import { useWallet } from "@/lib/walletContext";
import WalletBanner from "@/components/wallet-banner";
import TransactionsTable from "@/components/transactions-table";

export default function History() {
  const { isConnected } = useWallet();

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {!isConnected ? (
        <WalletBanner />
      ) : (
        <div>
          <h1 className="text-2xl font-bold mb-6">Transaction History</h1>
          <TransactionsTable />
        </div>
      )}
    </div>
  );
}
