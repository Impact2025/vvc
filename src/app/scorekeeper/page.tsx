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

interface Player {
  id: number;
  name: string;
  number: number | null;
}

type ScoreUpdate = Partial<Pick<Match, "home_score" | "away_score" | "status">>;
type EventType = "kickoff" | "goal" | "card" | "sub" | "fulltime" | "message";

const STATUS_OPTIONS = [
  { value: "upcoming", label: "Gepland",  active: "bg-blue-100 text-blue-700 border-blue-200",    inactive: "text-gray-400 border-gray-100" },
  { value: "live",     label: "● Live",   active: "bg-green-500 text-white border-green-500",      inactive: "text-gray-400 border-gray-100" },
  { value: "finished", label: "Gespeeld", active: "bg-gray-200 text-gray-700 border-gray-200",     inactive: "text-gray-400 border-gray-100" },
];

const EVENT_BUTTONS: { type: EventType; label: string; needsPlayer?: boolean; twoStep?: boolean }[] = [
  { type: "kickoff",  label: "Aftrap" },
  { type: "goal",     label: "Doelpunt",  needsPlayer: true },
  { type: "card",     label: "Kaart",     needsPlayer: true },
  { type: "sub",      label: "Wissel",    needsPlayer: true, twoStep: true },
  { type: "fulltime", label: "Einde" },
  { type: "message",  label: "Bericht" },
];

const EVENT_TITLES: Record<EventType, (opponent: string, input: string) => string> = {
  kickoff:  (opponent)    => `Aftrap! VVC vs ${opponent}`,
  goal:     (_opp, input) => input ? `DOELPUNT! Gescoord door ${input}` : "DOELPUNT VVC!",
  card:     (_opp, input) => input ? `Kaart voor ${input}` : "Kaart",
  sub:      (_opp, input) => input ? `Wissel: ${input}` : "Wissel",
  fulltime: ()            => "Einde wedstrijd",
  message:  (_opp, input) => input,
};

function isToday(dateStr: string) {
  const d = new Date(dateStr);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
}

function formatDate(dateStr: string) {
  return new Date(dateStr).toLocaleDateString("nl-NL", { weekday: "short", day: "numeric", month: "short" });
}

/* ─── Scorer Picker ────────────────────────────────────────────────────────── */
function ScorerPicker({ match, newScore, players, onConfirm, onCancel }: {
  match: Match;
  newScore: number;
  players: Player[];
  onConfirm: (scorer: string | null) => void;
  onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/40" onClick={onCancel} />
      <div className="relative bg-white w-full rounded-t-2xl px-5 pt-5 pb-8 max-h-[80vh] overflow-y-auto shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <p className="text-[10px] font-black uppercase tracking-widest text-orange-500 mb-0.5">Doelpunt VVC!</p>
            <p className="font-black text-gray-900 text-lg">
              {newScore} – {match.away_score}
              <span className="text-sm font-normal text-gray-400 ml-2">vs {match.opponent}</span>
            </p>
          </div>
          <button onClick={onCancel} className="text-gray-400 text-xl p-1">✕</button>
        </div>

        <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Wie scoorde?</p>

        <div className="grid grid-cols-2 gap-2 mb-3">
          {players.map((p) => (
            <button
              key={p.id}
              onClick={() => onConfirm(p.name)}
              className="flex items-center gap-3 p-3 rounded-xl border border-gray-100 bg-gray-50 active:bg-orange-50 active:border-orange-300 transition-colors text-left"
            >
              <span className="w-9 h-9 rounded-xl bg-orange-500 text-white text-sm font-black flex items-center justify-center flex-shrink-0">
                {p.number ?? "?"}
              </span>
              <span className="font-bold text-gray-800 text-sm">{p.name}</span>
            </button>
          ))}
        </div>

        <button
          onClick={() => onConfirm(null)}
          className="w-full py-3 rounded-xl border border-gray-200 text-sm font-semibold text-gray-500 active:bg-gray-50"
        >
          Onbekend / Overslaan
        </button>
      </div>
    </div>
  );
}

/* ─── Live Commentaar ──────────────────────────────────────────────────────── */
function LiveCommentaar({ match, players }: { match: Match; players: Player[] }) {
  const [activeEvent, setActiveEvent] = useState<EventType | null>(null);
  const [subStep, setSubStep] = useState<"uit" | "in">("uit");
  const [subUit, setSubUit] = useState("");
  const [messageText, setMessageText] = useState("");
  const [sending, setSending] = useState(false);

  const reset = () => { setActiveEvent(null); setSubStep("uit"); setSubUit(""); setMessageText(""); };

  const send = async (type: EventType, title: string) => {
    if (!title) return;
    setSending(true);
    try {
      await fetch("/api/pusher/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ channel: "wedstrijden", event: "live-event", data: { type, title } }),
      });
      toast.success(EVENT_BUTTONS.find((b) => b.type === type)!.label + " verstuurd", { duration: 1500 });
      reset();
    } catch { toast.error("Versturen mislukt"); }
    finally { setSending(false); }
  };

  const handleEventBtn = (type: EventType) => {
    if (type === "kickoff") return send(type, `Aftrap! VVC vs ${match.opponent}`);
    if (type === "fulltime") return send(type, "Einde wedstrijd");
    setActiveEvent(type);
    setSubStep("uit");
    setSubUit("");
    setMessageText("");
  };

  const handlePlayerPick = (name: string) => {
    if (activeEvent === "goal") return send("goal", `Doelpunt door ${name}`);
    if (activeEvent === "card") return send("card", `Kaart voor ${name}`);
    if (activeEvent === "sub") {
      if (subStep === "uit") { setSubUit(name); setSubStep("in"); }
      else send("sub", `Wissel: ${subUit} eruit, ${name} erin`);
    }
  };

  const pickerLabel =
    activeEvent === "goal" ? "Wie scoorde?" :
    activeEvent === "card" ? "Voor wie is de kaart?" :
    activeEvent === "sub" && subStep === "uit" ? "Wie gaat eruit?" :
    "Wie komt erin?";

  const showPlayerGrid = activeEvent === "goal" || activeEvent === "card" || activeEvent === "sub";

  return (
    <div className="px-4 pb-5 border-t border-gray-100 pt-4">
      <p className="text-[10px] font-black uppercase tracking-widest text-green-600 mb-3">Live commentaar</p>

      <div className="grid grid-cols-3 gap-2">
        {EVENT_BUTTONS.map((btn) => (
          <button
            key={btn.type}
            onClick={() => handleEventBtn(btn.type)}
            disabled={sending}
            className={`py-2.5 rounded-xl text-xs font-bold border transition-all ${
              activeEvent === btn.type ? "bg-orange-500 text-white border-orange-500" : "bg-gray-50 text-gray-700 border-gray-100 active:bg-gray-100"
            }`}
          >
            {btn.label}
          </button>
        ))}
      </div>

      {showPlayerGrid && (
        <div className="mt-3">
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-bold text-gray-500">{pickerLabel}</p>
            <button onClick={reset} className="text-xs text-gray-400 px-2 py-1 rounded-lg hover:bg-gray-100">Annuleren</button>
          </div>
          <div className="grid grid-cols-2 gap-1.5">
            {players.map((p) => (
              <button
                key={p.id}
                onClick={() => handlePlayerPick(p.name)}
                disabled={sending}
                className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl border border-gray-100 bg-gray-50 active:bg-orange-50 active:border-orange-300 transition-colors text-left"
              >
                <span className="w-8 h-8 rounded-lg bg-gray-800 text-white text-xs font-black flex items-center justify-center flex-shrink-0">
                  {p.number ?? "–"}
                </span>
                <span className="font-semibold text-gray-800 text-sm">{p.name}</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {activeEvent === "message" && (
        <div className="mt-3 flex gap-2">
          <input
            autoFocus type="text" value={messageText}
            onChange={(e) => setMessageText(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && send("message", messageText.trim())}
            placeholder="Typ een bericht…"
            className="flex-1 px-3 py-2.5 rounded-xl border border-gray-200 text-sm focus:outline-none focus:border-orange-400"
          />
          <button onClick={() => send("message", messageText.trim())} disabled={sending || !messageText.trim()} className="px-4 py-2.5 rounded-xl bg-orange-500 text-white text-sm font-bold active:bg-orange-600 disabled:opacity-50">Stuur</button>
          <button onClick={reset} className="px-3 py-2.5 rounded-xl bg-gray-100 text-gray-500 text-sm">✕</button>
        </div>
      )}
    </div>
  );
}

/* ─── Match Card ───────────────────────────────────────────────────────────── */
function MatchCard({ match, saving, players, onUpdate }: {
  match: Match;
  saving: boolean;
  players: Player[];
  onUpdate: (d: ScoreUpdate, scorer?: string) => void;
}) {
  const [pendingGoal, setPendingGoal] = useState<number | null>(null);
  const isLive = match.status === "live";
  const opponentShort = match.opponent.split(" ").slice(0, 2).join(" ");

  const handleVVCGoal = () => {
    if (saving) return;
    setPendingGoal(match.home_score + 1);
  };

  const confirmGoal = (scorer: string | null) => {
    if (pendingGoal === null) return;
    onUpdate({ home_score: pendingGoal }, scorer ?? undefined);
    setPendingGoal(null);
  };

  return (
    <>
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
          <div>
            <p className="text-xs font-bold text-gray-400 text-center mb-2">VVC</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdate({ home_score: Math.max(0, match.home_score - 1) })}
                disabled={saving || match.home_score === 0}
                className="w-12 h-12 rounded-xl bg-gray-100 text-2xl font-bold text-gray-600 active:bg-gray-200 disabled:opacity-30 flex items-center justify-center"
              >−</button>
              <span className="flex-1 text-center text-5xl font-black text-gray-900 tabular-nums">{match.home_score}</span>
              <button
                onClick={handleVVCGoal}
                disabled={saving}
                className="w-12 h-12 rounded-xl bg-orange-500 text-2xl font-bold text-white active:bg-orange-600 flex items-center justify-center shadow-sm"
              >+</button>
            </div>
          </div>

          <span className="text-3xl font-black text-gray-200 mb-0 mt-4">–</span>

          <div>
            <p className="text-xs font-bold text-gray-400 text-center mb-2">{opponentShort}</p>
            <div className="flex items-center gap-1.5">
              <button
                onClick={() => onUpdate({ away_score: Math.max(0, match.away_score - 1) })}
                disabled={saving || match.away_score === 0}
                className="w-12 h-12 rounded-xl bg-gray-100 text-2xl font-bold text-gray-600 active:bg-gray-200 disabled:opacity-30 flex items-center justify-center"
              >−</button>
              <span className="flex-1 text-center text-5xl font-black text-gray-900 tabular-nums">{match.away_score}</span>
              <button
                onClick={() => onUpdate({ away_score: match.away_score + 1 })}
                disabled={saving}
                className="w-12 h-12 rounded-xl bg-gray-100 text-2xl font-bold text-gray-600 active:bg-gray-200 flex items-center justify-center"
              >+</button>
            </div>
          </div>
        </div>

        {isLive && <LiveCommentaar match={match} players={players} />}
      </div>

      {pendingGoal !== null && (
        <ScorerPicker
          match={match}
          newScore={pendingGoal}
          players={players}
          onConfirm={confirmGoal}
          onCancel={() => setPendingGoal(null)}
        />
      )}
    </>
  );
}

/* ─── Page ─────────────────────────────────────────────────────────────────── */
export default function ScorekeeperPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [players, setPlayers] = useState<Player[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<number | null>(null);

  const fetchMatches = useCallback(async () => {
    const res = await fetch("/api/matches");
    const data: Match[] = await res.json();
    const statusOrder: Record<string, number> = { live: 0, upcoming: 1, finished: 2 };
    data.sort((a, b) => {
      const at = isToday(a.date) ? 0 : 1;
      const bt = isToday(b.date) ? 0 : 1;
      if (at !== bt) return at - bt;
      const so = (statusOrder[a.status] ?? 3) - (statusOrder[b.status] ?? 3);
      if (so !== 0) return so;
      return (a.time ?? "").localeCompare(b.time ?? "");
    });
    setMatches(data);
    setLoading(false);
  }, []);

  useEffect(() => {
    fetchMatches();
    fetch("/api/players").then((r) => r.json()).then(setPlayers);
  }, [fetchMatches]);

  const update = useCallback(async (id: number, data: ScoreUpdate, scorer?: string) => {
    setSaving(id);
    setMatches((prev) => prev.map((m) => (m.id === id ? { ...m, ...data } : m)));
    try {
      const res = await fetch(`/api/matches/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...data, ...(scorer ? { scorer_name: scorer } : {}) }),
      });
      if (!res.ok) throw new Error();
      toast.success(scorer ? `⚽ ${scorer} scoort!` : "Opgeslagen ✓", { duration: 1800, style: { fontWeight: "bold" } });
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
                    <MatchCard key={m.id} match={m} players={players} saving={saving === m.id} onUpdate={(d, s) => update(m.id, d, s)} />
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
                      <MatchCard match={m} players={players} saving={saving === m.id} onUpdate={(d, s) => update(m.id, d, s)} />
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
