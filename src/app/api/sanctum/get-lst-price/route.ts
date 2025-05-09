
import { NextRequest, NextResponse } from 'next/server';
import { sanctumGetLSTPrice } from '@/lib/plugin/sanctum/tools';

export async function POST(req: NextRequest ) {
    console.log("Sanctum Get LST Price API Called");

    try {
        const body = await req.json(); // Extract JSON body
        console.log("Request Body:", body);

        const { inputs } = body;

        if (!inputs || !Array.isArray(inputs)) {
            return NextResponse.json({ message: "Invalid parameters" }, { status: 400 });
        }

        const data = await sanctumGetLSTPrice(inputs);

        return NextResponse.json({message: "Successful", data: data});

    } catch(e) {
        console.log("Error Fetching LST Price", e);

        return NextResponse.json({message: "Error Fetching LST Price", error: e});
    }
}