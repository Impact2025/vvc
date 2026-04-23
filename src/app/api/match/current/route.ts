export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq, and, gte, asc } from "drizzle-orm";

export async function GET() {
  try {
    const today = new Date().toISOString().slice(0, 10);

    const [live] = await db
      .select()
      .from(matches)
      .where(eq(matches.status, "live"))
      .limit(1);

    if (live) return NextResponse.json(live);

    const [next] = await db
      .select()
      .from(matches)
      .where(and(eq(matches.status, "upcoming"), gte(matches.date, today)))
      .orderBy(asc(matches.date), asc(matches.time))
      .limit(1);

    return NextResponse.json(next ?? null);
  } catch (error) {
    console.error(error);
    return NextResponse.json(null);
  }
}
