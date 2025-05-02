import { useState, useEffect } from "react";
import type { FC } from "react";
import { useConnection, useWallet } from "@solana/wallet-adapter-react";
import { getTokenBalances } from "@/lib/solana";
import { Input } from "@/components/ui/input";
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
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">{strategy.name}</h3>
              <p className="text-muted-foreground mb-3">APY: {apy} (?)</p>
            </div>

            <div className="flex flex-col space-y-4">
              {/* Clean card UI similar to Jupiter */}
              <div className="border rounded-lg bg-slate-900 overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-end space-x-2 items-center mb-2">
                    <p className="font-medium text-sm text-gray-500">
                      {selectedTokenMint === "SOL"
                        ? tokenBalances.sol.toFixed(4)
                        : tokenBalances.tokens
                            .find((t) => t.mint === selectedTokenMint)
                            ?.balance.toFixed(4) || "0"}{" "}
                      {selectedTokenMint === "SOL"
                        ? "SOL"
                        : selectedTokenMint.slice(0, 4)}
                    </p>
                    <div className="flex space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 py-0 text-xs font-medium bg-gray-700 text-gray-400"
                        onClick={() =>
                          setTokenAmount((getMaxAmount() / 2).toString())
                        }
                      >
                        HALF
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 px-2 py-0 text-xs font-medium bg-gray-700 text-gray-400"
                        onClick={handleMaxAmount}
                      >
                        MAX
                      </Button>
                    </div>
                  </div>

                  <div className="flex justify-between items-center p-1 rounded-lg mb-2">
                    <div className="flex items-center">
                      <Select
                        value={selectedTokenMint}
                        onValueChange={handleTokenSelect}
                      >
                        <SelectTrigger className="border-0 bg-slate-800 py-2 px-3 h-auto">
                          <div className="flex items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-blue-500 flex items-center justify-center text-white">
                              $
                            </div>
                            <SelectValue
                              className="font-medium"
                              placeholder="Select a token"
                            />
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem className="py-3" value="SOL">
                            SOL
                          </SelectItem>
                          {tokenBalances.tokens.map((token) => (
                            <SelectItem
                              className="py-3"
                              key={token.mint}
                              value={token.mint}
                            >
                              {token.mint.slice(0, 4)}...
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="flex flex-col items-end">
                      <Input
                        type="number"
                        value={tokenAmount}
                        onChange={(e) => setTokenAmount(e.target.value)}
                        placeholder="0.00"
                        className="text-right border-0 bg-transparent p-0 h-auto text-3xl font-medium w-40 focus-visible:ring-0 focus-visible:ring-offset-0"
                      />
                      <span className="text-xs text-gray-400 font-medium mt-2">
                        ${0}
                      </span>
                    </div>
                  </div>
                </div>
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
