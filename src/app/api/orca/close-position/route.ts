import { NextRequest, NextResponse } from 'next/server';

import { getAgent } from '@/lib/agentKitUtils';
import { createCipheriv } from 'crypto';


export async function GET(req: NextRequest ) {
    console.log("API Called");

    try{
        console.log("Fetching Agent")
        const agent = getAgent();
        console.log("Agent Fetched");
    }catch(e){
        console.log("Error Fetching Agent", e);
    }


    return NextResponse.json({message: "Successful"});
}