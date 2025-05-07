
import { NextRequest, NextResponse } from 'next/server';
import { sanctumGetOwnedLST } from '@/lib/plugin/sanctum/tools';

export async function POST(req: NextRequest ) {
    console.log("Sanctum Get Owned LST API Called");

    try {
        const body = await req.json(); // Extract JSON body
        console.log("Request Body:", body);

        const { 
            publicKeyString
        } = body;

        if (!publicKeyString) {
            return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
        }
        
        const publicKey = new PublicKey(publicKeyString);
        const connection = new Connection(process.env.NEXT_PUBLIC_RPC_LINK)
        
        const data = await sanctumGetOwnedLST(publicKey, connection);

        return NextResponse.json({message: "Successful", data: data});

    } catch(e) {
        console.log("Error Fetching Owned LST", e);

        return NextResponse.json({message: "Error Fetching Owned LST", error: e});
    }
}