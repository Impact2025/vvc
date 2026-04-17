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

export default async function SchemaPage() {
  const allMatches = await getData();

  const upcoming = allMatches.filter((m) => m.status === "upcoming");
  const played = allMatches.filter(
    (m) => m.status === "finished" || m.status === "live"
  );
  const nextMatch = upcoming[0] ?? null;

  return (
    <>
      <Header activePage="schema" />
      <main className="mt-20 px-4 sm:px-6 max-w-5xl mx-auto pb-28">
        {/* Header */}
        <div className="pt-8 pb-6">
          <p className="section-label mb-1">Toernooi</p>
          <h1 className="text-3xl font-black font-headline text-on-surface">
            London Tour <span className="text-primary-container">Schema</span>
          </h1>
        </div>

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
