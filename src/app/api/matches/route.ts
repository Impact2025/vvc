import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { asc } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET() {
  try {
    const result = await db.select().from(matches).orderBy(asc(matches.date));
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return unauthorized();

  try {
    const body = await req.json();
    const { opponent, date, time, location } = body;

    if (!opponent || !date) {
      return NextResponse.json({ error: "opponent and date are required" }, { status: 400 });
    }

    const [newMatch] = await db
      .insert(matches)
      .values({ opponent, date, time, location })
      .returning();

    return NextResponse.json(newMatch, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
