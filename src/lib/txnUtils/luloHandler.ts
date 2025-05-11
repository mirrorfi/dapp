import { Connection, sendAndConfirmTransaction } from "@solana/web3.js";
import { TreeNode } from "./treeUtils";


const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com/";

export const handleLuloProtocols = async (agent: any, currentNode: TreeNode, signTransaction: any, nodes: Record<string, TreeNode>, toast: (props: any) => void) => {
  
  console.log("Getting Lend Transaction");
  console.log("Input Amount:", currentNode.inputAmount);

  const inputAmount = (currentNode.inputAmount / (10 ** 6)).toString(); // Convert to string


  const tx = await agent.methods.lendAsset(inputAmount);
  console.log("Lulo Lend Asset txn:", tx);

  const connection = new Connection(RPC_LINK);
  const res = await connection.simulateTransaction(tx);
  console.log("Simulation Result:", res);
  console.log(res.value.logs);

  if (!tx) {
    console.error(`Failed to get transaction for node ${currentNode.nodeId}`);
    throw new Error(`Failed to get transaction for node ${currentNode.nodeId}`);
  }
  
  const signed = await signTransaction(tx); // Sign the transaction
  console.log("Signed:", signed);
  console.log("Tx:", tx);

  // Send Transaction
  const signature = await sendAndConfirmTransaction(connection, tx, [agent.wallet], { skipPreflight: false, preflightCommitment: "confirmed" })
  // const signature = await connection.sendTransaction(signed, { skipPreflight: false, preflightCommitment: "confirmed" });
  console.log("Transaction sent with signature:", signature);

  // delay 5s
  await new Promise((resolve) => setTimeout(resolve, 2000));
  const txData = await connection.getTransaction(signature, { commitment: "confirmed", maxSupportedTransactionVersion: 0 });
  console.log("Transaction data:", txData);
  // Get balances in terms of lamports
}