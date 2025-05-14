"use client";
import DLMM from "@meteora-ag/dlmm";
import { Connection, PublicKey, Keypair } from "@solana/web3.js";
import { useEffect } from "react";
import { BN } from "@coral-xyz/anchor";

import { useWallet } from "@solana/wallet-adapter-react";

//import { autoFillYByStrategy, StrategyType } from '@meteora-ag/dlmm/dist/utils/strategy'
import { autoFillYByStrategy, StrategyType } from '@meteora-ag/dlmm';
import {getAllUserPositions} from '@/lib/meteora';

import { getPool, getMeteoraPoolAPY } from "@/lib/meteora";
import { tokenMintAddresses, allAddresses } from "@/constants/nodeOptions"; 
import { getTokenBalance } from "@/lib/balances";

const RPC_LINK =
  process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com";
console.log("RPC Link:", RPC_LINK);
const connection = new Connection(RPC_LINK);

const SOL_USDC_POOL = new PublicKey(
  "5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6"
); // You can get your desired pool address from the API https://dlmm-api.meteora.ag/pair/all

// const userPublicKey = new PublicKey('H1ZpCkCHJR9HxwLQSGYdCDt7pkqJAuZx5FhLHzWHdiEw')

const currentPosition = new PublicKey(
  "cPMsV6AxSzsuCpdmMi4j38W7g6vFzs3QrvGc8vLvZyp"
);

export default function MeteoraPage() {
  const { connected, publicKey, signTransaction } = useWallet();

  // Collect all meteora pools given two tokens
  async function getPools() {
    const tokenX_address = "So11111111111111111111111111111111111111112";
    const tokenY_address = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v";

    const response = await fetch(
      `https://dlmm-api.meteora.ag/pair/all_by_groups?include_pool_token_pairs=${tokenX_address}-${tokenY_address}`
    );
    // data is an array of JSONs
    const data = await response.json();

    const pools = data.groups[0].pairs;

    // Sort by apy
    // const sortedData = data.sort((a: any, b: any) => {
    //     return b.apy - a.apy;
    // });
    // console.log("Sorted Data:", sortedData);

    console.log(data);
    console.log("Pools:", pools);
    return pools as any[];
  }

  // Get the data of a specific pool
  async function getPoolData() {
    const pools = await getPools();
    const examplePool = pools[0];

    // const poolAddress = SOL_USDC_POOL;
    const poolAddress = examplePool.address;

    const res = await fetch(`https://dlmm-api.meteora.ag/pair/${poolAddress}`);
    const data = await res.json();

    console.log("Pool Data:", data);
  }

  // Get the user positions of a specific pool
  async function getUserPositions() {
    if (!connected || !publicKey || !signTransaction) {
      console.log("Wallet not connected or public key not available");
      return;
    }

    const dlmmPool = await DLMM.create(connection, SOL_USDC_POOL);
    console.log(dlmmPool);

    const { userPositions } = await dlmmPool.getPositionsByUserAndLbPair(
      publicKey
    );

    console.log("User Positions:", userPositions);
    const binData = userPositions[0].positionData.positionBinData;

    console.log("Bin Data:", binData);

    userPositions.forEach((position: any) => {
      console.log("Public Key:", position.publicKey.toBase58());
    });
    return userPositions;
  }

  async function closeUserPosition() {
    if (!connected || !publicKey || !signTransaction) {
      console.log("Wallet not connected or public key not available");
      return;
    }
    const userPositions = await getUserPositions();
    if (!userPositions || userPositions.length === 0) {
      console.log("No positions found");
      return;
    }
    }

    // Get the user positions of a specific pool
    async function getUserPositions(){
        if(!connected || !publicKey || !signTransaction) {            
            console.log("Wallet not connected or public key not available");
            return;
        }
        console.log("Fetching user positions...");
        const tes = await getAllUserPositions(publicKey);
        console.log('Positions fetched');
        console.log("User Positions:", tes);
        // if(!connected || !publicKey || !signTransaction) {            
        //     console.log("Wallet not connected or public key not available");
        //     return;
        // }
        
        // const dlmmPool = await DLMM.create(connection, SOL_USDC_POOL)
        // console.log(dlmmPool);

        // const { userPositions } = await dlmmPool.getPositionsByUserAndLbPair(
        //     publicKey
        // );

        // console.log("User Positions:", userPositions);
        // const binData = userPositions[0].positionData.positionBinData;

        // console.log("Bin Data:", binData);

        // userPositions.forEach((position: any) => {
        //     console.log("Public Key:", position.publicKey.toBase58());
        // });
        // return userPositions
    }

    // Fetch Pool
    // const dlmmPool = await DLMM.create(connection, SOL_USDC_POOL);
    // console.log(dlmmPool);

    // const tokenX_mint = dlmmPool.tokenX.mint.address;
    // const tokenY_mint = dlmmPool.tokenY.mint.address;
    // const tokenX_decimals = dlmmPool.tokenX.mint.decimals;
    // const tokenY_decimals = dlmmPool.tokenY.mint.decimals;
    // console.log("Token X Mint Address:", tokenX_mint.toBase58());
    // console.log("Token Y Mint Address:", tokenY_mint.toBase58());

    // // Fetch Bin Info
    // const activeBin = await dlmmPool.getActiveBin();
    // const activeBinPriceLamport = activeBin.price;
    // const activeBinPricePerToken = dlmmPool.fromPricePerLamport(
    //   Number(activeBin.price)
    // );

    // console.log("Active Bin:", activeBin);
    // console.log("Active Bin Price (Lamport):", activeBinPriceLamport);
    // console.log("Active Bin Price (Token):", activeBinPricePerToken);

    //     // Try to create Transaction
    //     const TOTAL_RANGE_INTERVAL = 50; // 50 bins on each side of the active bin
    //     const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
    //     const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

    /*
        Given Token amount X , and Token Amount Y

        Use tokenX amount to calculate Y' amount using autoFillYByStrategy.
        If Y' > Y:
            Use Y amount then calculate X', where X' < X
        Else:
            Use X amount and Y', where Y' < Y
        */

    // const totalXAmount = new BN(10 * 10 ** tokenX_decimals);
    // const totalYAmount = autoFillYByStrategy(
    //     activeBin.binId,
    //     dlmmPool.lbPair.binStep,
    //     totalXAmount,
    //     activeBin.xAmount,
    //     activeBin.yAmount,
    //     minBinId,
    //     maxBinId,
    //     StrategyType.Spot // can be StrategyType.Spot, StrategyType.BidAsk, StrategyType.Curve
    // );
    // const totalYAmount = new BN(10 * 10 ** tokenY_decimals);
    // const totalXAmount = autoFillYByStrategy(
    //   activeBin.binId,
    //   dlmmPool.lbPair.binStep,
    //   totalYAmount,
    //   activeBin.xAmount,
    //   activeBin.yAmount,
    //   minBinId,
    //   maxBinId,
    //   StrategyType.Spot // can be StrategyType.Spot, StrategyType.BidAsk, StrategyType.Curve
    // );
    // console.log("Total X Amount:", totalXAmount.toString());
    // console.log("Total Y Amount:", totalYAmount.toString());

    // const newBalancePosition = Keypair.generate();
    // console.log("Secret Key:", newBalancePosition.secretKey.toString());
    // console.log("Public Key:", newBalancePosition.publicKey.toBase58());

    // // Get Create Position Tx
    // const createPositionTx =
    //   await dlmmPool.initializePositionAndAddLiquidityByStrategy({
    //     positionPubKey: newBalancePosition.publicKey,
    //     user: publicKey,
    //     totalXAmount,
    //     totalYAmount,
    //     strategy: {
    //       maxBinId,
    //       minBinId,
    //       strategyType: StrategyType.Spot, // can be StrategyType.Spot, StrategyType.BidAsk, StrategyType.Curve
    //     },
    //   });

    // if (!createPositionTx) {
    //   console.log("Failed to create transaction");
    //   return;
    // }

    async function getPair() {
      const tokenA = allAddresses["zBTC"];
      console.log("Token A:", tokenA);
      const tokenB = allAddresses["SOL"];
      console.log("Token B:", tokenB);

      const pool = await getPool(tokenA, tokenB);
      console.log("Pool:", pool);
    }

    async function getPairAPY(){
      const tokenA = allAddresses["zBTC"];
      console.log("Token A:", tokenA);
      const tokenB = allAddresses["SOL"];
      console.log("Token B:", tokenB);
      const apy = await getMeteoraPoolAPY(tokenA, tokenB);
      console.log("APY:", apy);
    }

    async function getBalances(){
      if(!connected || !publicKey || !signTransaction) {
        console.log("Wallet not connected or public key not available");
        return;
      }
      // const tokenBalances = await getTokenBalance(publicKey.toBase58(), [
      //   allAddresses["USDC"],
      //   allAddresses["JitoSOL"],
      // ]);
      const tokenBalances = await getTokenBalance(publicKey.toString(), allAddresses["USDC"]);
      console.log("Token Balances:", tokenBalances);
    }

    async function meteoraGetAllUserPositions(){
        if(!connected || !publicKey || !signTransaction) {
            console.log("Wallet not connected or public key not available");
            return;
        }
        const positions = await DLMM.getAllLbPairPositionsByUser(connection, publicKey);
        console.log("All User Positions:", positions);


        positions.forEach((position: any) => {
            console.log(position);
            console.log("Pair Public Key:", position.publicKey.toBase58());
            
            const tokenX = position.tokenX;
            const tokenY = position.tokenY;
            const positionsData = position.lbPairPositionsData;

            positionsData.forEach((positionData: any) => {
                console.log("Token X:", tokenX);
                console.log("Token Y:", tokenY);

    
                console.log("Position Public Key?:", positionData.publicKey.toString());


                console.log("Position Data:", positionData);

                const totalFeeX = positionData.totalFeeX.toString();
                const totalFeeY = positionData.totalFeeY.toString();
                console.log("Total Fee X:", totalFeeX);
                console.log("Total Fee Y:", totalFeeY);

                const totalAmountX = positionData.totalAmountX.toString();
                const totalAmountY = positionData.totalAmountY.toString();
                console.log("Total Amount X:", totalAmountX);
                console.log("Total Amount Y:", totalAmountY);
            });
        });
    }

    useEffect(() => {
        console.log();
        //getUserPositions();
        //getPools();
    }, []);

    return(
        <div>
            <h1>Meteora</h1>
            <p>Check the console for details.</p>
            <button onClick={() => {}}>Fetch Pool</button>
            <p>.</p>
            <button onClick={getUserPositions}>Get User Positions</button>
            <p>.</p>
            <button onClick={closeUserPosition}>Close User Position</button>
            <p>.</p>
            <button onClick={getPools}>Get Pools</button>
            <p>.</p>
            <button onClick={getPoolData}>Get Pool Data</button>
            <p>.</p>
            <button onClick={meteoraGetAllUserPositions}>Get All User Positions</button>
            <p>.</p>
            <button onClick={getPair}>Get Pair</button>
            <p>.</p>
            <button onClick={getPairAPY}>Get Pair APY</button>
            <p>.</p>
            <button onClick={getBalances}>Get Balances</button>
        </div>
    )
}

