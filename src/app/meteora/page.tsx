"use client"
import DLMM from '@meteora-ag/dlmm'
import { Connection, PublicKey } from '@solana/web3.js'
import { useEffect } from 'react'

const RPC_LINK = process.env.NEXT_PUBLIC_RPC_LINK || 'https://api.mainnet-beta.solana.com'
const connection = new Connection(RPC_LINK)

const SOL_USDC_POOL = new PublicKey('5rCf1DM8LjKTw4YqhnoLcngyZYeNnQqztScTogYHAS6') // You can get your desired pool address from the API https://dlmm-api.meteora.ag/pair/all

export default function MeteoraPage() {

    async function fetchPool(){
        const pool = await DLMM.create(connection, SOL_USDC_POOL)
        console.log(pool);
    }

    useEffect(() => {
        fetchPool();
    }, []);

    return(
        <div>
            <h1>Meteora</h1>
            <p>Check the console for details.</p>
        </div>
    )
}