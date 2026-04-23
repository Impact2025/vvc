import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendDonationConfirmation, sendSponsorConfirmation, sendAdminNewSponsor } from "@/lib/email";

const SPONSOR_TIERS = new Set(["basissponsor", "tourpartner", "hoofdtourpartner"]);

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

    // Fire-and-forget emails — nooit de API-response blokkeren
    const recipientEmail = email ?? company_email;
    if (recipientEmail && tier) {
      if (SPONSOR_TIERS.has(tier)) {
        void sendSponsorConfirmation({
          name, email: recipientEmail, amountCents: amount ?? 0, tier, companyName: company_name,
        }).catch(err => console.error("[email] sponsor confirmation:", err));

        void sendAdminNewSponsor({
          name, email: recipientEmail, amountCents: amount ?? 0, tier, companyName: company_name,
        }).catch(err => console.error("[email] admin notification:", err));
      } else {
        void sendDonationConfirmation({
          name, email: recipientEmail, amountCents: amount ?? 0, tier,
        }).catch(err => console.error("[email] donation confirmation:", err));
      }
    }

    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
