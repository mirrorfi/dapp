import { tokenMintAddresses, LSTMintAddresses, protocolOptions } from "../../constants/nodeOptions";
import { getNodeTxn } from "../getNodeTxn";
import { quoteAndBuildSwapInstructions } from "./jupiterSwapWithInstructions";
import { Connection, sendAndConfirmTransaction } from "@solana/web3.js";
import type { Node, Edge } from "reactflow";
import { handleSwapping } from "./jupiterSwapHandler";
import { handleSanctumProtocols } from "./sanctumSwapHandler";
import { handleLuloProtocols } from "./luloHandler";
import { handleOrcaProtocols } from "./orcaHandler";
import { handleMeteoraProtocol } from "./meteoraHandler";
import { TransactionFailedStyle } from "@/components/ui/wallet-toast-style";
import Moralis from "moralis";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com/";
const connection = new Connection(RPC_LINK);

export interface TreeNode {
  nodeId: string;
  nodeType: "deposit" | "token" | "protocol" | "lst";
  label: string;
  inputToken?: string | null;
  inputAmount: number;
  token: string;
  amount?: number | null;
  parents: string[];
  children: string[];
  executed: boolean;
  params?: Record<string, any>;
}

export const nodeSamples: Record<string, TreeNode> = {
    "1": {
      nodeId: "1",
      nodeType: "token",
      label: "",
      inputToken: "SOL",
      inputAmount: 10000000,
      token: "SOL",
      amount: 10000000,
      parents: [],
      children: ["2"],
      executed: false,
    },
    "2": {
      nodeId: "2",
      nodeType: "token",
      label: "",
      inputToken: null,
      inputAmount: 0,
      token: "JupSOL",
      amount: null,
      parents: ["1"],
      children: ["3"],
      executed: false,
      params: { priorityFee: 5000 },
    },
    "3": {
      nodeId: "3",
      nodeType: "token",
      label: "",
      inputToken: null,
      inputAmount: 0,
      token: "USDC",
      amount: null,
      parents: ["2"],
      children: [],
      executed: false,
    },
  };

export const generateTree = async(nodes: any[], edges: any[], initialAmounts: Record<string, string>): Record<string, TreeNode> => {
  const treeNodes: Record<string, TreeNode> = {};

  // Initialize all nodes
  nodes.forEach((node) => {
    treeNodes[node.id] = {
      nodeId: node.id,
      nodeType: node.data.nodeType, // Map nodeType
      label: node.data.label || "",
      inputToken: null, // Default to null
      inputAmount: 0, // Default to 0
      token: node.data.label || "", // Use label as token for simplicity
      amount: null, // Default to null
      parents: [], // Will be updated later
      children: [], // Will be updated later
      executed: false, // Default to false
      params: {}, // Default to empty object
    };
  });

  // Map edges to establish parent-child relationships
  edges.forEach((edge) => {
    const sourceNode = treeNodes[edge.source];
    const targetNode = treeNodes[edge.target];

    if (sourceNode && targetNode) {
      sourceNode.children.push(targetNode.nodeId); // Add target as a child of source
      targetNode.parents.push(sourceNode.nodeId); // Set source as the parent of target
    }
  });

  // Set the input amounts and amount for lvl 1 nodes
  for (const [nodeId, amount] of Object.entries(initialAmounts)) {
    const treeNode = treeNodes[nodeId];
    treeNode.inputAmount = Number(amount); // Set the input token for the node
    treeNode.amount = Number(amount); // Set the amount for the node
  }

  // Set the lvl 1's child nodes tokens and amounts
  const rootNode = treeNodes["1"]; // Assuming node1 is the root node
  // Iterate through root's children
  for (const firstLayerNodeId of rootNode.children) {
    const firstLayerNode = treeNodes[firstLayerNodeId];

    // Iterated through root's grandchildren
    for (const secondLayerNodeId of firstLayerNode.children) {
      const secondLayerNode = treeNodes[secondLayerNodeId];
      const amountPerChildNode = Math.floor((firstLayerNode.amount || 0) / firstLayerNode.children.length);

      if (secondLayerNode.label === "Meteora") {
        if (!secondLayerNode.params) {
          secondLayerNode.params = {};
        }
        
        if (firstLayerNode.nodeType === "token") {
          secondLayerNode.params[tokenMintAddresses[firstLayerNode.token]] = amountPerChildNode;
        }
        if (firstLayerNode.nodeType === "lst") {
          secondLayerNode.params[LSTMintAddresses[firstLayerNode.token]] = amountPerChildNode;
        }
        
      } else {
        secondLayerNode.inputToken = firstLayerNode.token; // Set the input token for child nodes
        secondLayerNode.inputAmount = amountPerChildNode; // Set the input amount for child nodes
      }
    }
  }
  return treeNodes;
}

export const executeTree = async (nodes: Record<string, TreeNode>, agent: any, signTransaction: any, toast: (props: any) => void) => {
  const queue: string[] = []; // Queue to process nodes
  const executed: Set<string> = new Set(); // Track executed nodes

  console.log("Initializing starting conditions")
  // First level simply pushes the children of the root node to the queue
  const rootNode = nodes["1"]; // Assuming node1 is the root node
  if (!rootNode) {
      console.error("Root node does not exist in nodes.");
      return;
  }
  console.log("Root node:", rootNode);

  // Queue the root's grandchildren
  for (const firstLayerNodeId of rootNode.children) {
    const firstLayerNode = nodes[firstLayerNodeId];

    // Iterated through root's grandchildren
    for (const secondLayerNodeId of firstLayerNode.children) {
      const secondLayerNode = nodes[secondLayerNodeId];
      if (secondLayerNode) {
        queue.push(secondLayerNodeId);
      }
    }
  }

  
  // Process nodes using BFS
  while (queue.length > 0) {
    const currentNodeId = queue.shift()!;
    const currentNode = nodes[currentNodeId];

    if (currentNode.executed) {
      console.log(`Node ${currentNode.nodeId} already executed`);
      continue
    }

    // Execute the node's function
    try {
      console.log(`Processing node: ${currentNode.nodeId} (${nodes[currentNode.parents[0]]?.token} -> ${currentNode.token})`);
      toast({
        description: `Processing: ${nodes[currentNode.parents[0]]?.token} -> ${currentNode.token}`,
        variant: "wallet",
        className: "bg-[#121212] border-[#1e1e1e] text-white",
      })
      let retryCount = 0;
      const maxRetries = 2;
      let success = false;

      while (!success && retryCount < maxRetries) {
        try {
          if (currentNode.nodeType === "token") {
            await handleSwapping(agent, currentNode, signTransaction, nodes, toast);

          }
          
          if (currentNode.nodeType === "lst") {
            await handleSanctumProtocols(agent, currentNode, signTransaction, nodes, toast);
          }

          if (currentNode.nodeType === "protocol") {

            if (currentNode.label.toLowerCase() === "lulo") {
              await handleLuloProtocols(agent, currentNode, signTransaction, nodes, toast);
            }

            if (currentNode.label.toLowerCase() === "orca") {
              await handleOrcaProtocols(agent, currentNode, signTransaction, nodes, toast);
            }

            if (currentNode.label.toLowerCase() === "meteora") {
              await handleMeteoraProtocol(agent, currentNode, signTransaction, nodes, toast);
            }
          }

          success = true; // Mark success if no error occurs
        } catch (error: any) {
          retryCount++;
          console.error(`Error during transaction attempt ${retryCount}:`, error.message);
    
          // Check if the error is a "Transaction simulation failed"
          if (error.message.includes("Transaction simulation failed")) {
            console.warn("Simulation failed, retrying...");
          }
          else if (error.message.includes("Transaction signature verification failure")) {
            console.warn("Transaction signature verification failure, retrying...");
          }
          else {
            console.error("Unexpected error, not retrying.");
            throw error; // Re-throw unexpected errors
          }
    
          if (retryCount > maxRetries) {
            console.error("Max retries reached. Moving on...");
            throw new Error(`Failed to send transaction after ${maxRetries + 1} attempts.`);
          }
        }
      }

      // Mark the node as executed
      currentNode.executed = true;
      executed.add(currentNodeId);

      // Enqueue child nodes
      for (const childId of currentNode.children) {
          queue.push(childId);
      }

      // wait 1 second
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for 1 second before moving onto next node
      
    } catch (error) {
      toast(TransactionFailedStyle(String(error)))
      console.error(`Error executing node ${currentNode.nodeId}:`, error);
    }

    console.log("Executed nodes:", nodes)
  }
}

