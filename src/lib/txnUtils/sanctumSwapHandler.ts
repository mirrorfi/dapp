import { LSTMintAddresses, tokenMintAddresses } from "@/constants/nodeOptions";
import { TreeNode } from "./treeUtils";
import { Connection } from "@solana/web3.js";
import { SuccessStyle, WaitingSignStyle, WaitingTrasactionStyle } from "@/components/ui/wallet-toast-style";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com/";

export const handleSanctumProtocols = async (agent: any, currentNode: TreeNode, signTransaction: any, nodes: Record<string, TreeNode>, toast: (props: any) => void) => {

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
  toast(WaitingSignStyle())
  const signed = await signTransaction(txn); // Sign the transaction
  console.log("Signed:", signed);


  // Send Transaction
  const signature = await connection.sendTransaction(signed, { skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("Transaction sent with signature:", signature);

  // Wait for transaction to be confirmed
  toast(WaitingTrasactionStyle())
  let txData = null;
  while (!txData) {
    console.log("Waiting for transaction...");
    await new Promise((resolve) => setTimeout(resolve, 2000)); // Wait for 2 seconds
  
    txData = await connection.getTransaction(signature, {
      commitment: "confirmed",
      maxSupportedTransactionVersion: 0,
    });
  }
  
  console.log("Transaction data:", txData);
  toast(SuccessStyle(signature))

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

  console.warn(
    `[${currentNode.inputToken}(${currentNode.inputAmount}) -> ${currentNode.token}(${postTokenBalance - preTokenBalance})] each child (${currentNode.children.length}) is ${amountPerChildNode}`
  );
  for (const childId of currentNode.children) {
    const childNode = nodes[childId];
    
    if (childNode.label === "Meteora") {
      if (!childNode.params) {
        childNode.params = {};
      }
      if (currentNode.nodeType === "token") {
        childNode.params[tokenMintAddresses[currentNode.token]] = amountPerChildNode;
      }
      if (currentNode.nodeType === "lst") {
        childNode.params[LSTMintAddresses[currentNode.token]] = amountPerChildNode;
      }
    }
    else {
      childNode.inputToken = tokenMintAddresses[currentNode.token]; // Set the input token for child nodes
      childNode.inputAmount = amountPerChildNode; // Set the input amount for child nodes
    }
  }
}