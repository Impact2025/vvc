import { NextResponse } from "next/server";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { randomBytes } from "crypto";
import { sendParentInvite } from "@/lib/email";

interface RouteContext {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);

    // Check parent exists
    const [parent] = await db.select().from(parents).where(eq(parents.id, id));
    if (!parent) {
      return NextResponse.json({ error: "Parent not found" }, { status: 404 });
    }

    // Generate a random hex token (32 bytes = 64 hex chars)
    const token = randomBytes(32).toString("hex");

    // 7 days expiry
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);

    const [updated] = await db
      .update(parents)
      .set({ invite_token: token, token_expires_at: expiresAt })
      .where(eq(parents.id, id))
      .returning();

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const inviteUrl = `${baseUrl}/invite/${token}`;

    void sendParentInvite({
      naam: parent.naam,
      email: parent.email,
      kindNaam: parent.kind_naam,
      inviteUrl,
      expiresAt,
    }).catch(err => console.error("[email] parent invite:", err));

    return NextResponse.json({ token, url: inviteUrl, expires_at: expiresAt, parent: updated });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
