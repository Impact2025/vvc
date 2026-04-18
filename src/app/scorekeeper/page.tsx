"use client";

import { useState, useEffect, useCallback } from "react";
import Image from "next/image";
import toast, { Toaster } from "react-hot-toast";

interface Match {
  id: number;
  opponent: string;
  date: string;
  time: string | null;
  location: string | null;
  home_score: number;
  away_score: number;
  status: string;
}

type ScoreUpdate = Partial<Pick<Match, "home_score" | "away_score" | "status">>;

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Gepland", active: "bg-blue-100 text-blue-700 border-blue-200", inactive: "text-gray-400 border-gray-100" },
  { value: "live", label: "● Live", active: "bg-green-500 text-white border-green-500", inactive: "text-gray-400 border-gray-100" },
  { value: "finished", label: "Gespeeld", active: "bg-gray-200 text-gray-700 border-gray-200", inactive: "text-gray-400 border-gray-100" },
];

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
}

function MatchCard({ match, saving, onUpdate }: { match: Match; saving: boolean; onUpdate: (d: ScoreUpdate) => void }) {
  const isLive = match.status === "live";
  const opponentShort = match.opponent.split(" ").slice(0, 2).join(" ");

  return (
    <div className={`bg-white rounded-2xl shadow-sm overflow-hidden border-2 transition-all ${isLive ? "border-green-400" : "border-transparent"} ${saving ? "opacity-60" : ""}`}>
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between mb-0.5">
          <span className="text-xs text-gray-400 font-medium">{match.time ?? ""}{match.location ? ` · ${match.location}` : ""}</span>
          {saving && <span className="text-xs text-orange-400 font-semibold">Opslaan…</span>}
        </div>
        <p className="font-black text-gray-900 text-base">VVC <span className="font-normal text-gray-400">vs</span> {match.opponent}</p>
      </div>

      {/* Status toggle */}
      <div className="px-4 py-3 flex gap-2">
        {STATUS_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => match.status !== opt.value && onUpdate({ status: opt.value })}
            disabled={saving}
            className={`flex-1 py-2 rounded-xl text-xs font-bold border transition-all ${match.status === opt.value ? opt.active : opt.inactive}`}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Score */}
      <div className="px-4 pb-5 grid grid-cols-[1fr_auto_1fr] items-center gap-3">
        {/* VVC */}
        <div>
          <p className="text-xs font-bold text-gray-400 text-center mb-2">VVC</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdate({ home_score: Math.max(0, match.home_score - 1) })}
              disabled={saving || match.home_score === 0}
              className="w-12 h-12 rounded-xl bg-gray-100 text-2xl font-bold text-gray-600 active:bg-gray-200 disabled:opacity-30 flex items-center justify-center"
            >
              −
            </button>
            <span className="flex-1 text-center text-5xl font-black text-gray-900 tabular-nums">{match.home_score}</span>
            <button
              onClick={() => onUpdate({ home_score: match.home_score + 1 })}
              disabled={saving}
              className="w-12 h-12 rounded-xl bg-orange-500 text-2xl font-bold text-white active:bg-orange-600 flex items-center justify-center shadow-sm"
            >
              +
            </button>
          </div>
        </div>

        <span className="text-3xl font-black text-gray-200 mb-0 mt-4">–</span>

        {/* Opponent */}
        <div>
          <p className="text-xs font-bold text-gray-400 text-center mb-2">{opponentShort}</p>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => onUpdate({ away_score: Math.max(0, match.away_score - 1) })}
              disabled={saving || match.away_score === 0}
              className="w-12 h-12 rounded-xl bg-gray-100 text-2xl font-bold text-gray-600 active:bg-gray-200 disabled:opacity-30 flex items-center justify-center"
            >
              −
            </button>
            <span className="flex-1 text-center text-5xl font-black text-gray-900 tabular-nums">{match.away_score}</span>
            <button
              onClick={() => onUpdate({ away_score: match.away_score + 1 })}
              disabled={saving}
              className="w-12 h-12 rounded-xl bg-gray-100 text-2xl font-bold text-gray-600 active:bg-gray-200 flex items-center justify-center"
            >
              +
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function ScorekeeperPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchMatches = useCallback(async () => {
    const res = await fetch("/api/matches");
    const data: Match[] = await res.json();
    const statusOrder: Record<string, number> = { live: 0, upcoming: 1, finished: 2 };
    data.sort((a, b) => {
      const aToday = isToday(a.date) ? 0 : 1;
      const bToday = isToday(b.date) ? 0 : 1;
      if (aToday !== bToday) return aToday - bToday;
      const so = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
      if (so !== 0) return so;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const update = useCallback(async (id: number, data: ScoreUpdate) => {
    setSaving(id);
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      if (!res.ok) throw new Error();
      toast.success("Opgeslagen ✓", { duration: 1200, style: { fontWeight: "bold" } });
    } catch {
      toast.error("Opslaan mislukt");
      fetchMatches();
    } finally {
      setSaving(null);
    }
  }, [fetchMatches]);

  const todayMatches = matches.filter((m) => isToday(m.date));
  const otherMatches = matches.filter((m) => !isToday(m.date));

  return (
    <div className="min-h-screen bg-gray-50">
      <Toaster position="top-center" />

      <div className="bg-white border-b border-gray-100 px-4 py-3 sticky top-0 z-10 shadow-sm">
        <div className="flex items-center gap-3 max-w-lg mx-auto">
          <Image src="/logo.png" alt="VVC" width={40} height={40} className="h-9 w-auto" />
          <div className="flex-1">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Score bijhouden</p>
            <p className="font-black text-gray-900 text-sm leading-tight">Rachel</p>
          </div>
          <div className="text-right">
            <p className="text-[10px] text-gray-400">Wijzigingen gaan</p>
            <p className="text-[10px] font-bold text-green-600">direct online ●</p>
          </div>
        </div>
      </div>

      <div className="max-w-lg mx-auto px-4 py-5 space-y-8">
        {loading ? (
          <p className="text-center text-gray-400 py-16 text-sm">Laden…</p>
        ) : (
          <>
            {todayMatches.length > 0 && (
              <section>
                <p className="text-xs font-black uppercase tracking-widest text-orange-500 mb-3">Vandaag</p>
                <div className="space-y-4">
                  {todayMatches.map((m) => (
                    <MatchCard key={m.id} match={m} saving={saving === m.id} onUpdate={(d) => update(m.id, d)} />
                  ))}
                </div>
              </section>
            )}

            {otherMatches.length > 0 && (
              <section>
                <p className="text-xs font-black uppercase tracking-widest text-gray-400 mb-3">Overige wedstrijden</p>
                <div className="space-y-4">
                  {otherMatches.map((m) => (
                    <div key={m.id}>
                      <p className="text-xs text-gray-400 mb-1.5 ml-1">{formatDate(m.date)}</p>
                      <MatchCard match={m} saving={saving === m.id} onUpdate={(d) => update(m.id, d)} />
                    </div>
                  ))}
                </div>
              </section>
            )}

            {matches.length === 0 && (
              <p className="text-center text-gray-400 py-16 text-sm">Geen wedstrijden gevonden.</p>
            )}
          </>
        )}
      </div>
    </div>
  );
}
