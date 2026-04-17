import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { db } from "@/db";
import { players } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { name, number, goals, assists, position, photo_url, award } = body;

    const updateData: Partial<typeof players.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (number !== undefined) updateData.number = number;
    if (goals !== undefined) updateData.goals = goals;
    if (assists !== undefined) updateData.assists = assists;
    if (position !== undefined) updateData.position = position;
    if (photo_url !== undefined) updateData.photo_url = photo_url;
    if (award !== undefined) updateData.award = award || null;

    const [updated] = await db
      .update(players)
      .set(updateData)
      .where(eq(players.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    revalidatePath("/kids");
    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const [deleted] = await db.delete(players).where(eq(players.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Player not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
