import { NextResponse } from "next/server";
import { db } from "@/db";
import { matches, motm_votes, players, photos, donations } from "@/db/schema";
import { eq, count, sum } from "drizzle-orm";
import Anthropic from "@anthropic-ai/sdk";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => ({}));
    const matchIdParam = body?.match_id;

    // Gather data from DB
    const allMatches = await db.select().from(matches).orderBy(matches.date);
    const allPlayers = await db.select().from(players);
    const [{ photoCount }] = await db
      .select({ photoCount: count() })
      .from(photos)
      .where(eq(photos.approved, true));
    const [{ totalDonations }] = await db
      .select({ totalDonations: sum(donations.amount) })
      .from(donations)
      .where(eq(donations.status, "betaald"));

    // Get MOTM votes
    const allVotes = await db.select().from(motm_votes);
    const motmTally: Record<number, Record<string, number>> = {};
    for (const vote of allVotes) {
      if (!motmTally[vote.match_id]) motmTally[vote.match_id] = {};
      motmTally[vote.match_id][vote.player_name] =
        (motmTally[vote.match_id][vote.player_name] ?? 0) + 1;
    }

    // Find MOTM per match
    const motmPerMatch: Record<number, string> = {};
    for (const [matchIdStr, tally] of Object.entries(motmTally)) {
      const sorted = Object.entries(tally).sort((a, b) => b[1] - a[1]);
      if (sorted.length > 0) {
        motmPerMatch[parseInt(matchIdStr)] = sorted[0][0];
      }
    }

    // Build summary data
    const finishedMatches = allMatches.filter((m) => m.status === "finished");
    const topScorers = [...allPlayers]
      .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))
      .slice(0, 5);

    const reportData = {
      wedstrijden: finishedMatches.map((m) => ({
        datum: m.date,
        tegenstander: m.opponent,
        locatie: m.location,
        score: `${m.home_score ?? 0} - ${m.away_score ?? 0}`,
        motm: motmPerMatch[m.id] ?? null,
      })),
      topscorers: topScorers.map((p) => ({
        naam: p.name,
        goals: p.goals ?? 0,
        assists: p.assists ?? 0,
      })),
      fotos_goedgekeurd: Number(photoCount),
      opgehaald_eurocenten: Number(totalDonations ?? 0),
      totaal_wedstrijden: finishedMatches.length,
    };

    const prompt = `Schrijf een enthousiast weekendverslag in het Nederlands voor FC VVC U10 na een internationaal jeugdvoetbaltoernooi in Londen. Warm, energiek, voor ouders en kids.

Data:
${JSON.stringify(reportData, null, 2)}

Schrijf het verslag als HTML met duidelijke koppen (h2, h3), paragrafen en eventueel een bullet list met highlights. Gebruik de echte data (scorelijnen, topscorers, man of the match). Maak het levendig en persoonlijk. Geef alleen de HTML terug, geen markdown code block eromheen.`;

    const client = new Anthropic();

    const message = await client.messages.create({
      model: "claude-sonnet-4-6",
      max_tokens: 2000,
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
    });

    const htmlContent = message.content
      .filter((block) => block.type === "text")
      .map((block) => (block as { type: "text"; text: string }).text)
      .join("");

    return NextResponse.json({ html: htmlContent, data: reportData });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
