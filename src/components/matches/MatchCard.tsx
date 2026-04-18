import { MapPin, Clock } from "lucide-react";
import Badge from "@/components/ui/Badge";
import { formatDate, cn } from "@/lib/utils";
import type { Match } from "@/db/schema";

interface MatchCardProps {
  match: Match;
  variant?: "result" | "upcoming" | "highlight" | "live";
}

function getResultBadge(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "victory";
  if (homeScore < awayScore) return "defeat";
  return "draw";
}

function getResultLabel(homeScore: number, awayScore: number) {
  if (homeScore > awayScore) return "Gewonnen";
  if (homeScore < awayScore) return "Verloren";
  return "Gelijkspel";
}

export default function MatchCard({ match, variant = "upcoming" }: MatchCardProps) {
  const homeScore = match.home_score ?? 0;
  const awayScore = match.away_score ?? 0;
  const result = getResultBadge(homeScore, awayScore);

  // ── Result card ──────────────────────────────────────────────────────────
  if (variant === "result") {
    return (
      <div className="card card-hover p-5">
        <div className="flex items-start justify-between mb-3">
          <div>
            <p className="text-xs text-on-surface-variant font-medium">
              {formatDate(match.date)}
            </p>
            <p className="font-headline font-bold text-on-surface mt-0.5">
              VVC vs {match.opponent}
            </p>
          </div>
          <Badge variant={result}>{getResultLabel(homeScore, awayScore)}</Badge>
        </div>

        {/* Score */}
        <div className="flex items-center gap-3 mb-3">
          <span className="text-4xl font-black font-headline text-on-surface tabular-nums">
            {homeScore}
          </span>
          <span className="text-lg text-outline font-bold">—</span>
          <span className="text-4xl font-black font-headline text-on-surface-variant tabular-nums">
            {awayScore}
          </span>
        </div>

        {match.location && (
          <div className="flex items-center gap-1.5 text-xs text-on-surface-variant">
            <MapPin size={12} />
            {match.location}
          </div>
        )}
      </div>
    );
  }

  // ── Live card ────────────────────────────────────────────────────────────
  if (variant === "live") {
    return (
      <div className="card p-6 border-l-4 border-l-green-500 bg-green-50/20">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse inline-block" />
            <p className="section-label text-green-600">Live Nu</p>
          </div>
          <Badge variant="live" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary font-label mb-1">VVC</p>
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
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-1 truncate">
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

  // ── Highlight card (next upcoming) ──────────────────────────────────────
  if (variant === "highlight") {
    return (
      <div className="card card-hover p-6 border-l-4 border-l-primary-container">
        <div className="flex items-center justify-between mb-4">
          <p className="section-label">Volgende Wedstrijd</p>
          <Badge variant="upcoming" />
        </div>

        <div className="flex items-center justify-between gap-4">
          <div className="text-center flex-1">
            <p className="text-xs font-bold uppercase tracking-widest text-secondary font-label mb-1">
              VVC
            </p>
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
            <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant font-label mb-1 truncate">
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

  // ── Upcoming card ────────────────────────────────────────────────────────
  return (
    <div className="card card-hover p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <p className="text-xs text-on-surface-variant font-medium">{formatDate(match.date)}</p>
          <p className="font-headline font-bold text-on-surface mt-0.5">
            VVC vs {match.opponent}
          </p>
        </div>
        <Badge variant="upcoming" />
      </div>

      <div className="flex items-center gap-3 text-xs text-on-surface-variant">
        {match.time && (
          <div className="flex items-center gap-1.5">
            <Clock size={12} />
            {match.time}
          </div>
        )}
        {match.location && (
          <div className="flex items-center gap-1.5">
            <MapPin size={12} />
            <span className="truncate">{match.location}</span>
          </div>
        )}
      </div>
    </div>
  );
}
