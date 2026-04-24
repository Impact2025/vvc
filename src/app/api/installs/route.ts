import { NextResponse } from "next/server";
import { db } from "@/db";
import { app_installs } from "@/db/schema";
import { count } from "drizzle-orm";
import { isAdmin, unauthorized } from "@/lib/auth";

const VALID_EVENTS = new Set(["prompted", "accepted", "dismissed", "ios_shown"]);
const VALID_PLATFORMS = new Set(["android", "ios"]);

export async function POST(req: Request) {
  try {
    const { event, platform } = await req.json();
    if (!event || !VALID_EVENTS.has(event)) {
      return NextResponse.json({ error: "invalid event" }, { status: 400 });
    }
    await db.insert(app_installs).values({
      event,
      platform: VALID_PLATFORMS.has(platform) ? platform : null,
    });
    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function GET() {
  if (!isAdmin()) return unauthorized();
  const rows = await db.select({ event: app_installs.event, total: count() })
    .from(app_installs)
    .groupBy(app_installs.event);
  return NextResponse.json(rows);
}
