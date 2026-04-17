import { NextResponse } from "next/server";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const {
      naam,
      email,
      telefoon,
      kind_naam,
      rol,
      goedgekeurd,
      kan_fotos_uploaden,
      kan_commentaar,
      toestemming_fotos,
      toestemming_app,
    } = body;

    const updateData: Partial<typeof parents.$inferInsert> = {};
    if (naam !== undefined) updateData.naam = naam;
    if (email !== undefined) updateData.email = email;
    if (telefoon !== undefined) updateData.telefoon = telefoon;
    if (kind_naam !== undefined) updateData.kind_naam = kind_naam;
    if (rol !== undefined) updateData.rol = rol;
    if (goedgekeurd !== undefined) updateData.goedgekeurd = goedgekeurd;
    if (kan_fotos_uploaden !== undefined) updateData.kan_fotos_uploaden = kan_fotos_uploaden;
    if (kan_commentaar !== undefined) updateData.kan_commentaar = kan_commentaar;
    if (toestemming_fotos !== undefined) updateData.toestemming_fotos = toestemming_fotos;
    if (toestemming_app !== undefined) updateData.toestemming_app = toestemming_app;

    const [updated] = await db
      .update(parents)
      .set(updateData)
      .where(eq(parents.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const [deleted] = await db.delete(parents).where(eq(parents.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
