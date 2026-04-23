export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { asc } from "drizzle-orm";
import { resolveCurrentMatch } from "@/lib/matchUtils";

export async function GET() {
  try {
    const all = await db.select().from(matches).orderBy(asc(matches.date), asc(matches.time));
    return NextResponse.json(resolveCurrentMatch(all));
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
