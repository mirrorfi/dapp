import { type NextRequest, NextResponse } from "next/server"
import {connectToDatabase} from "@/lib/database/index"
import Strategy from "@/lib/database/models/strategy";
import mongoose from "mongoose"

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Strategy ID" }, { status: 400 })
    }

    const strategy = await Strategy.findById(id)

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 })
    }

    return NextResponse.json(Strategy)
  } catch (error) {
    console.error("Error fetching Strategy:", error)
    return NextResponse.json({ error: "Failed to fetch Strategy" }, { status: 500 })
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const id = params.id
    const body = await req.json()

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Strategy ID" }, { status: 400 })
    }

    const strategy = await Strategy.findByIdAndUpdate(id, body, { new: true })

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 })
    }

    return NextResponse.json(Strategy)
  } catch (error) {
    console.error("Error updating Strategy:", error)
    return NextResponse.json({ error: "Failed to update Strategy" }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  try {
    await connectToDatabase()

    const id = params.id

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return NextResponse.json({ error: "Invalid Strategy ID" }, { status: 400 })
    }

    const strategy = await Strategy.findByIdAndDelete(id)

    if (!strategy) {
      return NextResponse.json({ error: "Strategy not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Strategy deleted successfully" })
  } catch (error) {
    console.error("Error deleting Strategy:", error)
    return NextResponse.json({ error: "Failed to delete Strategy" }, { status: 500 })
  }
}

