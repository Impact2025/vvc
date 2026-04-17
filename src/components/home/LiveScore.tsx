"use client";

import { useEffect, useState } from "react";
import { MapPin, Shield } from "lucide-react";
import { getPusherClient } from "@/lib/pusher";
import Badge from "@/components/ui/Badge";
import { cn } from "@/lib/utils";
import type { Match } from "@/db/schema";

interface LiveScoreProps {
  match: Match | null;
}

interface ScoreUpdate {
  matchId: number;
  homeScore: number;
  awayScore: number;
  status?: string;
}

export default function LiveScore({ match: initialMatch }: LiveScoreProps) {
  const [match, setMatch] = useState<Match | null>(initialMatch);

  useEffect(() => {
    setMatch(initialMatch);
  }, [initialMatch]);

  useEffect(() => {
    if (!match) return;
    const pusher = getPusherClient();
    if (!pusher) return; // Pusher not configured yet

    const channel = pusher.subscribe("wedstrijden");
    channel.bind("score-update", (data: ScoreUpdate) => {
      if (data.matchId === match.id) {
        setMatch((prev) =>
          prev
            ? {
                ...prev,
                home_score: data.homeScore,
                away_score: data.awayScore,
                status: data.status ?? prev.status,
              }
            : prev
        );
      }
    });

    return () => {
      channel.unbind_all();
      pusher.unsubscribe("wedstrijden");
      pusher.disconnect();
    };
  }, [match?.id]);

  if (!match) {
    return (
      <div className="card card-hover p-6 mb-6 animate-fade-in">
        <p className="section-label mb-4">Huidig Programma</p>
        <div className="flex flex-col items-center justify-center py-10 text-center">
          <Shield size={40} className="text-outline mb-3" />
          <p className="font-headline font-bold text-on-surface">Geen live wedstrijd</p>
          <p className="text-sm text-on-surface-variant mt-1">
            Kom terug tijdens de London Tour voor live updates.
          </p>
        </div>
      </div>
    );
  }

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";

  return (
    <div
      className={cn(
        "card card-hover mb-6 overflow-hidden animate-fade-in",
        isLive && "border-l-4 border-l-primary-container shadow-sm"
      )}
    >
      <div className="p-6">
        <div className="flex items-center justify-between mb-5">
          <p className="section-label">
            {isLive ? "Live Nu" : isFinished ? "Laatste Wedstrijd" : "Volgende Wedstrijd"}
          </p>
          {isLive ? (
            <Badge variant="live" />
          ) : isFinished ? (
            <Badge
              variant={
                (match.home_score ?? 0) > (match.away_score ?? 0)
                  ? "victory"
                  : (match.home_score ?? 0) < (match.away_score ?? 0)
                  ? "defeat"
                  : "draw"
              }
            />
          ) : (
            <Badge variant="upcoming" />
          )}
        </div>

        {/* Score Row */}
        <div className="flex items-center justify-between gap-4">
          {/* VVC */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 rounded-xl bg-secondary/10 flex items-center justify-center">
              <Shield size={24} className="text-secondary" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface font-label">
              VVC
            </span>
          </div>

          {/* Score */}
          <div className="flex items-center gap-3">
            <span
              className={cn(
                "text-5xl font-black font-headline tabular-nums",
                isLive ? "text-on-surface" : "text-on-surface-variant"
              )}
            >
              {match.home_score ?? 0}
            </span>
            <span className="text-2xl font-black font-headline text-outline">—</span>
            <span
              className={cn(
                "text-5xl font-black font-headline tabular-nums",
                isLive ? "text-primary-container" : "text-on-surface-variant"
              )}
            >
              {match.away_score ?? 0}
            </span>
          </div>

          {/* Opponent */}
          <div className="flex flex-col items-center gap-2 flex-1">
            <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center">
              <Shield size={24} className="text-outline" />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label text-center leading-tight">
              {match.opponent}
            </span>
          </div>
        </div>

        {/* Bottom info row */}
        <div className="flex items-center justify-center gap-4 mt-5 pt-4 border-t border-outline-variant/10">
          {match.location && (
            <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
              <MapPin size={12} />
              <span className="font-medium">{match.location}</span>
            </div>
          )}
          {match.time && (
            <div className="text-xs text-on-surface-variant font-medium">
              {match.time}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
