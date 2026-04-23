import { NextResponse } from "next/server";
import { db } from "@/db";
import { comments, settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin } from "@/lib/auth";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const approvedParam = searchParams.get("approved");

    let query = db.select().from(comments).$dynamic();

    // Unauthenticated callers only ever see approved comments
    if (isAdmin() && approvedParam !== null && approvedParam !== "true") {
      if (approvedParam !== "all") {
        query = query.where(eq(comments.approved, approvedParam === "true"));
      }
    } else {
      query = query.where(eq(comments.approved, true));
    }

    const result = await query.orderBy(comments.created_at);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { author_name, message } = body;

    if (!author_name || typeof author_name !== "string" || !message || typeof message !== "string") {
      return NextResponse.json({ error: "author_name and message are required" }, { status: 400 });
    }

    const safeName = author_name.trim().slice(0, 100);
    const safeMessage = message.trim().slice(0, 1000);

    if (!safeName || !safeMessage) {
      return NextResponse.json({ error: "author_name and message are required" }, { status: 400 });
    }

    const [autoApproveSetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "auto_approve_comments"));

    const autoApprove = autoApproveSetting?.value === "true";

    const [newComment] = await db
      .insert(comments)
      .values({ author_name: safeName, message: safeMessage, approved: autoApprove })
      .returning();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
