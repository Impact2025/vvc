import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { players } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET() {
  try {
    const result = await db.select().from(players).orderBy(desc(players.goals));
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
    const { name, number, goals, assists, position, photo_url } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const [newPlayer] = await db
      .insert(players)
      .values({ name, number, goals: goals ?? 0, assists: assists ?? 0, position, photo_url })
      .returning();

    revalidatePath("/kids");
    return NextResponse.json(newPlayer, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
