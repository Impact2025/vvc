import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { eq } from "drizzle-orm";

interface RouteContext {
  params: { id: string };
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { name, message, amount, type, status, company_name, company_email, company_phone, app_wens } = body;

    const updateData: Partial<typeof donations.$inferInsert> = {};
    if (name !== undefined) updateData.name = name;
    if (message !== undefined) updateData.message = message;
    if (amount !== undefined) updateData.amount = amount;
    if (type !== undefined) updateData.type = type;
    if (status !== undefined) updateData.status = status;
    if (company_name !== undefined) updateData.company_name = company_name;
    if (company_email !== undefined) updateData.company_email = company_email;
    if (company_phone !== undefined) updateData.company_phone = company_phone;
    if (app_wens !== undefined) updateData.app_wens = app_wens;

    const [updated] = await db
      .update(donations)
      .set(updateData)
      .where(eq(donations.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
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
    const [deleted] = await db.delete(donations).where(eq(donations.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Donation not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
