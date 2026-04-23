import { pusherServer } from "@/lib/pusher";
import { broadcastPush } from "@/lib/sendPush";
import { NextResponse } from "next/server";
import { isAdminOrScorekeeper, unauthorized } from "@/lib/auth";

export async function POST(req: Request) {
  if (!isAdminOrScorekeeper()) return unauthorized();

  try {
    const { channel, event, data } = await req.json();

    if (!channel || !event) {
      return NextResponse.json({ error: "channel and event are required" }, { status: 400 });
    }

    if (!pusherServer) {
      return NextResponse.json({ error: "Pusher not configured" }, { status: 503 });
    }
    await pusherServer.trigger(channel, event, data ?? {});

    if (event === "live-event" && data?.type === "goal") {
      broadcastPush({
        title: data.title ?? "DOELPUNT! ⚽🎉",
        body: data.description ?? "VVC heeft gescoord!",
        url: "/live",
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
