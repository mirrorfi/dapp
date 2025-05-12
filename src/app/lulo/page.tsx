"use client";
import { useEffect } from "react";
import {useWallet} from "@solana/wallet-adapter-react";

import { createSolanaAgent } from "@/lib/agent";
import { Connection, PublicKey } from "@solana/web3.js";

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || "https://api.mainnet-beta.solana.com";
const connection = new Connection(RPC_LINK);

export default function OrcaPage() {
    const wallet = useWallet();

    // const getLuloLendAsset = async () => {
    //     if (!wallet.connected) {
    //         console.error("Wallet is not connected");
    //         return;
    //     }

    //     if (!wallet.publicKey) {
    //         console.error("Wallet public key is not available");
    //         return;
    //     }
    //     const agent = await createSolanaAgent(wallet.publicKey.toString());
    //     console.log("Agent initialized:", agent);

    //     agent.wallet.publicKey = new PublicKey("H1ZpCkCHJR9HxwLQSGYdCDt7pkqJAuZx5FhLHzWHdiEw")


    //     console.log("Fk u")
    //     try {
    //         console.log("Getting Lend Transaction");
    //         const tx = await agent.methods.lendAsset(10);
    //         console.log("Lulo Lend Asset:", tx);

    //         const res = await connection.simulateTransaction(tx);
    //         console.log("Simulation Result:", res);
    //         console.log(res.value.logs);


    //     } catch (error) {
    //         console.error("Error fetching Lulo Lend Asset:", error);
    //     }
    // }

    const getLuloWithdrawAsset = async () => {
        const agent = await getAgent();
        console.log("Agent initialized:", agent);

        agent.wallet.publicKey = new PublicKey("H1ZpCkCHJR9HxwLQSGYdCDt7pkqJAuZx5FhLHzWHdiEw")

        try{
            console.log("Getting Lend Transaction");
            const tx = await agent.methods.luloWithdraw(agent, "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", 1);
            console.log("Lulo Withdraw Asset:", tx);

            const res = await connection.simulateTransaction(tx);
            console.log("Simulation Result:", res);
        }catch (error) {
            console.error("Error fetching Lulo Withdraw Asset:", error);
        }
    }

    // useEffect(() => {
    //     async function fetchData() {
    //         await getLuloLendAsset();
    //         //await getLuloWithdrawAsset();
    //     }
    //     fetchData();
    // }, []);


    return (
        <div>
        <h1>Orca Page</h1>
        <p>This is the Orca page.</p>
        </div>
    );
}
