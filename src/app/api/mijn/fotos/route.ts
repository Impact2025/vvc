import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { photos } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyParentCookie } from "@/lib/parentAuth";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("vvc_parent_session")?.value;
    if (!raw) return NextResponse.json([], { status: 401 });
    const parentId = await verifyParentCookie(raw);
    if (!parentId) return NextResponse.json([], { status: 401 });

    const myPhotos = await db
      .select()
      .from(photos)
      .where(eq(photos.uploader_parent_id, parentId))
      .orderBy(photos.created_at);

    return NextResponse.json(myPhotos.reverse());
  } catch {
    return NextResponse.json([], { status: 500 });
  }
}
