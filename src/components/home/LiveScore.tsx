"use client";

import { useEffect, useState } from "react";
import { MapPin } from "lucide-react";
import { getPusherClient } from "@/lib/pusher";
import Badge from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils";
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
    const poll = async () => {
      try {
        const res = await fetch("/api/match/current");
        if (!res.ok) return;
        const data: Match | null = await res.json();
        setMatch(data);
      } catch {
        // ignore
      }
    };
    poll();
    const id = setInterval(poll, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (!match) return;
    const pusher = getPusherClient();
    if (!pusher) return;
    const channel = pusher.subscribe("wedstrijden");
    channel.bind("score-update", (data: ScoreUpdate) => {
      if (data.matchId === match.id) {
        setMatch((prev) =>
          prev ? { ...prev, home_score: data.homeScore, away_score: data.awayScore, status: data.status ?? prev.status } : prev
        );
      }
    });
    return () => {
      channel.unbind_all();
      pusher.unsubscribe("wedstrijden");
      pusher.disconnect();
    };
  }, [match?.id]);

  if (!match) return null;

  const isLive = match.status === "live";
  const isFinished = match.status === "finished";
  const homeScore = match.home_score ?? 0;
  const awayScore = match.away_score ?? 0;

  // ── Live: grote score ────────────────────────────────────────────────────
  if (isLive) {
    return (
      <div className="card mb-6 p-6 border-l-4 border-l-green-500 bg-green-50/20 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <p className="section-label text-green-600">Live Nu</p>
          </div>
          <Badge variant="live" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary font-label mb-2">VVC</p>
            <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center">
              <span className="text-2xl font-black font-headline text-secondary">V</span>
            </div>
          </div>
          <div className="text-center px-2">
            <div className="flex items-center gap-2">
              <span className="text-5xl font-black font-headline text-on-surface tabular-nums">{homeScore}</span>
              <span className="text-2xl text-outline font-bold">–</span>
              <span className="text-5xl font-black font-headline text-on-surface-variant tabular-nums">{awayScore}</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{formatDate(match.date)}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-2 truncate">
              {match.opponent}
            </p>
            <div className="w-14 h-14 mx-auto rounded-xl bg-surface-container flex items-center justify-center">
              <span className="text-2xl font-black font-headline text-on-surface-variant">
                {match.opponent.charAt(0)}
              </span>
            </div>
          </div>
        </div>

        {match.location && (
          <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
            <MapPin size={12} />
            {match.location}
          </div>
        )}
      </div>
    );
  }

  // ── Afgelopen: score tonen ───────────────────────────────────────────────
  if (isFinished) {
    const badge = homeScore > awayScore ? "victory" : homeScore < awayScore ? "defeat" : "draw";
    return (
      <div className="card card-hover mb-6 p-6 animate-fade-in">
        <div className="flex items-center justify-between mb-4">
          <p className="section-label">Laatste Wedstrijd</p>
          <Badge variant={badge} />
        </div>
        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary font-label mb-2">VVC</p>
            <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center">
              <span className="text-2xl font-black font-headline text-secondary">V</span>
            </div>
          </div>
          <div className="text-center px-2">
            <div className="flex items-center gap-2">
              <span className="text-5xl font-black font-headline text-on-surface tabular-nums">{homeScore}</span>
              <span className="text-2xl text-outline font-bold">–</span>
              <span className="text-5xl font-black font-headline text-on-surface-variant tabular-nums">{awayScore}</span>
            </div>
            <p className="text-xs text-on-surface-variant mt-1">{formatDate(match.date)}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-2 truncate">
              {match.opponent}
            </p>
            <div className="w-14 h-14 mx-auto rounded-xl bg-surface-container flex items-center justify-center">
              <span className="text-2xl font-black font-headline text-on-surface-variant">
                {match.opponent.charAt(0)}
              </span>
            </div>
          </div>
        </div>
        {match.location && (
          <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
            <MapPin size={12} />
            {match.location}
          </div>
        )}
      </div>
    );
  }

  // ── Volgende wedstrijd: highlight stijl ──────────────────────────────────
  return (
    <div className="card card-hover mb-6 p-6 border-l-4 border-l-primary-container animate-fade-in">
      <div className="flex items-center justify-between mb-4">
        <p className="section-label">Volgende Wedstrijd</p>
        <Badge variant="upcoming" />
      </div>

      <div className="flex items-center justify-between gap-4">
        <div className="text-center flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-secondary font-label mb-2">VVC</p>
          <div className="w-14 h-14 mx-auto rounded-xl bg-secondary/10 flex items-center justify-center">
            <span className="text-2xl font-black font-headline text-secondary">V</span>
          </div>
        </div>

        <div className="text-center px-4">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-1 font-label">
            {match.time ?? "TBD"}
          </p>
          <p className="text-2xl font-black font-headline text-primary-container italic">VS</p>
          <p className="text-xs text-on-surface-variant mt-1 font-medium">
            {formatDate(match.date)}
          </p>
        </div>

        <div className="text-center flex-1">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-2 truncate">
            {match.opponent}
          </p>
          <div className="w-14 h-14 mx-auto rounded-xl bg-surface-container flex items-center justify-center">
            <span className="text-2xl font-black font-headline text-on-surface-variant">
              {match.opponent.charAt(0)}
            </span>
          </div>
        </div>
      </div>

      {match.location && (
        <div className="flex items-center justify-center gap-1.5 mt-4 pt-4 border-t border-outline-variant/10 text-xs text-on-surface-variant">
          <MapPin size={12} />
          {match.location}
        </div>
      )}
    </div>
  );
}
