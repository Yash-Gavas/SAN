import { useWallet } from "@/lib/walletContext";
import { Button } from "@/components/ui/button";
import { Server, HardDrive, Shield } from "lucide-react";

export default function WalletBanner() {
  const { openModal } = useWallet();

  return (
    <div className="bg-gradient-to-r from-cyan-600 to-blue-600 rounded-xl p-6 text-white mb-8">
      <div className="flex flex-col md:flex-row items-center justify-between">
        <div className="mb-4 md:mb-0">
          <h2 className="text-2xl font-bold mb-2 flex items-center">
            <Server className="mr-2 h-6 w-6" />
            Welcome to SAN Manager
          </h2>
          <p className="opacity-90">Connect your host to start provisioning LUNs, managing data tiering, and configuring replication</p>
          <div className="flex items-center mt-3 space-x-4 text-sm opacity-80">
            <div className="flex items-center">
              <HardDrive className="h-4 w-4 mr-1" />
              <span>High Performance Storage</span>
            </div>
            <div className="flex items-center">
              <Shield className="h-4 w-4 mr-1" />
              <span>RAID Protected</span>
            </div>
          </div>
        </div>
        <Button
          className="bg-white text-cyan-600 hover:bg-gray-100 transition-colors duration-200"
          size="lg"
          onClick={openModal}
        >
          Connect Host
        </Button>
      </div>
    </div>
  );
}
