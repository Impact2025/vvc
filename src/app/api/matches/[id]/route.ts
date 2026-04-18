import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches } from "@/db/schema";
import { eq } from "drizzle-orm";
import { pusherServer } from "@/lib/pusher";
import { broadcastPush } from "@/lib/sendPush";

interface RouteContext {
  params: { id: string };
}

export async function GET(_req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const [match] = await db.select().from(matches).where(eq(matches.id, id));

    if (!match) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json(match);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function PATCH(req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const body = await req.json();
    const { opponent, date, time, location, home_score, away_score, status, scorer_name } = body;

    const [current] = await db.select().from(matches).where(eq(matches.id, id));
    if (!current) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    const updateData: Partial<typeof matches.$inferInsert> = {};
    if (opponent !== undefined) updateData.opponent = opponent;
    if (date !== undefined) updateData.date = date;
    if (time !== undefined) updateData.time = time;
    if (location !== undefined) updateData.location = location;
    if (home_score !== undefined) updateData.home_score = home_score;
    if (away_score !== undefined) updateData.away_score = away_score;
    if (status !== undefined) updateData.status = status;

    if (
      home_score !== undefined &&
      home_score > (current.home_score ?? 0) &&
      scorer_name
    ) {
      const scorers: string[] = JSON.parse(current.home_scorers ?? "[]");
      scorers.push(scorer_name);
      updateData.home_scorers = JSON.stringify(scorers);
    }

    const [updated] = await db
      .update(matches)
      .set(updateData)
      .where(eq(matches.id, id))
      .returning();

    if (!updated) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    // Trigger Pusher real-time update
    if (pusherServer && (home_score !== undefined || away_score !== undefined || status !== undefined)) {
      await pusherServer.trigger("wedstrijden", "score-update", {
        matchId: id,
        homeScore: updated.home_score,
        awayScore: updated.away_score,
        status: updated.status,
        scorer: scorer_name ?? null,
      });
    }

    // Push notifications voor grote events
    if (status === "live") {
      broadcastPush({
        title: "Wedstrijd begonnen! ⚽",
        body: `VVC vs ${updated.opponent} is gestart!`,
        url: "/live",
      });
    } else if (status === "finished") {
      broadcastPush({
        title: "Wedstrijd afgelopen",
        body: `Eindstand VVC ${updated.home_score}–${updated.away_score} ${updated.opponent}`,
        url: "/live",
      });
    } else if (home_score !== undefined || away_score !== undefined) {
      broadcastPush({
        title: "DOELPUNT! ⚽🎉",
        body: scorer_name
          ? `${scorer_name} scoort! VVC ${updated.home_score}–${updated.away_score} ${updated.opponent}`
          : `VVC ${updated.home_score}–${updated.away_score} ${updated.opponent}`,
        url: "/live",
      });
    }

    return NextResponse.json(updated);
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function DELETE(_req: Request, { params }: RouteContext) {
  try {
    const id = parseInt(params.id);
    const [deleted] = await db.delete(matches).where(eq(matches.id, id)).returning();

    if (!deleted) {
      return NextResponse.json({ error: "Match not found" }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
