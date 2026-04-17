import { NextResponse } from "next/server";
import { db } from "@/db";
import { comments, settings } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const approvedParam = searchParams.get("approved");

    let query = db.select().from(comments).$dynamic();

    if (approvedParam !== null && approvedParam !== "all") {
      query = query.where(eq(comments.approved, approvedParam === "true"));
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

    if (!author_name || !message) {
      return NextResponse.json({ error: "author_name and message are required" }, { status: 400 });
    }

    // Check auto-approve setting
    const [autoApproveSetting] = await db
      .select()
      .from(settings)
      .where(eq(settings.key, "auto_approve_comments"));

    const autoApprove = autoApproveSetting?.value === "true";

    const [newComment] = await db
      .insert(comments)
      .values({ author_name, message, approved: autoApprove })
      .returning();

    return NextResponse.json(newComment, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
