"use client";

import { useState } from "react";
import MatchCard from "@/components/matches/MatchCard";
import type { Match } from "@/db/schema";
import { cn } from "@/lib/utils";

type Filter = "alle" | "upcoming" | "gespeeld";

interface MatchFilterProps {
  upcoming: Match[];
  played: Match[];
}

const filters: { key: Filter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "upcoming", label: "Aankomend" },
  { key: "gespeeld", label: "Gespeeld" },
];

export default function MatchFilter({ upcoming, played }: MatchFilterProps) {
  const [active, setActive] = useState<Filter>("alle");

  const showUpcoming = active === "alle" || active === "upcoming";
  const showPlayed = active === "alle" || active === "gespeeld";

  return (
    <div>
      {/* Filter chips */}
      <div className="flex gap-2 mb-6 overflow-x-auto pb-1">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setActive(f.key)}
            className={cn(
              "px-4 py-2 rounded-full text-xs font-bold font-headline uppercase tracking-wider whitespace-nowrap transition-all duration-150",
              active === f.key
                ? "bg-primary-container text-white shadow-sm"
                : "bg-surface-container text-on-surface-variant hover:bg-surface-container-high"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Upcoming matches */}
      {showUpcoming && upcoming.length > 0 && (
        <div className="mb-8">
          <p className="section-label mb-4">Aankomende Wedstrijden</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {upcoming.map((m) => (
              <MatchCard key={m.id} match={m} variant="upcoming" />
            ))}
          </div>
        </div>
      )}

      {/* Played matches */}
      {showPlayed && played.length > 0 && (
        <div>
          <p className="section-label mb-4">Gespeelde Wedstrijden</p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {played.map((m) => (
              <MatchCard key={m.id} match={m} variant="result" />
            ))}
          </div>
        </div>
      )}

      {/* Empty state */}
      {((active === "upcoming" && upcoming.length === 0) ||
        (active === "gespeeld" && played.length === 0) ||
        (active === "alle" && upcoming.length === 0 && played.length === 0)) && (
        <div className="card p-10 text-center">
          <p className="font-headline font-bold text-on-surface">
            Geen wedstrijden gevonden
          </p>
          <p className="text-sm text-on-surface-variant mt-1">
            Kom terug tijdens de London Tour.
          </p>
        </div>
      )}
    </div>
  );
}
