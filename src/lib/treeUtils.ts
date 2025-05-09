import { tokenMintAddresses, LSTMintAddresses, protocolOptions } from "../constants/nodeOptions";
import { getNodeTxn } from "./getNodeTxn";
import { quoteAndBuildSwapInstructions } from "./jupiterSwapWithInstructions";
import { Connection } from "@solana/web3.js";
import type { Node, Edge } from "reactflow";

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
        
        if (currentNode.nodeType === "lst") {
          await handleSanctumProtocols(agent, currentNode, signTransaction, nodes);
        }

        if (currentNode.nodeType === "protocol") {

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

  if (!currentNode?.inputToken) {
    console.error(`Input token is not defined for node ${currentNode.nodeId}`);
    throw new Error(`Input token is not defined for node ${currentNode.nodeId}`);
  }

  console.log("Protocol parameters:", {
    "Public Key": agent.wallet.publicKey.toString(),
    "Input Token": tokenMintAddresses[currentNode?.inputToken],
    "Output Token": LSTMintAddresses[currentNode?.token],
    "Input Amount": currentNode.inputAmount,
  })

  const getLiquidityQuote = async (inputMint: string, outputLstMint: string, amount: string) => {
    try {
      // Construct the URL with query parameters

      console.log("Liquidity Quote parameters:", {
        "Input Mint": inputMint,
        "Output LST Mint": outputLstMint,
        "Amount": amount,
      })
      const url = new URL("https://sanctum-s-api.fly.dev/v1/swap/quote");
      url.searchParams.append("input", inputMint);
      url.searchParams.append("outputLstMint", outputLstMint);
      url.searchParams.append("amount", amount);
      url.searchParams.append("mode", "ExactIn");
  
      // Fetch the data from the API
      const response = await fetch(url.toString(), {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
  
      // Check if the response is successful
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      // Parse the JSON response
      const data = await response.json();
      console.log("Liquidity Quote:", data);
      return data;
    } catch (error) {
      console.error("Error fetching liquidity quote:", error);
      throw error;
    }
  };
  const lstMint = LSTMintAddresses[currentNode.token];

  const quoteData = await getLiquidityQuote(
    tokenMintAddresses[currentNode?.inputToken],
    LSTMintAddresses[currentNode?.token],
    currentNode.inputAmount.toString(),
  );

  console.log("Quote Data:", quoteData);
  
  if (!quoteData) {
    console.error(`Failed to get quote for node ${currentNode.nodeId}`);
    throw new Error(`Failed to get quote for node ${currentNode.nodeId}`);
  }

  const outAmount = parseInt(quoteData.outAmount);
  console.log("Input Amount:", currentNode.inputAmount);
  console.log("Out Amount:", outAmount);
  // Check if lstMint is a String
  if (typeof lstMint !== "string") {
    console.log("LST Mint:", lstMint);
    console.error(`LST Mint is not a string for node ${currentNode.nodeId}`);
    throw new Error(`LST Mint is not a string for node ${currentNode.nodeId}`);
  }

  // const txn = await agent.methods.sanctumAddLiquidity(
  //     lstMint,
  //     (currentNode.inputAmount).toString(),
  //     lpAmount.toString(),
  //     500, // 5%
  // )

  
  // inputLstMint: string,
  // amount: string,
  // quotedAmount: string,
  // priorityFee: number,
  // outputLstMint: string,
  
  // inputLstMint={currentNode.inputToken},
  // amount={currentNode.inputAmount},
  // outputLstMint={currentNode.token},
  // quotedAmount={lpAmount},
  // priorityFee={500},

  const txn = await agent.methods.sanctumSwapLST(
    tokenMintAddresses[currentNode.inputToken],
    currentNode.inputAmount.toString(),
    LSTMintAddresses[currentNode.token],
    outAmount.toString(),
    500, // 5%
  )

  console.log("Transaction:", txn);

  if (!txn) {
    console.error(`Failed to get transaction for node ${currentNode.nodeId}`);
    throw new Error(`Failed to get transaction for node ${currentNode.nodeId}`);
  }

  const connection = new Connection(RPC_LINK);
  const { blockhash } = await connection.getLatestBlockhash();
  console.log("Latest blockhash:", blockhash);

  const res = await connection.simulateTransaction(txn);
  console.log("Simulation result:", res);

  console.log("Transaction:", txn);
  const signed = await signTransaction(txn); // Sign the transaction
  console.log("Signed:", signed);


  // Send Transaction

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