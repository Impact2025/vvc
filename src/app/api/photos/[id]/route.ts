import { NextResponse } from "next/server";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { del } from "@vercel/blob";
import { isAdmin, unauthorized } from "@/lib/auth";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  if (!isAdmin()) return unauthorized();

  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { approved, caption, uploader_name } = body;

    const updateData: Partial<typeof photos.$inferInsert> = {};
    if (approved !== undefined) updateData.approved = approved;
    if (caption !== undefined) updateData.caption = caption;
    if (uploader_name !== undefined) updateData.uploader_name = uploader_name;

    const [updated] = await db
      .update(photos)
      .set(updateData)
      .where(eq(photos.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
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
    const [deleted] = await db.delete(photos).where(eq(photos.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 });
    }

    if (deleted.url?.includes("blob.vercel-storage.com")) {
      await del(deleted.url).catch(console.error);
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
