import { NextResponse } from "next/server";
import { db } from "@/db";
import { checkins } from "@/db/schema";
import { asc } from "drizzle-orm";
import { broadcastPush } from "@/lib/sendPush";

export async function GET() {
  try {
    const result = await db.select().from(checkins).orderBy(asc(checkins.created_at));
    return NextResponse.json(result);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { location_name, lat, lng, description, emoji } = body;

    if (!location_name || lat === undefined || lng === undefined) {
      return NextResponse.json({ error: "location_name, lat en lng zijn verplicht" }, { status: 400 });
    }

    const [newCheckin] = await db
      .insert(checkins)
      .values({ location_name, lat, lng, description, emoji })
      .returning();

    broadcastPush({
      title: `${emoji || "📍"} VVC is er nu!`,
      body: `${location_name}${description ? ` — ${description}` : ""}`,
      url: "/londen",
    });

    return NextResponse.json(newCheckin, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
