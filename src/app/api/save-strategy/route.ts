import { type NextRequest, NextResponse } from "next/server";
import {connectToDatabase} from "@/lib/database/index";
import Strategy from "@/lib/database/models/strategy";

export async function GET(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (id) {
      // Get a single strategy
      const strategy = await Strategy.findById(id);

      if (!strategy) {
        return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
      }

      return NextResponse.json(strategy);
    } else {
      // Get all strategies
      const strategies = await Strategy.find({}).sort({ createdAt: -1 });
      return NextResponse.json(strategies);
    }
  } catch (error) {
    console.error("Error fetching strategies:", error);
    return NextResponse.json({ error: "Failed to fetch strategies" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectToDatabase();

    const body = await req.json();

    // Validate required fields
    if (!body.nodes || !body.edges) {
      return NextResponse.json({ error: "Missing required fields: nodes and edges" }, { status: 400 });
    }

    const strategy = await Strategy.create(body);
    return NextResponse.json(strategy, { status: 201 });
  } catch (error) {
    console.error("Error creating strategy:", error);
    return NextResponse.json({ error: "Failed to create strategy" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Strategy ID is required" }, { status: 400 });
    }

    const body = await req.json();

    const strategy = await Strategy.findByIdAndUpdate(id, body, { new: true });

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 });
    }

    return NextResponse.json(strategy);
  } catch (error) {
    console.error("Error updating strategy:", error);
    return NextResponse.json({ error: "Failed to update strategy" }, { status: 500 });
  }
}

