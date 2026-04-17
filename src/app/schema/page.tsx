export const dynamic = "force-dynamic";

import { db } from "@/db";
import { matches } from "@/db/schema";
import { asc } from "drizzle-orm";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import MatchCard from "@/components/matches/MatchCard";
import MatchFilter from "./MatchFilter";
import type { Match } from "@/db/schema";

async function getData(): Promise<Match[]> {
  try {
    return await db.select().from(matches).orderBy(asc(matches.date));
  } catch {
    return [];
  }
}

function getStats(played: Match[]) {
  let wins = 0, draws = 0, losses = 0, goalsFor = 0, goalsAgainst = 0;
  for (const m of played) {
    const h = m.home_score ?? 0;
    const a = m.away_score ?? 0;
    goalsFor += h;
    goalsAgainst += a;
    if (h > a) wins++;
    else if (h === a) draws++;
    else losses++;
  }
  return { wins, draws, losses, goalsFor, goalsAgainst };
}

export default async function SchemaPage() {
  const allMatches = await getData();

  const upcoming = allMatches.filter((m) => m.status === "upcoming");
  const played = allMatches.filter((m) => m.status === "finished" || m.status === "live");
  const nextMatch = upcoming[0] ?? null;
  const stats = getStats(played);

  return (
    <>
      <Header activePage="schema" />
      <main className="mt-20 px-4 sm:px-6 max-w-5xl mx-auto pb-28">
        {/* Header */}
        <div className="pt-8 pb-4">
          <p className="section-label mb-1">Toernooi</p>
          <h1 className="text-3xl font-black font-headline text-on-surface">
            London Tour <span className="text-primary-container">Schema</span>
          </h1>
          <p className="text-sm text-on-surface-variant mt-1">
            {allMatches.length} wedstrijd{allMatches.length !== 1 ? "en" : ""} · {played.length} gespeeld · {upcoming.length} aankomend
          </p>
        </div>

        {/* Stats counter */}
        {played.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-8">
            {[
              { label: "Gewonnen", value: stats.wins, color: "text-green-600", bg: "bg-green-50" },
              { label: "Gelijk", value: stats.draws, color: "text-yellow-600", bg: "bg-yellow-50" },
              { label: "Verloren", value: stats.losses, color: "text-red-500", bg: "bg-red-50" },
              { label: "Goals voor", value: stats.goalsFor, color: "text-primary-container", bg: "bg-primary-fixed/20" },
              { label: "Goals tegen", value: stats.goalsAgainst, color: "text-on-surface-variant", bg: "bg-surface-container" },
            ].map(({ label, value, color, bg }) => (
              <div key={label} className={`${bg} rounded-xl p-3 text-center`}>
                <p className={`text-2xl font-black font-headline ${color}`}>{value}</p>
                <p className="text-[9px] font-bold uppercase tracking-wider text-on-surface-variant mt-0.5 leading-tight">{label}</p>
              </div>
            ))}
          </div>
        )}

        {/* Next match highlight */}
        {nextMatch && (
          <div className="mb-8">
            <MatchCard match={nextMatch} variant="highlight" />
          </div>
        )}

        {/* Filtered match list */}
        <MatchFilter upcoming={upcoming} played={played} />
      </main>
      <BottomNav />
    </>
  );
}
