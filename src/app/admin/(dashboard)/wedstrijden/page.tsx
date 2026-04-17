"use client";

import { useState, useEffect, useCallback } from "react";
import toast, { Toaster } from "react-hot-toast";

interface Match {
  id: number;
  opponent: string;
  date: string;
  time: string | null;
  location: string | null;
  home_score: number | null;
  away_score: number | null;
  status: string | null;
  created_at: string | null;
}

const statusOptions = [
  { value: "upcoming", label: "Gepland" },
  { value: "live", label: "Live" },
  { value: "finished", label: "Gespeeld" },
];

const statusColors: Record<string, string> = {
  upcoming: "bg-blue-50 text-blue-700",
  live: "bg-green-50 text-green-700",
  finished: "bg-surface-container text-on-surface-variant",
};

const emptyForm = {
  opponent: "",
  date: "",
  time: "",
  location: "",
};

export default function WedstrijdenPage() {
  const [matches, setMatches] = useState<Match[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [editScore, setEditScore] = useState<{ matchId: number; home: number; away: number; status: string } | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<number | null>(null);

  const fetchMatches = useCallback(async () => {
    try {
      const res = await fetch("/api/matches");
      const data = await res.json();
      // Sort by date desc
      const sorted = [...data].sort((a: Match, b: Match) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setMatches(sorted);
    } catch {
      toast.error("Kan wedstrijden niet laden");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchMatches();
  }, [fetchMatches]);

  const handleAddMatch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.opponent || !form.date) {
      toast.error("Tegenstander en datum zijn verplicht");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/matches", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) throw new Error();
      toast.success("Wedstrijd toegevoegd");
      setForm(emptyForm);
      setShowForm(false);
      fetchMatches();
    } catch {
      toast.error("Kan wedstrijd niet opslaan");
    } finally {
      setSaving(false);
    }
  };

  const handleSaveScore = async () => {
    if (!editScore) return;
    setSaving(true);
    try {
      const res = await fetch(`/api/matches/${editScore.matchId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          home_score: editScore.home,
          away_score: editScore.away,
          status: editScore.status,
        }),
      });
      if (!res.ok) throw new Error();

      // Also trigger Pusher via API
      await fetch("/api/pusher/trigger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          channel: "wedstrijden",
          event: "score-update",
          data: { matchId: editScore.matchId, homeScore: editScore.home, awayScore: editScore.away, status: editScore.status },
        }),
      });

      toast.success("Score opgeslagen");
      setEditScore(null);
      fetchMatches();
    } catch {
      toast.error("Kan score niet opslaan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: number) => {
    try {
      const res = await fetch(`/api/matches/${id}`, { method: "DELETE" });
      if (!res.ok) throw new Error();
      toast.success("Wedstrijd verwijderd");
      setDeleteConfirm(null);
      fetchMatches();
    } catch {
      toast.error("Kan wedstrijd niet verwijderen");
    }
  };

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString("nl-NL", { day: "numeric", month: "short", year: "numeric" });

  return (
    <div>
      <Toaster position="top-right" />
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold font-headline text-secondary">Wedstrijden</h1>
          <p className="text-on-surface-variant mt-1 text-sm">Beheer het wedstrijdschema en scores.</p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          {showForm ? "Annuleren" : "+ Wedstrijd toevoegen"}
        </button>
      </div>

      {/* Add match form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm mb-6">
          <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">Nieuwe wedstrijd</p>
          <form onSubmit={handleAddMatch} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Tegenstander *</label>
              <input
                type="text"
                value={form.opponent}
                onChange={(e) => setForm({ ...form, opponent: e.target.value })}
                placeholder="FC Liverpool U10"
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Datum *</label>
              <input
                type="date"
                value={form.date}
                onChange={(e) => setForm({ ...form, date: e.target.value })}
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Tijd</label>
              <input
                type="time"
                value={form.time}
                onChange={(e) => setForm({ ...form, time: e.target.value })}
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Locatie</label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => setForm({ ...form, location: e.target.value })}
                placeholder="Wembley Arena, Londen"
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
              />
            </div>
            <div className="sm:col-span-2 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => { setShowForm(false); setForm(emptyForm); }}
                className="px-5 py-2.5 rounded-lg border border-outline-variant/30 text-sm font-semibold text-on-surface-variant hover:bg-surface-container-low transition-colors"
              >
                Annuleren
              </button>
              <button
                type="submit"
                disabled={saving}
                className="bg-primary-container text-white px-5 py-2.5 rounded-lg text-sm font-semibold hover:opacity-90 transition-opacity disabled:opacity-50"
              >
                {saving ? "Opslaan..." : "Wedstrijd opslaan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Score edit modal */}
      {editScore && (
        <div className="fixed inset-0 bg-black/30 backdrop-blur-sm flex items-center justify-center z-50" onClick={() => setEditScore(null)}>
          <div className="bg-white rounded-2xl p-6 shadow-xl w-full max-w-sm mx-4" onClick={(e) => e.stopPropagation()}>
            <h3 className="text-lg font-bold font-headline text-secondary mb-4">Score aanpassen</h3>
            <div className="flex items-center gap-4 mb-4">
              <div className="flex-1">
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">VVC</label>
                <input
                  type="number"
                  min={0}
                  value={editScore.home}
                  onChange={(e) => setEditScore({ ...editScore, home: parseInt(e.target.value) || 0 })}
                  className="w-full border border-outline-variant/30 rounded-lg px-4 py-3 text-2xl font-bold text-center focus:border-primary-container focus:ring-0"
                />
              </div>
              <span className="text-2xl font-bold text-outline-variant mt-5">–</span>
              <div className="flex-1">
                <label className="block text-xs font-semibold text-on-surface-variant mb-1">Tegenstander</label>
                <input
                  type="number"
                  min={0}
                  value={editScore.away}
                  onChange={(e) => setEditScore({ ...editScore, away: parseInt(e.target.value) || 0 })}
                  className="w-full border border-outline-variant/30 rounded-lg px-4 py-3 text-2xl font-bold text-center focus:border-primary-container focus:ring-0"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="block text-xs font-semibold text-on-surface-variant mb-1">Status</label>
              <select
                value={editScore.status}
                onChange={(e) => setEditScore({ ...editScore, status: e.target.value })}
                className="w-full border border-outline-variant/30 rounded-lg px-4 py-2.5 text-sm focus:border-primary-container focus:ring-0 bg-white"
              >
                {statusOptions.map((s) => (
                  <option key={s.value} value={s.value}>{s.label}</option>
                ))}
              </select>
            </div>
            <div className="flex gap-3">
              <button onClick={() => setEditScore(null)} className="flex-1 py-2.5 rounded-lg border border-outline-variant/30 text-sm font-semibold text-on-surface-variant">
                Annuleren
              </button>
              <button onClick={handleSaveScore} disabled={saving} className="flex-1 bg-primary-container text-white py-2.5 rounded-lg text-sm font-semibold disabled:opacity-50">
                {saving ? "Opslaan..." : "Opslaan"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Matches table */}
      <div className="bg-white rounded-xl border border-outline-variant/15 p-6 shadow-sm">
        <p className="text-xs font-bold uppercase tracking-widest text-on-surface-variant mb-4">
          Alle wedstrijden ({matches.length})
        </p>

        {loading ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Laden...</p>
        ) : matches.length === 0 ? (
          <p className="text-sm text-on-surface-variant text-center py-8">Nog geen wedstrijden.</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-outline-variant/10">
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Datum</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Tegenstander</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Locatie</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Score</th>
                  <th className="text-left py-2 pr-4 font-semibold text-on-surface-variant text-xs">Status</th>
                  <th className="text-right py-2 font-semibold text-on-surface-variant text-xs">Acties</th>
                </tr>
              </thead>
              <tbody>
                {matches.map((match) => (
                  <tr key={match.id} className="border-b border-outline-variant/5 last:border-0 hover:bg-surface-container-low/50">
                    <td className="py-3 pr-4 text-on-surface-variant whitespace-nowrap">
                      <div>{formatDate(match.date)}</div>
                      {match.time && <div className="text-xs text-outline">{match.time}</div>}
                    </td>
                    <td className="py-3 pr-4 font-medium text-on-surface">{match.opponent}</td>
                    <td className="py-3 pr-4 text-on-surface-variant text-xs max-w-[140px] truncate">{match.location ?? "—"}</td>
                    <td className="py-3 pr-4">
                      <button
                        onClick={() => setEditScore({ matchId: match.id, home: match.home_score ?? 0, away: match.away_score ?? 0, status: match.status ?? "upcoming" })}
                        className="font-mono font-bold text-secondary hover:text-primary-container transition-colors cursor-pointer bg-surface-container-low rounded px-2 py-0.5"
                        title="Klik om score te bewerken"
                      >
                        {match.home_score ?? 0} – {match.away_score ?? 0}
                      </button>
                    </td>
                    <td className="py-3 pr-4">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${statusColors[match.status ?? "upcoming"] ?? statusColors.upcoming}`}>
                        {statusOptions.find((s) => s.value === match.status)?.label ?? match.status}
                      </span>
                    </td>
                    <td className="py-3 text-right">
                      {deleteConfirm === match.id ? (
                        <div className="flex items-center justify-end gap-2">
                          <span className="text-xs text-red-600 font-medium">Zeker weten?</span>
                          <button onClick={() => handleDelete(match.id)} className="text-xs bg-red-600 text-white px-2 py-1 rounded font-semibold">Ja</button>
                          <button onClick={() => setDeleteConfirm(null)} className="text-xs border border-outline-variant/30 px-2 py-1 rounded font-semibold">Nee</button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => setEditScore({ matchId: match.id, home: match.home_score ?? 0, away: match.away_score ?? 0, status: match.status ?? "upcoming" })}
                            className="text-xs border border-primary-container/30 text-primary-container px-3 py-1.5 rounded font-semibold hover:bg-primary-container/5 transition-colors"
                          >
                            Score
                          </button>
                          <button
                            onClick={() => setDeleteConfirm(match.id)}
                            className="text-xs border border-red-200 text-red-600 px-3 py-1.5 rounded font-semibold hover:bg-red-50 transition-colors"
                          >
                            Verwijder
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
