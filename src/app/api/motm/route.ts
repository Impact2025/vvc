import { NextResponse } from "next/server";
import { db } from "@/db";
import { motm_votes } from "@/db/schema";
import { eq, and, count } from "drizzle-orm";
import { headers } from "next/headers";

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const matchIdParam = searchParams.get("match_id");

    if (!matchIdParam) {
      return NextResponse.json({ error: "match_id is required" }, { status: 400 });
    }

    const matchId = parseInt(matchIdParam);

    const votes = await db
      .select()
      .from(motm_votes)
      .where(eq(motm_votes.match_id, matchId));

    // Tally votes per player
    const tally: Record<string, number> = {};
    for (const vote of votes) {
      tally[vote.player_name] = (tally[vote.player_name] ?? 0) + 1;
    }

    const sorted = Object.entries(tally)
      .map(([player_name, votes]) => ({ player_name, votes }))
      .sort((a, b) => b.votes - a.votes);

    return NextResponse.json({ match_id: matchId, total: votes.length, results: sorted });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { match_id, player_name } = body;

    if (!match_id || !player_name) {
      return NextResponse.json({ error: "match_id and player_name are required" }, { status: 400 });
    }

    // Get voter IP
    const headersList = await headers();
    const forwarded = headersList.get("x-forwarded-for");
    const voter_ip = forwarded ? forwarded.split(",")[0].trim() : "unknown";

    // Check if this IP already voted for this match
    const [existingVote] = await db
      .select()
      .from(motm_votes)
      .where(
        and(
          eq(motm_votes.match_id, match_id),
          eq(motm_votes.voter_ip, voter_ip)
        )
      );

    if (existingVote) {
      return NextResponse.json({ error: "Je hebt al gestemd voor deze wedstrijd" }, { status: 409 });
    }

    await db.insert(motm_votes).values({ match_id, player_name, voter_ip });

    // Return updated vote counts for this match
    const votes = await db
      .select()
      .from(motm_votes)
      .where(eq(motm_votes.match_id, match_id));

    const tally: Record<string, number> = {};
    for (const vote of votes) {
      tally[vote.player_name] = (tally[vote.player_name] ?? 0) + 1;
    }

    const sorted = Object.entries(tally)
      .map(([player_name, votes]) => ({ player_name, votes }))
      .sort((a, b) => b.votes - a.votes);

    return NextResponse.json({ success: true, match_id, total: votes.length, results: sorted }, { status: 201 });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
