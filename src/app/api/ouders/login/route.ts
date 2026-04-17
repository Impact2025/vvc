import { NextResponse } from "next/server";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { hashPin, signParentCookie } from "@/lib/parentAuth";

export async function GET() {
  try {
    const list = await db
      .select({ id: parents.id, naam: parents.naam, kind_naam: parents.kind_naam })
      .from(parents)
      .where(eq(parents.goedgekeurd, true));
    return NextResponse.json(list);
  } catch (err) {
    console.error("GET /api/ouders/login error:", err);
    return NextResponse.json([], { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const { parent_id, pin } = await req.json();

    if (!parent_id || !pin) {
      return NextResponse.json({ error: "Ontbrekende gegevens" }, { status: 400 });
    }

    const [parent] = await db
      .select()
      .from(parents)
      .where(and(eq(parents.id, parent_id), eq(parents.goedgekeurd, true)));

    if (!parent) {
      return NextResponse.json({ error: "Ouder niet gevonden" }, { status: 404 });
    }

    if (!parent.pincode) {
      return NextResponse.json({ error: "Nog geen pincode ingesteld. Vraag de beheerder." }, { status: 401 });
    }
    const hashedPin = await hashPin(String(pin));
    if (parent.pincode !== hashedPin) {
      return NextResponse.json({ error: "Verkeerde pincode, probeer opnieuw." }, { status: 401 });
    }

    const cookieValue = await signParentCookie(parent.id);
    const response = NextResponse.json({ ok: true, naam: parent.naam, kind_naam: parent.kind_naam });
    response.cookies.set("vvc_parent_session", cookieValue, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/",
      maxAge: 60 * 60 * 24 * 30,
    });
    return response;
  } catch (err) {
    console.error("POST /api/ouders/login error:", err);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}
