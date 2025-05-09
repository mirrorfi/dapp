import { Connection, VersionedTransaction } from "@solana/web3.js";
import { type SolanaAgentKit, signOrSendTX } from "solana-agent-kit";

/**
 * Lend tokens for yields using Lulo
 * @param agent SolanaAgentKit instance
 * @param amount Amount of USDC to lend
 * @returns Transaction signature
 */
export async function lendAsset(agent: SolanaAgentKit, amount: number) {
  try {

    console.log("Parameters:", {
      agent: agent,
      amount: amount,
    });

    console.log("Agent public key:", agent.wallet.publicKey.toBase58());
    
    const response = await fetch(
      `https://blink.lulo.fi/actions?amount=${amount}&symbol=USDC`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          account: agent.wallet.publicKey.toBase58(),
        }),
      },
    );

    const data = await response.json();

    // Deserialize the transaction
    const luloTxn = VersionedTransaction.deserialize(
      Buffer.from(data.transaction, "base64"),
    );

    // Get a recent blockhash and set it
    const rpc = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpc);
    const { blockhash } = await connection.getLatestBlockhash();
    luloTxn.message.recentBlockhash = blockhash;

    // return signOrSendTX(agent, luloTxn);
    return luloTxn
  } catch (error: any) {
    throw new Error(`Lending failed: ${error.message}`);
  }
}