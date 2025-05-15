
// app/utils/agent.ts
import { SolanaAgentKit } from 'solana-agent-kit';
import TokenPlugin from '@solana-agent-kit/plugin-token';
import SanctumPlugin from '@/lib/plugin/sanctum';
import { Connection, PublicKey } from '@solana/web3.js';
import LuloPlugin from './plugin/lulo';

export async function createSolanaAgent(publicKeyString: string) {
  
  // Create Solana Agent Kit instance
    const agent = new SolanaAgentKit(
      {
        publicKey: new PublicKey(publicKeyString),
        signTransaction: async (tx) => {
        //   const signed = await wallet.signTransaction(tx);
        //   return signed;
            return tx
        },
        // signMessage: async (msg) => {
        //   const signed = await wallet.signMessage(msg);
        //   return signed;
        // },
        sendTransaction: async (tx) => {
        //   const connection = new Connection("YOUR_RPC_URL", "confirmed");
        //   return await wallet.sendTransaction(tx, connection);
        //   return tx
            return tx
        },
        signAllTransactions: async (txs) => {
        //   const signed = await wallet.signAllTransactions(txs);
        //   return signed;
        //   return txs
            return txs
        },
        signAndSendTransaction: async (tx) => {
        //   const signed = await wallet.signTransaction(tx);
        //   const connection = new Connection("YOUR_RPC_URL", "confirmed");
        //   const sig = await wallet.sendTransaction(signed, connection);
        //   return { signature: sig };
            return tx
        },
      },
      process.env.NEXT_PUBLIC_RPC_LINK,
      {}
    )
      .use(TokenPlugin)
      .use(SanctumPlugin)
      .use(LuloPlugin);

      // // test if simple data fecthing 
      // console.log("Feching usdc token data")
      // const tokenData = agent.methods.getTokenDataByAddress("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v") // usdc
      // console.log("Token Data:", tokenData)

      // // test if returning transactions work
      // const tx  = agent.methods.request_faucet_funds()

  
  return agent;
}