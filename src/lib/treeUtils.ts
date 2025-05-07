import { tokenMintAddresses, protocolOptions } from "../constants/nodeOptions";
import { getNodeTxn } from "./getNodeTxn";
import { quoteAndBuildSwapInstructions } from "./jupiterSwapWithInstructions";
import { Connection } from "@solana/web3.js";
import type { Node, Edge } from "reactflow";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com/";

export interface TreeNode {
  nodeId: string;
  nodeType: "deposit" | "token" | "protocol";
  label: string;
  inputToken?: string | null;
  inputAmount: number;
  token: string;
  amount?: number | null;
  parent: string;
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
      parent: "",
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
      parent: "1",
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
      parent: "2",
      children: [],
      executed: false,
    },
  };

export const generateTree = (nodes: any[], edges: any[], initialSolanaDeposit: number): Record<string, TreeNode> => {
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
      parent: "", // Will be updated later
      children: [], // Will be updated later
      executed: false, // Default to false
      params: {}, // Default to empty object
    };
  });

  // Set the first node's inputToken and inputAmount
  treeNodes["1"].inputToken = "SOL"; //
  treeNodes["1"].inputAmount = initialSolanaDeposit; // Set initial deposit amount
  treeNodes["1"].amount = initialSolanaDeposit; // Set initial deposit amount
  treeNodes["1"].token = "SOL"; // Set token type for the first node

  // Map edges to establish parent-child relationships
  edges.forEach((edge) => {
    const sourceNode = treeNodes[edge.source];
    const targetNode = treeNodes[edge.target];

    if (sourceNode && targetNode) {
      sourceNode.children.push(targetNode.nodeId); // Add target as a child of source
      targetNode.parent = sourceNode.nodeId; // Set source as the parent of target
    }
  });

  return treeNodes;
}

export const executeTree = async (nodes: Record<string, TreeNode>, agent: any, signTransaction: any) => {
  const queue: string[] = []; // Queue to process nodes
  const executed: Set<string> = new Set(); // Track executed nodes

  console.log("Initializing starting conditions")
  // First level simply pushes the children of the root node to the queue
    const currentNode = nodes["1"]; // Assuming node1 is the root node
    if (!currentNode) {
        console.error("Root node does not exist in nodes.");
        return;
    }
    console.log("Current node:", currentNode);
    if (!currentNode?.amount) {
        console.error("Root node amount does not exist in nodes.");
        return;
    }
    for (const childId of currentNode.children) {
        const childNode = nodes[childId];
        if (childNode) {
          const amountPerChildNode = Math.floor(((currentNode.amount)) / currentNode.children.length);
          console.log("NUMBER OF CHILDREN:", currentNode.children.length);
            childNode.inputToken = currentNode.token; // Set the input token for child nodes
            childNode.inputAmount = amountPerChildNode; // Set the input amount for child nodes
            console.log(childNode);
            queue.push(childId);
        } else {
            console.error(`Child node with ID ${childId} does not exist in nodes.`);
        }
    }
    
    // Process nodes using BFS
    while (queue.length > 0) {
      const currentNodeId = queue.shift()!;
      const currentNode = nodes[currentNodeId];

      // Execute the node's function
      try {
        console.log(`Getting txn of node: ${currentNode.nodeId}`);

        if (currentNode.nodeType === "token") {
          await handleSwapping(agent, currentNode, signTransaction, nodes);

        }

        if (currentNode.nodeType === "protocol") {
          if (currentNode.label.toLowerCase() === "sanctum") {
            await handleSanctumProtocols(agent, currentNode, signTransaction, nodes);
          }

          if (currentNode.label.toLowerCase() === "lula") {
            await handleLulaProtocols(agent, currentNode, signTransaction, nodes);
          }

          if (currentNode.label.toLowerCase() === "orca") {
            await handleOrcaProtocols(agent, currentNode, signTransaction, nodes);
          }
        }

        // Mark the node as executed
        currentNode.executed = true;
        executed.add(currentNodeId);

        // Enqueue child nodes
        for (const childId of currentNode.children) {
            queue.push(childId);
        }
        
    } catch (error) {
      console.error(`Error executing node ${currentNode.nodeId}:`, error);
    }
  }
};

const handleSwapping = async (agent: any, currentNode: TreeNode, signTransaction: any, nodes: Record<string, TreeNode>) => {
  console.log("Swap parameters:", {
    "Public Key": agent.wallet.publicKey.toString(),
    "Input Token": tokenMintAddresses[currentNode?.inputToken || "SOL"],
    "Output Token": tokenMintAddresses[currentNode?.token],
    "Input Amount": currentNode.inputAmount,
  })
  const result = await quoteAndBuildSwapInstructions(
      agent.wallet.publicKey,
      tokenMintAddresses[currentNode?.inputToken || "SOL"],
      tokenMintAddresses[currentNode?.token],
      currentNode.inputAmount,
      500, // 5%
  )

  if (!result) {
      console.error(`Failed to get transaction for node ${currentNode.nodeId}`);
      throw new Error(`Failed to get swap instructions for node ${currentNode.nodeId}`);
  }
  
  const { transaction: txn } = result; // Destructure the result to get the transaction and output amount

  const signed = await signTransaction(txn); // Sign the transaction
  console.log("Signed:", signed);
  console.log("Tx:", txn);


  // Send Transaction
  const connection = new Connection(RPC_LINK);
  const signature = await connection.sendTransaction(signed, { skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("Transaction sent with signature:", signature);

  // delay 5s 
  await new Promise((resolve) => setTimeout(resolve, 5000));

  const txData = await connection.getTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  console.log("Transaction data:", txData);

  // Get balances in terms of lamports
  const postTokenBalance = Number(txData?.meta?.postTokenBalances?.find(
    (balance) => (balance.mint === tokenMintAddresses[currentNode.token] && balance.owner === agent.wallet.publicKey.toString())
  )?.uiTokenAmount.amount);
  const preTokenBalance = Number(txData?.meta?.preTokenBalances?.find(
    (balance) => (balance.mint === tokenMintAddresses[currentNode.token] && balance.owner === agent.wallet.publicKey.toString())
  )?.uiTokenAmount.amount);

  if (postTokenBalance === undefined || preTokenBalance === undefined) {
      throw new Error(`Failed to get token balance for node ${currentNode.nodeId}`);
  }

  currentNode.amount = postTokenBalance - preTokenBalance; // Set the output amount for the current node
  
  const amountPerChildNode = Math.floor(((postTokenBalance - preTokenBalance)) / currentNode.children.length); // Each child node shares equal amount of the output

  for (const childId of currentNode.children) {
      const childNode = nodes[childId];
      if (childNode) {
          childNode.inputToken = currentNode.token; // Set the input token for child nodes
          childNode.inputAmount = amountPerChildNode; // Set the input amount for child nodes
      }
  }
}

const handleSanctumProtocols = async (agent: any, currentNode: TreeNode, signTransaction: any, nodes: Record<string, TreeNode>) => {

  // hardcode the currentNode.token to use Xandeum SOL
  currentNode.token = "xandSOL";


  if (!currentNode?.inputToken) {
    console.error(`Input token is not defined for node ${currentNode.nodeId}`);
    throw new Error(`Input token is not defined for node ${currentNode.nodeId}`);
  }

  console.log("Protocol parameters:", {
    "Public Key": agent.wallet.publicKey.toString(),
    "Input Token": tokenMintAddresses[currentNode?.inputToken],
    "Output Token": tokenMintAddresses[currentNode?.token],
    "Input Amount": currentNode.inputAmount,
  })

  const quote = await agent.methods.sanctumGetLSTPrice(
    [
      tokenMintAddresses[currentNode.token],
    ],
  )
  
  console.log("Quote:", quote);
  if (!quote) {
    console.error(`Failed to get quote for node ${currentNode.nodeId}`);
    throw new Error(`Failed to get quote for node ${currentNode.nodeId}`);
  }

  const lstPrice = parseInt(quote[currentNode.token]); // price in terms of solana, i.e. 1 xandSOL = ??? SOL
  console.log("LST Price:", lstPrice);
  console.log(currentNode.inputAmount, lstPrice, currentNode.inputAmount / lstPrice);
  const txn = await agent.methods.sanctumAddLiquidity(
    
    // "So11111111111111111111111111111111111111112",
    // "1000000000",
    // "1100000000",
    // 5000
    // agent,
      tokenMintAddresses[currentNode?.token],
      (currentNode.inputAmount).toString(),
      (currentNode.inputAmount / lstPrice).toString(), // amount in terms of xandSOL
      500, // 5%
  )

  if (!txn) {
    console.error(`Failed to get transaction for node ${currentNode.nodeId}`);
    throw new Error(`Failed to get transaction for node ${currentNode.nodeId}`);
  }

  console.log("Transaction:", txn);
  const signed = await signTransaction(txn); // Sign the transaction
  console.log("Signed:", signed);


  // Send Transaction
  const connection = new Connection(RPC_LINK);
  const signature = await connection.sendTransaction(signed, { skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("Transaction sent with signature:", signature);

  // delay 2s 
  await new Promise((resolve) => setTimeout(resolve, 2000));

  const txData = await connection.getTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  console.log("Transaction data:", txData);
}

const handleLulaProtocols = async (agent: any, currentNode: TreeNode, signTransaction: any, nodes: Record<string, TreeNode>) => {
}

const handleOrcaProtocols = async (agent: any, currentNode: TreeNode, signTransaction: any, nodes: Record<string, TreeNode>) => {
  
}