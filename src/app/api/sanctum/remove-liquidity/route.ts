import { NextRequest, NextResponse } from 'next/server';
import { sanctumRemoveLiquidity } from '@/lib/plugin/sanctum/tools';
import { Connection, PublicKey } from '@solana/web3.js';

export async function POST(req: NextRequest ) {
    console.log("Sanctum Remove Liquidity API Called");

    try {
        const body = await req.json(); // Extract JSON body
        console.log("Request Body:", body);

        const { 
            publicKeyString,
            lstMint,
            amount,
            quotedAmount,
            priorityFee
        } = body;

        if (!publicKeyString || !lstMint || !amount || !quotedAmount || !priorityFee) {
            return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
        }

        const publicKey = new PublicKey(publicKeyString);
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_LINK)

        const txn = await sanctumRemoveLiquidity(
            publicKey,
            connection,
            lstMint,
            amount,
            quotedAmount,
            priorityFee
        );

        const serializedTxn = txn.serialize();
        const encodedTxn = bs58.encode(serializedTxn);

        return NextResponse.json({message: "Successful", data: encodedTxn});

    } catch(e) {
        console.log("Error Removing Liquidity", e);

        return NextResponse.json({message: "Error Removing Liquidity", error: e});
    }
}