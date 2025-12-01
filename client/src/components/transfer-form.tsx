import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Send, User, DollarSign } from "lucide-react";

export default function TransferForm() {
  const [recipientUsername, setRecipientUsername] = useState("");
  const [assetSymbol, setAssetSymbol] = useState("");
  const [amount, setAmount] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const transferMutation = useMutation({
    mutationFn: async (transferData: { recipientUsername: string; assetSymbol: string; amount: number }) => {
      const response = await apiRequest("POST", "/api/transfer", transferData);
      return response.json();
    },
    onSuccess: (data) => {
      toast({
        title: "Transfer Successful",
        description: data.message,
      });
      // Reset form
      setRecipientUsername("");
      setAssetSymbol("");
      setAmount("");
      // Refresh transactions
      queryClient.invalidateQueries({ queryKey: ["/api/transactions"] });
    },
    onError: (error: Error) => {
      toast({
        title: "Transfer Failed",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!recipientUsername || !assetSymbol || !amount) {
      toast({
        title: "Missing Information",
        description: "Please fill in all fields",
        variant: "destructive",
      });
      return;
    }

    const transferAmount = parseFloat(amount);
    if (isNaN(transferAmount) || transferAmount <= 0) {
      toast({
        title: "Invalid Amount",
        description: "Please enter a valid amount",
        variant: "destructive",
      });
      return;
    }

    transferMutation.mutate({
      recipientUsername,
      assetSymbol,
      amount: transferAmount
    });
  };

  return (
    <Card className="w-full max-w-md">
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Send className="h-5 w-5" />
          <span>Send Funds</span>
        </CardTitle>
        <CardDescription>
          Transfer crypto assets to another user by username
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="recipient" className="flex items-center space-x-1">
              <User className="h-4 w-4" />
              <span>Recipient Username</span>
            </Label>
            <Input
              id="recipient"
              type="text"
              placeholder="Enter username"
              value={recipientUsername}
              onChange={(e) => setRecipientUsername(e.target.value)}
              disabled={transferMutation.isPending}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="asset">Asset</Label>
            <Select value={assetSymbol} onValueChange={setAssetSymbol} disabled={transferMutation.isPending}>
              <SelectTrigger>
                <SelectValue placeholder="Select asset" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="BTC">Bitcoin (BTC)</SelectItem>
                <SelectItem value="ETH">Ethereum (ETH)</SelectItem>
                <SelectItem value="USDC">USD Coin (USDC)</SelectItem>
                <SelectItem value="USDT">Tether (USDT)</SelectItem>
                <SelectItem value="DAI">Dai (DAI)</SelectItem>
                <SelectItem value="LINK">Chainlink (LINK)</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="amount" className="flex items-center space-x-1">
              <DollarSign className="h-4 w-4" />
              <span>Amount</span>
            </Label>
            <Input
              id="amount"
              type="number"
              step="0.000001"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              disabled={transferMutation.isPending}
            />
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={transferMutation.isPending}
          >
            {transferMutation.isPending ? (
              "Sending..."
            ) : (
              <>
                <Send className="h-4 w-4 mr-2" />
                Send Transfer
              </>
            )}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}