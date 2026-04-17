import { NextResponse } from "next/server";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const approvedParam = searchParams.get("approved");
    const matchIdParam = searchParams.get("match_id");

    let query = db.select().from(photos).$dynamic();

    const conditions = [];

    if (approvedParam !== null && approvedParam !== "all") {
      conditions.push(eq(photos.approved, approvedParam === "true"));
    }

    if (matchIdParam) {
      conditions.push(eq(photos.match_id, parseInt(matchIdParam)));
    }

    if (conditions.length === 1) {
      query = query.where(conditions[0]);
    } else if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(photos.created_at);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { url, caption, uploader_name, uploader_parent_id, match_id } = body;

    if (!url) {
      return NextResponse.json({ error: "url is required" }, { status: 400 });
    }

    const [newPhoto] = await db
      .insert(photos)
      .values({ url, caption, uploader_name, uploader_parent_id, match_id, approved: !!uploader_parent_id })
      .returning();

    return NextResponse.json(newPhoto, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
