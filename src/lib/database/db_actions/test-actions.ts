"use server";

import {connectToDatabase} from "@/lib/database/index";
import Strategy from "@/lib/database/models/strategy";
import { revalidatePath } from "next/cache";

export async function getStrategies() {
  await connectToDatabase();
  const strategies = await Strategy.find({}).sort({ createdAt: -1 });
  return JSON.parse(JSON.stringify(strategies));
}

export async function getStrategy(id: string) {
  await connectToDatabase();
  const strategy = await Strategy.findById(id);

  if (!strategy) {
    throw new Error("Strategy not found");
  }

  return JSON.parse(JSON.stringify(strategy));
}

export async function createStrategy(strategyData: any) {
  await connectToDatabase();

  // Validate required fields
  if (!strategyData.nodes || !strategyData.edges) {
    throw new Error("Missing required fields: nodes and edges");
  }

  const strategy = await Strategy.create(strategyData);
  revalidatePath("/strategy-dashboard");
  return JSON.parse(JSON.stringify(strategy));
}