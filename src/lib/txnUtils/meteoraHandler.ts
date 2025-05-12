
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { BN } from "@coral-xyz/anchor";
import DLMM from "@meteora-ag/dlmm";
import { autoFillYByStrategy, StrategyType } from "@meteora-ag/dlmm";
import { SolanaAgentKit } from "solana-agent-kit";
import { TreeNode } from "./treeUtils";
import { SuccessStyle, WaitingSignStyle, WaitingTrasactionStyle } from "@/components/ui/wallet-toast-style";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com/";

const SOL_USDC_POOL = new PublicKey(
  "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6"
); // You can get your desired pool address from the API https://dlmm-api.meteora.ag/pair/all


export const handleMeteoraProtocol = async (agent: SolanaAgentKit, currentNode: TreeNode, signTransaction: any, nodes: Record<string, TreeNode>, toast: (props: any) => void) => {
  
    const { publicKey } = agent.wallet;

    // given current node has two parents
    const tokenX_address = nodes[currentNode.parents[0]].token;
    const tokenY_address = nodes[currentNode.parents[1]].token;
    

  // Collect all meteora pools given two tokens
  async function getPool(tokenX_address: string, tokenY_address: string) {
    // const tokenX_address = "So11111111111111111111111111111111111111112";
    // const tokenY_address = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    const response = await fetch(
      `https://dlmm-api.meteora.ag/pair/all_by_groups?include_pool_token_pairs=${tokenX_address}-${tokenY_address}`
    );
    // data is an array of JSONs
    const data = await response.json();

    const pool = data.groups[0].pairs[0];

    // Sort by apy
    // const sortedData = data.sort((a: any, b: any) => {
    //     return b.apy - a.apy;
    // });
    // console.log("Sorted Data:", sortedData);

    console.log(data);
    console.log("Pool:", pool);
    return pool;
  }

  async function openPosition(pool: any) {

    const poolPublicKey = new PublicKey(pool.address);
    
    // Fetch Pool
    const connection = new Connection(RPC_LINK);
    const dlmmPool = await DLMM.create(connection, poolPublicKey);
    console.log(dlmmPool);

    const tokenX_mint = dlmmPool.tokenX.mint.address;
    const tokenY_mint = dlmmPool.tokenY.mint.address;
    const tokenX_decimals = dlmmPool.tokenX.mint.decimals;
    const tokenY_decimals = dlmmPool.tokenY.mint.decimals;
    console.log("Token X Mint Address:", tokenX_mint.toBase58());
    console.log("Token Y Mint Address:", tokenY_mint.toBase58());

    // Fetch Bin Info
    const activeBin = await dlmmPool.getActiveBin();
    const activeBinPriceLamport = activeBin.price;
    const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
      Number(activeBin.price)
    );

    console.log("Active Bin:", activeBin);
    console.log("Active Bin Price (Lamport):", activeBinPriceLamport);
    console.log("Active Bin Price (Token):", activeBinPricePerToken);

    // Try to create Transaction
    const TOTAL_RANGE_INTERVAL = 10; // 50 bins on each side of the active bin
    const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
    const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

    /*
        Given Token amount X , and Token Amount Y

        Use tokenX amount to calculate Y' amount using autoFillYByStrategy.
        If Y' > Y:
            Use Y amount then calculate X', where X' < X
        Else:
            Use X amount and Y', where Y' < Y
        */


    // Initialize token amounts based on the inputs from parent nodes
    // Assuming these values come from the parent nodes' input amounts
    // params would be {parentMintX: amount, parentMintY: amount}
    if (!currentNode.params) {
      console.log("No parameters found for the current node");
      return;
    }
    
    console.log("Current Node Params:", currentNode.params);
    if (!currentNode.params[pool.mint_x] || !currentNode.params[pool.mint_y]) {
      console.log("Invalid parameters for token amounts");
      return;
    }
    
    const tokenX_initialAmount = new BN(currentNode.params[pool.mint_x]);
    const tokenY_initialAmount = new BN(currentNode.params[pool.mint_y]);

    console.log("Initial X Amount:", tokenX_initialAmount.toString());
    console.log("Initial Y Amount:", tokenY_initialAmount.toString());

    // First, calculate Y' using X as base
    const calculatedYAmount = autoFillYByStrategy(
      activeBin.binId,
      dlmmPool.lbPair.binStep,
      tokenX_initialAmount,
      activeBin.xAmount,
      activeBin.yAmount,
      minBinId,
      maxBinId,
      StrategyType.Spot
    );

    console.log("Calculated Y' Amount:", calculatedYAmount.toString());

    let totalXAmount, totalYAmount;

    // Check if Y' > Y
    if (calculatedYAmount.gt(tokenY_initialAmount)) {
      // If Y' > Y: Use Y as base and calculate X'
      console.log("Y' > Y: Using Y as base and calculating X'");
      totalYAmount = tokenY_initialAmount;
      totalXAmount = autoFillYByStrategy(
        activeBin.binId,
        dlmmPool.lbPair.binStep,
        totalYAmount,
        activeBin.yAmount, // Note: Parameters might need to be swapped here
        activeBin.xAmount, 
        minBinId,
        maxBinId,
        StrategyType.Spot
      );
    } else {
      // If Y' <= Y: Use X as base and Y'
      console.log("Y' <= Y: Using X as base and calculated Y'");
      totalXAmount = tokenX_initialAmount;
      totalYAmount = calculatedYAmount;
    }

    console.log("Final X Amount:", totalXAmount.toString());
    console.log("Final Y Amount:", totalYAmount.toString());

    const newBalancePosition = Keypair.generate();
    console.log("Secret Key:", newBalancePosition.secretKey.toString());
    console.log("Public Key:", newBalancePosition.publicKey.toBase58());

    // Get Create Position Tx
    const createPositionTx =
      await dlmmPool.initializePositionAndAddLiquidityByStrategy({
        positionPubKey: newBalancePosition.publicKey,
        user: publicKey,
        totalXAmount,
        totalYAmount,
        strategy: {
          maxBinId,
          minBinId,
          strategyType: StrategyType.Spot, // can be StrategyType.Spot, StrategyType.BidAsk, StrategyType.Curve
        },
      });

    if (!createPositionTx) {
      console.log("Failed to create transaction");
      return;
    }

    try {
      const res = await connection.simulateTransaction(createPositionTx);
      console.log("Simulation Result:", res);

      if (!createPositionTx) {
        console.log("Failed to create transaction");
        return;
      }

      createPositionTx.feePayer = publicKey;
      const recentBlockchash = await connection.getRecentBlockhash();
      createPositionTx.recentBlockhash = recentBlockchash.blockhash;

      createPositionTx.partialSign(newBalancePosition);

      toast(WaitingSignStyle())
      const signedTx = await signTransaction(createPositionTx);
      console.log("Sending transaction:");
      

      const rawTx = signedTx.serialize();
      const signature = await connection.sendRawTransaction(rawTx);
      console.log("Signature:", signature);

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


    } catch (error) {
      console.error("Transaction error:", error);
    }
  }
  
  const pool = await getPool(tokenX_address, tokenY_address);

  console.log("Pool Address:", pool);
  if (!pool) {
    console.log("Failed to get pool");
    return;
  }   
  await openPosition(pool);
}