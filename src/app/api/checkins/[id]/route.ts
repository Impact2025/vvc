import { NextResponse } from "next/server";
import { db } from "@/db";
import { checkins } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  if (!isAdmin()) return unauthorized();

  try {
    const id = parseInt(params.id);
    const [deleted] = await db.delete(checkins).where(eq(checkins.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Check-in not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
