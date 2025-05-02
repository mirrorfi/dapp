import { useState, useEffect } from "react";
import type { FC } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getTokenBalances } from "@/lib/solana";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import SimplifiedFlow from "@/components/simplified-flow";
import type { Node, Edge } from "reactflow";

interface TokenBalance {
  mint: string;
  balance: number;
  decimals: number;
}

interface TokenBalances {
  tokens: TokenBalance[];
  sol: number;
}

interface Strategy {
  name: string;
  creator?: string;
  nodes: Node[];
  edges: Edge[];
}

interface StrategyModalProps {
  strategy: Strategy;
  isOpen: boolean;
  onClose: () => void;
}

const StrategyModal: FC<StrategyModalProps> = ({
  strategy,
  isOpen,
  onClose,
}) => {
  const { connection } = useConnection();
  const { publicKey } = useWallet();
  const [loading, setLoading] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({
    tokens: [],
    sol: 0,
  });
  const [selectedTokenMint, setSelectedTokenMint] = useState("");
  const [tokenAmount, setTokenAmount] = useState("");
  const apy = "25%";

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) return;

      try {
        setLoading(true);
        const balances = await getTokenBalances(connection, publicKey);
        setTokenBalances(balances);
        // Set SOL as default selected token
        setSelectedTokenMint("SOL");
      } catch (error) {
        console.error("Failed to fetch token balances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [connection, publicKey]);

  const getMaxAmount = () => {
    if (selectedTokenMint === "SOL") {
      return tokenBalances.sol;
    }
    const token = tokenBalances.tokens.find(
      (t) => t.mint === selectedTokenMint
    );
    return token?.balance || 0;
  };

  const handleMaxAmount = () => {
    setTokenAmount(getMaxAmount().toString());
  };

  const handleTokenSelect = (mint: string) => {
    setSelectedTokenMint(mint);
    setTokenAmount("");
  };

  const handleConfirm = () => {
    // Here you would implement the actual mirroring logic
    console.log("Mirroring strategy:", strategy.name);
    console.log("Token:", selectedTokenMint, "Amount:", tokenAmount);
    onClose();
  };

  const handleExit = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Mirror Strategy
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Left side: Strategy flow visualization */}
          <div className="border rounded-lg p-6 min-h-[400px] h-[500px] col-span-2 relative">
            <SimplifiedFlow
              nodes={strategy.nodes}
              edges={strategy.edges}
              className="absolute inset-6"
            />
          </div>

          {/* Right side: Strategy details */}
          <div className="flex flex-col space-y-4 col-span-1">
            <div className="border rounded-lg p-4 bg-muted/30">
              <h3 className="text-xl font-semibold mb-2">{strategy.name}</h3>
              <p className="text-sm text-muted-foreground">APY: {apy} (?)</p>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Select Token</Label>
                <Select
                  value={selectedTokenMint}
                  onValueChange={handleTokenSelect}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a token" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SOL">
                      SOL ({tokenBalances.sol.toFixed(4)})
                    </SelectItem>
                    {tokenBalances.tokens.map((token) => (
                      <SelectItem key={token.mint} value={token.mint}>
                        {token.mint.slice(0, 4)}... ({token.balance.toFixed(4)})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label>Amount</Label>
                  <button
                    onClick={handleMaxAmount}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    Max: {getMaxAmount().toFixed(4)}
                  </button>
                </div>
                <Input
                  type="number"
                  value={tokenAmount}
                  onChange={(e) => setTokenAmount(e.target.value)}
                  placeholder="Enter amount"
                  min="0"
                  max={getMaxAmount()}
                  step="0.000001"
                />
              </div>

              <Button
                onClick={handleConfirm}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white"
                disabled={!selectedTokenMint || !tokenAmount || loading}
              >
                Confirm Mirror
              </Button>
              <Button onClick={handleExit} variant="outline" className="w-full">
                Exit Strategy
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrategyModal;
