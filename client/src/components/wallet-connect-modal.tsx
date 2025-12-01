import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { useWallet } from "@/lib/walletContext";
import { useState } from "react";
import { Server, Shield, HardDrive, Layers } from "lucide-react";

const hostConnectionMethods = [
  {
    name: "iSCSI Initiator",
    icon: "https://upload.wikimedia.org/wikipedia/commons/3/36/MetaMask_Fox.svg",
    description: "Standard iSCSI connection method",
    popular: true
  },
  {
    name: "Fibre Channel",
    icon: "https://walletconnect.com/images/walletconnect-logo.svg",
    description: "High-performance FC connection",
    popular: true
  },
  {
    name: "NVMe-oF",
    icon: "https://www.coinbase.com/assets/favicon.ico",
    description: "NVMe over Fabrics protocol",
    popular: true
  },
  {
    name: "SAS Direct",
    icon: "https://www.ledger.com/wp-content/uploads/2021/01/Ledger_Live_icon.svg",
    description: "Direct SAS connection to enclosure",
    popular: false
  },
  {
    name: "InfiniBand",
    icon: "https://trezor.io/static/images/favicon.ico",
    description: "High-bandwidth InfiniBand connection",
    popular: false
  },
  {
    name: "SMB/CIFS",
    icon: "https://trustwallet.com/assets/images/favicon.ico",
    description: "File-based storage protocol",
    popular: false
  }
];

export default function WalletConnectModal() {
  const { isModalOpen, closeModal, connectWallet } = useWallet();
  const [connecting, setConnecting] = useState<string | null>(null);
  const [showAll, setShowAll] = useState(false);
  
  const handleConnect = async (methodName: string) => {
    setConnecting(methodName);
    try {
      await connectWallet(methodName);
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setConnecting(null);
    }
  };
  
  const displayedMethods = showAll 
    ? hostConnectionMethods 
    : hostConnectionMethods.filter(method => method.popular);

  return (
    <Dialog open={isModalOpen} onOpenChange={closeModal}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-gray-900 flex items-center">
            <Server className="h-6 w-6 mr-2 text-cyan-600" />
            Connect Your Host
          </DialogTitle>
          <DialogDescription className="text-gray-600 mt-2">
            Connect your host to the SAN for storage provisioning, data tiering, and replication management.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-3 py-4">
          {displayedMethods.map((method) => (
            <button
              key={method.name}
              className={`w-full flex items-center justify-between p-4 rounded-lg transition-all duration-200 ${
                connecting === method.name
                  ? "bg-cyan-50 border border-cyan-200"
                  : "bg-gray-50 hover:bg-gray-100 hover:shadow-sm border border-transparent"
              }`}
              onClick={() => handleConnect(method.name)}
              disabled={connecting !== null}
            >
              <div className="flex items-center">
                <div className="flex-shrink-0 h-10 w-10 bg-cyan-100 rounded-full p-1.5 flex items-center justify-center shadow-sm">
                  <HardDrive className="h-5 w-5 text-cyan-600" />
                </div>
                <div className="ml-3 text-left">
                  <span className="font-semibold text-gray-900">{method.name}</span>
                  <p className="text-xs text-gray-500 mt-0.5">{method.description}</p>
                </div>
              </div>
              
              {connecting === method.name ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-cyan-600"></div>
              ) : (
                <i className="ri-arrow-right-line text-gray-400"></i>
              )}
            </button>
          ))}
          
          {!showAll && hostConnectionMethods.some(m => !m.popular) && (
            <button
              className="w-full text-sm text-cyan-600 hover:text-cyan-800 underline py-2"
              onClick={() => setShowAll(true)}
            >
              Show more connection types
            </button>
          )}
          
          {showAll && (
            <button
              className="w-full text-sm text-cyan-600 hover:text-cyan-800 underline py-2"
              onClick={() => setShowAll(false)}
            >
              Show fewer options
            </button>
          )}
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500 bg-gray-50 p-3 rounded-lg">
          <div className="flex items-center justify-center space-x-4 mb-2">
            <div className="flex items-center text-xs">
              <Shield className="h-3 w-3 mr-1 text-green-500" />
              <span>CHAP Authentication</span>
            </div>
            <div className="flex items-center text-xs">
              <Layers className="h-3 w-3 mr-1 text-blue-500" />
              <span>Multipath I/O</span>
            </div>
          </div>
          <p className="text-xs text-gray-400">
            Connections are secured with end-to-end encryption and access control policies.
          </p>
        </div>
      </DialogContent>
    </Dialog>
  );
}
