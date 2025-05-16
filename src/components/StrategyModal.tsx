import { useState, useEffect } from "react";
import type { FC } from "react";
import Image from "next/image";
import { useWallet } from "@solana/wallet-adapter-react";
import {
  HeartIcon,
  ShareIcon,
  DocumentDuplicateIcon,
} from "@heroicons/react/24/outline";
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
  StrategyCategory,
  getCategoryStyle,
} from "@/components/strategy-dashboard/types";
import {
  LSTLogos,
  LSTMintAddresses,
  tokenLogos,
  tokenMintAddresses,
} from "@/constants/nodeOptions";
import { useAgent } from "@/lib/AgentProvider";

interface TokenAccountData {
  isNative: boolean;
  mint: string;
  owner: string;
  state: string;
  tokenAmount: {
    amount: string;
    decimals: number;
    uiAmount: number;
    uiAmountString: string;
  };
}

interface TokenBalances {
  tokens: TokenAccountData[];
  sol: number;
}

interface Strategy {
  name: string;
  creator?: string;
  description?: string;
  nodes: Node[];
  edges: Edge[];
  apy?: number;
  categories?: StrategyCategory[];
  likes?: number;
  mirrors?: number;
  shares?: number;
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
  const [isLiked, setIsLiked] = useState(false);
  const [localLikes, setLocalLikes] = useState(strategy.likes || 0);
  const { agent } = useAgent();
  const [loading, setLoading] = useState(false);
  const [tokenBalances, setTokenBalances] = useState<TokenBalances>({
    tokens: [],
    sol: 0,
  });
  const [nodeAmounts, setNodeAmounts] = useState<{ [nodeId: string]: string }>(
    {}
  );

  const getTokenMintAddress = (label: string, nodeType?: string) => {
    return label === "SOL"
      ? "So11111111111111111111111111111111111111112"
      : nodeType === "lst"
      ? LSTMintAddresses[label]
      : tokenMintAddresses[label];
  };

  // Get required input tokens from strategy graph
  const getRequiredTokens = () => {
    const sourceEdges = strategy.edges.filter((edge) => edge.source === "1");
    const requiredTokenNodes = sourceEdges
      .map((edge) => {
        const targetNode = strategy.nodes.find(
          (node) => node.id === edge.target
        );
        // Include both regular tokens and SOL nodes
        if (
          targetNode &&
          (targetNode.data.nodeType === "token" ||
            targetNode.data.label === "SOL")
        ) {
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

  const fetchTokenBalance = async (
    publicKeyStr: string,
    tokenMint: string,
    label: string
  ): Promise<TokenAccountData | null> => {
    try {
      console.log(`Fetching balance for ${label} (${tokenMint})...`);
      const response = await fetch(
        `/api/balances?pubKey=${publicKeyStr}&tokenMint=${tokenMint}`
      );
      if (!response.ok) {
        console.error(
          `Failed to fetch balance for ${label}: ${response.statusText}`
        );
        return null;
      }
      const data = await response.json();
      console.log(`Balance data for ${label}:`, data);

      // Check for API error response
      if (data.error) {
        console.error(`API error for ${label}:`, data.error);
        return null;
      }

      if (!data || !data.tokenAmount) {
        // For new token accounts that haven't been created yet, return a zero balance
        return {
          isNative: false,
          mint: tokenMint,
          owner: publicKeyStr,
          state: "initialized",
          tokenAmount: {
            amount: "0",
            decimals: 9,
            uiAmount: 0,
            uiAmountString: "0",
          },
        };
      }
      return data;
    } catch (error) {
      console.error(`Error fetching balance for ${label}:`, error);
      return null;
    }
  };

  useEffect(() => {
    const fetchBalances = async () => {
      if (!publicKey) return;

      try {
        setLoading(true);
        const requiredTokens = getRequiredTokens();
        const pubKeyStr = publicKey.toString();
        const balancePromises = requiredTokens.map(
          async ({ label, nodeType }) => {
            const tokenMintAddress = getTokenMintAddress(label, nodeType);
            if (!tokenMintAddress) {
              console.error(`No mint address found for ${label}`);
              return null;
            }
            return await fetchTokenBalance(pubKeyStr, tokenMintAddress, label);
          }
        );

        const balanceResults = await Promise.all(balancePromises);
        const validBalances = balanceResults.filter(
          (balance): balance is TokenAccountData => balance !== null
        );

        // All balances including SOL are now handled in the tokens array
        setTokenBalances({
          tokens: validBalances,
          sol: 0,
        });
      } catch (error) {
        console.error("Failed to fetch token balances:", error);
        const errorMessage =
          error instanceof Error
            ? error.message
            : "Failed to load token balances";
        toast({
          title: "Error",
          description: `${errorMessage}. Please try again.`,
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };

    fetchBalances();
  }, [publicKey]);

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

  const getFormattedBalance = (label: string, nodeType?: string) => {
    // For all tokens including SOL, find the token by mint address in the tokens array
    const tokenMintAddress = getTokenMintAddress(label, nodeType);
    const token = tokenBalances.tokens.find((t) => t.mint === tokenMintAddress);
    console.log(`Balance for ${label}:`, token?.tokenAmount);
    return token?.tokenAmount.uiAmountString || "0";
  };

  const getMaxAmount = (label: string, nodeType?: string) => {
    const tokenMintAddress = getTokenMintAddress(label, nodeType);
    const token = tokenBalances.tokens.find((t) => t.mint === tokenMintAddress);
    console.log(
      `Max amount for ${label} (${tokenMintAddress}):`,
      token?.tokenAmount
    );
    return token?.tokenAmount.uiAmount || 0;
  };

  const handleMaxAmount = (nodeId: string) => {
    const node = strategy.nodes.find((n) => n.id === nodeId);
    if (!node) return;

    const tokenLabel = node.data.label;
    setNodeAmounts((prev) => ({
      ...prev,
      [nodeId]: getMaxAmount(tokenLabel, node.data.nodeType).toString(),
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

        const nodeTokenAddress = getTokenMintAddress(
          node.data.label,
          node.data.nodeType
        );

        if (!nodeTokenAddress) {
          console.error(`Token address not found for ${node.data.label}`);
          return;
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

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-6xl border-0 border-none bg-background/65 backdrop-blur-md">
        <DialogHeader className="-mt-8 w-fit">
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
          <div className="flex flex-col justify-between -mt-4">
            <div>
              <h3 className="text-xl font-bold mb-1">{strategy.name}</h3>
              <p className="text-muted-foreground mb-3">
                APY:{" "}
                <span className="text-emerald-400">
                  {strategy.apy ? `${strategy.apy.toFixed(2)}%` : "0%"}
                </span>{" "}
              </p>
              {strategy.description && (
                <p className="text-sm text-gray-400 mb-3">
                  {strategy.description}
                </p>
              )}
              <div className="flex gap-1 flex-wrap mb-3">
                {strategy.categories?.map((category, index) => (
                  <span
                    key={index}
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getCategoryStyle(
                      category
                    )}`}
                  >
                    {category}
                  </span>
                ))}
              </div>
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
                          {getFormattedBalance(label, nodeType)} {label}
                        </p>
                        <div className="flex space-x-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 px-2 py-0 text-xs font-medium bg-gray-700 text-gray-400"
                            onClick={() =>
                              setNodeAmounts((prev) => ({
                                ...prev,
                                [id]: (
                                  getMaxAmount(label, nodeType) / 2
                                ).toString(),
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
            </div>
          </div>
        </div>

        {/* Social interaction features */}
        <div className="absolute bottom-6 left-6 flex items-center gap-6">
          <div
            onClick={(e) => {
              e.stopPropagation();
              setIsLiked(!isLiked);
              setLocalLikes((prev) => (isLiked ? prev - 1 : prev + 1));
            }}
            className={`flex items-center gap-1.5 ${
              isLiked
                ? "text-secondary hover:text-secondary/80"
                : "text-white hover:text-secondary/80"
            } transition-colors cursor-pointer`}
          >
            <HeartIcon
              className={`w-5 h-5 ${isLiked ? "fill-current" : ""} stroke-2`}
            />
            <span className="text-sm font-medium">{localLikes}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white hover:text-secondary transition-colors cursor-pointer">
            <DocumentDuplicateIcon className="w-5 h-5 stroke-2" />
            <span className="text-sm font-medium">{strategy.mirrors || 0}</span>
          </div>
          <div className="flex items-center gap-1.5 text-white hover:text-secondary transition-colors cursor-pointer">
            <ShareIcon className="w-5 h-5 stroke-2" />
            <span className="text-sm font-medium">{strategy.shares || 0}</span>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default StrategyModal;
