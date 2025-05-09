import { Connection, VersionedTransaction } from "@solana/web3.js";
import { TransactionInstruction } from "@solana/web3.js";
import { TransactionMessage } from "@solana/web3.js";
import axios from "redaxios";
import { SolanaAgentKit, signOrSendTX } from "solana-agent-kit";
import { SANCTUM_TRADE_API_URI } from "../constants";
import bs58 from "bs58";

export async function sanctumSwapLST(
  agent: SolanaAgentKit,
  inputLstMint: string,
  amount: string,
  outputLstMint: string,
  quotedAmount: string,
  priorityFee: number,
) {
  try {
    const client = axios.create({
      baseURL: SANCTUM_TRADE_API_URI,
    });

    console.log("Swapping LST on Sanctum...");
    console.log("Parameters:", {
      inputLstMint,
      amount,
      outputLstMint,
      quotedAmount,
      priorityFee,
    });

    const body = {
      amount,
      dstLstAcc: null,
      input: inputLstMint,
      mode: "ExactIn",
      priorityFee: {
        Auto: {
          max_unit_price_micro_lamports: priorityFee,
          unit_limit: 300000,
        },
      },
      outputLstMint,
      quotedAmount,
      signer: agent.wallet.publicKey.toBase58(),
      srcLstAcc: null,
      swapSrc: "Stakedex"
    }

    console.log("Request body:", body);

    const response = await client.post("/v1/swap", body);

    console.log("Response from Sanctum Swap:", response.data);

    // Check if the transaction is Base58 or Base64
    const rawTx = response.data.tx;
    console.log("Raw transaction (response.data.tx):", rawTx);

    let decodedTx;
    try {
      // Attempt Base58 decoding
      decodedTx = bs58.decode(rawTx);
    } catch {
      console.warn("Failed Base58 decoding, attempting Base64 decoding...");
      decodedTx = Buffer.from(rawTx, "base64");
    }
    
    console.log("Decoded transaction:", decodedTx);
    const sanctumTx = VersionedTransaction.deserialize(decodedTx);
    console.log("Sanctum transaction:", sanctumTx);

    const rpcUrl = process.env.NEXT_PUBLIC_RPC_LINK;
    if (!rpcUrl) {
      throw new Error("RPC URL is not defined");
    }
    const connection = new Connection(rpcUrl);

    const res = await connection.simulateTransaction(sanctumTx);
    console.log(res);

    return sanctumTx;


    // console.log("Response from Sanctum Swap:", response.data);

    // const txBuffer = Buffer.from(response.data.tx, "base64");

    // const rpcUrl = process.env.NEXT_PUBLIC_RPC_LINK;
    // if (!rpcUrl) {
    //   throw new Error("RPC URL is not defined");
    // }

    // const connection = new Connection(rpcUrl);

    // const { blockhash } = await connection.getLatestBlockhash();

    // console.log("Blockhash:", blockhash);

    // const tx = VersionedTransaction.deserialize(txBuffer);

    // const messages = tx.message;

    // const instructions = messages.compiledInstructions.map((ix) => {
    //   return new TransactionInstruction({
    //     programId: messages.staticAccountKeys[ix.programIdIndex],
    //     keys: ix.accountKeyIndexes.map((i) => ({
    //       pubkey: messages.staticAccountKeys[i],
    //       isSigner: messages.isAccountSigner(i),
    //       isWritable: messages.isAccountWritable(i),
    //     })),
    //     data: Buffer.from(ix.data as any, "base64"),
    //   });
    // });
    // for (const instruction of instructions) {
    //   console.log("Instruction:", instruction);
    // }

    // console.log("Instructions:", instructions);

    // console.log("public key:", agent.wallet.publicKey.toBase58());

    // const publicKey = agent.wallet.publicKey;

    // const newMessage = new TransactionMessage({
    //   payerKey: publicKey,
    //   recentBlockhash: blockhash,
    //   instructions,
    // }).compileToV0Message([]);

    // console.log("New message:", newMessage);s

    // const newTx = new VersionedTransaction(newMessage);
    // console.log("New transaction:", newTx);
    // return newTx;

  } catch (error: any) {
    throw new Error(`Failed to swap lst: ${error.message}`);
  }
}
