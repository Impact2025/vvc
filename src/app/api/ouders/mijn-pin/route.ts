import { NextResponse } from "next/server";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPin } from "@/lib/parentAuth";
import { getParentSession } from "@/lib/parentSession";

export async function PATCH(req: Request) {
  try {
    const session = await getParentSession();
    if (!session) {
      return NextResponse.json({ error: "Niet ingelogd" }, { status: 401 });
    }

    const { pin } = await req.json();
    if (!/^\d{4}$/.test(String(pin))) {
      return NextResponse.json({ error: "Pincode moet 4 cijfers zijn" }, { status: 400 });
    }
    if (pin === "1234") {
      return NextResponse.json({ error: "Kies een andere pincode dan 1234" }, { status: 400 });
    }

    const hashed = await hashPin(String(pin));
    await db
      .update(parents)
      .set({ pincode: hashed, pincode_is_tijdelijk: false })
      .where(eq(parents.id, session.id));

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error("PATCH /api/ouders/mijn-pin error:", err);
    return NextResponse.json({ error: "Server fout" }, { status: 500 });
  }
}
