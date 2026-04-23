import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

export async function GET() {
  if (!isAdmin()) return unauthorized();

  try {
    const result = await db.select().from(settings);
    const settingsObj: Record<string, string | null> = {};
    for (const row of result) {
      settingsObj[row.key] = row.value ?? null;
    }
    return NextResponse.json(settingsObj);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  if (!isAdmin()) return unauthorized();

  try {
    const body = await req.json();
    const { key, value } = body;

    if (!key) {
      return NextResponse.json({ error: "key is required" }, { status: 400 });
    }

    const [existing] = await db.select().from(settings).where(eq(settings.key, key));

    let result;
    if (existing) {
      [result] = await db
        .update(settings)
        .set({ value: String(value) })
        .where(eq(settings.key, key))
        .returning();
    } else {
      [result] = await db
        .insert(settings)
        .values({ key, value: value !== undefined ? String(value) : null })
        .returning();
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export { POST as PUT };
