import { db } from "@/db";
import { matches, players, settings } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextResponse } from "next/server";

export const runtime = "nodejs";
export const maxDuration = 30;

export async function POST(req: Request) {
  try {
    const apiKey = process.env.OPENROUTER_API_KEY;
    if (!apiKey) {
      return NextResponse.json({ error: "API key ontbreekt" }, { status: 500 });
    }

    const body = await req.json();
    const { messages } = body;

    // Fetch live context from DB (fail gracefully)
    let contextBlock = "Livedata tijdelijk niet beschikbaar.";
    try {
      const [allMatches, allPlayers, settingsRows] = await Promise.all([
        db.select().from(matches).orderBy(desc(matches.date)),
        db.select().from(players),
        db.select().from(settings),
      ]);

      const settingsMap = Object.fromEntries(
        settingsRows.map((s) => [s.key, s.value ?? "0"])
      );
      const raised = parseInt(settingsMap["donatie_raised"] ?? "0", 10);
      const goal = parseInt(settingsMap["donatie_goal"] ?? "150000", 10);

      const matchSummary = allMatches.map((m) => {
        const score =
          m.status === "finished" || m.status === "live"
            ? `${m.home_score ?? 0}-${m.away_score ?? 0}`
            : "nog niet gespeeld";
        return `- ${m.date} vs ${m.opponent} (${m.location ?? "?"}): ${score} [${m.status}]`;
      });

      const topScorers = [...allPlayers]
        .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))
        .slice(0, 5)
        .map((p) => `${p.name}: ${p.goals ?? 0} goals, ${p.assists ?? 0} assists`);

      contextBlock = `
## Live data VVC Goes UK
Donatiedoel: €${(goal / 100).toFixed(0)} | Opgehaald: €${(raised / 100).toFixed(0)} (${Math.round((raised / goal) * 100)}%)

Wedstrijden:
${matchSummary.join("\n")}

Topscorers:
${topScorers.join("\n")}`;
    } catch (dbErr) {
      console.error("[chat] DB error:", dbErr);
    }

    const systemPrompt = `Je bent de vriendelijke assistent van VVC Goes UK — een reis waarbij het VVC U10 jeugdvoetbalteam (de "Little Lions") uit Nederland naar Londen gaat voor een internationaal toernooi in 2026.

Je helpt ouders en sponsoren met vragen over:
- Wedstrijden, scores en speelschema
- Donatiecampagne en sponsorpakketten
- De reis (Londen, logistiek, datum)
- De spelers en het team
- Hoe de app werkt (foto's, live score, dagboek)

Antwoord altijd in het Nederlands. Wees warm, enthousiast en kort. Gebruik geen markdown, gewone tekst. Als je iets niet weet, zeg dat eerlijk.

${contextBlock}`;

    const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://vvcgoesuk.com",
        "X-Title": "VVC Goes UK",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-haiku",
        stream: true,
        max_tokens: 400,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!orResponse.ok) {
      const errText = await orResponse.text();
      console.error("[chat] OpenRouter error:", errText);
      return NextResponse.json({ error: "OpenRouter fout" }, { status: 502 });
    }

    return new Response(orResponse.body, {
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache",
        Connection: "keep-alive",
      },
    });
  } catch (err) {
    console.error("[chat] Unhandled error:", err);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
