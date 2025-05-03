'use server';


import { SolanaAgentKit, KeypairWallet} from "solana-agent-kit"; // or import createLangchainTools if using langchain
import TokenPlugin from "@solana-agent-kit/plugin-token";
import DefiPlugin from "@solana-agent-kit/plugin-defi";
import { Keypair } from "@solana/web3.js";
import bs58 from "bs58";
//import { CustomKeypairWallet } from "./CustomKeypairWallet";


export const testAgentKit = async (rpcUrl: string, walletContext: any) => {

  // const wallet = new CustomKeypairWallet(rpcUrl, walletContext)
  console.log("Initializing keypair")
  const keyPair = Keypair.fromSecretKey(bs58.decode("3JNLWxD72DrwfqmVHuPqFLDkFuM8aRbZ242niCufo61pjTiegK3MoWPxL4ZQwTEm1ctZQFjtRg9LhP4Wp9GVXuwf"))
  const wallet = new KeypairWallet(keyPair)
  
  
  // Initialize with private key and optional RPC URL
  console.log("INitializing agent")
  const agent = new SolanaAgentKit(
      wallet,
      process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com",
      {}
    ) // Add the plugins you would like to use
    .use(TokenPlugin)
    .use(DefiPlugin);
  console.log("Agent initialized")
  
  

  const priceFeedID = await agent.methods.fetchPythPriceFeedID("SOL");
  console.log("Price Feed ID for SOL/USD:", priceFeedID);

  const price = await agent.methods.fetchPythPrice(priceFeedID);
  console.log("Price of SOL/USD:", price);
  
  console.log("Price of SOL/USD:", price);
}