export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { asc } from "drizzle-orm";

export async function GET() {
  try {
    const all = await db.select().from(matches).orderBy(asc(matches.date), asc(matches.time));
    const live = all.find((m) => m.status === "live") ?? null;
    const next = all.find((m) => m.status === "upcoming") ?? null;
    return NextResponse.json(live ?? next);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
