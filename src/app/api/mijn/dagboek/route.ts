import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/db";
import { parents, players, diary_entries } from "@/db/schema";
import { eq, ilike } from "drizzle-orm";
import { verifyParentCookie } from "@/lib/parentAuth";

export async function POST(req: Request) {
  try {
    const cookieStore = await cookies();
    const raw = cookieStore.get("vvc_parent_session")?.value;
    if (!raw) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    const parentId = await verifyParentCookie(raw);
    if (!parentId) return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });

    const [parent] = await db.select().from(parents).where(eq(parents.id, parentId));
    if (!parent?.kind_naam) return NextResponse.json({ error: "Geen kind gekoppeld" }, { status: 400 });

    const { content, day } = await req.json();
    if (!content?.trim()) return NextResponse.json({ error: "Inhoud is verplicht" }, { status: 400 });
    if (!day || day < 1 || day > 5) return NextResponse.json({ error: "Ongeldig dagboekdag" }, { status: 400 });

    // Find player matching kid name
    const [player] = await db.select().from(players).where(ilike(players.name, `%${parent.kind_naam}%`));
    if (!player) return NextResponse.json({ error: "Speler niet gevonden voor " + parent.kind_naam }, { status: 404 });

    const [entry] = await db.insert(diary_entries).values({
      player_id: player.id,
      content: content.trim(),
      day: parseInt(day),
    }).returning();

    return NextResponse.json(entry, { status: 201 });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}
