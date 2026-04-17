import { pusherServer } from "@/lib/pusher";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { channel, event, data } = await req.json();

    if (!channel || !event) {
      return NextResponse.json({ error: "channel and event are required" }, { status: 400 });
    }

    if (!pusherServer) {
      return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
    }
    await pusherServer.trigger(channel, event, data ?? {});
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
