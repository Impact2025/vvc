import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { eq, and } from "drizzle-orm";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const statusParam = searchParams.get("status");
    const typeParam = searchParams.get("type");

    let query = db.select().from(donations).$dynamic();
    const conditions = [];

    if (statusParam && statusParam !== "all") {
      conditions.push(eq(donations.status, statusParam));
    }

    if (typeParam && typeParam !== "all") {
      conditions.push(eq(donations.type, typeParam));
    }

    if (conditions.length === 1) {
      query = query.where(conditions[0]);
    } else if (conditions.length > 1) {
      query = query.where(and(...conditions));
    }

    const result = await query.orderBy(donations.created_at);
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { name, message, amount, type, status, company_name, company_email, company_phone, app_wens, tier, email } = body;

    if (!name) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    const [newDonation] = await db
      .insert(donations)
      .values({
        name,
        message,
        amount,
        type: type ?? "free",
        status: status ?? "pending",
        company_name,
        company_email,
        company_phone,
        app_wens,
        tier,
        email,
      })
      .returning();

    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
