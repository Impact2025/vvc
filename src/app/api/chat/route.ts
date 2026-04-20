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

    const { messages } = await req.json();

    // Live context uit DB
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
        return `- ${m.date} vs ${m.opponent}: ${score} [${m.status}]`;
      });

      const topScorers = [...allPlayers]
        .sort((a, b) => (b.goals ?? 0) - (a.goals ?? 0))
        .slice(0, 5)
        .map((p) => `${p.name}: ${p.goals ?? 0} goals, ${p.assists ?? 0} assists`);

      contextBlock = `Donaties: €${(raised / 100).toFixed(0)} van €${(goal / 100).toFixed(0)}
Wedstrijden:\n${matchSummary.join("\n")}
Topscorers:\n${topScorers.join("\n")}`;
    } catch (dbErr) {
      console.error("[chat] DB error:", dbErr);
    }

    const systemPrompt = `Je bent de vriendelijke assistent van VVC Goes UK — het VVC Onder 10 team dat naar Londen gaat in 2026. Spelers: Wesley, Emersen, Alex, Syb, Thomas, Sepp, Deniz, Kayne, Tyren. Antwoord in het Nederlands, warm en bondig. Geen markdown.

${contextBlock}`;

    const orResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "HTTP-Referer": process.env.NEXT_PUBLIC_APP_URL ?? "https://vvc-ashen.vercel.app",
        "X-Title": "VVC Goes UK",
      },
      body: JSON.stringify({
        model: "anthropic/claude-3.5-haiku",
        stream: false,
        max_tokens: 200,
        messages: [
          { role: "system", content: systemPrompt },
          ...messages,
        ],
      }),
    });

    if (!orResponse.ok) {
      const errText = await orResponse.text();
      console.error("[chat] OpenRouter error:", orResponse.status, errText);
      return NextResponse.json({ error: `OpenRouter ${orResponse.status}: ${errText}` }, { status: 502 });
    }

    const data = await orResponse.json();
    const reply = data.choices?.[0]?.message?.content ?? "Geen antwoord ontvangen.";

    return NextResponse.json({ reply });
  } catch (err) {
    console.error("[chat] Unhandled error:", err);
    return NextResponse.json({ error: "Interne fout" }, { status: 500 });
  }
}
