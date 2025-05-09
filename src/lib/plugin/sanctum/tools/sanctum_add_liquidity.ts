import {
  Connection,
  TransactionInstruction,
  TransactionMessage,
  VersionedTransaction,
} from "@solana/web3.js";
import axios from "redaxios";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import { SANCTUM_TRADE_API_URI } from "../constants";

/**
 * Add Liquidity to a Sanctum infinite-LST pool
 * @param agent SolanaAgentKit instance
 * @param lstMint mint address of the LST
 * @param amount amount of LST to add
 * @param quotedAmount amount of the INF token to mint
 * @param priorityFee priority fee for the transaction
 * @return transaction signature
 */

export async function sanctumAddLiquidity(
  agent: SolanaAgentKit,
  lstMint: string,
  amount: string,
  quotedAmount: string,
  priorityFee: number,
) {
  try {
    const client = axios.create({
      baseURL: SANCTUM_TRADE_API_URI,
    });

    console.log("Adding liquidity to Sanctum pool...");
    console.log("Parameters:", {
      lstMint,
      amount,
      quotedAmount,
      priorityFee,
    });

    const response = await client.post("/v1/liquidity/add", {
      amount,
      dstLstAcc: null,
      lstMint,
      priorityFee: {
        Auto: {
          max_unit_price_micro_lamports: priorityFee,
          unit_limit: 300000,
        },
      },
      quotedAmount,
      signer: agent.wallet.publicKey.toString(),
      srcLstAcc: null,
    });

    console.log("Response from Sanctum:", response.data);

    const txBuffer = Buffer.from(response.data.tx, "base64");

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_LINK;
    if (!rpcUrl) {
      throw new Error("RPC link is not defined");
    }
    const connection = new Connection(rpcUrl)
    const { blockhash } = await connection.getLatestBlockhash();

    const tx = VersionedTransaction.deserialize(txBuffer);

    const messages = tx.message;

    const instructions = messages.compiledInstructions.map((ix) => {
      return new TransactionInstruction({
        programId: messages.staticAccountKeys[ix.programIdIndex],
        keys: ix.accountKeyIndexes.map((i) => ({
          pubkey: messages.staticAccountKeys[i],
          isSigner: messages.isAccountSigner(i),
          isWritable: messages.isAccountWritable(i),
        })),
        data: Buffer.from(ix.data as any, "base64"),
      });
    });

    const newMessage = new TransactionMessage({
      payerKey: agent.wallet.publicKey,
      recentBlockhash: blockhash,
      instructions,
    }).compileToV0Message();

    const newTx = new VersionedTransaction(newMessage);

    console.log("Internal transaction:", newTx);

    return newTx
    // return await signOrSendTX(agent, newTx);
  } catch (error: any) {
    throw new Error(`Failed to add liquidity: ${error.message}`);
  }
}
