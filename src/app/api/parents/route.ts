import { NextResponse } from "next/server";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { desc } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!isAdmin()) return unauthorized();

  try {
    const result = await db.select().from(parents).orderBy(desc(parents.created_at));
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { naam, email, telefoon, kind_naam, rol } = body;

    if (!naam || !email || !kind_naam) {
      return NextResponse.json({ error: "naam, email en kind_naam zijn verplicht" }, { status: 400 });
    }

    const [newParent] = await db
      .insert(parents)
      .values({
        naam: String(naam).trim().slice(0, 100),
        email: String(email).trim().slice(0, 200),
        telefoon: telefoon ? String(telefoon).trim().slice(0, 30) : undefined,
        kind_naam: String(kind_naam).trim().slice(0, 100),
        rol: rol ?? "ouder",
        goedgekeurd: false,
        kan_fotos_uploaden: false,
        kan_commentaar: false,
      })
      .returning();

    return NextResponse.json(newParent, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
