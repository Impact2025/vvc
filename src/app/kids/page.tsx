export const dynamic = "force-dynamic";

import { db } from "@/db";
import { players, diary_entries } from "@/db/schema";
import { asc, desc } from "drizzle-orm";
import Header from "@/components/layout/Header";
import BottomNav from "@/components/layout/BottomNav";
import TopBallers from "@/components/kids/TopBallers";
import TourAwards from "@/components/kids/TourAwards";
import type { Player, DiaryEntry } from "@/db/schema";
import { formatDate } from "@/lib/utils";

interface DiaryWithPlayer extends DiaryEntry {
  player: Player | null;
}

async function getData() {
  try {
    const allPlayers = await db.select().from(players).orderBy(desc(players.goals));
    const allEntries = await db
      .select()
      .from(diary_entries)
      .orderBy(asc(diary_entries.day), desc(diary_entries.created_at));

    const playerMap = new Map(allPlayers.map((p) => [p.id, p]));
    const entries: DiaryWithPlayer[] = allEntries.map((e) => ({
      ...e,
      player: playerMap.get(e.player_id) ?? null,
    }));

    return { players: allPlayers, entries };
  } catch {
    return { players: [], entries: [] };
  }
}

const dayLabels: Record<number, string> = {
  1: "Dag 1",
  2: "Dag 2",
  3: "Dag 3",
};

const dayColors: Record<number, string> = {
  1: "bg-primary-container text-white",
  2: "bg-secondary text-white",
  3: "bg-tertiary text-white",
};

export default async function KidsPage() {
  const { players: allPlayers, entries } = await getData();

  // Group entries by day
  const byDay = new Map<number, DiaryWithPlayer[]>();
  for (const entry of entries) {
    if (!byDay.has(entry.day)) byDay.set(entry.day, []);
    byDay.get(entry.day)!.push(entry);
  }

  return (
    <>
      <Header activePage="kids" />
      <main className="mt-20 px-4 sm:px-6 max-w-5xl mx-auto pb-28">
        {/* Hero */}
        <div className="pt-8 pb-6">
          <p className="section-label mb-1">Kids Corner</p>
          <h1 className="text-3xl sm:text-4xl font-black font-headline text-on-surface leading-tight">
            Little Lions{" "}
            <span className="text-primary-container">on Tour</span>
          </h1>
          <p className="text-on-surface-variant mt-2 text-sm leading-relaxed max-w-lg">
            Statistieken, dagboekverslagen en avonturen van onze jongens in Londen.
          </p>
        </div>

        {/* Top Ballers */}
        <section className="mb-12">
          <TopBallers players={allPlayers} />
        </section>

        {/* Tour Awards */}
        <TourAwards players={allPlayers} />

        {/* Tour Dagboek */}
        <section>
          <p className="section-label mb-5">Tour Dagboek</p>

          {entries.length === 0 ? (
            <div className="card p-10 text-center">
              <span className="text-4xl block mb-3">📔</span>
              <p className="font-headline font-bold text-on-surface">
                Het dagboek is nog leeg
              </p>
              <p className="text-sm text-on-surface-variant mt-1">
                De jongens vullen het bij tijdens de tour!
              </p>
            </div>
          ) : (
            <div className="space-y-8">
              {Array.from(byDay.entries()).map(([day, dayEntries]) => (
                <div key={day}>
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest font-label ${
                        dayColors[day] ?? "bg-surface-container-highest text-on-surface"
                      }`}
                    >
                      {dayLabels[day] ?? `Dag ${day}`}
                    </span>
                    <div className="flex-1 h-px bg-outline-variant/20" />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {dayEntries.map((entry) => (
                      <div
                        key={entry.id}
                        className="card card-hover p-5 animate-fade-in"
                      >
                        {entry.player && (
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-8 h-8 rounded-full bg-primary-container/10 flex items-center justify-center">
                              <span className="text-xs font-black font-headline text-primary-container">
                                {entry.player.number ?? "?"}
                              </span>
                            </div>
                            <div>
                              <p className="text-sm font-bold font-headline text-on-surface">
                                {entry.player.name}
                              </p>
                              {entry.player.position && (
                                <p className="text-[10px] text-outline uppercase tracking-wider">
                                  {entry.player.position}
                                </p>
                              )}
                            </div>
                          </div>
                        )}
                        <p className="text-sm text-on-surface-variant leading-relaxed">
                          {entry.content}
                        </p>
                        {entry.created_at && (
                          <p className="text-[11px] text-outline mt-3">
                            {formatDate(entry.created_at)}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>
      </main>
      <BottomNav />
    </>
  );
}
