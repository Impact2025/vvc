import { NextResponse } from "next/server";
import { db } from "@/db";
import { parents } from "@/db/schema";
import { eq } from "drizzle-orm";
import { hashPin } from "@/lib/parentAuth";
import { cookies } from "next/headers";

interface RouteContext {
  params: { id: string };
}

export async function POST(req: Request, { params }: RouteContext) {
  const cookieStore = cookies();
  const session = cookieStore.get("vvc_admin_session");
  if (!session || session.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Niet geautoriseerd" }, { status: 401 });
  }

  const { pin } = await req.json();
  if (!/^\d{4}$/.test(String(pin))) {
    return NextResponse.json({ error: "Pincode moet 4 cijfers zijn" }, { status: 400 });
  }

  const id = parseInt(params.id);
  const hashed = await hashPin(String(pin));
  const [updated] = await db
    .update(parents)
    .set({ pincode: hashed })
    .where(eq(parents.id, id))
    .returning({ id: parents.id });

  if (!updated) return NextResponse.json({ error: "Niet gevonden" }, { status: 404 });
  return NextResponse.json({ ok: true });
}
