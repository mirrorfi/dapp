import { Connection } from "@solana/web3.js";
import { tokenMintAddresses } from "@/constants/nodeOptions";
import { quoteAndBuildSwapInstructions } from "./jupiterSwapWithInstructions";
import { TreeNode } from "./treeUtils";
import { SolanaAgentKit } from "solana-agent-kit";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com/";

export const handleSwapping = async (agent: SolanaAgentKit, currentNode: TreeNode, signTransaction: any, nodes: Record<string, TreeNode>, toast: (props: any) => void) => {
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
      1000,
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

  // Wait for transaction to be confirmed
  toast({
    description: `Waiting for transaction confirmation...`,
  })
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
  toast({
    title: "Transaction Confirmed",
    description: `Sent with signature ${signature}}`,
    variant: "success",
  })

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
      childNode.params[currentNode.token] = amountPerChildNode;
    }
    else {
      childNode.inputToken = tokenMintAddresses[currentNode.token]; // Set the input token for child nodes
      childNode.inputAmount = amountPerChildNode; // Set the input amount for child nodes
    }
  }
}