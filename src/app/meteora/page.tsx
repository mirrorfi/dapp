"use client"
import DLMM from '@meteora-ag/dlmm'
import { Connection, PublicKey, Keypair } from '@solana/web3.js'
import { useEffect } from 'react'
import { BN } from "@coral-xyz/anchor";

import { useWallet } from '@solana/wallet-adapter-react';

//import { autoFillYByStrategy, StrategyType } from '@meteora-ag/dlmm/dist/utils/strategy'
import { autoFillYByStrategy, StrategyType } from '@meteora-ag/dlmm';
import { create } from 'domain';


const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || 'https://api.mainnet-beta.solana.com'
console.log("RPC Link:", RPC_LINK);
const connection = new Connection(RPC_LINK)

const SOL_USDC_POOL = new PublicKey('5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6') // You can get your desired pool address from the API https://dlmm-api.meteora.ag/pair/all

// const userPublicKey = new PublicKey('H1ZpCkCHJR9HxwLQSGYdCDt7pkqJAuZx5FhLHzWHdiEw')


const currentPosition = new PublicKey("cPMsV6AxSzsuCpdmMi4j38W7g6vFzs3QrvGc8vLvZyp")

export default function MeteoraPage() {

    const { connected, publicKey, signTransaction } = useWallet();

    async function getPools(){

        const tokenX_address = "So11111111111111111111111111111111111111112"
        const tokenY_address = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"

        const response = await fetch(`https://dlmm-api.meteora.ag/pair/all_by_groups?include_pool_token_pairs=${tokenX_address}-${tokenY_address}`);
        // data is an array of JSONs
        const data = await response.json();

        // filter data based on mint_x and mint_y 
        const filteredData = data.filter((pool: any) => {
            return pool.mint_x === 'So11111111111111111111111111111111111111112'
                && pool.mint_y === 'EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v'
        });
        
        console.log("Filtered Data:", filteredData);

        // Sort by apy
        const sortedData = filteredData.sort((a: any, b: any) => {
            return b.apy - a.apy;
        });
        console.log("Sorted Data:", sortedData);

        console.log(data);
    }

    async function getPoolData(){
        const res = await fetch(`https://dlmm-api.meteora.ag/pair/${SOL_USDC_POOL.toBase58()}`);
        const data = await res.json();

        console.log("Pool Data:", data);
    }

    async function getUserPositions(){
        if(!connected || !publicKey || !signTransaction) {            
            console.log("Wallet not connected or public key not available");
            return;
        }
        
        const dlmmPool = await DLMM.create(connection, SOL_USDC_POOL)
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
        return userPositions
    }

    async function closeUserPosition(){
        if(!connected || !publicKey || !signTransaction) {
            console.log("Wallet not connected or public key not available");
            return;
        }
        const userPositions = await getUserPositions();
        if(!userPositions || userPositions.length === 0) {
            console.log("No positions found");
            return;
        }

        const firstPosition = userPositions[0];
        const binIdsToRemove = firstPosition.positionData.positionBinData.map(
            (bin:any) => bin.binId
        );
        const dlmmPool = await DLMM.create(connection, SOL_USDC_POOL)

        const removeLiquidityTx = await dlmmPool.removeLiquidity({
            position: publicKey,
            user: publicKey,
            fromBinId: binIdsToRemove[0],
            toBinId: binIdsToRemove[binIdsToRemove.length - 1],
            bps: new BN(100*100),
            // bps: new Array(binIdsToRemove.length).fill(
            //     new BN(100 * 100)
            // ), // 100% (range from 0 to 100)
            shouldClaimAndClose: true, // should claim swap fee and close position together
        });

        console.log("Remove Liquidity Transaction:", removeLiquidityTx);   

        // try {
        //     for (let tx of Array.isArray(removeLiquidityTx)
        //         ? removeLiquidityTx
        //         : [removeLiquidityTx]) {
        //         const removeBalanceLiquidityTxHash = await sendAndConfirmTransaction(
        //         connection,
        //         tx,
        //         [user],
        //         { skipPreflight: false, preflightCommitment: "singleGossip" }
        //         );
        //     }
        // } catch (error) {}

        
    }

    async function fetchPool(){
        if(!connected || !publicKey || !signTransaction) {
            console.log(connected);
            console.log(publicKey);
            console.log(signTransaction);
            
            console.log("Wallet not connected or public key not available");
            return;
        }

        // Fetch Pool
        const dlmmPool = await DLMM.create(connection, SOL_USDC_POOL)
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
        const activeBinPricePerToken = dlmmPool.fromPricePerLamport(Number(activeBin.price));

        console.log("Active Bin:", activeBin);
        console.log("Active Bin Price (Lamport):", activeBinPriceLamport);
        console.log("Active Bin Price (Token):", activeBinPricePerToken);

        // Try to create Transaction
        const TOTAL_RANGE_INTERVAL = 10; // 10 bins on each side of the active bin
        const minBinId = activeBin.binId - TOTAL_RANGE_INTERVAL;
        const maxBinId = activeBin.binId + TOTAL_RANGE_INTERVAL;

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
        const totalYAmount = new BN(10 * 10 ** tokenY_decimals);
        const totalXAmount = autoFillYByStrategy(
            activeBin.binId,
            dlmmPool.lbPair.binStep,
            totalYAmount,
            activeBin.xAmount,
            activeBin.yAmount,
            minBinId,
            maxBinId,
            StrategyType.Spot // can be StrategyType.Spot, StrategyType.BidAsk, StrategyType.Curve
        );
        console.log("Total X Amount:", totalXAmount.toString());
        console.log("Total Y Amount:", totalYAmount.toString());

        const newBalancePosition = Keypair.generate();
        console.log("Secret Key:", newBalancePosition.secretKey.toString());
        console.log("Public Key:", newBalancePosition.publicKey.toBase58());

        // Create Position
        const createPositionTx = await dlmmPool.initializePositionAndAddLiquidityByStrategy({
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

        if(!createPositionTx) {
            console.log("Failed to create transaction");
            return;
        }

        try {
            const res = await connection.simulateTransaction(createPositionTx);
            console.log("Simulation Result:", res);

            if(!createPositionTx) {
                console.log("Failed to create transaction");
                return;
            }

            createPositionTx.feePayer = publicKey;
            const recentBlockchash = await connection.getRecentBlockhash();
            createPositionTx.recentBlockhash = recentBlockchash.blockhash;

            createPositionTx.partialSign(newBalancePosition);
            let signedTx = await signTransaction(createPositionTx);
            console.log("Sending transaction:");

            const rawTx = signedTx.serialize();
            const txHash = await connection.sendRawTransaction(rawTx);
            console.log("Signature:", txHash);
            // const createBalancePositionTxHash = await sendAndConfirmTransaction(
            //     connection,
            //     createPositionTx,
            //     [user, newBalancePosition]
            // );
        } catch (error) {
            console.error("Transaction error:", error);
        }
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
            <button onClick={fetchPool}>Fetch Pool</button>
            <p>.</p>
            <button onClick={getUserPositions}>Get User Positions</button>
            <p>.</p>
            <button onClick={closeUserPosition}>Close User Position</button>
            <p>.</p>
            <button onClick={getPools}>Get Pools</button>
            <p>.</p>
            <button onClick={getPoolData}>Get Pool Data</button>
            <p>.</p>
        </div>
    )
}