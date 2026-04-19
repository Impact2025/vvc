import { NextResponse } from "next/server";
import { db } from "@/db";
import { settings } from "@/db/schema";
import { eq } from "drizzle-orm";
import { cookies } from "next/headers";

export const dynamic = "force-dynamic";

async function upsertSetting(key: string, value: string) {
  const [existing] = await db.select().from(settings).where(eq(settings.key, key));
  if (existing) {
    await db.update(settings).set({ value }).where(eq(settings.key, key));
  } else {
    await db.insert(settings).values({ key, value });
  }
}

export async function GET() {
  try {
    const rows = await db.select().from(settings);
    const map = Object.fromEntries(rows.map((r) => [r.key, r.value ?? ""]));

    if (map.gps_active !== "true") {
      return NextResponse.json({ active: false });
    }

    return NextResponse.json({
      active: true,
      lat: parseFloat(map.gps_lat ?? "0"),
      lng: parseFloat(map.gps_lng ?? "0"),
      updatedAt: map.gps_updated_at ?? null,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  const cookieStore = await cookies();
  const session = cookieStore.get("vvc_admin_session");
  if (!session || session.value !== process.env.ADMIN_SECRET) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { lat, lng, active } = body;

    if (active === false) {
      await upsertSetting("gps_active", "false");
      return NextResponse.json({ ok: true });
    }

    if (typeof lat !== "number" || typeof lng !== "number") {
      return NextResponse.json({ error: "lat en lng zijn verplicht" }, { status: 400 });
    }

    await Promise.all([
      upsertSetting("gps_lat", String(lat)),
      upsertSetting("gps_lng", String(lng)),
      upsertSetting("gps_updated_at", new Date().toISOString()),
      upsertSetting("gps_active", "true"),
    ]);

    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
