import { NextResponse } from "next/server";
import { db } from "@/db";
import { comments } from "@/db/schema";
import { eq } from "drizzle-orm";
import { broadcastPush } from "@/lib/sendPush";
import { isAdmin, unauthorized } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  if (!isAdmin()) return unauthorized();

  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { approved, author_name, message } = body;

    const updateData: Partial<typeof comments.$inferInsert> = {};
    if (approved !== undefined) updateData.approved = approved;
    if (author_name !== undefined) updateData.author_name = author_name;
    if (message !== undefined) updateData.message = message;

    const [updated] = await db
      .update(comments)
      .set(updateData)
      .where(eq(comments.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    if (approved === true) {
      broadcastPush({
        title: `💬 Nieuwe reactie van ${updated.author_name}`,
        body: updated.message.slice(0, 100),
        url: "/",
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  if (!isAdmin()) return unauthorized();

  try {
    const id = parseInt(params.id);
    const [deleted] = await db.delete(comments).where(eq(comments.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Comment not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
