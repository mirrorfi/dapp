import { NextRequest, NextResponse } from 'next/server';
import { sanctumSwapLST } from '@/lib/plugin/sanctum/tools';
import { Connection, PublicKey } from '@solana/web3.js';

export async function POST(req: NextRequest ) {
    console.log("Sanctum Swap LST API Called");

    try {
        const body = await req.json(); // Extract JSON body
        console.log("Request Body:", body);

        const { 
            publicKeyString,
            lstMint,
            amount,
            quotedAmount,
            priorityFee,
            outputLstMint
        } = body;

        if (!publicKeyString || !lstMint || !amount || !quotedAmount || !priorityFee || !outputLstMint) {
            return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
        }

        const publicKey = new PublicKey(publicKeyString);
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_LINK)

        const txn = await sanctumSwapLST(
            publicKey,
            connection,
            lstMint,
            amount,
            quotedAmount,
            priorityFee,
            outputLstMint
        );

        const serializedTxn = txn.serialize();
        const encodedTxn = bs58.encode(serializedTxn);

        return NextResponse.json({message: "Successful", data: encodedTxn});

    } catch(e) {
        console.log("Error Swapping LST", e);

        return NextResponse.json({message: "Error Swapping LST", error: e});
    }
}