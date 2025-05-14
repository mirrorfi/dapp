import { useState, useEffect } from "react";
import type { FC } from "react";
import Image from "next/image";
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
import InteractiveFlow from "@/components/interactive-flow";
import type { Node, Edge } from "reactflow";
import { useToast } from "@/components/ui/use-toast";
import { generateTree, executeTree } from "@/lib/txnUtils/treeUtils";
import Moralis from "moralis";
import {
  LSTLogos,
  LSTMintAddresses,
  tokenLogos,
  tokenMintAddresses,
} from "@/constants/nodeOptions";
import { useAgent } from "@/lib/AgentProvider";
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
  description?: string;
  nodes: Node[];
  edges: Edge[];
  apy?: number;
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
  const { publicKey, signTransaction } = useWallet();
  const { agent } = useAgent();
  const { connection } = useConnection();
  const [loading, setLoading] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({
    tokens: [],
    sol: 0,
  });
  const [nodeAmounts, setNodeAmounts] = useState<{ [nodeId: string]: string }>(
    {}
  );

  // Get required input tokens from strategy graph
  const getRequiredTokens = () => {
    const sourceEdges = strategy.edges.filter((edge) => edge.source === "1");
    const requiredTokenNodes = sourceEdges
      .map((edge) => {
        const targetNode = strategy.nodes.find(
          (node) => node.id === edge.target
        );
        if (targetNode && targetNode.data.nodeType === "token") {
          return {
            id: targetNode.id,
            label: targetNode.data.label,
            nodeType: targetNode.data.nodeType,
          };
        }
        return null;
      })
      .filter(
        (node): node is { id: string; label: string; nodeType: string } =>
          node !== null
      );
    return requiredTokenNodes;
  };

  // Helper to get token label from node ID
  const getTokenLabel = (nodeId: string) => {
    const node = strategy.nodes.find((n) => n.id === nodeId);
    return node?.data.label || nodeId;
  };

  const getTokenLogo = (label: string, nodeType: string) => {
    return nodeType === "lst" ? LSTLogos[label] : tokenLogos[label];
  };

  const { toast } = useToast();

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) return;

      try {
        setLoading(true);
        const balances = await getTokenBalances(connection, publicKey);
        setTokenBalances(balances);
      } catch (error) {
        console.error("Failed to fetch token balances:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [connection, publicKey]);

  const [updatedNodes, setUpdatedNodes] = useState<Node[]>([]);

  useEffect(() => {
    // Update the nodes in the strategy with their parent labels
    const nodesWithParents = strategy.nodes.map((node) => {
      if (node.data.label === "Meteora") {
        const parentLabels = strategy.edges
          .filter((edge) => edge.target === node.id)
          .map((edge) => {
            const parentNode = strategy.nodes.find((n) => n.id === edge.source);
            return parentNode ? parentNode.data.label : null;
          })
          .filter((label): label is string => label !== null);
        return {
          ...node,
          data: {
            ...node.data,
            parentLabels,
          },
        };
      }
      return node;
    });
    setUpdatedNodes(nodesWithParents);
  }, [strategy.nodes, strategy.edges]);

  const getMaxAmount = (tokenLabel: string) => {
    if (tokenLabel === "SOL") {
      return tokenBalances.sol;
    }
    const token = tokenBalances.tokens.find((t) => t.mint === tokenLabel);
    return token?.balance || 0;
  };

  const handleMaxAmount = (nodeId: string) => {
    const tokenLabel = getTokenLabel(nodeId);
    setNodeAmounts((prev) => ({
      ...prev,
      [nodeId]: getMaxAmount(tokenLabel).toString(),
    }));
  };

  const handleConfirm = () => {
    const executeStrategy = async () => {
      // Here you would implement the actual mirroring logic
      console.log("Mirroring strategy:", strategy.name);
      console.log("Node Amounts:", nodeAmounts);
      console.log("Public Key:", publicKey?.toString());

      // Validate all token amounts
      for (const [nodeId, amount] of Object.entries(nodeAmounts)) {
        if (!amount || parseFloat(amount) <= 0) {
          const tokenLabel = getTokenLabel(nodeId);
          console.error(`Invalid amount for ${tokenLabel}`);
          return;
        }
      }

      if (!publicKey) {
        console.error("Public key is not available.");
        return;
      }

      if (!agent) {
        console.error("Agent is not available.");
        return;
      }

      const nodeIdToAmounts: Record<string, string> = {};

      for (const [nodeId, amount] of Object.entries(nodeAmounts)) {
        const node = strategy.nodes.find((n) => n.id === nodeId);
        if (!node) {
          console.error(`Node not found for ID: ${nodeId}`);
          return;
        }

        let nodeTokenAddress = "";
        if (node.data.nodeType === "token") {
          nodeTokenAddress = tokenMintAddresses[node.data.label];
        } else if (node.data.nodeType === "lst") {
          nodeTokenAddress = LSTMintAddresses[node.data.label];
        }

        const response = await Moralis.SolApi.token.getTokenMetadata({
          network: "mainnet",
          address: nodeTokenAddress,
        });

        console.log("Moralis Response:", response);

        // Access decimals from the public response object
        // @ts-expect-error: Accessing Moralis response property
        const decimals = response.jsonResponse.decimals;
        const tokenAmountAtomic = parseFloat(amount) * 10 ** parseInt(decimals);

        nodeIdToAmounts[nodeId.toString()] = tokenAmountAtomic.toString();
      }

      console.log("Node ID to Amounts:", nodeIdToAmounts);

      const treeNodes = await generateTree(
        strategy.nodes,
        strategy.edges,
        nodeIdToAmounts
      );

      toast({
        title: "Executing strategy...",
        description: `Mirroring ${strategy.name} with multiple tokens`,
        duration: 5000,
      });

      await executeTree(treeNodes, agent, signTransaction, toast);

      onClose();
    };

    executeStrategy();
  };

  const handleExit = () => {
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl border-0 border-none">
        <DialogHeader className="-mt-8">
          <DialogTitle className="text-2xl font-bold">
            Mirror Strategy
          </DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 -mt-4">
          {/* Left side: Strategy flow visualization */}
          <div className="rounded-lg p-6 min-h-[400px] h-[500px] col-span-2 relative">
            <InteractiveFlow
              nodes={updatedNodes}
              edges={strategy.edges}
              className="absolute inset-6"
            />
          </div>

          {/* Right side: Strategy details */}
          <div className="flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">{strategy.name}</h3>
              <p className="text-muted-foreground mb-2">
                APY: {strategy.apy ? `${strategy.apy.toFixed(2)}%` : "0%"} (?)
              </p>
              {strategy.description && (
                <p className="text-sm text-gray-400 mb-3">
                  Description: {strategy.description}
                </p>
              )}
            </div>

            <div className="flex flex-col space-y-4">
              {getRequiredTokens().map(({ id, label, nodeType }) => (
                <div
                  key={id}
                  className="rounded-lg bg-slate-900 overflow-hidden"
                >
                  <div className="p-4 pb-1">
                    <div className="flex justify-between items-center mb-2">
                      <div className="flex items-center gap-2">
                        <Image
                          src={getTokenLogo(label, nodeType)}
                          alt={`${label} logo`}
                          width={32}
                          height={32}
                          className="rounded-full"
                        />
                        <span className="font-medium">{label}</span>
                      </div>
                      <div className="flex items-center space-x-4">
                        <p className="font-medium text-sm text-gray-500">
                          {label === "SOL"
                            ? tokenBalances.sol.toFixed(4)
                            : tokenBalances.tokens
                                .find((t) => t.mint === label)
                                ?.balance.toFixed(4) || "0"}{" "}
                          {label}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 py-0 text-xs font-medium bg-gray-700 text-gray-400"
                            onClick={() =>
                              setNodeAmounts((prev) => ({
                                ...prev,
                                [id]: (getMaxAmount(label) / 2).toString(),
                              }))
                            }
                          >
                            HALF
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 py-0 text-xs font-medium bg-gray-700 text-gray-400"
                            onClick={() => handleMaxAmount(id)}
                          >
                            MAX
                          </Button>
                        </div>
                      </div>
                    </div>

                    <div className="flex justify-end items-center p-1 rounded-lg mb-2">
                      <div className="flex flex-col items-end">
                        <Input
                          type="number"
                          value={nodeAmounts[id] || ""}
                          onChange={(e) =>
                            setNodeAmounts((prev) => ({
                              ...prev,
                              [id]: e.target.value,
                            }))
                          }
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
              ))}

              <Button
                onClick={handleConfirm}
                className="w-full bg-blue-700 hover:bg-blue-800 text-white cursor-pointer"
                disabled={
                  Object.keys(nodeAmounts).length === 0 ||
                  Object.values(nodeAmounts).some((amount) => !amount) ||
                  loading
                }
              >
                Confirm Mirror
              </Button>
              <Button
                onClick={handleExit}
                variant="ghost"
                className="w-full cursor-pointer"
              >
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
