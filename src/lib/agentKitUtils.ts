import { SolanaAgentKit, KeypairWallet} from "solana-agent-kit"; // or import createLangchainTools if using langchain
import TokenPlugin from "@solana-agent-kit/plugin-token";
import { Keypair } from "@solana/web3.js";

// import OrcaPlugin from "@/lib/plugin/orca"
import LuloPlugin from "@/lib/plugin/lulo";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_URL || "https://api.mainnet-beta.solana.com";

export const getAgent = async () => {

  // const wallet = new CustomKeypairWallet(rpcUrl, walletContext)
  console.log("Initializing keypair")
  const keyPair = Keypair.generate(); // Generate a new keypair
  const wallet = new KeypairWallet(keyPair, RPC_LINK)
  
  
  // Initialize with private key and optional RPC URL
  console.log("INitializing agent")
  const agent = new SolanaAgentKit(
      wallet,
      RPC_LINK,
      {}
    ) // Add the plugins you would like to use
    .use(TokenPlugin)
    .use(LuloPlugin);
  console.log("Agent initialized")
  
  

  // const priceFeedID = await agent.methods.fetchPythPriceFeedID("SOL");
  // console.log("Price Feed ID for SOL/USD:", priceFeedID);

  // const price = await agent.methods.fetchPythPrice(priceFeedID);
  // console.log("Price of SOL/USD:", price);
  
  // console.log("Price of SOL/USD:", price);
}

// testAgentKit("https://api.mainnet-beta.solana.com", null)
//   .then(() => {
//     console.log("AgentKit test completed successfully.");
// })
// .catch((error) => {
//   console.error("Error during AgentKit test:", error);
// });
