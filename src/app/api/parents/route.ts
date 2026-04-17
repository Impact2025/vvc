import { NextResponse } from "next/server";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { desc } from "drizzle-orm";

export async function GET() {
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
        naam,
        email,
        telefoon,
        kind_naam,
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
