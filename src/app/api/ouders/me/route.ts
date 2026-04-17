import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { verifyParentCookie } from "@/lib/parentAuth";

export async function GET() {
  try {
    const cookieStore = cookies();
    const session = cookieStore.get("vvc_parent_session");
    if (!session) return NextResponse.json(null);

    const parentId = await verifyParentCookie(session.value);
    if (!parentId) return NextResponse.json(null);

    const [parent] = await db
      .select({
        id: parents.id,
        naam: parents.naam,
        kind_naam: parents.kind_naam,
        rol: parents.rol,
        kan_fotos_uploaden: parents.kan_fotos_uploaden,
        kan_commentaar: parents.kan_commentaar,
      })
      .from(parents)
      .where(eq(parents.id, parentId));

    return NextResponse.json(parent ?? null);
  } catch (err) {
    console.error("GET /api/ouders/me error:", err);
    return NextResponse.json(null);
  }
}
