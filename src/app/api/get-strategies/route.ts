import { connectToDatabase } from "@/lib/database";
import { getStrategies } from "@/lib/database/db_actions/test-actions";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    await connectToDatabase();
    const strategies = await getStrategies();
    return NextResponse.json(strategies);
  } catch (error) {
    console.error("Failed to fetch strategies:", error);
    return NextResponse.json(
      { error: "Failed to fetch strategies" },
      { status: 500 }
    );
  }
}
