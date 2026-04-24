import { NextResponse } from "next/server";
import { db } from "@/db";
import { donations } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { sendDonationConfirmation, sendSponsorConfirmation, sendAdminNewSponsor, sendAdminNewDonation } from "@/lib/email";
import { isAdmin, unauthorized } from "@/lib/auth";

const VALID_TIERS = new Set(["vrije-donatie", "basissponsor", "tourpartner", "hoofdtourpartner"]);
const SPONSOR_TIERS = new Set(["basissponsor", "tourpartner", "hoofdtourpartner"]);

export async function GET(req: Request) {
  if (!isAdmin()) return unauthorized();

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
    const { name, message, amount, type, company_name, company_email, company_phone, app_wens, tier, email } = body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      return NextResponse.json({ error: "name is required" }, { status: 400 });
    }

    // Sanitize inputs
    const safeName = name.trim().slice(0, 100);
    const safeMessage = typeof message === "string" ? message.trim().slice(0, 500) : undefined;
    const safeCompanyName = typeof company_name === "string" ? company_name.trim().slice(0, 100) : undefined;

    // Validate tier against known values
    const safeTier = tier && VALID_TIERS.has(tier) ? tier : "vrije-donatie";

    // Amount must be a positive integer (cents)
    const safeAmount = typeof amount === "number" && Number.isInteger(amount) && amount > 0 ? amount : undefined;

    const [newDonation] = await db
      .insert(donations)
      .values({
        name: safeName,
        message: safeMessage,
        amount: safeAmount,
        type: type ?? "free",
        status: "pending",
        company_name: safeCompanyName,
        company_email: typeof company_email === "string" ? company_email.trim().slice(0, 200) : undefined,
        company_phone: typeof company_phone === "string" ? company_phone.trim().slice(0, 30) : undefined,
        app_wens,
        tier: safeTier,
        email: typeof email === "string" ? email.trim().slice(0, 200) : undefined,
      })
      .returning();

    const recipientEmail = email ?? company_email;
    if (recipientEmail && safeTier) {
      if (SPONSOR_TIERS.has(safeTier)) {
        void sendSponsorConfirmation({
          name: safeName, email: recipientEmail, amountCents: safeAmount ?? 0, tier: safeTier, companyName: safeCompanyName,
        }).catch(err => console.error("[email] sponsor confirmation:", err));

        void sendAdminNewSponsor({
          name: safeName, email: recipientEmail, amountCents: safeAmount ?? 0, tier: safeTier, companyName: safeCompanyName,
        }).catch(err => console.error("[email] admin notification:", err));
      } else {
        void sendDonationConfirmation({
          name: safeName, email: recipientEmail, amountCents: safeAmount ?? 0, tier: safeTier,
        }).catch(err => console.error("[email] donation confirmation:", err));

        void sendAdminNewDonation({
          name: safeName, email: recipientEmail, amountCents: safeAmount ?? 0, tier: safeTier,
        }).catch(err => console.error("[email] admin donation notification:", err));
      }
    }

    return NextResponse.json(newDonation, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
